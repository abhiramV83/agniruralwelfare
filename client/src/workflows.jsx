import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { animate, useInView, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  Download,
  CheckCircle2,
  ArrowRight,
  Upload,
  LogIn,
  UserRoundPlus,
} from "lucide-react";
import {
  copy as c,
  Fields,
  Action,
  ErrorMessage,
  Modal,
  Success,
  Reveal,
} from "./components";
import { Page } from "./pages";
import { schemaFor } from "./schemas";
import { api, setSession, formData, download } from "./api";
import { useAuth } from "./auth-context";
import { RegistrationPortal } from "./RegistrationPortal";
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const registrationDetails = {
  "Register Member": [
    { group: "Personal & Contact Information", name: "memberPhone", label: "Mobile No", type: "tel", required: true },
    { group: "Personal & Contact Information", name: "memberInstitution", label: "Institution", placeholder: "Enter your school / college / institution" },
    { group: "Personal & Contact Information", name: "memberGender", label: "Gender", type: "select", placeholder: "Select Gender", options: ["Male", "Female"] },
    { group: "Address & Identification", name: "memberAddress", label: "Address", type: "textarea", required: true, wide: true },
    { group: "Address & Identification", name: "pinCode", label: "PIN Code", type: "tel", required: true },
    { group: "Address & Identification", name: "village", label: "Village" },
    { group: "Address & Identification", name: "district", label: "District", required: true },
    { group: "Address & Identification", name: "occupation", label: "Occupation", type: "select", placeholder: "Select occupation", options: [] },
    { group: "Address & Identification", name: "marriageDate", label: "Marriage Date", type: "date" },
    { group: "Family Information", name: "guardianName", label: "Guardian's Name" },
    { group: "Family Information", name: "guardianOccupation", label: "Guardian's Occupation" },
    { group: "Family Information", name: "fatherName", label: "Father's Name" },
    { group: "Family Information", name: "fatherOccupation", label: "Father's Occupation" },
    { group: "Family Information", name: "motherName", label: "Mother's Name" },
    { group: "Family Information", name: "motherOccupation", label: "Mother's Occupation" },
    { group: "Family Information", name: "spouseName", label: "Husband's / Wife Name" },
    { group: "Family Information", name: "spouseOccupation", label: "Husband's / Wife Occupation" },
    { group: "Family Information", name: "spouseDob", label: "Husband's / Wife DOB", type: "date" },
    { group: "Family Information", name: "mothersMaidenName", label: "Mother's Maiden Name" },
    { group: "Family Information", name: "children", label: "Number of Children", placeholder: "How many?" },
    { group: "Family Information", name: "hasChildren", label: "If you have any child", type: "select", options: ["Yes", "No"] },
    { group: "Emergency Contact & Documents", name: "emergencyName", label: "Emergency Contact Name", required: true },
    { group: "Emergency Contact & Documents", name: "emergencyRelationship", label: "Relationship", required: true },
    { group: "Emergency Contact & Documents", name: "emergencyContact", label: "Emergency Contact Number", type: "tel", required: true },
    { group: "Introducer & Enrollment", name: "introducer", label: "Introducer Name" },
    { group: "Introducer & Enrollment", name: "introducerCode", label: "Introducer Code" },
    { group: "Introducer & Enrollment", name: "introducerContact", label: "Introducer Contact Number", type: "tel" },
    { group: "Payment / Contribution Details", name: "paymentMethods", label: "Payment / Contribution Method", type: "checkbox-group", options: ["Cash", "Cheque", "DD", "NEFT"] },
    { group: "Payment / Contribution Details", name: "bankName", label: "Bank Name" },
    { group: "Payment / Contribution Details", name: "bankAccountNumber", label: "Bank Account Number" },
    { group: "Payment / Contribution Details", name: "branchName", label: "Branch Name" },
    { group: "Payment / Contribution Details", name: "ifscCode", label: "IFSC Code" },
    { group: "Photograph & Required Documents", name: "membershipProof", label: "Supporting Document (Optional)", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
    { group: "Signatures & Declaration", name: "memberSignature", label: "Applicant Signature (Optional)", type: "file", accept: "image/png,image/jpeg" },
    { group: "Signatures & Declaration", name: "memberDeclaration", label: "I confirm that the information provided in this application is true and accurate, and I agree to abide by the Membership Terms and Conditions.", type: "checkbox", required: true, wide: true },
  ],
  "Register Volunteers": [
    { group: "Personal & Contact Information", name: "mobileNumber", label: "Mobile Number", type: "tel", required: true },
    { group: "Personal & Contact Information", name: "currentAddress", label: "Current Address", type: "textarea", required: true, wide: true },
    { group: "Personal & Contact Information", name: "occupation", label: "Occupation / Current Status", type: "select", placeholder: "Select", options: [], required: true },
    { group: "Personal & Contact Information", name: "institution", label: "Institution", placeholder: "School / College / Organization", required: true },
    { group: "Personal & Contact Information", name: "preferredCommunication", label: "Preferred Communication", type: "select", options: ["Email"] },
    { group: "Volunteer Interests & Skills", name: "volunteerAreas", label: "Preferred Volunteer Areas", type: "checkbox-group", options: ["Education & Mentoring", "Field Activities", "Events", "Fundraising", "Administration"], required: true },
    { group: "Volunteer Interests & Skills", name: "skills", label: "Key Skills / Languages", placeholder: "e.g. teaching, communication, design" },
    { group: "Volunteer Interests & Skills", name: "previousExperience", label: "Previous Volunteer Experience", placeholder: "Organization or role, if any" },
    { group: "Volunteer Interests & Skills", name: "volunteerReason", label: "Why would you like to volunteer with ARWS?", type: "textarea", required: true, wide: true },
    { group: "Availability & Commitment", name: "availableDays", label: "Available Days", type: "checkbox-group", options: ["Weekdays", "Weekends", "Special Events", "Flexible"], required: true },
    { group: "Availability & Commitment", name: "preferredTime", label: "Preferred Time", type: "select", placeholder: "Select", options: [], required: true },
    { group: "Availability & Commitment", name: "hoursPerWeek", label: "Hours Available per Week", type: "select", placeholder: "Select", options: [], required: true },
    { group: "Availability & Commitment", name: "startDate", label: "Preferred Start Date", type: "date", required: true },
    { group: "Availability & Commitment", name: "commitmentPreference", label: "Commitment Preference", type: "select", options: ["One-time / Event-based"] },
    { group: "Emergency Contact & Documents", name: "emergencyName", label: "Emergency Contact Name", required: true },
    { group: "Emergency Contact & Documents", name: "emergencyRelationship", label: "Relationship", required: true },
    { group: "Emergency Contact & Documents", name: "emergencyPhone", label: "Emergency Contact Number", type: "tel", required: true },
    { group: "Emergency Contact & Documents", name: "heardAboutUs", label: "How did you hear about us?", type: "select", placeholder: "Select", options: [] },
    { group: "Emergency Contact & Documents", name: "supportingDocument", label: "Supporting Document (Optional)", type: "file", accept: ".pdf,.jpg,.jpeg,.png" },
    { group: "Declaration & Confirmation", name: "declaration", label: "I confirm that the information provided is true and I agree to follow the safety, discipline and volunteer guidelines of Agni Rural Welfare Society.", type: "checkbox", required: true, wide: true },
  ],
  "Register Intern & Alumni Members": [
    { group: "Applicant Information", name: "mobileNumber", label: "Mobile Number", type: "tel", required: true },
    { group: "Applicant Information", name: "currentAddress", label: "Current Address", type: "textarea", required: true, wide: true },
    { group: "Academic Background", name: "collegeUniversity", label: "College / University", required: true },
    { group: "Academic Background", name: "institution", label: "Institution", placeholder: "College / University / Institution", required: true },
    { group: "Academic Background", name: "degree", label: "Degree / Program", required: true },
    { group: "Academic Background", name: "major", label: "Branch / Major", required: true },
    { group: "Academic Background", name: "currentYear", label: "Current Year / Semester", required: true },
    { group: "Academic Background", name: "expectedGraduation", label: "Expected Graduation", type: "date", required: true },
    { group: "Academic Background", name: "academicAdvisor", label: "Academic Advisor / Faculty (Optional)" },
    { group: "Internship Preference & Availability", name: "internshipArea", label: "Preferred Internship Area", type: "select", placeholder: "Select", options: [], required: true },
    { group: "Internship Preference & Availability", name: "modePreference", label: "Mode Preference", type: "select", placeholder: "Select", options: [], required: true },
    { group: "Internship Preference & Availability", name: "startDate", label: "Preferred Start Date", type: "date", required: true },
    { group: "Internship Preference & Availability", name: "endDate", label: "Preferred End Date", type: "date", required: true },
    { group: "Internship Preference & Availability", name: "hoursPerWeek", label: "Hours Available per Week", type: "select", placeholder: "Select", options: [], required: true },
    { group: "Internship Preference & Availability", name: "academicCredit", label: "Academic Credit Required?", type: "select", options: ["No"], required: true },
    { group: "Skills, Projects & Supporting Documents", name: "skills", label: "Technical / Professional Skills", required: true },
    { group: "Skills, Projects & Supporting Documents", name: "portfolio", label: "Portfolio / LinkedIn / GitHub Link (Optional)" },
    { group: "Skills, Projects & Supporting Documents", name: "experience", label: "Relevant Coursework, Project or Experience", type: "textarea", required: true, wide: true },
    { group: "Skills, Projects & Supporting Documents", name: "internshipReason", label: "Why are you interested in this internship?", type: "textarea", required: true, wide: true },
    { group: "Skills, Projects & Supporting Documents", name: "cv", label: "Résumé / CV", type: "file", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png", required: true, wide: true },
    { group: "Skills, Projects & Supporting Documents", name: "workSample", label: "Work Sample / Certificate (Optional)", type: "file", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png", wide: true },
    { group: "Reference & Final Declaration", name: "referenceName", label: "Reference Name (Optional)" },
    { group: "Reference & Final Declaration", name: "referenceContact", label: "Reference Email / Phone (Optional)" },
    { group: "Reference & Final Declaration", name: "declaration", label: "I confirm that the information and documents provided are accurate and agree that Agni Rural Welfare Society may review my application.", type: "checkbox", required: true, wide: true },
  ],
};
function applyErrors(error, form, setError) {
  setError(error);
  Object.entries(error.errors || {}).forEach(([name, messages]) =>
    form.setError(name, { message: messages.join(" ") }),
  );
}
export function AuthPage({ initialTab = "Login" }) {
  const [tab, setTab] = useState(initialTab),
    [registerStep, setRegisterStep] = useState(0),
    [error, setError] = useState(null),
    [terms, setTerms] = useState(false);
  const intent = useRef("member");
  const authCardRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const extraFields = Object.values(registrationDetails).flat().map(({ group, ...field }) => ({ ...field, required: false }));
  const allRegisterFields = [...c.forms.register.map((field) => ({ ...field, required: false })), ...extraFields];
  const fields =
    tab === "Register"
      ? allRegisterFields
      : c.forms.login.map((f) => ({
          ...f,
          placeholder:
            tab === "Admin"
              ? f.name === "username"
                ? c.auth.adminUsername
                : c.auth.adminPassword
              : f.placeholder,
        }));
  const base = schemaFor(fields);
  const schema =
    tab === "Register"
      ? base
          .extend({
            consent: z.literal(true, {
              error: "Please agree to the terms.",
            }),
          })
          .refine((v) => v.password === v.confirmPassword, {
            message: c.demo.passwordMismatch,
            path: ["confirmPassword"],
          })
      : tab === "Login"
        ? base.extend({ remember: z.boolean().optional() })
        : base;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { enrollmentDate: today(), consent: false },
  });
  useEffect(() => {
    setTab(initialTab);
    setError(null);
    form.reset({ enrollmentDate: today(), consent: false });
  }, [initialTab]);
  async function submit(values) {
    setError(null);
    try {
      let data;
      if (tab === "Register") {
        const { confirmPassword, declaration, ...payload } = values;
        const detailNames = (registrationDetails[values.registrationType] || []).map((f) => f.name);
        const fileNames = (registrationDetails[values.registrationType] || []).filter((f) => f.type === "file").map((f) => f.name);
        payload.registrationDetails = Object.fromEntries(detailNames.filter((name) => !fileNames.includes(name) && values[name] !== undefined && values[name] !== "").map((name) => [name, Array.isArray(values[name]) ? values[name].join(", ") : String(values[name])]));
        detailNames.filter((name) => !fileNames.includes(name)).forEach((name) => delete payload[name]);
        data = await api("/auth/register", {
          method: "POST",
          body: formData(payload),
        });
      } else
        data = await api(
          tab === "Admin" ? "/auth/admin-login" : "/auth/login",
          { method: "POST", body: values },
        );
      setSession(data);
      if (tab === "Register") {
        if (values.registrationType === "Register Cadets" || intent.current === "enroll") navigate("/enroll");
        else navigate("/member");
        return;
      }
      navigate(
        data.user.role === "admin"
          ? "/admin"
          : intent.current === "enroll"
            ? "/enroll"
            : "/member",
      );
    } catch (e) {
      applyErrors(e, form, setError);
    }
  }
  function switchTab(next) {
    setTab(next);
    setRegisterStep(0);
    setError(null);
    form.reset({ enrollmentDate: today(), consent: false });
  }
  function moveRegisterStep(next) {
    setRegisterStep(next);
    requestAnimationFrame(() => {
      const card = authCardRef.current;
      if (!card) return;
      const top = card.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - 88), behavior: "instant" });
    });
  }
  async function submitRegistration(intentName = "member") {
    const type = form.getValues("registrationType") || "Register Member";
    const baseRequired = type === "Register Member"
      ? ["fullName", "username", "email", "photo", "guardian", "address", "bloodGroup", "dob", "password", "confirmPassword"]
      : ["fullName", "username", "email", "photo", "password", "confirmPassword"];
    const baseMissing = baseRequired.filter((name) => name === "photo" ? !form.getValues(name)?.length : !String(form.getValues(name) || "").trim());
    const missing = [...(registrationDetails[type] || []).filter((f) => f.required && (f.type === "checkbox" ? form.getValues(f.name) !== true : f.type === "checkbox-group" ? !form.getValues(f.name)?.length : f.type === "file" ? !form.getValues(f.name)?.length : !String(form.getValues(f.name) || "").trim())), ...baseMissing.map((name) => ({ name }))];
    if (missing.length) {
      missing.forEach((f) => form.setError(f.name, { message: "This field is required." }));
      requestAnimationFrame(() => document.getElementById(`auth-panel`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    intent.current = intentName;
    await form.handleSubmit(submit)();
  }
  async function validateRegistrationStep(step) {
    const type = form.getValues("registrationType") || "Register Member";
    const personalGroup = ["Register Volunteers", "Register Member"].includes(type) ? "Personal & Contact Information" : "Applicant Information";
    const details = registrationDetails[type] || [];
    const names = step === 0
      ? ["registrationType", "username", "email", "password", "confirmPassword"]
      : type === "Register Member" || type === "Register Cadets"
        ? ["fullName", "guardian", "address", "bloodGroup", "dob", ...details.filter((f) => f.group === personalGroup).map((f) => f.name)]
        : ["fullName", "email", "dob", ...details.filter((f) => f.group === personalGroup).map((f) => f.name)];
    const missing = names.filter((name) => !String(form.getValues(name) || "").trim());
    if (missing.length) {
      missing.forEach((name) => form.setError(name, { message: "This field is required." }));
      return false;
    }
    return form.trigger(names);
  }
  return (
    <section className="auth-background">
      <div className={`auth-card glass${tab === "Register" ? " auth-card-registration" : ""}`} ref={authCardRef}>
        <div className="auth-brand">
          <img src="/assets/logo.png" alt="" />
          <h1>{c.brand.name}</h1>
          <p>{c.brand.tagline}</p>
          <p className="auth-motto">{c.brand.motto}</p>
        </div>
        <div className="tab-bar" role="tablist" aria-label={c.nav[1].label}>
          {c.auth.tabs.map((t) => (
            <button
              key={t}
              id={`auth-tab-${t}`}
              type="button"
              role="tab"
              aria-controls="auth-panel"
              aria-selected={tab === t}
              tabIndex={tab === t ? 0 : -1}
              className={tab === t ? "active" : ""}
              onClick={() => switchTab(t)}
              onKeyDown={(e) => {
                if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
                  e.preventDefault();
                  const next =
                    c.auth.tabs[
                      (c.auth.tabs.indexOf(tab) +
                        (e.key === "ArrowRight" ? 1 : 2)) %
                        3
                    ];
                  switchTab(next);
                  document.getElementById(`auth-tab-${next}`)?.focus();
                }
              }}
            >
              {t === "Login" ? <LogIn aria-hidden="true" /> : t === "Register" ? <UserRoundPlus aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
              <span>{t}</span>
            </button>
          ))}
        </div>
        <div
          id="auth-panel"
          role="tabpanel"
          aria-labelledby={`auth-tab-${tab}`}
        >
          {tab === "Register" ? <RegistrationPortal /> : <>
          <h2 className="icon-heading">
            {tab === "Admin" ? <ShieldCheck aria-hidden="true" /> : tab === "Register" ? <UserRoundPlus aria-hidden="true" /> : <LogIn aria-hidden="true" />}
            {tab === "Register"
              ? registerStep === 0
                ? c.auth.registerHeading
                : form.getValues("registrationType") === "Register Volunteers"
                  ? "Volunteer Registration Form"
                  : form.getValues("registrationType") === "Register Intern & Alumni Members"
                    ? "Internship Registration Form"
                    : form.getValues("registrationType") === "Register Cadets"
                      ? "Senior & Junior Division/Wing Enrollment Form"
                      : "Member Registration Form"
              : tab === "Admin"
                ? c.auth.adminHeading
                : c.auth.loginHeading}
          </h2>
          <p className="muted">
            {tab === "Register"
              ? c.auth.registerIntro
              : tab === "Admin"
                ? c.auth.adminIntro
                : c.auth.loginIntro}
          </p>
          {user && (
            <p>
              <Link to={user.role === "admin" ? "/admin" : "/member"}>
                {user.role === "admin" ? c.demo.admin : "My account"}
                <ArrowRight size={15} />
              </Link>
            </p>
          )}
          <ErrorMessage error={error} />
          <form noValidate onSubmit={form.handleSubmit(submit)}>
            {tab === "Register" && (
              <div className="register-progress" aria-label={`Step ${registerStep + 1} of 3`}>
                <div className="register-progress-track"><span style={{ width: `${((registerStep + 1) / 3) * 100}%` }} /></div>
                <div className="register-step-labels">
                  {["Account", "Personal details", "Application details"].map((label, index) => <span className={index <= registerStep ? "active" : ""} key={label}>{label}</span>)}
                </div>
              </div>
            )}
            {tab === "Register" ? (() => {
              const type = form.watch("registrationType") || "Register Member";
              const typeFields = registrationDetails[type] || [];
              const personalGroup = ["Register Volunteers", "Register Member"].includes(type) ? "Personal & Contact Information" : "Applicant Information";
              const current = registerStep === 0
                ? fields.filter((f) => ["registrationType", "username", "email", "password", "confirmPassword"].includes(f.name)).map((f) => ({ ...f, required: true }))
                : registerStep === 1
                  ? type === "Register Member" || type === "Register Cadets"
                    ? [...fields.filter((f) => ["fullName", "guardian", "address", "bloodGroup", "dob", ...(type === "Register Member" ? ["enrollmentDate"] : [])].includes(f.name)).map((f) => ({ ...f, required: ["fullName", "guardian", "address", "bloodGroup", "dob"].includes(f.name) })), ...typeFields.filter((f) => f.group === personalGroup).map(({ group: _group, ...f }) => ({ ...f, required: f.required === true }))]
                    : [...fields.filter((f) => ["fullName", "email", "dob"].includes(f.name)).map((f) => ({ ...f, required: true })), ...typeFields.filter((f) => f.group === personalGroup).map(({ group: _group, ...f }) => ({ ...f, required: f.required === true }))]
                  : fields.filter((f) => f.name === "photo").map((f) => ({ ...f, required: true }));
              if (registerStep !== 2) return <div className="form-grid single"><Fields fields={current} form={form} /></div>;
              const remainingFields = typeFields.filter((f) => f.group !== personalGroup);
              const groups = [...new Set(remainingFields.map((f) => f.group || "Application Details"))];
              return <><div className="registration-sections">{groups.map((group) => <section className="registration-section" key={group}><h3>{group}</h3><div className="form-grid"> <Fields fields={remainingFields.filter((f) => (f.group || "Application Details") === group).map(({ group: _group, ...f }) => ({ ...f, required: f.required === true }))} form={form} /></div></section>)}</div><div className="form-grid single"><Fields fields={current} form={form} /></div></>;
            })() : <div className="form-grid single"><Fields fields={fields} form={form} /></div>}
            {tab === "Register" && registerStep === 2 && (
              <div className="register-review">
                <h3>Review your details</h3>
                {[["Full name", "fullName"], ["Username", "username"], ["Email", "email"], ["Guardian", "guardian"], ["Blood group", "bloodGroup"], ["Date of birth", "dob"]].map(([label, name]) => <p key={name}><span>{label}</span><strong>{form.watch(name) || "—"}</strong></p>)}
              </div>
            )}
            {tab === "Register" && registerStep === 0 && (
              <small className="password-help">{c.demo.passwordHelp}</small>
            )}
            <div className="form-actions vertical">
              {tab === "Register" ? (
                <>
                  {registerStep > 0 && <Action type="button" className="secondary" onClick={() => moveRegisterStep(registerStep - 1)}>{c.demo.back}</Action>}
                  {registerStep < 2 ? (
                    <Action type="button" disabled={form.formState.isSubmitting} onClick={async () => {
                      if (await validateRegistrationStep(registerStep)) moveRegisterStep(registerStep + 1);
                    }}>{c.demo.next}</Action>
                  ) : (
                    <>
                      <Action type="button" disabled={form.formState.isSubmitting} onClick={() => submitRegistration("member")}>{form.formState.isSubmitting ? c.demo.loading : c.auth.create}</Action>
                    </>
                  )}
                </>
              ) : (
                <Action disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? c.demo.loading : c.auth.signIn}
                </Action>
              )}
            </div>
            {tab === "Login" && (
              <label className="checkbox-line">
                <input type="checkbox" {...form.register("remember")} />
                {c.auth.remember}
              </label>
            )}
            {tab === "Register" && registerStep === 2 && (
              <>
                <label className="checkbox-line">
                  <input
                    aria-label={c.auth.terms}
                    type="checkbox"
                    {...form.register("consent")}
                  />
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setTerms(true)}
                  >
                    {c.auth.terms}
                  </button>
                </label>
                {form.formState.errors.consent && (
                  <p className="field-error" role="alert">
                    {form.formState.errors.consent.message}
                  </p>
                )}
              </>
            )}
          </form>
          </>}
        </div>
      </div>
      {terms && (
        <Modal title={c.demo.termsHeading} onClose={() => setTerms(false)}>
          <p>{c.demo.termsText}</p>
          <Action onClick={() => setTerms(false)}>{c.demo.close}</Action>
        </Modal>
      )}
    </section>
  );
}
export function Donate() {
  const [kind, setKind] = useState(c.donate.tabs[0]),
    [membershipType, setMembershipType] = useState("monthly"),
    [result, setResult] = useState(null),
    [error, setError] = useState(null);
  const form = useForm({ resolver: zodResolver(schemaFor(c.forms.pledge)) });
  async function submit(values) {
    setError(null);
    try {
      const data = await api("/pledges", {
        method: "POST",
        body: {
          ...values,
          kind,
          ...(kind === "Membership" ? { membershipType } : {}),
        },
      });
      setResult(data);
      form.reset();
    } catch (e) {
      applyErrors(e, form, setError);
    }
  }
  return (
    <Page title={c.donate.heading} intro={c.donate.intro}>
      <div className="donation-layout">
        <Reveal className="glass donation-form">
          <div className="tab-bar" aria-label={c.nav[9].label}>
            {c.donate.tabs.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={kind === t}
                className={kind === t ? "active" : ""}
                onClick={() => setKind(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <h2>
            {kind === "Donate" ? c.donate.choose : c.donate.membershipHeading}
          </h2>
          {kind === "Membership" && (
            <>
              <p>{c.donate.membershipIntro}</p>
              <div className="tab-bar">
                {c.donate.membershipOptions.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={membershipType === (i ? "yearly" : "monthly")}
                    onClick={() => setMembershipType(i ? "yearly" : "monthly")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
          <ErrorMessage error={error} />
          <form noValidate onSubmit={form.handleSubmit(submit)}>
            <div className="form-grid single">
              <Fields fields={c.forms.pledge} form={form} />
            </div>
            <Action
              className="full-width"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? c.demo.loading : c.donate.proceed}
            </Action>
          </form>
          <p className="small muted centered">{c.demo.paymentExplanation}</p>
          <p className="small muted centered">{c.donate.supportNote}</p>
        </Reveal>
        <Reveal className="glass impact-card">
          <h2>{c.donate.impact}</h2>
          {c.donate.impacts.map((item) => (
            <button
              type="button"
              key={item.amount}
              className="impact-item"
              onClick={() => {
                form.setValue("amount", item.amount, { shouldValidate: true });
                document.querySelector('input[type="number"]')?.focus();
              }}
            >
              <strong>₹{item.amount.toLocaleString("en-IN")}</strong>
              <span>{item.text}</span>
            </button>
          ))}
        </Reveal>
      </div>
      {result && (
        <Success
          result={result}
          title={c.demo.paymentSuccess}
          onClose={() => setResult(null)}
        />
      )}
    </Page>
  );
}
export function InternshipForm() {
  const [error, setError] = useState(null),
    [result, setResult] = useState(null);
  const form = useForm({
    resolver: zodResolver(schemaFor(c.forms.internship)),
  });
  async function submit(values) {
    setError(null);
    try {
      const data = await api("/internships", {
        method: "POST",
        body: formData(values),
      });
      setResult(data);
      form.reset();
    } catch (e) {
      applyErrors(e, form, setError);
    }
  }
  function sample() {
    form.reset({
      fullName: "Riya Sample",
      gender: "Female",
      phone: "0000000000",
      email: "applicant@example.com",
      address: "Sample address, Kolkata",
      position: c.forms.internship.find((f) => f.name === "position").options[0]
        .value,
      qualification: "Graduate",
      institute: "Sample Institute",
      jobPortal: "Sample job portal",
      motivation: "Sample internship application.",
      applicationDate: today(),
      consent: true,
    });
  }
  return (
    <Page title={c.internshipForm.heading} intro={c.internshipForm.intro}>
      <Reveal className="glass application-card">
        <ErrorMessage error={error} />
        <form noValidate onSubmit={form.handleSubmit(submit)}>
          <div className="form-grid">
            <Fields fields={c.forms.internship} form={form} />
          </div>
          <Action className="full-width" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? c.demo.loading
              : c.internshipForm.submit}
          </Action>
        </form>
      </Reveal>
      {result && <Success result={result} onClose={() => setResult(null)} />}
    </Page>
  );
}
export function Enrollment() {
  const [page, setPage] = useState(1),
    [result, setResult] = useState(null),
    [error, setError] = useState(null);
  const fields = c.demo.enrollmentFields;
  const form = useForm({
    resolver: zodResolver(schemaFor(fields)),
    shouldUnregister: false,
  });
  const heading = useRef();
  const enrollmentSections = page === 1
    ? [
        ["Cadet Personal Information", ["fullName", "gender", "email", "dob", "age", "phone"]],
        ["Parent / Guardian Information", ["fatherName", "fatherOccupation", "motherName", "motherOccupation", "guardian", "guardianPhone"]],
        ["Address & Citizenship", ["address", "citizenship"]],
      ]
    : [
        ["Address & Citizenship", ["village", "tehsil", "district", "pincode", "postOffice", "railwayStation"]],
        ["Education & Training", ["qualification", "school", "institution", "training", "residentialAddress"]],
        ["Blood Group", ["bloodGroup"]],
        ["Introducer & Enrollment", ["introducerName", "introducerCode", "introducerPhone", "enrollmentDate"]],
        ["Photograph & Required Documents", ["photo", "qualificationProof"]],
        ["Declaration of Acceptance for Enrollment", ["guardianSignature", "cadetSignature", "place", "declarationDate"]],
        ["Declaration by Parent / Guardian", ["guardianDeclaration"]],
        ["Final Confirmation", ["finalConfirmation"]],
      ];
  async function next() {
    if (
      await form.trigger(
        fields.filter((f) => f.page === 1).map((f) => f.name),
        { shouldFocus: true },
      )
    ) {
      setPage(2);
      requestAnimationFrame(() => heading.current?.focus());
    }
  }
  async function submit(values) {
    setError(null);
    try {
      setResult(
        await api("/cadets", { method: "POST", body: formData(values) }),
      );
      form.reset();
      setPage(1);
    } catch (e) {
      applyErrors(e, form, setError);
    }
  }
  function sample() {
    form.reset({
      fullName: "Aarav Sample",
      guardian: "Sam Sample",
      guardianPhone: "0000000000",
      dob: "2005-01-01",
      age: "21",
      phone: "0000000000",
      email: "cadet@example.com",
      address: "Sample address, Kolkata",
      qualification: "Graduate",
      school: "Sample Institute",
      institution: "Sample Institute",
      bloodGroup: "O+",
      gender: "Female",
      fatherName: "Sam Sample",
      fatherOccupation: "Service",
      motherName: "Mira Sample",
      motherOccupation: "Service",
      citizenship: "India",
      village: "Sample village",
      tehsil: "Sample taluka",
      district: "Sample district",
      pincode: "000000",
      postOffice: "Sample post office",
      railwayStation: "Sample station",
      training: "Yes",
      guardianDeclaration: true,
      finalConfirmation: true,
      place: "Kolkata",
      declarationDate: today(),
      enrollmentDate: today(),
      residentialAddress: "Sample residential address",
    });
  }
  return (
    <Page title={c.demo.enroll} intro={c.demo.enrollIntro}>
      <div className="application-card glass">
        <div className="stepper" aria-label={`${c.demo.page} ${page} / 2`}>
          <span className="active">01</span>
          <i />
          <span className={page === 2 ? "active" : ""}>02</span>
        </div>
        <h2 tabIndex={-1} ref={heading}>
          {c.demo.enrollmentHeadings[page - 1]}
        </h2>
        <ErrorMessage error={error} />
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (page === 1) next();
            else form.handleSubmit(submit)(e);
          }}
        >
          <div className="registration-sections cadet-sections">
            {enrollmentSections.map(([title, names]) => {
              const sectionFields = names.map((name) => fields.find((f) => f.page === page && f.name === name)).filter(Boolean);
              if (!sectionFields.length) return null;
              return <section className="registration-section" key={title}>
                <h3>{title}</h3>
                {title === "Declaration of Acceptance for Enrollment" && <div className="declaration-copy">
                  <p>I solemnly declare that the answers given in this form are true and that no part of them is false, and that I am willing to fulfill the engagement made.</p>
                  <p>I promise that I will honestly and faithfully serve my country and abide by the Rules and Regulations of ARWS Training, and to the best of my ability attend all required parades and camps.</p>
                  <p>I understand the enrollment and activity conditions stated by ARWS regarding training camps, courses, travel and other ARWS events.</p>
                  <p>I promise to bind myself according to the applicable laws, rules and regulations.</p>
                </div>}
                {title === "Declaration by Parent / Guardian" && <div className="declaration-copy">
                  <p>I solemnly declare that the answers given in this form are true, that my Son / Daughter / Ward is willing to fulfill the engagement made, and that I agree to adhere to the discipline, programme and rules and regulations applicable to ARWS training and camps.</p>
                  <p>I further declare that my son / daughter is in good health and physically fit to undergo ARWS training, subject to the required medical assessment.</p>
                </div>}
                <div className="form-grid"><Fields fields={sectionFields} form={form} /></div>
              </section>;
            })}
          </div>
          <div className="form-actions">
            {page === 2 && (
              <Action
                type="button"
                className="secondary"
                onClick={() => setPage(1)}
              >
                {c.demo.back}
              </Action>
            )}
            <Action disabled={form.formState.isSubmitting}>
              {page === 1
                ? c.demo.next
                : form.formState.isSubmitting
                  ? c.demo.loading
                  : c.auth.continue}
            </Action>
          </div>
        </form>
      </div>
      {result && (
        <CadetSuccess result={result} onClose={() => setResult(null)} />
      )}
    </Page>
  );
}
function CadetSuccess({ result, onClose }) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState(null);
  return (
    <Modal title={c.demo.cadetSuccess} onClose={onClose}>
      <p>{c.demo.cadetSubmitted}</p>
      <small>{c.demo.cadetRegistrationId}</small>
      <p className="registration-id">{result.registrationId}</p>
      <Action
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(result.registrationId);
            setCopied(true);
          } catch {
            setError(new Error("Select and copy the Registration ID above."));
          }
        }}
      >
        {c.demo.copyId}
      </Action>
      {copied && <p role="status">{c.demo.copied}</p>}
      <p>{c.demo.cadetEmailNotice}</p>
      <ErrorMessage error={error} />
      <div className="form-actions">
        <Action
          onClick={() =>
            download(
              `/cadets/${result.registrationId}/id-card`,
              "agni-cadet-card.pdf",
            ).catch(setError)
          }
        >
          {c.demo.cadetDownload}
        </Action>
        <Action className="secondary" onClick={onClose}>
          {c.demo.close}
        </Action>
      </div>
    </Modal>
  );
}
export function Member() {
  const { user, logout } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null),
    [applications, setApplications] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/auth/me").then(setSession).catch(setError);
    api("/cadets/mine").then(setApplications).catch(setError);
    let live = true,
      url;
    api("/members/photo", { blob: true })
      .then((blob) => {
        url = URL.createObjectURL(blob);
        if (live) setPhoto(url);
        else URL.revokeObjectURL(url);
      })
      .catch(() => {});
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);
  async function idCard() {
    setError(null);
    setBusy(true);
    try {
      await download("/members/id-card", "agni-id-card.pdf");
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page title={c.demo.profile} intro={c.brand.tagline}>
      <div className="member-layout">
        {user.status === "approved" ? <Reveal className="glass member-id">
          <div className="id-top">
            <img src="/assets/logo.png" alt={c.brand.name} />
            <ShieldCheck size={24} />
          </div>
          <small>{c.demo.idHeading}</small>
          {photo && (
            <img className="member-photo" src={photo} alt={user.fullName} />
          )}
          <p>{c.brand.motto}</p>
          <h2>{user.fullName}</h2>
          <p className="muted">@{user.username}</p>
          <p className="registration-id">{user.memberId}</p>
          <dl className="review-fields">
            {[
              ...c.demo.idFields,
              { name: "registrationType", label: "Designation / Rank :", value: (user.registrationType || "Register Member").replace(/^Register /, "") },
              { name: "institution", label: "Institution :", value: user.registrationDetails?.institution || user.registrationDetails?.memberInstitution || user.registrationDetails?.collegeUniversity || user.registrationDetails?.institute },
            ].map((f) => (
              <div key={f.name}>
                <dt>{f.label}</dt>
                <dd>{f.value || user[f.name] || "—"}</dd>
              </div>
            ))}
          </dl>
          {c.demo.dataNotice && <small>{c.demo.dataNotice}</small>}
        </Reveal> : <Reveal className="glass member-id member-approval-state">
          <div className="id-top"><img src="/assets/logo.png" alt={c.brand.name} /><ShieldCheck size={24} /></div>
          <h2>{user.status === "rejected" ? c.demo.applicationDeclined : c.demo.applicationPending}</h2>
          <p>{user.status === "rejected" ? c.demo.applicationDeclinedText : c.demo.applicationPendingText}</p>
          <dl className="review-fields"><div><dt>{c.demo.registrationId}</dt><dd>{user.memberId}</dd></div><div><dt>{c.demo.statusLabel}</dt><dd>{user.status || "approved"}</dd></div></dl>
        </Reveal>}
        <Reveal className="member-actions">
          <ErrorMessage error={error} />
          {user.status === "approved" && <>
            <Action disabled={busy} onClick={idCard}>
              <Download size={18} />
              {busy ? c.demo.loading : c.demo.download}
            </Action>
            <Action to={`/verify/${user.memberId}`} className="secondary">{c.demo.openVerification}</Action>
          </>}
          <Action to="/enroll" className="secondary">
            {c.demo.enroll}
          </Action>
          {user.role === "admin" && <Action to="/admin">{c.demo.admin}</Action>}
          <button className="text-button" onClick={logout}>
            {c.demo.logout}
          </button>
        </Reveal>
      </div>
      {applications.length > 0 && (
        <div className="records">
          <h2>{c.demo.statsLabels[1]}</h2>
          {applications.map((a) => (
            <article className="glass record" key={a.registrationId}>
              <code>{a.registrationId}</code>
              <span className={`status ${a.status}`}>{a.status}</span>
              {a.status === "approved" && <Action onClick={() => download(`/cadets/${a.registrationId}/id-card`, `agni-cadet-${a.registrationId}.pdf`).catch(setError)}><Download size={16} />{c.demo.download}</Action>}
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
export function Verify() {
  const { id } = useParams();
  const [data, setData] = useState(null),
    [error, setError] = useState(null);
  useEffect(() => {
    setData(null);
    setError(null);
    api(`/verify/${encodeURIComponent(id)}`)
      .then(setData)
      .catch(setError);
  }, [id]);
  return (
    <Page title={c.demo.verify}>
      <div className="glass verify-card">
        <ErrorMessage error={error} />
        {!data && !error && <p role="status">{c.demo.loading}</p>}
        {data && (
          <>
            <CheckCircle2 className="success-icon" size={50} />
            <h2>{c.demo.verified}</h2>
            <p>{data.fullName}</p>
            <code>{data.memberId}</code>
          </>
        )}
      </div>
    </Page>
  );
}
function Counter({ value }) {
  const ref = useRef(),
    inView = useInView(ref, { once: true }),
    reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.75,
      onUpdate: (v) => setN(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, inView, reduced]);
  return <strong ref={ref}>{n}</strong>;
}
export function Admin() {
  const { logout } = useAuth();
  const [stats, setStats] = useState(null),
    [tab, setTab] = useState("applications"),
    [records, setRecords] = useState([]),
    [error, setError] = useState(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  const form = useForm({
    resolver: zodResolver(
      schemaFor([
        {
          name: "image",
          type: "file",
          required: true,
          accept: "image/png,image/jpeg",
        },
        { name: "alt", required: true },
      ]),
    ),
  });
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    Promise.all([
      api("/admin/stats"),
      api(tab === "gallery" ? "/gallery" : `/admin/${tab}`),
    ])
      .then(([s, r]) => {
        if (live) {
          setStats(s);
          setRecords(r);
        }
      })
      .catch((e) => {
        if (live) setError(e);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [tab]);
  async function decision(id, status) {
    setBusy(true);
    setError(null);
    try {
      const item = records.find((record) => record._id === id);
      let route = `/admin/${tab}/${id}`;
      if (tab === "applications" && item) {
        const sources = {
          "Account registration": "accounts",
          "Cadet enrollment": "cadets",
          "Internship application": "internships",
          "Registration application": "submissions",
        };
        const source = sources[item.source];
        const recordId = String(item._id).slice(String(item._id).indexOf(":") + 1);
        route = `/admin/applications/${source}/${recordId}`;
      }
      const updated = await api(route, {
        method: "PATCH",
        body: { status },
      });
      setRecords((r) => r.map((record) => {
        if (record._id === id) return { ...record, ...updated };
        if (updated.linkedAccountId && record._id === `account:${updated.linkedAccountId}`)
          return { ...record, status: updated.linkedAccountStatus || record.status };
        return record;
      }));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function exportCSV() {
    setError(null);
    setBusy(true);
    try {
      await download(`/admin/${tab}/export`, `${tab}.csv`);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  async function uploadImage(values) {
    setError(null);
    setSaved(false);
    try {
      const data = await api("/admin/gallery", {
        method: "POST",
        body: formData(values),
      });
      setRecords((r) => [...r, data]);
      form.reset();
      setSaved(true);
    } catch (e) {
      applyErrors(e, form, setError);
    }
  }
  async function cv(id) {
    setError(null);
    try {
      await download(`/admin/internships/${id}/cv`, "application-cv.pdf");
    } catch (e) {
      setError(e);
    }
  }
  return (
    <Page title={c.demo.admin} intro={c.demo.approvalNote}>
      <div className="admin-top">
        <Link to="/member">{c.demo.idHeading}</Link>
        <button className="text-button" onClick={logout}>
          {c.demo.logout}
        </button>
      </div>
      <div className="stats-grid">
        {["applicants", "members", "cadets", "volunteers", "internships", "pledges"].map((key, i) => (
          <div className="glass stat" key={key}>
            <span>0{i + 1}</span>
            <Counter value={stats?.[key] || 0} />
            <p>{c.demo.statsLabels[i]}</p>
          </div>
        ))}
      </div>
      <div className="admin-toolbar">
        <div className="tab-bar">
          {c.demo.adminTabs.map((t, i) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              className={tab === t ? "active" : ""}
              onClick={() => {
                setLoading(true);
                setRecords([]);
                setTab(t);
                setSaved(false);
              }}
            >
              {c.demo.adminLabels[i]}
            </button>
          ))}
        </div>
        {tab !== "gallery" && tab !== "applications" && (
          <Action className="secondary" onClick={exportCSV} disabled={busy}>
            <Download size={17} />
            {c.demo.export}
          </Action>
        )}
      </div>
      <ErrorMessage error={error} />
      {loading ? (
        <p role="status">{c.demo.loading}</p>
      ) : tab === "gallery" ? (
        <>
          <div className="glass application-card">
            <h2>{c.demo.upload}</h2>
            <form noValidate onSubmit={form.handleSubmit(uploadImage)}>
              <div className="form-grid single">
                <Fields
                  fields={[
                    {
                      name: "image",
                      label: c.demo.fileLabel,
                      type: "file",
                      accept: "image/png,image/jpeg",
                      required: true,
                    },
                    { name: "alt", label: c.demo.altLabel, required: true },
                  ]}
                  form={form}
                />
              </div>
              <Action disabled={form.formState.isSubmitting}>
                <Upload size={17} />
                {form.formState.isSubmitting
                  ? c.demo.loading
                  : c.demo.submitUpload}
              </Action>
              {saved && <p role="status">{c.demo.saved}</p>}
            </form>
          </div>
          <div className="admin-gallery">
            {records.map((im) => (
              <figure className="glass" key={im._id || im.src}>
                <img src={im.src} alt={im.alt} />
                <figcaption>{im.alt}</figcaption>
              </figure>
            ))}
          </div>
        </>
      ) : (
        <div className="records">
          {records.length === 0 && <p>{c.demo.noRecords}</p>}
          {records.map((item) => (
            <article className="record glass" key={item._id}>
              <div className="record-heading">
                <h3>{item.fullName}</h3>
                <span className={`status ${item.status || "pending"}`}>
                  {item.status || c.demo.notice}
                </span>
              </div>
              <p>{item.email}</p>
              <code>{item.registrationId || item.reference}</code>
          {tab === "applications" ? (
                <>
                  <p>{item.source} · {item.type}</p>
                  <details open>
                    <summary>{c.demo.review}</summary>
                    <dl className="review-fields">
                      {Object.entries(item.details || {}).map(([key, value]) => (
                        <div key={key}>
                          <dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase())}</dt>
                          <dd>{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                    {!!item.files?.length && <p>{item.files.map((file) => typeof file === "string" ? file : file.name).join(", ")}</p>}
                  </details>
                  <div className="form-actions">
                    <Action disabled={busy || item.status === "approved"} onClick={() => decision(item._id, "approved")}>{c.demo.approve}</Action>
                    <Action disabled={busy || item.status === "rejected"} className="secondary" onClick={() => decision(item._id, "rejected")}>{c.demo.reject}</Action>
                  </div>
                </>
              ) : tab === "pledges" ? (
                <p>
                  {item.kind} {item.membershipType || ""} · ₹
                  {item.amount.toLocaleString("en-IN")}
                </p>
              ) : (
                <>
                  <details>
                    <summary>{c.demo.review}</summary>
                    <dl className="review-fields">
                      {(tab === "cadets"
                        ? c.demo.enrollmentFields
                        : c.forms.internship
                      )
                        .filter((f) => !["cv", "consent"].includes(f.name))
                        .map((f) => (
                          <div key={f.name}>
                            <dt>{f.label}</dt>
                            <dd>{item[f.name] || "—"}</dd>
                          </div>
                        ))}
                    </dl>
                    {tab === "internships" && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => cv(item._id)}
                      >
                        {c.demo.viewCV}
                      </button>
                    )}
                  </details>
                  <div className="form-actions">
                    <Action
                      disabled={busy || item.status === "approved"}
                      onClick={() => decision(item._id, "approved")}
                    >
                      {c.demo.approve}
                    </Action>
                    <Action
                      disabled={busy || item.status === "rejected"}
                      className="secondary"
                      onClick={() => decision(item._id, "rejected")}
                    >
                      {c.demo.reject}
                    </Action>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </Page>
  );
}
