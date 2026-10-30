import { Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

/** The Default folder's name in the current UI language; follows the EN | UA toggle. */
export function injectDefaultFolderName(): Signal<string> {
  return toSignal(inject(TranslateService).stream('folders.defaultName'), { initialValue: '' });
}
