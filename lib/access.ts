export const ACCESS_COOKIE_NAME = "event_access";

export function getAccessToken() {
  return process.env.EVENT_ACCESS_TOKEN ?? "";
}

export function getEventPasscode() {
  return process.env.EVENT_PASSCODE ?? "";
}
