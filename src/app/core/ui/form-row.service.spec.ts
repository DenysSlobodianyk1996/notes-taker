import { TestBed } from '@angular/core/testing';
import { FakeAuthService, provideFakeAuth } from '@testing/fakes';
import { FormRowService } from './form-row.service';

describe('FormRowService', () => {
  it('closes the open form row when the Account signs out', () => {
    const auth = new FakeAuthService();
    auth.signInAs();
    TestBed.configureTestingModule({ providers: [provideFakeAuth(auth)] });
    const rows = TestBed.inject(FormRowService);
    TestBed.tick();
    rows.open.set({ kind: 'rename-folder', id: 'work' });

    auth.user.set(null);
    TestBed.tick();

    expect(rows.open()).toBeNull();
  });
});
