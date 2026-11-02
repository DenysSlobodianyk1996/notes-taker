import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { LayoutService } from './layout.service';

@Component({ template: '' })
class Blank {}

interface FakeQuery {
  matches: boolean;
  listener?: (event: { matches: boolean }) => void;
}

function stubMatchMedia(matches: boolean): FakeQuery {
  const query: FakeQuery = { matches };
  vi.stubGlobal('matchMedia', (media: string) => {
    expect(media).toBe('(max-width: 899.98px)');
    return {
      get matches() {
        return query.matches;
      },
      addEventListener: (_: string, fn: FakeQuery['listener']) => (query.listener = fn),
      removeEventListener: () => undefined,
    };
  });
  return query;
}

function setup(): LayoutService {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '**', component: Blank }])],
  });
  return TestBed.inject(LayoutService);
}

describe('LayoutService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('is narrow below 900px, and follows the window as it resizes', () => {
    const query = stubMatchMedia(true);
    const layout = setup();
    expect(layout.narrow()).toBe(true);

    query.matches = false;
    query.listener?.({ matches: false });

    expect(layout.narrow()).toBe(false);
  });

  it('is wide when the browser has no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(setup().narrow()).toBe(false);
  });

  it('opens and closes the drawer, and closes it on navigation', async () => {
    stubMatchMedia(true);
    const layout = setup();

    layout.openDrawer();
    expect(layout.drawerOpen()).toBe(true);
    layout.closeDrawer();
    expect(layout.drawerOpen()).toBe(false);

    layout.openDrawer();
    await TestBed.inject(Router).navigateByUrl('/folders/work');
    expect(layout.drawerOpen()).toBe(false);
  });

  it('closes the drawer when the window grows past the breakpoint', () => {
    const query = stubMatchMedia(true);
    const layout = setup();
    layout.openDrawer();

    query.listener?.({ matches: false });

    expect(layout.drawerOpen()).toBe(false);
  });

  it('asks for focus back on ☰ only when the user closes the drawer', async () => {
    stubMatchMedia(true);
    const layout = setup();

    layout.openDrawer();
    layout.closeDrawer();
    expect(layout.returnFocus()).toBe(1);

    layout.openDrawer();
    await TestBed.inject(Router).navigateByUrl('/folders/work');
    layout.openDrawer();
    layout.closeDrawer({ returnFocus: false });
    layout.closeDrawer();
    expect(layout.returnFocus()).toBe(1);
  });
});
