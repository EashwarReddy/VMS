const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { Writable } = require("node:stream");
const target = path.join(__dirname, "../BE/.workspace.env");
if (fs.existsSync(target)) {
  console.log(
    "BE/.workspace.env already exists. Existing configuration was preserved.",
  );
  process.exit(0);
}
let mute = false;
const output = new Writable({
  write(chunk, encoding, callback) {
    if (!mute) process.stdout.write(chunk);
    callback();
  },
});
const rl = readline.createInterface({
  input: process.stdin,
  output,
  terminal: Boolean(process.stdin.isTTY),
});
const answers = rl[Symbol.asyncIterator]();
const question = async (prompt) => {
  process.stdout.write(prompt);
  const answer = await answers.next();
  if (answer.done) throw new Error("Input closed before setup was complete.");
  return answer.value;
};
(async () => {
  const email = (await question("Administrator email: ")).trim().toLowerCase();
  process.stdout.write(
    "Administrator password (at least 12 characters; input hidden): ",
  );
  mute = true;
  const password = await question("");
  mute = false;
  process.stdout.write("\n");
  rl.close();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 12 ||
    password.length > 128 ||
    /[\r\n]/.test(password)
  ) {
    console.error("Use a valid email and a password with 12–128 characters.");
    process.exit(1);
  }
  fs.writeFileSync(
    target,
    "WORKSPACE_ADMIN_EMAIL=" +
      email +
      "\nWORKSPACE_ADMIN_PASSWORD_B64=" +
      Buffer.from(password).toString("base64") +
      "\nWORKSPACE_MONGODB_URI=mongodb://127.0.0.1:27017/vms_workspace\n",
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Local administrator configuration saved to BE/.workspace.env. Start the app and sign in with the credentials you entered.",
  );
})().catch(() => {
  rl.close();
  console.error(
    "Configuration could not be created. Existing files were not overwritten.",
  );
  process.exit(1);
});
