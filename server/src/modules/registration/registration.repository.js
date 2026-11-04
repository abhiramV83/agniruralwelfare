import { RegistrationApplication } from "../../models.js";

export const registrationRepository = {
  createApplication(payload) {
    return RegistrationApplication.create(payload);
  },
};
