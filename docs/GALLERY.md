# Manually supplied gallery

The user chose to provide photos and videos manually instead of connecting Instagram. No Meta token, social API, scraping, or polling is used. Six previously supplied project photos now populate the gallery, without duplicated entries. The layout has three rows, fills each column from top to bottom, and scrolls horizontally using touch, a trackpad, the scrollbar, or arrow keys while focused. More files extend the gallery sideways.

Place files in `public/images/gallery/` and list them in `public/images/gallery/gallery.json`. This static directory is deployed with the project. Display order follows the manifest. Images: JPG/JPEG, PNG, WEBP. Videos: MP4 (H.264 recommended), WEBM. Compress large videos for web use. Do not invent captions or translations.

Each manifest entry has:

- `id`: unique stable identifier.
- `type`: `image` or `video`.
- `file`: existing filename using ASCII letters, numbers, dots, underscores or hyphens.
- `alt`: optional object with verified `mn`, `ko`, `en` descriptions.
- `caption`: optional object with verified `mn`, `ko`, `en` captions.
- `poster`: optional image filename for a video.
- `captions`: optional `.vtt` subtitle filename; supply for videos containing speech.
- `captionLanguage`: VTT language (`mn`, `ko`, `en`).

Missing files are omitted. The empty gallery is labeled. Images open their original file in a new tab. Videos have native playback/fullscreen controls, play inline on mobile, and do not autoplay. Refresh the page after manually changing files. No live social import is claimed.

The logo and main section photos remain separate static assets. Menu image management remains in the admin dashboard.

Gallery now uses two spacious rows of three square images. The top row links to the supplied Instagram profile; the bottom row links to the supplied Facebook page. These are profile links, not claimed individual social posts. Hover or keyboard focus reveals the matching social icon. Additional entries alternate between the two rows and extend horizontally. On touch devices the icons remain visible. Native video controls remain unchanged.

The user-supplied Instagram post `https://www.instagram.com/p/DeVmisbD_TH/` replaces the first Instagram-row photo with a lazy-loaded captioned Instagram iframe. It includes a permanent direct-post fallback link. Instagram controls availability/login restrictions and the embedded post content; this is one selected post, not a live account feed. The Instagram row keeps a minimum 326px card width and scrolls horizontally on narrow screens.

Latest update: all three supplied Instagram posts (`DeVmisbD_TH`, `DeD-U9VgXR4`, `Dd8x7mJkmjK`) now use locally saved WEBP preview images retrieved from each public post's `og:image`. The Instagram row renders regular linked images, with no iframe or Instagram script. Each image opens its own source post. These are static cover previews (not all carousel slides and not an automatically synchronized feed).

Current state: restored the manual-image gallery at the user's request. Instagram previews and embeds are no longer rendered; the original six manifest photos are shown in the two rows. Top-row photos link to the Instagram profile and bottom-row photos to Facebook. Replace the manifest images when the user supplies new files.
