I understand you want to restrict the application to **English only** (and I will also switch to English for our conversation).

This plan removes the multi-language support (Spanish/Chinese) to simplify the codebase and prevent translation-related errors.

### Plan: Restrict App to English Only

1.  **Update i18n Configuration**
    *   Modify `web/src/components/i18n/i18nConfigLight.jsx` to set `supportedLngs` to `['en']` and remove logic for other languages.

2.  **Update Language Switcher**
    *   Modify `web/src/components/settings/LanguageSwitcher.jsx` to only list "English".
    *   (Optional) If you prefer, I can hide the switcher entirely from the UI, but keeping it as a static indicator is a safer first step to avoid breaking layout imports.

3.  **Clean up Translation Files**
    *   Delete `web/public/locales/es` directory.
    *   Delete `web/public/locales/zh` directory.

4.  **Verification**
    *   Verify the app loads without errors.
    *   Verify the language switcher shows only English or is disabled.
