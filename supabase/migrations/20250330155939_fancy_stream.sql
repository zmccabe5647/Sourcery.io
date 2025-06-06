/*
  # Create demo user account

  1. Changes
    - Creates a demo user account with email and password using Supabase auth functions
    - Adds user subscription record for the demo account
*/

-- Create demo user using Supabase auth functions
DO $$
DECLARE
  demo_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'demo@sourcery.io';

  -- If user doesn't exist, create it
  IF demo_user_id IS NULL THEN
    -- Insert the user using auth.users_with_password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'demo@sourcery.io',
      crypt('Demo123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO demo_user_id;

    -- Create subscription for new user
    INSERT INTO public.user_subscriptions (
      user_id,
      status,
      plan,
      email_quota,
      current_period_end
    )
    VALUES (
      demo_user_id,
      'active',
      'free',
      50,
      now() + interval '1 month'
    );
  END IF;
END $$;