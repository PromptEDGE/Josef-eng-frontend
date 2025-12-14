import { logger } from "@/utils/logger";
export function validateEmail(email: string) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
}
export function validatePassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
}
export function validateName(name: string) {
  return name.length >= 2 && /^[A-Za-z]+$/.test(name);
}
