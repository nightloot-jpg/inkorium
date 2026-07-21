-- Add new values to post_type enum
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'poll';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'album';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'playlist';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'location';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'celebration';

-- Add metadata column
ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
