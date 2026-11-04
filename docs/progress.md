# Existing-project audit — 28 October 2026

This continuation preserves the existing MERN app. Baseline: frontend returned HTTP 200 at port 5173; port 5000 was stopped. Started the existing `tools/demo.cjs --api-only` launcher, which seeded a temporary real MongoDB database. The existing homepage was inspected in the browser. Further flow checks are in progress; code presence alone is not counted as a successful browser test.

## DONE

- Existing React/Vite frontend runs, with dark responsive styling, the observed homepage sections and permission footer.
- Existing Express/Mongoose demo launcher runs and seeds one admin, five members and the original three recovered gallery crops.
- Public source HTML, script and stylesheet fetched successfully with HTTP 200; saved under `reference/live-*`. No access block was bypassed and no form was submitted to the original website.
- Existing recording extraction retained: 150 one-second frames plus 48 gallery transition frames. No video or application files were regenerated.

## PARTIAL/BROKEN

- Gallery has 3 of the original 47 photos; most existing public assets are video crops rather than original image files.
- Hero contains only 3 recorded views, while live HTML references 11 images.
- Register is missing Blood Group. ID preview/PDF omit reference details and the newly readable motto.
- Cadet form uses abbreviated demo fields; live HTML now supplies the actual two-page field sequence and required markers. Sensitive Aadhaar/PAN/income fields will remain omitted by request.
- Internship gender/options differ from the original; accepted CV formats are narrower than the original.
- Membership pledge mode omits Monthly Membership / Yearly Membership controls and Membership Contribution copy.
- Cadet success modal is generic and lacks Copy ID / Download Identity Card. Source email-service claims must remain demo-adapted.
- Navigation spelling, supporter links and some CTA destinations/copy require source comparison.
- Auth, enrollment, pledge, internship, gallery and admin code exists, but fresh browser verification of every flow is pending.

## NOT STARTED

- Download and byte/quality verification of the full set of public original images.
- Complete exact-text reconciliation and source-derived field audit.
- Final post-fix browser pass, production build and updated verification record.
- Atlas connection verification: no Atlas credentials were supplied; temporary MongoDB is used for runtime checks.

This is the initial audit; these three lists will be updated with observed results after focused fixes.

## Atlas persistence continuation — 4 November 2026

### DONE
- `server/.env` is present, contains an Atlas URI (the value was not printed), and is ignored by Git. Added a generated local `FIELD_ENCRYPTION_KEY`; preserve the same key securely for deployments and backups.
- Removed the local Mongo fallback. Startup now selects `MONGODB_DATABASE` (default `agni_rural_welfare`), logs a redacted Atlas connection diagnostic on failure, and exposes database readiness at `/api/health`.
- Mapped persistence to `users`, `sessions`, `registrations`, `internshipApplications`, `pledges`, `galleryItems`, and `siteContent`. Cadet enrollment and detailed member/volunteer/intern forms share `registrations` with `recordKind` filters.
- Added idempotent, non-destructive compatibility copying from previous collection names; available legacy local uploads are moved to GridFS without deleting their source files or records.
- Replaced upload disk writes with Multer memory + Sharp + public/private GridFS buckets; each file is limited to 2 MB and related records retain GridFS ID, filename, MIME type and size. Private files require JWT and record ownership (or admin role).
- Added AES-256-GCM encryption for sensitive detailed registration fields, masked admin responses, and removed error-message logging that could expose submitted values.
- Seed now upserts all site JSON into `siteContent`; the client fetches copy from `/api/site-content` while keeping its bundled content as a first-render fallback. The Atlas seed remains explicit and was not run against the user's database in this editing pass.
- Updated Atlas setup/run instructions and persistence documentation.

### PARTIAL/BROKEN
- No live Atlas connection, migration, or seed was executed from this editing pass, so network/IP allowlist, database permissions and resulting collection contents remain unconfirmed.
- Client production build was attempted but Vite stopped with a Windows `EPERM` while resolving `client/src/main.jsx`; server JavaScript and JSON syntax checks passed.
- Legacy uploads larger than the new 2 MB limit or missing from the local `server/uploads` folder remain in the untouched legacy source records and require manual review if present.

