// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");

const logger = require("../configs/logger");
const {
  scryptSync,
  randomBytes,
  timingSafeEqual,
  createDecipheriv,
} = require("crypto");
const encryptPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  } catch (error) {
    logger.error(error);
    console.log(error);
    return null;
  }
};

const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(error);
    console.log(error);
    return null;
  }
};
const decryptPasswordFromReqBody = (encryptedData, iv, secretKey) => {
  const decipher = createDecipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "base64"),
    Buffer.from(iv, "base64")
  );

  let decrypted = decipher.update(encryptedData, "base64", "utf-8");
  decrypted += decipher.final("utf-8");

  return decrypted;
};
module.exports = {
  encryptPassword,
  verifyPassword,
  decryptPasswordFromReqBody
};
