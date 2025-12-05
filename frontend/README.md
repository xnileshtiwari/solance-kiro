# Solance Frontend

A modern Next.js-based learning platform frontend built with React 19, TypeScript, and Tailwind CSS.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before setting up the frontend, ensure you have the following installed on your device:

- **Node.js**: Version 20.x or higher (recommended: 20.11.0 or later)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
  
- **npm**: Version 10.x or higher (comes with Node.js)
  - Verify installation: `npm --version`

- **Git**: For cloning the repository
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

## 🌍 Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd solance/frontend
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
cp .env.local.example .env.local
```

Or create it manually with the following content:

```env
# Gemini API Key for AI features
GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL (default: http://localhost:8080)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Internal API Key for backend authentication
INTERNAL_API_KEY=your_internal_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Obtain Required API Keys

#### Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and paste it as `GEMINI_API_KEY` in `.env.local`

#### Supabase Credentials
1. Visit [Supabase](https://supabase.com/)
2. Create a new project or use an existing one
3. Go to **Project Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Internal API Key
- This should match the API key configured in your backend
- Set the same value in both frontend and backend configurations

#### Backend API URL
- If running locally: `http://localhost:8080`
- If using a deployed backend: Use the deployed URL

## 📦 Installation

### Step 1: Install Dependencies

Navigate to the frontend directory and install all required packages:

```bash
cd frontend
npm install
```

This will install all dependencies listed in `package.json`, including:
- Next.js 16.0.4
- React 19.2.0
- TypeScript
- Tailwind CSS
- Supabase client libraries
- Google Generative AI SDK
- Markdown and LaTeX rendering libraries

### Step 2: Verify Installation

Check that all dependencies are installed correctly:

```bash
npm list --depth=0
```

## 🚀 Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The application will be available at:
- **Local**: [http://localhost:3000](http://localhost:3000)
- **Network**: Your local IP address will be shown in the terminal

The development server features:
- ✅ Hot Module Replacement (HMR)
- ✅ Fast Refresh for instant updates
- ✅ Detailed error messages
- ✅ TypeScript type checking

### Production Build

Build the application for production:

```bash
npm run build
```

This command:
1. Compiles TypeScript
2. Optimizes React components
3. Bundles and minifies assets
4. Generates static pages where possible

### Start Production Server

After building, start the production server:

```bash
npm start
```

The production server will run at [http://localhost:3000](http://localhost:3000)

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── subjects/     # Subjects page
│   │   ├── studio/       # Studio page
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── ui/           # UI components
│   │   └── ...           # Feature components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library configurations
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── .env.local            # Environment variables (not in git)
├── .env.local.example    # Environment variables template
├── next.config.ts        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🛠 Technologies Used

### Core Framework
- **Next.js 16.0.4**: React framework with App Router
- **React 19.2.0**: UI library
- **TypeScript 5.x**: Type-safe JavaScript

### Styling
- **Tailwind CSS 4.x**: Utility-first CSS framework
- **PostCSS**: CSS processing
- **class-variance-authority**: Component variants
- **clsx & tailwind-merge**: Class name utilities

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Phosphor Icons**: Additional icons
- **nextjs-toploader**: Page loading indicator

### Authentication & Database
- **Supabase**: Backend-as-a-Service
  - `@supabase/supabase-js`: JavaScript client
  - `@supabase/ssr`: Server-side rendering support

### AI & Content
- **@google/genai**: Google Generative AI SDK
- **react-markdown**: Markdown rendering
- **remark-math**: Math notation support
- **rehype-katex**: LaTeX rendering
- **katex**: Math typesetting

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Or run on a different port
PORT=3001 npm run dev
```

### Environment Variables Not Loading

1. Ensure `.env.local` is in the `frontend` directory
2. Restart the development server after changing environment variables
3. Verify variable names start with `NEXT_PUBLIC_` for client-side access
4. Check for syntax errors in `.env.local` (no spaces around `=`)

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript definitions
npm update @types/node @types/react @types/react-dom
```

### Supabase Connection Issues

1. Verify `NEXT_PUBLIC_SUPABASE_URL` is a valid URL
2. Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check Supabase project status at [supabase.com](https://supabase.com)
4. Verify network connectivity

### API Connection Issues

1. Ensure backend is running (default: `http://localhost:8080`)
2. Verify `NEXT_PUBLIC_API_URL` matches your backend URL
3. Check `INTERNAL_API_KEY` matches backend configuration
4. Verify CORS settings on backend allow frontend origin

### Node Version Issues

If you encounter compatibility issues:

```bash
# Check current Node version
node --version

# Install Node Version Manager (nvm)
# Linux/Mac:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use recommended Node version
nvm install 20
nvm use 20
```

### Clear All Caches

If experiencing persistent issues:

```bash
# Clear all caches and reinstall
rm -rf node_modules .next package-lock.json
npm cache clean --force
npm install
npm run dev
```

## 📝 Additional Notes

### Running on Different Devices

#### Same Network
1. Find your local IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```
2. Access from another device: `http://<your-ip>:3000`

#### Remote Access
- Deploy to Vercel, Netlify, or similar platforms
- Or use ngrok for temporary public URL:
  ```bash
  npx ngrok http 3000
  ```

### Development Tips

- Use `npm run dev` for development with hot-reload
- Use `npm run build && npm start` to test production builds locally
- Check browser console for client-side errors
- Check terminal for server-side errors
- Use React DevTools browser extension for debugging

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

---

For backend setup instructions, see the [Backend README](../backend/README.md).
