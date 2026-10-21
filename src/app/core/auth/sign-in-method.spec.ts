import { signInMethod } from './sign-in-method';

describe('signInMethod', () => {
  it('uses a popup on desktop', () => {
    expect(signInMethod({ standalone: false, coarsePointer: false })).toBe('popup');
  });

  it('redirects on touch devices', () => {
    expect(signInMethod({ standalone: false, coarsePointer: true })).toBe('redirect');
  });

  it('redirects in the installed (standalone) app, even with a mouse', () => {
    expect(signInMethod({ standalone: true, coarsePointer: false })).toBe('redirect');
  });
});
