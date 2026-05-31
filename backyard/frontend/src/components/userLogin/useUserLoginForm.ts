import { useState, type FormEvent } from "react";
import { loginUser, registerUser } from "../../services/api";
import {
  emptyFieldErrors,
  validateAuthForm,
} from "./validation";

export type UserData = {
  firstName: string;
  lastName: string;
  club: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

const initialUser: UserData = {
  firstName: "",
  lastName: "",
  club: "",
  email: "",
  confirmEmail: "",
  password: "",
  confirmPassword: "",
};

type UseUserLoginFormProps = {
  onAuthSuccess: () => void | Promise<void>;
};

export function useUserLoginForm({ onAuthSuccess }: UseUserLoginFormProps) {
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [user, setUser] = useState<UserData>(initialUser);
  const [fieldErrors, setFieldErrors] = useState(emptyFieldErrors);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const isFormBlocked = hasFieldErrors || isSubmitting;

  function getFieldErrors(nextUser: UserData, nextMode = isRegisterMode) {
    // Hela formulärobjektet valideras varje gång, så fält som beror på varandra hänger ihop.
    return validateAuthForm(nextUser, {
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
    setFieldErrors(getFieldErrors(user, nextMode));
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

      if (isRegisterMode) {
        await registerUser({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password,
          club: user.club || null,
        });
      } else {
        await loginUser({
          email: user.email,
          password: user.password,
        });
      }

      setSuccess(true);
      await onAuthSuccess();
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
    isFormBlocked,
    isSubmitting,
    setIsRegisterMode: handleRegisterModeChange,
    handleSubmit,
    handleFirstNameChange,
    handleLastNameChange,
    handleClubChange,
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  };
}
