FROM node:18.16.0-bullseye-slim

RUN npm install --global pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
RUN rm .npmrc

COPY build .

ENV NODE_ENV production

CMD ["pnpm", "start"]