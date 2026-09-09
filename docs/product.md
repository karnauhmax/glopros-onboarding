# Product

Context for this repo: what the platform is, what the onboarding flow does, and the contract it is
built against. No acceptance criteria here — see the last section.

## What GloPros is

GloPros is a platform that offers freelance, permanent and payroll roles across Europe; a candidate
keeps one profile for all three.

## What this repo is

The new onboarding flow for that platform, built for real users. Three screens — **Sign up → CV upload
→ Success** — share a header with a progress bar that follows the current step.

The flow is deliberately small; how it is built is the point. The codebase has to show the planning
behind it, a structure with a clear split between UI, logic, validation and the API layer, components
that are reusable and work stand-alone, tests over the business logic, and the AI setup that produced
all of it.

## Screens

- **Sign up** — the user enters email, phone, password and the other details of the account.
- **CV upload** — the user uploads a CV file and sees the result of the upload.
- **Success** — confirmation that the account is created and the CV is received.

## Design

Figma: [Upload step in Onboarding flow](https://www.figma.com/design/2rsCRM6tTUouwXTp3s5NfW/Upload-step-in-Onboarding-flow?node-id=0-1).

## Out of scope

- Real backend, real authentication, email/SMS delivery.
- i18n and analytics.
- Pixel-perfect design: correct layout and states are enough.
