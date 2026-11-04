# Registration reference audit

## Audit basis

Compared the current Register implementation in `client/src/workflows.jsx`, its field copy in `client/src/content/site.json`, the existing Cadet two-page form, and the registration API/model (`server/src/validation.js`, `server/src/models.js`, `server/src/app.js`) against the user-provided registration specification.

The exact path named in the pasted request (`reference/registration/AGNI_RURAL_SOCIETY_AI_STYLED_HOME.html`) and its screenshot directory are absent. The workspace does contain `reference/AGNI_RURAL_SOCIETY_GALLERY_ACTIVITIES_ENHANCED.html`, which includes the matching Create Account panel, four detailed registration forms, registration type dropdown, scripts, district data and matching copy. The implementation was checked against that equivalent source and the full pasted specification. No screenshot directory was supplied.

## Current flow

- `AuthPage` uses one shared three-step Register panel. Login and Admin share the component but their field definitions and handlers are separate.
- Registration type is currently a select in the account form. It is not the reference's lower accordion with four role buttons and selected-role summary.
- Member, Volunteer, and Intern details are currently assembled from a partial `registrationDetails` object in `workflows.jsx`; account submission stores its answers in `User.registrationDetails`.
- Cadet selection creates the account and then navigates to the existing `/enroll` form. That form is split across two pages and submits to `/api/cadets`.
- Registration uploads currently go through Multer and local storage. Some profile, CV, supporting-document, and signature uploads have been added, but this is not equivalent to the reference's upload cards and preview behavior.

## Baseline gap audit (before this implementation pass)\n\n## Field-by-field comparison

### A. Create Account panel

| Reference requirement | Current implementation |
| --- | --- |
| `registerPanel`; centered 20px/#103375 heading; two-column layout | Uses the shared auth card and current theme styles; no `registerPanel` identity or reference-specific sizing/layout. |
| Hidden `accountType` role, default Member | Uses visible `registrationType` select with different option labels/values. |
| Exact 12-field order including state then district with dependent district data | Current account fields are the existing account fields: registration type, name, username, profile photo, email, guardian, permanent address, blood group, DOB, enrollment date, password and confirmation. No state/district fields or dependent lists. |
| Exact labels/placeholders, full-width fields, unnumbered labels without asterisks | Current labels/placeholders come from `site.json` and differ; shared `Fields` layout is single-column in this panel. |
| Password toggle, photo preview and script autofill | Password toggle exists globally; account photo preview and source-equivalent autofill are not implemented. |
| `Register Now` | Uses the existing create-account action and extra registration continuation behavior. |

### B. Registration-type selector

| Reference requirement | Current implementation |
| --- | --- |
| Selector below forms; exact toggle text, arrow, `aria-expanded`, subtitle and role summary | No selector below forms, role summary, or reference toggle/show-hide handlers. |
| Four exact role buttons, Member active by default | Current control is an inline select with singular/plural labels different from the reference. |
| Back button returns to selector and hides the chosen form | Existing Back only changes the shared wizard step; it does not restore a role selector. |

### C. Member form and D. payment screen

| Reference requirement | Current implementation |
| --- | --- |
| Dedicated hidden Member form, specified hero and back button | No separate Member form shell/hero. Uses the shared account wizard and inline fields. |
| 01–07 sections in exact order; numbered labels; full Personal Information and Address & Identification fields | Partial sections exist in `registrationDetails`; order, numbering, field names, labels, placeholders, required marks and options do not match. State/district and the full first section are absent. |
| Child Yes/No radios, default No, conditional 1–3 child rows | Has a text field and select, no conditional rows or matching radio behavior. |
| Payment/contribution chips and exact bank labels | Chips exist, but payment field label/order and some labels differ from the reference. |
| Exact required-document list, multiple upload and applicant signature card with preview | Current Member has one optional supporting upload and optional image signature; no exact list, multiple upload, PDF signature, preview placeholder/button/caption, or exact declaration. |
| Collapsible Membership Terms and Conditions with five verbatim headings | Not implemented. |
| Exact success banner and submit label | Current success is the shared auth/session flow; no Member registration success banner/button. |
| Separate fee screen for ₹650, simulated Razorpay action, success message and saved registration | Not implemented. Current auth registration immediately creates a user/session and navigates to the member page. |

### E. Cadet form

| Reference requirement | Current implementation |
| --- | --- |
| Dedicated Cadet shell/hero/back button and screenshot section labels | Existing `/enroll` form now has grouped sections and a two-page stepper, but not the exact hero, badge, text, typography, or back-to-registration-type action. |
| Exact fields 1–29, labels, required marks, numbering and order | Existing form has 38 field definitions, including recent additions, but field order/numbering/labels and required marks do not match. It lacks the exact `Citizenship` choices and several exact label strings. |
| Aadhaar number and parent annual income fields as in the reference | Not present. These are restricted elsewhere in the conversation; do not add or persist real values without resolving that conflict. |
| Four required document cards (cadet photo, qualification proof, cadet Aadhaar, guardian Aadhaar) | Current form has a photo and optional qualification proof; no four-card layout or Aadhaar document cards. |
| Verbatim declaration points 22–25, required guardian/cadet signatures, place/date | Declaration copy is partial; signature uploads are optional; current labels and required marks differ. |
| Parent declaration, final confirmation, exact success and buttons | Parent/final checkboxes and copy exist partially; exact copy/actions and Back to Registration Types behavior do not. |

