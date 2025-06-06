/*
  # Create demo account

  1. Creates a demo user with:
    - Email: demo@sourcery.io
    - Password: Demo123!
    - Free plan subscription
    - 50 email quota

  2. Security:
    - Uses DO block for safe transaction handling
    - Checks for existing user before creation
    - Creates subscription only if user exists
*/

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id FROM auth.users WHERE email = 'demo@sourcery.io';
  
  -- Create user if doesn't exist
  IF new_user_id IS NULL THEN
    INSERT INTO auth.users (
      id,
      email,
      raw_user_meta_data,
      raw_app_meta_data,
      aud,
      role,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_sent_at,
      is_super_admin,
      last_sign_in_at
    )
    VALUES (
      gen_random_uuid(),
      'demo@sourcery.io',
      '{}',
      '{"provider": "email", "providers": ["email"]}',
      'authenticated',
      'authenticated',
      crypt('Demo123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      now(),
      false,
      now()
    )
    RETURNING id INTO new_user_id;
  END IF;

  -- Create subscription if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM public.user_subscriptions 
    WHERE user_id = new_user_id
  ) THEN
    INSERT INTO public.user_subscriptions (
      user_id,
      status,
      plan,
      email_quota,
      current_period_end
    ) VALUES (
      new_user_id,
      'active',
      'free',
      50,
      now() + interval '1 month'
    );
  END IF;
END $$;