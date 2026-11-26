# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Self-hosters: developers and homelab users deciding whether to run CloudStore on their own server with their own S3 bucket.
- Recruiters and interviewers: reviewing CloudStore as the author's portfolio project and judging how it was built.
- Signed-in users of an instance: upload, organize, share and recover their own files.

## Product Purpose
CloudStore is a self-hostable file storage and sharing app. People upload files, sort them into folders, share them with other accounts, and create public links that expire. Success for the landing page: a self-hoster understands what it does and how to run it; a recruiter can see what was built and how.

## Positioning
Your files on your own server, stored in your own S3 bucket, not someone else's cloud.

## Operating Context
- Run with Docker Compose (backend on :8080, frontend on :3000). Postgres, S3 and SMTP are configured through `backend/.env`; Postgres is not part of the compose file.
- Account flow: register, verify by emailed code, sign in; forgot and reset password by emailed code.

## Capabilities and Constraints
- Upload (5 MB per file), download, rename, delete. Folders are virtual, stored as key prefixes.
- Trash keeps deleted files for 30 days; a nightly job at 02:00 deletes older ones. Files can be restored until then.
- Share a file with another account by email; manage and revoke shares; "Shared with me" view.
- Public links expire 24 hours after creation.
- Per-user activity (audit) log of file and sharing actions.
- UI in English and Polish.
- Stack: Spring Boot (Java) backend with JWT access and refresh tokens; Next.js App Router frontend; tests and CI for the frontend.
- Open: no public demo instance yet (planned). Do not link to one or promise one.

## Brand Commitments
- Name: CloudStore. MIT licence. Source: github.com/Daniel3886/CloudStore.
- Existing mark: the "CS" tile in the app's primary blue.
- Standing preference (chosen 2026-11-25): the category-standard look for self-hosted open-source products, executed at the craft level of Immich (immich.app). One theme across the landing page and the app, using the app's existing blue primary.

## Evidence on Hand
- The working app and its source code.
- None of these exist: users, testimonials, uptime figures, benchmarks, pricing, security certifications or audits. Do not invent them.

## Product Principles
- Ownership first: the operator owns the server and the bucket.
- Sharing has limits people can see, such as link expiry and the Trash window.
- Plain, factual claims that can be checked in the repo.
