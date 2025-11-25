# Next.js Frontend Project Structure

## Overview
This Next.js application replicates the visual design and user experience of the original HTML homepage while integrating with the Solance API for dynamic question and step generation.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── globals.css         # Global styles with custom CSS variables
│   │   ├── layout.tsx          # Root layout with fonts and metadata
│   │   └── page.tsx            # Homepage component
│   ├── components/             # Reusable React components
│   ├── services/               # API service layer
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind CSS configuration with custom colors
└── package.json                # Dependencies and scripts
```

## Key Features Implemented

### 1. Custom Color Palette
- Cozy color scheme matching original design
- CSS variables for consistent theming
- Tailwind CSS extended with custom colors

### 2. Typography
- Nunito font for body text
- Lora font for serif/math content
- Proper font loading with Next.js font optimization

### 3. Animations & Styling
- Floating blob background animations
- Custom CSS classes for interactive elements
- Hover effects and transitions

### 4. Dependencies
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Phosphor Icons** for iconography
- **React 19** for modern React features

## Development Commands

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Next Steps
Ready for component implementation following the task list in the spec document.