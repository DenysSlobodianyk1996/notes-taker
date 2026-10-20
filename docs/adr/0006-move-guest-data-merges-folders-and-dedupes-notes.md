# Move guest data merges Folders and removes Duplicate notes

When a Guest signs in, they are offered Move guest data instead of losing or hiding what they wrote. A Guest Folder whose name clashes with an Account Folder is merged into it (a Folder merge). Duplicate notes (same trimmed Title and Text, ignoring case) are kept once, using the Account copy, and that copy is Completed if either side was. All other Notes are added. After a successful move the Guest store is wiped. If the person declines, the Guest data stays on the device and the offer comes back at the next sign-in. The merge is a pure function (`mergeGuestData`) so it can be fully unit tested apart from either store.

## Default folders

The Default folder has no stored name: it is shown as a translation, and it can't be renamed or deleted. Both sides always have exactly one. So the two Default folders always merge with each other, matched by the `isDefault` marker. If the Account has none yet (a brand-new Account), the Guest's Default folder becomes the Account's. Every other Folder matches by name. Its display names ("General" / "Загальне") are reserved, so an ordinary Folder can never collide with the Default folder. The offer to move isn't shown at all when the Guest has nothing but an empty Default folder; that check also uses the marker.

Matching by name only was considered and rejected. It would leave a stray "Загальне" folder in an Account whose Default folder is "General".
