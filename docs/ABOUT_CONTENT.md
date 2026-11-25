# About detail content

Routes: `/mn/about`, `/ko/about`, `/en/about`.

Editorial source: the user's 2026-11-24 message. The 500°C pre-grilling, 20mm Korean pork, Roast Chef, 90% PB products, 200+ locations, 2020 Mongolia launch and three brand values are user-supplied claims, not independently verified facts. MN copy is preserved with light formatting; KO/EN translations follow it. The incomplete sentence beginning “лэлийн рестораны…” is omitted rather than reconstructed.

Text: `lib/about-story.ts`. Navigation labels: `lib/about-content.ts`.

Manually replace these independent image files to change the detail-page photos:

| File | Placement | Initial source |
| --- | --- | --- |
| `public/images/about-detail/chef.jpg` | Opening full-width image | Existing user-supplied about-grilling photo |
| `public/images/about-detail/history.jpg` | History section | Existing about-restaurant photo |
| `public/images/about-detail/craft.jpg` | Grilling methods section | Existing charcoal-grilling photo |

These are illustrative project photos, not dated historical evidence. Missing image files display a localized placeholder. Update alt text alongside any replacement in `lib/about-story.ts` or `lib/about-content.ts`. No static-image admin upload controls added.
