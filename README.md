# Kealtor's Multi-Workflow Chat & Journal Application

A sophisticated, multi-modal application that combines AI-powered chat functionality with personal journaling capabilities. Built with modern React architecture, comprehensive user management, and a flexible workflow system that can be extended for various use cases.

## 🌟 Overview

This application serves as a comprehensive platform that combines multiple productivity workflows:
- **AI Chat Assistant**: Interactive conversations with workflow-specific contexts
- **Personal Journaling**: Structured journal entries with mood tracking and tagging
- **User Management**: Complete authentication system with role-based permissions
- **Admin Dashboard**: Workflow permission management for administrators

## 🚀 Key Features

### 🤖 Multi-Workflow Chat System
- **Workflow-Based Conversations**: Different chat modes (assistant, support, creative, etc.)
- **Persistent Chat History**: All conversations are saved and retrievable
- **Message Management**: Pin important chats, delete unwanted conversations
- **Real-time Updates**: Live conversation updates with Supabase real-time
- **Chat Organization**: Categorize and search through chat history
- **Export Capabilities**: Export chat conversations for external use

### 📝 Advanced Journaling System
- **Daily Entries**: Create and manage daily journal entries
- **Mood Tracking**: Record emotional states with numerical mood ratings (1-10)
- **Tag System**: Organize entries with custom tags for easy categorization
- **Date Navigation**: Browse entries by specific dates
- **Rich Text Support**: Full text editing capabilities for detailed entries
- **Privacy Protection**: All entries are user-specific with row-level security

### 👥 Comprehensive User Management
- **Secure Authentication**: Email/password authentication via Supabase Auth
- **User Profiles**: Customizable profiles with avatars, display names, and bio
- **Admin System**: Role-based access control with admin privileges
- **Permission Management**: Granular workflow access control
- **Account Settings**: Complete user preference management
- **Profile Security**: Protected user data with proper RLS policies

### 🔐 Administrative Features
- **User Permission Control**: Grant/revoke workflow access to users
- **Admin Dashboard**: Comprehensive administrative interface
- **Workflow Management**: Control which users can access specific workflows
- **User Analytics**: View user activity and system usage
- **System Configuration**: Manage application-wide settings

### 📱 Modern User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: System-aware theme switching
- **Accessible UI**: WCAG compliant interface components
- **Modern Design System**: Consistent visual language throughout
- **Smooth Animations**: Polished interactions and transitions
- **Sidebar Navigation**: Collapsible navigation with workflow switching

## 🛠 Technology Stack

### Frontend Architecture
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast development server and optimized builds
- **Wouter**: Lightweight client-side routing
- **React Query**: Server state management and caching

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Radix UI**: Accessible, unstyled UI primitives
- **Lucide React**: Modern icon library
- **CSS Variables**: Dynamic theming with CSS custom properties
- **Design Tokens**: Semantic color and spacing system
- **Responsive Utilities**: Mobile-first responsive design

### Backend & Database
- **Supabase**: Complete backend-as-a-service solution
  - PostgreSQL database with real-time capabilities
  - Authentication and user management
  - Row Level Security (RLS) policies
  - Edge Functions for server-side logic
  - File storage (ready for future features)
- **Real-time Subscriptions**: Live data updates across clients
- **Database Functions**: Custom PostgreSQL functions for complex operations
- **Triggers**: Automated database operations (timestamps, permissions)

### State Management & Data
- **React Hooks**: Built-in state management with useState, useEffect, useContext
- **Custom Hooks**: Reusable logic for authentication, admin checks, and API calls
- **Service Layer**: Organized API calls and business logic
- **Type Safety**: Full TypeScript integration with Supabase generated types

## 🏗 Architecture & Design Patterns

