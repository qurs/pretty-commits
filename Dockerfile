FROM node:24-alpine AS init
WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

FROM node:24-alpine AS run
WORKDIR /opt/app

RUN addgroup -S app && adduser -S app -G app

COPY --chown=app:app --from=init /opt/app/package.json ./package.json
COPY --chown=app:app --from=init /opt/app/node_modules ./node_modules
COPY --chown=app:app --from=init /opt/app/dist ./dist

ENV NODE_ENV=production
USER app

CMD ["npm", "run", "start"]