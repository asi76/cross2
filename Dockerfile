# Crosstraining Dockerfile for Zeabur
FROM node:20-alpine

WORKDIR /app

# Copy package files for dependency install
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Expose the PORT from environment (Zeabur sets this)
EXPOSE ${PORT:-8080}

# Start the app server, which serves the SPA and backend endpoints
CMD sh -c "PORT=${PORT:-8080} node server/index.js"
