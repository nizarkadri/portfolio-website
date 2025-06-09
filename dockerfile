############################################
# ❶ dependency stage – prod deps only
############################################
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
# cache-friendly layer (≈120 MB)
RUN npm ci --omit=dev        

############################################
# ❷ build stage – needs dev deps
############################################
FROM node:20-slim AS build
WORKDIR /app

ARG NEXT_PUBLIC_GA_ID
ENV NEXT_PUBLIC_GA_ID=${NEXT_PUBLIC_GA_ID}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# adds dev deps temporarily
RUN npm ci                
# creates .next
RUN npm run build         

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
COPY --from=build /app/data ./data


# any small config files the server may still read
COPY next.config.* tailwind.config.* postcss.config.* ./

# Cloud Run sets $PORT
EXPOSE 8080               
CMD ["node","./node_modules/next/dist/bin/next","start"]
