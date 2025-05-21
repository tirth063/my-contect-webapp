# Stage 1: Build the application with legacy dependency support
FROM node:16-alpine AS builder

WORKDIR /app

# Install legacy compatible dependencies
COPY package*.json ./
RUN npm config set legacy-peer-deps true
RUN npm install --no-audit --no-fund --loglevel=error

# Copy all source files
COPY . .

# Build the Next.js application with legacy settings
RUN NODE_OPTIONS=--max_old_space_size=4096 npm run build

# Stage 2: Production environment
FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder /app/public ./public

# Expose the port the app runs on
# Next.js default is 3000. Render will set the PORT environment variable.
EXPOSE 3000
ENV PORT 3000

# Start the Next.js application
# The standalone output creates a server.js file
CMD ["node", "server.js"]