-- Migration: Add user_api_keys table for storing user OpenRouter API keys
-- This table allows users to bring their own API keys (BYOK)
-- TODO: Clean up this file

-- Create the user_api_keys table
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    openrouter_api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);

-- Enable Row Level Security
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own API keys
CREATE POLICY "Users can view their own API keys"
    ON user_api_keys
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can insert their own API keys
CREATE POLICY "Users can insert their own API keys"
    ON user_api_keys
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own API keys
CREATE POLICY "Users can update their own API keys"
    ON user_api_keys
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy: Users can delete their own API keys
CREATE POLICY "Users can delete their own API keys"
    ON user_api_keys
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function on update
CREATE TRIGGER update_user_api_keys_updated_at
    BEFORE UPDATE ON user_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE user_api_keys IS 'Stores user-provided OpenRouter API keys for BYOK (Bring Your Own Key) functionality';
COMMENT ON COLUMN user_api_keys.openrouter_api_key IS 'User''s OpenRouter API key (should be encrypted at application layer if needed)';
