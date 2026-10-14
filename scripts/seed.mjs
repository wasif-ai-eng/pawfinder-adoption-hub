import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Make sure .env.local is populated and run this script with:\n" +
      "  npm run seed"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SPECIES = ["Dog", "Cat", "Bird", "Rabbit"];

const USERS = [
  {
    full_name: "Riya Sharma",
    email: "riya.sharma@mail.com",
    city: "Mumbai",
  },
  {
    full_name: "Jake Morrison",
    email: "jake.morrison@mail.com",
    city: "Austin",
  },
  {
    full_name: "Aisha Khan",
    email: "aisha.khan@mail.com",
    city: "London",
  },
  {
    full_name: "Carlos Rivera",
    email: "carlos.rivera@mail.com",
    city: "Barcelona",
  },
  {
    full_name: "Emily Chen",
    email: "emily.chen@mail.com",
    city: "Toronto",
  },
];

const PETS = [
  {
    owner_email: "riya.sharma@mail.com",
    name: "Buddy",
    species_name: "Dog",
    breed: "Golden Retriever",
    age_months: 24,
    description: "Friendly and loves to play fetch. Fully vaccinated.",
    status: "Available",
  },
  {
    owner_email: "riya.sharma@mail.com",
    name: "Whiskers",
    species_name: "Cat",
    breed: "Persian",
    age_months: 18,
    description: "Calm indoor cat, loves napping in sunlight.",
    status: "Available",
  },
  {
    owner_email: "jake.morrison@mail.com",
    name: "Max",
    species_name: "Dog",
    breed: "German Shepherd",
    age_months: 36,
    description: "Trained guard dog, great with kids.",
    status: "Available",
  },
  {
    owner_email: "jake.morrison@mail.com",
    name: "Tweety",
    species_name: "Bird",
    breed: "Cockatiel",
    age_months: 8,
    description: "Sings beautifully, hand-tamed.",
    status: "Available",
  },
  {
    owner_email: "aisha.khan@mail.com",
    name: "Luna",
    species_name: "Cat",
    breed: "Siamese",
    age_months: 12,
    description: "Playful and vocal. Spayed and microchipped.",
    status: "Available",
  },
  {
    owner_email: "aisha.khan@mail.com",
    name: "Coco",
    species_name: "Rabbit",
    breed: "Holland Lop",
    age_months: 6,
    description: "Adorable floppy ears, litter-trained.",
    status: "Available",
  },
  {
    owner_email: "carlos.rivera@mail.com",
    name: "Rocky",
    species_name: "Dog",
    breed: "Beagle",
    age_months: 15,
    description: "Energetic and curious. Loves outdoor walks.",
    status: "Adopted",
  },
  {
    owner_email: "carlos.rivera@mail.com",
    name: "Pepper",
    species_name: "Bird",
    breed: "Budgerigar",
    age_months: 4,
    description: "Vibrant green, learning to talk.",
    status: "Available",
  },
  {
    owner_email: "emily.chen@mail.com",
    name: "Mochi",
    species_name: "Cat",
    breed: "Ragdoll",
    age_months: 10,
    description: "Fluffy and docile, follows you around the house.",
    status: "Available",
  },
  {
    owner_email: "emily.chen@mail.com",
    name: "Daisy",
    species_name: "Rabbit",
    breed: "Mini Rex",
    age_months: 9,
    description: "Soft velvety fur, very gentle.",
    status: "Available",
  },
  {
    owner_email: "riya.sharma@mail.com",
    name: "Oreo",
    species_name: "Dog",
    breed: "Dalmatian",
    age_months: 30,
    description: "Loves running. Needs a home with a yard.",
    status: "Available",
  },
  {
    owner_email: "jake.morrison@mail.com",
    name: "Snowball",
    species_name: "Rabbit",
    breed: "Angora",
    age_months: 14,
    description: "Fluffy white coat, requires regular grooming.",
    status: "Pending",
  },
];

const ADOPTION_REQUESTS = [
  {
    pet_name: "Snowball",
    adopter_email: "aisha.khan@mail.com",
    status: "Pending",
  },
  {
    pet_name: "Rocky",
    adopter_email: "emily.chen@mail.com",
    status: "Approved",
  },
];

