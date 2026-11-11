# Scentify Perfume Studio

Scentify Perfume Studio is a full-stack web application for creating and
ordering personalized perfumes. The project demonstrates a Spring Boot
backend, Spring Data JPA persistence, a React frontend, MySQL database
management, authentication, related entities, CRUD operations, and Google
Cloud deployment.

## Course submission

### Team members

| Student ID | Name |
| --- | --- |
| 6831503006 | Htoo Myat Aung |
| 6831503011 | Kyaw Zin Htike |
| 6831502020 | Ei Thandar Kyaw |
| 6831503029 | Thuta Naing |
| 6831503087 | Saw Keh Blu |

### Repository

GitHub repository:

https://github.com/kzh-mfu/scentify-perfume-app

Each team member must commit to this repository to receive individual
contribution credit.

## Assignment requirements

| Requirement | Scentify implementation |
| --- | --- |
| Backend | Spring Boot REST API |
| Persistence | Spring Data JPA and Hibernate |
| Database | MySQL locally or Google Cloud SQL for MySQL |
| Authentication | Google Identity Platform |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Related entities | Profile, Ingredient, Order, OrderItem, ChatMessage |
| Listing/searching | Ingredient catalog and ingredient search |
| Creating | Ingredients, orders, order items, profiles, and chat messages |
| Updating | Profiles, ingredients, order status, and payment status |
| Deleting | Ingredients |
| Related entity management | Orders contain order items; profiles own orders and chat messages |
| Deployment | Google Cloud Run and Cloud SQL |

## Main entities

1. **Profile** - customer identity, display name, and shipping address.
2. **Ingredient** - perfume ingredient catalog with scent family, description,
   availability, search, and staff CRUD.
3. **Order** - customer order, total, payment status, and fulfillment status.
4. **OrderItem** - products, quantities, and prices belonging to an order.
5. **ChatMessage** - customer and staff support messages.

## System architecture

```text
React frontend
      |
      | HTTPS + Google Identity Platform JWT
      v
Spring Boot REST API on Cloud Run
      |
      | Spring Data JPA + Flyway
      v
Cloud SQL for MySQL
```

Google Identity Platform provides email/password and Google authentication.
The frontend sends the user's bearer token to Spring Boot. Spring Security
validates the token before allowing protected operations.

## Project structure

```text
frontend/    React + TypeScript + Vite application
backend/     Spring Boot + Spring Data JPA REST API
```

Important backend locations:

```text
backend/src/main/java/com/scentify/domain/
backend/src/main/java/com/scentify/api/
backend/src/main/java/com/scentify/repository/
backend/src/main/resources/db/migration/
backend/Dockerfile
```

## Frontend pages

| Route | Feature |
| --- | --- |
| `/` | Home page |
| `/ingredients` | Ingredient library |
| `/scentify` | Custom perfume builder |
| `/scentify/review` | Fragrance review |
| `/cart` | Shopping cart |
| `/checkout` | Order review |
| `/checkout/payment` | Payment |
| `/profile` | Profile and order history |
| `/customer-care` | Customer support |
| `/admin` | Staff and order administration |

## REST API

### Profile

```text
GET /api/profile
PUT /api/profile
```

### Ingredients

```text
GET    /api/ingredients?search=rose
POST   /api/ingredients
PUT    /api/ingredients/{id}
DELETE /api/ingredients/{id}
```

Ingredient create, update, and delete operations require a staff or admin
account.

### Orders

```text
GET   /api/orders/mine
GET   /api/orders
POST  /api/orders
PATCH /api/orders/{id}/status
```

### Customer and staff chat

```text
GET  /api/chat/messages
POST /api/chat/messages
GET  /api/chat/admin/messages
POST /api/chat/admin/messages
```

### Health check

```text
GET /api/health
```

## Local setup

### Prerequisites

- Node.js and npm
- Java 25
- Maven
- MySQL 8
- A Google Cloud project for deployed authentication

### Configure the frontend

```sh
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The frontend runs at <http://localhost:3000>.

Set these values in `frontend/.env.local`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_URL=http://localhost:8080
```

The Firebase web configuration is available in Google Cloud under Identity
Platform project settings.

### Configure the backend

Create a local MySQL database named `scentify`, then run:

