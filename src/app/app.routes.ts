import { Routes } from '@angular/router';
import { authGuard, signedOutGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [signedOutGuard],
    loadComponent: () => import('./features/login/login-page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: 'folders',
        loadComponent: () =>
          import('./features/folders/folders-placeholder').then((m) => m.FoldersPlaceholder),
      },
      { path: '', pathMatch: 'full', redirectTo: 'folders' },
    ],
  },
  { path: '**', redirectTo: 'folders' },
];
