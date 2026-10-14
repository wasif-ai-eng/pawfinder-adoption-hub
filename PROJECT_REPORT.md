# DBMS PROJECT REPORT
## PawFinder — Community Pet Adoption & Foster Management System

---

**Course**: Database Management Systems (DBMS)  
**Project Title**: PawFinder — Community Pet Adoption & Foster Hub  
**Technology Stack**: PostgreSQL (Supabase), Next.js 16 (App Router), TypeScript, Tailwind CSS  
**Target Environment**: Web Application with Cloud Relational Database  

---

## 1. Executive Summary & Problem Statement

### 1.1 Motivation
Animal shelters and pet rescue organizations often face severe capacity constraints and lack streamlined platforms to connect rescued animals with prospective adopters. Traditional social media listings lack structured data, leading to miscommunication, lost applications, duplicate adoptions, and lack of accountability.

### 1.2 Proposed Solution
**PawFinder** is a full-stack Database Management System designed to facilitate peer-to-peer and shelter-to-adopter pet placements. It enforces rigorous relational database principles to ensure data consistency, eliminate redundant storage, prevent orphaned records through referential integrity actions, and provide seamless workflow management for adoption listings and approval cycles.

---

## 2. System Requirements & Functional Scope

1. **User Persona Management**: Manage adopters and pet owners with distinct identities, contact details, and locations.
2. **Species Categorization**: Maintain normalized taxonomies of pet types (Dog, Cat, Bird, Rabbit).
3. **Pet Inventory & Status Tracking**: Track available, adopted, and pending pets with detailed attributes (breed, age in months, descriptions).
4. **Adoption Request Transactions**: Manage end-to-end adoption applications, from initial submission with home descriptions to approval, rejection, and final handover completion.
5. **Data Integrity & Business Rules**: Enforce domain and relational constraints at the database level rather than solely relying on client-side validation.

---

## 3. Entity-Relationship (ER) Modeling

### 3.1 Entities and Attributes
- **USERS** (`user_id` [PK], `full_name`, `email`, `city`, `created_at`)
- **SPECIES** (`species_id` [PK], `species_name`)
- **PETS** (`pet_id` [PK], `owner_id` [FK], `species_id` [FK], `name`, `breed`, `age_months`, `description`, `status`, `created_at`)
- **ADOPTION_REQUESTS** (`request_id` [PK], `pet_id` [FK], `adopter_id` [FK], `status`, `requested_at`, `completed_at`, `preferred_date`, `home_description`)

### 3.2 Relationships & Cardinalities
- **Owns / Lists** (`USERS` to `PETS`): One-to-Many ($1 : N$). A user can list zero or many pets; each pet is listed by exactly one owner.
- **Classifies** (`SPECIES` to `PETS`): One-to-Many ($1 : N$). A species categorizes zero or many pets; each pet belongs to exactly one species.
- **Applies For** (`USERS` to `ADOPTION_REQUESTS`): One-to-Many ($1 : N$). A user can submit zero or many adoption requests; each request belongs to exactly one adopter.
- **Subject Of** (`PETS` to `ADOPTION_REQUESTS`): One-to-Many ($1 : N$). A pet can receive zero or many adoption requests; each request targets exactly one pet.

### 3.3 ER Diagram (Crow's Foot Notation)
```
  +------------------+                    +------------------+
  |      USERS       |                    |     SPECIES      |
  +------------------+                    +------------------+
  | PK  user_id      |                    | PK  species_id   |
  |     full_name    |                    |     species_name |
  |     email [UQ]   |                    +------------------+
  |     city         |                             | 1
  |     created_at   |                             |
  +------------------+                             | classifies (1:N)
          | 1                                      |
          |                                        |
          | lists (1:N)                            |
          +-----------------------+                |
                                  |                |
                                  v N              v N
                          +-------------------------------+
                          |             PETS              |
                          +-------------------------------+
                          | PK  pet_id                    |
                          | FK  owner_id                  |
                          | FK  species_id                |
                          |     name                      |
                          |     breed                     |
                          |     age_months                |
                          |     description               |
                          |     status                    |
                          |     created_at                |
                          +-------------------------------+
                                          | 1
                                          |
                                          | receives (1:N)
                                          v N
                          +-------------------------------+
                          |       ADOPTION_REQUESTS       |
                          +-------------------------------+
                          | PK  request_id                |
                          | FK  pet_id                    |
                          | FK  adopter_id                |
                          |     status                    |
                          |     requested_at              |
                          |     completed_at              |
                          |     preferred_date            |
                          |     home_description          |
                          +-------------------------------+
                                          ^ N
                                          |
                                          | submits (1:N)
                                          | 1
                                  +------------------+
                                  |      USERS       |
                                  +------------------+
```

---

## 4. Relational Schema & Normalization Analysis

### 4.1 First Normal Form (1NF)
- All attributes are atomic (no repeating groups or comma-separated lists).
- Primary keys are established for all tables (`user_id`, `species_id`, `pet_id`, `request_id`).

### 4.2 Second Normal Form (2NF)
- The schema is in 1NF.
- All non-key attributes are fully functionally dependent on the entire primary key. Because all primary keys are single-column synthetic surrogates (`SERIAL PRIMARY KEY`), partial dependencies cannot exist.

