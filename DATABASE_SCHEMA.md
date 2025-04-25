# Supabase Database Schema "public"

## Tables

### adventures
- **id** `uuid` (primary key, gen_random_uuid())
- **created_at** `timestamptz` (now())
- **user_id** `uuid` (foreign key -> auth.user.id)
- **adventure** `jsonb`
- **user_prompt** `text` (nullable)

## Notes
- All tables have Row Level Security enabled
- All tables have a user_id column which is a foreign key onto auth.user.id for authorization checks