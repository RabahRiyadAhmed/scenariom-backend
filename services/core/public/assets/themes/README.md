# Theme assets

Place optional shared theme assets under `public/assets/images/theme`:

```text
retro/background.jpg
cyberpunk/background.jpg
neon/background.jpg
```

The backend exposes each file at `/api/themes/assets/{theme}/{file}`. Store its gateway path in `extraData.backgroundImagePath`, for example `/themes/assets/retro/background.jpg`. Next and Expo then resolve the same asset through the gateway. Do not store image binaries inside the PostgreSQL JSON column.

The service preserves the real MIME type for SVG, PNG, JPEG and WebP. The gateway must forward that type unchanged.