### 4.3 Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)
- **Elimination of Transitive Dependencies**: Species names are not stored directly in the `PETS` relation. If `species_name` were stored in `PETS`, the dependency `pet_id -> species_name` would be transitive via `species_id -> species_name`. By factoring `SPECIES` into its own relation, update anomalies and insertion anomalies are eliminated.
- **Functional Dependencies**:
  - `user_id -> full_name, email, city, created_at`
  - `email -> user_id, full_name, city, created_at` (Candidate Key)
  - `species_id -> species_name`
  - `species_name -> species_id` (Candidate Key)
  - `pet_id -> owner_id, species_id, name, breed, age_months, description, status, created_at`
  - `request_id -> pet_id, adopter_id, status, requested_at, completed_at, preferred_date, home_description`
- In every functional dependency $X \rightarrow Y$, $X$ is a superkey. Therefore, the schema satisfies **BCNF**.

---

## 5. Detailed Database Implementation (DDL)

### 5.1 Relational Tables & Integrity Constraints
```sql
-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SPECIES TABLE
CREATE TABLE IF NOT EXISTS species (
    species_id SERIAL PRIMARY KEY,
    species_name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. PETS TABLE
CREATE TABLE IF NOT EXISTS pets (
    pet_id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    species_id INT NOT NULL,
    breed VARCHAR(80),
    age_months INT CHECK (age_months >= 0),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Available' 
        CHECK (status IN ('Available', 'Adopted', 'Pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_species FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE
);

-- 4. ADOPTION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS adoption_requests (
    request_id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL,
    adopter_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' 
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    preferred_date DATE NULL,
    home_description TEXT NULL,
    CONSTRAINT fk_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE,
    CONSTRAINT fk_adopter FOREIGN KEY (adopter_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### 5.2 Referential Integrity Policies
- **`ON DELETE CASCADE` on `fk_owner` and `fk_species`**: When a user account or species category is purged, associated pets are cascaded safely without leaving dangling foreign key references.
- **`ON DELETE CASCADE` on `fk_pet` and `fk_adopter`**: Deletion of a pet or user purges related adoption applications automatically.

---

## 6. Advanced SQL & Database Views

### 6.1 Relational SQL View (`available_pets`)
To decouple client components from multi-table join complexity, a materialized SQL view exposes available inventory:
```sql
CREATE OR REPLACE VIEW available_pets AS
SELECT 
    p.pet_id,
    p.name,
    s.species_name,
    p.breed,
    p.age_months,
    p.status,
    u.full_name AS owner_name,
    u.email AS owner_email
FROM pets p
JOIN species s ON p.species_id = s.species_id
JOIN users u ON p.owner_id = u.user_id;
```

### 6.2 Complex Queries & Analytics
```sql
-- Adoption Rate by Species
SELECT 
    s.species_name,
    COUNT(p.pet_id) AS total_listed,
    COUNT(CASE WHEN p.status = 'Adopted' THEN 1 END) AS total_adopted,
    ROUND(COUNT(CASE WHEN p.status = 'Adopted' THEN 1 END)::numeric / NULLIF(COUNT(p.pet_id), 0) * 100, 2) AS adoption_rate_pct
FROM species s
LEFT JOIN pets p ON s.species_id = p.species_id
GROUP BY s.species_name
ORDER BY total_adopted DESC;
```

---

## 7. Application Architecture & Workflow

### 7.1 Tech Stack
- **Database Engine**: PostgreSQL 15+ hosted on Supabase
- **Frontend / Full Stack**: Next.js 16 (React 19, Server & Client Components)
- **Data Access Layer**: `@supabase/supabase-js` with typed schema definitions (`types/database.ts`)
- **Styling**: Tailwind CSS v4

### 7.2 Core Workflows
1. **Catalog Browsing & Multi-Attribute Filtering**: Adopters filter pets by species categories in real time.
2. **Adoption Application**: Adopters provide preferred pickup dates and home environment descriptions. Status transitions from `Available` $\rightarrow$ `Pending`.
3. **Approval Lifecycle**: The pet owner inspects incoming requests and can `Approve` or `Reject`.
   - On `Approve`: Pet status updates to `Adopted`.
   - On `Mark as completed`: Handover timestamp `completed_at` is permanently recorded.

---

## 8. Verification & Test Results

| Test Scenario | Input Data | Expected Result | Status |
|---|---|---|---|
| Duplicate Email Check | Two users with identical email | `UNIQUE constraint violation` error | PASS |
| Negative Age Check | Insert pet with `age_months = -5` | `CHECK constraint violation` error | PASS |
| Invalid Status Check | Insert pet with `status = 'Unknown'` | `CHECK constraint violation` error | PASS |
| Cascade Deletion | Delete owner with active listings | All owned pets and requests removed | PASS |
| View Projection | Query `available_pets` | Formatted multi-table join returned | PASS |
| Production Build | `npx next build` | Zero type errors, 100% route generation | PASS |

---

## 9. Conclusion
PawFinder successfully demonstrates the application of relational database principles to a community adoption domain. By moving constraint verification and data integrity rules into the DBMS engine, the application achieves enterprise-grade reliability and normalized data storage.