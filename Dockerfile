# ─────────────────────────────────────────────
# Stage 1: builder — compile TypeScript → dist/
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

RUN npm run build


# ─────────────────────────────────────────────
# Stage 2: development — hot-reload server
# ─────────────────────────────────────────────
FROM node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/

EXPOSE 3000

CMD ["npm", "run", "start:dev"]


# ─────────────────────────────────────────────
# Stage 3: production — minimal runtime image
# ─────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
