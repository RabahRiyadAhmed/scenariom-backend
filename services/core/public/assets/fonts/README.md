# Font library

This directory is the backend source of truth for licensed font assets.

- Original downloaded families remain in their own directories with their licenses.
- `runtime/` contains the small, normalized subset served to clients.
- Applications request runtime files through `/api/assets/fonts/:file` on the gateway.
- Do not load the complete `plex-master` source tree or every static font weight at runtime.
- Keep each `OFL.txt` or upstream license beside the original family.

The initial runtime set covers Latin, Cyrillic, Greek and Arabic. Large CJK families must be added later as optional script packs rather than included in every application bundle.
