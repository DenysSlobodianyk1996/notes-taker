import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getButton } from '@testing/dom';
import { FakeThemeService, provideFakeTheme } from '@testing/fakes';
import { provideTestTranslations } from '@testing/translations';
import { UiLanguageService } from '@core/i18n/ui-language.service';
import { ThemePicker } from './theme-picker';

interface Picker {
  fixture: ComponentFixture<ThemePicker>;
  root: HTMLElement;
  theme: FakeThemeService;
}

async function render(): Promise<Picker> {
  const theme = new FakeThemeService();
  TestBed.configureTestingModule({
    providers: [provideTestTranslations(), provideFakeTheme(theme)],
  });
  await TestBed.inject(UiLanguageService).init();
  const fixture = TestBed.createComponent(ThemePicker);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement, theme };
}

async function openPopover(picker: Picker): Promise<HTMLButtonElement> {
  const button = getButton(picker.root, 'Theme');
  button.click();
  await picker.fixture.whenStable();
  return button;
}

function swatches(root: HTMLElement): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>('[role="radio"]')];
}

describe('ThemePicker', () => {
  beforeEach(() => localStorage.clear());

  it('opens a popover of three Themes, the current one checked and focused', async () => {
    const picker = await render();
    picker.theme.theme.set('pink');

    const button = await openPopover(picker);

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(picker.root.querySelector('[role="radiogroup"]')).not.toBeNull();
    expect(
      swatches(picker.root).map((s) => [
        s.getAttribute('aria-label'),
        s.getAttribute('aria-checked'),
      ]),
    ).toEqual([
      ['Orange', 'false'],
      ['Pink', 'true'],
      ['Purple', 'false'],
    ]);
    expect(document.activeElement).toBe(swatches(picker.root)[1]);
  });

  it('saves the picked Theme and closes, with focus back on the button', async () => {
    const picker = await render();
    const button = await openPopover(picker);

    getButton(picker.root, 'Purple').click();
    await picker.fixture.whenStable();

    expect(picker.theme.setTheme).toHaveBeenCalledWith('purple');
    expect(swatches(picker.root)).toHaveLength(0);
    expect(document.activeElement).toBe(button);
  });

  it('closes with Esc or a click outside, changing nothing', async () => {
    const picker = await render();

    await openPopover(picker);
    swatches(picker.root)[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await picker.fixture.whenStable();
    expect(swatches(picker.root)).toHaveLength(0);

    await openPopover(picker);
    picker.root.querySelector<HTMLElement>('.backdrop')!.click();
    await picker.fixture.whenStable();
    expect(swatches(picker.root)).toHaveLength(0);
    expect(picker.theme.setTheme).not.toHaveBeenCalled();
  });

  it('names its parts in Ukrainian', async () => {
    const picker = await render();
    await TestBed.inject(UiLanguageService).use('uk');
    await picker.fixture.whenStable();

    getButton(picker.root, 'Тема').click();
    await picker.fixture.whenStable();

    expect(swatches(picker.root).map((s) => s.getAttribute('aria-label'))).toEqual([
      'Помаранчевий',
      'Рожевий',
      'Фіолетовий',
    ]);
  });

  it('is one Tab stop; arrow keys move between the Themes, wrapping round', async () => {
    const picker = await render();
    await openPopover(picker);
    const [orange, pink, purple] = swatches(picker.root);
    expect([orange.tabIndex, pink.tabIndex, purple.tabIndex]).toEqual([0, -1, -1]);

    const arrow = (key: string): void => {
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    };
    arrow('ArrowRight');
    expect(document.activeElement).toBe(pink);
    arrow('ArrowLeft');
    arrow('ArrowLeft');
    expect(document.activeElement).toBe(purple);
  });

  it('closes when focus moves outside it', async () => {
    const picker = await render();
    await openPopover(picker);
    const outside = document.createElement('button');
    document.body.appendChild(outside);

    swatches(picker.root)[0].dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: outside }),
    );
    await picker.fixture.whenStable();

    expect(swatches(picker.root)).toHaveLength(0);
    outside.remove();
  });

  it('keeps focus where it is when the Theme changes on another device', async () => {
    const picker = await render();
    await openPopover(picker);
    swatches(picker.root)[2].focus();

    picker.theme.theme.set('pink');
    await picker.fixture.whenStable();

    expect(document.activeElement).toBe(swatches(picker.root)[2]);
  });
});
