# Solance

> **AI-Powered Personalized Learning Platform**

Solance is an intelligent tutoring system that leverages Google's Gemini AI to provide personalized, adaptive learning experiences. The platform generates custom questions, offers step-by-step guidance, and provides intelligent grading with detailed feedback to help students learn at their own pace.

## 🌟 What is Solance?

Solance transforms traditional learning by creating a dynamic, AI-driven educational experience. Instead of static content, students receive:

- **Personalized Questions**: AI-generated questions tailored to individual learning levels and progress
- **Adaptive Difficulty**: Questions that adjust based on student performance and understanding
- **Step-by-Step Guidance**: Co-pilot mode that breaks down complex problems into manageable steps
- **Intelligent Grading**: Automated answer evaluation with constructive feedback and corrections
- **Custom Subjects**: Create and share custom learning subjects with structured curricula
- **Solo & Co-pilot Modes**: Learn independently or with AI assistance

## 🎯 How It Works

### 1. **Subject Creation (Studio)**
Create custom learning subjects using natural language or structured forms:
- Define subject metadata (name, category, description)
- Structure curriculum by levels with specific concepts
- Set question styles and difficulty progression
- Make subjects public or keep them private

### 2. **Learning Modes**

#### Solo Mode
- Receive personalized questions based on your subject and level
- Answer at your own pace
- Get instant AI-powered grading with detailed feedback
- Progress through curriculum concepts systematically

#### Co-pilot Mode
- Request step-by-step guidance for complex problems
- Receive hints and explanations without giving away answers
- Build understanding through scaffolded learning

### 3. **AI-Powered Features**
- **Question Generation**: Creates unique questions aligned with curriculum concepts
- **Context Awareness**: Tracks previous questions to avoid repetition and ensure variety
- **Mathematical Rendering**: Full support for LaTeX equations and Markdown formatting
- **Intelligent Feedback**: Provides corrections, explanations, and encouragement

## 🏗️ Architecture

Solance is built as a modern full-stack application:

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                   │
│  • React 19 with TypeScript                             │
│  • Tailwind CSS for styling                             │
│  • Supabase authentication                              │
│  • Real-time UI updates                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ REST API
                 │
┌────────────────▼────────────────────────────────────────┐
│                   Backend (FastAPI)                      │
│  • Python 3.12+ with FastAPI                            │
│  • Google Gemini AI integration                         │
│  • Supabase database                                    │
│  • Secure API endpoints                                 │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 16.0.4 with App Router
- React 19.2.0 & TypeScript
- Tailwind CSS 4.x
- Supabase for authentication
- KaTeX for math rendering
- React Markdown for content display

**Backend:**
- FastAPI (Python 3.12+)
- Google Gemini AI (gemini-2.5-flash)
- Supabase for data persistence
- Pydantic for data validation
- Uvicorn ASGI server

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **Python** 3.12 or higher
- **Git**
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))
- **Supabase Account** ([Sign up here](https://supabase.com))

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/xnileshtiwari/solance-kiro.git
   cd solance-kiro
   ```

2. **Set Up Backend**
   ```bash
   cd backend
   
   # Install UV (recommended) or use pip
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Install dependencies
   uv sync
   
   # Activate virtual environment
   source .venv/bin/activate  # macOS/Linux
   # or
   .venv\Scripts\Activate.ps1  # Windows
   
   # Create .env file
   cp .env.example .env  # Then edit with your API keys
   
   # Start backend server
   python api.py
   ```
   
   Backend will run at: `http://localhost:8080`

3. **Set Up Frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Create .env.local file
   cp .env.local.example .env.local  # Then edit with your API keys
   
   # Start development server
   npm run dev
   ```
   
   Frontend will run at: `http://localhost:3000`

### Environment Configuration

**Backend (`.env`):**
```env
GOOGLE_API_KEY=your_google_gemini_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_key
INTERNAL_API_KEY=your_secure_random_key
```

**Frontend (`.env.local`):**
```env
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_API_URL=http://localhost:8080
INTERNAL_API_KEY=same_as_backend_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

For detailed setup instructions and troubleshooting:

- **[Frontend Setup Guide](./frontend/README.md)** - Complete frontend installation, configuration, and development guide
- **[Backend Setup Guide](./backend/README.md)** - Complete backend installation, API documentation, and deployment guide

### API Documentation

Once the backend is running, access interactive API documentation:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

### Key API Endpoints

- `POST /api/v1/generate-question` - Generate personalized questions
- `POST /api/v1/generate-steps` - Get step-by-step guidance
- `POST /api/v1/grade-answer` - Grade student answers
- `POST /api/v1/subjects` - Create custom subjects
- `GET /api/v1/subjects` - Retrieve user subjects

## 🎨 Features

### For Students
- ✅ Personalized learning paths
- ✅ Adaptive question difficulty
- ✅ Instant feedback and grading
- ✅ Step-by-step problem solving
- ✅ Progress tracking
- ✅ Mathematical equation support (LaTeX)
- ✅ Markdown-formatted content

### For Educators
- ✅ Custom subject creation
- ✅ Curriculum structuring by levels
- ✅ Public/private subject sharing
- ✅ AI-assisted content generation
- ✅ Flexible question styles

### Technical Features
- ✅ Modern, responsive UI
- ✅ Real-time authentication
- ✅ Secure API endpoints
- ✅ Docker support
- ✅ TypeScript type safety
- ✅ Comprehensive error handling

## 🛠️ Development

### Project Structure

```
solance/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js pages and routes
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Library configurations
│   │   └── services/     # API services
│   └── public/           # Static assets
│
├── backend/              # FastAPI backend service
│   ├── src/
│   │   ├── api/          # API endpoints
│   │   ├── database/     # Database models
│   │   ├── question_generation/  # Question generation logic
│   │   ├── steps_generation/     # Steps generation logic
│   │   ├── solo_mode/    # Solo mode functionality
│   │   └── studio/       # Studio functionality
│   └── api.py            # Main application entry point
│
└── README.md             # This file
```

### Running Tests

**Backend:**
```bash
cd backend
source .venv/bin/activate
pytest
```

**Frontend:**
```bash
cd frontend
npm run lint
```

## 🐳 Docker Deployment

### Backend Docker
```bash
cd backend
docker build -t solance-backend .
docker run -p 8080:8080 --env-file .env solance-backend
```

### Frontend Docker
```bash
cd frontend
docker build -t solance-frontend .
docker run -p 3000:3000 solance-frontend
```

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**
- Backend default: `8080` (change with `--port` flag)
- Frontend default: `3000` (change with `PORT=3001 npm run dev`)

**Environment variables not loading:**
- Ensure `.env` files are in correct directories
- Restart servers after changing environment variables
- Check for syntax errors (no spaces around `=`)

**API connection issues:**
- Verify backend is running at `http://localhost:8080`
- Check `INTERNAL_API_KEY` matches in both frontend and backend
- Ensure CORS is properly configured

For detailed troubleshooting, see:
- [Frontend Troubleshooting](./frontend/README.md#troubleshooting)
- [Backend Troubleshooting](./backend/README.md#troubleshooting)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/xnileshtiwari/solance-kiro/issues)
- **Documentation**: See README files in `frontend/` and `backend/` directories
- **API Docs**: http://localhost:8080/docs (when backend is running)

---

**Built with ❤️ using Google Gemini AI, Next.js, and FastAPI**
