# Stage 1: Base
FROM node:20-alpine AS base

# Stage 2: Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --legacy-peer-deps

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public directory exists before building
RUN mkdir -p public

# Generate Prisma Client
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 4: Runner
FROM base AS runner
WORKDIR /app

# Install OpenSSL so Prisma schema engine can run migrations
RUN apk add --no-cache openssl

# Install Prisma CLI globally (exact version matching package.json)
RUN npm install -g prisma@5.10.0

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Ensure public directory exists
RUN mkdir -p public
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Standalone app + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema (migrations)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma generated client (used by the running app)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations with globally installed prisma CLI then start server
CMD ["sh", "-c", "prisma migrate deploy && node server.js"]
