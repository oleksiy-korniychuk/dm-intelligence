# OpenRouter Migration Guide

## Overview

This application has been migrated from direct Gemini API calls to OpenRouter, providing greater flexibility, provider independence, and support for user-provided API keys (BYOK - Bring Your Own Key).

## What Changed

### Architecture

**Before:**
- Direct calls to Google Gemini API via `@google/genai` SDK
- Single admin API key for all users
- Tightly coupled to Gemini-specific APIs

**After:**
- Unified calls through OpenRouter API
- Support for both admin (default) and user-provided API keys
- OpenAI-compatible API using the `openai` SDK
- Easy to swap models and providers

### Key Benefits

1. **Provider Independence**: Easily switch between 400+ models on OpenRouter
2. **Cost Transparency**: Users can bring their own API keys and pay for their own usage
3. **Flexible Architecture**: Clean abstraction layer makes future changes easier
4. **Model Diversity**: Access to models from OpenAI, Anthropic, Google, Meta, and more
5. **Fallback Support**: Automatic fallback to admin key if user hasn't configured their own

## Setup Instructions

### 1. Environment Variables

Update your `.env.local` file with the following:

```bash
# Required: OpenRouter API Key (admin/default key)
OPENROUTER_API_KEY=sk-or-v1-...

# Optional: Default model to use (defaults to google/gemini-2.0-flash-exp)
OPENROUTER_DEFAULT_MODEL=google/gemini-2.0-flash-exp

# Optional: Application URL for OpenRouter attribution
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Existing Supabase configuration (unchanged)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Tavily API for search (unchanged)
TAVILY_API_KEY=your_tavily_api_key
```

### 2. Database Migration

Run the SQL migration to create the `user_api_keys` table:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the migration file
# supabase/migrations/001_user_api_keys.sql
```

This creates:
- `user_api_keys` table for storing user API keys
- Row-level security policies
- Indexes for performance
- Auto-update triggers

### 3. Get an OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Add credits to your account
6. Copy the key (starts with `sk-or-v1-`)

### 4. Install Dependencies

```bash
npm install
```

This installs the `openai` SDK and required LangChain dependencies.

## API Key Management

### Admin/Default Key

The `OPENROUTER_API_KEY` environment variable serves as the default key used when:
- A user hasn't configured their own key
- Anonymous/non-authenticated requests
- As a fallback if user key retrieval fails

### User API Keys (BYOK)

Users can configure their own OpenRouter API keys through the API:

#### Set/Update API Key
```javascript
POST /api/user/api-key
Content-Type: application/json

{
  "apiKey": "sk-or-v1-..."
}
```

#### Check if User Has Key
```javascript
GET /api/user/api-key

