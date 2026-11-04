import { useEffect, useState } from "react";
import { setSession } from "../../api";
import { useToast } from "../../toast-context";
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
        setHeight(Math.max(500, Math.min(20000, Number(message.height) || 900)));
        return;
      }
      if (!["account", "application", "member-payment"].includes(message.type)) return;
      setBusy(true);
      try {
        const entries = safeEntries(message.entries || []);
        const values = entriesToValues(entries);
        if (message.type === "account") {
          const fields = frame.current.contentWindow.document;
          if (fields.getElementById("regPassword").value !== fields.getElementById("regConfirmPassword").value)
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
            consent: "true",
          };
          const photo = fields.getElementById("regPhoto").files?.[0];
          const accountBody = new FormData();
          Object.entries(body).forEach(([key, value]) => accountBody.append(key, typeof value === "string" ? value : JSON.stringify(value)));
          if (photo) accountBody.append("photo", photo);
          const data = await registrationApi.createAccount(accountBody);
          setSession(data);
          const registrationMessage = data.user.status === "approved"
            ? "Account created successfully. Your identity card is ready in your profile."
            : "Account created successfully. Your identity card will be available in your profile after administrator approval.";
          toast(registrationMessage, "success");
          frame.current.contentWindow.postMessage({type:"registration-result", ok:true, message:registrationMessage}, "*");
        } else {
          const files = (message.files || []).filter(({name}) => !/(?:aadhaar|aadhar|pan)/i.test(name));
          const fd = new FormData();
          const type = message.type === "member-payment" ? "Member" : formIdToRegistrationType[message.formId] || "Member";
          fd.append("type", type);
          fd.append("data", JSON.stringify(values));
          files.forEach(({file}) => fd.append("attachments", file));
          const result = await registrationApi.submitApplication(fd);
          toast(result.message || "Registration submitted successfully.", "success");
          frame.current.contentWindow.postMessage({type:"registration-result", ok:true, formId:message.formId, message:result.message || "Registration submitted successfully."}, "*");
        }
      } catch (e) {
        const fieldNames = e.fields || Object.keys(e.errors || {});
        const labels = fieldNames.map((name) => fieldLabel(frame.current.contentWindow.document, name));
        const messageText = labels.length ? `${e.message || "Please check the required information."} Fields: ${labels.join(", ")}.` : (e.message || "Registration could not be submitted.");
        toast(messageText, "error");
        frame.current.contentWindow.postMessage({type:"registration-result", ok:false, formId:message.formId, message:e.message || "Registration could not be submitted."}, "*");
      } finally { setBusy(false); }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  return { busy, height };
}
