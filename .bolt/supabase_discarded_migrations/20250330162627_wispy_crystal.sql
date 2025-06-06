/*
  # Add RLS policies for email templates

  1. Security Changes
    - Enable RLS on email_templates table
    - Add policies for authenticated users to:
      - Insert their own templates
      - Select their own templates
      - Update their own templates
      - Delete their own templates
*/

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy for inserting templates
CREATE POLICY "Users can insert their own templates"
ON email_templates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for viewing templates
CREATE POLICY "Users can view their own templates"
ON email_templates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating templates
CREATE POLICY "Users can update their own templates"
ON email_templates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting templates
CREATE POLICY "Users can delete their own templates"
ON email_templates
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);