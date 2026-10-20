# Design

A clickable Claude Design prototype of every flow, made **before any code**. It needs approval before `/to-spec` (plan step 1).

- **Claude Design canvas:** <https://claude.ai/artifact/TXP1WiDr5cb8hvjZvpV68G> (private; share it from the page's Share menu)
- **Standalone HTML:** [`notes-taker-design.html`](notes-taker-design.html). Open it in any browser by double-clicking; it needs internet for Vue and the icon font. It's the same prototype, with a toolbar for:
  - **Start state:** jump to any screen below
  - **Desktop / Phone:** a 390×844 phone frame
  - **Reset**

  Deep links work too: `notes-taker-design.html?state=move-guest-data&view=phone`.
- **Canvas source:** [`project/`](project/). `canvas.json` is the canvas layout, and each `*.dc.html` file is one artboard. These files only render inside Claude Design.

Both copies are throwaway prototype code (Vue in the HTML file, Design Components on the canvas). The real app is Angular; see [../plan.md](../plan.md).

## Look

Minimal and light, in the style of Apple Notes:

| Token | Value | Use |
| --- | --- | --- |
| Accent | `#F59E0B` (amber) | primary buttons, checkbox, active borders, app icon |
| Accent soft | `#FEF3C7` / text `#92400E` | selected folder, banners |
| Text | `#1C1C1E` | body |
| Muted text | `#5F5F64` | secondary text (passes 4.5:1 on white and sidebar) |
| Sidebar | `#F7F6F3` | folders panel, login background |
| Border | `#E5E4E0` / `#ECEBE7` | dividers |
| Danger | `#B91C1C` | delete confirm, form errors |

- **Font:** the system UI font stack.
- **Icons:** Material Symbols Outlined (Google Fonts).
- **Touch targets:** at least 36–44 px.
- **Breakpoint:** 900 px. Below it, the folders panel becomes a drawer opened with ☰.

## Artboards

| Artboard | Shows |
| --- | --- |
| `Main` | **Interactive full flow:** login, then guest or Google, folders CRUD, notes CRUD, completion, search, delete dialogs, moving guest data with merge, sign-out |
| `Desktop-Editing` | inline note edit row, and the new-folder row with the duplicate-name error |
| `Desktop-DeleteFolder` | `<dialog>` confirmation for deleting a folder with its notes |
| `Desktop-MoveGuestData` | the move-guest-data dialog, with a per-folder plan (merge vs new folder) |
| `Mobile-Login` | login page |
| `Mobile-List` | notes list on a phone |
| `Mobile-Drawer` | folders drawer open |
| `Mobile-NewNote` | new-note row at the top of the list (guest) |
| `Mobile-Empty` | empty folder state |

The other artboards all reuse `Main`, opened at a fixed starting state (its `preset` prop). In the standalone HTML, the same states are the **Start state** options, with `?state=` values `login`, `guest`, `app`, `desktop-editing`, `delete-folder`, `move-guest-data`, `mobile-drawer`, `new-note` and `empty`.

## Sample data

| Side | Folders | Notes |
| --- | --- | --- |
| Guest (this device) | General, Shopping, "work " | 4 notes; "Call dentist" and "Standup" also exist in the account |
| Account (Google) | General, Work, Travel | 6 notes |

Moving guest data gives: 1 folder created (Shopping), 2 merged (General, "work " → Work), 2 notes added, 2 duplicates skipped. "Standup" ends up completed, because the guest copy was.

## Behaviour the prototype pins down

- The **New folder** and **New note** buttons add a form row at the top of the list. ✓ submits and ✕ cancels. In the note form, Enter in the title submits, Ctrl/⌘+Enter in the text submits, and Esc cancels.
- Clicking a note row edits it in place. Only one row is edited at a time.
- The selected folder row shows rename and delete. Delete is disabled on the last folder.
- Search filters the current folder by title and text, and has its own "no match" state.
- **Move guest data:**
  - "work " (guest) merges into "Work" (account).
  - Duplicate notes (same title and text, ignoring case and surrounding spaces) are skipped, and a completed guest copy marks the account copy completed.
  - A banner summarises the result.
