# Supabase Database Schema "public"

## Tables

### adventures
- **id** `uuid` (primary key, gen_random_uuid())
- **created_at** `timestamptz` (now())
- **user_id** `uuid` (foreign key -> auth.user.id)
- **adventure** `jsonb`
- **user_prompt** `text` (nullable)

### characters
- **id** `uuid` (primary key, gen_random_uuid())
- **created_at** `timestamptz` (now())
- **user_id** `uuid` (foreign key -> auth.user.id)
- **character_sheet** `jsonb`

### adventure_characters
- **adventure_id** `uuid` (primary key)
- **character_id** `uuid` (primary key)
- **created_at** `timestamptz` (now())
- **user_id** `uuid` (foreign key -> auth.user.id)

### chat_messages
- **id** `uuid` (primary key, gen_random_uuid())
- **created_at** `timestamptz` (now())
- **user_id** `uuid` (foreign key -> auth.user.id)
- **session_id** `uuid` (either an adventure_id or character creation session ID)
- **role** `text` (either 'user' for player messages or 'assistant' for GM responses)
- **content** `jsonb` (the message content, includes text and any updates like character sheets)
- **metadata** `jsonb` (nullable, for any additional metadata like tool usage info)

#### Indexes
- `chat_messages_session_created_idx` ON (`session_id`, `created_at`)

## Notes
- All tables have Row Level Security enabled
- All tables have a user_id column which is a foreign key onto auth.user.id for authorization checks