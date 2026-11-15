import registrationMarkup from "../../content/registration-reference.html?raw";
import registrationCss from "../../content/registration-reference.css?raw";
import registrationThemeCss from "../../content/registration-theme.css?raw";
import statesAndDistricts from "../../content/state-districts.js";

const registrationIcons = {
  "👁️": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  "📷": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-2-3Z"/><circle cx="12" cy="13" r="4"/></svg>',
  "📎": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m21.4 11.1-8.5 8.5a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>',
  "🔒": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></svg>',
  "💳": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
  "📄": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>',
  "🪪": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5 16c.7-2 5.3-2 6 0M14 9h5M14 13h5"/></svg>',
  "🤝": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 12 3 3a2 2 0 0 0 3 0l5-5M3 11l5-5 4 2 3-1 6 5-4 5-3-2M3 11l-1 5 4 3 3-3M8 6 5 4 2 7l3 4M16 7l3-3 3 3-3 4"/></svg>',
  "🎓": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m2 10 10-6 10 6-10 6-10-6Z"/><path d="M6 12v5c4 3 8 3 12 0v-5M22 10v6"/></svg>',
  "🗂": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 9h18"/></svg>',
  "📋": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/></svg>',
  "👥": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></svg>',
  "🎖️": '<svg class="registration-inline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="m8 14-2 8 6-3 6 3-2-8M12 6v6M9 9h6"/></svg>',
};

