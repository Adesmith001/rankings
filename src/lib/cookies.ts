"use client";

const COOKIE_EXPIRY_DAYS = 365; // Vote tracking cookie valid for 1 year

export function setCookie(name: string, value: string, days: number = COOKIE_EXPIRY_DAYS): void {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const VOTE_COOKIE_PREFIX = "campus_vote_";

export function hasVotedCookie(categoryKey: string): boolean {
  return getCookie(VOTE_COOKIE_PREFIX + categoryKey) === "true";
}

export function setVotedCookie(categoryKey: string): void {
  setCookie(VOTE_COOKIE_PREFIX + categoryKey, "true");
}
