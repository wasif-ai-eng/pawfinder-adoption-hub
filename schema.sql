-- ========================================================
-- PAWFINDER PET ADOPTION HUB - PRODUCTION RELATIONAL SCHEMA
-- Meets DBMS Project Requirements: Integrity Constraints, 
-- Foreign Keys, CHECK constraints, and Normalization (3NF/BCNF)
-- ========================================================

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

-- Seed Species
INSERT INTO species (species_name) 
VALUES ('Dog'), ('Cat'), ('Bird'), ('Rabbit')
ON CONFLICT (species_name) DO NOTHING;

-- 3. PETS TABLE
CREATE TABLE IF NOT EXISTS pets (
    pet_id SERIAL PRIMARY KEY,
    owner_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    species_id INT NOT NULL,
    breed VARCHAR(80),
    age_months INT CHECK (age_months >= 0),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Adopted', 'Pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_species FOREIGN KEY (species_id) REFERENCES species(species_id) ON DELETE CASCADE
);

-- 4. ADOPTION REQUESTS / TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS adoption_requests (
    request_id SERIAL PRIMARY KEY,
    pet_id INT NOT NULL,
    adopter_id INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    preferred_date DATE NULL,
    home_description TEXT NULL,
    CONSTRAINT fk_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE,
    CONSTRAINT fk_adopter FOREIGN KEY (adopter_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Migration (idempotent): add preferred pickup date + home description
ALTER TABLE adoption_requests ADD COLUMN IF NOT EXISTS preferred_date DATE NULL;
ALTER TABLE adoption_requests ADD COLUMN IF NOT EXISTS home_description TEXT NULL;

-- ========================================================
-- ADVANCED DBMS FEATURES: VIEWS & SAMPLE QUERIES
-- ========================================================

-- View: Available Pets with Owner & Species Details
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
