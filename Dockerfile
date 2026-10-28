# syntax=docker/dockerfile:1

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

RUN npm install -g pnpm@11.21.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# O Vite embute as VITE_* no bundle durante o build, então elas precisam
# chegar aqui como build args (no Coolify: marcar como disponível no build).
ARG VITE_APP_NAME
ARG VITE_API_BASE_URL
ARG VITE_API_SWAGGER_URL
ARG VITE_STORAGE_URL
ARG VITE_TOKEN_STORAGE_KEY
ARG VITE_REFRESH_TOKEN_STORAGE_KEY
ARG VITE_AWESOME_API_URL
ARG VITE_AWESOME_API_KEY
ARG VITE_WS_KEY
ARG VITE_WS_HOST
ARG VITE_WS_PORT
ARG VITE_WSS_PORT
ARG VITE_WS_FORCE_TLS
ARG VITE_WS_AUTH_ENDPOINT
ARG VITE_WS_CLUSTER

# Falha o build se faltar alguma obrigatória (ver src/utils/env.ts),
# em vez de subir uma build que quebra só no navegador.
RUN for v in VITE_APP_NAME VITE_API_BASE_URL VITE_API_SWAGGER_URL VITE_STORAGE_URL \
             VITE_TOKEN_STORAGE_KEY VITE_REFRESH_TOKEN_STORAGE_KEY \
             VITE_AWESOME_API_URL VITE_AWESOME_API_KEY; do \
      [ -n "$(printenv "$v")" ] || { echo "Variável de build ausente: $v" >&2; exit 1; }; \
    done

RUN pnpm build

# ---------- runtime ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
