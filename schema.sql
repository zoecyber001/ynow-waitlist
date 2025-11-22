-- Create the waitlist table
create table waitlist (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique,
  phone text unique,
  user_type text not null check (user_type in ('driver', 'mechanic')),
  referral_code text unique not null,
  referred_by text, -- Optional: The code of the person who referred this user
  constraint email_or_phone_required check (email is not null or phone is not null)
);

-- Enable Row Level Security (RLS)
alter table waitlist enable row level security;

-- Allow anyone to insert (signup)
create policy "Anyone can insert"
  on waitlist for insert
  with check (true);

-- Allow users to read their own data (optional, mostly for debugging or dashboard later)
-- For now, we'll keep it simple and not expose read access publicly

-- Secure function to get the total waitlist count
create or replace function get_waitlist_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer from waitlist;
$$;