### NOT STARTED
- End-to-end browser verification against the configured Atlas database, including private GridFS access, after the user starts the updated API.

## Hero follow-up — 28 October 2026

- Replaced the oversized centered translucent panel with a left-aligned lower-left editorial caption, a narrow accent rule, and text shadow over the existing photo fade. This keeps the hero image and copy intact while reducing obstruction of the image.
- Hero slideshow now starts playing by default and retains the visible pause/play control. System reduced-motion preference suppresses automatic transitions.
- Production frontend build completed and the updated composition was reviewed in the running desktop browser. The caption border radius was reset so the accent rule stays clean and straight.


## UX/layout refresh — 28 October 2026

### DONE
- Replaced the crowded single-row navigation with a compact sticky translucent header, logo wordmark, grouped More disclosure, clear Login and Donate actions, and a full-height mobile menu. Header compacts as the page scrolls; route state and home-page section scrollspy drive the active highlight.
- Removed the WELCOME spacer, the hero's cross-fading duplicate image layer, and the long-line gap. Hero has a readable photo gradient, responsive title, Donate Now and Become a Member actions, autoplay slideshow with hover pause and reduced-motion support; its unverified impact strip was removed.
- Added consistent page eyebrow/header rhythm, standard card treatment, horizontal campaign/recruitment columns, and a two-column About intro with a Read more disclosure and activity icon cards. Existing copy and images remain sourced from the existing content/assets.
- Reworked Login/Register/Admin into a split branding/form card that stacks on mobile; refined field labels, target sizes, focus surfaces, application panel and sticky enrollment actions. Added footer logo, quick links/contact, permission note, mobile Donate action (hidden on form/payment pages), and back-to-top control.
- Used the Playwright browser to inspect 375, 768, 1024 and 1440px layouts and the home, login, register, enrollment, donate and admin routes. Saved 40 viewport screenshots under `docs/screenshots/` covering home top/middle/bottom, login, all 3 register steps, enrollment, donate and admin at each width. The DOM width check found no horizontal overflow in those route/viewport combinations. The mobile slide-in menu and admin dashboard were also visually checked.
- Register now groups its existing account and personal fields into three steps with a progress bar and review card. A successful member registration opens the existing ID-card/download page; the enrollment continuation remains available from the review step.
- Production `npm run build` passes.

### PARTIAL/BROKEN
- Verified impact values are unavailable in the source, so the placeholder strip is omitted.
- The Internship form remains one-page, preserving its current structure.

- Enrollment/admin checks used the existing demo account; external Atlas credentials are not available for production-service verification.

### BEFORE / AFTER
- Before: 11 equally weighted nav links in one cramped row; after: six main links, a keyboard-operable More disclosure, and distinct Login/Donate actions, with a full-height mobile panel.
- Before: centered/oversized text over the hero and a crossfade that could show two images; after: a compact left-aligned CTA panel over one active image with a controlled gradient and working slideshow pause behavior.
- Before: WELCOME label/line and long dark gaps weakened section hierarchy; after: that spacer is removed, section eyebrows and consistent spacing establish a clearer page rhythm, and About activities use scannable icon cards.
- Before: login and register sat in a narrow single-column panel; after: the form sits beside branded imagery on desktop and stacks cleanly at mobile widths.







- The screenshot run reached the existing 30-per-15-minute authentication refresh limit for new automated browser sessions; no security limits were changed. The already-authenticated review tab still works. Avoid restarting the temporary in-memory demo backend; fresh auth may return 429 until its rate-limit window resets.
- docs/screenshots/admin-375.jpg was captured just before the final rule that hides the floating Donate shortcut on admin/profile pages; the live admin page has that overlap fixed. Other screenshots reflect the final layout.

## Copy and hero polish — 28 October 2026

