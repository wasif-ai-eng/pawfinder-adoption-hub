# PRESENTATION SLIDES
## PawFinder — Community Pet Adoption & Foster Management System

---

### Slide 1: Title Slide
# 🐾 PawFinder
### Community Pet Adoption & Foster Hub
**Database Management Systems (DBMS) Term Project**

- **Presenter / Student Name**: [Your Name]
- **Technology Stack**: PostgreSQL (Supabase) + Next.js 16 + TypeScript + Tailwind CSS

> **Speaker Notes**:
> "Good morning everyone. Today I am presenting PawFinder, a full-stack database-driven community pet adoption and foster hub built on relational database principles using PostgreSQL and Next.js."

---

### Slide 2: Problem Statement & Motivation
- **The Problem**: Traditional pet adoption listings on social media are unorganized, lack relational consistency, and suffer from orphaned posts and untracked adoption status.
- **The Impact**: Prospective adopters face delays, shelter managers deal with duplicated inquiries, and animals remain unadopted longer.
- **Our Goal**: Build a structured, normalized relational DBMS platform that enforces data integrity, manages pet life cycles, and guarantees consistency.

> **Speaker Notes**:
> "Adoption centers and community pet owners often struggle with unorganized inquiries. PawFinder addresses this by introducing a strict database model with referential integrity and status guarantees."

---

### Slide 3: System Architecture
```
┌────────────────────────────────────────────────────────┐
│            Next.js 16 Client & Server Components       │
│  (Catalog Browser, Request Modal, Adoptions Dashboard) │
└──────────────────────────┬─────────────────────────────┘
                           │ Typed Queries via Supabase JS SDK
                           ▼
┌────────────────────────────────────────────────────────┐
│            PostgreSQL 15+ Relational Database          │
│   (Relational Tables, Constraints, CASCADE Rules, View)│
└────────────────────────────────────────────────────────┘
```
- **Front-End**: Next.js 16 App Router, Tailwind CSS v4, TypeScript
- **Database**: Cloud PostgreSQL on Supabase
- **Access Protocol**: Strongly typed schema access with `@supabase/supabase-js`

> **Speaker Notes**:
> "The architecture cleanly separates client presentation from the relational database tier. The frontend interacts directly with PostgreSQL using strongly-typed SQL queries that adhere to our schema definitions."

---

### Slide 4: Entity-Relationship (ER) Model
- **Core Entities**:
  - `USERS`: Owners and adopters
  - `SPECIES`: Taxonomic categorization (Dog, Cat, Bird, Rabbit)
  - `PETS`: Animals listed for adoption with age, breed, and status
  - `ADOPTION_REQUESTS`: Transactional requests linking adopters and pets
- **Cardinalities**:
  - User to Pets: **$1 : N$** (One user lists multiple pets)
  - Species to Pets: **$1 : N$** (One species classifies multiple pets)
  - User to Requests: **$1 : N$** (One user submits multiple requests)
  - Pet to Requests: **$1 : N$** (One pet receives multiple requests)

> **Speaker Notes**:
> "Our ER model is centered around four well-defined entities with clear 1-to-many cardinalities. Each relationship enforces strict referential actions."

---

### Slide 5: Relational Schema Design
```
users (user_id [PK], full_name, email [UQ], city, created_at)

species (species_id [PK], species_name [UQ])

pets (pet_id [PK], owner_id [FK], species_id [FK], name,
      breed, age_months, description, status, created_at)

adoption_requests (request_id [PK], pet_id [FK], adopter_id [FK],
                   status, requested_at, completed_at, preferred_date,
                   home_description)
```

> **Speaker Notes**:
> "Here is our relational schema. Notice that foreign keys link pets to their respective owner and species, and adoption requests link the prospective adopter directly to the requested pet."

---

### Slide 6: Normalization (1NF to 3NF / BCNF)
- **1NF Compliance**:
  - All attributes are atomic; no repeating groups.
  - Primary keys uniquely identify every record.
- **2NF Compliance**:
  - Every non-key attribute depends entirely on the primary key (no partial dependencies on composite keys).
- **3NF & BCNF Compliance**:
  - Transitive dependency eliminated: Species names are stored in `species`, not repeated across rows in `pets`.
  - In all functional dependencies $X \rightarrow Y$, the determinant $X$ is a candidate key.

> **Speaker Notes**:
> "Normalization was a primary design priority. By isolating species attributes from pet listings, we eliminate update and deletion anomalies, satisfying Boyce-Codd Normal Form."

---

### Slide 7: Database Constraints & Integrity Rules
- **Domain Constraints**:
  - `CHECK (status IN ('Available', 'Adopted', 'Pending'))` on `pets`
  - `CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed'))` on `adoption_requests`
  - `CHECK (age_months >= 0)` prevents negative age values
- **Uniqueness & Non-Null**:
  - `email VARCHAR(100) UNIQUE NOT NULL`
  - `species_name VARCHAR(50) NOT NULL UNIQUE`
- **Referential Action (`ON DELETE CASCADE`)**:
  - Purging an owner automatically removes their listings.
  - Purging a pet purges pending adoption applications.

> **Speaker Notes**:
> "We don't rely only on frontend checks. The database engine itself enforces domain constraints with CHECK clauses, unique constraints on emails and species names, and cascading deletes."

---

### Slide 8: Advanced SQL Features: Views & Queries
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
- Decouples client queries from physical table joins.
- Enables lightning-fast querying for active adoption listings.

> **Speaker Notes**:
> "We developed a relational view called `available_pets`. It performs a three-way join between pets, species, and users, presenting a single clean relation for client consumption."

---

### Slide 9: Application Workflow Demo
1. **Interactive Persona Switcher**: Switch between demo users in one click to test owner vs adopter roles.
2. **Species Filter & Inventory Browser**: Filter by Dog, Cat, Bird, or Rabbit with live count indicators.
3. **Adoption Application Modal**: Submit request with preferred pickup date and home environment notes.
4. **Owner Review & Decision Dashboard**: Real-time approval/rejection updates pet status to `Adopted` or `Available`.

> **Speaker Notes**:
> "The web application provides an intuitive workflow. We included an active user switcher so evaluators can easily test the entire lifecycle from both the owner and adopter perspectives."

---

### Slide 10: Conclusion & Takeaways
- **Key Achievements**:
  - Full relational database design adhering to BCNF.
  - Zero data redundancy with strict integrity constraints.
  - Production-ready Next.js application verified with `next build`.
  - Comprehensive database seeder and DDL scripts.
- **Future Enhancements**:
  - Adding photo blob storage with PostgreSQL large objects / S3 storage.
  - Automated reminder triggers for post-adoption veterinary checkups.

> **Speaker Notes**:
> "In conclusion, PawFinder demonstrates how solid DBMS foundations create reliable applications. Thank you for your time, and I am happy to take any questions."