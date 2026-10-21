import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { UI_LANGUAGES, UiLanguage } from '../../core/i18n/ui-language';
import { UiLanguageService } from '../../core/i18n/ui-language.service';

/** The "EN | UA" switch shown on the login card and in the header. */
@Component({
  selector: 'app-language-toggle',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toggle" role="group" [attr.aria-label]="'lang.label' | translate">
      @for (lang of languages; track lang) {
        <button
          type="button"
          [attr.aria-pressed]="uiLanguage.current() === lang"
          (click)="select(lang)"
        >
          {{ 'lang.' + lang | translate }}
        </button>
      }
    </div>
  `,
  styleUrl: './language-toggle.scss',
})
export class LanguageToggle {
  protected readonly uiLanguage = inject(UiLanguageService);
  protected readonly languages = UI_LANGUAGES;

  protected select(lang: UiLanguage): void {
    void this.uiLanguage.use(lang);
  }
}
