# SubQL-OKP4

> 🔁 Subquery indexer for the [OKP4 network](https://okp4.network).

[![lint](https://img.shields.io/github/actions/workflow/status/okp4/subql-okp4/lint.yml?label=lint&style=for-the-badge&logo=github)](https://github.com/okp4/subql-okp4/actions/workflows/lint.yml)
[![build](https://img.shields.io/github/actions/workflow/status/okp4/subql-okp4/build.yml?branch=main&label=build&style=for-the-badge&logo=github)](https://github.com/okp4/subql-okp4/actions/workflows/build.yml)
[![test](https://img.shields.io/github/actions/workflow/status/okp4/dataverse-portal/test.yml?branch=main&label=test&style=for-the-badge&logo=github)](https://github.com/okp4/dataverse-portal/actions/workflows/test.yml)
[![conventional commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=for-the-badge&logo=conventionalcommits)](https://conventionalcommits.org)
[![contributor covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg?style=for-the-badge)](https://github.com/okp4/.github/blob/main/CODE_OF_CONDUCT.md)
[![typescript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)](https://github.com/prettier/prettier)
[![license][bsd-3-clause-image]][bsd-3-clause]
[![cc-by-sa-4.0][cc-by-sa-image]][cc-by-sa]

## Install

### Prerequisites

Be sure to have the following properly installed:

- [Node.js](https://nodejs.org/ru/) `v16.19` ([gallium](https://nodejs.org/en/blog/release/v16.19.0/))
- [yarn](https://yarnpkg.com/) `v1.22.17`
- [Docker](https://www.docker.com/)

#### Install the SubQuery CLI and Project Dependencies

Install SubQuery CLI globally on your terminal by using NPM (we don't recommend using Yarn to install global dependencies):

```
npm install -g @subql/cli
```

Under the project directory, install the node dependencies by running the following command ([Learn more](https://academy.subquery.network/build/install.html#)):

```
yarn OR npm install
```

## Configure the Project Further

If you want to change your project you will need to work on the following files:

- The Manifest in `project.yaml` to **configure your project**
- The GraphQL Schema in `schema.graphql` to **define shape of the data**
- The Mapping functions in `src/mappings/` directory to **transform data coming from blockchain**

[Learn more](https://academy.subquery.network/build/introduction.html)

## Build the Project

#### 1. Generate Associated Typescript

We will generate the defined entity models with the following command:

```
yarn codegen OR npm run-script codegen
```

If you change any data in your `schema.graphql`, you should run this command again. You should also consider deleting your local database in the `.data/` directory.

#### 2. Build the project

This builds your project into static files within the `/dist` for running.

```
yarn build OR npm run-script codegen
```

If you change any data in your `src/mappings/` directory you should run this command again.

## Indexing and Query

#### 1. Run Docker

Under the project directory run following command:

```
yarn start:docker
```

This will download packages from Docker, create a new Postgres database, and start an indexing an query service. When you first run this, it may take some time to start, please be patient.

#### 2. Query this Project

Open your browser and head to `http://localhost:3000`.

Finally, you should see a GraphQL playground is showing in the explorer and the schemas that ready to query. On the right hand side is a documentation button that shows you what models you have to construct queries.

With this project can try to query with the following code to get a taste of how it works.

```graphql
{
  query {
    transferEvents(first: 5) {
      nodes {
        id
        blockHeight
        txHash
        recipient
        sender
        amount
      }
    }
    messages(first: 5) {
      nodes {
        id
        blockHeight
        txHash
        from
        to
        amount
      }
    }
  }
}
```

## Useful Resources

- [SubQuery Documentation](https://academy.subquery.network/)
- [Tips and Tricks for Performance Improvements](https://academy.subquery.network/faqs/faqs.html#how-can-i-optimise-my-project-to-speed-it-up)
- [Automated Historical State tracking](https://academy.subquery.network/th/run_publish/historical.html)
- [GraphQL Subscriptions](https://academy.subquery.network/run_publish/subscription.html)
- [Discord with Technical Support Channel](https://discord.com/invite/subquery)

[bsd-3-clause]: https://opensource.org/licenses/BSD-3-Clause
[bsd-3-clause-image]: https://img.shields.io/badge/License-BSD_3--Clause-blue.svg?style=for-the-badge
[cc-by-sa]: https://creativecommons.org/licenses/by-sa/4.0/
[cc-by-sa-image]: https://i.creativecommons.org/l/by-sa/4.0/88x31.png
