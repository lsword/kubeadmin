FROM node:22.11.0-bookworm AS builder

RUN npm config set registry https://registry.npmmirror.com && \
    npm i pnpm -g && \
    pnpm config set registry https://registry.npmmirror.com

COPY frontend /frontend
RUN cd /frontend && \
    pnpm install && \
    pnpm build

COPY backend /backend
RUN cd /backend && \
    pnpm install

ADD https://get.helm.sh/helm-v3.16.3-linux-amd64.tar.gz /
RUN cd / && \
    tar xfvz helm-v3.16.3-linux-amd64.tar.gz && \
    mv /linux-amd64/helm /backend/bin

FROM node:22.11.0-bookworm-slim AS prod

COPY --from=builder /backend /backend

WORKDIR /backend

EXPOSE 3000

CMD ["npm", "run", "start"]