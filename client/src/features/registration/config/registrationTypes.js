export const registrationRoleConfig = Object.freeze({
  Member: { formId: "memberForm", apiType: "Member", routeType: "Register Member" },
  Cadet: { formId: "cadetEnrollmentForm", apiType: "Cadet", routeType: "Register Cadets" },
  Volunteer: { formId: "volunteerForm", apiType: "Volunteer", routeType: "Register Volunteers" },
  "Intern & Alumni Member": { formId: "internForm", apiType: "Intern & Alumni Member", routeType: "Register Intern & Alumni Members" },
});
export const formIdToRegistrationType = Object.freeze(
  Object.fromEntries(Object.entries(registrationRoleConfig).map(([label, config]) => [config.formId, config.apiType])),
);
export const accountTypeToRouteType = Object.freeze(
  Object.fromEntries(Object.entries(registrationRoleConfig).map(([label, config]) => [label, config.routeType])),
);
