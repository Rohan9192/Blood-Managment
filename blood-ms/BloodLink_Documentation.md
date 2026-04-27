# BloodLink - Blood Management System Documentation

Welcome to the official documentation for **BloodLink**, a modern web application designed to connect blood donors with individuals or hospitals in need. This system streamlines the process of managing blood inventory, registering donors, and fulfilling emergency blood requests.

---

## 🏗️ Core Technology Stack
- **Frontend:** Next.js 16 (React), Tailwind CSS
- **Backend:** Next.js API Routes (Serverless)
- **Database:** PostgreSQL managed by Prisma ORM
- **Authentication:** NextAuth.js with custom Email OTP Verification via Nodemailer

---

## 👥 User Roles & Capabilities

The system is strictly divided into three primary roles, each with its own dedicated dashboards and permissions.

### 1. The Donor (`DONOR`)
Donors are the lifeline of the system. This role is for individuals willing to donate blood.
- **Onboarding:** Donors register with their email (verified via OTP) and complete their medical profile (Blood Group, Age, Location, Contact Number).
- **Availability Toggle:** Donors can toggle their availability status (e.g., "Available to Donate" or "Unavailable").
- **Donation History:** The system tracks every successful donation, preventing users from donating more frequently than medically recommended (usually enforced via the `lastDonationDate`).
- **Dashboard:** Donors can view active urgent requests in their area to volunteer proactively.

### 2. The Receiver / Hospital (`RECEIVER`)
Receivers are individuals, clinics, or hospital managers who require blood for medical procedures or emergencies.
- **Onboarding:** Receivers register securely via OTP verification.
- **Creating Requests:** Receivers can create a `Blood Request` by specifying:
  - Required Blood Group (e.g., O-Negative)
  - Number of Units needed
  - Urgency Level (`NORMAL`, `URGENT`, `CRITICAL`)
  - Location and medical notes
- **Tracking:** Receivers can track the real-time status of their request (`PENDING`, `APPROVED`, `FULFILLED`, `REJECTED`).

### 3. The Administrator (`ADMIN`)
Administrators have absolute oversight over the entire platform to ensure safety and prevent abuse.
- **Master Dashboard:** Admins have a global view of all metrics.
- **Inventory Management:** Admins manually update the `BloodStock` (e.g., logging how many units of A+ blood are currently in the physical blood bank).
- **Approval Workflows:**
  - *Donor Approval:* New donors enter a `PENDING` status. Admins review and mark them as `APPROVED` or `REJECTED`.
  - *Request Fulfillment:* When a receiver requests blood, Admins check the `BloodStock`. If inventory exists, the Admin marks the request as `APPROVED` and eventually `FULFILLED` (which dynamically deducts units from the `BloodStock`).
- **User Management:** Admins can view or remove any user from the database.

---

## 🔄 Core Workflows

### 1. The Registration Flow (OTP Security)
To ensure the system isn't spammed with fake requests, security is prioritized:
1. **Email Input:** User inputs their email on the register page.
2. **OTP Dispatch:** The server generates a random 6-digit code, saves it to the database (`OtpVerification`), and sends it securely via Gmail SMTP.
3. **Verification:** The user inputs the code. If it matches and hasn't expired (15-minute window), they are authorized to complete their profile.
4. **Account Creation:** The user sets a password and role, and the permanent `User` is generated in Postgres.

### 2. The Blood Request Lifecycle
1. **Initiation:** A Receiver submits a Critical Request for 2 units of B+.
2. **Visibility:** The request appears on the Admin Dashboard as `PENDING`.
3. **Assessment:** The Admin checks the `BloodStock`.
   - *Scenario A:* The physical blood bank has 10 units of B+. The Admin marks the request as `FULFILLED`. The `BloodStock` automatically updates to 8 units.
   - *Scenario B:* The physical blood bank has 0 units of B+. The Admin keeps the request `PENDING` and the system broadcasts the need to `APPROVED` B+ Donors.
4. **Donation:** A B+ Donor arrives at the clinic, donates 1 unit. The Admin updates the donor's `DonationHistory` and adds 1 unit to the `BloodStock`.

---

## 🗄️ Database Schema Mapping
- **`User`**: Core account data (Credentials, Role, Verification status).
- **`OtpVerification`**: Temporary table storing 6-digit codes for security.
- **`Donor`**: Extended medical profile tied 1-to-1 with a User.
- **`Request`**: A ticket representing a need for blood, tied to a Receiver.
- **`BloodStock`**: A persistent 8-row table tracking current units for each blood group globally.
- **`DonationHistory`**: A log of every physical donation made by a donor.
