# Design tokens

Defined before UI implementation. The reference's section, navigation and left/right content order take precedence over design changes.

- Canvas: `#070d11`; raised surface: `#101c20`; glass: `rgba(20,35,38,.74)`.
- Primary text: `#edf4ef`; secondary text: `#aab9b3`.
- Accent: `#b9ee83`; accent ink: `#132010`; secondary accent: `#8bd3ca`.
- Gradient: lime → mint; decorative glow only, never the sole source of contrast.
- Borders: `rgba(201,230,210,.16)`; radius: 8px inputs, 20px cards, 28px feature images.
- Typography: system sans-serif for UI; Georgia for editorial headings. Body 16px/1.75; headings use fluid clamp.
- Spacing: 4/8/12/16/24/32/48/64/96px. Content max-width 1320px.
- Motion: 450ms enter, 180ms controls; translate ≤20px; reduced-motion disables transforms, smooth scroll and auto-rotation.
- Accessibility: visible focus, labelled controls, associated inline errors, keyboard dialogs with focus return/trap, ≥44px touch controls, no autoplay gallery, semantic landmarks. Contrast checked against the actual dark backgrounds.
