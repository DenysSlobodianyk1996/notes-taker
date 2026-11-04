# Note Links are plain https URLs

A Note can carry up to five Links, stored on its document as `links: string[]` (absolute `https://` URLs, in the order added). Notes written before this field existed have none. No Firestore rules change is needed.

Only `https:` is accepted. A bare address such as `example.com` is saved as `https://example.com`; anything with another scheme is rejected in the form with "Only https links", including `http://`, which is not upgraded because the https version may not exist. This allow-list means a stored Link can never be `javascript:` or `data:`, so rendering it as a clickable `<a href>` can't run script. Links read from Firestore are checked again and any that fail are dropped, so a document edited elsewhere can't inject one either.

Links open in a new tab with `rel="noopener noreferrer"`, so the opened page can't reach the app and isn't told where the click came from. They are user content: masked for Clarity (ADR-0011) and not matched by search. Each is at most 2048 characters, and a Note can't hold the same Link twice.

## Considered options

- **A label per Link.** Rejected for now: more to type, and a shortened address (host and path) is readable enough.
- **Allow `http:` too.** Rejected by the owner: https only.
- **Links found in the Text automatically.** Rejected: the Text stays plain, and explicit Links are easier to validate and show.
