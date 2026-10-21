import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Empty main area until folders arrive (ticket 04). */
@Component({
  selector: 'app-folders-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class FoldersPlaceholder {}
