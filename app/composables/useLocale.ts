import { useRequestHeaders } from '#app';

const DEFAULT_LOCALE = 'en-US';

function parseAcceptLanguage(header?: string) {
    if (!header) {
        return undefined;
    }

    const first = header.split(',')[0]?.trim();
    return first || undefined;
}

export function usePreferredLocale(defaultLocale = DEFAULT_LOCALE) {
    const locale = useState<string>('monetraq-locale', () => {
        if (process.server) {
            const headers = useRequestHeaders(['accept-language']);
            return parseAcceptLanguage(headers['accept-language']) ?? defaultLocale;
        }

        if (typeof navigator !== 'undefined' && navigator.language) {
            return navigator.language;
        }

        return defaultLocale;
    });

    if (import.meta.client && typeof navigator !== 'undefined' && navigator.language) {
        locale.value = navigator.language;
    }

    return locale;
}