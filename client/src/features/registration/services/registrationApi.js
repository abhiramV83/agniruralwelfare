import { api } from "../../../api";

export const registrationApi = {
  createAccount(formData) {
    return api("/auth/register", { method: "POST", body: formData });
  },
  submitApplication(formData) {
    return api("/registration-applications", { method: "POST", body: formData });
  },
};
