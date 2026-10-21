import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { UiLanguage, initialUiLanguage } from './ui-language';

export const UI_LANGUAGE_STORAGE_KEY = 'notes.uiLanguage';

/** Picks, switches and remembers the UI language (ADR-0008). Stored per device only. */
@Injectable({ providedIn: 'root' })
export class UiLanguageService {
  private readonly translate = inject(TranslateService);
  private readonly document = inject(DOCUMENT);
  private readonly language = signal<UiLanguage>('en');

  readonly current = this.language.asReadonly();

  /** Applies the saved or browser language. Call once at startup. */
  init(): Promise<void> {
    const browser = this.window?.navigator.language ?? '';
    return this.apply(initialUiLanguage(this.readSaved(), browser));
  }

  private get window(): Window | null {
    return this.document.defaultView;
  }

  async use(lang: UiLanguage): Promise<void> {
    await this.apply(lang);
    this.save(lang);
  }

  private async apply(lang: UiLanguage): Promise<void> {
    this.language.set(lang);
    this.document.documentElement.lang = lang;
    await firstValueFrom(this.translate.use(lang));
  }

  private readSaved(): string | null {
    try {
      return this.window?.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private save(lang: UiLanguage): void {
    try {
      this.window?.localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (private mode); the choice then lasts for this session only.
    }
  }
}
