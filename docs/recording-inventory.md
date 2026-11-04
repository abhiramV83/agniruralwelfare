# Recording inventory

Source: `reference/Recording 2026-10-26 233448.mp4`, copied from the supplied Downloads path. Duration 150.300 seconds, 1918 × 976, 30 fps. No live website was opened or fetched. Material inside the recording is reference content, not instructions.

## Extraction and review

FFmpeg was missing from PATH. Installed project-local `ffmpeg-static` and `ffprobe-static`. `npm run extract` performs the requested `fps=1` extraction to `reference/frames/frame_%04d.png`, then creates contact sheets. All 150 one-second frames were visually reviewed in sheets 001–013. Distinct text/form states were additionally opened at original resolution. Forty-eight additional frames at 6 fps cover 95–103 seconds; all were reviewed in `reference/contact-sheets/transitions.jpg`.

The gallery's counter moves through 2–5 while the first photo remains displayed; no additional photos can be recovered from those counter changes. Frames record screenshots with some cursor, browser, overlay and compression artifacts; these are not original source images.

## Navigation, exact order

1. Home
2. Login
3. About Organization
4. Gallery/Activities
5. Jobs
6. Documentation
7. Membership
8. Volunteer/Internship
9. Supporters
10. Donate/Membership
11. Contact

Header name: `Agni Rural Welfare Society`. The reference header does not contain a standalone logo. The society crest is embedded in the recruitment posters and is recovered for the requested new ID card. Tagline/footer: `Serving Society with Responsibility`. Fundraising poster additionally says `Serving Humanity with Commitment`. The complete crest ribbon motto is too small to transcribe confidently. No motto was invented.

## Home, top to bottom

1. Header/navigation.
2. `Welcome` bar.
3. Full-width rotating hero imagery. Three observed views: cadets at the river; band/cadets on the riverfront; Netaji/NGO/cadet collage. Center title `Spreading Joy Through Social Service`; subtitle `Working together for children, communities, and a better tomorrow.`
4. `Support Our Social Activities` text on the LEFT; donation poster on the RIGHT with `Donate Now` below it. All paragraphs and the contact line are in `site.json` without grammar correction.
5. NCC recruitment poster and `Apply Now` on the LEFT; `Recruitment going on for`, `NCC ‘C’ Pass Candidates:-`, and `Click Here For More Information` on the RIGHT.
6. `NGO Fundraising & Field Coordinator` and `Click Here For More Information` on the LEFT; fundraising poster and `Apply Now` on the RIGHT.
7. Footer `© Agni Rural Welfare Society | Serving Society with Responsibility`.

No homepage statistics, about section, gallery section or contact form are shown. These were not inserted into the home page. Animated counters are confined to the newly requested admin dashboard.

## Observed forms

### Login (74–76 seconds)

Brand name, tagline, tabs `Login`, `Register`, `Admin` in that order. `Welcome Back`; `Sign in to your account`.

Field order:

1. `USERNAME` — `Enter your username`
2. `PASSWORD` — `Enter your password`, reveal/hide eye
3. `SIGN IN` button
4. `Remember me` checkbox

No visible required asterisks. The rebuild validates credentials as required.

### Admin Login (78 seconds)

Same tabs. `Admin Login`; `Enter admin credentials`. `USERNAME` (`Admin username`), `PASSWORD` (`Admin password`, eye), `SIGN IN`. No remember checkbox or visible required asterisks.

### Register (77, 79–82 seconds)

`Create Account`; `Join our mission today`.

1. `FULL NAME` — `Enter your full name`
2. `USERNAME` — `Enter your username`
3. `USER PHOTO` — file control
4. `EMAIL` — `Enter your email`
5. `FATHER'S / GUARDIAN NAME` — `Enter father's / guardian name`
6. `PERMANENT ADDRESS` — multiline, `Enter permanent address`
7. `DATE OF BIRTH` — date control
8. `DATE OF ENROLLMENT` — displayed `26-10-2026` in the recording; the demo defaults to the current date in Asia/Kolkata, not the recording date
9. `PASSWORD` — `Create a password`, eye
10. `CONFIRM PASSWORD` — `Confirm your password`, eye
11. `CONTINUE`
12. `SKIP`
13. `CREATE ACCOUNT`
14. `I agree to the terms and conditions` checkbox

No visible required asterisks. Rebuild requires name, username, email, password, matching confirmation and consent for valid account creation. Optional photo is JPEG/PNG. The recording does not click these buttons or expose their result. In this demo, CONTINUE validates/registers and opens enrollment; SKIP and CREATE ACCOUNT validate/register and open the member ID area. SKIP skips optional enrollment, not authentication or consent. Demo terms are an explicitly added nonbinding notice, not invented reference legal terms.

