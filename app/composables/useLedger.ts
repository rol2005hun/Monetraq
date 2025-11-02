import { computed, onMounted, reactive, watch } from 'vue';

export type LedgerEntryType = 'income' | 'expense';

export interface LedgerEntry {
    id: string;
    type: LedgerEntryType;
    amount: number;
    category: string;
    note?: string;
    timestamp: string;
    createdAt: string;
}

interface MonthlySummary {
    monthKey: string;
    income: number;
    expenses: number;
    net: number;
}

const LEDGER_STORAGE_KEY = 'monetraq-ledger-v1';
const CATEGORY_STORAGE_KEY = 'monetraq-categories-v1';

const DEFAULT_CATEGORIES = [
    'Salary',
    'Savings',
    'Rent',
    'Groceries',
    'Dining',
    'Transport',
    'Utilities',
    'Healthcare',
    'Subscriptions',
    'Lifestyle',
    'Gifts',
    'Education'
];

function loadFromStorage<T>(key: string, fallback: T): T {
    if (!import.meta.client) {
        return fallback;
    }

    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch (error) {
        console.warn(`[Monetraq] Failed loading ${key} from storage`, error);
        return fallback;
    }
}

function saveToStorage<T>(key: string, value: T) {
    if (!import.meta.client) {
        return;
    }

    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`[Monetraq] Failed persisting ${key} to storage`, error);
    }
}

function generateId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normaliseCategory(value: string) {
    return value.trim().replace(/\s+/g, ' ');
}

function normaliseLedgerEntries(raw: unknown): LedgerEntry[] {
    if (!Array.isArray(raw)) {
        return [];
    }

    const entries: LedgerEntry[] = [];

    for (const item of raw) {
        if (!item || typeof item !== 'object') {
            continue;
        }

        const candidate = item as Partial<LedgerEntry>;
        if (!candidate.timestamp || !candidate.type || typeof candidate.amount !== 'number') {
            continue;
        }

        const timestamp = new Date(candidate.timestamp).toISOString();
        const category = normaliseCategory(candidate.category ?? 'Misc');

        entries.push({
            id: candidate.id ?? generateId(),
            type: candidate.type as LedgerEntryType,
            amount: Number.isFinite(candidate.amount) ? candidate.amount : 0,
            category,
            note: candidate.note ?? '',
            timestamp,
            createdAt: candidate.createdAt ?? timestamp
        });
    }

    return entries;
}

function toMonthKey(date: string | Date) {
    const source = typeof date === 'string' ? new Date(date) : date;
    return `${source.getFullYear()}-${String(source.getMonth() + 1).padStart(2, '0')}`;
}

function toDayKey(date: string | Date) {
    const source = typeof date === 'string' ? new Date(date) : date;
    return `${source.getFullYear()}-${String(source.getMonth() + 1).padStart(2, '0')}-${String(source.getDate()).padStart(2, '0')}`;
}