### Component Architecture
```
src/components/
├── admin/                  # Administrative interfaces
│   ├── AdminSetupInstructions.tsx
│   └── WorkflowPermissions.tsx
├── chat/                   # Chat-related components
│   ├── ChatArea.tsx       # Main chat interface
│   ├── ChatInput.tsx      # Message input component
│   └── ChatMessage.tsx    # Individual message display
├── journal/               # Journaling components
│   └── JournalArea.tsx    # Journal entry interface
├── layout/                # Layout and navigation
│   ├── ChatLayout.tsx     # Main application layout
│   └── ChatSidebar.tsx    # Collapsible sidebar navigation
├── user/                  # User management
│   └── UserSettings.tsx   # User profile and settings
└── ui/                    # Reusable UI components (40+ components)
    ├── button.tsx         # Button variants and states
    ├── input.tsx          # Form input components
    ├── card.tsx           # Content containers
    └── ...                # Complete shadcn/ui component library
```

### Service Layer Architecture
```
src/services/
├── adminService.ts        # Administrative operations
├── chatService.ts         # Chat CRUD operations
├── journalService.ts      # Journal entry management
└── userService.ts         # User profile management
```

### Hook Architecture
```
src/hooks/
├── useAuth.tsx            # Authentication state management
├── useAdmin.tsx           # Admin privilege checking
├── use-mobile.tsx         # Mobile device detection
└── use-toast.ts           # Toast notification system
```

### Configuration Management
```
src/config/
├── supabase-instances.ts  # Multi-environment Supabase configuration
└── supabase.ts            # Supabase client configuration
```

## 🎨 Design System

### Color System
The application uses a comprehensive semantic color system defined in `src/index.css`:

#### Light Theme Colors
- **Primary**: HSL-based primary brand colors with variants
- **Secondary**: Supporting colors for secondary actions
- **Background**: Multi-level background colors (background, card, popover)
- **Foreground**: Text colors with muted variants
- **Status Colors**: Success, warning, destructive states
- **Interactive**: Border, input, ring colors for form elements
- **Chat Colors**: Specialized colors for chat interface

#### Dark Theme Support
- Complete dark mode with adjusted color values
- Automatic system preference detection
- Smooth theme transitions

### Typography
- **Font Family**: System font stack with fallbacks
- **Font Sizes**: Semantic sizing from text-xs to text-4xl
- **Font Weights**: Regular, medium, semibold, bold variants
- **Line Heights**: Optimized for readability

### Spacing & Layout
- **Consistent Spacing**: 4px base unit with logical progression
- **Grid System**: Flexbox and CSS Grid for complex layouts
- **Responsive Breakpoints**: Mobile-first responsive design
- **Container System**: Centered containers with proper padding

### Component Variants
Each UI component includes multiple variants:
- **Button**: Default, destructive, outline, secondary, ghost, link
- **Card**: Default with header, content, footer sections
- **Input**: Various sizes and states with proper focus handling
- **Navigation**: Active states, hover effects, disabled states

## 🗄 Database Schema

### Core Tables

