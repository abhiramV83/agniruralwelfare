# Agni Rural Welfare Society — MERN website

Built for an internship submission with the permission of Agni Rural Welfare Society, as stated by the project owner. The society's content and images are retained from the supplied screen recording. Use sample data for local testing. Payment processing and email are not connected; no paid APIs are used.

The original live website was never visited. All 150 one-second frames and 48 additional transition frames were reviewed. Exact recoverable copy lives in `client/src/content/site.json`. See [the inventory](docs/inventory.md) for original field order, section positions, source timestamps, observed flows and every source gap. [Design tokens](docs/design-tokens.md) were defined before UI work.

## Requirements and install

Use Node.js 22.12+ (or a current Node 24 LTS), npm, and a MongoDB Atlas cluster. All application persistence, including uploads, is stored in Atlas. From this directory, in PowerShell:

```powershell
npm.cmd ci
npm.cmd --prefix client ci
npm.cmd --prefix server ci
```

Commit the three package lockfiles with the source. They pin the tested versions. `ffmpeg-static` downloads a local FFmpeg binary on the first root install. Tests/temporary demo download an official MongoDB binary once; on Windows this download is about 592 MB. Neither download is a paid service.

## Run with MongoDB Atlas

```powershell
Copy-Item server/.env.example server/.env
```

Edit `server/.env` and set the values below. The project ignores this file; never commit it. The existing local `.env` is preserved by this change.

### Atlas setup

