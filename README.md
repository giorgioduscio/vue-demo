# Application Startup

## Using Docker

Run the following command in the terminal:
```bash
docker npm run docker:up # using Docker
```

Go to http://localhost:8080

## Local Usage

Run the following command in the terminal:
```bash
npm run dev # using npm
```

Go to http://localhost:5173

# Docker Commands

* Start: `npm run docker:up`
* Stop: `npm run docker:down`
* Build: `npm run docker:build`
* Logs: `npm run docker:logs`

# Vue 3 + TypeScript + Vite

This template should help you get started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs; check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Enterprise-Level Best Practices

This demo was developed with enterprise-level best practices for front-end development in mind, focusing on performance and accessibility. Key concepts applied include:

- **State Management and UI:** Implementation of loading indicators and user feedback for a better experience.
- **Robustness and Error Handling:** Specific error handling and robust client-side data validation.
- **Configuration and Environments:** Use of environment variables for flexible configuration management.
- **Accessibility (A11y):** Ensuring keyboard navigability, adequate color contrast, and alternative text for images.
- **Performance:** Consideration for lazy loading and resource optimization.
- **Testing:** Addition of unit and end-to-end tests to ensure code quality.
