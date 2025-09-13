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

#### Step 4: Set Up Complete Database Schema
Your Supabase instance needs the following complete database structure. Run these SQL commands in your Supabase SQL Editor:

```sql
-- ================================================
-- 1. CREATE PROFILES TABLE (User management)
-- ================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- ================================================
-- 2. CREATE CHATS TABLE (Chat functionality)
-- ================================================
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

-- Enable RLS on chats
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Chats RLS policies
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

-- ================================================
-- 3. CREATE JOURNAL ENTRIES TABLE (Journaling feature)
-- ================================================
CREATE TABLE public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  entry_date DATE NOT NULL,
  mood INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on journal entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal entries RLS policies
CREATE POLICY "Users can view their own journal entries" 
ON public.journal_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries" 
ON public.journal_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" 
ON public.journal_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" 
ON public.journal_entries FOR DELETE 
USING (auth.uid() = user_id);

-- ================================================
-- 4. CREATE USER PERMISSIONS TABLE (Admin workflow management)
-- ================================================
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id TEXT NOT NULL,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, workflow_id)
);

-- Enable RLS on user permissions
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 5. CREATE DATABASE FUNCTIONS
-- ================================================

-- Function to update timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to check if current user is admin (security definer to prevent RLS recursion)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function to handle new user permissions (grants assistant workflow by default)
CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant assistant workflow permission to new users
  INSERT INTO public.user_permissions (user_id, workflow_id)
  VALUES (NEW.id, 'assistant')
  ON CONFLICT (user_id, workflow_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ================================================
-- 6. CREATE TRIGGERS
-- ================================================

-- Trigger to update timestamps on chats
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update timestamps on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update timestamps on journal entries
CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to automatically grant permissions to new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_permissions();

-- ================================================
-- 7. USER PERMISSIONS RLS POLICIES (Admin-controlled)
-- ================================================

-- Users can view their own permissions
CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions FOR SELECT 
USING (auth.uid() = user_id);

-- Admins can view all user permissions
CREATE POLICY "Admins can view all user permissions" 
ON public.user_permissions FOR SELECT 
USING (is_current_user_admin());

-- Admins can grant permissions
CREATE POLICY "Admins can grant permissions" 
ON public.user_permissions FOR INSERT 
WITH CHECK (is_current_user_admin());

-- Admins can revoke permissions
CREATE POLICY "Admins can revoke permissions" 
ON public.user_permissions FOR DELETE 
USING (is_current_user_admin());
```

#### Step 5: Set Up Admin Users
After creating the database structure, you need to manually grant admin access to specific users:

1. Go to your Supabase dashboard → **Authentication** → **Users**
2. Find the user you want to make an admin and copy their **User ID**
3. Go to **SQL Editor** and run:
   ```sql
   UPDATE public.profiles 
   SET is_admin = TRUE 
   WHERE user_id = 'PASTE_USER_ID_HERE';
   ```
4. The user will immediately have admin access to manage workflow permissions

#### Key Database Features:
- **User Profiles**: Extended user information with admin flags
- **Chat System**: Persistent chat history with pinning support
- **Journal Entries**: Personal journaling with mood tracking and tags
- **Admin System**: Role-based access control for workflow permissions
- **Automatic Permissions**: New users automatically get "assistant" workflow access
- **Row Level Security**: All tables protected with appropriate RLS policies
- **Audit Trail**: Automatic timestamp tracking for all data changes

#### Step 6: Configure Authentication
1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your **Site URL** to match your application URL
3. Add any additional **Redirect URLs** if needed
4. Configure email templates and providers as needed

#### Step 7: Test the Connection
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