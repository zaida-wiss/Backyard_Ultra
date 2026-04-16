export type FieldErrors = {
  userName: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
};

export function validateUserName(value: string): string {
  return value.length > 0 && value.length <= 4
    ? "Användarnamnet måste innehålla minst 5 bokstäver"
    : "";
}

export function validateEmail(value: string): string {
  if (/[åäö]/i.test(value)) {
    return "E-postadressen innehåller felaktiga symboler";
  }

  if (!value.includes("@")) {
    return "Emailen måste innehålla @";
  }

  return "";
}

export function validateConfirmEmail(email: string, confirmEmail: string): string {
  return email && confirmEmail !== email
    ? "E-postadresserna måste stämma överens"
    : "";
}

export function validatePassword(value: string): string {
  return value.length <= 7 ? "Lösenordet behöver ha minst 8 tecken" : "";
}

export function validateConfirmPassword(password: string, confirmPassword: string): string {
  return password && confirmPassword !== password
    ? "Lösenorden behöver stämma överens"
    : "";
}
