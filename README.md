# AI Issue Assistant

[简体中文](README.zh-CN.md)

AI Issue Assistant is a work-in-progress web app for browsing issues in public GitHub repositories. Paste a repository URL to view its issues, then select an issue to read its details. The app filters pull requests out of the issue list.

## Tools and requirements

- **Node.js 20.9.0 or later** to run the Next.js app.
- **npm**, included with standard Node.js installations, to install dependencies and run scripts.
- **A web browser** to use the local app.
- **Internet access** to download dependencies and fetch issues from the GitHub REST API.
- **Git** if you want to clone the repository.

Run `node --version` and `npm --version` to check your terminal setup. The current issue browser requires no environment variables or API keys.

## Run locally

From the repository root, run:

```sh
cd web
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter the URL of a public GitHub repository.

## Run the tests

From the repository root, run:

```sh
npm ci
npm test
```

The root and `web/` have separate dependency lockfiles. Install dependencies in each directory for the commands you want to run.

## Project structure

- `web/` contains the React UI and the Next.js server endpoint for fetching issues.
- `phase1/` contains the TypeScript repository URL parser, issue fetching and transformation logic, and tests.
- `phase0/` contains the original browser prototype.

## Current limitations

The app fetches the first page of GitHub's issue response and then filters out pull requests. GitHub's unauthenticated API rate limits apply. Loading additional pages and on-demand AI summaries and classification are planned.