```sh
cd backend
mvn spring-boot:run
```

The backend runs at <http://localhost:8080>. Flyway creates the tables from
`backend/src/main/resources/db/migration/V1__create_scentify_tables.sql`.

Default local database settings:

```env
DATABASE_URL=jdbc:mysql://localhost:3306/scentify
DATABASE_USERNAME=root
DATABASE_PASSWORD=root
GOOGLE_CLOUD_PROJECT_ID=scentify-513806
```

## Google Cloud deployment

The deployed architecture uses:

- **Cloud Run** for the Spring Boot backend
- **Cloud SQL for MySQL** for application data
- **Cloud Run or Firebase Hosting** for the frontend
- **Identity Platform** for authentication
- **Artifact Registry and Cloud Build** for container builds

### Cloud SQL

Create a MySQL instance and database:

```text
Project: scentify-513806
Instance: scentify-mysql
Database: scentify
Region: asia-southeast1
Connection name: scentify-513806:asia-southeast1:scentify-mysql
```

Create a dedicated database user and keep its password private.

### Cloud Run backend

Deploy the `backend/` directory using [backend/Dockerfile](./backend/Dockerfile).
Grant the Cloud Run service account the **Cloud SQL Client** and Identity
Platform administration roles.

Configure these Cloud Run variables:

```env
DATABASE_URL=jdbc:mysql://google/scentify?cloudSqlInstance=scentify-513806:asia-southeast1:scentify-mysql&socketFactory=com.google.cloud.sql.mysql.SocketFactory&cloudSqlRefreshStrategy=lazy
DATABASE_USERNAME=cloudsql-user
DATABASE_PASSWORD=cloudsql-password
GOOGLE_CLOUD_PROJECT_ID=scentify-513806
CORS_ALLOWED_ORIGINS=https://your-frontend-domain
```

Attach the Cloud SQL connection:

```text
scentify-513806:asia-southeast1:scentify-mysql
```

After deployment, verify:

```text
https://your-cloud-run-url/api/health
```

Expected response:

```json
{"status":"ok"}
```

### Frontend deployment

Deploy `frontend/` using Cloud Run or Firebase Hosting. Configure:

```env
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=scentify-513806
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://your-cloud-run-url
```

Add the deployed frontend domain to Identity Platform authorized domains and
set the same domain in the backend `CORS_ALLOWED_ORIGINS` variable.

### Automatic Firebase deployment from GitHub

Pushes to `main` automatically build and deploy `frontend/` through
`.github/workflows/firebase-hosting.yml`. Repository administrators must add
these GitHub Actions secrets in **Settings → Secrets and variables → Actions**:

```text
FIREBASE_SERVICE_ACCOUNT
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_API_URL
```

`FIREBASE_SERVICE_ACCOUNT` must contain a Google service-account JSON key with
permission to deploy Firebase Hosting. The remaining values configure the
frontend build; use the existing Firebase web app values and the production
backend URL. After this one-time setup, an approved push to `main` publishes
the new frontend automatically.

### Automatic Cloud Run backend deployment from GitHub

Pushes to `main` that change `backend/` automatically build and deploy the
backend through `.github/workflows/backend-cloud-run.yml`. The existing
`FIREBASE_SERVICE_ACCOUNT` GitHub secret must have these Google Cloud IAM roles:

```text
Cloud Run Admin
Cloud Build Editor
Service Usage Consumer
Service Account User
```

The workflow deploys the existing [backend/Dockerfile](./backend/Dockerfile)
to the `scentify-backend` Cloud Run service in `asia-southeast1`, preserving
the service's existing runtime environment variables and Cloud SQL connection.
It then calls `/api/health` and fails the workflow if the service is unhealthy.

## Security

Never commit or expose:

- Cloud SQL passwords
- Service account JSON keys
- Firebase Admin credentials
- Database connection secrets

Use Google Cloud service account permissions and Secret Manager for production
secrets. Public frontend variables must contain only Firebase web
configuration and the backend API URL.

## Verification

Run the backend tests:

```sh
cd backend
mvn clean test
```

Build the frontend:

```sh
cd frontend
npm run build
```

The project is ready for repository submission after both commands pass and
the deployed Cloud Run health endpoint returns `{"status":"ok"}`.