#### `profiles` Table
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,           -- Links to auth.users
  display_name TEXT,                      -- User's display name
  avatar_url TEXT,                        -- Profile picture URL
  bio TEXT,                              -- User biography
  is_admin BOOLEAN DEFAULT false,         -- Admin flag
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `chats` Table
```sql
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                 -- Owner of the chat
  title TEXT NOT NULL,                   -- Chat title/subject
  chat_type TEXT NOT NULL,               -- Type of chat
  workflow TEXT NOT NULL,                -- Associated workflow
  messages JSONB DEFAULT '[]'::jsonb,    -- Chat messages array
  pinned BOOLEAN DEFAULT false,          -- Pinned status
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `journal_entries` Table
```sql
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                 -- Owner of the entry
  content TEXT NOT NULL,                 -- Entry content
  entry_date DATE NOT NULL,              -- Date of the entry
  mood INTEGER,                          -- Mood rating (1-10)
  tags TEXT[] DEFAULT '{}',              -- Tags array
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_permissions` Table
```sql
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                 -- User receiving permission
  workflow_id TEXT NOT NULL,             -- Workflow identifier
  granted_by UUID,                       -- Admin who granted permission
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, workflow_id)
);
```

### Database Functions

#### `update_updated_at_column()`
Automatically updates the `updated_at` timestamp on row modifications.

#### `is_current_user_admin()`
Security definer function to check admin status without RLS recursion.

#### `handle_new_user_permissions()`
Automatically grants default permissions to newly registered users.

### Row Level Security (RLS)

All tables implement comprehensive RLS policies:
- **User Data Isolation**: Users can only access their own data
- **Admin Privileges**: Admins have elevated access where appropriate
- **Public Visibility**: Profile information is publicly viewable (display names, avatars)
- **Secure Defaults**: Deny-by-default security with explicit allow policies

## 🔐 Authentication Flow

### Registration Process
1. **User Signup**: Email/password via Supabase Auth
2. **Email Verification**: Optional email confirmation
3. **Profile Creation**: Automatic profile record creation
4. **Default Permissions**: Automatic "assistant" workflow access
5. **Redirect**: Automatic redirect to main application

### Login Process
1. **Credential Validation**: Secure authentication via Supabase
2. **Session Management**: Persistent sessions with automatic refresh
3. **Permission Loading**: Fetch user permissions and admin status
4. **Application State**: Initialize user-specific data and preferences

### Security Features
- **Password Requirements**: Configurable password policies
- **Session Management**: Secure token handling and refresh
- **CSRF Protection**: Built-in cross-site request forgery protection
- **Rate Limiting**: Automatic brute force protection
- **Logout Security**: Complete session cleanup on logout

## 🔧 Multi-Environment Configuration

### Supabase Instance Management

The application supports multiple Supabase environments through a sophisticated configuration system:

#### Configuration File: `src/config/supabase-instances.ts`
```typescript
export const SUPABASE_INSTANCES: Record<string, SupabaseInstance> = {
  development: {
    name: "Development",
    url: "https://your-dev.supabase.co",
    anonKey: "your-dev-anon-key",
    description: "Local development environment"
  },
  staging: {
    name: "Staging", 
    url: "https://your-staging.supabase.co",
    anonKey: "your-staging-anon-key",
    description: "Testing and QA environment"
  },
  production: {
    name: "Production",
    url: "https://your-prod.supabase.co", 
    anonKey: "your-prod-anon-key",
    description: "Live production environment"
  },
  current: {
    name: "Kealtor's Project",
    url: "https://supabase.kealtor.de",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Current active project instance"
  }
};

// Switch environments by changing this value
export const ACTIVE_INSTANCE = 'current';
```

#### Environment Switching
- **Instant Switching**: Change `ACTIVE_INSTANCE` and restart dev server
- **Console Confirmation**: Automatic confirmation of active instance
- **Safe Switching**: Prevents accidental production data access
- **Development Workflow**: Easy switching for testing and development

### Client Configuration
The configurable client wrapper (`src/lib/supabase-client.ts`) provides:
- **Instance Selection**: Automatic selection based on `ACTIVE_INSTANCE`
- **Error Handling**: Graceful handling of configuration errors
- **Type Safety**: Full TypeScript support for all instances
- **Runtime Validation**: Ensures configuration integrity

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Modern web browser

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd kealtor-chat-app
   npm install
   ```

2. **Configure Supabase Connection**
   - Edit `src/config/supabase-instances.ts`
   - Add your Supabase project URL and anon key
   - Set the `ACTIVE_INSTANCE` to your configuration

