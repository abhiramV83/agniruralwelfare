# Registration refactor log

Date: 2026-11-03

- Captured the pre-change visible form contract in `registration-manifest.json` and added a static contract test before moving responsibilities.
- Split the React page host from iframe bridge behavior, theme synchronization, registration role mapping and API calls.
- Moved account/application request handling out of the Express app factory into a registration controller; extracted generic application parsing/persistence into service and repository modules.
- Kept all existing routes, local uploads, Mongo schemas, admin routes and form source files in place.
- Replaced browser alert-based registration feedback with the existing site toast provider and field-name lookup; this does not change the embedded form fields or wording.
- No stored Mongo records or uploaded files were migrated, renamed, or deleted.

See `registration-architecture.md` for the current module map and verification limits.
