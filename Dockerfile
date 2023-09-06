FROM node:18.16-alpine as build

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn --frozen-lockfile

COPY . .

RUN yarn codegen
RUN yarn build

FROM onfinality/subql-node-cosmos:v2.8.0

EXPOSE 3000

WORKDIR /srv/subql

RUN addgroup -S subql && adduser -S subql -G subql

USER subql

COPY --from=build --chown=subql:subql /usr/src/app/dist /srv/subql/dist
COPY --from=build --chown=subql:subql /usr/src/app/proto /srv/subql/proto
COPY --from=build --chown=subql:subql /usr/src/app/schema.graphql /srv/subql/schema.graphql
COPY --from=build --chown=subql:subql /usr/src/app/project.yaml /srv/subql/project.yaml

CMD ["-f", "/srv/subql"]
