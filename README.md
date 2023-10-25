# SubQL-OKP4

> 🔁 Subquery indexer for the [OKP4 protocol](https://okp4.network).

[![release](https://img.shields.io/github/v/release/okp4/subql-okp4?style=for-the-badge&logo=github)](https://github.com/okp4/subql-okp4/releases)
[![lint](https://img.shields.io/github/actions/workflow/status/okp4/subql-okp4/lint.yml?label=lint&style=for-the-badge&logo=github)](https://github.com/okp4/subql-okp4/actions/workflows/lint.yml)
[![build](https://img.shields.io/github/actions/workflow/status/okp4/subql-okp4/build.yml?branch=main&label=build&style=for-the-badge&logo=github)](https://github.com/okp4/subql-okp4/actions/workflows/build.yml)
[![test](https://img.shields.io/github/actions/workflow/status/okp4/dataverse-portal/test.yml?branch=main&label=test&style=for-the-badge&logo=github)](https://github.com/okp4/dataverse-portal/actions/workflows/test.yml)
[![conventional commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=for-the-badge&logo=conventionalcommits)](https://conventionalcommits.org)
[![contributor covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg?style=for-the-badge)](https://github.com/okp4/.github/blob/main/CODE_OF_CONDUCT.md)
[![typescript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)](https://github.com/prettier/prettier)
[![license][bsd-3-clause-image]][bsd-3-clause]
[![cc-by-sa-4.0][cc-by-sa-image]][cc-by-sa]

This repository is home to the OKP4 SubQuery Indexer, a tool that provides chain data from the [OKP4 protocol](https://okp4.network) via a GraphQL API. The project is based on [SubQuery](https://subquery.network/), an open-source tool that helps create fast and reliable APIs for blockchain applications.

## Explore

The following services are available:

| ChainID          | Service    | Endpoint                                                    |
| ---------------- | ---------- | ----------------------------------------------------------- |
| `okp4-nemeton-1` | Playground | <https://explorer.subquery.network/subquery/okp4/nemeton-1> |
| `okp4-nemeton-1` | GraphQL    | <https://api.subquery.network/sq/okp4/nemeton-1>            |

## Install

### Prerequisites

Be sure to have the following properly installed:

- [Node.js](https://nodejs.org/en/) `v18.16` ([Hydrogen](https://nodejs.org/en/blog/release/v18.16.0/))
- [yarn](https://yarnpkg.com/) `v1.22`
- [Docker](https://www.docker.com/)
- [subql-cli](https://academy.subquery.network/run_publish/cli.html#installation) `v3.2.0` - Install SubQuery CLI globally on your terminal by using NPM (we don't recommend using Yarn to install global dependencies): `npm install -g @subql/cli@3.2.0`

### Build

🚚 Install the dependencies:

```sh
yarn
```

Generate the types:

```sh
yarn prepack
```

### Build Docker

🐳 Build the docker image:

```sh
docker build -t subql-okp4 .
```

Run it:

```sh
docker run -ti --rm --name my-indexer \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_DATABASE=subql \
  -e DB_USER=subql \
  -e DB_PASS=secret \
  subql-okp4
```

Provide an alternate configuration:

```sh
docker run -ti --rm --name my-indexer \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_DATABASE=subql \
  -e DB_USER=subql \
  -e DB_PASS=secret \
  -v /path/to/new-conf.yaml:/srv/subql/project.yaml \
  subql-okp4
```

Give additional arguments to the subql node:

```sh
docker run -ti --rm --name my-indexer \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_DATABASE=subql \
  -e DB_USER=subql \
  -e DB_PASS=secret \
  subql-okp4 --batch-size=32 --log-level=debug
```

> **_NOTE:_** To run the container in detached mode replace `-it --rm` by `-d` in the above commands.

## Usage

### Run

🚀 Run the project with the default stack:

```sh
yarn start:docker
```

### Query

Open <http://localhost:3000/> on your browser, and try the following query:

```graphql
query {
  _metadata {
    chain
    lastProcessedHeight
    targetHeight
  }
}
```

You should get the following result:

```json
{
  "data": {
    "_metadata": {
      "chain": "okp4-nemeton-1",
      "lastProcessedHeight": 2928706,
      "targetHeight": 2928706
    }
  }
}
```

## Database

During development, it can be useful to access the database directly to inspect and understand the data indexed. The database is a PostgreSQL database, and it is run in a Docker container by the `docker-compose` command. Note that the database is contained in a Docker volume, so it will persist between runs.

### CLI

You can access the PostgreSQL database via the following command:

```sh
psql -h localhost -p 5432 -U subql -d subql
```

The tables are in the `app` schema.

```sql
subql=> SET schema 'app';
SET
subql=> \dt
              List of relations
 Schema |        Name         | Type  | Owner
--------+---------------------+-------+-------
 app    | _metadata           | table | subql
 app    | blocks              | table | subql
 app    | messages            | table | subql
 app    | objectarium_objects | table | subql
 app    | transactions        | table | subql
```

## Metabase

Since the project uses PostgreSQL to index the data, you can use [Metabase](https://www.metabase.com/) to explore the database and create dashboards.

The docker-compose comes with a profile for Metabase. To start it, run:

```sh
docker-compose --profile metabase up
```

Then, open <http://localhost:3001/> on your browser, and connect to the database with the information you can find in the `.env` file.

## You want to get involved? 😍

Please check out OKP4 health files :

- [Contributing](https://github.com/okp4/.github/blob/main/CONTRIBUTING.md)
- [Code of conduct](https://github.com/okp4/.github/blob/main/CODE_OF_CONDUCT.md)

## Useful Resources

- [SubQuery Documentation](https://academy.subquery.network/)

[bsd-3-clause]: https://opensource.org/licenses/BSD-3-Clause
[bsd-3-clause-image]: https://img.shields.io/badge/License-BSD_3--Clause-blue.svg?style=for-the-badge
[cc-by-sa]: https://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://i.creativecommons.org/l/by-sa/4.0/88x31.png
