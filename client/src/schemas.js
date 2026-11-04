import { z } from "zod";
export function schemaFor(fields) {
  const shape = {};
  for (const f of fields) {
    let rule;
    if (f.type === "checkbox-group")
      rule = f.required ? z.array(z.string()).min(1, "Choose at least one option.") : z.array(z.string()).optional();
    else if (f.type === "radio-group")
      rule = f.required ? z.enum(f.options, { error: "Choose an option." }) : z.enum(f.options).optional();
    else if (f.type === "checkbox")
      rule = f.required
        ? z.literal(true, { error: "Please confirm this field." })
        : z.boolean().optional();
    else if (f.type === "file")
      rule = z
        .custom((v) => !f.required || v?.length > 0, "Choose a file.")
        .refine(
          (v) => !v?.[0] || v[0].size <= 5 * 1024 * 1024,
          "Maximum file size is 5 MB.",
        )
        .refine(
          (v) =>
            !v?.[0] ||
            !f.accept ||
            f.accept
              .split(",")
              .some((a) =>
                a.startsWith(".")
                  ? v[0].name.toLowerCase().endsWith(a)
                  : a.endsWith("/*")
                    ? v[0].type.startsWith(a.slice(0, -1))
                    : a === v[0].type,
              ),
          "Unsupported file type.",
        );
    else if (f.type === "number")
      rule = z.coerce
        .number()
        .min(1, "Enter an amount of at least ₹1.")
        .max(1000000);
    else {
      rule = z.string().max(f.type === "textarea" ? 3000 : 254);
      if (f.required) rule = rule.trim().min(1, "This field is required.");
      if (f.type === "email") rule = rule.email("Enter a valid email address.");
      if (f.type === "tel")
        rule = rule.regex(/^[+\d ()-]{7,30}$/, "Enter a valid phone number.");
      if (f.name === "username")
        rule = rule.regex(
          /^[a-zA-Z0-9_.-]{3,40}$/,
          "Use 3–40 letters, numbers, dots, hyphens or underscores.",
        );
      if (f.name === "password" && f.placeholder === "Create a password")
        rule = rule
          .min(10, "Use at least 10 characters.")
          .max(72)
          .regex(/[A-Z]/, "Include an uppercase letter.")
          .regex(/[a-z]/, "Include a lowercase letter.")
          .regex(/[0-9]/, "Include a number.");
      if (!f.required) rule = rule.optional();
    }
    shape[f.name] = rule;
  }
  return z.object(shape);
}
