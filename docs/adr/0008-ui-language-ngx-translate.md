# EN/UA interface with ngx-translate, language not in the URL

The interface is available in English and Ukrainian, using `@ngx-translate/core` with two JSON files, `public/i18n/en.json` and `public/i18n/uk.json`. Keys are nested, values use `{{param}}` interpolation, and each key has exactly one translation (no plural rules). Language codes are `en` and `uk`; the toggle shows "EN | UA".

- **Choosing the language:** on the first visit the browser language decides (`uk*` → Ukrainian, anything else → English). After that, the choice is saved in `localStorage` on the device only, and is not synced to the Account.
- **Switching:** an "EN | UA" toggle in the header and on the login card switches instantly, with no reload. Each switch also updates `<html lang>`.
- **User content is never translated:** Folder names, Titles and Text stay as typed. The Default folder is named in the UI language at the moment it's created, then behaves like any other name.
- The PWA manifest stays in English.

## Considered options

- **Angular built-in i18n (`@angular/localize`).** Rejected: it means one build per language and the language in the URL (`/en/…`, `/uk/…`), and switching reloads the app. The owner wants the language kept out of the URL, and an instant switch.
- **Transloco.** It would also work. ngx-translate was picked because the owner already knows it.

## Source files

The translations were first drafted in `docs/design/i18n/en.json` and `uk.json`, the same files the design prototype uses. They move to `public/i18n/` during scaffolding.