3. **Set Up Database Schema**
   Execute the complete database setup in your Supabase SQL Editor:
   
   ```sql
   -- ================================================
   -- COMPLETE DATABASE SCHEMA SETUP
   -- ================================================
   
   -- 1. CREATE PROFILES TABLE
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
   
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   
   -- Profiles RLS policies
   CREATE POLICY "Profiles are viewable by everyone" 
   ON public.profiles FOR SELECT USING (true);
   
   CREATE POLICY "Users can insert their own profile" 
   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own profile" 
   ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
   
   -- 2. CREATE CHATS TABLE
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
   
   ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
   
   -- Chats RLS policies
   CREATE POLICY "Users can view their own chats" 
   ON public.chats FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can create their own chats" 
   ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own chats" 
   ON public.chats FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete their own chats" 
   ON public.chats FOR DELETE USING (auth.uid() = user_id);
   
   -- 3. CREATE JOURNAL ENTRIES TABLE
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
   
   ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
   
   -- Journal entries RLS policies
   CREATE POLICY "Users can view their own journal entries" 
   ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can create their own journal entries" 
   ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own journal entries" 
   ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete their own journal entries" 
   ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);
   
   -- 4. CREATE USER PERMISSIONS TABLE
   CREATE TABLE public.user_permissions (
     id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL,
     workflow_id TEXT NOT NULL,
     granted_by UUID,
     granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
     UNIQUE(user_id, workflow_id)
   );
   
   ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
   
   -- 5. CREATE DATABASE FUNCTIONS
   CREATE OR REPLACE FUNCTION public.update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = now();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SET search_path = public;
   
   CREATE OR REPLACE FUNCTION public.is_current_user_admin()
   RETURNS BOOLEAN AS $$
   BEGIN
     RETURN EXISTS (
       SELECT 1 FROM public.profiles 
       WHERE user_id = auth.uid() AND is_admin = TRUE
     );
   END;
   $$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;
   
   CREATE OR REPLACE FUNCTION public.handle_new_user_permissions()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.user_permissions (user_id, workflow_id)
     VALUES (NEW.id, 'assistant')
     ON CONFLICT (user_id, workflow_id) DO NOTHING;
     
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
   
   -- 6. CREATE TRIGGERS
   CREATE TRIGGER update_chats_updated_at
   BEFORE UPDATE ON public.chats
   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
   
   CREATE TRIGGER update_profiles_updated_at
   BEFORE UPDATE ON public.profiles
   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
   
   CREATE TRIGGER update_journal_entries_updated_at
   BEFORE UPDATE ON public.journal_entries
   FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
   
   CREATE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_permissions();
   
   -- 7. USER PERMISSIONS RLS POLICIES
   CREATE POLICY "Users can view their own permissions" 
   ON public.user_permissions FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Admins can view all user permissions" 
   ON public.user_permissions FOR SELECT USING (is_current_user_admin());
   
   CREATE POLICY "Admins can grant permissions" 
   ON public.user_permissions FOR INSERT WITH CHECK (is_current_user_admin());
   
   CREATE POLICY "Admins can revoke permissions" 
   ON public.user_permissions FOR DELETE USING (is_current_user_admin());
   ```

4. **Configure Authentication Settings**
   In your Supabase dashboard:
   - Go to Authentication → Settings
   - Set Site URL to your application URL (e.g., `http://localhost:5173`)
   - Configure redirect URLs as needed
   - Disable email confirmation for faster development (optional)

