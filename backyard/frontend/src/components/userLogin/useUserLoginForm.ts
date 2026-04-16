import { useState } from "react";
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
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

const initialUser: UserData = {
  userName: "",
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

export function useUserLoginForm() {
  const [error, setError] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [user, setUser] = useState<UserData>(initialUser);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(initialFieldErrors);
  const [success, setSuccess] = useState(false);

  const hasFieldErrors = Object.values(fieldErrors).some(Boolean);
  const isFormBlocked = !!error || hasFieldErrors;

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (hasFieldErrors) {
      setError("Korrigera fälten ovan.");
      setSuccess(false);
      return;
    }

    setError("");
    setSuccess(true);
  }

  return {
    user,
    error,
    success,
    fieldErrors,
    isRegisterMode,
    isFormBlocked,
    setIsRegisterMode,
    handleSubmit,
    handleUserNameChange,
    handleEmailChange,
    handleConfirmEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
  };
}
