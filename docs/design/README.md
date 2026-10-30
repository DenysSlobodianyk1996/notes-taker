# Design

A clickable Claude Design prototype of every flow, made **before any code**. It needs approval before `/to-spec` (plan step 1).

- **Claude Design canvas:** <https://claude.ai/artifact/TXP1WiDr5cb8hvjZvpV68G> (private; share it from the page's Share menu)
- **Standalone HTML:** [`notes-taker-design.html`](notes-taker-design.html). Open it in any browser by double-clicking; it needs internet for Vue and the icon font. It's the same prototype, with a toolbar for:
  - **Start state:** jump to any screen below
  - **Desktop / Phone:** a 390×844 phone frame
  - **Reset**

  Deep links work too: `notes-taker-design.html?state=offline&view=phone&lang=uk`.

- **Canvas source:** [`project/`](project/). `canvas.json` is the canvas layout, and each `*.dc.html` file is one artboard. These files only render inside Claude Design.

- **Translations:** [`i18n/en.json`](i18n/en.json) and [`i18n/uk.json`](i18n/uk.json). They use ngx-translate's format (nested keys, `{{param}}`, one translation per key) and become the app's `public/i18n/*.json`. Both prototypes embed them: after editing the JSON, run `python3 docs/design/sync-i18n.py`.

Both copies are throwaway prototype code (Vue in the HTML file, Design Components on the canvas). The real app is Angular; see [../plan.md](../plan.md).

## Interface language (EN / UA)

- The **EN | UA** toggle sits in the top-right of the login card and in the app header. Switching is instant, with no reload and no language in the URL.
- On the first visit the browser language is used (`uk*` gives UA, anything else EN). After that, the choice is saved on the device.
- **User content is never translated.** Folder names, titles and note text stay exactly as typed.
- The **Default folder** stores no name and is always shown in the current language ("General" in EN, "Загальне" in UA), so it changes with the toggle. It can't be renamed or deleted, so its row shows a lock icon (tooltip "The default folder can't be renamed or deleted") instead of edit and delete. Both names are reserved: a new folder called "general" or "Загальне" gets the "already exists" error.
- Ukrainian strings are longer, so on phones the header hides the avatar and keeps only the toggle and "Sign out" / "Вийти".

## Look

Minimal and light, in the style of Apple Notes:

| Token          | Value                      | Use                                                 |
| -------------- | -------------------------- | --------------------------------------------------- |
| Accent         | `#F59E0B` (amber)          | primary buttons, checkbox, active borders, app icon |
| Accent soft    | `#FEF3C7` / text `#92400E` | selected folder, language toggle, offline note      |
| Text           | `#1C1C1E`                  | body                                                |
| Muted text     | `#5F5F64`                  | secondary text (passes 4.5:1 on white and sidebar)  |
| Strong border  | `#D4D3CE`                  | outlined buttons, language toggle                   |
| Chip           | `#F1F0EC`                  | search field, chips                                 |
| Completed text | `#6B6B70`                  | completed notes (crossed out)                       |
| Sidebar        | `#F7F6F3`                  | folders panel, login background                     |
| Border         | `#E5E4E0` / `#ECEBE7`      | dividers                                            |
| Danger         | `#B91C1C`                  | delete confirm, form errors                         |

- **Font:** the system UI font stack.
- **Icons:** Material Symbols Outlined (Google Fonts).
- **Touch targets:** at least 36–44 px.
- **Breakpoint:** 900 px. Below it, the folders panel becomes a drawer opened with ☰.

## Sign-in (Google only)

- The login page has one button, **Sign in with Google**, plus the EN | UA toggle and the hint "Your notes sync across all your devices." There is no guest mode (ADR-0009).
- **Offline and never signed in on this device:** the button is disabled and the page shows "You're offline. Connect to sign in." (Start state `offline`). In the standalone HTML this also reacts to the browser really going offline.
- An Account's first sign-in creates the Default folder (Start state `new-account`).
- Sign out returns to the login page.

## Artboards