Response:
{
  "hasKey": true,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

#### Remove API Key
```javascript
DELETE /api/user/api-key
```

### Security

- API keys are stored in the database (consider encrypting at rest for production)
- Row-level security (RLS) ensures users can only access their own keys
- Keys are never exposed to the client
- All LLM calls happen server-side

## Model Configuration

### Available Models

OpenRouter supports 400+ models. Popular choices include:

**Google Models:**
- `google/gemini-2.0-flash-exp` (current default)
- `google/gemini-2.0-flash-thinking-exp-1219`
- `google/gemini-pro-1.5`

**OpenAI Models:**
- `openai/gpt-4o`
- `openai/gpt-4-turbo`
- `openai/gpt-3.5-turbo`

**Anthropic Models:**
- `anthropic/claude-3.5-sonnet`
- `anthropic/claude-3-opus`

**Meta Models:**
- `meta-llama/llama-3.1-405b-instruct`

View all models at: https://openrouter.ai/models

### Changing the Default Model

Set the `OPENROUTER_DEFAULT_MODEL` environment variable:

```bash
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3.5-sonnet
```

Or programmatically in `lib/llm/client.js`:

```javascript
export function getDefaultModel() {
    return process.env.OPENROUTER_DEFAULT_MODEL || "google/gemini-2.0-flash-exp";
}
```

## Architecture Details

### New Files

```
lib/llm/
├── client.js                    # OpenRouter client factory and key management
├── gmAgentService.js            # Game Master chat service
├── adventureService.js          # Adventure generation service
└── createCharacterService.js    # Character creation service

app/api/user/api-key/
└── route.js                     # API key management endpoints

supabase/migrations/
└── 001_user_api_keys.sql       # Database schema for user API keys
```

### Migration Map

| Old File | New File | Status |
|----------|----------|--------|
| `lib/gemini/gmAgentService.js` | `lib/llm/gmAgentService.js` | ✅ Migrated |
| `lib/gemini/adventureService.js` | `lib/llm/adventureService.js` | ✅ Migrated |
| `lib/gemini/createCharacterService.js` | `lib/llm/createCharacterService.js` | ✅ Migrated |
| `lib/gemini/schemas/*` | `lib/gemini/schemas/*` | ✅ Reused (converted at runtime) |
| `lib/gemini/tools.js` | `lib/gemini/tools.js` | ✅ Converted in createCharacterService |

### API Compatibility

All service functions maintain the same interface:

```javascript
// GM Agent Service
gameMasterResponse(playerMessage, history, adventureOutline, characters, userId)

// Adventure Service
generateAdventure(userInput, userId)

// Character Creation Service
buildUpContext(history, character, userId)
generateGmResponse(history, character, userId)
```

The `userId` parameter is optional and used for API key lookup.

## Testing

### Test Without User Key (Uses Default)

```bash
# Start the dev server
npm run dev

# Make requests - will use OPENROUTER_API_KEY
```

### Test With User Key

1. Set up a user API key via the API
2. Make authenticated requests
3. Monitor which key is being used in logs

### Verify Key Source

The LLM client logs which key source is being used:
- `source: "user"` - User's API key
- `source: "default"` - Admin/default key

## Troubleshooting

### Error: "OPENROUTER_API_KEY is not set"

**Solution**: Add `OPENROUTER_API_KEY` to your `.env.local` file

### Error: "Invalid API key format"

**Solution**: Ensure your API key starts with `sk-or-v1-` (OpenRouter format)

### Model Not Found

**Solution**: Check that the model exists at https://openrouter.ai/models
Some models require specific provider preferences or credits.

### Structured Outputs Not Working

**Solution**: Not all models support structured outputs. Use models that support JSON schema:
- OpenAI models (gpt-4, gpt-3.5-turbo, etc.)
- Google Gemini models
- Some Anthropic models

Check model capabilities at https://openrouter.ai/models

### Function Calling Not Working

**Solution**: Ensure you're using a model that supports function calling.
Compatible models include:
- OpenAI gpt-4/gpt-3.5 family
- Google Gemini models
- Anthropic Claude 3+ models

## Cost Management

### Pricing

OpenRouter charges based on tokens used. Pricing varies by model:
- View pricing: https://openrouter.ai/models
- Most models charge per 1M tokens
- Gemini models are generally cost-effective

### Tips

1. **Use Cheaper Models for Testing**: Switch to `google/gemini-2.0-flash-exp` during development
2. **Monitor Usage**: Check OpenRouter dashboard for usage statistics
3. **Set Budgets**: Configure spending limits in OpenRouter account settings
4. **Enable BYOK**: Let users pay for their own usage with their API keys

## Future Enhancements

### Planned Features

1. **UI for API Key Management**: Settings page for users to manage their keys
2. **Model Selection UI**: Let users choose their preferred model
3. **Usage Analytics**: Track token usage per user
4. **Encryption at Rest**: Encrypt API keys in database
5. **OAuth Integration**: OpenRouter OAuth for seamless authentication

### Contributing

When adding new LLM features:

1. Use the `createLLMClient()` function from `lib/llm/client.js`
2. Pass `userId` for API key lookup
3. Use OpenAI-compatible API patterns
4. Handle errors gracefully with fallbacks

## Support

### Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter Discord](https://discord.gg/openrouter)

### Migration Issues

If you encounter issues during migration:

1. Check environment variables are set correctly
2. Verify database migration ran successfully
3. Ensure OpenRouter API key has credits
4. Review logs for detailed error messages

---

**Migration Date**: January 2025
**Version**: 1.0.0
**Status**: ✅ Complete
