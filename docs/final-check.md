# Final verification

Completed against the extracted recording and `docs/inventory.md`. The live society website was not opened.

## Source comparison

All 150 one-second frames and 48 additional gallery-transition frames were reviewed. The contiguous review ledger is in the inventory. Final component/content/asset comparison confirmed:

- All eleven navigation labels in the captured order.
- Home order: Welcome, hero, social support, NCC recruitment, fundraising recruitment, footer. Left/right content positions retained. No unrelated homepage sections were added.
- About prose and numbered activities, both full recruitment descriptions, Jobs Coming Soon, membership chart/benefits, supporter logos, contact information and documentation rows are present.
- Login/Register/Admin tab order, observed field labels, form field sequence, internship required marks and button sequence are preserved. Associated accessible labels were added to the donation fields that originally had only placeholders.
- Recovered photographs and posters occupy their original sections. The documentation approval-signature raster, initially omitted, was restored before the two certificates.
- Tall fundraiser/membership images and gallery image 7 were stitched from matching frames. Pixel matching corrected small join offsets; the gallery's clipped top was recovered.
- Original hero lettering was baked into the screenshot. The redesigned full-width copy band conceals duplicate lettering while preserving the photographed scene.
- The required permission footer is present. Payment wording is intentionally replaced with the user's required demo label.

No known section or field order mismatch remains for the observed material. Complete original-site parity cannot be verified for content that is absent from the recording.

## Functional verification

Final `npm run build`: passed. React, motion and form libraries are split into separate chunks; the main app chunk is about 73 KB before gzip. Rollup emits two nonfatal Zod annotation warnings; no build failure.

Final `npm test`: **11 tests passed, 0 failed**, using an isolated temporary MongoDB process and fake records. Coverage includes role boundaries, registration/hash/JWT expiry, refresh rotation and logout, origin/payload rejection, pledge persistence, cadet approval, internship CV access and rejection, PDF/verification, CSV escaping, decoded gallery uploads/size limits, Remember me persistence, impossible dates and authentication rate limits.

Installed dependency audits returned zero known vulnerabilities for root, client and server after updating affected packages. This is a package-audit result, not a guarantee that the application has no security defects.

Browser verification performed at desktop 1440 × 1000 and mobile 375 × 812, using only localhost and fake data:

- Mobile navigation expands with all eleven links in order.
- Empty donation submission reports associated field errors and focuses the first invalid field.
- A demo pledge persists and opens the demo success modal; Escape dismisses it.
- Gallery advances from recovered photo 1 to 6 and opens/closes the mobile lightbox.
- Fake registration using CONTINUE reaches protected enrollment.
- Enrollment validates page one, shows page two, submits, and displays the persisted registration ID.
- Member area displays the ID and submitted cadet status. PDF download completed; public verification displayed the matching fake member.
- Separate seeded admin sign-in opens database-backed counters and the saved cadet queue. Approve updates the record to approved.
- Internship sample values plus a fake PDF upload submit successfully and show a persisted registration ID. The admin queue shows that application. Reject and CSV download completed.

Gallery upload and private CV download were exercised through API integration tests; they were not additionally repeated through the browser. Reduced-motion behavior was checked in the implementation, not with a separate OS-setting toggle. Formal WCAG conformance and exhaustive cross-browser testing remain outside the performed verification.

## PDF review

Generated the test ID card, rendered it with Poppler, and inspected the PNG. Fixed a footer overflow and added a one-page assertion. Final PDF: one page, 540 × 340 points, crest, name, username, member ID, enrollment date, QR and permission footer. The final rendering had no observed clipping or overlaps. Built-in PDF fonts support Latin demo names; a licensed Unicode font is needed for broader-language names.

## Remaining source gaps

These source details are unverified, so they were not reconstructed as reference content.

1. Unrecorded original cadet pages, ID card, post-login screens, admin dashboard and success/modal wording. Requested demo replacements are implemented and labelled.
2. Unopened gender/internship dropdown options; unshown membership toggle form and payment outcome; original terms text. Documented demo choices/flows are used.
3. Forty-four unrecorded gallery images. Only three recovered images are displayed, with original indexes disclosed.
4. Tiny multilingual poster print, certificate handwriting/seal text, approval/CSR signature fine print, small supporter-logo words and complete crest/banner motto. Their visible raster appearance is retained; no replacement wording was invented.
5. Original image quality cannot be recovered beyond the compressed recording. A few cursor/accessibility-widget artifacts remain in raster crops.

Atlas was not configured because no connection credentials were provided. The same production models/routes were tested with local MongoDB. No external payment, email, paid API, public deployment or real-user data was used.

## Local evidence

Ignored verification outputs are retained under `docs/qa/`: desktop-home.png, desktop-admin.png, mobile-gallery.png, demo-id-card.pdf and demo-id-card.png. The source recording, extracted frames, package caches and temporary database files are excluded from Git. The final deliverable is the source tree with lockfiles and recovered public assets.
