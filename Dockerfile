# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine AS runner
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
