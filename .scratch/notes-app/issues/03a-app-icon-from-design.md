# 03a: App icon from the design logo

**What to build:** Replace the default Angular favicon and PWA icons with the app logo from the design: the Material Symbols `sticky_note_2` glyph (outlined, weight 400, opsz 24) in `#1C1C1E` on the `#F59E0B` rounded tile, exactly as on the login screen. Design: `docs/design/` (`.logo` on Mobile-Login).

**Blocked by:** 03 (Deploy to Firebase Hosting)

**Status:** done

- [x] Source SVGs: `public/icons/icon.svg` (rounded tile, radius 14/56, glyph 32/56) and `public/icons/icon-maskable.svg` (full-bleed tile, the glyph inside the maskable safe zone).
- [x] PNGs generated from the SVGs: `icon-{72…512}.png` (purpose `any`), `icon-maskable-{192,512}.png` (purpose `maskable`), `apple-touch-icon.png` (180, full-bleed), and `favicon.ico` (16/32/48).
- [x] `manifest.webmanifest` lists the `any` and `maskable` icons separately; `index.html` links the SVG favicon, the ICO fallback and the apple-touch icon.
- [x] **Human check (passed):** after deploy, the browser tab shows the new icon; reinstall the app on Android, and the home-screen icon is the amber sticky note, not cropped.

**Regenerating:** the PNGs and ICO were rendered from the two SVGs with `sharp` and `png-to-ico` (not project dependencies). If the logo changes, edit the SVGs and re-render all sizes.
