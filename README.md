# 🐾 PawFinder — Pet Adoption & Foster Hub

A full-stack DBMS project built with **Next.js 16**, **Supabase (PostgreSQL)**, and **Tailwind CSS v4**.

PawFinder is a community platform where people list pets available for adoption and others can submit adoption requests. Pet owners can approve or reject requests and track handovers.

## DBMS Concepts Demonstrated

| Concept | Where |
|---|---|
| **Primary Keys** | `SERIAL PRIMARY KEY` on every table |
| **Foreign Keys** | `ON DELETE CASCADE` linking pets → users, pets → species, adoption_requests → pets, adoption_requests → users |
| **CHECK Constraints** | `status IN (...)` on `pets` and `adoption_requests`; `age_months >= 0` on `pets` |
| **NOT NULL / UNIQUE** | `email UNIQUE NOT NULL`, `species_name UNIQUE NOT NULL` |
| **DEFAULT Values** | `status DEFAULT 'Available'`, `CURRENT_TIMESTAMP` |
| **Normalization (3NF/BCNF)** | Species extracted into its own table; no transitive dependencies |
| **SQL Views** | `available_pets` view joins pets, species, and users |
| **Multi-table JOINs** | Used throughout the app and seed script |

## Schema (4 tables + 1 view)

```
users ──┐
        ├── pets ──┐
species ┘          │
                   └── adoption_requests ── users
```

## Tech Stack

- **Frontend**: Next.js 16 (App Router, Server Components, Suspense)
- **Database**: Supabase (hosted PostgreSQL)
- **ORM/Client**: @supabase/supabase-js with typed queries
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase
#    - Create a project at https://supabase.com
#    - Run schema.sql in the SQL Editor
#    - Copy your URL and anon key to .env.local

# 3. Seed the database
npm run seed

# 4. Start the dev server
npm run dev
```

## Project Structure

```
pawfinder-adoption-hub/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home page — browse available pets
│   ├── adoptions/page.tsx  # Requests & adoptions dashboard
│   └── globals.css
├── components/
│   ├── Modal.tsx           # Reusable modal shell
│   ├── UserSwitcher.tsx    # Demo user selector
│   ├── PetsBrowser.tsx     # Pet cards grid with species filter
│   ├── AddPetModal.tsx     # List a new pet form
│   ├── AdoptRequestModal.tsx # Submit adoption request
│   └── AdoptionsBoard.tsx  # Incoming/outgoing requests board
├── context/
│   └── AuthContext.tsx     # Demo auth context
├── lib/
│   └── supabase.ts         # Supabase client
├── types/
│   └── database.ts         # TypeScript DB types
├── scripts/
│   └── seed.mjs            # Database seeder
├── schema.sql              # Complete SQL schema
├── .env.local              # Supabase credentials
└── package.json
```