5. **Create Admin User**
   After your first user registration:
   ```sql
   UPDATE public.profiles 
   SET is_admin = TRUE 
   WHERE user_id = 'YOUR_USER_ID_HERE';
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Verify Setup**
   - Check console for Supabase connection confirmation
   - Test user registration and login
   - Verify chat creation functionality
   - Test journal entry creation
   - Confirm admin access (if applicable)

## 🎯 Core Functionality Guide

### Chat System Usage

#### Creating Chats
1. **New Chat**: Click "New Chat" in the sidebar
2. **Workflow Selection**: Choose appropriate workflow (assistant, support, etc.)
3. **Message Input**: Type messages in the chat input area
4. **Send**: Press Enter or click Send button

#### Managing Chats
- **Pin Chats**: Click pin icon to keep important chats at the top
- **Delete Chats**: Use the delete option to remove unwanted conversations
- **Search Chats**: Use the search functionality to find specific conversations
- **Export Chats**: Export conversation history for external use

#### Workflow System
The application supports multiple workflow types:
- **Assistant**: General AI assistance and help
- **Support**: Technical support conversations
- **Creative**: Creative writing and brainstorming
- **Analysis**: Data analysis and research tasks
- **Custom**: User-defined workflow types

### Journal System Usage

#### Creating Journal Entries
1. **Navigate to Journal**: Use sidebar to switch to Journal view
2. **New Entry**: Click "New Entry" or select a specific date
3. **Content Creation**: Write your journal entry in the text editor
4. **Mood Tracking**: Set your mood rating (1-10 scale)
5. **Add Tags**: Include relevant tags for categorization
6. **Save Entry**: Save your entry for future reference

#### Organizing Entries
- **Date Navigation**: Browse entries by calendar date
- **Tag Filtering**: Filter entries by tags
- **Mood Analysis**: View mood patterns over time
- **Search**: Full-text search through all entries
- **Export**: Export journal data for backup

### User Management

#### Profile Management
1. **Access Settings**: Click user icon → Settings
2. **Profile Info**: Update display name, bio, avatar
3. **Account Info**: View account creation date, user ID
4. **Security**: Manage password and security settings

#### Admin Functions (Admin Users Only)
1. **Access Admin Panel**: Navigate to Settings → Admin tab
2. **Grant Permissions**: Add workflow access for specific users
3. **Revoke Access**: Remove workflow permissions
4. **User Management**: View and manage all user accounts
5. **System Settings**: Configure application-wide settings

## 🎨 UI Component System

### Core Components

#### Navigation Components
- **ChatSidebar**: Collapsible sidebar with workflow switching
- **Breadcrumb**: Navigation breadcrumb trail
- **Navigation Menu**: Main application navigation

#### Form Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: Text inputs with validation states
- **Textarea**: Multi-line text input for longer content
- **Select**: Dropdown selection components
- **Checkbox**: Binary choice inputs
- **Switch**: Toggle switches for settings

#### Layout Components
- **Card**: Content containers with header/body/footer
- **Tabs**: Tabbed content organization
- **Accordion**: Collapsible content sections
- **Dialog**: Modal dialogs and confirmations
- **Sheet**: Slide-out panels for additional content

#### Feedback Components
- **Toast**: Non-intrusive notification system
- **Alert**: Inline alert messages
- **Progress**: Progress indicators for loading states
- **Skeleton**: Loading placeholder components

#### Data Display
- **Avatar**: User profile images with fallbacks
- **Badge**: Status indicators and labels
- **Table**: Structured data display
- **Pagination**: Large dataset navigation

### Component Customization

All components support:
- **Theme Variants**: Automatic dark/light mode adaptation
- **Size Variants**: Multiple sizing options (sm, md, lg, xl)
- **State Variants**: Different states (default, hover, focus, disabled)
- **Color Variants**: Semantic color applications
- **Custom Styling**: Easy customization via className props

### Accessibility Features
- **ARIA Labels**: Comprehensive accessibility labeling
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and indicators
- **Screen Reader Support**: Optimized for assistive technologies
- **High Contrast**: Support for high contrast modes

## 🔧 Development Workflow

### Available Scripts
```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build production bundle
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run type-check   # TypeScript type checking

