import { Injectable, InjectionToken, Injector, effect, inject } from '@angular/core';
import Clarity from '@microsoft/clarity';
import { UiLanguageService } from '@core/i18n/ui-language.service';
import { LayoutService } from '@core/layout/layout.service';
import { ThemeService } from '@core/theme/theme.service';

/** The Microsoft Clarity project id: set in production only; empty means no analytics. */
export const CLARITY_PROJECT_ID = new InjectionToken<string>('CLARITY_PROJECT_ID', {
  factory: () => '',
});

/**
 * UX analytics with Microsoft Clarity (ADR-0011): session replays and heatmaps, production only.
 * User content is masked in the templates (`data-clarity-mask`); this service never identifies the
 * Account, asks for cookie consent (the project runs without cookies) or sends custom events. It
 * only tags each session with the UI language, Theme and layout.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly projectId = inject(CLARITY_PROJECT_ID);
  private readonly injector = inject(Injector);
  private started = false;

  /** Starts Clarity once; does nothing without a project id (development, tests). */
  start(): void {
    if (this.started || !this.projectId) return;
    this.started = true;
    Clarity.init(this.projectId);

    const language = this.injector.get(UiLanguageService).current;
    const theme = this.injector.get(ThemeService).theme;
    const layout = this.injector.get(LayoutService).narrow;
    effect(() => Clarity.setTag('lang', language()), { injector: this.injector });
    effect(() => Clarity.setTag('theme', theme()), { injector: this.injector });
    effect(() => Clarity.setTag('layout', layout() ? 'phone' : 'wide'), {
      injector: this.injector,
    });
  }
}
