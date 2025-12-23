FROM node:22.21.1-bullseye-slim

RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
RUN rm .npmrc

COPY build .

ENV NODE_ENV production

CMD ["node", "."]