# Database
npm run db:generate  # Generate Supabase types
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database to initial state
```

### Development Best Practices

#### Code Organization
- **Component Structure**: One component per file with clear naming
- **Service Layer**: Separate business logic from UI components
- **Type Safety**: Comprehensive TypeScript usage
- **Error Handling**: Consistent error handling patterns
- **Performance**: Optimization for loading and rendering

#### State Management Patterns
- **Local State**: useState for component-specific state
- **Shared State**: Context providers for cross-component state
- **Server State**: React Query for server data management
- **Form State**: React Hook Form for complex forms

#### Testing Strategy
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Accessibility Tests**: Automated accessibility validation

### Code Style Guidelines

#### TypeScript
- Strict type checking enabled
- Interface definitions for all data structures
- Proper return type annotations
- Generic type usage where appropriate

#### React Patterns
- Functional components with hooks
- Custom hooks for reusable logic
- Proper dependency arrays in useEffect
- Memoization for performance optimization

#### Styling
- Tailwind utility classes preferred
- Semantic color tokens from design system
- Responsive design mobile-first
- Dark mode considerations

## 📦 Deployment

### Production Deployment

#### Build Preparation
```bash
# Install dependencies
npm ci

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build production bundle
npm run build
```

#### Environment Configuration

##### Production Supabase Setup
1. **Create Production Instance**: Set up production Supabase project
2. **Configure Instance**: Add production config to `supabase-instances.ts`
3. **Update Active Instance**: Set `ACTIVE_INSTANCE` to production
4. **Deploy Database**: Run all migration SQL on production database
5. **Configure Auth**: Set up production authentication URLs

##### Environment Variables
```bash
# Production environment
NODE_ENV=production
```

#### Deployment Options

##### Static Hosting (Netlify/Vercel)
1. **Connect Repository**: Link git repository to hosting platform
2. **Build Settings**: Configure build command and output directory
3. **Environment Variables**: Set up production environment variables
4. **Custom Domain**: Configure custom domain and SSL
5. **Deploy**: Automatic deployment on git push

##### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

##### Self-Hosted Deployment
1. **Server Setup**: Configure web server (nginx/apache)
2. **Build Process**: Set up automated build pipeline
3. **SSL Configuration**: Install SSL certificates
4. **Monitoring**: Set up application monitoring
5. **Backups**: Configure automated backups

### Performance Optimization

#### Bundle Optimization
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Remove unused code from bundles
- **Asset Optimization**: Compress images and static assets
- **Caching**: Configure proper caching headers

#### Runtime Performance
- **Lazy Loading**: Lazy load components and routes
- **Memoization**: Cache expensive calculations
- **Virtual Scrolling**: Handle large data sets efficiently
- **Image Optimization**: Responsive images with proper formats

## 🔍 Monitoring & Analytics

### Error Monitoring
- **Error Boundaries**: Catch and handle React errors gracefully
- **Error Logging**: Comprehensive error logging and reporting
- **Performance Monitoring**: Track application performance metrics
- **User Analytics**: Monitor user behavior and feature usage

### Database Monitoring
- **Query Performance**: Monitor slow queries and optimization
- **Connection Pooling**: Efficient database connection management
- **Backup Monitoring**: Ensure regular database backups
- **Security Monitoring**: Track unauthorized access attempts

## 🛡 Security Considerations

### Data Protection
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive input sanitization
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **Data Encryption**: Sensitive data encryption at rest and transit

### Authentication Security
- **Password Policies**: Strong password requirements
- **Session Management**: Secure session handling and expiration
- **Rate Limiting**: Brute force attack prevention
- **Multi-Factor Authentication**: Optional MFA support
- **Audit Logging**: Track authentication events

### API Security
- **HTTPS Only**: Force secure connections
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Server-side validation of all inputs
- **Authorization**: Proper permission checking

## 🔧 Troubleshooting

### Common Issues

#### Database Connection
```
Error: Invalid API key
Solution: Verify anon key in supabase-instances.ts
Check: Ensure key matches Supabase dashboard
```

#### Authentication Problems
```
Error: Users can't sign up
Solution: Check Supabase Auth settings
Verify: Site URL and redirect URLs configured
```

#### Permission Issues
```
Error: Users can't access features
Solution: Check RLS policies and user permissions
Verify: Admin has granted appropriate workflow access
```

#### Build Errors
```
Error: TypeScript compilation failed
Solution: Run npm run type-check for details
Fix: Address type errors in code
```

### Debug Tools

#### Console Debugging
- **Supabase Connection**: Check console for connection status
- **Authentication State**: Monitor auth state changes
- **API Calls**: Track API requests and responses
- **Error Messages**: Comprehensive error logging

#### Browser DevTools
- **Network Tab**: Monitor API calls and response times
- **Application Tab**: Check localStorage and sessionStorage
- **Console**: View error messages and debug information
- **Performance**: Profile application performance

## 📚 API Reference

### Authentication Hooks

#### `useAuth()`
```typescript
interface AuthHook {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthError | null>;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
}
```

#### `useAdmin()`
```typescript
interface AdminHook {
  isAdmin: boolean;
  loading: boolean;
  checkAdminStatus: () => Promise<boolean>;
}
```

### Service APIs

#### Chat Service
```typescript
// Create new chat
chatService.createChat(userId: string, title: string, workflow: string): Promise<ChatSession>

