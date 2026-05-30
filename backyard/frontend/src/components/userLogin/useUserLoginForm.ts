import { useState, type FormEvent } from "react";
import { loginOrganizer, loginRunner, registerOrganizer, registerRunner } from "../../services/api";
import type { AuthResponse, AuthRole } from "../../types/types";
import {
  emptyFieldErrors,
  validateAuthForm,
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

type UseUserLoginFormProps = {
  onAuthSuccess: (auth: AuthResponse) => void;
};

export function useUserLoginForm({ onAuthSuccess }: UseUserLoginFormProps) {
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authRole, setAuthRole] = useState<AuthRole>("organizer");
  const [user, setUser] = useState<UserData>(initialUser);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const isFormBlocked = hasFieldErrors || isSubmitting;

  function getFieldErrors(nextUser: UserData, nextRole = authRole, nextMode = isRegisterMode) {
    // Hela formulärobjektet valideras varje gång, så fält som beror på varandra hänger ihop.
    return validateAuthForm(nextUser, {
      authRole: nextRole,
      isRegisterMode: nextMode,
    });
  }

  function updateField<Key extends keyof UserData>(key: Key, value: UserData[Key]) {
    setUser((previous) => {
      // Bygg ett nytt objekt först. Då validerar Zod samma data som React snart visar.
      const nextUser = { ...previous, [key]: value };

      setFieldErrors(getFieldErrors(nextUser));

      return nextUser;
    });
  }

  function handleRegisterModeChange(nextMode: boolean) {
    setIsRegisterMode(nextMode);
    setFieldErrors(getFieldErrors(user, authRole, nextMode));
  }

  function handleAuthRoleChange(nextRole: AuthRole) {
    setAuthRole(nextRole);
    setFieldErrors(getFieldErrors(user, nextRole, isRegisterMode));
  }

  function handleUserNameChange(value: string) {
    updateField("userName", value);
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
  }

  function handleConfirmEmailChange(value: string) {
    updateField("confirmEmail", value);
  }

  function handlePasswordChange(value: string) {
    updateField("password", value);
  }

  function handleConfirmPasswordChange(value: string) {
    updateField("confirmPassword", value);
  }

  function validateBeforeSubmit() {
    const nextErrors = getFieldErrors(user);

    setFieldErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Submit gör samma objektvalidering en sista gång innan API-anropet skickas.
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
    setIsRegisterMode: handleRegisterModeChange,
    setAuthRole: handleAuthRoleChange,
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
