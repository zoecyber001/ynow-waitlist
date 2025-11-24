-- OTP Verification Table
create table otp_verifications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contact text not null, -- email or phone
  contact_type text not null check (contact_type in ('email', 'phone')),
  otp_code text not null,
  expires_at timestamp with time zone not null,
  verified boolean default false,
  attempts integer default 0,
  max_attempts integer default 3
);

-- Index for faster lookups
create index idx_otp_contact on otp_verifications(contact, verified);
create index idx_otp_expires on otp_verifications(expires_at);

-- Enable Row Level Security
alter table otp_verifications enable row level security;

-- Allow anyone to insert (for OTP generation)
create policy "Anyone can insert OTP"
  on otp_verifications for insert
  with check (true);

-- Allow anyone to read their own OTP (for verification)
create policy "Anyone can read OTP"
  on otp_verifications for select
  using (true);

-- Update policy for marking as verified
create policy "Anyone can update OTP"
  on otp_verifications for update
  using (true);

-- Function to generate OTP
create or replace function generate_otp()
returns text
language plpgsql
as $$
declare
  otp text;
begin
  -- Generate 6-digit OTP
  otp := lpad(floor(random() * 1000000)::text, 6, '0');
  return otp;
end;
$$;

-- Function to create OTP verification
create or replace function create_otp_verification(
  p_contact text,
  p_contact_type text
)
returns table (
  otp_code text,
  expires_at timestamp with time zone
)
language plpgsql
as $$
declare
  v_otp text;
  v_expires_at timestamp with time zone;
begin
  -- Generate OTP
  v_otp := generate_otp();
  
  -- Set expiration (5 minutes from now)
  v_expires_at := now() + interval '5 minutes';
  
  -- Insert OTP record
  insert into otp_verifications (contact, contact_type, otp_code, expires_at)
  values (p_contact, p_contact_type, v_otp, v_expires_at);
  
  -- Return OTP and expiration
  return query select v_otp, v_expires_at;
end;
$$;

-- Function to verify OTP
create or replace function verify_otp(
  p_contact text,
  p_otp_code text
)
returns table (
  success boolean,
  message text
)
language plpgsql
as $$
declare
  v_record record;
begin
  -- Get the most recent unverified OTP for this contact
  select * into v_record
  from otp_verifications
  where contact = p_contact
    and verified = false
    and expires_at > now()
  order by created_at desc
  limit 1;
  
  -- Check if OTP exists
  if v_record is null then
    return query select false, 'OTP expired or not found. Please request a new one.'::text;
    return;
  end if;
  
  -- Check if max attempts reached
  if v_record.attempts >= v_record.max_attempts then
    return query select false, 'Maximum verification attempts reached. Please request a new OTP.'::text;
    return;
  end if;
  
  -- Increment attempts
  update otp_verifications
  set attempts = attempts + 1
  where id = v_record.id;
  
  -- Check if OTP matches
  if v_record.otp_code = p_otp_code then
    -- Mark as verified
    update otp_verifications
    set verified = true
    where id = v_record.id;
    
    return query select true, 'OTP verified successfully!'::text;
  else
    return query select false, 'Invalid OTP code. Please try again.'::text;
  end if;
end;
$$;

-- Function to cleanup expired OTPs (run periodically)
create or replace function cleanup_expired_otps()
returns void
language plpgsql
as $$
begin
  delete from otp_verifications
  where expires_at < now() - interval '1 hour';
end;
$$;

-- Update waitlist table to add verified flag
alter table waitlist add column if not exists verified boolean default false;
alter table waitlist add column if not exists verified_at timestamp with time zone;
