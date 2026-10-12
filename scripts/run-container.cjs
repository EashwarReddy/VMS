const { spawn } = require("node:child_process");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const children = [
  spawn(process.execPath, ["src/workspace/server.js"], {
    cwd: path.join(root, "BE"),
    stdio: "inherit",
  }),
  spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"],
    { cwd: path.join(root, "FE"), stdio: "inherit" },
  ),
];
let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill("SIGTERM"));
  setTimeout(() => process.exit(code), 1000);
}
children.forEach((child) => {
  child.on("error", () => shutdown(1));
  child.on("exit", (code) => shutdown(code || 0));
});
process.on("SIGTERM", () => shutdown());
process.on("SIGINT", () => shutdown());
