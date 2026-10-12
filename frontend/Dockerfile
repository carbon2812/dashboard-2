FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies required by Next.js native binaries
RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm install

COPY . .

ARG BACKEND_API_URL=http://backend:5001
ENV BACKEND_API_URL=${BACKEND_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js production bundle
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ARG BACKEND_API_URL=http://backend:5001
ENV BACKEND_API_URL=${BACKEND_API_URL}
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
