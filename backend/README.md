# Solance Backend

A FastAPI-based backend service for the Solance AI tutoring platform. This service provides REST APIs for personalized question generation, step-by-step guidance, answer grading, and subject management using Google's Gemini AI.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Method 1: Local Setup with UV (Recommended)](#method-1-local-setup-with-uv-recommended)
  - [Method 2: Local Setup with pip](#method-2-local-setup-with-pip)
  - [Method 3: Docker Setup](#method-3-docker-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the backend, ensure you have the following installed on your system:

- **Python 3.12 or higher** - [Download Python](https://www.python.org/downloads/)
- **Git** - [Download Git](https://git-scm.com/downloads)
- **Docker** (optional, for containerized deployment) - [Download Docker](https://www.docker.com/get-started)
- **UV** (optional, for faster dependency management) - [Install UV](https://github.com/astral-sh/uv)

### Verify Prerequisites

```bash
# Check Python version
python --version
# or
python3 --version

# Check Git
git --version

# Check Docker (if using Docker method)
docker --version
```

---

## Installation

### Method 1: Local Setup with UV (Recommended)

UV is a fast Python package installer and resolver. This is the recommended method for development.

#### Step 1: Install UV

```bash
# On macOS and Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

#### Step 2: Clone the Repository

```bash
git clone https://github.com/xnileshtiwari/solance-kiro.git
cd solance-kiro/backend
```

#### Step 3: Install Dependencies

```bash
# Create virtual environment and install dependencies
uv sync
```

This will:
- Create a `.venv` directory with a Python virtual environment
- Install all dependencies from `pyproject.toml` and `uv.lock`

#### Step 4: Activate Virtual Environment

```bash
# On macOS/Linux
source .venv/bin/activate

# On Windows (PowerShell)
.venv\Scripts\Activate.ps1

# On Windows (Command Prompt)
.venv\Scripts\activate.bat
```

---

### Method 2: Local Setup with pip

If you prefer using pip instead of UV:

#### Step 1: Clone the Repository

```bash
git clone https://github.com/xnileshtiwari/solance-kiro.git
cd solance-kiro/backend
```

#### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux
source .venv/bin/activate

# On Windows (PowerShell)
.venv\Scripts\Activate.ps1

# On Windows (Command Prompt)
.venv\Scripts\activate.bat
```

#### Step 3: Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install google-genai>=1.52.0 \
            python-dotenv>=1.2.1 \
            fastapi>=0.104.0 \
            uvicorn>=0.24.0 \
            pydantic>=2.5.0 \
            pytest>=7.4.0 \
            hypothesis>=6.88.0 \
            httpx>=0.25.0 \
            supabase>=2.24.0
```

---

### Method 3: Docker Setup

For containerized deployment:

#### Step 1: Clone the Repository

```bash
git clone https://github.com/xnileshtiwari/solance-kiro.git
cd solance-kiro/backend
```

#### Step 2: Build Docker Image

```bash
docker build -t solance-backend .
```

#### Step 3: Run Docker Container

```bash
docker run -p 8080:8080 --env-file .env solance-backend
```

---

## Environment Configuration

The backend requires environment variables for API keys and database configuration.

### Step 1: Create Environment File

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

### Step 2: Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Google Gemini API Key (Required)
# Get your API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=your_google_api_key_here

# Supabase Configuration (Required)
# Get these from your Supabase project settings
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# Internal API Key for securing endpoints (Required)
# Generate a random secure key
INTERNAL_API_KEY=your_secure_random_api_key_here
```

> **Note**: The PORT is configured in the code (default: 8080) and doesn't need to be in the `.env` file.

### How to Get API Keys

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Supabase Credentials**:
   - Visit [Supabase Dashboard](https://app.supabase.com/)
   - Create a new project or select existing one
   - Go to Settings → API
   - Copy the `Project URL` and `anon/public` key

3. **Internal API Key**:
   - Generate a secure random string (at least 32 characters)
   - You can use: `openssl rand -hex 32` (on Linux/macOS)
   - Or use any password generator

### Example `.env` File

```env
GOOGLE_API_KEY=""
SUPABASE_URL=""
SUPABASE_KEY=""
INTERNAL_API_KEY=""
```

---

## Running the Application

### Local Development

#### Using UV (Recommended)

```bash
# Make sure virtual environment is activated
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\Activate.ps1  # On Windows

# Run the application
python api.py
```

#### Using pip

```bash
# Make sure virtual environment is activated
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\Activate.ps1  # On Windows

# Run the application
python api.py
```

#### Using Uvicorn Directly

```bash
# Run with auto-reload for development
uvicorn api:app --reload --host 0.0.0.0 --port 8080

# Or specify a different port
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

### Docker Deployment

```bash
# Build the image
docker build -t solance-backend .

# Run the container
docker run -p 8080:8080 --env-file .env solance-backend

# Run in detached mode
docker run -d -p 8080:8080 --env-file .env --name solance-api solance-backend

# View logs
docker logs -f solance-api

# Stop the container
docker stop solance-api

# Remove the container
docker rm solance-api
```

### Verify the Application is Running

Once started, you should see output similar to:

```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)
```

Test the health endpoint:

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{"status":"healthy","service":"solance-api"}
```

---

## API Documentation

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc

### Available Endpoints

#### Public Endpoints (No API Key Required)

- `GET /` - Root endpoint, returns API version
- `GET /health` - Health check endpoint

#### Protected Endpoints (Require X-API-Key Header)

- `POST /api/v1/generate-question` - Generate personalized questions
- `POST /api/v1/generate-steps` - Generate step-by-step guidance
- `POST /api/v1/grade-answer` - Grade student answers
- `POST /api/v1/subjects` - Create new subjects
- `GET /api/v1/subjects` - Get user subjects

### Authentication

Protected endpoints require the `X-API-Key` header:

```bash
curl -X POST http://localhost:8080/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_internal_api_key_here" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "user_id": "user123",
    "subject_id": "subject456",
    "previous_questions": []
  }'
```

### Example API Calls

#### 1. Generate a Question

```bash
curl -X POST http://localhost:8080/api/v1/generate-question \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "subject_id": "wtle4d",
    "previous_questions": []
  }'
```

#### 2. Generate Steps

```bash
curl -X POST http://localhost:8080/api/v1/generate-steps \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "question": "Solve for x: 2x + 4 = 10"
  }'
```

#### 3. Grade an Answer

```bash
curl -X POST http://localhost:8080/api/v1/grade-answer \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "model_name": "gemini-2.5-flash",
    "question": "Solve for x: 2x + 4 = 10",
    "student_answer": "x = 3"
  }'
```

#### 4. Create a Subject

```bash
curl -X POST http://localhost:8080/api/v1/subjects \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_INTERNAL_API_KEY" \
  -d '{
    "meta": {
      "display_name": "Algebra Basics",
      "subject": "mathematics",
      "description": "Introduction to algebraic concepts",
      "created_by": "user123",
      "public": false
    },
    "curriculum": [
      {
        "level": 1,
        "name": "Linear Equations",
        "concepts": ["Solving equations", "Variables"],
        "question_style": "Multiple Choice"
      }
    ]
  }'
```

---

## Testing

### Running Tests

```bash
# Activate virtual environment first
source .venv/bin/activate  # On macOS/Linux

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest src/test/test_question_generation.py

# Run with coverage
pytest --cov=src --cov-report=html
```

### Manual API Testing

Use the provided test scripts:

```bash
# Make the script executable
chmod +x test_api.sh

# Run the test script
./test_api.sh
```

### Testing with Postman or Insomnia

1. Import the API documentation from http://localhost:8080/docs
2. Set the `X-API-Key` header with your `INTERNAL_API_KEY`
3. Test various endpoints

---

## Project Structure

```
backend/
├── api.py                  # Main FastAPI application entry point
├── pyproject.toml          # Python project configuration and dependencies
├── uv.lock                 # Locked dependency versions (for UV)
├── Dockerfile              # Docker container configuration
├── .dockerignore           # Files to exclude from Docker build
├── .env                    # Environment variables (create this)
├── .python-version         # Python version specification (3.12)
├── test_api.sh             # API testing script
├── test_studio.py          # Studio API tests
├── test_studio_api.sh      # Studio API testing script
└── src/
    ├── api/
    │   └── endpoints/      # API route handlers
    │       ├── questions.py    # Question generation endpoints
    │       ├── steps.py        # Steps generation endpoints
    │       ├── grading.py      # Answer grading endpoints
    │       ├── subjects.py     # Subject management endpoints
    │       └── studio.py       # Studio endpoints
    ├── database/           # Database models and operations
    ├── question_generation/# Question generation logic
    ├── steps_generation/   # Steps generation logic
    ├── solo_mode/          # Solo mode functionality
    ├── studio/             # Studio functionality
    └── test/               # Test files
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
# Find process using port 8080
lsof -i :8080  # On macOS/Linux
netstat -ano | findstr :8080  # On Windows

# Kill the process or use a different port
uvicorn api:app --reload --port 8000
```

#### 2. Module Not Found Errors

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Make sure virtual environment is activated
source .venv/bin/activate

# Reinstall dependencies
uv sync
# or
pip install -r requirements.txt
```

#### 3. Environment Variables Not Loaded

**Error**: `Server security configuration error: INTERNAL_API_KEY not set`

**Solution**:
- Verify `.env` file exists in the `backend` directory
- Check that all required variables are set
- Restart the application after updating `.env`

#### 4. Supabase Connection Issues

**Error**: `SupabaseException: Invalid URL`

**Solution**:
- Verify `SUPABASE_URL` is correct (should start with `https://`)
- Verify `SUPABASE_KEY` is the anon/public key, not the service key
- Check your internet connection

#### 5. Google API Key Issues

**Error**: `Invalid API key`

**Solution**:
- Verify your API key is correct
- Check that the Gemini API is enabled in your Google Cloud project
- Ensure there are no extra spaces in the `.env` file

#### 6. Permission Denied (Docker)

**Error**: `Permission denied while trying to connect to the Docker daemon socket`

**Solution**:
```bash
# Add your user to the docker group (Linux)
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

### Getting Help

If you encounter issues not covered here:

1. Check the application logs for detailed error messages
2. Review the API documentation at http://localhost:8080/docs
3. Open an issue on the GitHub repository
4. Check existing issues for similar problems

---

## Development Tips

### Hot Reload

For development, use the `--reload` flag to automatically restart the server when code changes:

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8080
```

### Environment-Specific Configuration

You can create multiple environment files:

- `.env.development` - Development settings
- `.env.production` - Production settings
- `.env.test` - Test settings

Load specific environment:

```bash
# Load development environment
cp .env.development .env
python api.py
```

### Debugging

Enable debug logging:

```python
# In api.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For questions or support:
- GitHub Issues: https://github.com/xnileshtiwari/solance-kiro/issues
- Documentation: http://localhost:8080/docs (when running)
