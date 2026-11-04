# Current registration architecture problems

Audit date: 2026-11-03. This is an inventory of structure and behavior before the architecture refactor; the post-extraction status is at the end.

## Frontend

- Before extraction, `client/src/RegistrationPortal.jsx` owned theme-token forwarding, iframe document construction, the iframe runtime, parent message handling, account API mapping, attachment filtering, submission state and feedback. It now acts as the iframe host, with those responsibilities split into feature modules documented in `registration-architecture.md`.
- Registration markup and all four detailed forms live in one 500-line `client/src/content/registration-reference.html`; a ~9,000-line legacy bundled stylesheet plus `registration-theme.css` styles the iframe.
- The main form schema/configuration for the alternate React Hook Form registration flow is embedded in `client/src/workflows.jsx` as a large `registrationDetails` object, while the actual visible form is separately defined in static HTML. The two definitions can drift.
- Runtime-injected fields (blood group, profile photo and helper fields) are not part of the static HTML or a shared typed definition.
- Message types between iframe and parent are plain string literals and payloads have no shared contract.
- State/district, date autofill, preview lifecycle, toggle, navigation, validation and submit behavior are embedded in global iframe functions. Some preview object URLs are not revoked.
- Validation rules are split among HTML attributes, iframe checks, client Zod schemas, and server Zod schemas. They do not describe every registration field consistently.
- The iframe hosts the form while React owns server submissions. Error mapping and native HTML validation are separate paths.
- Prior to the toast work, iframe validation used browser `reportValidity()` and server errors used `alert()`. Toast feedback now lives in a shared provider, and the parent bridge has been extracted into a feature hook.

## Backend and data

- Before extraction, `server/src/app.js` contained account registration and generic registration application handlers alongside the other APIs. Those two handlers now delegate to `server/src/modules/registration/`; cadet, internship and unrelated routes remain in the app factory.
- Registration behavior is split between `User`, `Cadet`, `Internship`, and the generic `RegistrationApplication` schemas in `server/src/models.js`; the frontend generic form submission writes `RegistrationApplication` records while legacy Cadet and Internship routes use dedicated schemas.
- `server/src/validation.js` mixes auth, pledge, cadet, internship and account schemas. The generic `RegistrationApplication.data` payload is only filtered by key pattern and string length; it has no per-type field allowlist/schema.
- The browser form endpoint (`/api/registration-applications`) stores uploads as local filesystem paths, while legacy routes store local upload paths in distinct model properties. `server/src/uploads.js` performs memory parsing, validation/normalization and local filesystem persistence in one module.
- Generic registration application records and dedicated Cadet/Internship records follow different admin-reading paths. Any extraction must preserve the routes and the records already expected by existing admin screens.
- Several source fields are deliberately excluded from submission (Aadhaar, PAN, income, bank-account and IFSC keys). This privacy behavior must remain; the refactor must not start collecting those values.
- A client/server registration module boundary now exists. There is still no shared client/server schema package, migration, per-type allowlist schema for generic application fields, or shared typed message contract.

## Existing constraints to protect

- Keep all visible source form text, labels, fields, options, order, odd numbering, required flags, helper text, upload controls, preview behavior, state/district behavior, enrollment-date behavior, Back transitions, member simulated payment and success behavior intact.
- Preserve `/api/auth/register`, `/api/cadets`, `/api/internships`, `/api/registration-applications`, and admin compatibility while adding any better-organized aliases.
- Preserve local upload compatibility until an explicit and tested migration/storage adapter exists. No real Aadhaar/PAN/income information may be collected.
- The generated baseline is `docs/registration-manifest.json`; the contract suite must run against this pre-refactor snapshot before source moves begin.

## Post-extraction status

- `RegistrationPortal.jsx` hosts the existing form document; feature modules own theme sync, messaging, API calls and role mappings.
- Account and generic application handlers keep the same URLs and now use registration controller/service/repository modules.
- The detailed HTML/CSS form and existing Mongoose model remain unchanged.
