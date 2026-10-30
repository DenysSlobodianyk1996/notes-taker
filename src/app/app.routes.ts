import { Routes } from '@angular/router';
import { authGuard, signedOutGuard } from './core/auth/auth.guards';
import { knownFolder, toFirstFolder } from './features/folders/folder.guards';

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
        children: [
          { path: '', pathMatch: 'full', canActivate: [toFirstFolder], children: [] },
          {
            path: ':folderId',
            canActivate: [knownFolder],
            loadComponent: () =>
              import('./features/folders/folder-page/folder-page').then((m) => m.FolderPage),
          },
        ],
      },
      { path: '', pathMatch: 'full', redirectTo: 'folders' },
    ],
  },
  { path: '**', redirectTo: 'folders' },
];