// Get user chats
chatService.getUserChats(userId: string): Promise<ChatSession[]>

// Update chat
chatService.updateChat(chatId: string, updates: Partial<ChatSession>): Promise<ChatSession>

// Delete chat
chatService.deleteChat(chatId: string): Promise<boolean>

// Toggle pin status
chatService.togglePin(chatId: string, pinned: boolean): Promise<boolean>
```

#### Journal Service
```typescript
// Create journal entry
journalService.createEntry(entry: JournalEntryInput): Promise<JournalEntry>

// Get entries by date
journalService.getEntriesByDate(userId: string, date: Date): Promise<JournalEntry[]>

// Update entry
journalService.updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<JournalEntry>

// Delete entry
journalService.deleteEntry(entryId: string): Promise<boolean>

// Get entries by tags
journalService.getEntriesByTags(userId: string, tags: string[]): Promise<JournalEntry[]>
```

#### User Service
```typescript
// Get user profile
userService.getUserProfile(userId: string): Promise<UserProfile | null>

// Update user profile
userService.updateUserProfile(userId: string, updates: ProfileUpdate): Promise<UserProfile>

// Grant permission
userService.grantPermission(userId: string, workflowId: string): Promise<boolean>

// Check permissions
userService.getUserPermissions(userId: string): Promise<UserPermission[]>
```

## 🤝 Contributing

### Development Setup
1. **Fork Repository**: Create your fork of the project
2. **Clone Fork**: Clone your fork locally
3. **Install Dependencies**: Run `npm install`
4. **Configure Supabase**: Set up your development Supabase instance
5. **Create Branch**: Create feature branch for your changes

### Contribution Guidelines
- **Code Style**: Follow existing TypeScript and React patterns
- **Testing**: Add tests for new functionality
- **Documentation**: Update documentation for changes
- **Accessibility**: Ensure new components are accessible
- **Performance**: Consider performance impact of changes

### Pull Request Process
1. **Create Feature Branch**: Branch from main for new features
2. **Implement Changes**: Make your changes with proper testing
3. **Update Documentation**: Update relevant documentation
4. **Test Thoroughly**: Test functionality across different scenarios
5. **Submit PR**: Create pull request with clear description

### Code Review Criteria
- **Functionality**: Does the code work as intended?
- **Code Quality**: Is the code well-structured and maintainable?
- **Performance**: Does it maintain good performance?
- **Security**: Are there any security considerations?
- **Accessibility**: Is the feature accessible to all users?

## 📋 Roadmap

### Planned Features
- **AI Integration**: Enhanced AI capabilities with multiple providers
- **Real-time Collaboration**: Multi-user chat rooms and shared journals
- **File Attachments**: Support for file uploads in chats and journals
- **Advanced Analytics**: Detailed user analytics and reporting
- **Mobile App**: React Native mobile application
- **Offline Support**: Offline-first functionality with sync
- **Plugin System**: Extensible plugin architecture
- **Advanced Search**: Full-text search across all content
- **Data Export**: Comprehensive data export functionality
- **Backup/Restore**: User-initiated backup and restore features

### Technical Improvements
- **Performance Optimization**: Further performance enhancements
- **Bundle Optimization**: Reduce bundle size and improve loading
- **PWA Features**: Progressive Web App capabilities
- **Enhanced Security**: Additional security measures and auditing
- **Monitoring**: Advanced application monitoring and alerting
- **Testing**: Comprehensive test coverage and automation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

For questions, issues, or contributions:
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Refer to this comprehensive README
- **Community**: Join discussions and share feedback

---

**Built with ❤️ using modern web technologies for a seamless user experience.**