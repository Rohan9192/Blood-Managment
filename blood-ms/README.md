# Blood Management System

A full-stack, modern web application for connecting blood donors with recipients, built for emergencies with real-time tracking, inventory management, and role-based access control.

![BloodLink Banner](https://via.placeholder.com/1200x600/0f172a/ef4444?text=BloodLink+Management+System)

## 🧩 Tech Stack
- **Frontend & API**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + `lucide-react` icons
- **State Management**: React Query + Zustand (for potential client state scaling)
- **Forms**: `react-hook-form` + Zod
- **Charts**: Recharts
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js (v5) + bcryptjs

## 📚 Features by Role

### General Users (Unauthenticated)
- View landing page value proposition
- Discover real-time stock UI (visual only)
- Public Donor directory (filters, view partial profile)

### 🩸 Donor Role
- **Profile Management**: Update blood group, location, age, contact details
- **Availability Toggle**: Mark self as available/unavailable for donations
- **Donation History**: Track past donations

### 🏥 Receiver Role
- **Request Creation**: Post urgency-tagged blood requirements (NORMAL, URGENT, CRITICAL)
- **Track Status**: View updates from Admin when request is approved or fulfilled
- **Search Donors**: Filter available donors by exact blood group match in their area

### 🛡️ Admin Role (Superuser)
- **Dashboard Overview**: Metrics, charts, trends of the entire platform
- **Donor Approval**: Verify/Reject pending donor registrations
- **Request Fulfillment**: Approve requests and decrement blood stock automatically
- **Stock Inventory**: Manually increment/decrement general blood stock

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Postgres Server or Docker setup

### Installation
1. Install Dependencies
   ```bash
   npm install
   ```
2. Start Database
   If you have docker installed:
   ```bash
   docker compose up -d
   ```
   Or ensure your local Postgres is running and active.

3. Set up Environment Variables
   Create `.env.local` based on the `.env.example` in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blood_management?schema=public"
   NEXTAUTH_SECRET="blood-management-super-secret-key-2024"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Run Migrations & Seed the Database
   Generate Prisma client:
   ```bash
   npx prisma generate
   ```
   Push the schema to Db (For dev):
   ```bash
   npx prisma db push
   ```
   Seed dummy data:
   ```bash
   npm run seed
   ```

5. Start the Development Server
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`

### 🔑 Test Accounts
After running the seed script, you can log in with:
- **Admin**: `admin@blood.com` / `admin123`
- **Donor**: `donor2@blood.com` / `donor123`
- **Receiver**: `receiver1@blood.com` / `receiver123`

## 📁 Folder Structure
- `/app`: Next.js pages and API route handlers
- `/components`: Reusable UI elements, modularized by features (dashboard, donors, requests)
- `/lib`: Singleton helpers, Prisma client, NextAuth configs, Zod schemas, Utils
- `/prisma`: Schema definition and data seeding
