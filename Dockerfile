FROM node:20.12.2-bullseye-slim

RUN npm install --global pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
RUN rm .npmrc

RUN npm uninstall --global pnpm

COPY build .

ENV NODE_ENV production

CMD ["node", "."]