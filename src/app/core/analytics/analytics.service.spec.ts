import { TestBed } from '@angular/core/testing';
import Clarity from '@microsoft/clarity';
import {
  FakeLayoutService,
  FakeThemeService,
  provideFakeLayout,
  provideFakeTheme,
} from '@testing/fakes';
import { provideTestTranslations } from '@testing/translations';
import { UiLanguageService } from '@core/i18n/ui-language.service';
import { AnalyticsService, CLARITY_PROJECT_ID } from './analytics.service';

// Uses the global `vi` (no import): see folders.service.spec.ts.
vi.mock('@microsoft/clarity', () => ({
  default: {
    init: vi.fn(),
    setTag: vi.fn(),
    identify: vi.fn(),
    consent: vi.fn(),
    consentV2: vi.fn(),
    event: vi.fn(),
  },
}));

async function setup(projectId: string) {
  const theme = new FakeThemeService();
  const layout = new FakeLayoutService();
  TestBed.configureTestingModule({
    providers: [
      provideTestTranslations(),
      provideFakeTheme(theme),
      provideFakeLayout(layout),
      { provide: CLARITY_PROJECT_ID, useValue: projectId },
    ],
  });
  await TestBed.inject(UiLanguageService).init();
  TestBed.inject(AnalyticsService).start();
  TestBed.tick();
  return { theme, layout };
}

function tags(): Record<string, string> {
  const latest: Record<string, string> = {};
  for (const [key, value] of vi.mocked(Clarity.setTag).mock.calls) latest[key] = String(value);
  return latest;
}

describe('AnalyticsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('does nothing without a Clarity project id (development, tests)', async () => {
    await setup('');

    expect(Clarity.init).not.toHaveBeenCalled();
    expect(Clarity.setTag).not.toHaveBeenCalled();
  });

  it('starts Clarity once with the project id', async () => {
    await setup('abc123');
    TestBed.inject(AnalyticsService).start();

    expect(Clarity.init).toHaveBeenCalledTimes(1);
    expect(Clarity.init).toHaveBeenCalledWith('abc123');
  });

  it('never identifies the Account, asks for consent, or sends custom events (ADR-0011)', async () => {
    await setup('abc123');

    expect(Clarity.identify).not.toHaveBeenCalled();
    expect(Clarity.consent).not.toHaveBeenCalled();
    expect(Clarity.consentV2).not.toHaveBeenCalled();
    expect(Clarity.event).not.toHaveBeenCalled();
  });

  it('tags the session with UI language, Theme and layout, and follows changes', async () => {
    const { theme, layout } = await setup('abc123');
    expect(tags()).toEqual({ lang: 'en', theme: 'orange', layout: 'wide' });

    await TestBed.inject(UiLanguageService).use('uk');
    theme.theme.set('purple');
    layout.narrow.set(true);
    TestBed.tick();

    expect(tags()).toEqual({ lang: 'uk', theme: 'purple', layout: 'phone' });
  });
});
