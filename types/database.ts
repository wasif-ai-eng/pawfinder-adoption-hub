export type PetStatus = "Available" | "Adopted" | "Pending";
export type AdoptionRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number;
          full_name: string;
          email: string;
          city: string;
          created_at: string;
        };
        Insert: {
          user_id?: number;
          full_name: string;
          email: string;
          city: string;
          created_at?: string;
        };
        Update: {
          user_id?: number;
          full_name?: string;
          email?: string;
          city?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      species: {
        Row: {
          species_id: number;
          species_name: string;
        };
        Insert: {
          species_id?: number;
          species_name: string;
        };
        Update: {
          species_id?: number;
          species_name?: string;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          pet_id: number;
          owner_id: number;
          name: string;
          species_id: number;
          breed: string | null;
          age_months: number | null;
          description: string | null;
          status: PetStatus;
          created_at: string;
        };
        Insert: {
          pet_id?: number;
          owner_id: number;
          name: string;
          species_id: number;
          breed?: string | null;
          age_months?: number | null;
          description?: string | null;
          status?: PetStatus;
          created_at?: string;
        };
        Update: {
          pet_id?: number;
          owner_id?: number;
          name?: string;
          species_id?: number;
          breed?: string | null;
          age_months?: number | null;
          description?: string | null;
          status?: PetStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_owner";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
          {
            foreignKeyName: "fk_species";
            columns: ["species_id"];
            referencedRelation: "species";
            referencedColumns: ["species_id"];
          },
        ];
      };
      adoption_requests: {
        Row: {
          request_id: number;
          pet_id: number;
          adopter_id: number;
          status: AdoptionRequestStatus;
          requested_at: string;
          completed_at: string | null;
          preferred_date: string | null;
          home_description: string | null;
        };
        Insert: {
          request_id?: number;
          pet_id: number;
          adopter_id: number;
          status?: AdoptionRequestStatus;
          requested_at?: string;
          completed_at?: string | null;
          preferred_date?: string | null;
          home_description?: string | null;
        };
        Update: {
          request_id?: number;
          pet_id?: number;
          adopter_id?: number;
          status?: AdoptionRequestStatus;
          requested_at?: string;
          completed_at?: string | null;
          preferred_date?: string | null;
          home_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_pet";
            columns: ["pet_id"];
            referencedRelation: "pets";
            referencedColumns: ["pet_id"];
          },
          {
            foreignKeyName: "fk_adopter";
            columns: ["adopter_id"];
            referencedRelation: "users";
            referencedColumns: ["user_id"];
          },
        ];
      };
    };
    Views: {
      available_pets: {
        Row: {
          pet_id: number;
          name: string;
          species_name: string;
          breed: string | null;
          age_months: number | null;
          status: PetStatus;
          owner_name: string;
          owner_email: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
  };
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];

export type Views<ViewName extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][ViewName]["Row"];

export type User = Tables<"users">;
export type Species = Tables<"species">;
export type Pet = Tables<"pets">;
export type AdoptionRequest = Tables<"adoption_requests">;
export type AvailablePets = Views<"available_pets">;

export type PetWithRelations = Pet & {
  species: Pick<Species, "species_name"> | null;
  users: Pick<User, "full_name" | "email"> | null;
};

export type AdoptionRequestWithRelations = AdoptionRequest & {
  pets:
    | (Pick<Pet, "pet_id" | "name" | "status" | "owner_id"> & {
        users: Pick<User, "full_name" | "email"> | null;
      })
    | null;
  users: Pick<User, "full_name" | "email"> | null;
};
