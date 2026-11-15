import { useEffect, useState } from "react";
import { setSession } from "../../api";
import { useToast } from "../../toast-context";
import { useConfirmationDialog } from "../../success-popup-context";
import { registrationApi } from "./services/registrationApi";
import { accountTypeToRouteType, formIdToRegistrationType } from "./config/registrationTypes";

const safeEntries = (entries) => entries.filter(([key]) => !/(?:aadhaar|aadhar|pan|income|bankaccount|ifsc)/i.test(key));
const entriesToValues = (entries) => entries.reduce((values, [key, value]) => {
  if (Object.hasOwn(values, key)) values[key] = [...(Array.isArray(values[key]) ? values[key] : [values[key]]), value];
  else values[key] = value;
  return values;
}, {});
function fieldLabel(doc, name) {
  const field = Array.from(doc.querySelectorAll("[name], [id]")).find((node) => node.name === name || node.id === name);
  if (!field) return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
  const group = field.closest(".member-field, .cadet-field, .program-field, .auth-group, .field, fieldset, .cadet-upload-card, .program-upload-card");
  const text = field.labels?.[0]?.textContent || group?.querySelector("label, h4, legend")?.textContent || field.getAttribute("aria-label") || field.name;
  return text.replace(/\s+/g, " ").replace(/^(?:\d+[.)]\s*)+/, "").replace(/\s*\*\s*$/, "").trim();
}
export function useRegistrationBridge(frame) {
  const [busy, setBusy] = useState(false);
  const [height, setHeight] = useState(900);
  const toast = useToast();
  const { showConfirmation, showSuccessPopup } = useConfirmationDialog();
  useEffect(() => {
    const receive = async (event) => {
      if (event.source !== frame.current?.contentWindow) return;
      const message = event.data || {};
      if (message.type === "registration-validation") {
        const names = message.fields || [];
        toast(names.length ? `Please check: ${names.join(", ")}.` : "Please check the highlighted fields.", "error");
        return;
      }
      if (message.type === "registration-height") {
        setHeight(Math.max(350, Math.min(20000, Number(message.height) || 900)));
        return;
      }
      if (!["account", "application", "member-payment"].includes(message.type)) return;
      setBusy(true);
      try {
        const entries = safeEntries(message.entries || []);
        const values = entriesToValues(entries);
        if (message.type === "account") {
          const fields = frame.current.contentWindow.document;
          const pass = fields.getElementById("regPassword")?.value || "";
          const confirmPass = fields.getElementById("regConfirmPassword")?.value || "";
          if (pass.length < 8)
            throw Object.assign(new Error("Password must contain at least 8 characters."), { fields: ["regPassword"] });
          if (pass.length > 64)
            throw Object.assign(new Error("Password cannot exceed 64 characters."), { fields: ["regPassword"] });
          if (!/[A-Z]/.test(pass))
            throw Object.assign(new Error("Password must contain at least one uppercase letter (A–Z)."), { fields: ["regPassword"] });
          if (!/[a-z]/.test(pass))
            throw Object.assign(new Error("Password must contain at least one lowercase letter (a–z)."), { fields: ["regPassword"] });
          if (!/[0-9]/.test(pass))
            throw Object.assign(new Error("Password must contain at least one number (0–9)."), { fields: ["regPassword"] });
          if (!/[^A-Za-z0-9]/.test(pass))
            throw Object.assign(new Error("Password must contain at least one special character (!@#$%^&* etc.)."), { fields: ["regPassword"] });
          if (pass !== confirmPass)
            throw Object.assign(new Error("Passwords do not match. Please enter the same password twice."), { fields: ["regConfirmPassword"] });
          const body = {
            fullName: fields.getElementById("regFullName").value,
            username: fields.getElementById("regUsername").value,
            email: fields.getElementById("regEmail").value,
            guardian: fields.getElementById("regGuardian").value,
            address: [fields.getElementById("regState").value, fields.getElementById("regDistrict").value].filter(Boolean).join(", "),
            bloodGroup: fields.getElementById("regBloodGroup").value,
            dob: fields.getElementById("regDOB").value,
            enrollmentDate: fields.getElementById("regEnrollDate").value,
            registrationType: accountTypeToRouteType[fields.getElementById("regAccountType").value] || "Register Member",
            registrationDetails: { accountType: fields.getElementById("regAccountType").value },
            password: fields.getElementById("regPassword").value,
            confirmPassword: fields.getElementById("regConfirmPassword").value,
            consent: "true",
          };
          const photo = fields.getElementById("regPhoto").files?.[0];
          const accountBody = new FormData();
          Object.entries(body).forEach(([key, value]) => accountBody.append(key, typeof value === "string" ? value : JSON.stringify(value)));
          if (photo) accountBody.append("photo", photo);
          const data = await registrationApi.createAccount(accountBody);
          setSession(data);
          const categoryLabel = body.registrationType.replace(/^Register\s+/, "");
          const registrationMessage = `Your ${categoryLabel} Registration form is submitted successfully!\n\nThank You for Your Support!\nYour kindness and generosity help us create a better tomorrow.`;
          toast(registrationMessage, "success", 7000);
          showSuccessPopup({
            heading: `Your ${categoryLabel} Registration Form is Submitted Successfully!`,
            message: "Your registration application has been received and recorded in our official database.",
            category: categoryLabel.toLowerCase(),
            referenceId: data.memberId || data.registrationId || data.registrationNumber || null,
            applicantName: body.fullName,
            details: [
              { label: "Email Address", value: body.email },
              { label: "Category", value: categoryLabel },
              { label: "Date of Birth", value: body.dob || "—" },
            ],
          });
          frame.current.contentWindow.postMessage({
            type: "registration-result",
            ok: true,
            category: categoryLabel,
            message: registrationMessage,
          }, "*");
        } else {
          const files = (message.files || []).filter(({name}) => !/(?:aadhaar|aadhar|pan)/i.test(name));
          const fd = new FormData();
          const type = message.type === "member-payment" ? "Member" : formIdToRegistrationType[message.formId] || "Member";
          fd.append("type", type);
          fd.append("data", JSON.stringify(values));
          files.forEach(({file}) => fd.append("attachments", file));
          const result = await registrationApi.submitApplication(fd);
          const formName = type === "Cadet" ? "Cadet Enrollment" : type === "Volunteer" ? "Volunteer Registration" : type.includes("Intern") ? "Internship & Alumni Application" : "Member Registration";
          const successMsg = `Your ${formName} form is submitted successfully!\n\nThank You for Your Support!\nYour kindness and generosity help us create a better tomorrow.`;
          toast(successMsg, "success", 7000);
          showSuccessPopup({
            heading: `Your ${formName} Form is Submitted Successfully!`,
            message: "Your application has been received and is pending administrative verification.",
            category: type.toLowerCase(),
            referenceId: result.registrationId || result.reference || null,
            applicantName: values.fullName || values.name || null,
            details: [
              { label: "Registration Type", value: formName },
              { label: "Submission Reference", value: result.registrationId || "Recorded" },
              { label: "Email", value: values.email || values.memberEmail || "—" },
            ],
          });
          frame.current.contentWindow.postMessage({
            type: "registration-result",
            ok: true,
            formId: message.formId,
            category: type,
            formName,
            registrationId: result.registrationId,
            message: successMsg,
          }, "*");
        }
      } catch (e) {
        const fieldNames = e.fields || Object.keys(e.errors || {});
        const labels = fieldNames.map((name) => fieldLabel(frame.current.contentWindow.document, name));
        const messageText = labels.length ? `${e.message || "Please check the required information."} Fields: ${labels.join(", ")}.` : (e.message || "Registration could not be submitted.");
        toast(messageText, "error");
        showConfirmation({
          type: "error",
          title: "Registration Submission Failed",
          message: messageText,
          actionText: "Review & Correct",
        });
        frame.current.contentWindow.postMessage({type:"registration-result", ok:false, formId:message.formId, message:e.message || "Registration could not be submitted."}, "*");
      } finally { setBusy(false); }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return { busy, height };
}
