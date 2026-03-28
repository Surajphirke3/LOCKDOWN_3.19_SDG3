# Contributing to CoughLock

Thank you for your interest in contributing to **CoughLock — Cough-Based Tuberculosis
Diagnostic System**! Every contribution, large or small, helps bring early TB screening to
more people around the world.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Fork and Clone](#how-to-fork-and-clone)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [How to Open a Pull Request](#how-to-open-a-pull-request)
- [Code Style & Linting](#code-style--linting)
- [Issue Reporting Guide](#issue-reporting-guide)

---

## Code of Conduct

By participating in this project you agree to abide by the
[Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## How to Fork and Clone

1. **Fork** the repository by clicking the **Fork** button at the top-right of the GitHub
   page.

2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/cough-based-tuberclosis-diagnostic-system.git
   cd cough-based-tuberclosis-diagnostic-system
   ```

3. **Add the upstream remote** so you can pull in future changes:
   ```bash
   git remote add upstream https://github.com/Surajphirke3/cough-based-tuberclosis-diagnostic-system.git
   ```

4. **Keep your fork up to date** before starting new work:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

5. **Install dependencies** for the sub-project you are working on:
   ```bash
   # Web frontend
   cd frontend && npm install

   # Android app
   cd android && npm install
   ```

---

## Branch Naming Conventions

Create a dedicated branch for every feature, fix, or documentation change using the
following prefixes:

| Prefix | Use case | Example |
|--------|----------|---------|
| `feat/` | New feature | `feat/offline-ml-inference` |
| `fix/` | Bug fix | `fix/audio-upload-crash` |
| `docs/` | Documentation only | `docs/update-api-endpoints` |
| `chore/` | Tooling / config / dependency updates | `chore/upgrade-expo-sdk` |
| `refactor/` | Code restructure (no behaviour change) | `refactor/extract-shared-types` |
| `test/` | Adding or fixing tests | `test/prediction-service-unit` |

```bash
git checkout -b feat/your-feature-name
```

---

## Commit Message Guidelines

This project follows the
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code restructure without a feature or bug change |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates, tooling |
| `perf` | Performance improvement |

### Scopes (optional but recommended)

- `frontend` — Next.js web app changes
- `android` — React Native mobile app changes
- `api` — API service layer
- `docs` — Documentation

### Examples

```
feat(frontend): add spectrogram visualisation to audio-upload page

fix(android): resolve recording crash on Android 14

docs: update API endpoint table in README

chore(frontend): upgrade Next.js to 16.1.6
```

### Rules

- Use the **imperative mood** in the subject line ("add feature" not "added feature")
- Keep the subject line under **72 characters**
- Wrap the body at **72 characters**
- Reference related issues in the footer: `Closes #42`

---

## How to Open a Pull Request

1. **Push** your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```

2. Go to the **original repository** on GitHub and click **"Compare & pull request"**.

3. Fill in the PR description:
   - **Title**: Follow the same Conventional Commits format used for commits.
   - **Description**: Explain *what* changed, *why*, and *how to test* it.
   - **Linked issues**: Add `Closes #<issue-number>` where applicable.

4. Ensure all **status checks pass** before requesting a review.

5. Address **review comments** by pushing additional commits to the same branch.

6. Once approved, a maintainer will **squash-merge** your PR.

### PR Checklist

- [ ] Code follows the project's style guide (see below)
- [ ] Linter passes with no errors or warnings
- [ ] Changes tested locally on both web and/or mobile as applicable
- [ ] Relevant documentation updated (README, `documentation.md`, inline comments)
- [ ] Commits follow the Conventional Commits format

---

## Code Style & Linting

### TypeScript / JavaScript

Both `frontend` and `android` use **ESLint** for linting.

```bash
# Web frontend
cd frontend
npm run lint

# Android app
cd android
npx eslint . --ext .ts,.tsx
```

Fix all errors before opening a PR — the CI pipeline will fail on lint errors.

### General Guidelines

- Use **TypeScript** throughout; avoid `any` types wherever possible.
- Prefer **named exports** over default exports for utilities and types.
- Use **functional components** and React hooks; avoid class components.
- Keep components small and single-responsibility; extract reusable logic into custom hooks
  or utility functions.
- Use **descriptive variable names** (`userRiskLevel` not `url`).
- Format code consistently — follow the style of the surrounding file.

---

## Issue Reporting Guide

Found a bug or have a feature idea? Open an issue on
[GitHub Issues](https://github.com/Surajphirke3/cough-based-tuberclosis-diagnostic-system/issues).

### Before Opening an Issue

1. Search existing issues to avoid duplicates.
2. Check the [Roadmap](README.md#roadmap) to see if it is already planned.

### Bug Reports

Please include:

- **Environment**: OS, Node.js version, Expo SDK version (mobile), browser name & version (web)
- **Steps to reproduce**: Numbered, exact steps
- **Expected behaviour**: What you expected to happen
- **Actual behaviour**: What actually happened
- **Screenshots / logs**: Attach relevant error messages or screenshots

Use the label **`bug`** when creating the issue.

### Feature Requests

Please include:

- **Problem statement**: What problem does this feature solve?
- **Proposed solution**: Your idea for implementation
- **Alternatives considered**: Other approaches you thought of
- **Additional context**: Mockups, references, related issues

Use the label **`enhancement`** when creating the issue.

---

Thank you for helping make CoughLock better!