export function useLedger() {
    const transactions = useState<LedgerEntry[]>('monetraq-transactions', () => {
        const stored = loadFromStorage<unknown>(LEDGER_STORAGE_KEY, []);
        return normaliseLedgerEntries(stored);
    });

    const userCategories = useState<string[]>('monetraq-categories', () => {
        const stored = loadFromStorage<string[]>(CATEGORY_STORAGE_KEY, []);
        return stored.length ? stored : [...DEFAULT_CATEGORIES];
    });

    const state = reactive({
        lastSyncedAt: new Date().toISOString()
    });

    if (import.meta.client) {
        onMounted(() => {
            const storedTransactions = loadFromStorage<unknown>(LEDGER_STORAGE_KEY, []);
            const hydratedTransactions = normaliseLedgerEntries(storedTransactions);

            if (hydratedTransactions.length && JSON.stringify(hydratedTransactions) !== JSON.stringify(transactions.value)) {
                transactions.value = hydratedTransactions;
                state.lastSyncedAt = new Date().toISOString();
            }

            const storedCategories = loadFromStorage<string[]>(CATEGORY_STORAGE_KEY, []);
            if (storedCategories.length) {
                const merged = new Set<string>([...userCategories.value, ...storedCategories.map(normaliseCategory)]);
                userCategories.value = Array.from(merged).filter(Boolean).sort((a, b) => a.localeCompare(b));
            }
        });

        watch(
            transactions,
            (items) => {
                saveToStorage(LEDGER_STORAGE_KEY, items);
                state.lastSyncedAt = new Date().toISOString();
            },
            { deep: true }
        );

        watch(
            userCategories,
            (categories) => {
                saveToStorage(CATEGORY_STORAGE_KEY, categories);
            },
            { deep: true }
        );
    }

    const sortedTransactions = computed(() =>
        [...transactions.value].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
    );

    const totals = computed(() => {
        return sortedTransactions.value.reduce(
            (acc, item) => {
                if (item.type === 'income') {
                    acc.income += item.amount;
                } else {
                    acc.expenses += item.amount;
                }
                acc.net = acc.income - acc.expenses;
                return acc;
            },
            { income: 0, expenses: 0, net: 0 }
        );
    });

    const monthlySummaries = computed<MonthlySummary[]>(() => {
        const bucket = new Map<string, { income: number; expenses: number }>();

        for (const item of sortedTransactions.value) {
            const key = toMonthKey(item.timestamp);
            const entry = bucket.get(key) ?? { income: 0, expenses: 0 };

            if (item.type === 'income') {
                entry.income += item.amount;
            } else {
                entry.expenses += item.amount;
            }

            bucket.set(key, entry);
        }

        return Array.from(bucket.entries())
            .map(([monthKey, value]) => ({
                monthKey,
                income: Number(value.income.toFixed(2)),
                expenses: Number(value.expenses.toFixed(2)),
                net: Number((value.income - value.expenses).toFixed(2))
            }))
            .sort((a, b) => (a.monthKey < b.monthKey ? -1 : 1));
    });

    const availableCategories = computed(() => {
        const bag = new Set<string>();
        DEFAULT_CATEGORIES.forEach((label) => bag.add(label));
        userCategories.value.forEach((label) => bag.add(label));
        transactions.value.forEach((txn) => bag.add(normaliseCategory(txn.category)));

        return Array.from(bag).filter(Boolean).sort((a, b) => a.localeCompare(b));
    });

    const groupedByDay = computed(() => {
        const bucket = new Map<string, LedgerEntry[]>();

        for (const item of sortedTransactions.value) {
            const key = toDayKey(item.timestamp);
            const group = bucket.get(key) ?? [];
            group.push(item);
            bucket.set(key, group);
        }

        return Array.from(bucket.entries())
            .map(([dayKey, entries]) => ({
                dayKey,
                entries: entries.sort(
                    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                )
            }))
            .sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
    });

    function registerCategory(category: string) {
        const label = normaliseCategory(category);
        if (!label) {
            return;
        }

        if (!userCategories.value.includes(label)) {
            userCategories.value = [...userCategories.value, label].sort((a, b) => a.localeCompare(b));
        }
    }

    function addTransaction(payload: Omit<LedgerEntry, 'id' | 'createdAt'>) {
        const entry: LedgerEntry = {
            ...payload,
            id: generateId(),
            createdAt: new Date().toISOString(),
            category: normaliseCategory(payload.category)
        };

        transactions.value = [entry, ...transactions.value];
        registerCategory(entry.category);

        return entry;
    }

    function updateTransaction(id: string, patch: Partial<Omit<LedgerEntry, 'id'>>) {
        transactions.value = transactions.value.map((item) => {
            if (item.id !== id) {
                return item;
            }

            const next = { ...item, ...patch } as LedgerEntry;
            next.category = normaliseCategory(next.category);
            registerCategory(next.category);
            return next;
        });
    }

    function removeTransaction(id: string) {
        transactions.value = transactions.value.filter((item) => item.id !== id);
    }

    function clearAll() {
        transactions.value = [];
    }

    return {
        transactions,
        sortedTransactions,
        groupedByDay,
        totals,
        monthlySummaries,
        availableCategories,
        state,
        addTransaction,
        updateTransaction,
        removeTransaction,
        clearAll,
        registerCategory
    };
}
