<template>
    <form class="form" @submit.prevent="handleSubmit">
        <div class="form__controls">
            <label class="form__label">Type</label>
            <div class="form__segmented">
                <button v-for="option in typeOptions" :key="option.value" type="button" class="form__segment"
                    :class="{ 'form__segment--active': form.type === option.value }" @click="form.type = option.value">
                    {{ option.label }}
                </button>
            </div>
        </div>

        <div class="form__grid">
            <label class="form__field">
                <span>Amount</span>
                <input v-model.number="form.amount" type="number" inputmode="decimal" min="0" step="0.01" required
                    placeholder="0.00" />
            </label>

            <label class="form__field">
                <span>When</span>
                <input v-model="form.timestamp" type="datetime-local" required />
            </label>

            <label class="form__field">
                <span>Category</span>
                <input v-model="form.category" list="category-options" required placeholder="e.g. Groceries" />
                <datalist id="category-options">
                    <option v-for="category in categories" :key="category" :value="category" />
                </datalist>
            </label>

            <label class="form__field form__field--span">
                <span>Note <small>(optional)</small></span>
                <input v-model="form.note" type="text" maxlength="120"
                    placeholder="Add context — merchant, reminder, etc." />
            </label>
        </div>

        <footer class="form__actions">
            <button type="submit" class="form__submit">Log entry</button>
            <button type="button" class="form__reset" @click="resetForm">Reset</button>
        </footer>
    </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { fromDatetimeLocalInput, toDatetimeLocalInput } from '../../utils/datetime';
import type { LedgerEntryType } from '../../composables/useLedger';

const props = defineProps({
    categories: {
        type: Array as () => string[],
        default: () => []
    }
});

const emit = defineEmits<{
    (event: 'submit', payload: {
        type: LedgerEntryType;
        amount: number;
        category: string;
        note: string;
        timestamp: string;
    }): void;
}>();

const typeOptions = [
    { label: 'Expense', value: 'expense' as LedgerEntryType },
    { label: 'Income', value: 'income' as LedgerEntryType }
];

const defaultState = () => ({
    type: 'expense' as LedgerEntryType,
    amount: 0,
    category: props.categories[0] ?? 'Misc',
    note: '',
    timestamp: toDatetimeLocalInput(new Date())
});

const form = reactive(defaultState());

watch(
    () => props.categories,
    (next) => {
        if (!next.includes(form.category)) {
            form.category = next[0] ?? form.category;
        }
    }
);

function resetForm() {
    Object.assign(form, defaultState());
}

function handleSubmit() {
    if (!form.category.trim() || !form.amount) {
        return;
    }

    emit('submit', {
        type: form.type,
        amount: Number(form.amount),
        category: form.category,
        note: form.note.trim(),
        timestamp: fromDatetimeLocalInput(form.timestamp)
    });

    resetForm();
}
</script>

<style scoped lang="scss">
@use '../../assets/scss/tokens' as *;

.form {
    display: grid;
    gap: 1.8rem;
    padding: clamp(1.6rem, 2.2vw, 2rem);
    border-radius: $radius-lg;
    border: 1px solid $color-border;
    background: rgba(18, 19, 34, 0.75);
    box-shadow: $shadow-soft;
}

.form__controls {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.form__label {
    font-size: 0.9rem;
    color: $color-text-muted;
}

.form__segmented {
    display: inline-flex;
    border-radius: $radius-sm;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid $color-border;
}

.form__segment {
    flex: 1;
    padding: 0.75rem 1.2rem;
    background: transparent;
    border: none;
    color: $color-text-muted;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease;
}

.form__segment--active {
    background: linear-gradient(135deg, rgba(133, 71, 240, 0.85), rgba(163, 115, 255, 0.85));
    color: $color-text;
}

.form__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.5rem;
    align-items: start;
}

.form__field {
    display: grid;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: $color-text-muted;
}

.form__field input {
    padding: 0.85rem 1.05rem;
    width: 100%;
    display: block;
    border-radius: $radius-sm;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(13, 15, 27, 0.85);
    color: $color-text;
    font-size: 1rem;
    font-family: inherit;
    line-height: 1.4;
    -webkit-appearance: none;
    appearance: none;
}

.form__field input[type='number']::-webkit-outer-spin-button,
.form__field input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.form__field input[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
}

.form__field input[type='datetime-local'] {
    position: relative;
}

.form__field input[type='datetime-local']::-webkit-datetime-edit,
.form__field input[type='datetime-local']::-webkit-datetime-edit-fields-wrapper,
.form__field input[type='datetime-local']::-webkit-datetime-edit-text,
.form__field input[type='datetime-local']::-webkit-datetime-edit-hour-field,
.form__field input[type='datetime-local']::-webkit-datetime-edit-minute-field,
.form__field input[type='datetime-local']::-webkit-datetime-edit-second-field,
.form__field input[type='datetime-local']::-webkit-datetime-edit-ampm-field,
.form__field input[type='datetime-local']::-webkit-datetime-edit-day-field,
.form__field input[type='datetime-local']::-webkit-datetime-edit-month-field,
.form__field input[type='datetime-local']::-webkit-datetime-edit-year-field {
    padding: 0;
    font-family: inherit;
    color: inherit;
}

.form__field input[type='datetime-local']::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.7;
    cursor: pointer;
}

.form__field input[type='datetime-local']:hover::-webkit-calendar-picker-indicator,
.form__field input[type='datetime-local']:focus::-webkit-calendar-picker-indicator {
    opacity: 1;
}

.form__field input:focus {
    outline: none;
    border-color: rgba(133, 71, 240, 0.65);
    box-shadow: $shadow-ring;
}

.form__field small {
    color: $color-text-muted;
}

.form__field--span {
    grid-column: 1 / -1;
}

.form__actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.form__submit,
.form__reset {
    border-radius: $radius-sm;
    padding: 0.8rem 1.8rem;
    border: none;
    font-weight: 600;
    cursor: pointer;
}

.form__submit {
    background: linear-gradient(135deg, $color-accent, $color-accent-soft);
    color: $color-text;
}

.form__submit:hover {
    box-shadow: $shadow-ring;
}

.form__reset {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: $color-text-muted;
}

.form__reset:hover {
    border-color: $color-text;
    color: $color-text;
}

@media (max-width: 600px) {
    .form__actions {
        flex-direction: column;
    }

    .form__submit,
    .form__reset {
        width: 100%;
    }
}
</style>
