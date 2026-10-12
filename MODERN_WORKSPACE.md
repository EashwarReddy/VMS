# Modern workspace implementation

See [README.md](README.md) for startup and test instructions.

- `/app`: connected application with account login, a shared MongoDB database, and server-enforced roles.
- `/workspace`: optional sample design preview with fictional browser-local records.
- `BE/src/workspace/server.js`: dedicated Express API. It never loads the old committed backend credentials.
- `FE/src/components/workspace`: reusable interface, live authentication/client integration, and sample seed data.
- `scripts/setup-local.cjs`: local administrator setup with hidden password input.
- `compose.yaml`: private MongoDB and an application container, with the web port bound to localhost.

The connected workflow includes multi-day requests, editable drafts, assigned-host decisions, travel/stay arrangements, revocable QR passes, schedule-checked entry, asset records, repeated movements, cancellation, account access management, password changes, notifications, and audit history. Visitors see their own records; hosts see assigned requests; planners see relevant approved arrangements; security sees authorized visits and their own walk-ins; administrators manage the campus.

Email and automated facial recognition require external provider/device configuration. The local app stores in-app notifications, verifies pass content, and asks security to confirm identity manually.

The downloadable ZIP excludes private credentials, database state and the credential-bearing legacy backend source. The original backend remains in the repository for reference under the `legacy:*` scripts.