1. Create a free or paid cluster in MongoDB Atlas.
2. Under **Security → Database Access**, create a database user and grant read/write access to the application database.
3. Under **Security → Network Access**, add the IP address of your development machine. For Render, allow the outbound IP ranges your plan uses; avoid opening access to everyone unless you knowingly accept that exposure.
4. In the cluster, choose **Connect → Drivers → Node.js** and copy the connection string. Replace the username and password; URL-encode special characters in the password. The app selects the `agni_rural_welfare` database via `MONGODB_DATABASE`.
5. Generate long random secrets and set them in `server/.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the first value for `JWT_ACCESS_SECRET` and the second for `FIELD_ENCRYPTION_KEY`. Keep `FIELD_ENCRYPTION_KEY` backed up securely and unchanged: encrypted fields cannot be recovered if it is lost or rotated.

Seed the admin, five demo members, sample gallery records and the complete `client/src/content/site.json` copy into Atlas, then start the API and client:

```powershell
npm.cmd run seed
npm.cmd run dev
```

The `npm run demo` convenience launcher now uses the configured Atlas database too; it does not create or delete a temporary database. Stop it without deleting any Atlas records. `npm run dev` launches the API and Vite separately; use `node tools/demo.cjs --api-only` if Vite is already running. On API startup, an idempotent compatibility migration copies records from the former collection names and moves available legacy local uploads into GridFS. It leaves the source collections and files in place.

Demo account usernames and passwords are the values set in `SEED_ADMIN_PASSWORD` and `SEED_MEMBER_PASSWORD`; keep the credentials synthetic. The seed script is idempotent and preserves existing records and seed account passwords. `/api/health` reports the database connection state. Startup reports a redacted, actionable Atlas connection error and exits if connection fails.

## Build and checks

```powershell
npm.cmd run build
npm.cmd test
```

The build produces `client/dist/`. Tests use their own temporary MongoDB database and fake uploads, without touching Atlas or an existing application database. They cover registration and password hashing; JWT expiration; refresh rotation/logout; member/admin isolation; strict payloads and origin checks; donation/membership pledges; cadet approval; internship CV privacy/rejection; PDF and verification; stats/CSV formula escaping; gallery image decoding and size limits. A generated test card is written to ignored `docs/qa/demo-id-card.pdf` for visual review.

### Deploy to Render + Vercel

The repository includes a Render Blueprint at `render.yaml`, a Vercel SPA configuration at `client/vercel.json`, and a streaming `/api/*` proxy at `client/api/[...path].js`. The proxy keeps API and file URLs on the Vercel origin, so the existing httpOnly refresh cookie and gallery/GridFS URLs continue to work without putting backend secrets in browser code.

1. Push this repository to GitHub. In Render, create a **Blueprint** from the repository and deploy `agni-rural-society-api` from `render.yaml` (root directory `server`). Add the required secret values in the Render service's Environment page: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `FIELD_ENCRYPTION_KEY`, and `CLIENT_ORIGIN`. Set `MONGODB_DATABASE` to `agni_rural_welfare`; `NODE_ENV` is set by the blueprint. `CLIENT_ORIGIN` is the final Vercel production origin, such as `https://your-project.vercel.app`, with no trailing slash. Render exposes its assigned `PORT` automatically. Keep database access restricted to the Render outbound addresses supported by your Render plan and your development IP; if Atlas cannot use stable outbound addresses on the selected plan, choose a supported private/static-egress option rather than committing credentials or weakening app authentication.
2. Wait for Render's `/api/health` check to pass and copy the service's HTTPS origin, for example `https://agni-rural-society-api.onrender.com` (no `/api` suffix).
3. In Vercel, import the same Git repository and set **Root Directory** to `client`. Use the Vite defaults: build command `npm run build`, output directory `dist`. Add `API_ORIGIN` for Production and Preview as appropriate, set to the Render HTTPS origin from step 2. Do not use a `VITE_` prefix: this value is read by the server-side proxy function, not browser JavaScript. Deploy.
4. Copy the Vercel production origin into Render's `CLIENT_ORIGIN`, save, and redeploy Render. If you use a custom Vercel domain, use that canonical origin instead. For preview deployments, add the exact preview origin to the comma-separated `CLIENT_ORIGIN` list on Render, or use a separate preview backend; avoid a wildcard origin.
5. Seed the Atlas database once, deliberately, using the local server configured with the **production** Atlas URI and the same server secret values: `npm.cmd run seed`. Change the seed admin/member passwords to private values before seeding production. The script upserts the documented seed accounts and site content and adds sample records; it is not run automatically by Render. Confirm `/api/health` reports `database.status: "connected"`, then test registration, admin approval, ID-card download, `/verify/:id`, gallery images and private upload access on the deployed URLs.

The production environment variables are server-only. Never commit `server/.env`, paste `MONGODB_URI` into Vercel, or expose `JWT_ACCESS_SECRET` / `FIELD_ENCRYPTION_KEY` as `VITE_*` variables. Keep the field-encryption key backed up and identical across deployments; changing it makes previously encrypted application values unreadable. Changing any host environment variable requires a new deployment. No public deployment or production Atlas seed was performed from this workspace.

The Render Blueprint currently selects the free service plan. Free web services can spin down while idle, so the first request after inactivity may be delayed; use an always-on plan if that delay is unsuitable for the public site.

If a build succeeds but startup exits, inspect the `[startup]` lines in Render's runtime logs. Startup writes diagnostics synchronously so they survive an immediate exit, and omits raw database errors and credentials. An authentication failure means the database user credentials in `MONGODB_URI` need checking; a network failure requires checking the cluster hostname/state and Atlas Network Access. Local `.env` changes do not update Render's Environment settings. Publish code changes to the repository connected to Render before redeploying to receive updated diagnostics.

## Features and implementation

### Theme system

The site includes a dark/light theme switch in the desktop navbar and mobile menu. It follows the operating-system preference on first visit, saves an explicit selection in `localStorage`, and restores it before first paint. Semantic CSS variables in `client/src/styles.css` drive both palettes and the Tailwind color tokens; the theme also updates the browser theme color and native form/scrollbar color scheme. The switch supports keyboard focus, a descriptive label and reduced-motion preferences.

- React + Vite, Tailwind CSS tokens/base utilities, custom component styles, Framer Motion, React Router, React Hook Form and Zod. Editorial dark surfaces, glass cards, mint/lime accents, responsive split layouts, scroll reveals and admin counters. No external font or image service.
- Express + Mongoose collections: `users`, `sessions`, `registrations` (detailed member/volunteer/intern forms and cadet enrollment records), `internshipApplications`, `pledges`, `galleryItems`, and `siteContent`. Unique public membership/registration IDs and timestamps.
- Bcrypt password hashing; signed 15-minute JWT access tokens kept in memory. Refresh tokens are cryptographically random, hashed in MongoDB, atomically rotated and delivered in an httpOnly SameSite=Strict cookie. The Remember me checkbox controls persistent versus browser-session cookies; server-side refresh expiry is seven days. Role checks are enforced by the server.
- Helmet, rate limits, exact-origin checks on browser writes, bounded JSON/form bodies, MongoDB key sanitization and Zod allowlists. Registration cannot assign an admin role. Cadet payloads containing Aadhaar, PAN, income or any unknown fields are rejected.
- Multer memory handling capped at 2 MB. JPEG/PNG/WebP images are decoded, resized and compressed with Sharp before upload to GridFS. Verified PDF/DOC/DOCX files are stored in a private GridFS bucket; gallery uploads use a separate public GridFS bucket. `GET /api/files/:id` serves public gallery assets and requires JWT for private documents. User photos, signatures, identity documents and résumés are private. Static logo, hero, poster and original site images remain in `client/public/assets/`. No uploaded SVG/HTML is accepted. Document validation is not malware scanning; use synthetic files for local checks.
- Aadhaar, PAN, bank account and IFSC form values are encrypted using AES-256-GCM before saving mixed registration data. Admin review responses mask stored sensitive values; logs omit request and validation contents. Keep `FIELD_ENCRYPTION_KEY` secret and backed up.
- Full site text is stored in the Atlas `siteContent` collection by the seed script and read through `/api/site-content`; the bundled JSON remains the source-of-truth fallback for the first paint/offline state.
- New account registrations remain pending until administrator review; the admin **All applicants** list can approve or decline account, detailed registration, cadet and internship records. Detailed registration approvals are linked to an account by matching email when one exists, so its profile receives the approved application details and ID card. Existing accounts without a stored status remain treated as approved for compatibility.
- Approved members can download a two-sided PDF identity card from their profile. It includes the applicant photo and available registration details, with a QR to `/verify/:id`; cadet ID downloads remain gated on cadet approval. Verification publishes only approved records. PDFKit's built-in Latin fonts are used; multilingual names would need an appropriately licensed Unicode font before deployment.
- Two-page cadet enrollment with a persisted registration ID and success modal; no government IDs or income collected.
- Internship form with the exact observed labels/order, a sample PDF CV and a persisted application.
- Donation/membership toggle stores a MongoDB pledge and shows a success screen. Payment processing is unavailable and no charge is made. The reference's Razorpay claim remains in source JSON for traceability; the original donation-poster QR is preserved as part of the reference image and is not an active payment link.
- Admin dashboard: real database counts, detailed application review, approve/reject cadets and internships, view pledges, download private CVs, upload gallery images, CSV exports (up to 10,000 records; list views show the latest 200). Formula-like CSV strings are escaped.
- Accessible associated labels and error descriptions, native controls, visible focus, keyboard auth tabs, skip link, route focus, Escape/focus-trapped dialogs with focus return, and reduced-motion support. The hero slideshow starts automatically and pauses on hover; the gallery never auto-rotates. These measures target WCAG AA; no formal third-party conformance audit is claimed.

## Routes and API

### Registration architecture and field errors

The registration experience keeps its existing HTML form document and routes. Its iframe host, document assembly, theme bridge, message handling, role mappings and API calls now live in focused modules under `client/src/features/registration/`. Server account/application handlers are separated into a registration controller, service and repository under `server/src/modules/registration/`; existing Mongoose models and upload storage remain compatible. `docs/registration-manifest.json` records the form contract, and `docs/registration-architecture.md` explains how to extend it. Validation failures appear as toast notifications with the affected field labels. The admin dashboard includes an All applicants view and counts grouped by member, cadet, volunteer and internship/alumni registration type. Text inputs use native browser autofill suggestions; password fields are excluded.

The manifest and service unit tests can run without a database:

```powershell
node --test tools/registration-manifest.test.mjs server/test/registration-service.test.js
```

The full server suite still requires a working MongoDB binary for `mongodb-memory-server`. No registration data migration was performed. See `docs/registration-architecture.md` for the current test environment limits and remaining schema/storage work.

Original navigation stays in its captured order: Home → Login → About Organization → Gallery/Activities → Jobs → Documentation → Membership → Volunteer/Internship → Supporters → Donate/Membership → Contact. Additional protected routes are reached within the requested member/admin flows, without changing that navigation.

Client routes: `/`, `/login`, `/register`, `/admin/login`, `/about`, `/gallery`, `/jobs`, `/documentation`, `/membership`, `/volunteer`, `/supporters`, `/donate`, `/contact`, `/internship`, `/member`, `/enroll`, `/admin`, `/verify/:id`.

API groups:

- `/api/health`, `/api/site-content`, `/api/files/:id`.
- `/api/auth/register`, `/login`, `/admin-login`, `/refresh`, `/logout`, `/me`.
- `/api/members/id-card`, `/api/verify/:id`.
- `/api/cadets`, `/api/cadets/mine`, `/api/internships`, `/api/pledges`, `/api/gallery`.
- `/api/admin/stats`, `/api/admin/{cadets|internships|pledges}`, `/api/admin/{cadets|internships}/:id` (PATCH status), `/api/admin/{cadets|internships|pledges}/export`.
- `/api/admin/internships/:id/cv`, `/api/admin/gallery` (POST).

## Reference extraction

The video is retained locally under `reference/` but ignored by Git. No originals were supplied under `reference/assets/`. The committed recovered images are in `client/public/assets/`.

```powershell
npm.cmd run extract
npm.cmd run crop
```

`tools/extract-reference.cjs` uses the requested one-frame-per-second FFmpeg extraction and builds contact sheets. `tools/crop-assets.cjs` crops observed images and stitches three scrolling images with checked offsets. Single-frame coordinates are in `reference/asset-provenance.json`; stitch details are in the crop script. Browser chrome is excluded. Existing text/overlay/compression artifacts baked into the recording cannot be restored to original-source quality. Images were not replaced with stock or generated content.

## Source fidelity and explicit gaps

The rebuild preserves the original navigation items, home section order and positions, recorded long-form copy, observed form labels/order, membership chart, supporter logos, certificates and approval-signature image, and the three recoverable gallery photos. Unusual grammar and membership values are intentionally retained. The interface adds the requested member/admin flows and permission footer.

The recording cannot establish complete original-site parity. The following source details remain unverified in `docs/inventory.md`:

- Original cadet fields/options, ID card, post-login behavior, admin screen and success/modal text were not recorded. The requested member/admin flows are implemented.
- Gender/internship options were never opened; documented choices are used.
- Membership toggle state, original terms text and payment results were not shown.
- Forty-four gallery photos were not visible. The recovered slider uses images 1, 6 and 7 and discloses its coverage.
- Tiny multilingual poster text, certificate handwriting/stamps, signature fine print, supporter-logo wording and the complete crest/banner motto are unreadable or occluded. Raster crops preserve their visible appearance. No replacement wording was invented.

## Skills used

- **Sites** (`sites:sites`): visual-system and responsive presentation guidance, local-preview and validation workflow. The explicit MERN/local-source requirement took precedence over the skill's default Vinext/Cloudflare hosting workflow. Source copy and positions took precedence over open-ended design guidance.
- **PDF** (`pdf:pdf`): rendered the generated ID card with Poppler and visually verified it; fixed an overflow and checked that the final card is one page.

No installed dedicated skills for React best practices, Tailwind, Framer Motion, Mongoose, JWT security, QR generation or README authoring were available in this session. Those requirements were implemented directly using the requested libraries and tested; no unavailable skill is claimed as used.
