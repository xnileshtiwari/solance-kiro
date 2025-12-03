# Use a lightweight Python 3.12 Linux image
FROM python:3.12-slim-bookworm

# Install 'uv' directly from its official image (super fast)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory inside the container to /app
WORKDIR /app

# Copy dependency files first. 
# Docker caches this layer. If api.py changes but deps don't, 
# it won't re-install packages (saves time).
COPY pyproject.toml uv.lock ./

# Install dependencies into a virtual environment
# --frozen: ensures it exactly matches your uv.lock
RUN uv sync --frozen --no-dev

# Add the virtual env to the PATH so "python" runs the venv version
ENV PATH="/app/.venv/bin:$PATH"

# Now copy the rest of your source code (api.py, src folder, etc)
COPY . .

# Expose port 8080 (documentation purposes)
EXPOSE 8080

# Run the app
CMD ["python", "api.py"]