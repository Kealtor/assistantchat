# Chat AI Application

A modern AI-powered chat application built with React, TypeScript, Tailwind CSS, and Supabase for backend functionality.

## Features

- 🤖 AI Chat Assistant with different workflows
- 👤 User Authentication (Sign up/Sign in)
- 💾 Persistent chat history
- 📌 Pin/Unpin important chats
- 🗑️ Delete unwanted chats
- 📱 Responsive design
- 🌙 Modern UI with Tailwind CSS

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (Database, Authentication, Real-time)
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Routing**: Wouter

## Quick Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd chat-ai-app
   npm install
   ```

2. **Configure Supabase** (See detailed instructions below)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Supabase Configuration & Instance Switching

### Overview
This application uses a **configurable Supabase integration** that allows you to easily switch between different Supabase instances (development, staging, production, etc.) without modifying core files.

### 📁 Configuration Files
- `src/config/supabase-instances.ts` - Define your Supabase instances
- `src/lib/supabase-client.ts` - Configurable client wrapper  
- `src/integrations/supabase/client.ts` - Auto-generated client (DO NOT EDIT)

### 🚀 How to Switch Supabase Instances

#### Step 1: Define Your Instances
Edit `src/config/supabase-instances.ts` and add your Supabase instances:

```typescript
export const SUPABASE_INSTANCES: Record<string, SupabaseInstance> = {
  development: {
    name: "Development",
    url: "https://your-dev-project.supabase.co",
    anonKey: "your-dev-anon-key",
    description: "Development environment"
  },
  
  staging: {
    name: "Staging", 
    url: "https://your-staging-project.supabase.co",
    anonKey: "your-staging-anon-key",
    description: "Staging environment"
  },
  
  production: {
    name: "Production",
    url: "https://your-prod-project.supabase.co", 
    anonKey: "your-prod-anon-key",
    description: "Production environment"
  }
};
```

#### Step 2: Switch Active Instance
In the same file, change the `ACTIVE_INSTANCE` variable:

```typescript
// Change this to switch instances
export const ACTIVE_INSTANCE = 'development'; // or 'staging', 'production', etc.
```

#### Step 3: Get Your Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon/public key**

#### Step 4: Set Up Database Schema
Your new Supabase instance needs the following table structure:

```sql
-- Create chats table
CREATE TABLE public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  workflow TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pinned BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chats" 
ON public.chats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chats" 
ON public.chats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" 
ON public.chats FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" 
ON public.chats FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

#### Step 5: Configure Authentication
1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your **Site URL** to match your application URL
3. Add any additional **Redirect URLs** if needed
4. Configure email templates and providers as needed

#### Step 6: Test the Connection
1. Save your changes
2. Restart your development server
3. Check the browser console for the connection confirmation message
4. Try signing up/signing in to verify the connection works

### 🔄 Quick Instance Switching Guide

**To switch from one instance to another:**

1. Open `src/config/supabase-instances.ts`
2. Change the `ACTIVE_INSTANCE` value:
   ```typescript
   export const ACTIVE_INSTANCE = 'production'; // Change this line
   ```
3. Save the file
4. Restart your development server
5. Check console for confirmation: `✅ Connected to Supabase instance: Production`

### 🏗️ Advanced Configuration

#### Multiple Environment Setup
You can create different configuration files for different environments:

```
src/config/
├── supabase-instances.ts          # Main configuration
├── supabase-instances.dev.ts      # Development overrides  
├── supabase-instances.staging.ts  # Staging overrides
└── supabase-instances.prod.ts     # Production overrides
```

#### Dynamic Instance Switching
For runtime instance switching, you can modify the `getActiveInstance()` function to read from URL parameters or environment detection.

### 🛠️ Troubleshooting

#### Common Issues:

1. **"Invalid ACTIVE_INSTANCE" error**
   - Check that your `ACTIVE_INSTANCE` matches a key in `SUPABASE_INSTANCES`
   - Verify spelling and case sensitivity

2. **"Invalid API key" error**
   - Double-check your anon key in the instance configuration
   - Ensure you're using the anon key, not the service role key

3. **Authentication not working**
   - Verify your Site URL in Supabase Auth settings
   - Check that RLS policies are properly configured

4. **Database connection issues**
   - Confirm your project URL is correct
   - Ensure your Supabase project is not paused

5. **Console shows wrong instance**
   - Clear browser cache and localStorage
   - Restart development server
   - Check for typos in configuration

### 🔒 Security Notes

- Never commit service role keys to your repository
- The anon key is safe to include in client-side code
- Always use Row Level Security (RLS) policies to protect your data
- Regularly rotate your API keys
- Use different instances for different environments

### 📋 Instance Switching Checklist

- [ ] Add new instance to `SUPABASE_INSTANCES`
- [ ] Set `ACTIVE_INSTANCE` to new instance key  
- [ ] Verify URL and anon key are correct
- [ ] Set up database schema in new instance
- [ ] Configure authentication settings
- [ ] Test sign up/sign in functionality
- [ ] Verify chat creation and retrieval
- [ ] Update any environment-specific settings

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # React components
│   ├── chat/           # Chat-related components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── config/             # Configuration files
│   └── supabase-instances.ts  # Supabase instance definitions
├── hooks/              # Custom React hooks
├── integrations/       # Third-party integrations
│   └── supabase/       # Auto-generated Supabase client and types
├── lib/                # Utility functions and configured clients
│   └── supabase-client.ts     # Configurable Supabase wrapper
├── pages/              # Page components
└── services/           # Business logic and API calls
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with your Supabase instance
5. Submit a pull request

## License

This project is licensed under the MIT License.