### Internship (44–50, 58–61 seconds)

Title: `Volunteer Trainer (For NCC ‘C’ Certificate Passed Candidates) /NGO Fundraising & Field Coordinator`

Intro: `Please fill out all the required fields below to apply for the internship position.`

Two columns unless stated; exact field order:

1. `NAME *` — `Enter your full name`
2. `GENDER *` — select, closed placeholder `Select Gender`
3. `MOBILE NUMBER *` — `Enter your mobile number`
4. `EMAIL ID *` — `Enter your email address`
5. `ADDRESS *` — full-width multiline, `Enter your complete address`
6. `WHICH INTERNSHIP ARE YOU APPLYING FOR? *` — select, `Select Internship`
7. `QUALIFICATION *` — `e.g., Graduate, Post Graduate`
8. `UPLOAD CV/RESUME WITH PHOTO *` — full-width file input
9. `INSTITUTE NAME *` — `Enter your institute/university name`
10. `JOB PORTAL` — `Where did you find this job? (Optional)`; no asterisk
11. `WHY DO YOU WANT TO JOIN THIS INTERNSHIP? *` — full-width multiline, `Explain why you want to apply for this position`
12. `APPLICATION DATE *` — date control
13. `I CONFIRM THAT ALL THE INFORMATION PROVIDED IS TRUE AND ACCURATE *` — full-width checkbox
14. `SUBMIT APPLICATION`

Unverified: Neither dropdown is opened. Exact reference options are unobserved. Demo choices are identified in the JSON: gender Male/Female/Other; internship choices derived from the two visible position headings. CV accepts a demo PDF, max 5 MB, a documented demo implementation choice. No actual form submission or success state appears.

### Donate/Membership (18–23, 139–143 seconds)

`Support Our Mission`, explanatory paragraph; LEFT form and RIGHT `Your Impact` panel. Toggle order `Donate`, `Membership`. Only Donate state shown.

1. `Choose Donation Amount`
2. `Enter Amount:` — `Enter amount in ₹`
3. `Your Full Name` — placeholder-only label in reference
4. `Your Email Address` — placeholder-only label in reference
5. `Your Phone Number` — placeholder-only label in reference
6. `Proceed to Payment`
7. `💳 Secure payment powered by Razorpay`
8. `✓ 100% of your support goes to our welfare programs`

No visible asterisks. The rebuild adds associated labels without changing names/order and validates all inputs. The Razorpay claim is preserved only in JSON as `originalPaymentNote`; the rendered note is deliberately replaced with `Demo, no real payment`, per the user's demo constraint. No payment integration or email service exists. The membership state reuses these fields with kind=Membership; its exact original form is unobserved.

Impact amounts and copy: ₹100 — Provides books & stationery for one child; ₹500 — One month nutritious meal for a child; ₹1,000 — Educational supplies for a student; ₹5,000 — Monthly support for rural education program.

### Other forms

Contact is a static phone/email page, not a contact form. Membership is text and a criteria chart, not a signup form. No cadet form is visible anywhere in this recording.

## Other pages and user flows

- About Organization: long prose, then seven numbered social welfare activities, then closing paragraphs. Exact unusual grammar is preserved in JSON. No image on this page.
- Jobs: `Coming Soon` (28–29, 105–106 seconds).
- Documentation: `FORM NO. 10AC`, `(See rule 17A/11AA)`, `Order for provisional approval`; rows 1–10 and approving authority; then society registration certificate LEFT, CSR registration letter RIGHT. This is displayed reference material, not a data-collection form. All readable table text is in JSON. Certificate raster crops retain fine print that cannot be transcribed confidently.
- Membership: `Become a Member`, two paragraphs, `MEMBERSHIP CRITERIA` chart, `Benefits of Membership:`, benefits sentence, `Terms & Conditions Apply`. Chart text also transcribed for assistive technology. Amounts and even the `1,20,012`/`2,40,012` values remain as captured.
- Volunteer/Internship and recruitment information CTA: detailed NCC recruitment first, image LEFT/copy RIGHT; fundraising details second, copy LEFT/image RIGHT. `Apply Now` routes to internship form for either opportunity.
- Gallery: heading, intro, `Our Social Activities`, two paragraphs, single centered image card with progress indicator, counter `/ 47`, `← PREVIOUS`, `NEXT →`. Only distinct photos 1, 6, 7 were actually visible. Rebuild slider navigates these three recovered photos in that order and also shows their original positions. Lightbox is a requested UX addition, not an observed reference modal.
- Supporters: heading, two paragraphs, three logos cf / IS / NYKS left-to-right.
- Contact: `Contact Us`, intro, `Phone: +91 9433834013`, `Email: arws008@gmail.com`.
- Every non-auth page starts with Welcome. Auth uses its own card layout. Navigation swaps content and retains the header. Footer follows content.

