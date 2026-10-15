# C-DAC Visitor Management System

A connected visitor application for Visitors, Hosts, Administrators, Planners, and Security staff. The modern frontend uses your existing Next.js/React design and dependencies. A dedicated Express/MongoDB API powers its accounts and visit records. The original backend is retained in the repository under the `legacy:*` scripts; the downloadable application uses the new workspace API.

## Run on your Windows computer

Install **Node.js 24 LTS** and **Docker Desktop** (Linux containers), then start Docker Desktop.

Extract the application ZIP, open PowerShell inside the `VMS-app` folder, and run:

```powershell
node scripts/setup-local.cjs
docker compose up --build -d
```

The setup command asks you to choose your administrator email and password. Password input is hidden. It creates the ignored `BE/.workspace.env` file and preserves it on subsequent runs. The first build downloads dependencies and can take a few minutes.

Open **http://localhost:3000/app** and sign in with the administrator credentials you entered.

Use **Accounts & audit** to create Host, Planner and Security accounts with initial passwords, then share those credentials privately. Visitors can create their own accounts on the sign-in screen. Use a registered host's email when creating a visit; the form provides host-directory suggestions.

To stop the application:

```powershell
docker compose down
```

Records remain in the `mongo-data` Docker volume. `docker compose down -v` deletes that volume and all records; do not use it to stop normal development.

## Update an existing Docker installation

Copy the updated application files into your existing project folder. Keep `BE/.workspace.env` and any local Compose port changes (for example, `127.0.0.1:3001:3000`). Use the same folder so Compose continues to use your existing database volume. Then rebuild:

```powershell
docker compose up --build -d
```

Do not rerun account setup or delete the database volume for this update. With the port 3001 mapping, open `http://localhost:3001/app`.

## Test a complete visit

1. As a Visitor, create a request or save an editable draft. Choose a host, dates, times, and optional travel/stay needs.
2. As the assigned Host, approve or decline the request.
3. As an Admin or Planner, open **Travel & Accommodation** and save the approved visitor's transport and accommodation details.
4. The requester can track the visit and copy the approved QR pass from the visit details.
5. As Security, open **Movement History → Scan visitor QR**. Scan using the camera, upload a QR image, or use a USB reader. Verify the authorized visitor, confirm photo identification, and record asset details (or explicitly select no assets) before allowing entry.
6. In Movement History, choose **Record check-out**. Compare outgoing assets against the entry record, confirm departure authorization, and submit **Verify assets & record departure**. For discrepancies, record outgoing assets and the resolution. Repeated entries remain available during the scheduled window.
7. Visitors see their own history and arrangements; administrators see campus statistics, account access, and audit records.

Use distinct browser profiles or an incognito window to test different roles at the same time. Roles are assigned by the administrator and enforced by the server; users cannot switch privileges through a dropdown. The separate `/workspace` page remains a clearly labeled sample design preview.

Multi-day visits are supported. Walk-ins are limited to the same day, cannot request travel/stay, and require host approval before entry. Revoked or completed passes cannot be used. In-app notifications are stored in the database. Email delivery is optional and requires the SMTP settings below. Automated face recognition is **not configured** and needs a compatible recognition service/device. Security confirms identity manually. Camera scanning requires browser permission and localhost or HTTPS; QR image upload and USB scanner input are available as alternatives.

**Travel & Accommodation** is managed only by Admin and Planner. **Movement History** is managed by Security, with Admin oversight, and contains entry/departure records and assets. The server rejects unauthorized module access and checks the QR pass, scheduled visit window, revocation status, and asset record again when admitting a visitor.

## Notifications, overstays and asset checkout

Use the bell icon to open your personal notification inbox. It refreshes with the workspace every 15 seconds, shows unread updates, and supports marking individual notifications or all notifications as read. **View visit** opens the relevant record. Requesters and assigned hosts receive visit updates; Security receives arrival/departure alerts, and Planners receive approvals requiring travel or accommodation. Administrators and Security also receive overstay and asset-discrepancy alerts.