- Removed placeholder statistics and all rendered placeholder/demo labels. Payment and email limitations remain stated plainly where relevant.
- Replaced the boxed hero caption with a smaller lower-third caption over a blended gradient, keeping the same slideshow images and order.
- Replaced the unrelated portrait on the registration panel with the society's cadet group photo.
- More now closes on link selection, outside click, Escape, and route change.
- Refreshed home-top and registration-step-one screenshots at 375, 768, 1024 and 1440px. Playwright confirmed no horizontal overflow at those widths and confirmed More closes after navigation.
- Removed the PDF identity-card watermark, adjusted downloadable filenames and upload errors, and changed the pledge response to state that payments are unavailable and no charge is made.
- Updated the README and source inventory to remove demo branding from the interface description and describe payment behavior accurately.
- Production frontend build passes; `npm test` passes all 11 integration tests.

- Final verification: the reduced-motion preference is honored by Back to top; the production build passes. The 40-image matrix remains intact.

## Dark/light theme — 28 October 2026

### DONE
- Added semantic color variables for light and dark themes, including layered surfaces, borders, text, primary/accent, status, overlay, shadow and glow. Tailwind's theme colors now resolve from these variables.
- Added pre-paint preference initialization, system preference tracking until an explicit choice is stored, guarded localStorage access, native `color-scheme`, browser theme-color updates and reduced-motion-aware transitions.
- Added accessible sun/moon icon controls to the desktop navbar and mobile menu, with action labels, tooltip, focus treatment and `aria-pressed`.
- Updated the shared navigation, hero, cards, forms, tabs, dialogs, admin dashboard, footer, scrollbars, selection, borders and focus styles for both palettes. The login image and logo remain legible on both backgrounds.
- Captured home, login, register, enrollment, donate and admin at 375px and 1440px in both themes in `docs/screenshots/theme-{light,dark}-*.png`. Protected-route screenshots use synthetic, screenshot-only auth and empty admin lists; no data was written.
- Playwright verified system dark default, explicit theme selection, localStorage persistence after reload, mobile-menu control, desktop control and theme-color updates. Production frontend build passes.

### PARTIAL/BROKEN
- The running API health endpoint responds, but both seeded login attempts returned a generic server error. Protected-route screenshots therefore use synthetic auth in the browser only; no live login, enrollment submission or admin data was exercised in this theme pass.
- Contrast was checked from the chosen palette values and browser renders; this is not a formal third-party WCAG conformance audit.
## Registration architecture refactor — 3 November 2026

### DONE

- Kept the existing registration form HTML/CSS, text, fields, order, required marks, routes, and registration data model intact.
- Split frontend iframe hosting, document assembly, theme synchronization, message handling, role mapping, and API calls into registration feature modules.
- Moved account and generic registration application HTTP handling out of `app.js`; generic application parsing/persistence now has controller, service, and repository boundaries. Existing URLs and local upload compatibility are preserved.
- Registration validation and API errors use toast notifications. Invalid field labels are included and the first invalid iframe control receives focus.
- Added a source form manifest contract and 3 database-free service tests. **9/9** targeted tests pass.
- Vite production build passes.
- Added the architecture and field/type extension notes to `docs/registration-architecture.md` and README.

### PARTIAL/BROKEN

- Full server suite: **0/11 passed** because `mongodb-memory-server` fails to start its bundled mongod with `fassert() failure`, before tests execute. Three database-free registration unit tests and six manifest tests pass.
- Playwright and Testing Library/Vitest baseline suites were not added: those packages are absent and npm package installation did not complete in this environment. No browser-flow or screenshot claim is made for this refactor.
- The generic application model still uses Mixed data plus key filtering; per-type Zod allowlists are not wired into persistence.
- Uploads remain local filesystem paths. GridFS/cloud migration, Mongo discriminators, shared client/server typed schemas, and TS adoption were not attempted because they need a compatibility/data migration plan and a working integration environment.
- The initial sandboxed Vite build hit a Windows realpath permission failure; rerunning with approved access succeeded.

### NOT STARTED

