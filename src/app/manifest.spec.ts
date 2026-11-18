import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * On an installed Android app the status bar follows `<meta name="theme-color">` (the Theme, set
 * live by ThemeService), but the navigation bar at the bottom uses the manifest's `theme_color`,
 * which is fixed at install time. So the manifest uses the page surface colour: the bar blends with
 * the main area in every Theme instead of staying Orange.
 */
const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8')) as {
  theme_color: string;
};
const surface = /^\$surface:\s*(#[0-9a-f]{6});/im.exec(
  readFileSync(join(root, 'src/styles/_tokens.scss'), 'utf8'),
)?.[1];

describe('manifest', () => {
  it('has theme_color equal to the page surface, so the Android navigation bar matches the main area', () => {
    expect(surface).toBeDefined();
    expect(manifest.theme_color.toLowerCase()).toBe(surface?.toLowerCase());
  });
});
