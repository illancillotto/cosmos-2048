# Multi-stage build for API

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (if needed)
ENV NODE_ENV=production
RUN npm run build || echo "No build script found"

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Add non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy package files
COPY package*.json ./

# Install only production dependencies (using --omit=dev instead of --only=production)
RUN npm ci --omit=dev && npm cache clean --force

# Copy application files
COPY . .

# Set correct permissions
USER nodejs

EXPOSE 5017

ENV NODE_ENV=production
ENV PORT=5017

CMD ["npm", "start"]

# Stage 4: Development
FROM node:18-alpine AS development
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 5017

ENV NODE_ENV=development
ENV PORT=5017

CMD ["npm", "run", "dev"]