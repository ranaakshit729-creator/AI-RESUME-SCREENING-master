# AI Resume Screening

This project is a simple AI-powered resume screening web app. It compares candidate resumes against a job description and returns a score, highlights strengths, and suggests improvements.

## Features
- Web interface for pasting a resume and job description
- Rule-based screening fallback so the app works right away
- Optional OpenAI integration when `OPENAI_API_KEY` is provided
- A GitHub Actions workflow scaffold for CI/publish
- Docker-ready container definition

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and add your API key if you want OpenAI support:
   ```bash
   cp .env.example .env
   ```

3. Run locally:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

## Publish

- The `npm publish` script is available for npm publishing.
- GitHub Actions workflow is included at `.github/workflows/publish.yml` for CI and release automation.
- To publish to GitHub, initialize a git repository, create a remote, and push the project.

## Notes

- If `OPENAI_API_KEY` is not configured, the app will use a fallback rule-based screening algorithm.
- If you want to publish an npm package, set a unique package name in `package.json` and add `NPM_TOKEN` to GitHub Secrets.