An overstay starts when a checked-in visitor passes the final scheduled departure date and time in **Asia/Kolkata (IST)**. Security and Admin see overdue visitors in **Movement History**. The server checks once per minute and creates one alert per entry and recipient; checkout clears the active alert while preserving its notification history. Multi-day visitors are assessed against the final departure, rather than each midnight. Keep the app container running for background email and overstay checks.

Every checkout now requires an asset comparison and explicit departure authorization. Matching assets retain the entry asset description. For a discrepancy, Security records outgoing assets and the resolution before authorizing departure; the original entry record, resolution, officer, and verification time remain in Movement History. Admin and Security receive a discrepancy notification. Older records remain readable and show that exit verification was not recorded.

### Enable email on your computer

Add these settings to your existing **`BE/.workspace.env`**. Keep this file private and out of Git. Obtain the values from your organization's mail administrator or mail provider; use an app password if your provider requires one.

```dotenv
WORKSPACE_EMAIL_ENABLED=true
WORKSPACE_SMTP_HOST=smtp.your-provider.com
WORKSPACE_SMTP_PORT=587
WORKSPACE_SMTP_FROM=visits@your-domain.com
WORKSPACE_SMTP_USER=your-smtp-username
WORKSPACE_SMTP_PASSWORD=your-smtp-password
```

Port **587** requires STARTTLS; port **465** uses TLS immediately. Certificate verification remains enabled. Both SMTP username and password are required together; an authenticated corporate relay can omit both if it permits sending without login.

Apply changes with your existing Compose project name:

```powershell
docker compose -p vms-modern-vms-app up -d --force-recreate --no-deps app
```

New notifications will be queued for email when the configuration is complete. Delivery is checked every 15 seconds, with up to five attempts and increasing delays after failures. The inbox shows whether the provider accepted an email or delivery failed. Provider acceptance does not guarantee inbox delivery; verify a test with your provider and check spam folders. Notifications created while email was disabled are not emailed retroactively. In-app notifications continue to work without SMTP.

## Run without the application container

Start a local MongoDB server on port 27017. With Docker available, you can start just the database service:

```powershell
docker compose up -d mongo
```

That Compose database is private to its Docker network. For running the API directly, either use your own local MongoDB or run a separately named local container:

```powershell
docker run -d --name vms-local-mongo -p 127.0.0.1:27017:27017 -v vms-local-data:/data/db mongo:8.0
```

In one PowerShell window:

```powershell
cd BE
npm ci
npm start
```

In another:

```powershell
cd FE
npm ci
npm run dev
```

The frontend proxies `/api/workspace` to the API on port 8001, so the browser talks to one origin. The API listens only on localhost by default. Set `WORKSPACE_MONGODB_URI` in `BE/.workspace.env` if your database uses another location. The new API never loads the old committed `BE/.env` or SMTP credentials.

## Validation

With local MongoDB running:

```powershell
cd BE
npm test
```

The isolated API suite verifies registration, session and CSRF checks, role permissions, visitor privacy, host approval, concurrency, pass verification/revocation, arrangements, repeated movements, drafts, cancellation, account deactivation, audit records, notifications, multi-day visits, and walk-in rules. It creates and drops a uniquely named test database.

Frontend sample regression checks, with a frontend server running:

```powershell
cd FE
npx playwright install chromium
npm run test:workspace
```

For the production frontend:

```powershell
cd FE
npm run build
npm start
```

## A public test link

Localhost is accessible on your own computer. To create a public link, deploy the application container and MongoDB to a hosting account with persistent storage, put HTTPS in front of the app, and set `WORKSPACE_SECURE_COOKIES=true`. Keep MongoDB private, provide administrator configuration securely, and use a unique strong password. The supplied Compose port is bound to localhost intentionally. No public deployment has been created in this chat.

The ZIP excludes `.env` files, administrator credentials, private keys, database files, dependencies, build outputs, and the old credential-bearing backend source. Do not upload your generated `BE/.workspace.env` to GitHub.
