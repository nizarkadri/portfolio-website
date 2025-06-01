############################################
# ❶ dependency stage – prod deps only
############################################
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev        # cache-friendly layer (≈120 MB)

############################################
# ❷ build stage – needs dev deps
############################################
FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm ci                # adds dev deps temporarily
RUN npm run build         # creates .next

############################################
# ❸ runtime stage – smallest possible
############################################
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# prod-only node_modules
COPY --from=deps /app/node_modules ./node_modules

# compiled output + public assets
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# any small config files the server may still read
COPY next.config.* tailwind.config.* postcss.config.* ./

# Cloud Run sets $PORT
EXPOSE 8080               
CMD ["node","./node_modules/next/dist/bin/next","start"]
