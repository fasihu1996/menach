import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["en", "fr", "ar", "de"],
    defaultLocale: "de",
});

export const localeNames: Record<(typeof routing.locales)[number], string> = {
    en: "English",
    fr: "Français",
    ar: "العربية",
    de: "Deutsch",
};