| Artboard               | Shows                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `Main`                 | **Interactive full flow:** login → Google sign-in → folders CRUD, notes CRUD, completion, search, delete dialogs → sign-out |
| `Desktop-Editing`      | inline note edit row, and the new-folder row with the duplicate-name error                                                  |
| `Desktop-DeleteFolder` | `<dialog>` confirmation for deleting a folder with its notes                                                                |
| `Mobile-Login`         | login page                                                                                                                  |
| `Mobile-Login-Offline` | login page while offline, before the first sign-in                                                                          |
| `Mobile-List`          | notes list on a phone                                                                                                       |
| `Mobile-Drawer`        | folders drawer open                                                                                                         |
| `Mobile-NewNote`       | new-note row at the top of the list                                                                                         |
| `Mobile-Empty`         | empty folder state                                                                                                          |
| `Mobile-Login-UA`      | login page in Ukrainian                                                                                                     |
| `Mobile-List-UA`       | notes list in Ukrainian, with user content left untranslated                                                                |

The other artboards all reuse `Main`, opened at a fixed starting state (its `preset` and `lang` props). In the standalone HTML, the same states are the **Start state** options, with `?state=` values `login`, `offline`, `app`, `new-account`, `desktop-editing`, `delete-folder`, `mobile-drawer`, `new-note`, `empty`, `due-dates` and `theme`. Add `&lang=uk` for Ukrainian, and `&theme=pink` or `&theme=purple` for a Theme.

## Sample data

One signed-in Account: the Default folder (3 notes, one completed), Work (3 notes) and Travel (1 note). The `new-account` state starts with no folders and shows the Default folder being created on first sign-in.

## Due dates (ticket 07a)

- The new and edit note rows have an optional date field (calendar icon, native date input) with a ✕ to clear it.
- A Note with a Due date shows a small chip under its text: "Due 2 Nov" / "Термін: 2 лист.", formatted for the UI language.
- An **Overdue** Note (Due date before today, not Completed) shows a red chip with "Overdue · 28 Oct". A Completed Note's chip stays grey, even if the date has passed.
- Due dates never change the order: Notes stay newest first.
- Start state `due-dates`: the General folder with one Note due soon (open in the edit row), one Overdue and one Completed with a past date. The sample dates are relative to today.

## Theme (ticket 12)

- A `palette` icon button sits left of EN | UA in the header, on every screen size. It opens a popover titled "Theme" with three circles: **Orange** (default), **Pink** and **Purple**. The current one has a ring and a ✓.
- Picking one recolours the accent family at once and closes the popover; Esc or a click outside closes it without a change.

| Theme  | Accent    | Accent soft | Accent ink | Form tint |
| ------ | --------- | ----------- | ---------- | --------- |
| Orange | `#F59E0B` | `#FEF3C7`   | `#92400E`  | `#FFFDF7` |
| Pink   | `#F472B6` | `#FCE7F3`   | `#9D174D`  | `#FFFAFC` |
| Purple | `#A78BFA` | `#EDE9FE`   | `#5B21B6`  | `#FCFBFF` |

- Button text stays dark (`#1C1C1E`) on every Theme; all three accents keep it above 4.5:1.
- The login page is always Orange. The browser tab icon follows the Theme (try it in the standalone HTML); the installed app icon stays Orange.
- Start state `theme` opens the popover; `?theme=pink` or `?theme=purple` starts in that Theme.
- **Canvas:** not updated yet. The standalone HTML is the reference for both features until the `Main` artboard gets them.

## Behaviour the prototype pins down

- The **New folder** and **New note** buttons add a form row at the top of the list. ✓ submits and ✕ cancels. In the note form, Enter in the title submits, Ctrl/⌘+Enter in the text submits, and Esc cancels.
- Clicking a note row edits it in place. Only one row is edited at a time.
- The selected folder row shows rename and delete. The Default folder instead shows a lock icon, because it can't be renamed or deleted.
- Search filters the current folder by title and text, and has its own "no match" state.
