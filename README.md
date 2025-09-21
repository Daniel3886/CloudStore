## CloudStore

A secure, scalable file storage and sharing platform — a self‑hostable, lightweight alternative to Dropbox/Google Drive. Users can upload and share files. The backend integrates with AWS (S3, RDS), and the frontend is a modern Next.js app with a responsive UI.

---

## Quick Start (Docker Only)

Run the full app without installing Java, Maven, or Node locally.

1. Make sure you have **Docker** and **Docker Compose** installed.
2. Create a `.env` file in `backend/` with all required backend variables (DB URL, JWT secret, AWS credentials, etc.).
3. Create a `.env.local` file in `frontend/` with frontend environment variables (`NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`).
[See Environment Variables setup](#environment-variables)
4. At the project root, create a `docker-compose.yml` file:

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
```

5. Start both services:

```bash
docker-compose up --build
```

Access:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:8080](http://localhost:8080)

---

## Key Features

* **Secure upload/download** with signed S3 URLs
* **Folders and virtual folders** for organization
* **File sharing** between users
* **Audit logs** for access and actions
* **Email-based flows** (verification, password reset)
* **Modern UI** with drag-and-drop, previews, and dark mode

---

## Tech Stack

* **Frontend:** Next.js (App Router), TypeScript, Tailwind, Shadcn UI
* **Backend:** Spring Boot (Java), Spring Security (JWT), JPA
* **AWS:** S3, IAM
* **Database**: Supabase (Postres SQL)
* **Deployment:** Docker (local), optionally Kubernetes (EKS)

---

## Environment Variables

### Backend (`backend/.env` or application.properties)

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/your-db-name
SPRING_DATASOURCE_USERNAME=your_db_username
SPRING_DATASOURCE_PASSWORD=your_db_password

SECURITY_JWT_SECRET_KEY=your_jwt_key

CLOUD_AWS_S3_BUCKET_NAME=your_aws_bucket_name
CLOUD_AWS_S3_ACCESS_KEY=your_aws_access_key
CLOUD_AWS_S3_SECRET_KEY=your_aws_secret_key
CLOUD_AWS_REGION_STATIC=your_aws_region

SPRING_MAIL_USERNAME=your_email
SPRING_MAIL_PASSWORD=your_app_password
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## Running Without Docker

### Prerequisites

* Node.js 18+ and pnpm (or npm)
* Java 17+
* Maven

### Start Backend

```bash
cd backend
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

Backend will start on [http://localhost:8080](http://localhost:8080).

### Start Frontend

```bash
cd frontend
pnpm install
pnpm dev
# or
npm install && npm run dev
```

Frontend will start on [http://localhost:3000](http://localhost:3000).

---

## Running With Docker

### Build Docker Images

**Backend**

```bash
cd backend
docker build -t backend .
```

**Frontend**

```bash
cd frontend
docker build -t frontend .
```

### Run Containers Individually

**Backend**

```bash
docker run -p 8080:8080 --env-file .env backend
```

> Tip: If port 8080 is busy: `docker run -p 8081:8080 --env-file .env backend`

**Frontend**

```bash
docker run -p 3000:3000 --env-file .env.local frontend
```

> Tip: If port 3000 is busy: `docker run -p 3001:3000 --env-file .env.local frontend`

---

### Run Both with Docker Compose

```bash
docker-compose up --build
```

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:8080](http://localhost:8080)

---

## How It Works

### Auth & Users

* JWT-based authentication with refresh tokens
* Email verification

### Files & Folders

* Metadata in DB, objects in S3 (local dev: H2 + local storage)
* Pre-signed URLs for upload/download

### Sharing & Permissions

* Share files via email with optional messages
* Revocation and audit logging supported

### Audit Logging

* Tracks who accessed which file and when
* Owners can view per-file logs

---

## Common Issues

* **CORS blocked:** Make sure backend CORS allows your frontend origin
* **401 after idle:** Refresh token flow may require cookies/headers setup
* **Wrong API URL:** Verify `NEXT_PUBLIC_API_BASE_URL` and restart frontend
* **Port conflicts:** Adjust `-p host:container` mapping if ports are in use

---

## License

MIT
