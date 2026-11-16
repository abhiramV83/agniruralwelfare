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
  XCircle,
  AlertCircle,
  ArrowRight,
  Upload,
  LogIn,
  UserRoundPlus,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  FileText,
  Mail,
  Eye,
  Clock,
  Users,
  Pause,
  Play,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Award,
  Send,
  Sparkles,
  Info,
} from "lucide-react";
import { AiLoginIcon, AiRegisterIcon, AiAdminIcon, AdvancedAiLogo } from "./AiIcons";
import { useSuccessPopup, useConfirmationDialog } from "./success-popup-context";
import { ApplicationAiInsightsCard, AdminContentDrafter } from "./components/AdminAiAssistants";
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
import { useTimeGreeting } from "./time-greeting";
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
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
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
        showSuccessPopup({
          heading: `Your ${values.registrationType?.replace(/^Register\s+/, "") || "Member"} Registration Form is Submitted Successfully!`,
          message: "Your account registration has been received and recorded in our official database.",
          category: values.registrationType?.toLowerCase() || "member",
          referenceId: data.memberId || data.registrationId || null,
          applicantName: values.fullName,
          details: [
            { label: "Account Category", value: values.registrationType || "Member" },
            { label: "Registered Email", value: values.email },
          ],
        });
      } else {
        data = await api(
          tab === "Admin" ? "/auth/admin-login" : "/auth/login",
          { method: "POST", body: values },
        );
        setSession(data);
        if (tab === "Admin") {
          showConfirmation({
            type: "success",
            title: "Welcome Back!",
            message: "Admin login successful. Redirecting to your dashboard.",
            actionText: "Go to Dashboard",
            onAction: () => navigate("/admin"),
            autoCloseMs: 1600,
          });
          return;
        }
      }
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
      if (tab === "Admin") {
        showConfirmation({
          type: "error",
          title: "Authentication Failed",
          message: e.message || "Invalid administrator credentials. Please check your username and password and try again.",
          actionText: "Try Again",
        });
      }
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
        <div className="tab-bar auth-tab-bar" role="tablist" aria-label={c.nav[1].label}>
          {c.auth.tabs.map((t) => {
            const isTabActive = tab === t;
            return (
              <button
                key={t}
                id={`auth-tab-${t}`}
                type="button"
                role="tab"
                aria-controls="auth-panel"
                aria-selected={isTabActive}
                tabIndex={isTabActive ? 0 : -1}
                className={`tab-btn tab-btn-${t.toLowerCase()} ${isTabActive ? "active" : ""}`}
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
                {t === "Login" ? (
                  <AiLoginIcon aria-hidden="true" size={18} />
                ) : t === "Register" ? (
                  <AiRegisterIcon aria-hidden="true" size={18} />
                ) : (
                  <AiAdminIcon aria-hidden="true" size={18} />
                )}
                <span className="tab-text">{t}</span>
                {isTabActive && <span className="ai-active-glow" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div
          id="auth-panel"
          role="tabpanel"
          aria-labelledby={`auth-tab-${tab}`}
        >
          {tab === "Register" ? <RegistrationPortal /> : <>
          <h2 className="icon-heading">
            {tab === "Admin" ? <AiAdminIcon aria-hidden="true" size={26} /> : tab === "Register" ? <AiRegisterIcon aria-hidden="true" size={26} /> : <AiLoginIcon aria-hidden="true" size={26} />}
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
                      <Action type="button" disabled={form.formState.isSubmitting} onClick={() => submitRegistration("member")}>
                        {form.formState.isSubmitting ? c.demo.loading : <><AiRegisterIcon size={16} /> <span>{c.auth.create}</span></>}
                      </Action>
                    </>
                  )}
                </>
              ) : (
                <Action disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? c.demo.loading : tab === "Admin" ? <><AiAdminIcon size={16} /> <span>{c.auth.signIn}</span></> : <><AiLoginIcon size={16} /> <span>{c.auth.signIn}</span></>}
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
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
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
      showSuccessPopup({
        heading: "Contribution & Support Pledge Received!",
        message: "Your generous pledge helps empower rural youth, students, and society.",
        category: "donation",
        referenceId: data.reference || data._id,
        applicantName: values.name || values.fullName,
        details: [
          { label: "Pledge Type", value: kind === "Membership" ? `Membership (${membershipType})` : "Donation" },
          { label: "Pledged Amount", value: `₹${Number(values.amount || 0).toLocaleString("en-IN")}` },
          { label: "Transaction Reference", value: data.reference || "Recorded" },
        ],
      });
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
          title="Your Donation / Support Form is Submitted Successfully!"
          onClose={() => setResult(null)}
        />
      )}
    </Page>
  );
}
export function InternshipForm() {
  const [error, setError] = useState(null),
    [result, setResult] = useState(null);
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
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
      showSuccessPopup({
        heading: "Internship & Alumni Application Submitted Successfully!",
        message: "Your application has been received and forwarded to our evaluation committee.",
        category: "intern",
        referenceId: data.registrationId || data._id,
        applicantName: values.fullName,
        details: [
          { label: "Position Applied", value: values.position || "Internship" },
          { label: "Email Address", value: values.email },
          { label: "Contact Phone", value: values.phone },
        ],
      });
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
      {result && <Success result={result} title="Your Internship Application Form is Submitted Successfully!" onClose={() => setResult(null)} />}
    </Page>
  );
}
export function Enrollment() {
  const [page, setPage] = useState(1),
    [result, setResult] = useState(null),
    [error, setError] = useState(null);
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
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
      const data = await api("/cadets", { method: "POST", body: formData(values) });
      setResult(data);
      showSuccessPopup({
        heading: "Cadet Enrollment Submitted Successfully!",
        message: "Your cadet enrollment application has been recorded in our official battalion records.",
        category: "cadet",
        referenceId: data.registrationId || data._id,
        applicantName: values.fullName,
        details: [
          { label: "Cadet Registration ID", value: data.registrationId || "Assigned" },
          { label: "Email Address", value: values.email },
          { label: "Contact Phone", value: values.phone },
        ],
      });
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
    <Modal title="Your Cadet Enrollment Form is Submitted Successfully!" onClose={onClose}>
      <p>{c.demo.cadetSubmitted}</p>
      <small>{c.demo.cadetRegistrationId}</small>
      <p className="registration-id">{result.registrationId}</p>
      <div className="thank-you-support-card" style={{ margin: "16px 0", padding: "16px", background: "rgba(52, 211, 153, 0.12)", border: "1px solid rgba(52, 211, 153, 0.35)", borderRadius: "12px", textAlign: "center" }}>
        <h4 style={{ margin: "0 0 6px 0", fontSize: "17px", fontWeight: "700", color: "#34d399" }}>Thank You for Your Support!</h4>
        <p style={{ margin: 0, fontSize: "14px", color: "var(--text, #eaf1f4)", lineHeight: "1.5" }}>Your kindness and generosity help us create a better tomorrow.</p>
      </div>
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
export function DigitalIdCard3D({ record = {}, onDownload, allowDownload = true, showControls = true }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoFlip, setAutoFlip] = useState(true);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!autoFlip) return;
    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoFlip]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const regNo = record.registrationNumber || record.registrationId || record.memberId || "AGNI-MEM-2026-0001";
  const categoryRaw = record.type || record.registrationType || record.category || "Member";
  const isCadet = /cadet/i.test(categoryRaw);
  const isVolunteer = /volunteer/i.test(categoryRaw);
  const isIntern = /intern|alumni/i.test(categoryRaw);
  const isMember = !isCadet && !isVolunteer && !isIntern;

  const designation = isCadet ? "CADET" : isVolunteer ? "VOLUNTEER" : isIntern ? "INTERN & ALUMNI" : "MEMBER";

  const formatIST = (input) => {
    if (!input) return "—";
    const d = new Date(input);
    return Number.isNaN(d.valueOf()) ? String(input) : d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const name = record.fullName || record.memberName || record.cadetName || "Valued Member";
  const rank = record.rank || record.position || designation;
  const institution = record.troopNo || record.institution || record.school || record.institute || record.details?.institution || record.registrationDetails?.institution || "ARWS Center";
  const guardian = record.guardian || record.fatherName || record.details?.guardian || record.registrationDetails?.guardian || "—";
  const address = record.address || record.residentialAddress || record.details?.address || record.registrationDetails?.address || "—";
  const blood = record.bloodGroup || record.details?.bloodGroup || record.registrationDetails?.bloodGroup || "—";
  const dob = formatIST(record.dob || record.details?.dob || record.registrationDetails?.dob);
  const nationality = record.citizenship || record.nationality || "Indian";
  const issueDate = formatIST(record.approvedAt || record.createdAt || new Date());
  const enrollmentDate = formatIST(record.enrollmentDate || record.approvedAt || record.createdAt);
  const validFrom = record.validFrom ? formatIST(record.validFrom) : issueDate;
  const validUntil = record.validUntil ? formatIST(record.validUntil) : "Permanent";

  const photoSrc = record.photoUrl || (record.photoFileId ? `/api/files/${record.photoFileId}` : (record.photo?.fileId ? `/api/files/${record.photo.fileId}` : null));
  const cryptoHash = encodeURIComponent(regNo).replace(/[^a-zA-Z0-9]/g, "").padEnd(12, "0").slice(0, 12).toUpperCase();

  return (
    <div
      className="id-card-3d-wrapper"
      aria-label="Interactive 3D Digital Identity Card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`id-card-3d-scene ${isFlipped ? "flipped" : ""}`}>
        <div
          className="id-card-3d-inner"
          style={{
            transform: isFlipped
              ? `rotateY(${180 + tilt.x}deg) rotateX(${tilt.y}deg)`
              : `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          }}
        >
          {/* FRONT FACE */}
          <div className="id-card-face id-card-front">
            <div className="id-card-top-bar">
              <div className="id-card-top-bar-shine" />
            </div>
            <div className="id-card-hologram-sweep" aria-hidden="true" />
            <div className="id-card-circuit-bg" aria-hidden="true" />

            <div className="id-card-front-content">
              <div className="id-card-header-block">
                <img src="/assets/logo.png" alt="Agni Logo" className="id-card-logo-front" />
                <h4 className="id-card-brand-title">AGNI RURAL WELFARE SOCIETY</h4>
                <p className="id-card-govt-regd">Govt. Regd. No. : S/1L/55059</p>
                <div className="id-card-main-title">OFFICIAL IDENTITY CARD</div>
                <p className="id-card-motto">Motto : Service to humanity is service to God</p>
                <div className="id-card-security-badge" aria-hidden="true">
                  <ShieldCheck size={10} />
                  <span>SECURE AI VERIFIED</span>
                </div>
              </div>

              <div className="id-card-categories-row">
                <span className={`cat-item ${isMember ? "active" : ""}`}>MEMBER [{isMember ? "✓" : " "}]</span>
                <span className={`cat-item ${isCadet ? "active" : ""}`}>CADET [{isCadet ? "✓" : " "}]</span>
                <span className={`cat-item ${isVolunteer ? "active" : ""}`}>VOLUNTEER [{isVolunteer ? "✓" : " "}]</span>
                <span className={`cat-item ${isIntern ? "active" : ""}`}>INTERN & ALUMNI [{isIntern ? "✓" : " "}]</span>
              </div>

              <div className="id-card-front-body">
                <div className="id-card-left-col">
                  <div className="id-card-photo-box">
                    {photoSrc ? (
                      <img src={photoSrc} alt={name} />
                    ) : (
                      <div className="id-card-photo-placeholder">
                        <span>AFFIX PHOTO</span>
                        <small style={{ display: "block", fontSize: "7px", marginTop: "2px" }}>OFFICIAL RECORD</small>
                      </div>
                    )}
                    <div className="id-card-photo-corners" aria-hidden="true" />
                    <div className="id-card-photo-scanline" aria-hidden="true" />
                  </div>

                  <div className="id-card-smart-chip" title="Cryptographic Microchip" aria-hidden="true">
                    <div className="chip-pattern" />
                  </div>
                </div>

                <div className="id-card-fields-front">
                  <div className="id-card-row">
                    <span className="id-card-label">Name</span>
                    <span className="id-card-dots" />
                    <span className="id-card-val">{name}</span>
                  </div>
                  <div className="id-card-row">
                    <span className="id-card-label">Rank / Role</span>
                    <span className="id-card-dots" />
                    <span className="id-card-val">{rank}</span>
                  </div>
                  <div className="id-card-row">
                    <span className="id-card-label">Regd. No.</span>
                    <span className="id-card-dots" />
                    <span className="id-card-val id-card-regno-val">{regNo}</span>
                  </div>
                  <div className="id-card-row">
                    <span className="id-card-label">Institution / Troop</span>
                    <span className="id-card-dots" />
                    <span className="id-card-val" style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{institution}</span>
                  </div>
                  <div className="id-card-row">
                    <span className="id-card-label">Date of Issue</span>
                    <span className="id-card-dots" />
                    <span className="id-card-val">{issueDate}</span>
                  </div>
                </div>
              </div>

              <div className="id-card-signature-line">
                <span className="id-card-crypto-pill">ENCRYPTED ID: {cryptoHash}</span>
                <span>Signature of Issuing Authority : ____________________</span>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="id-card-face id-card-back">
            <div className="id-card-top-bar">
              <div className="id-card-top-bar-shine" />
            </div>
            <div className="id-card-hologram-sweep" aria-hidden="true" />
            <div className="id-card-circuit-bg" aria-hidden="true" />

            <div className="id-card-back-content">
              <div className="id-card-back-header">
                <span className="id-card-back-brand">AGNI RURAL WELFARE SOCIETY</span>
                <span className="id-card-back-regd">Regd. No.: {regNo}</span>
              </div>

              <div className="id-card-back-grid">
                <div className="id-card-row full">
                  <span className="id-card-label">Father’s / Guardian Name:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{guardian}</span>
                </div>
                <div className="id-card-row full">
                  <span className="id-card-label">Address:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val" style={{ maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{address}</span>
                </div>
                <div className="id-card-row">
                  <span className="id-card-label">Blood Group:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{blood}</span>
                </div>
                <div className="id-card-row">
                  <span className="id-card-label">Date of Birth:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{dob}</span>
                </div>
                <div className="id-card-row">
                  <span className="id-card-label">Nationality:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{nationality}</span>
                </div>
                <div className="id-card-row">
                  <span className="id-card-label">Date of Enrollment:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{enrollmentDate}</span>
                </div>
                <div className="id-card-row">
                  <span className="id-card-label">Valid From:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{validFrom}</span>
                </div>
                <div className="id-card-row">
                  <span className="id-card-label">Valid Until:</span>
                  <span className="id-card-dots" />
                  <span className="id-card-val">{validUntil}</span>
                </div>
              </div>

              <div className="id-card-back-footer">
                <div className="id-card-helpline-box">
                  <div className="id-card-helpline-title">ORGANIZATION CONTACT & HELPLINE</div>
                  <div>AGNI RURAL WELFARE SOCIETY · Govt Regd No: S/1L/55059</div>
                  <div>Address: Sonarpur, Baruipur Sub-Division, South 24 Parganas, Kolkata, West Bengal</div>
                  <div>Helpline: +91 9433834013 · Email: contact@agniruralwelfare.org</div>
                  <div className="id-card-back-disclaimer">
                    This card remains society property. If found, please return to address above.
                  </div>
                </div>

                <div className="id-card-qr-box">
                  <div className="id-card-qr-frame">
                    <img src={`/api/verify/${encodeURIComponent(regNo)}/qr`} alt="Verification QR Code" />
                    <div className="qr-scanner-line" aria-hidden="true" />
                  </div>
                  <span>Scan to Verify</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showControls && (
        <div className="id-card-controls">
          <button
            type="button"
            className={`id-btn ${!isFlipped ? "active" : ""}`}
            onClick={() => {
              setIsFlipped(false);
              setAutoFlip(false);
            }}
          >
            View Front
          </button>
          <button
            type="button"
            className={`id-btn ${isFlipped ? "active" : ""}`}
            onClick={() => {
              setIsFlipped(true);
              setAutoFlip(false);
            }}
          >
            View Back
          </button>
          <button
            type="button"
            className={`id-btn id-btn-auto ${autoFlip ? "playing" : "paused"}`}
            onClick={() => setAutoFlip((v) => !v)}
            title="Toggle 5-second automatic alternating flip"
          >
            {autoFlip ? <Pause size={13} /> : <Play size={13} />}
            <span>{autoFlip ? "Auto-Flip (5s)" : "Auto-Flip Paused"}</span>
          </button>
          {allowDownload && onDownload && (
            <button
              type="button"
              className="id-btn"
              style={{ background: "#0d6b61", color: "#fff", borderColor: "#0d6b61" }}
              onClick={onDownload}
            >
              <Download size={14} />
              Download PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Member() {
  const { user, logout } = useAuth();
  const timeGreeting = useTimeGreeting();
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
      await download("/members/id-card", `agni-id-card-${user.registrationNumber || user.memberId || "card"}.pdf`);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  const isApproved = user.status === "approved" || user.status === "accepted";
  const isRejected = user.status === "rejected";

  return (
    <Page title={c.demo.profile} intro={c.brand.tagline}>
      <div className="member-layout">
        {isApproved ? (
          <Reveal className="glass member-id-wrap" style={{ padding: "28px", borderRadius: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "22px" }}>
              <span className="status-badge status-accepted" style={{ marginBottom: "8px" }}>
                <CheckCircle2 size={14} /> Registration Approved
              </span>
              <h2>{timeGreeting.salutation}, {user.fullName}!</h2>
              <p className="lead" style={{ margin: "4px auto 0", maxWidth: "680px" }}>
                {timeGreeting.welcomeMessage}
              </p>
            </div>

            <DigitalIdCard3D
              record={{
                ...user,
                photoUrl: photo,
              }}
              allowDownload={true}
              onDownload={idCard}
            />
          </Reveal>
        ) : (
          <Reveal className="glass member-id member-approval-state">
            <div className="id-top">
              <img src="/assets/logo.png" alt={c.brand.name} />
              <ShieldCheck size={24} />
            </div>
            <h2>{isRejected ? c.demo.applicationDeclined : c.demo.applicationPending}</h2>
            <p>{isRejected ? (user.rejectionReason ? `Reason: ${user.rejectionReason}` : c.demo.applicationDeclinedText) : c.demo.applicationPendingText}</p>
            <dl className="review-fields">
              <div>
                <dt>{c.demo.registrationId}</dt>
                <dd>{user.memberId}</dd>
              </div>
              <div>
                <dt>{c.demo.statusLabel}</dt>
                <dd className={`status ${user.status}`}>{user.status || "pending"}</dd>
              </div>
            </dl>
          </Reveal>
        )}

        <Reveal className="member-actions">
          <ErrorMessage error={error} />
          {isApproved && (
            <>
              <Action disabled={busy} onClick={idCard}>
                <Download size={18} />
                {busy ? c.demo.loading : c.demo.download}
              </Action>
              <Action to={`/verify/${user.registrationNumber || user.memberId}`} className="secondary">
                {c.demo.openVerification}
              </Action>
            </>
          )}
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
              {a.status === "approved" && (
                <Action onClick={() => download(`/cadets/${a.registrationId}/id-card`, `agni-cadet-${a.registrationId}.pdf`).catch(setError)}>
                  <Download size={16} />{c.demo.download}
                </Action>
              )}
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

function EmailStatusCard({ item, busy, onRetry }) {
  if (!item?.emailStatus) return null;

  const isSent = item.emailStatus === "sent";
  const isFailed = item.emailStatus === "failed";
  const isPending = item.emailStatus === "pending";
  const isUnconfigured = item.emailStatus === "not_configured";

  const statusType = isSent ? "sent" : isFailed ? "failed" : isUnconfigured ? "unconfigured" : "pending";

  const title = isSent
    ? "Official Email Delivered"
    : isFailed
      ? "Email Delivery Failed"
      : isUnconfigured
        ? "SMTP Configuration Required"
        : "Email Notification Pending";

  const description = isSent
    ? `Official notification and digital ID card have been delivered through the configured SMTP provider to ${item.email || "applicant"}.`
    : isFailed
      ? (item.emailError || "The SMTP server rejected the delivery or timed out. Check recipient address and server logs.")
      : isUnconfigured
        ? "Real SMTP delivery is pending. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env to enable live email delivery."
        : "The email notification is queued and awaiting delivery.";

  return (
    <div className={`email-status-card status-${statusType}`} role="status">
      <div className="email-status-icon-col">
        {isSent && <CheckCircle2 size={24} style={{ color: "#10b981" }} />}
        {isFailed && <AlertCircle size={24} style={{ color: "#ef4444" }} />}
        {isUnconfigured && <Info size={24} style={{ color: "#3b82f6" }} />}
        {isPending && <Clock size={24} style={{ color: "#f59e0b" }} />}
      </div>
      <div className="email-status-content-col">
        <h4 className="email-status-title">{title}</h4>
        <p className="email-status-desc">{description}</p>
        {item.emailSentAt && (
          <div className="email-status-meta">
            Attempted: {new Date(item.emailSentAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
          </div>
        )}
      </div>
      <div className="email-status-action-col">
        <button
          type="button"
          className="button secondary email-retry-btn"
          disabled={busy}
          onClick={() => onRetry(item)}
          title="Retry email delivery to applicant"
        >
          <RefreshCw size={14} className={busy ? "spin" : ""} />
          <span>{busy ? "Retrying..." : "Retry Email"}</span>
        </button>
      </div>
    </div>
  );
}

export function Admin() {
  const { logout } = useAuth();
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState("all");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toastNotice, setToastNotice] = useState(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [presetRange, setPresetRange] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Table view & pagination
  const [viewMode, setViewMode] = useState("table");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [detailsModalItem, setDetailsModalItem] = useState(null);
  const [cardModalItem, setCardModalItem] = useState(null);
  const [acceptModalItem, setAcceptModalItem] = useState(null);
  const [acceptRegNo, setAcceptRegNo] = useState("");
  const [acceptValidFrom, setAcceptValidFrom] = useState("");
  const [acceptValidUntil, setAcceptValidUntil] = useState("");
  const [acceptError, setAcceptError] = useState(null);
  const [adminRegNoInput, setAdminRegNoInput] = useState("");

  useEffect(() => {
    if (detailsModalItem) {
      setAdminRegNoInput(detailsModalItem.registrationNumber || detailsModalItem.registrationId || detailsModalItem.memberId || "");
    }
  }, [detailsModalItem?._id, detailsModalItem?.registrationNumber]);

  const [declineModalItem, setDeclineModalItem] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);

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

  const loadData = () => {
    let live = true;
    setLoading(true);
    setError(null);

    if (tab === "content-drafter") {
      api("/admin/stats")
        .then((s) => {
          if (live) setStats(s);
        })
        .catch(() => {})
        .finally(() => {
          if (live) setLoading(false);
        });
      return () => {
        live = false;
      };
    }

    const dataEndpoint = tab === "gallery" ? "/gallery" : (tab === "pledges" ? "/admin/pledges" : "/admin/applications");

    Promise.all([
      api("/admin/stats"),
      api(dataEndpoint),
    ])
      .then(([s, r]) => {
        if (live) {
          setStats(s);
          setRecords(Array.isArray(r) ? r : []);
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
  };

  useEffect(() => {
    return loadData();
  }, [tab]);

  const formatIST = (input) => {
    if (!input) return "—";
    const d = new Date(input);
    return Number.isNaN(d.valueOf()) ? String(input) : d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  };

  const handleOpenAccept = (item) => {
    setAcceptModalItem(item);
    setAcceptRegNo(item.registrationNumber || item.registrationId || item.memberId || "");
    const todayStr = new Date().toISOString().split("T")[0];
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setAcceptValidFrom(item.validFrom || todayStr);
    setAcceptValidUntil(item.validUntil || oneYearLater);
    setAcceptError(null);
  };

  const handleAcceptConfirm = async () => {
    if (!acceptModalItem) return;
    setAcceptError(null);
    const trimmedRegNo = (acceptRegNo || "").trim();
    if (!trimmedRegNo) {
      setAcceptError("Please enter or verify the Official Registration Number.");
      return;
    }
    if (acceptValidFrom && acceptValidUntil) {
      if (new Date(acceptValidUntil) < new Date(acceptValidFrom)) {
        setAcceptError("Valid Until date must be on or after Valid From date.");
        return;
      }
    }

    setBusy(true);
    setActionId(acceptModalItem._id);
    setError(null);
    try {
      const res = await api(`/admin/applications/${acceptModalItem.source}/${acceptModalItem.recordId}/accept`, {
        method: "POST",
        body: {
          registrationNumber: trimmedRegNo,
          validFrom: acceptValidFrom,
          validUntil: acceptValidUntil,
        },
      });

      const updatedRecord = { ...acceptModalItem, ...res, status: "accepted" };
      setRecords((prev) =>
        prev.map((r) => (r._id === acceptModalItem._id ? updatedRecord : r))
      );
      if (detailsModalItem && detailsModalItem._id === acceptModalItem._id) {
        setDetailsModalItem(updatedRecord);
      }
      setToastNotice(`✓ Application for ${acceptModalItem.fullName} approved. Registration Number ${res.registrationNumber || res.registrationId} assigned.`);
      setAcceptModalItem(null);
      api("/admin/stats").then(setStats).catch(() => {});

      showSuccessPopup({
        heading: "Application Accepted Successfully!",
        message: `Official Registration Number ${res.registrationNumber || res.registrationId} assigned to ${acceptModalItem.fullName}.`,
        category: (acceptModalItem.category || "member").toLowerCase(),
        referenceId: res.registrationNumber || res.registrationId,
        applicantName: acceptModalItem.fullName,
        actionText: "Generate ID Card Now",
        onAction: () => handleGenerateIdCard(updatedRecord, res.registrationNumber || trimmedRegNo),
        details: [
          { label: "Applicant Name", value: acceptModalItem.fullName },
          { label: "Registration Type", value: acceptModalItem.category },
          { label: "Assigned Regd. No.", value: res.registrationNumber || res.registrationId },
          { label: "Valid From", value: res.validFrom || acceptValidFrom },
          { label: "Valid Until", value: res.validUntil || acceptValidUntil },
        ],
      });
    } catch (e) {
      setAcceptError(e.message || "Failed to accept application.");
    } finally {
      setBusy(false);
      setActionId(null);
    }
  };

  const handleGenerateIdCard = async (item, customRegNo = null) => {
    setBusy(true);
    setActionId(item._id);
    setError(null);
    try {
      const regToSend = (typeof customRegNo === "string" && customRegNo.trim())
        ? customRegNo.trim()
        : (item.registrationNumber || item.registrationId || item.memberId || "");
      const res = await api(`/admin/applications/${item.source}/${item.recordId}/generate-id-card`, {
        method: "POST",
        body: regToSend ? { registrationNumber: regToSend } : undefined,
      });
      const updated = {
        ...item,
        registrationNumber: res.registrationNumber || regToSend || item.registrationNumber,
        idCardFileId: res.idCardFileId,
        idCardGeneratedAt: res.idCardGeneratedAt
      };
      setRecords((prev) => prev.map((r) => (r._id === item._id ? updated : r)));
      if (detailsModalItem && detailsModalItem._id === item._id) {
        setDetailsModalItem(updated);
      }
      setToastNotice(`✓ Official 2-sided ID Card PDF generated for ${item.fullName} (Regd. No: ${updated.registrationNumber}). Ready for download and approval email.`);

      showSuccessPopup({
        heading: "Official ID Card Generated!",
        message: `High-resolution double-sided ID Card with QR verification has been generated for ${item.fullName}.`,
        category: (item.category || "member").toLowerCase(),
        referenceId: updated.registrationNumber || item.registrationNumber || item.registrationId,
        applicantName: item.fullName,
        actionText: "Preview 3D ID Card",
        onAction: () => setCardModalItem(updated),
        details: [
          { label: "Applicant Name", value: item.fullName },
          { label: "Registration ID", value: updated.registrationNumber || item.registrationNumber || item.registrationId },
          { label: "Status", value: "Verified & Generated" },
        ],
      });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      setActionId(null);
    }
  };

  const handleSendApprovalEmail = async (item) => {
    setBusy(true);
    setActionId(item._id);
    setError(null);
    try {
      const res = await api(`/admin/applications/${item.source}/${item.recordId}/send-approval-email`, {
        method: "POST",
      });
      const updated = {
        ...item,
        approvalEmailStatus: res.approvalEmailStatus,
        acceptanceEmailSent: res.acceptanceEmailSent,
        emailStatus: res.emailStatus,
        emailError: res.emailError,
        emailSentAt: res.emailSentAt,
      };
      setRecords((prev) => prev.map((r) => (r._id === item._id ? updated : r)));
      if (detailsModalItem && detailsModalItem._id === item._id) {
        setDetailsModalItem(updated);
      }
      if (res.success) {
        setToastNotice(`✓ Approval email with ID card attached successfully delivered to ${item.email}.`);
        showConfirmation({
          type: "success",
          title: "Approval Email Successfully Delivered",
          message: `Official acceptance notice and verified 2-sided digital ID card have been delivered through the configured SMTP provider to ${item.email}.`,
          actionText: "Done",
        });
      } else if (res.notConfigured || res.approvalEmailStatus === "not_configured") {
        setToastNotice(`ℹ Approval email recorded. (Real SMTP requires credentials in server/.env).`);
        showConfirmation({
          type: "info",
          title: "SMTP Configuration Required",
          message: "Approval status was updated, but SMTP credentials are not configured in server/.env. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS to enable live email delivery.",
          actionText: "Understood",
        });
      } else {
        setToastNotice(`⚠ Email delivery attempt: ${res.emailError || "Check mail logs"}`);
        showConfirmation({
          type: "error",
          title: "Email Delivery Failed",
          message: res.emailError || "The SMTP server rejected delivery. Please verify recipient address and server settings.",
          actionText: "Close",
        });
      }
    } catch (e) {
      setError(e);
      showConfirmation({
        type: "error",
        title: "Dispatch Request Failed",
        message: e.message || "Failed to trigger approval email dispatch.",
        actionText: "Close",
      });
    } finally {
      setBusy(false);
      setActionId(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!declineModalItem) return;
    setBusy(true);
    setActionId(declineModalItem._id);
    setError(null);
    try {
      const res = await api(`/admin/applications/${declineModalItem.source}/${declineModalItem.recordId}/decline`, {
        method: "POST",
        body: { reason: declineReason },
      });
      const updated = { ...declineModalItem, ...res, status: "rejected" };
      setRecords((prev) =>
        prev.map((r) => (r._id === declineModalItem._id ? updated : r))
      );
      if (detailsModalItem && detailsModalItem._id === declineModalItem._id) {
        setDetailsModalItem(updated);
      }
      setToastNotice(`Application for ${declineModalItem.fullName} has been declined.`);
      setDeclineModalItem(null);
      setDeclineReason("");
      api("/admin/stats").then(setStats).catch(() => {});

      showConfirmation({
        type: "warning",
        title: "Application Declined",
        message: `Application for ${declineModalItem.fullName} has been recorded as declined.`,
        actionText: "Close",
      });
    } catch (e) {
      setError(e);
      showConfirmation({
        type: "error",
        title: "Decline Failed",
        message: e.message || "Could not decline application.",
        actionText: "Close",
      });
    } finally {
      setBusy(false);
      setActionId(null);
    }
  };

  const handleSendRejectionEmail = async (item) => {
    setBusy(true);
    setActionId(item._id);
    setError(null);
    try {
      const res = await api(`/admin/applications/${item.source}/${item.recordId}/send-rejection-email`, {
        method: "POST",
      });
      const updated = {
        ...item,
        rejectionEmailStatus: res.rejectionEmailStatus,
        rejectionEmailSent: res.rejectionEmailSent,
        emailStatus: res.emailStatus,
        emailError: res.emailError,
        emailSentAt: res.emailSentAt,
      };
      setRecords((prev) => prev.map((r) => (r._id === item._id ? updated : r)));
      if (detailsModalItem && detailsModalItem._id === item._id) {
        setDetailsModalItem(updated);
      }
      if (res.success) {
        setToastNotice(`✓ Rejection email successfully dispatched to ${item.email}.`);
        showConfirmation({
          type: "success",
          title: "Rejection Notice Dispatched",
          message: `Official application update email has been delivered to ${item.email}.`,
          actionText: "Done",
        });
      } else if (res.notConfigured || res.rejectionEmailStatus === "not_configured") {
        setToastNotice(`ℹ Rejection email status: ${res.rejectionEmailStatus}`);
        showConfirmation({
          type: "info",
          title: "SMTP Configuration Required",
          message: "Rejection status recorded, but SMTP credentials are not configured in server/.env. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS for live email dispatch.",
          actionText: "Understood",
        });
      } else {
        setToastNotice(`⚠ Email delivery: ${res.emailError || "Check mail logs"}`);
        showConfirmation({
          type: "error",
          title: "Email Delivery Failed",
          message: res.emailError || "The SMTP server rejected delivery of the rejection notice.",
          actionText: "Close",
        });
      }
    } catch (e) {
      setError(e);
      showConfirmation({
        type: "error",
        title: "Dispatch Request Failed",
        message: e.message || "Failed to trigger rejection email dispatch.",
        actionText: "Close",
      });
    } finally {
      setBusy(false);
      setActionId(null);
    }
  };

  const handleRetryEmail = async (item) => {
    setBusy(true);
    setActionId(item._id);
    setError(null);
    try {
      const res = await api(`/admin/applications/${item.source}/${item.recordId}/retry-email`, {
        method: "POST",
      });
      const updated = { ...item, ...res };
      setRecords((prev) => prev.map((r) => (r._id === item._id ? updated : r)));
      if (detailsModalItem && detailsModalItem._id === item._id) {
        setDetailsModalItem(updated);
      }
      setToastNotice(`Email delivery re-attempted: ${res.emailStatus}.`);
      if (res.success) {
        showConfirmation({
          type: "success",
          title: "Email Successfully Re-sent",
          message: `The official notification has been successfully delivered through SMTP to ${item.email}.`,
          actionText: "Done",
        });
      } else if (res.notConfigured) {
        showConfirmation({
          type: "info",
          title: "SMTP Configuration Required",
          message: "Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in server/.env before retrying delivery.",
          actionText: "Understood",
        });
      } else {
        showConfirmation({
          type: "error",
          title: "Email Retry Failed",
          message: res.emailError || "SMTP server failed to deliver the email. Please check network and mail server settings.",
          actionText: "Close",
        });
      }
    } catch (e) {
      setError(e);
      showConfirmation({
        type: "error",
        title: "Retry Request Failed",
        message: e.message || "Failed to re-attempt email delivery.",
        actionText: "Close",
      });
    } finally {
      setBusy(false);
      setActionId(null);
    }
  };

  const handleDownloadIdCard = async (item) => {
    setError(null);
    try {
      const regId = item.registrationNumber || item.registrationId || item.memberId || "id-card";
      await download(`/admin/applications/${item.source}/${item.recordId}/id-card`, `agni-${regId}.pdf`);
    } catch (e) {
      setError(e);
    }
  };

  const exportCSV = async () => {
    setError(null);
    setBusy(true);
    try {
      const target = tab === "pledges" ? "pledges" : "applications";
      await download(`/admin/${target}/export`, `${target}.csv`);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  const uploadImage = async (values) => {
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
  };

  // Filter application records
  const filteredRecords = records.filter((item) => {
    if (tab === "gallery" || tab === "pledges") return true;

    // Tab category filter
    if (tab === "members" && item.category !== "Members") return false;
    if (tab === "cadets" && item.category !== "Cadets") return false;
    if (tab === "volunteers" && item.category !== "Volunteers") return false;
    if (tab === "interns" && item.category !== "Intern & Alumni") return false;

    // Dropdown category filter
    if (tab === "all" && categoryFilter !== "all" && item.category !== categoryFilter) return false;

    // Status filter
    if (statusFilter !== "all" && item.status !== statusFilter) return false;

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (item.fullName || "").toLowerCase().includes(q);
      const matchEmail = (item.email || "").toLowerCase().includes(q);
      const matchPhone = (item.phone || "").toLowerCase().includes(q);
      const matchId = (item.registrationId || "").toLowerCase().includes(q);
      const matchRegNo = (item.registrationNumber || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchId && !matchRegNo) return false;
    }

    const created = new Date(item.createdAt || 0);

    // Preset Date Range Filter
    if (presetRange === "today") {
      const now = new Date();
      if (created.toDateString() !== now.toDateString()) return false;
    } else if (presetRange === "thisWeek") {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (created < oneWeekAgo) return false;
    } else if (presetRange === "thisMonth") {
      const now = new Date();
      if (created.getMonth() !== now.getMonth() || created.getFullYear() !== now.getFullYear()) return false;
    } else if (presetRange === "custom") {
      if (startDate && created < new Date(startDate)) return false;
      if (endDate && created > new Date(`${endDate}T23:59:59`)) return false;
    }

    // Granular Day, Month, Year
    if (dayFilter !== "all") {
      if (created.getDate() !== Number(dayFilter)) return false;
    }
    if (monthFilter !== "all") {
      if (created.getMonth() + 1 !== Number(monthFilter)) return false;
    }
    if (yearFilter !== "all") {
      if (created.getFullYear() !== Number(yearFilter)) return false;
    }

    return true;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortField === "fullName") {
      cmp = (a.fullName || "").localeCompare(b.fullName || "");
    } else if (sortField === "status") {
      cmp = (a.status || "").localeCompare(b.status || "");
    } else if (sortField === "registrationId") {
      cmp = (a.registrationNumber || a.registrationId || "").localeCompare(b.registrationNumber || b.registrationId || "");
    } else {
      cmp = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    return sortOrder === "asc" ? -cmp : cmp;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const applicationTabs = [
    { id: "all", label: "All Applications" },
    { id: "members", label: "Members" },
    { id: "cadets", label: "Cadets" },
    { id: "volunteers", label: "Volunteers" },
    { id: "interns", label: "Intern & Alumni" },
    { id: "pledges", label: "Pledges" },
    { id: "gallery", label: "Gallery" },
    { id: "content-drafter", label: "Content Drafter" },
  ];

  return (
    <Page title="Administrator Portal" intro="Centralized application management, automated unique ID assignment, multi-step verification, approval/rejection email automation, and 3D digital ID card generation.">
      <div className="admin-top">
        <Link to="/member">{c.demo.idHeading}</Link>
        <button className="text-button" onClick={logout}>
          {c.demo.logout}
        </button>
      </div>

      {/* MODULE 1: 8 Live Statistics Cards */}
      <div className="admin-stats-overview" aria-label="Live database registration metrics">
        <div className="admin-stat-card">
          <span className="stat-num">{stats?.totalApplications ?? stats?.applicants ?? 0}</span>
          <span className="stat-label">Total Registrations</span>
        </div>
        <div className="admin-stat-card stat-pending">
          <span className="stat-num">{stats?.pending ?? 0}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="admin-stat-card stat-accepted">
          <span className="stat-num">{stats?.accepted ?? 0}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="admin-stat-card stat-rejected">
          <span className="stat-num">{stats?.rejected ?? 0}</span>
          <span className="stat-label">Rejected</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-num">{stats?.members ?? 0}</span>
          <span className="stat-label">Members</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-num">{stats?.cadets ?? 0}</span>
          <span className="stat-label">Cadets</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-num">{stats?.volunteers ?? 0}</span>
          <span className="stat-label">Volunteers</span>
        </div>
        <div className="admin-stat-card">
          <span className="stat-num">{stats?.internships ?? 0}</span>
          <span className="stat-label">Intern & Alumni</span>
        </div>
      </div>

      {/* Tabs Toolbar */}
      <div className="admin-toolbar">
        <div className="tab-bar">
          {applicationTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={tab === t.id}
              className={tab === t.id ? "active" : ""}
              onClick={() => {
                setLoading(true);
                setRecords([]);
                setTab(t.id);
                setSaved(false);
                setPage(1);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "gallery" && tab !== "content-drafter" && (
          <Action className="secondary" onClick={exportCSV} disabled={busy}>
            <Download size={17} />
            {c.demo.export}
          </Action>
        )}
      </div>

      {toastNotice && (
        <div className="app-email-banner email-sent" role="status" style={{ marginBottom: "18px" }}>
          <span>{toastNotice}</span>
          <button type="button" className="text-button" onClick={() => setToastNotice(null)}>Dismiss</button>
        </div>
      )}

      <ErrorMessage error={error} />

      {/* MODULE 1: Advanced Filter & Search Toolbar */}
      {tab !== "gallery" && tab !== "pledges" && tab !== "content-drafter" && (
        <div className="admin-filter-container">
          <div className="admin-search-wrap">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by name, email, phone, ID, or Regd No..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search applications"
            />
          </div>

          <div className="admin-filter-group">
            {tab === "all" && (
              <select
                className="admin-select"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                <option value="Members">Members</option>
                <option value="Cadets">Cadets</option>
                <option value="Volunteers">Volunteers</option>
                <option value="Intern & Alumni">Intern & Alumni</option>
              </select>
            )}

            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Date Preset Filter */}
            <select
              className="admin-select"
              value={presetRange}
              onChange={(e) => { setPresetRange(e.target.value); setPage(1); }}
              aria-label="Date preset range"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="thisMonth">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {/* Granular Day, Month, Year */}
            <select
              className="admin-select"
              value={dayFilter}
              onChange={(e) => { setDayFilter(e.target.value); setPage(1); }}
              aria-label="Filter by Day"
            >
              <option value="all">Day: All</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={String(d)}>Day: {d}</option>
              ))}
            </select>

            <select
              className="admin-select"
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
              aria-label="Filter by Month"
            >
              <option value="all">Month: All</option>
              {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => (
                <option key={m} value={String(idx + 1)}>{m}</option>
              ))}
            </select>

            <select
              className="admin-select"
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
              aria-label="Filter by Year"
            >
              <option value="all">Year: All</option>
              {["2024", "2025", "2026", "2027"].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {presetRange === "custom" && (
              <>
                <div className="admin-date-input">
                  <Calendar size={14} aria-hidden="true" />
                  <span>From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    aria-label="From date filter"
                  />
                </div>
                <div className="admin-date-input">
                  <span>To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    aria-label="To date filter"
                  />
                </div>
              </>
            )}

            {(search || statusFilter !== "all" || categoryFilter !== "all" || presetRange !== "all" || dayFilter !== "all" || monthFilter !== "all" || yearFilter !== "all" || startDate || endDate) && (
              <button
                type="button"
                className="button secondary"
                style={{ padding: "8px 14px", fontSize: "12px" }}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setPresetRange("all");
                  setDayFilter("all");
                  setMonthFilter("all");
                  setYearFilter("all");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
              >
                Clear Filters
              </button>
            )}

            {/* Layout Toggle */}
            <div style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
              <button
                type="button"
                className={`id-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => setViewMode("table")}
                title="Table View"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                Table View
              </button>
              <button
                type="button"
                className={`id-btn ${viewMode === "cards" ? "active" : ""}`}
                onClick={() => setViewMode("cards")}
                title="Cards View"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                Card View
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p role="status">{c.demo.loading}</p>
      ) : tab === "content-drafter" ? (
        <AdminContentDrafter />
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
                {form.formState.isSubmitting ? c.demo.loading : c.demo.submitUpload}
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
      ) : tab === "pledges" ? (
        <div className="records">
          {records.length === 0 && <p>{c.demo.noRecords}</p>}
          {records.map((item) => (
            <article className="record glass" key={item._id}>
              <div className="record-heading">
                <h3>{item.fullName}</h3>
                <span className="status approved">Received</span>
              </div>
              <p>{item.email} · {item.phone}</p>
              <code>{item.reference}</code>
              <p style={{ marginTop: "12px", fontWeight: "600" }}>
                {item.kind} {item.membershipType ? `(${item.membershipType})` : ""} · ₹{Number(item.amount || 0).toLocaleString("en-IN")}
              </p>
            </article>
          ))}
        </div>
      ) : viewMode === "table" ? (
        /* MODULE 1: Responsive Registration Table */
        <div className="admin-table-container">
          <div className="admin-records-count" style={{ padding: "14px 18px 0" }}>
            <span>Showing {filteredRecords.length ? (currentPage - 1) * pageSize + 1 : 0} – {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} registrations (Timezone: Asia/Kolkata IST)</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px" }}>Sort:</span>
              <select
                className="admin-select"
                style={{ padding: "4px 8px", fontSize: "12px" }}
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split("-");
                  setSortField(f);
                  setSortOrder(o);
                }}
              >
                <option value="createdAt-desc">Date (Newest First)</option>
                <option value="createdAt-asc">Date (Oldest First)</option>
                <option value="fullName-asc">Name (A–Z)</option>
                <option value="fullName-desc">Name (Z–A)</option>
                <option value="status-asc">Status</option>
              </select>
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant Name</th>
                  <th>Registration Type</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Submission Date & Time (IST)</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No registration records matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((item) => {
                    const isAccepted = item.status === "accepted";
                    const isRejected = item.status === "rejected";
                    const catClass = item.category === "Cadets" ? "cat-cadets" : item.category === "Volunteers" ? "cat-volunteers" : item.category === "Intern & Alumni" ? "cat-interns" : "cat-members";
                    const regId = item.registrationNumber || item.registrationId || "—";

                    return (
                      <tr key={item._id}>
                        <td>
                          <code>{regId}</code>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {item.photoFileId && (
                              <img
                                src={`/api/files/${item.photoFileId}`}
                                alt=""
                                style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                              />
                            )}
                            <strong>{item.fullName}</strong>
                          </div>
                        </td>
                        <td>
                          <span className={`category-badge ${catClass}`}>{item.category}</span>
                        </td>
                        <td>
                          {item.email ? <a href={`mailto:${item.email}`}>{item.email}</a> : "—"}
                        </td>
                        <td>
                          {item.phone ? <a href={`tel:${item.phone}`}>{item.phone}</a> : "—"}
                        </td>
                        <td>
                          <span style={{ whiteSpace: "nowrap" }}>{formatIST(item.createdAt)}</span>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>
                            {isAccepted ? <CheckCircle2 size={12} /> : isRejected ? <XCircle size={12} /> : <Clock size={12} />}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="id-btn"
                            style={{ padding: "5px 12px", fontSize: "12px", background: "var(--surface)", borderColor: "var(--border)" }}
                            onClick={() => setDetailsModalItem(item)}
                          >
                            <Eye size={13} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="admin-pagination">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>Rows per page:</span>
              <select
                className="admin-select"
                style={{ padding: "4px 8px", fontSize: "12px" }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="admin-pagination-controls">
              <span>Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                className="admin-pagination-btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="admin-pagination-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Alternate Cards View */
        <div className="records">
          <div className="admin-records-count">
            <span>Showing {paginatedRecords.length} of {filteredRecords.length} applications</span>
          </div>

          {paginatedRecords.length === 0 && (
            <div className="glass record" style={{ textAlign: "center", padding: "40px" }}>
              <p>{c.demo.noRecords}</p>
            </div>
          )}

          {paginatedRecords.map((item) => {
            const isAccepted = item.status === "accepted";
            const isRejected = item.status === "rejected";
            const isCurrentBusy = busy && actionId === item._id;
            const categoryClass = item.category === "Cadets" ? "cat-cadets" : item.category === "Volunteers" ? "cat-volunteers" : item.category === "Intern & Alumni" ? "cat-interns" : "cat-members";

            return (
              <article className="app-card" key={item._id}>
                <div className="app-header">
                  <h3>{item.fullName}</h3>
                  <div className="app-badge-group">
                    <span className={`category-badge ${categoryClass}`}>{item.category}</span>
                    <span className={`status-badge status-${item.status}`}>
                      {isAccepted ? <CheckCircle2 size={13} /> : isRejected ? <XCircle size={13} /> : <Clock size={13} />}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="app-info-grid">
                  <div className="app-info-item">
                    <span className="info-label">Registration ID</span>
                    <span className="info-val"><code>{item.registrationNumber || item.registrationId || "—"}</code></span>
                  </div>
                  <div className="app-info-item">
                    <span className="info-label">Email</span>
                    <span className="info-val"><a href={`mailto:${item.email}`}>{item.email}</a></span>
                  </div>
                  <div className="app-info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-val"><a href={`tel:${item.phone}`}>{item.phone || "—"}</a></span>
                  </div>
                  <div className="app-info-item">
                    <span className="info-label">Submission Date & Time (IST)</span>
                    <span className="info-val">{formatIST(item.createdAt)}</span>
                  </div>
                </div>

                <div className="app-actions-row">
                  <button
                    type="button"
                    className="id-btn"
                    style={{ background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}
                    onClick={() => setDetailsModalItem(item)}
                  >
                    <Eye size={14} /> View Application Details
                  </button>
                  {isAccepted && item.idCardFileId && (
                    <button
                      type="button"
                      className="id-btn"
                      onClick={() => setCardModalItem(item)}
                    >
                      <RotateCw size={14} /> 3D Flip ID Card
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* MODULE 2: Comprehensive Application Details Modal */}
      {detailsModalItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="details-title" onClick={() => setDetailsModalItem(null)}>
          <div className="admin-modal-box modal-large" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
              <div>
                <h3 id="details-title" style={{ margin: "0 0 6px" }}>{detailsModalItem.fullName}</h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className={`category-badge ${detailsModalItem.category === "Cadets" ? "cat-cadets" : detailsModalItem.category === "Volunteers" ? "cat-volunteers" : detailsModalItem.category === "Intern & Alumni" ? "cat-interns" : "cat-members"}`}>
                    {detailsModalItem.category}
                  </span>
                  <span className={`status-badge status-${detailsModalItem.status}`}>
                    {detailsModalItem.status === "accepted" ? <CheckCircle2 size={13} /> : detailsModalItem.status === "rejected" ? <XCircle size={13} /> : <Clock size={13} />}
                    {detailsModalItem.status.charAt(0).toUpperCase() + detailsModalItem.status.slice(1)}
                  </span>
                  <code style={{ fontSize: "12px" }}>{detailsModalItem.registrationNumber || detailsModalItem.registrationId}</code>
                </div>
              </div>
              <button type="button" className="text-button" onClick={() => setDetailsModalItem(null)}>✕ Close</button>
            </div>

            {/* Photo preview */}
            {detailsModalItem.photoFileId && (
              <div className="app-photo-thumb-container">
                <img
                  src={`/api/files/${detailsModalItem.photoFileId}`}
                  alt={detailsModalItem.fullName}
                  className="app-photo-thumb"
                  onClick={() => setPreviewPhoto(`/api/files/${detailsModalItem.photoFileId}`)}
                  title="Click to enlarge photograph"
                />
                <div>
                  <strong style={{ display: "block", fontSize: "14px", color: "var(--text)" }}>Official Applicant Photograph</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Submitted photograph for digital identity card issuance</span>
                </div>
              </div>
            )}

            {/* Submitted Data Fields */}
            <h4 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: "16px 0 10px" }}>
              Submitted Form Information
            </h4>
            <div className="app-details-subgrid">
              <div className="app-detail-card">
                <dt>Full Name</dt>
                <dd>{detailsModalItem.fullName}</dd>
              </div>
              <div className="app-detail-card">
                <dt>Email Address</dt>
                <dd><a href={`mailto:${detailsModalItem.email}`}>{detailsModalItem.email}</a></dd>
              </div>
              <div className="app-detail-card">
                <dt>Phone Number</dt>
                <dd><a href={`tel:${detailsModalItem.phone}`}>{detailsModalItem.phone || "—"}</a></dd>
              </div>
              {detailsModalItem.address && (
                <div className="app-detail-card" style={{ gridColumn: "1 / -1" }}>
                  <dt>Address</dt>
                  <dd>{detailsModalItem.address}</dd>
                </div>
              )}
              {Object.entries(detailsModalItem.details || {}).map(([key, val]) => (
                <div className="app-detail-card" key={key}>
                  <dt>{key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (l) => l.toUpperCase())}</dt>
                  <dd>{String(val)}</dd>
                </div>
              ))}
            </div>

            {/* Uploaded Documents */}
            {Boolean(detailsModalItem.files?.length) && (
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: "0 0 8px" }}>
                  Uploaded Documents & Proofs
                </h4>
                <div className="app-files-list">
                  {detailsModalItem.files.map((file, idx) => (
                    <a
                      key={file.fileId || idx}
                      href={`/api/files/${file.fileId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="app-file-chip"
                    >
                      <FileText size={14} />
                      <span>{file.name || file.filename || "Document"}</span>
                      {file.size && <span style={{ opacity: 0.65 }}>({Math.round(file.size / 1024)} KB)</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Trail */}
            <div className="app-audit-trail">
              <div className="app-audit-item">
                <span className="audit-label">Submitted At (IST)</span>
                <span className="audit-val">{formatIST(detailsModalItem.createdAt)}</span>
              </div>
              {detailsModalItem.status === "accepted" && (
                <>
                  <div className="app-audit-item">
                    <span className="audit-label">Approved At (IST)</span>
                    <span className="audit-val">{formatIST(detailsModalItem.approvedAt)}</span>
                  </div>
                  <div className="app-audit-item">
                    <span className="audit-label">Official Regd. No.</span>
                    <span className="audit-val">{detailsModalItem.registrationNumber || detailsModalItem.registrationId}</span>
                  </div>
                  <div className="app-audit-item">
                    <span className="audit-label">Validity Period</span>
                    <span className="audit-val">{detailsModalItem.validFrom ? `${formatIST(detailsModalItem.validFrom)} – ${formatIST(detailsModalItem.validUntil)}` : "Permanent"}</span>
                  </div>
                  {detailsModalItem.reviewedBy && (
                    <div className="app-audit-item">
                      <span className="audit-label">Reviewed By</span>
                      <span className="audit-val">{detailsModalItem.reviewedBy}</span>
                    </div>
                  )}
                </>
              )}
              {detailsModalItem.status === "rejected" && (
                <>
                  <div className="app-audit-item">
                    <span className="audit-label">Rejected At (IST)</span>
                    <span className="audit-val">{formatIST(detailsModalItem.rejectedAt)}</span>
                  </div>
                  {detailsModalItem.rejectionReason && (
                    <div className="app-audit-item" style={{ gridColumn: "1 / -1" }}>
                      <span className="audit-label">Rejection Reason</span>
                      <span className="audit-val" style={{ color: "#ef4444" }}>{detailsModalItem.rejectionReason}</span>
                    </div>
                  )}
                  {detailsModalItem.reviewedBy && (
                    <div className="app-audit-item">
                      <span className="audit-label">Reviewed By</span>
                      <span className="audit-val">{detailsModalItem.reviewedBy}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* AI Application Assistant: Verification Checklist & Duplicate Detection */}
            <ApplicationAiInsightsCard
              item={detailsModalItem}
              allRecords={records}
            />

            {/* Separated, Professional Email Status Card */}
            <EmailStatusCard
              item={detailsModalItem}
              busy={busy}
              onRetry={handleRetryEmail}
            />

            {/* Official Registration Number Assignment & ID Card Generation Panel */}
            {detailsModalItem.status === "accepted" && (
              <div
                className="admin-id-card-panel"
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "18px 20px",
                  borderRadius: "14px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-elevated)",
                  boxShadow: "var(--shadow)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <label
                      htmlFor="adminRegdNumberInput"
                      style={{
                        fontWeight: "750",
                        fontSize: "14px",
                        color: "var(--text)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Sparkles size={16} style={{ color: "var(--primary)" }} />
                      Official Registration Number (Regd. No.)
                    </label>
                    {detailsModalItem.idCardFileId && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          background: "color-mix(in srgb, var(--success) 16%, transparent)",
                          color: "var(--success)",
                          border: "1px solid color-mix(in srgb, var(--success) 35%, transparent)",
                        }}
                      >
                        ✓ ID Card Active
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      id="adminRegdNumberInput"
                      type="text"
                      value={adminRegNoInput}
                      onChange={(e) => setAdminRegNoInput(e.target.value)}
                      placeholder="e.g. ARWS/CADET/2026/001"
                      style={{
                        flex: "1 1 260px",
                        minWidth: "220px",
                        padding: "11px 14px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                        border: "1px solid var(--input-border)",
                        background: "var(--input-bg)",
                        color: "var(--text)",
                      }}
                    />
                    <button
                      type="button"
                      className="button"
                      disabled={busy || !adminRegNoInput.trim()}
                      onClick={() => handleGenerateIdCard(detailsModalItem, adminRegNoInput)}
                      style={{ whiteSpace: "nowrap", padding: "11px 20px" }}
                    >
                      <Sparkles size={16} />
                      {detailsModalItem.idCardFileId ? "Update & Re-generate ID Card" : "Generate ID Card"}
                    </button>
                  </div>

                  <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {detailsModalItem.idCardFileId
                      ? "The official registration number assigned above is printed on the member's verified double-sided ID card. You can modify it anytime and click 'Update & Re-generate ID Card' to reissue."
                      : "Assign the official registration number above before clicking 'Generate ID Card'. This number will be printed on the official ID card and linked to their account."}
                  </p>
                </div>
              </div>
            )}

            {/* Workflow Action Buttons */}
            <div className="app-actions-row" style={{ marginTop: "24px" }}>
              {detailsModalItem.status === "pending" ? (
                <>
                  <button
                    type="button"
                    className="button btn-accept"
                    disabled={busy}
                    onClick={() => handleOpenAccept(detailsModalItem)}
                  >
                    <CheckCircle2 size={16} /> Accept Application
                  </button>
                  <button
                    type="button"
                    className="button btn-decline"
                    disabled={busy}
                    onClick={() => {
                      setDeclineModalItem(detailsModalItem);
                      setDeclineReason("");
                    }}
                  >
                    <XCircle size={16} /> Decline Application
                  </button>
                </>
              ) : detailsModalItem.status === "accepted" ? (
                <>
                  {!detailsModalItem.idCardFileId ? (
                    <button
                      type="button"
                      className="button secondary"
                      disabled={busy}
                      onClick={() => handleSendApprovalEmail(detailsModalItem)}
                    >
                      <Send size={16} /> Send Acceptance Email
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => setCardModalItem(detailsModalItem)}
                      >
                        <Eye size={16} /> Preview ID Card
                      </button>
                      <button
                        type="button"
                        className="button"
                        onClick={() => handleDownloadIdCard(detailsModalItem)}
                      >
                        <Download size={16} /> Download ID Card (PDF)
                      </button>
                      <button
                        type="button"
                        className="button secondary"
                        disabled={busy}
                        onClick={() => handleSendApprovalEmail(detailsModalItem)}
                      >
                        <Send size={16} /> Send Acceptance Email
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => handleSendRejectionEmail(detailsModalItem)}
                >
                  <Send size={16} /> Send Rejection Email
                </button>
              )}
              <button
                type="button"
                className="button secondary"
                style={{ marginLeft: "auto" }}
                onClick={() => setDetailsModalItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: Acceptance Dialog with Regd No & Validity Assignment */}
      {acceptModalItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="accept-title">
          <div className="admin-modal-box">
            <h3 id="accept-title">Accept & Verify Registration</h3>
            <p>
              Assign the official Registration Number and Validity period for <strong>{acceptModalItem.fullName}</strong> ({acceptModalItem.category}):
            </p>

            {acceptError && (
              <div className="app-email-banner email-failed" style={{ marginBottom: "14px" }}>
                <span>{acceptError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "18px" }}>
              <div className="input-label-pair">
                <label htmlFor="regNoInput">Official Registration Number (Regd. No.):</label>
                <input
                  id="regNoInput"
                  type="text"
                  placeholder="e.g. AGNI-MEM-2026-0001"
                  value={acceptRegNo}
                  onChange={(e) => setAcceptRegNo(e.target.value)}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Unique official identifier assigned to this registrant.</small>
              </div>

              <div className="input-date-pair">
                <div className="input-label-pair">
                  <label htmlFor="validFromInput">Valid From:</label>
                  <input
                    id="validFromInput"
                    type="date"
                    value={acceptValidFrom}
                    onChange={(e) => setAcceptValidFrom(e.target.value)}
                  />
                </div>
                <div className="input-label-pair">
                  <label htmlFor="validUntilInput">Valid Until:</label>
                  <input
                    id="validUntilInput"
                    type="date"
                    value={acceptValidUntil}
                    onChange={(e) => setAcceptValidUntil(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => setAcceptModalItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button btn-accept"
                disabled={busy}
                onClick={handleAcceptConfirm}
              >
                {busy ? "Processing..." : "Confirm & Accept"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: Decline Application Modal */}
      {declineModalItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="decline-title">
          <div className="admin-modal-box">
            <h3 id="decline-title">Decline Application</h3>
            <p>
              Are you sure you want to decline the application for <strong>{declineModalItem.fullName}</strong>?
            </p>
            <label htmlFor="rejectionReason" style={{ display: "block", fontSize: "12px", fontWeight: "600", marginBottom: "6px", color: "var(--text)" }}>
              Optional Rejection Reason:
            </label>
            <textarea
              id="rejectionReason"
              className="admin-modal-textarea"
              placeholder="Enter reason for declining (e.g., age criteria not met, incomplete documentation)..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="admin-modal-actions">
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  setDeclineModalItem(null);
                  setDeclineReason("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button btn-decline"
                disabled={busy}
                onClick={handleDeclineConfirm}
              >
                {busy ? "Processing..." : "Confirm & Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6 & 7: 3D Interactive Flip Digital ID Card Modal */}
      {cardModalItem && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true" onClick={() => setCardModalItem(null)}>
          <div className="admin-modal-box modal-large" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Official 3D Digital Identity Card</h3>
              <button type="button" className="text-button" onClick={() => setCardModalItem(null)}>✕ Close</button>
            </div>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-muted)" }}>
              Interactive 3D view alternates between Front and Back every 5 seconds. Use buttons below to pause, switch sides, or download official PDF.
            </p>

            <DigitalIdCard3D
              record={cardModalItem}
              allowDownload={true}
              onDownload={() => handleDownloadIdCard(cardModalItem)}
            />

            <div style={{ marginTop: "24px" }}>
              <button type="button" className="button secondary" onClick={() => setCardModalItem(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal: Photo Preview */}
      {previewPhoto && (
        <div className="admin-modal-overlay" onClick={() => setPreviewPhoto(null)}>
          <div style={{ maxWidth: "90vw", maxHeight: "90vh", padding: "10px", background: "#000", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <img src={previewPhoto} alt="Applicant Preview" style={{ maxWidth: "100%", maxHeight: "80vh", display: "block", borderRadius: "8px" }} />
            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <button type="button" className="button secondary" onClick={() => setPreviewPhoto(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
