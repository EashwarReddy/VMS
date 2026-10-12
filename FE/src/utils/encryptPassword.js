import CryptoJS from "crypto-js";

// Encrypt the password
export const encryptPassword = (password, ivBase64, secretKey) => {
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const encrypted = CryptoJS.AES.encrypt(
    password,
    CryptoJS.enc.Base64.parse(secretKey),
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encrypted.ciphertext.toString(CryptoJS.enc.Base64)
 
};
