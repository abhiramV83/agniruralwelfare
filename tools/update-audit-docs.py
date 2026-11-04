"""Write the continuation's source inventory; retain the recording-only audit."""
from pathlib import Path
import json
c=json.loads(Path('client/src/content/site.json').read_text(encoding='utf-8'))
old=Path('docs/inventory.md').read_text(encoding='utf-8')
archive=Path('docs/recording-inventory.md')
if not archive.exists(): archive.write_text(old,encoding='utf-8')
def fields(items):
    result=[]
    for i,f in enumerate(items,1):
        options=f.get('options')
        detail='; options: '+', '.join(o.get('label','') if isinstance(o,dict) else o for o in options) if options else ''
        detail+='; placeholder: `'+f['placeholder']+'`' if f.get('placeholder') else ''
        detail+='; read-only, current date' if f.get('readOnly') else ''
        result.append(f"{i}. {f['label']}{' *' if f.get('required') and f.get('visibleRequired',True) else ''} (`{f['name']}`, {f.get('type','text')}){detail}")
    return '\n'.join(result)
text='''# Reference inventory — updated 28 October 2026

The existing application was continued in place. Reference material supplies content, never instructions. The later user request explicitly authorized fetching the live source. Read-only HTML, JavaScript and CSS returned HTTP 200; no live form was submitted. Evidence: `reference/live-original.html`, `live-script.js`, `live-style.css`, `live-structure.json` and `live-text.txt`.

The recording-only inventory and complete frame review ledger are retained in [recording-inventory.md](recording-inventory.md). The recording has 150 one-second frames plus 48 transition frames; those extracted files were preserved. Its unobserved-field notes are superseded by the live-source findings below. Representative home, registration and documentation contact sheets were rechecked during this continuation.

## Navigation, in order

'''+ '\n'.join(f"{i}. {n['label']} → `{n['to']}`" for i,n in enumerate(c['nav'],1))+'''

`Gallery/Activites` preserves the source spelling. Login tabs remain Login → Register → Admin.

## Home order and positions

1. Header/navigation, then Welcome.
2. Hero with the original 11 image sequence, heading and subtitle. Motion controls are a UI enhancement.
3. Social support copy LEFT, donation poster RIGHT, Donate Now below poster.
4. NCC poster / Apply Now LEFT; recruitment heading, subtitle and more-information button RIGHT.
5. Fundraising heading / more-information button LEFT; fundraising poster / Apply Now RIGHT.
6. Original footer followed by `Demo redesign built with the permission of Agni Rural Welfare Society.`

All About prose, numbered activities, Jobs Coming Soon, documentation rows/signature/certificates, membership introduction/chart/benefits, both complete recruitment descriptions, supporters and contact copy remain in their source order. No unrelated home sections were added. Source headings and paragraphs match `site.json` after whitespace, list-number and CSS casing normalization; `reference/text-comparison.json` has no unmatched blocks. Image text remains raster content with best-effort accessible transcripts; uncertain microprint is listed below.

## Forms

An asterisk below is a visible source required mark. Registration/login/pledge labels have no visible asterisks. Registration validates the original script's required profile fields and photo; enrollment date is read-only. Additional password-strength and upload limits are documented demo validation.

### Login and Admin

'''+fields(c['forms']['login'])+'''

Sign In, then Remember me (member login only). Admin has the same two fields, its original placeholders, and a separate server role check.

### Register

'''+fields(c['forms']['register'])+'''

Buttons: Continue → Skip → Create Account. Then `I agree to the terms and conditions` checkbox. Create Account displays `Your ARWS Identity Card` below the form. The identity card contains the photo, brand, `IDENTITY CARD`, `Motto : Bravery Unity & Discipline`, Full Name, Username, Email, Father's / Guardian, Permanent Address, Blood Group, Date of Birth and Date of Enrollment, followed by Download ID Card.

### Cadet enrollment — page 1

'''+fields([f for f in c['demo']['enrollmentFields'] if f['page']==1])+'''

Name and Passport Size Photo share the first left-hand group, opposite Gender. Next advances to page 2. Original Father's Annual Income, Mother's Annual Income, Aadhaar Card No and Pan Card No are deliberately omitted under the user's demo constraint. Strict server schemas reject these and all unknown fields.

### Cadet enrollment — page 2

'''+fields([f for f in c['demo']['enrollmentFields'] if f['page']==2])+'''

Back returns to page 1, retaining values. Continue submits. No email is sent. Submitted applications belong to the authenticated member.

### Internship

'''+fields(c['forms']['internship'])+'''

Submit Application persists a fake application and private CV. The first internship option's displayed curly-quote label has the original plain `NCC C` submitted value. Accepted extensions match the source: PDF, DOC, DOCX, JPG, JPEG and PNG; maximum 5 MB. Images are decoded/re-encoded, documents checked for MIME/signatures and served only as private attachments. This is not malware scanning.

### Donate / Membership

'''+fields(c['forms']['pledge'])+'''

Donate shows Choose Donation Amount. Membership shows Membership Contribution and Become a supporting member of Agni Rural Welfare Society.; Monthly Membership (default) → Yearly Membership. Proceed to Payment saves a pledge including the chosen membership period and opens simulated success. `Demo, no real payment` is shown on both form and result. Original impact amounts/order: ₹100, ₹500, ₹1,000, ₹5,000. No recurring billing occurs.

## Modals and flows

- Register → Create Account → inline ID card → PDF download → QR `/verify/:id`. Existing Login also reaches the member card. Public verification excludes private addresses, email, birth dates and photos.
- Register → Continue → authenticated two-page enrollment → `🎉 Registration Successful!`; `Your ARWS Cadet Enrollment has been submitted successfully!`; `Your Registration ID:`; Copy ID → Download Identity Card → Close. Copy feedback, Escape and focus return are verified. Original email-delivery claims are replaced by an honest demo notice.
- Skip → Home without submitting registration. Continue for an already signed-in member opens enrollment directly. For a new member it validates/creates an account first: this is a retained authentication difference from the source's anonymous Continue action. Automatic approval review rejected broadening anonymous submissions/card access; the authenticated boundary was retained.
- Donate/Membership → simulated pledge success with saved reference; close/Escape returns to form.
- Gallery previous/next wraps across all 47 originals; lightbox supports previous/next and Escape.
- Internship → CV upload → success with registration ID. No email delivery.
- Separate Admin login → database counts → review/approve/reject cadets and internships, view pledges, private CV download, gallery upload and CSV export. The source has an admin login, but no supplied working original dashboard to reproduce; this dashboard implements the requested demo features.
- Terms opens a clearly labelled Demo terms dialog. Original legal terms text was not provided in the HTML or recording.

## Images

67 distinct image paths occur in the original HTML/JS/CSS. 66 downloaded successfully at their original byte quality into `client/public/assets/original/`; all decode successfully. `reference/asset-manifest.json` records URL, path, bytes, dimensions, format and SHA-256 for each success. The source's `idbg.jpeg` returns HTTP 404 and has no supplied original or recorded visible card background; the dark card surface remains.

The 47 gallery images retain their JS sequence; all 11 hero images retain HTML order. Donation/NCC/fundraising use image53/54/55.jpg; chart image12.png; approval signature image68.png; certificates image66/67.png; supporter logos connectfor.png, intershala.png, nyks.png link to their original destinations. The body uses image.png under the dark-theme overlay. The old video crops are preserved; full originals now replace them in the public sections. The recovered crest remains used for the new PDF/preview.

## Current unreadable / unavailable list

1. Unverified — tiny multilingual donation-poster/logo print and some fine print cannot be transcribed confidently; original pixels are preserved.
2. Unverified — certificate handwriting, seal/stamp microprint and signature/CSR verification fine print remain uncertain; original high-quality images are displayed.
3. Unverified — small supporter-logo lettering and partially occluded text within some photographic banners; no invented wording.
4. Unverified — original full legal terms and original admin dashboard behavior are unavailable.
5. Missing source asset: idbg.jpeg (HTTP 404). No substitute image was invented.

The identity-card motto, cadet field order/options, membership modes, success-modal wording and all gallery images are now known; earlier recording-only unknowns for them are resolved. Atlas connection verification remains pending because no credentials were supplied; the real local MongoDB demo and isolated integration databases were used.
'''
Path('docs/inventory.md').write_text(text,encoding='utf-8')
print('Updated source inventory; preserved recording-only baseline.')