async function seedSpecies() {
  const { error } = await supabase
    .from("species")
    .upsert(
      SPECIES.map((species_name) => ({ species_name })),
      { onConflict: "species_name", ignoreDuplicates: true }
    );

  if (error) throw new Error(`Seeding species failed: ${error.message}`);
  console.log(`Species ready (${SPECIES.length}).`);
}

async function seedUsers() {
  const { error } = await supabase
    .from("users")
    .upsert(USERS, { onConflict: "email", ignoreDuplicates: true });

  if (error) throw new Error(`Seeding users failed: ${error.message}`);
  console.log(`Users ready (${USERS.length}).`);
}

async function getLookupMaps() {
  const [
    { data: users, error: usersError },
    { data: species, error: speciesError },
  ] = await Promise.all([
    supabase.from("users").select("user_id, email"),
    supabase.from("species").select("species_id, species_name"),
  ]);

  if (usersError) throw new Error(`Fetching users failed: ${usersError.message}`);
  if (speciesError)
    throw new Error(`Fetching species failed: ${speciesError.message}`);

  const userIdByEmail = new Map(users.map((u) => [u.email, u.user_id]));
  const speciesIdByName = new Map(
    species.map((s) => [s.species_name, s.species_id])
  );

  return { userIdByEmail, speciesIdByName };
}

async function seedPets(userIdByEmail, speciesIdByName) {
  const { data: existingPets, error: existingError } = await supabase
    .from("pets")
    .select("pet_id, name, owner_id");

  if (existingError)
    throw new Error(`Fetching existing pets failed: ${existingError.message}`);

  const existingKey = new Set(
    existingPets.map((p) => `${p.name}::${p.owner_id}`)
  );

  const rowsToInsert = PETS.filter((pet) => {
    const ownerId = userIdByEmail.get(pet.owner_email);
    return ownerId && !existingKey.has(`${pet.name}::${ownerId}`);
  }).map((pet) => ({
    owner_id: userIdByEmail.get(pet.owner_email),
    name: pet.name,
    species_id: speciesIdByName.get(pet.species_name),
    breed: pet.breed,
    age_months: pet.age_months,
    description: pet.description,
    status: pet.status,
  }));

  if (rowsToInsert.length === 0) {
    console.log("Pets already seeded, nothing to insert.");
    return;
  }

  const { error } = await supabase.from("pets").insert(rowsToInsert);
  if (error) throw new Error(`Seeding pets failed: ${error.message}`);
  console.log(`Inserted ${rowsToInsert.length} new pet(s).`);
}

async function seedAdoptionRequests(userIdByEmail) {
  const { data: pets, error: petsError } = await supabase
    .from("pets")
    .select("pet_id, name");

  if (petsError) throw new Error(`Fetching pets failed: ${petsError.message}`);

  const petIdByName = new Map(pets.map((p) => [p.name, p.pet_id]));

  const { data: existingRequests, error: existingError } = await supabase
    .from("adoption_requests")
    .select("pet_id, adopter_id");

  if (existingError)
    throw new Error(
      `Fetching existing adoption requests failed: ${existingError.message}`
    );

  const existingKey = new Set(
    existingRequests.map((r) => `${r.pet_id}::${r.adopter_id}`)
  );

  const rowsToInsert = ADOPTION_REQUESTS.filter((req) => {
    const petId = petIdByName.get(req.pet_name);
    const adopterId = userIdByEmail.get(req.adopter_email);
    return (
      petId && adopterId && !existingKey.has(`${petId}::${adopterId}`)
    );
  }).map((req) => ({
    pet_id: petIdByName.get(req.pet_name),
    adopter_id: userIdByEmail.get(req.adopter_email),
    status: req.status,
  }));

  if (rowsToInsert.length === 0) {
    console.log("Adoption requests already seeded, nothing to insert.");
    return;
  }

  const { error } = await supabase
    .from("adoption_requests")
    .insert(rowsToInsert);
  if (error)
    throw new Error(`Seeding adoption requests failed: ${error.message}`);
  console.log(`Inserted ${rowsToInsert.length} new adoption request(s).`);
}

async function main() {
  console.log(`Seeding Supabase project at ${supabaseUrl} ...`);

  await seedSpecies();
  await seedUsers();

  const { userIdByEmail, speciesIdByName } = await getLookupMaps();

  await seedPets(userIdByEmail, speciesIdByName);
  await seedAdoptionRequests(userIdByEmail);

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
