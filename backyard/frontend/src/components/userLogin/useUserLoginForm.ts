import { useState, type FormEvent } from "react";
import { loginOrganizer, loginRunner, registerOrganizer, registerRunner } from "../../services/api";
import type { AuthResponse, AuthRole } from "../../types/types";
import {
  type FieldErrors,
  validateUserName,
  validateEmail,
  validateConfirmEmail,
  validatePassword,
  validateConfirmPassword,
} from "./validation";

export type UserData = {
  userName: string;
  firstName: string;
  lastName: string;
  club: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

const initialUser: UserData = {
  userName: "",
  firstName: "",
  lastName: "",
  club: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
};

const initialFieldErrors: FieldErrors = {
  userName: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
};

type UseUserLoginFormProps = {
  onAuthSuccess: (auth: AuthResponse) => void;
};

export function useUserLoginForm({ onAuthSuccess }: UseUserLoginFormProps) {
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authRole, setAuthRole] = useState<AuthRole>("organizer");
  const [user, setUser] = useState<UserData>(initialUser);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(initialFieldErrors);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const isFormBlocked = hasFieldErrors || isSubmitting;

  function updateField<Key extends keyof UserData>(key: Key, value: UserData[Key]) {
    setUser((previous) => ({ ...previous, [key]: value }));
  }

  function updateFieldError<Key extends keyof FieldErrors>(
    key: Key,
    value: FieldErrors[Key],
  ) {
    setFieldErrors((previous) => ({ ...previous, [key]: value }));
  }

  function handleUserNameChange(value: string) {
    updateField("userName", value);
    updateFieldError("userName", validateUserName(value));
  }

  function handleFirstNameChange(value: string) {
    updateField("firstName", value);
  }

  function handleLastNameChange(value: string) {
    updateField("lastName", value);
  }

  function handleClubChange(value: string) {
    updateField("club", value);
  }

  function handleEmailChange(value: string) {
    updateField("email", value);
    updateFieldError("email", validateEmail(value));
    updateFieldError("confirmEmail", validateConfirmEmail(value, user.confirmEmail));
  }

  function handleConfirmEmailChange(value: string) {
    updateField("confirmEmail", value);
    updateFieldError("confirmEmail", validateConfirmEmail(user.email, value));
  }

  function handlePasswordChange(value: string) {
    updateField("password", value);
    updateFieldError("password", validatePassword(value));
    updateFieldError("confirmPassword", validateConfirmPassword(value, user.confirmPassword));
  }

  function handleConfirmPasswordChange(value: string) {
    updateField("confirmPassword", value);
    updateFieldError("confirmPassword", validateConfirmPassword(user.password, value));
  }

  function validateBeforeSubmit() {
    const nextErrors: FieldErrors = {
      userName: isRegisterMode && authRole === "organizer" ? validateUserName(user.userName) : "",
      email: validateEmail(user.email),
      confirmEmail: isRegisterMode ? validateConfirmEmail(user.email, user.confirmEmail) : "",
      password: validatePassword(user.password),
      confirmPassword: isRegisterMode
        ? validateConfirmPassword(user.password, user.confirmPassword)
        : "",
    };

    setFieldErrors(nextErrors);

    if (isRegisterMode && authRole === "runner" && (!user.firstName.trim() || !user.lastName.trim())) {
      setError("Förnamn och efternamn krävs för löparkonto.");
      return false;
    }

    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateBeforeSubmit()) {
      setError("Korrigera fälten ovan.");
      setSuccess(false);
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      const auth = authRole === "organizer"
        ? isRegisterMode
          ? await registerOrganizer({
              name: user.userName,
              email: user.email,
              password: user.password,
            })
          : await loginOrganizer({
              email: user.email,
              password: user.password,
            })
        : isRegisterMode
          ? await registerRunner({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              password: user.password,
              club: user.club || null,
            })
          : await loginRunner({
              email: user.email,
              password: user.password,
            });

      setSuccess(true);
      onAuthSuccess(auth);
    } catch (err) {
      setSuccess(false);
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    user,
    error,
    success,
    fieldErrors,
    isRegisterMode,
    authRole,
    isFormBlocked,
    isSubmitting,
    setIsRegisterMode,
    setAuthRole,
    handleSubmit,
    handleUserNameChange,
    handleFirstNameChange,
    handleLastNameChange,
    handleClubChange,
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  };
}