export function createRegistrationDocument() {
    const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const themeTokenNames = ["--bg", "--surface", "--surface-elevated", "--border", "--text", "--text-muted", "--primary", "--accent", "--on-primary", "--photo-text", "--photo-accent", "--success", "--danger", "--overlay", "--shadow", "--glow", "--amber", "--radius", "--input-bg", "--input-border", "--registration-border", "--focus-ring", "--info-bg", "--info-border", "--info-text", "--warning-bg", "--warning-border", "--warning-text", "--success-bg", "--success-border", "--success-text", "--danger-bg", "--danger-border", "--hero-start", "--hero-mid", "--hero-end"];
    const themeTokens = Object.fromEntries(themeTokenNames.map((name) => [name, getComputedStyle(document.documentElement).getPropertyValue(name).trim()]));
    const rootThemeStyle = `:root{${Object.entries(themeTokens).map(([name, value]) => `${name}:${value}`).join(";")};color-scheme:${theme}}`;
    let markup = registrationMarkup
      .replace('id="registerPanel" class="auth-panel"', 'id="registerPanel" class="auth-panel active"')
      .replace("Complete the required payment securely through Razorpay to submit your application for administrator verification.", "Complete this demo payment step to submit your application for administrator verification.")
      .replace("🔒 Razorpay Secure Checkout", "Demo, no real payment")
      .replace("💳 UPI / Card / Net Banking / Wallet", "No charge will be made")
      .replace("Your application is sent to the Administrator Portal only after Razorpay payment is successfully verified. A cancelled or failed payment does not submit the application.", "Important: This demo does not process real payments. Selecting Proceed to Payment records the registration without charging you.")
      .replace("✓ Payment verified successfully. Your Member registration has been submitted to the Administrator Portal for verification and approval.", "✓ Demo payment recorded. Your Member registration has been submitted to the Administrator Portal for verification and approval. No real payment was made.")
      .replace(/onsubmit="event\.preventDefault\(\); alert\('Account Created Successfully!'\);\s*closeAuth\(\);"/, 'onsubmit="event.preventDefault()"')
      .replace("Pay ₹650 Securely with Razorpay →", "Proceed to Payment →");
    for (const [emoji, svg] of Object.entries(registrationIcons)) markup = markup.replaceAll(emoji, svg);
    const runtime = `
      const $=(s,root=document)=>root.querySelector(s), $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
      let pendingMember=null;
      function send(type,form){ const fd=new FormData(form); const entries=Array.from(fd.entries()).filter(([,v])=>typeof v==='string'); const files=Array.from(fd.entries()).filter(([,v])=>v instanceof File && v.size).map(([name,file])=>({name,file})); parent.postMessage({type,formId:form?.id,entries,files},'*'); }
      function validateForm(form){
        if(form && form.id === 'standardRegisterForm'){
          const passInput = $('#regPassword');
          const confirmInput = $('#regConfirmPassword');
          const pass = passInput ? passInput.value || '' : '';
          const confirm = confirmInput ? confirmInput.value || '' : '';
          if(!pass){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password is required.']},'*');
            return false;
          }
          if(pass.length < 8){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password must contain at least 8 characters.']},'*');
            return false;
          }
          if(pass.length > 64){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password cannot exceed 64 characters.']},'*');
            return false;
          }
          if(!/[A-Z]/.test(pass)){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password must contain at least one uppercase letter (A–Z).']},'*');
            return false;
          }
          if(!/[a-z]/.test(pass)){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password must contain at least one lowercase letter (a–z).']},'*');
            return false;
          }
          if(!/[0-9]/.test(pass)){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password must contain at least one number (0–9).']},'*');
            return false;
          }
          if(!/[^A-Za-z0-9]/.test(pass)){
            passInput.setAttribute('aria-invalid','true');
            passInput.focus({preventScroll:true});
            passInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Password must contain at least one special character (!@#$%^&* etc.).']},'*');
            return false;
          }
          if(!confirm){
            confirmInput.setAttribute('aria-invalid','true');
            confirmInput.focus({preventScroll:true});
            confirmInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Please confirm your password.']},'*');
            return false;
          }
          if(pass !== confirm){
            confirmInput.setAttribute('aria-invalid','true');
            confirmInput.focus({preventScroll:true});
            confirmInput.scrollIntoView({behavior:'smooth',block:'center'});
            parent.postMessage({type:'registration-validation',fields:['Passwords do not match. Please enter the same password twice.']},'*');
            return false;
          }
        }
        const invalid=Array.from(form.elements).filter(el=>el.willValidate&&!el.checkValidity());
        if(!invalid.length)return true;
        invalid.forEach(el=>el.setAttribute('aria-invalid','true'));
        const labels=[...new Set(invalid.map(el=>{const group=el.closest('.member-field,.cadet-field,.program-field,.auth-group,.cadet-upload-card,.program-upload-card,fieldset');const label=el.labels?.[0]?.textContent||group?.querySelector('label,h4,legend')?.textContent||el.getAttribute('aria-label')||el.name||'Required field';return label.replace(/\\s+/g,' ').replace(/^(?:[0-9]+[.)]\\s*)+/,'').replace(/\\s*\\*\\s*$/,'').trim();}))];
        invalid[0].focus({preventScroll:true});
        invalid[0].scrollIntoView({behavior:'smooth',block:'center'});
        parent.postMessage({type:'registration-validation',fields:labels},'*');
        return false;
      }
      function toggleRegisterTypeDropdown(){const box=$('#registerTypeDropdown');const t=$('.role-dropdown-toggle');const open=box.classList.toggle('open');t.setAttribute('aria-expanded',String(open));}
      function sendHeight(){
        const panel=$('#registerPanel');
        if(!panel)return;
        const rect=panel.getBoundingClientRect();
        const h=Math.ceil(rect.height || panel.offsetHeight || 900);
        parent.postMessage({type:'registration-height',height:Math.max(350,h+24)},'*');
      }
      function normalizeRole(role){
        if(!role) return 'Member';
        const r = String(role).replace(/^Register\s+/i,'').trim();
        if(/cadet/i.test(r)) return 'Cadet';
        if(/volunteer/i.test(r)) return 'Volunteer';
        if(/intern/i.test(r)) return 'Intern & Alumni Member';
        return 'Member';
      }
      function syncFromStandardToRole(role){
        role = normalizeRole(role);
        const name = $('#regFullName')?.value || '';
        const username = $('#regUsername')?.value || '';
        const email = $('#regEmail')?.value || '';
        const guardian = $('#regGuardian')?.value || '';
        const dob = $('#regDOB')?.value || '';
        const blood = $('#regBloodGroup')?.value || '';
        const state = $('#regState')?.value || '';
        const district = $('#regDistrict')?.value || '';
        const fullAddress = [district, state].filter(Boolean).join(', ');

        if(role === 'Member'){
          const f = $('#memberForm');
          if(f){
            if(name) { const el = f.querySelector('[name="memberName"]'); if(el) el.value = name; }
            if(email) { const el = f.querySelector('[name="memberEmail"]'); if(el) el.value = email; }
            if(guardian) {
              const g = f.querySelector('[name="guardianName"]'); if(g) g.value = guardian;
              const fn = f.querySelector('[name="fatherName"]'); if(fn && !fn.value) fn.value = guardian;
            }
            if(dob) { const el = f.querySelector('[name="memberDOB"]'); if(el) el.value = dob; }
            if(blood) { const el = f.querySelector('[name="bloodGroup"]'); if(el) el.value = blood; }
            if(fullAddress) { const el = f.querySelector('[name="address"]'); if(el && !el.value) el.value = fullAddress; }
            if(district) { const el = f.querySelector('[name="district"]'); if(el && !el.value) el.value = district; }
          }
        } else if(role === 'Cadet'){
          const f = $('#cadetEnrollmentForm');
          if(f){
            if(name) { const el = f.querySelector('[name="cadetName"]'); if(el) el.value = name; }
            if(email) { const el = f.querySelector('[name="email"]'); if(el) el.value = email; }
            if(guardian) {
              const fn = f.querySelector('[name="fatherName"]'); if(fn) fn.value = guardian;
              const gn = f.querySelector('[name="guardianName"]'); if(gn) gn.value = guardian;
            }
            if(dob) { const el = f.querySelector('[name="cadetDOB"]'); if(el) el.value = dob; }
            if(blood) { const el = f.querySelector('[name="bloodGroup"]'); if(el) el.value = blood; }
            if(fullAddress) { const el = f.querySelector('[name="cadetAddress"]'); if(el && !el.value) el.value = fullAddress; }
            if(district) { const el = f.querySelector('[name="district"]'); if(el && !el.value) el.value = district; }
          }
        } else if(role === 'Volunteer'){
          const f = $('#volunteerForm');
          if(f){
            if(name) { const el = f.querySelector('[name="fullName"]'); if(el) el.value = name; }
            if(email) { const el = f.querySelector('[name="email"]'); if(el) el.value = email; }
            if(dob) { const el = f.querySelector('[name="dob"]'); if(el) el.value = dob; }
            if(blood) { const el = f.querySelector('[name="bloodGroup"]'); if(el) el.value = blood; }
            if(fullAddress) { const el = f.querySelector('[name="address"]'); if(el && !el.value) el.value = fullAddress; }
          }
        } else if(role === 'Intern & Alumni Member'){
          const f = $('#internForm');
          if(f){
            if(name) { const el = f.querySelector('[name="fullName"]'); if(el) el.value = name; }
            if(email) { const el = f.querySelector('[name="email"]'); if(el) el.value = email; }
            if(dob) { const el = f.querySelector('[name="dob"]'); if(el) el.value = dob; }
            if(blood) { const el = f.querySelector('[name="bloodGroup"]'); if(el) el.value = blood; }
            if(fullAddress) { const el = f.querySelector('[name="address"]'); if(el && !el.value) el.value = fullAddress; }
          }
        }
      }
      function syncFromCategoryToStandard(){
        const active = [$('#memberForm'), $('#cadetEnrollmentForm'), $('#volunteerForm'), $('#internForm')].find(f => f && f.offsetParent !== null);
        if(!active) return;
        const name = active.querySelector('[name="memberName"]')?.value || active.querySelector('[name="cadetName"]')?.value || active.querySelector('[name="fullName"]')?.value;
        if(name && $('#regFullName')) $('#regFullName').value = name;
        const email = active.querySelector('[name="memberEmail"]')?.value || active.querySelector('[name="email"]')?.value;
        if(email && $('#regEmail')) $('#regEmail').value = email;
        const guardian = active.querySelector('[name="guardianName"]')?.value || active.querySelector('[name="fatherName"]')?.value;
        if(guardian && $('#regGuardian')) $('#regGuardian').value = guardian;
        const dob = active.querySelector('[name="memberDOB"]')?.value || active.querySelector('[name="cadetDOB"]')?.value || active.querySelector('[name="dob"]')?.value;
        if(dob && $('#regDOB')) $('#regDOB').value = dob;
        const blood = active.querySelector('[name="bloodGroup"]')?.value;
        if(blood && $('#regBloodGroup')) $('#regBloodGroup').value = blood;
      }
      function selectRegisterRole(button,role){
        role = normalizeRole(role);
        $$('.role-register-btn').forEach(x=>x.classList.toggle('active', !!(x.getAttribute('onclick')&&x.getAttribute('onclick').includes(role))));
        $$('.reg-type-card').forEach(x => {
          const match = x.getAttribute('data-role') === role || (x.getAttribute('onclick') && x.getAttribute('onclick').includes(role));
          x.classList.toggle('active', !!match);
          x.setAttribute('aria-checked', match ? 'true' : 'false');
        });
        if(button) {
          button.classList.add('active');
          button.setAttribute('aria-checked', 'true');
        }
        const roleLabels = {
          'Member': 'Members',
          'Cadet': 'Cadets',
          'Volunteer': 'Volunteers',
          'Intern & Alumni Member': 'Intern & Alumni'
        };
        if($('#selectedRegisterRole')) $('#selectedRegisterRole').textContent = roleLabels[role] || role;
        if($('#regAccountType')) $('#regAccountType').value=role;
        if($('#regAccountTypeSelect')) $('#regAccountTypeSelect').value=role;

        // Sync entered details from standard form into chosen role form
        syncFromStandardToRole(role);

        // Hide main registration form (which completely hides the 4 category cards & icons)
        const std = $('#standardRegisterForm');
        if(std) std.style.display = 'none';

        // Hide all individual category forms first
        const ids = ['memberRegistrationForm','cadetRegistrationForm','volunteerRegistrationForm','internRegistrationForm'];
        ids.forEach(id => { const el = $('#'+id); if(el) el.style.display = 'none'; });

        // Open ONLY the corresponding selected individual registration form
        const target = role === 'Member' ? 'memberRegistrationForm' : role === 'Cadet' ? 'cadetRegistrationForm' : role === 'Volunteer' ? 'volunteerRegistrationForm' : 'internRegistrationForm';
        const targetEl = $('#'+target);
        if(targetEl) targetEl.style.display = 'block';

        if(role === 'Member' && $('#memberForm')) $('#memberForm').style.display = 'block';
        if(role === 'Cadet' && $('#cadetEnrollmentForm')) $('#cadetEnrollmentForm').style.display = 'block';
        if(role === 'Volunteer' && $('#volunteerForm')) $('#volunteerForm').style.display = 'block';
        if(role === 'Intern & Alumni Member' && $('#internForm')) $('#internForm').style.display = 'block';

        // Reset any sub-screens
        if($('#memberPaymentScreen')) $('#memberPaymentScreen').style.display = 'none';
        if($('#cadetConfirmScreen')) $('#cadetConfirmScreen').style.display = 'none';
        if($('#volunteerConfirmScreen')) $('#volunteerConfirmScreen').style.display = 'none';
        if($('#internConfirmScreen')) $('#internConfirmScreen').style.display = 'none';

        sendHeight();
        setTimeout(() => targetEl?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 50);
      }
      function backToRegistrationTypes(){
        // Sync any entered details from the category form back into standard form
        syncFromCategoryToStandard();

        // Hide all individual category forms
        const ids = ['memberRegistrationForm','cadetRegistrationForm','volunteerRegistrationForm','internRegistrationForm'];
        ids.forEach(id => { const el = $('#'+id); if(el) el.style.display = 'none'; });

        // Return to main registration page and show the 4 category cards and icons again!
        const std = $('#standardRegisterForm');
        if(std){
          std.style.display = 'block';
          std.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        const currentRole = $('#regAccountType')?.value || 'Member';
        $$('.reg-type-card').forEach(x => {
          const match = x.getAttribute('data-role') === currentRole;
          x.classList.toggle('active', !!match);
          x.setAttribute('aria-checked', match ? 'true' : 'false');
        });
        if($('#selectedRegisterRole')) $('#selectedRegisterRole').textContent = {
          'Member': 'Members',
          'Cadet': 'Cadets',
          'Volunteer': 'Volunteers',
          'Intern & Alumni Member': 'Intern & Alumni'
        }[currentRole] || currentRole;

        sendHeight();
      }
      function togglePass(id, btn){
        const i=$('#'+id);
        if(!i)return;
        const isPass = i.type==='password';
        i.type = isPass ? 'text' : 'password';
        const b = btn || i.parentElement?.querySelector('.password-toggle');
        if(b){
          b.setAttribute('aria-label', isPass ? 'Hide password' : 'Show password');
          const eyeShow = b.querySelector('.eye-show');
          const eyeHide = b.querySelector('.eye-hide');
          if(eyeShow && eyeHide){
            eyeShow.style.display = isPass ? 'none' : 'block';
            eyeHide.style.display = isPass ? 'block' : 'none';
          }
        }
      }

      function evaluatePasswordStrength(val){
        const hasLen = val.length >= 8 && val.length <= 64;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasNum = /[0-9]/.test(val);
        const hasSpec = /[^A-Za-z0-9]/.test(val);
        const criteria = [hasLen, hasUpper, hasLower, hasNum, hasSpec];
        const passedCount = criteria.filter(Boolean).length;
        
        let strength = 'weak';
        let label = 'Weak';
        let color = '#ef4444';
        let width = '25%';
        
        if (passedCount < 3) {
          strength = 'weak';
          label = 'Weak';
          color = '#ef4444';
          width = '25%';
        } else if (passedCount === 3) {
          strength = 'medium';
          label = 'Medium';
          color = '#f59e0b';
          width = '50%';
        } else if (passedCount === 4) {
          strength = 'strong';
          label = 'Strong';
          color = '#10b981';
          width = '75%';
        } else if (passedCount === 5) {
          if (val.length >= 10) {
            strength = 'very-strong';
            label = 'Very Strong';
            color = '#059669';
            width = '100%';
          } else {
            strength = 'strong';
            label = 'Strong';
            color = '#10b981';
            width = '85%';
          }
        }
        return {
          hasLen,
          hasUpper,
          hasLower,
          hasNum,
          hasSpec,
          allPassed: passedCount === 5,
          passedCount,
          strength,
          label,
          color,
          width
        };
      }

      function updatePasswordUI(){
        const passInput = $('#regPassword');
        if(!passInput) return;
        const val = passInput.value || '';
        
        const pill = $('#passwordStrengthPill');
        const label = $('#passwordStrengthLabel');
        const fill = $('#passwordMeterFill');
        const hint = $('#passwordMeterHint');
        const reqLen = $('#req-length');
        const reqUpper = $('#req-upper');
        const reqLower = $('#req-lower');
        const reqNum = $('#req-number');
        const reqSpec = $('#req-special');

        if(val.length === 0){
          if(pill) pill.style.display = 'none';
          if(fill){
            fill.style.width = '0%';
            fill.style.backgroundColor = 'transparent';
          }
          if(hint) hint.textContent = 'Must be 8–64 characters with uppercase, lowercase, number, and special character';
          [reqLen, reqUpper, reqLower, reqNum, reqSpec].forEach(el => {
            if(el) el.className = 'req-item neutral';
          });
        } else {
          const res = evaluatePasswordStrength(val);
          if(pill){
            pill.style.display = 'inline-flex';
            pill.className = 'password-strength-pill ' + res.strength;
          }
          if(label) label.textContent = res.label;
          if(fill){
            fill.style.width = res.width;
            fill.style.backgroundColor = res.color;
          }
          if(hint){
            if(res.allPassed){
              hint.textContent = res.strength === 'very-strong' ? 'Excellent! Password meets all security standards.' : 'Great password! Satisfies all requirements.';
            } else {
              hint.textContent = (5 - res.passedCount) + ' requirement(s) remaining for a strong password';
            }
          }

          const setReq = (el, passed) => {
            if(!el) return;
            el.className = passed ? 'req-item satisfied' : 'req-item unsatisfied';
          };
          setReq(reqLen, res.hasLen);
          setReq(reqUpper, res.hasUpper);
          setReq(reqLower, res.hasLower);
          setReq(reqNum, res.hasNum);
          setReq(reqSpec, res.hasSpec);
        }

        updateConfirmPasswordUI();
        sendHeight();
      }

      function updateConfirmPasswordUI(){
        const passInput = $('#regPassword');
        const confirmInput = $('#regConfirmPassword');
        if(!confirmInput) return;
        const passVal = passInput ? passInput.value || '' : '';
        const confirmVal = confirmInput.value || '';
        const matchPill = $('#confirmMatchPill');
        const matchMsg = $('#confirmMatchMessage');

        if(confirmVal.length === 0){
          if(matchPill) matchPill.style.display = 'none';
          if(matchMsg) matchMsg.style.display = 'none';
          confirmInput.removeAttribute('aria-invalid');
        } else if(passVal.length > 0 && confirmVal === passVal){
          if(matchPill){
            matchPill.style.display = 'inline-flex';
            matchPill.className = 'confirm-match-pill match-success';
            matchPill.innerHTML = '<span class="match-dot"></span><span>Passwords match</span>';
          }
          if(matchMsg){
            matchMsg.style.display = 'flex';
            matchMsg.className = 'confirm-match-message match-success';
            matchMsg.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg><span>Passwords match successfully.</span>';
          }
          confirmInput.removeAttribute('aria-invalid');
        } else {
          if(matchPill){
            matchPill.style.display = 'inline-flex';
            matchPill.className = 'confirm-match-pill match-error';
            matchPill.innerHTML = '<span class="match-dot"></span><span>Mismatch</span>';
          }
          if(matchMsg){
            matchMsg.style.display = 'flex';
            matchMsg.className = 'confirm-match-message match-error';
            matchMsg.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Passwords do not match. Please ensure both passwords are identical.</span>';
          }
          confirmInput.setAttribute('aria-invalid', 'true');
        }
      }
      function previewPhoto(e){const f=e.target.files?.[0],img=$('#photoPreview');if(f&&img){img.src=URL.createObjectURL(f);img.style.display='block';}}
      function previewMemberPhoto(e){const f=e.target.files?.[0],img=$('#memberPhotoPreview');if(f&&img){img.src=URL.createObjectURL(f);img.style.display='block';}}
      function previewSignature(e,previewId,placeholderId){const f=e.target.files?.[0],img=$('#'+previewId),placeholder=$('#'+placeholderId);if(!f)return;if(f.type.startsWith('image/')){img.src=URL.createObjectURL(f);img.style.display='block';if(placeholder)placeholder.style.display='none';}else{img.style.display='none';if(placeholder){placeholder.textContent='📄 PDF Selected';placeholder.style.display='inline';}}}
      function previewCadetSignature(e,previewId,textId){const f=e.target.files?.[0],img=$('#'+previewId),label=$('#'+textId);if(f&&img){img.src=URL.createObjectURL(f);img.style.display='block';if(label)label.style.display='none';}}
      function toggleMemberChildren(show){const box=$('#memberChildren');if(box)box.style.display=show?'grid':'none';}
      function populateDistricts(){const state=$('#regState').value, select=$('#regDistrict');select.innerHTML='<option value="">Select District</option>';(${JSON.stringify(statesAndDistricts)}[state]||[]).forEach(x=>{const o=document.createElement('option');o.textContent=x;o.value=x;select.append(o)});}
      function submitMemberRegistration(e){
        e.preventDefault();
        if(!validateForm(e.currentTarget))return;
        pendingMember=e.currentTarget;
        const name=e.currentTarget.querySelector('[name="memberName"]')?.value || e.currentTarget.querySelector('[name="fullName"]')?.value || e.currentTarget.querySelector('[name="name"]')?.value || 'Applicant';
        const phone=e.currentTarget.querySelector('[name="mobile"]')?.value || e.currentTarget.querySelector('[name="phone"]')?.value || '';
        const refNo='ARWS-MEM-'+Math.floor(100000+Math.random()*900000);
        if($('#memberSummaryName'))$('#memberSummaryName').textContent=name;
        if($('#memberSummaryPhone'))$('#memberSummaryPhone').textContent=phone;
        if($('#memberSummaryRef'))$('#memberSummaryRef').textContent=refNo;
        $('#memberForm').style.display='none';
        $('#memberPaymentScreen').style.display='block';
        $('#memberPaymentScreen').scrollIntoView({behavior:'smooth',block:'start'});
        sendHeight();
      }
      function returnToMemberForm(){
        if($('#memberPaymentScreen'))$('#memberPaymentScreen').style.display='none';
        if($('#memberRegistrationForm'))$('#memberRegistrationForm').style.display='block';
        if($('#memberForm'))$('#memberForm').style.display='block';
        $('#memberRegistrationForm').scrollIntoView({behavior:'smooth',block:'start'});
        sendHeight();
      }
      function startRazorpayMemberPayment(){if(pendingMember)send('member-payment',pendingMember);}
      function submitCadetForm(e){
        e.preventDefault();
        if(!validateForm(e.currentTarget))return;
        const cadetName=e.currentTarget.querySelector('[name="cadetName"]')?.value || e.currentTarget.querySelector('[name="name"]')?.value || 'Applicant';
        if($('#cadetSummaryName'))$('#cadetSummaryName').textContent=cadetName;
        if($('#cadetSummaryRef'))$('#cadetSummaryRef').textContent='ARWS-CAD-'+Math.floor(100000+Math.random()*900000);
        send('application',e.currentTarget);
      }
      function submitProgramForm(e){
        e.preventDefault();
        if(!validateForm(e.currentTarget))return;
        const name=e.currentTarget.querySelector('[name="fullName"]')?.value || e.currentTarget.querySelector('[name="name"]')?.value || 'Applicant';
        if(e.currentTarget.id==='volunteerForm'){
          if($('#volunteerSummaryName'))$('#volunteerSummaryName').textContent=name;
          if($('#volunteerSummaryRef'))$('#volunteerSummaryRef').textContent='ARWS-VOL-'+Math.floor(100000+Math.random()*900000);
        } else if(e.currentTarget.id==='internForm'){
          if($('#internSummaryName'))$('#internSummaryName').textContent=name;
          if($('#internSummaryRef'))$('#internSummaryRef').textContent='ARWS-INT-'+Math.floor(100000+Math.random()*900000);
        }
        send('application',e.currentTarget);
      }
      function returnToCadetForm(){
        if($('#cadetConfirmScreen'))$('#cadetConfirmScreen').style.display='none';
        if($('#cadetRegistrationForm'))$('#cadetRegistrationForm').style.display='block';
        if($('#cadetEnrollmentForm'))$('#cadetEnrollmentForm').style.display='block';
        $('#cadetRegistrationForm').scrollIntoView({behavior:'smooth',block:'start'});
        sendHeight();
      }
      function returnToVolunteerForm(){
        if($('#volunteerConfirmScreen'))$('#volunteerConfirmScreen').style.display='none';
        if($('#volunteerRegistrationForm'))$('#volunteerRegistrationForm').style.display='block';
        if($('#volunteerForm'))$('#volunteerForm').style.display='block';
        $('#volunteerRegistrationForm').scrollIntoView({behavior:'smooth',block:'start'});
        sendHeight();
      }
      function returnToInternForm(){
        if($('#internConfirmScreen'))$('#internConfirmScreen').style.display='none';
        if($('#internRegistrationForm'))$('#internRegistrationForm').style.display='block';
        if($('#internForm'))$('#internForm').style.display='block';
        $('#internRegistrationForm').scrollIntoView({behavior:'smooth',block:'start'});
        sendHeight();
      }
      function addReferenceFields(){
        const notice='Your login credentials are not chosen during registration. After administrator approval, a secure link is sent to your registered Gmail address. You set your username and password only through that link.';
        const how='After administrator approval, return to the Login page and sign in with this username and password to enter the website directly.';
        const lock='🔐 Account credentials are created only once by the applicant after approval using the secure email link.';
        const configs=[['memberForm','member',3],['cadetEnrollmentForm','cadet',3],['volunteerForm','program',2],['internForm','program',2]];
        configs.forEach(([id,kind,after])=>{const form=$('#'+id);if(!form)return;const section=document.createElement('div');section.className='agni-extra-account-section';section.innerHTML='<h4>Blood Group</h4><p>'+notice+'</p>';
          if(id!=='memberForm'){const cls=kind==='cadet'?'cadet-field':'program-field';const full=kind==='cadet'?' cadet-full':' full';const label=id==='cadetEnrollmentForm'?'Blood Group *':'Blood Group';section.insertAdjacentHTML('beforeend','<div class="agni-extra-account-grid"><div class="'+cls+full+'"><label>'+label+'</label><select name="bloodGroup" '+(id==='cadetEnrollmentForm'?'required':'')+'><option value="">Select Blood Group</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div></div>');}
          section.insertAdjacentHTML('beforeend','<div class="agni-account-after-approval">'+how+'</div><div class="agni-account-after-approval">'+lock+'</div><div style="display:none"><div class="'+(kind==='cadet'?'cadet-field':kind==='member'?'member-field':'program-field')+'"><label>Username *</label></div><div class="'+(kind==='cadet'?'cadet-field':kind==='member'?'member-field':'program-field')+'"><label>Password *</label></div><div class="'+(kind==='cadet'?'cadet-field':kind==='member'?'member-field':'program-field')+'"><label>Confirm Password *</label></div></div>');const sections=form.querySelectorAll('.member-section,.cadet-section,.program-section');if(sections[after])sections[after].insertAdjacentElement('afterend',section);
        });
        ['volunteerForm','internForm'].forEach(id=>{const form=$('#'+id),first=form?.querySelector('.program-section');if(!first||first.querySelector('[data-agni-profile-photo="1"]'))return;const card=document.createElement('div');card.className='agni-photo-required';card.dataset.agniProfilePhoto='1';card.innerHTML='<label>Recent Applicant Photograph *</label><input type="file" name="profilePhoto" accept="image/*" required><small>Upload the photograph that will be printed on the official ID card after administrator approval.</small>';first.append(card);});
        $$('#cadetEnrollmentForm .cadet-field, #memberForm .member-field, #volunteerForm .program-field, #internForm .program-field').forEach((field)=>{const label=Array.from(field.children).find(x=>x.tagName==='LABEL');if(!label||label.querySelector('input[type="radio"],input[type="checkbox"]'))return;const clean=(label.dataset.agniCleanText||label.textContent.replace(/^(?:[0-9]+[.][ ]*)+/, '')).trim();label.dataset.agniCleanText=clean;});
        ['memberForm','cadetEnrollmentForm','volunteerForm','internForm'].forEach(id=>{const form=$('#'+id);if(!form)return;let n=1;form.querySelectorAll('.member-field,.cadet-field,.program-field').forEach(field=>{const label=Array.from(field.children).find(x=>x.tagName==='LABEL');if(!label||label.querySelector('input[type="radio"],input[type="checkbox"]'))return;const clean=(label.dataset.agniCleanText||label.textContent.replace(/^(?:[0-9]+[.][ ]*)+/, '')).trim();label.dataset.agniCleanText=clean;label.textContent=(n++)+'. '+clean;});});
      }
      document.addEventListener('DOMContentLoaded',()=>{$$('#registerPanel form').forEach(form=>form.noValidate=true);});
      document.addEventListener('input',e=>{
        if(e.target.id === 'regPassword') updatePasswordUI();
        if(e.target.id === 'regConfirmPassword') updateConfirmPasswordUI();
        if(e.target.matches('input,select,textarea')&&e.target.checkValidity())e.target.removeAttribute('aria-invalid');
      });
      document.addEventListener('change',e=>{
        if(e.target.id === 'regPassword') updatePasswordUI();
        if(e.target.id === 'regConfirmPassword') updateConfirmPasswordUI();
        if(e.target.matches('input,select,textarea')&&e.target.checkValidity())e.target.removeAttribute('aria-invalid');
      });
      $('#standardRegisterForm').addEventListener('submit',e=>{e.preventDefault();if(validateForm(e.currentTarget))send('account',e.currentTarget)});
      $('#registerPanel').addEventListener('load',()=>{});
      window.addEventListener('resize',()=>sendHeight());
      const themeTokenNames=${JSON.stringify(themeTokenNames)};
      window.addEventListener('message',e=>{const m=e.data||{};if(m.type!=='app-theme')return;const root=document.documentElement;root.dataset.theme=m.theme==='dark'?'dark':'light';themeTokenNames.forEach(name=>{const value=m.tokens?.[name];if(typeof value==='string'&&value)root.style.setProperty(name,value)});root.style.colorScheme=root.dataset.theme;sendHeight();});
      const panelNode=$('#registerPanel');
      if(panelNode&&typeof ResizeObserver!=='undefined'){new ResizeObserver(()=>sendHeight()).observe(panelNode);}
      function enableFieldSuggestions(){const fields=$$('input[type="text"],input[type="email"],input[type="tel"],input[type="url"],textarea');fields.forEach(field=>{if(field.type==='password'||field.type==='file')return;if(field.hasAttribute('autocomplete')&&field.getAttribute('autocomplete')!=='on')return;const key=((field.name||'')+' '+(field.id||'')+' '+(field.labels?.[0]?.textContent||'')).toLowerCase();const value=field.type==='email'||/email/.test(key)?'email':/username/.test(key)?'username':/phone|mobile|telephone|contact\s*(?:number|phone|no\b)/.test(key)?'tel':/postal|pin code|pincode|zip/.test(key)?'postal-code':/address/.test(key)?'street-address':/full.?name|cadetname|membername/.test(key)?'name':/institution|college|school|organization/.test(key)?'organization':'on';field.setAttribute('autocomplete',value)});$$('input[type="password"]').forEach(field=>field.setAttribute('autocomplete','off'));}
      document.addEventListener('DOMContentLoaded',()=>{
        const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
        ['regEnrollDate','memberEnrollmentDate'].forEach(id=>{const el=$('#'+id);if(el&&!el.value)el.value=today});
        $$('.password-toggle').forEach(button=>{
          const input=button.parentElement?.querySelector('input[type="password"],input[type="text"]');
          if(input)button.setAttribute('aria-label',input.type==='password'?'Show password':'Hide password');
        });
        updatePasswordUI();
        addReferenceFields();
        enableFieldSuggestions();
        sendHeight();
      });
      window.addEventListener('message',e=>{
        const m=e.data||{};
        if(m.type!=='registration-result'||!m.ok)return;
        if(m.formId==='memberForm'||m.formId==='memberRegistrationForm'){
          const n=$('#memberPaymentSuccess');
          if(n)n.style.display='block';
          sendHeight();
        }else if(m.formId==='cadetEnrollmentForm'){
          const screen=$('#cadetConfirmScreen');
          if(screen){
            if(m.registrationId && $('#cadetSummaryRef')) $('#cadetSummaryRef').textContent = m.registrationId;
            $('#cadetEnrollmentForm').style.display='none';
            screen.style.display='block';
            screen.scrollIntoView({behavior:'smooth',block:'start'});
            sendHeight();
          }else{
            const n=$('#cadetFormSuccess');
            if(n)n.style.display='block';
            sendHeight();
          }
        }else if(m.formId==='volunteerForm'){
          const screen=$('#volunteerConfirmScreen');
          if(screen){
            if(m.registrationId && $('#volunteerSummaryRef')) $('#volunteerSummaryRef').textContent = m.registrationId;
            $('#volunteerForm').style.display='none';
            screen.style.display='block';
            screen.scrollIntoView({behavior:'smooth',block:'start'});
            sendHeight();
          }else{
            const n=$('#volunteerFormSuccess');
            if(n)n.style.display='block';
            sendHeight();
          }
        }else if(m.formId==='internForm'){
          const screen=$('#internConfirmScreen');
          if(screen){
            if(m.registrationId && $('#internSummaryRef')) $('#internSummaryRef').textContent = m.registrationId;
            $('#internForm').style.display='none';
            screen.style.display='block';
            screen.scrollIntoView({behavior:'smooth',block:'start'});
            sendHeight();
          }else{
            const n=$('#internFormSuccess');
            if(n)n.style.display='block';
            sendHeight();
          }
        }
      });
      sendHeight();
      setTimeout(sendHeight, 150);
    `;
    return `<!doctype html><html lang="en" data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${registrationCss}\n${rootThemeStyle}\n${registrationThemeCss}</style></head><body>${markup}<script>${runtime}</script></body></html>`;
  }
