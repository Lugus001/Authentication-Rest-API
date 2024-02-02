// authentication helper
// to encrypt the password or create a random token
import crypto from "crypto";

// randomizer
export const random = () => crypto.randomBytes(128).toString("base64");

const SECRET = "KAEM-REST-API";

// authentication
export const authentication = (salt: string, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};
