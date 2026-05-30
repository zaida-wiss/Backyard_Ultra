import { z } from "zod";
import type { AuthRole } from "../../types/types";

export type FieldErrors = {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

export type AuthFormData = {
  userName: string;
  firstName: string;
  lastName: string;
  club: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

type AuthFormOptions = {
  authRole: AuthRole;
  isRegisterMode: boolean;
};

const emptyFieldErrors: FieldErrors = {
  userName: "",
  firstName: "",
  lastName: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
};

// Små fältscheman återanvänds i större objekt. Det håller reglerna samlade.
const userNameSchema = z
  .string()
  .trim()
  .min(1, "Namn krävs")
  .min(5, "Användarnamnet måste innehålla minst 5 bokstäver");

const nameSchema = (fieldName: string) => {
  return z.string().trim().min(1, `${fieldName} krävs`);
};

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email krävs")
  .refine((value) => !/[åäö]/i.test(value), "E-postadressen innehåller felaktiga symboler")
  .email("Emailen måste innehålla @");

const passwordSchema = z
  .string()
  .min(8, "Lösenordet behöver ha minst 8 tecken");

// Login behöver bara email och lösenord.
const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const addConfirmationIssues = (
  data: {
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
  },
  ctx: z.RefinementCtx,
) => {
  // superRefine används när en regel beror på flera fält i samma objekt.
  if (data.confirmEmail !== data.email) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmEmail"],
      message: "E-postadresserna måste stämma överens",
    });
  }

  if (data.confirmPassword !== data.password) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Lösenorden behöver stämma överens",
    });
  }
};

// Register-scheman bygger vidare på login-schemat så vi slipper duplicera email/lösenord.
const organizerRegisterSchema = loginSchema.extend({
  confirmEmail: z.string(),
  confirmPassword: z.string(),
  userName: userNameSchema,
}).superRefine(addConfirmationIssues);

const runnerRegisterSchema = loginSchema.extend({
  confirmEmail: z.string(),
  confirmPassword: z.string(),
  firstName: nameSchema("Förnamn"),
  lastName: nameSchema("Efternamn"),
}).superRefine(addConfirmationIssues);

const getSchema = ({ authRole, isRegisterMode }: AuthFormOptions) => {
  // Vilket schema som gäller beror på om användaren loggar in eller registrerar sig.
  if (!isRegisterMode) {
    return loginSchema;
  }

  return authRole === "organizer" ? organizerRegisterSchema : runnerRegisterSchema;
};

const validateAuthForm = (
  user: AuthFormData,
  options: AuthFormOptions,
): FieldErrors => {
  // safeParse kastar inte error. Det ger ett resultat vi kan översätta till UI-fel.
  const result = getSchema(options).safeParse(user);
  const errors = { ...emptyFieldErrors };

  if (!result.success) {
    // Zod kan ge flera fel. Här sparar vi första felet per fält för enkel UI-visning.
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0];

      if (typeof fieldName === "string" && fieldName in errors) {
        errors[fieldName as keyof FieldErrors] ||= issue.message;
      }
    }
  }

  return errors;
};

export {
  emptyFieldErrors,
  validateAuthForm,
};
