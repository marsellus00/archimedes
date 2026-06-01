import { type NextRequest } from "next/server";

export type EngineeringRequestUser = {
 id?: string;
 email: string;
 name?: string;
 authenticationStatus:
 | "trusted_header_present"
 | "development_header_present"
 | "required_but_missing";
};

const DEFAULT_LOCAL_EMAIL = "local.engineer@example.com";

export function getEngineeringRequestUser(request: NextRequest): EngineeringRequestUser {
 const email = request.headers.get("x-engineering-user-email")?.trim();
 const id = request.headers.get("x-engineering-user-id")?.trim();
 const name = request.headers.get("x-engineering-user-name")?.trim();
 const trustedHeaderPresent = Boolean(email || id);

 const trustedHeadersEnabled =
 process.env.ENABLE_TRUSTED_AUTH_HEADERS === "true" ||
 process.env.NODE_ENV !== "production";
 const allowLocalUser =
 process.env.ENABLE_LOCAL_DEV_USER === "true" ||
 process.env.NODE_ENV !== "production";

 if (trustedHeaderPresent && trustedHeadersEnabled) {
 return {
 id: id || undefined,
 email: email || `${id}@engineering.local`,
 name: name || undefined,
 authenticationStatus:
 process.env.NODE_ENV === "production"
 ? "trusted_header_present"
 : "development_header_present",
 };
 }

 if (allowLocalUser) {
 return {
 email: process.env.LOCAL_DEV_USER_EMAIL || DEFAULT_LOCAL_EMAIL,
 name: process.env.LOCAL_DEV_USER_NAME || "Local Engineer",
 authenticationStatus: "development_header_present",
 };
 }

 return {
 email: "",
 authenticationStatus: "required_but_missing",
 };
}
