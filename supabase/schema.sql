-- Run this in Supabase SQL editor
create extension if not exists "uuid-ossp";

create table lookups (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  image_url text,
  car_make text,
  car_model text,
  car_year text,
  car_confidence text,
  car_notes text,
  specs jsonb,
  created_at timestamptz default now()
);

create index lookups_user_id_idx on lookups(user_id);

-- Also create a Storage bucket named "car-images" with public access in the Supabase dashboard
