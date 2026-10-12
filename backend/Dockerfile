FROM node:20-alpine

WORKDIR /app

# Install native dependencies required by Prisma engine
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies including devDependencies for build and seed
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and assets
COPY src ./src
COPY data ./data
COPY public ./public
RUN mkdir -p uploads

# Compile TypeScript to dist/
RUN npm run build

# Expose backend API port
EXPOSE 5001

ENV PORT=5001
ENV NODE_ENV=production

# On container boot: push schema to Postgres, seed initial data, then run Express server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx ts-node prisma/seed.ts && node dist/server.js"]
