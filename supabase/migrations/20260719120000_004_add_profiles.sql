/*
# Add User Profiles (name, phone, city)

1. New Table
- `profiles` — one row per user, holding the extra signup fields (full name,
  phone, city/region) that don't belong in Supabase's built-in `auth.users`.

2. Automation
- A trigger on `auth.users` automatically creates a matching `profiles` row
  right after signup, reading `full_name` / `phone` / `city` out of the
  signup metadata (`options.data` in `supabase.auth.signUp`). This works
  correctly even when email confirmation is required (i.e. before the user
  has a session), which a client-side insert could not do.

3. Security
- RLS enabled; a user can only read/update their own profile row.
*/

CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    phone text,
    city text,
    is_guest boolean NOT NULL DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
CREATE POLICY "users_select_own_profile" ON profiles FOR SELECT
    TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user is created
-- (covers normal signup, and anonymous/guest signup too).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, city, is_guest)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'phone',
        NEW.raw_user_meta_data ->> 'city',
        COALESCE(NEW.is_anonymous, false)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