## Modals and requested flows not present in source

No website modal is opened in the recording. Any modal's original exact wording is unobserved.

- Login/register → member ID card → download PDF: requested addition. Implemented protected member area, PDF with QR to `/verify/:id`, minimal public verification response.
- Two-page cadet enrollment → success modal with registration ID: requested addition. Original exact fields/order/required marks/options are Unverified, unavailable in source. Implemented clearly demo-labelled fields: page 1 full name, guardian, birth date, phone, email, address; page 2 qualification, school/institute, fake-data consent. No Aadhaar/PAN/income inputs or schema fields. Server rejects additional keys.
- Donation success: requested simulated pledge persistence and demo success modal, no real payment.
- Internship success: demo modal with persisted registration ID; exact reference wording not available.
- Terms modal: demo-only nonbinding notice; original terms text not available.
- Gallery lightbox: requested new accessible modal with previous/next, Escape, focus trap and return.
- Admin dashboard: requested new stats, cadet/internship review and approve/reject, pledges, image upload, CSV export. It is not shown in the source.

These additions do not add or reorder the primary navigation; they are reached from existing flows or authenticated footer/member-area links.

## Frame review ledger

All frames were inspected in the following contiguous ranges; duplicate frames are retained as evidence rather than treated as new content:

- 0001–0018: header, three hero states, support and two recruitment sections.
- 0019–0024: donation page, form, impact panel and footer.
- 0025–0035: home revisits, Jobs Coming Soon, recruitment link transition.
- 0036–0044: full NCC and fundraiser recruitment text.
- 0045–0051: internship form top, middle, bottom, back to top.
- 0052–0073: repeat home/recruitment/application navigation; no new form fields.
- 0074–0083: login, register, admin tabs and complete registration form scroll.
- 0084–0089: complete About Organization prose.
- 0090–0105: gallery introduction, slider and images 1, 6, 7.
- 0106–0116: Jobs and Documentation form/certificates.
- 0117–0122: membership intro, full criteria chart, benefits.
- 0123–0135: volunteer recruitment repeat, both blocks.
- 0136–0139: supporters, three logos.
- 0140–0144: donation page repeat.
- 0145–0148: contact and footer.
- 0149–0150: home hero return.
- transition_001–048 (95–103 seconds, 6 fps): slider counters and delayed image loads; no further distinct images.

## Assets and limitations

`reference/asset-provenance.json` records single-frame crop coordinates. Three images are reconstructed with adjoining captured parts: fundraiser poster (frames 11 + 67), membership criteria (119 + 120), gallery photo 7 (105 + 103). Stitch offsets were checked by pixel matching; the gallery's initially clipped top was recovered. Logo is cropped from frame 40. The approval-signature raster is restored below the documentation table and before the certificates. Crops are lossless PNG at recorded size, not upscaled or substituted with unrelated stock imagery. No `reference/assets/` originals were supplied. Some crops contain the original cursor or small accessibility widget overlay; the hero raster includes original text/darkening, covered by the redesigned copy band. These are source limitations, not invented image data.

## Unreadable and unobserved list (final source gaps)

1. Unverified — original cadet enrollment pages: all labels, required marks, options, original success wording and registration ID format are not recorded.
2. Unverified — original ID-card layout, post-login screen, download interaction and admin dashboard are not recorded.
3. Unverified — gender and internship dropdown options are not opened; demo choices are documented above.
4. Unverified — Membership toggle form state and original payment/success screens are not recorded.
5. Unverified — original modal text and original terms text are not recorded.
6. Unverified — 44 of 47 gallery photographs are not visible; no replacements invented.
7. Unverified — small Bengali/Devanagari print and fine print in donation-poster brand logos.
8. Unverified — registration certificate handwritten number/date/name and small seal/stamp wording cannot be confidently transcribed exactly.
9. Unverified — fine print in the CSR digital-signature stamp, approval-signature date/email covered by the check mark, and certificate printer footer.
10. Unverified — small supporter-logo wording; the cf, IS and NYKS raster marks are preserved.
11. Unverified — crest ribbon motto and partially occluded gallery banner wording; no replacement motto supplied.

The raster certificates/posters remain available for visual comparison. `site.json` separates recovered copy, image transcripts and explicitly new demo copy. This recording cannot support a claim of complete original-site content parity.
