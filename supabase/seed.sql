-- ========================================================
-- PAWFINDER PET ADOPTION HUB - MOCK SEED DATA
-- Run this in the Supabase SQL editor (after schema.sql) to
-- populate the database with sample users, pets, and sample
-- adoption requests so the dashboard is immediately interactive.
-- ========================================================

-- 1. USERS -------------------------------------------------
INSERT INTO users (full_name, email, city)
VALUES
  ('Riya Sharma', 'riya.sharma@mail.com', 'Mumbai'),
  ('Jake Morrison', 'jake.morrison@mail.com', 'Austin'),
  ('Aisha Khan', 'aisha.khan@mail.com', 'London'),
  ('Carlos Rivera', 'carlos.rivera@mail.com', 'Barcelona'),
  ('Emily Chen', 'emily.chen@mail.com', 'Toronto')
ON CONFLICT (email) DO NOTHING;

-- 2. SPECIES ----------------------------------------------
INSERT INTO species (species_name)
VALUES ('Dog'), ('Cat'), ('Bird'), ('Rabbit')
ON CONFLICT (species_name) DO NOTHING;

-- 3. PETS ---------------------------------------------------
INSERT INTO pets (owner_id, name, species_id, breed, age_months, description, status)
SELECT u.user_id, v.name, s.species_id, v.breed, v.age_months, v.description, v.status
FROM (
  VALUES
    ('riya.sharma@mail.com', 'Buddy', 'Dog', 'Golden Retriever', 24, 'Friendly and loves to play fetch. Fully vaccinated.', 'Available'),
    ('riya.sharma@mail.com', 'Whiskers', 'Cat', 'Persian', 18, 'Calm indoor cat, loves napping in sunlight.', 'Available'),
    ('jake.morrison@mail.com', 'Max', 'Dog', 'German Shepherd', 36, 'Trained guard dog, great with kids.', 'Available'),
    ('jake.morrison@mail.com', 'Tweety', 'Bird', 'Cockatiel', 8, 'Sings beautifully, hand-tamed.', 'Available'),
    ('aisha.khan@mail.com', 'Luna', 'Cat', 'Siamese', 12, 'Playful and vocal. Spayed and microchipped.', 'Available'),
    ('aisha.khan@mail.com', 'Coco', 'Rabbit', 'Holland Lop', 6, 'Adorable floppy ears, litter-trained.', 'Available'),
    ('carlos.rivera@mail.com', 'Rocky', 'Dog', 'Beagle', 15, 'Energetic and curious. Loves outdoor walks.', 'Adopted'),
    ('carlos.rivera@mail.com', 'Pepper', 'Bird', 'Budgerigar', 4, 'Vibrant green, learning to talk.', 'Available'),
    ('emily.chen@mail.com', 'Mochi', 'Cat', 'Ragdoll', 10, 'Fluffy and docile, follows you around the house.', 'Available'),
    ('emily.chen@mail.com', 'Daisy', 'Rabbit', 'Mini Rex', 9, 'Soft velvety fur, very gentle.', 'Available'),
    ('riya.sharma@mail.com', 'Oreo', 'Dog', 'Dalmatian', 30, 'Loves running. Needs a home with a yard.', 'Available'),
    ('jake.morrison@mail.com', 'Snowball', 'Rabbit', 'Angora', 14, 'Fluffy white coat, requires regular grooming.', 'Pending')
) AS v(owner_email, name, species_name, breed, age_months, description, status)
JOIN users u ON u.email = v.owner_email
JOIN species s ON s.species_name = v.species_name
WHERE NOT EXISTS (
  SELECT 1 FROM pets p WHERE p.name = v.name AND p.owner_id = u.user_id
);

-- 4. ADOPTION REQUESTS ----------------------------------------
INSERT INTO adoption_requests (pet_id, adopter_id, status)
SELECT p.pet_id, u.user_id, v.status
FROM (
  VALUES
    ('Snowball', 'aisha.khan@mail.com', 'Pending'),
    ('Rocky', 'emily.chen@mail.com', 'Approved')
) AS v(pet_name, adopter_email, status)
JOIN pets p ON p.name = v.pet_name
JOIN users u ON u.email = v.adopter_email
WHERE NOT EXISTS (
  SELECT 1 FROM adoption_requests ar
  WHERE ar.pet_id = p.pet_id AND ar.adopter_id = u.user_id
);