- Per-type server schemas and schema-driven field validation across all existing embedded forms.
- A migration-tested storage adapter for existing uploads or a Mongo discriminator migration.
- Full Playwright browser coverage and screenshot verification after dependencies/database startup are available.

## Admin applicant overview and input suggestions — 4 November 2026

### DONE

- Added an admin applicant total and category counts for member, cadet, volunteer and internship/alumni submissions, including account registrations, legacy cadet/internship records and general registration applications.
- Added an expanded-by-default **All applicants** tab with each applicant's submitted safe text fields, registration type, source, status, ID and uploaded-file labels. Existing cadet/internship review and decision tabs remain available.
- Added native browser autocomplete semantics to text inputs and textareas in Login, Register, Admin and embedded registration forms. Password fields are set to autocomplete off. No fabricated suggestion values are inserted.
- Preserved selected checkbox values when multiple selections share a form field name, so all selected application details are retained.
- Targeted tests and production frontend build pass.

### PARTIAL/BROKEN

- Browser visual verification of the new admin dashboard remains pending. The API was checked directly after restart; see below.

### Runtime check — 4 November 2026

- Restarted the temporary demo API after approval; it reseeded one admin and five demo members.
- Signed in through `/api/auth/admin-login` using the seeded admin and confirmed `/api/admin/stats` returns applicants, members, cadets, volunteers, internships and pledges.
- Confirmed `/api/admin/applications` returns the five seeded demo member accounts. The browser screenshot check could not be completed in this session.

## Registration approval and profile ID cards — 4 November 2026

### DONE

- New user accounts carry pending/approved/rejected status. Admins can approve or decline accounts and each detailed registration application from **All applicants**; status and approval time persist in MongoDB.
- Detailed form approvals link to an account by email when available, merge the submitted safe details into that account, and make its profile/card available after approval. Applications submitted before an account can be inherited when that account is later created.
- Member profiles show a pending/declined state until approved; approved profiles show available registration details and an ID-card download. Approved cadet enrollments also expose their own card download. Card and public QR verification endpoints reject unapproved records.
- Replaced the former one-page ID PDF with a two-sided printable identity card using the reference fields, the applicant photo, society branding, approval/enrollment dates and a QR verification code.
- Existing records without a status remain compatible and are treated as approved; seeded demo users are marked approved.
- Server files passed Node syntax checks; the main React JSX and content JSON parsed successfully.

### PARTIAL/BROKEN

- Local browser/API interaction could not be verified from this environment because local socket access was denied. Production build has previously failed during Vite's filesystem `realpath` for `client/src/main.jsx` with Windows `EPERM`; targeted parsing succeeded after these changes.

## Deployment preparation — 4 November 2026

### DONE

- Added a Vercel Node function that streams `/api/*` requests to the Render service. This keeps the browser API same-origin for httpOnly refresh cookies and GridFS file URLs; `API_ORIGIN` is read only by the server-side function.
- Added Vercel routing for the React SPA and configured a 60-second function allowance for slow first requests to a sleeping free Render service.
- Added a Render Blueprint for the Express API, production mode, Atlas database name, health check and required server secret variables.
- Documented the Render/Vercel environment variables, deploy order, Atlas seed step, verification checklist and free-plan cold-start behavior in README.
- `node --check` passed for the proxy and server entry/config/app files; `client/vercel.json` parsed as valid JSON and `render.yaml` parsed successfully. Vite production build completed successfully after sandbox-approved filesystem access.

### PARTIAL/BROKEN

- No production deploy was made. The actual Vercel and Render hostnames still need to be entered as `API_ORIGIN` and `CLIENT_ORIGIN`, respectively, and host-side environment variables need to be configured.
- The Atlas URI is present only in the local ignored `server/.env`; no connection, migration or seed was run against Atlas during this deploy-preparation pass.
- Browser verification against deployed services remains pending. Vite reported non-fatal vendor annotation and 500 kB chunk-size warnings during its successful production build.

### NOT STARTED

- Deploying from the user's Vercel/Render accounts and verifying production Atlas connectivity, registration, admin approval, ID-card PDF/QR, gallery GridFS and private document access.

