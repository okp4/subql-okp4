# SubQL-OKP4

> 🔁 Subquery indexer for the [OKP4 protocol](https://okp4.network).

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

## Install

### Prerequisites

Be sure to have the following properly installed:

- [Node.js](https://nodejs.org/en/) `v18.16` ([Hydrogen](https://nodejs.org/en/blog/release/v18.16.0/))
- [yarn](https://yarnpkg.com/) `v1.22`
- [Docker](https://www.docker.com/)
- [subql-cli](https://academy.subquery.network/run_publish/cli.html#installation) `v3.2.0`  - Install SubQuery CLI globally on your terminal by using NPM (we don't recommend using Yarn to install global dependencies): `npm install -g @subql/cli@3.2.0`

### Setup

🚚 Install the dependencies:

```sh
yarn
```

Generate the types:

```sh
yarn codegen && yarn build
```

## Usage

### Run locally

🚀 Run the project locally:

```sh
docker-compose pull & docker-compose up
```

### Query

Open <http://localhost:3000/> on your browser, and try the following query:

```graphql
query{
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
