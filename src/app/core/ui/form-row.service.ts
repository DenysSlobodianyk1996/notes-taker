import { Injectable, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '@core/auth/auth.service';

/** The inline form rows in the app; at most one is open at a time (spec story 45). */
export type FormRow =
  | { kind: 'new-folder' }
  | { kind: 'rename-folder'; id: string }
  | { kind: 'new-note' }
  | { kind: 'edit-note'; id: string };

/**
 * Which inline form row is open, shared by the Folders sidebar and the Note list. Opening one
 * replaces (and so discards) whichever was open before. Closed whenever the Account changes.
 */
@Injectable({ providedIn: 'root' })
export class FormRowService {
  readonly open = signal<FormRow | null>(null);

  constructor() {
    const auth = inject(AuthService);
    let account: string | null | undefined;
    effect(() => {
      const uid = auth.user()?.uid ?? null;
      if (uid === account) return;
      account = uid;
      untracked(() => this.open.set(null));
    });
  }
}