### F. Volunteer form

| Reference requirement | Current implementation |
| --- | --- |
| Dedicated hero, subtitle, org name and top Back | No separate Volunteer form shell/hero. Details appear in the shared auth wizard. |
| Five exact groups and field order/labels/required marks | Many fields/groups exist, but exact order and labels differ; the account wizard also interleaves account fields. |
| Exact Occupation, Preferred Time, Hours, Commitment, and `How did you hear about us?` options | The previous lists were incomplete or empty. The implementation pass now copies the source options. |
| Recent Applicant Photograph card/helper and Supporting Document card/helper | Uses shared required account photo plus a supporting document upload; not the reference cards, exact helpers, or upload placement. |
| Exact declaration note, success and submit/after-submit labels | Declaration text is approximate; note and success/button states are absent. |

### G. Intern form

| Reference requirement | Current implementation |
| --- | --- |
| Dedicated Internship hero, badge, subtitle and back button | No separate Intern form shell/hero in Register. |
| Five exact groups and field order | Many fields exist, but group labels/order and some labels differ; account fields are shared/interleaved. |
| Month input for Expected Graduation | Uses a date input, not month. |
| Exact Preferred Area, Mode, Hours, Academic Credit options | The previous options were incomplete; the implementation pass now copies the source options. |
| Exact text/url placeholders and long experience placeholder | Several are absent or differ. |
| Required résumé `.pdf/.doc/.docx` and optional work sample | Current CV accepts extra image types; work sample accepts extra types; cards/helpers are not reference-equivalent. |
| Verbatim declaration, note, success and submitted button state | Not implemented exactly. |

### Script-generated behavior and styling

- Automatic numbering, dependent state/district selects, dynamic child rows, account/form show/hide, role back behavior, source date autofill, upload previews and exact password toggle behavior are not reproduced.
- Blood Group cards and credential notices are not injected into all four forms as specified.
- Existing styles use the project's theme-aware surfaces, not the reference's exact mint/white card palette, numbered section circles, dashed upload cards and gradient hero headers.
- The source's script-injected text, full Membership Terms, required-document list, precise district data and some long notes cannot be recovered from the pasted summary. They require the missing HTML source.

## Scope status

Login/Admin and non-registration pages were not changed in this audit. The next implementation pass must stay within the registration panel, role selector, Member/Cadet/Volunteer/Intern forms, their submission flow, and registration-only API/model/upload changes.


## Implementation update (2026-10-30)

- Replaced the inaccurate shared three-step Register rendering with the source registration panel and its four form layouts, preserving the source markup, labels, choices, required marks, section order, and styling in an isolated registration frame. Login and Admin continue through their prior auth UI.
- Added the complete state-to-district data used by the source and restored the source's role selector, back behavior, dependent district select, date autofill, child rows, password visibility, photo preview, signature preview, and form submission affordances.
- Connected Create Account to the existing `/api/auth/register` flow. Added a registration application collection and a public, rate-limited registration endpoint for the four detailed forms. Registration uploads are saved using the existing upload validation and local upload storage.
- Sensitive form values whose keys contain Aadhaar/Aadhar, PAN, income, bank account, or IFSC are filtered in the browser and again by the API before persistence. Files named as Aadhaar/Aadhar/PAN documents are not uploaded. The fields remain visible for visual parity; use fictional values only.
- Member payment is simulated. The reference payment panel's Razorpay claims were replaced with clear no-charge demo wording and the original button now submits to the application endpoint. No payment SDK is loaded.

## Remaining verification

- The named screenshot references were not present, so there is no true side-by-side visual comparison against those images. Only the user's pasted screenshots/specification and the equivalent HTML source are available.
- Playwright was attempted at 1920px using the existing Playwright Core package. Chrome could not open the local Vite URL (`ERR_NETWORK_ACCESS_DENIED`), and Windows Computer Use stopped because it could not confidently determine the browser URL. No screenshots were produced; `docs/screenshots/registration/` is empty.\n- `npm run build` is blocked by this workspace sandbox with `EPERM` resolving `client/src/main.jsx`. An esbuild bundle syntax check passed. Form submissions still require the API and MongoDB connection; this session does not have the deployment Mongo URI.
- Generic detailed registration applications are stored in `RegistrationApplication`; the existing admin dashboard has no UI for this new collection. This registration-only pass does not alter Admin, per scope.


