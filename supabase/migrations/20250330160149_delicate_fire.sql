/*
  # Add email statistics tracking

  1. New Tables
    - `email_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `email_id` (uuid)
      - `status` (text: sent, bounced, opened, responded)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `email_stats` table
    - Add policy for authenticated users to read their own stats
*/

-- Create email_stats table
CREATE TABLE IF NOT EXISTS email_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'bounced', 'opened', 'responded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own stats
CREATE POLICY "Users can read their own stats"
  ON email_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_email_stats_updated_at
  BEFORE UPDATE ON email_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();