const ROLES = {
  admin: "Admin",
  visitor: "Visitor",
  host: "Host",
  planner: "Planner",
  securityGuard: "SecurityGuard",
};

const ACCESS_TOKEN_AGE = "1h";
const REFRESH_TOKEN_AGE = "2d";
const EMAIL_VERIFICATION_TOKEN_AGE = "1d";
const EMAIL_PASSWORD_RESET_TOKEN_AGE = "1d";

const COOKIE_AGE = 1000 * 60 * 60 * 24;
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  // sameSite: "none",
  secure: true, //Sends cookies only on https
  maxAge: COOKIE_AGE,
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict",
  // sameSite: "none",
  secure: true, //Sends cookies only on https
  // maxAge: COOKIE_AGE,
  path: "/",
};

module.exports = {
  ROLES,
  ACCESS_TOKEN_AGE,
  REFRESH_TOKEN_AGE,
  EMAIL_VERIFICATION_TOKEN_AGE,
  EMAIL_PASSWORD_RESET_TOKEN_AGE,
  COOKIE_AGE,
  SESSION_COOKIE_OPTIONS,
  COOKIE_OPTIONS,
};
