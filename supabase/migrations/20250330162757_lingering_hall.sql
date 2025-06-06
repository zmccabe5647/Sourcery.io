/*
  # Create demo account and subscription

  1. Changes
    - Create demo user account if it doesn't exist
    - Set up subscription for demo user
    - Ensure idempotency (safe to run multiple times)

  2. Security
    - Password is securely hashed
    - Demo account has standard user privileges
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
      '{"name": "Demo User"}',
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

  -- Add some sample data for the demo account
  INSERT INTO public.contacts (
    user_id,
    first_name,
    last_name,
    email,
    company,
    title,
    industry
  )
  SELECT
    new_user_id,
    unnest(ARRAY['John', 'Sarah', 'Michael']),
    unnest(ARRAY['Smith', 'Johnson', 'Brown']),
    unnest(ARRAY['john@example.com', 'sarah@example.com', 'michael@example.com']),
    unnest(ARRAY['Acme Inc', 'Tech Corp', 'Global Solutions']),
    unnest(ARRAY['CEO', 'CTO', 'Director']),
    unnest(ARRAY['Technology', 'Software', 'Consulting'])
  WHERE NOT EXISTS (
    SELECT 1 FROM public.contacts WHERE user_id = new_user_id
  );

  -- Add sample email templates
  INSERT INTO public.email_templates (
    user_id,
    name,
    subject,
    content
  )
  SELECT
    new_user_id,
    'Introduction Email',
    'Quick question about {{company}}',
    E'Hi {{first_name}},\n\nI noticed that {{company}} is doing great work in the {{industry}} space, and I wanted to reach out.\n\nWould you be open to a quick chat about how we could help {{company}} achieve better results?\n\nBest regards,\nDemo User'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.email_templates WHERE user_id = new_user_id
  );
END $$;