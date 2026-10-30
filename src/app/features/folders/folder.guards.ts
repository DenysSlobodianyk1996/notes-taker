import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { FoldersService } from '../../core/folders/folders.service';
import { Folder } from '../../domain/folders';

/** The Account's Folders, creating the Default folder first if this is its first sign-in. */
async function loadFolders(): Promise<Folder[]> {
  const folders = inject(FoldersService);
  await folders.ensureDefaultFolder();
  return folders.whenLoaded();
}

function firstFolder(router: Router, folders: Folder[]): UrlTree {
  return router.createUrlTree(['/folders', folders[0].id]);
}

/** `/folders`: open the first Folder. */
export const toFirstFolder: CanActivateFn = async () => {
  const router = inject(Router);
  // authGuard sits on the parent route, so it doesn't re-run when only the folder changes.
  if (!inject(AuthService).user()) return router.createUrlTree(['/login']);
  return firstFolder(router, await loadFolders());
};

/** `/folders/:folderId`: an unknown id (deleted, mistyped) opens the first Folder instead. */
export const knownFolder: CanActivateFn = async (route) => {
  const router = inject(Router);
  if (!inject(AuthService).user()) return router.createUrlTree(['/login']);
  const folders = await loadFolders();
  const id = route.paramMap.get('folderId');
  return folders.some((f) => f.id === id) ? true : firstFolder(router, folders);
};
