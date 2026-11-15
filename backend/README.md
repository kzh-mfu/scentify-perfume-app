# Scentify Spring Boot backend

This module is the Spring Boot API boundary for the browser application. It uses
MySQL, Flyway migrations, Spring Data JPA, and Google Identity Platform JWT bearer
authentication.

## Run locally

For full local functionality, create a MySQL database named `scentify` first.
The backend also requires Google Application Default Credentials to initialize
Firebase Admin. Sign in once with the Google account for the Firebase project:

```sh
gcloud auth application-default login
```

Run these commands from the repository root, changing the database credentials
as needed. Set `CORS_ALLOWED_ORIGINS` to the frontend origin printed by Vite
(the default Vite port is 3000; if it falls back to 3001, use that instead):

```sh
cd backend
export DATABASE_URL=jdbc:mysql://localhost:3306/scentify
export DATABASE_USERNAME=root
export DATABASE_PASSWORD=root
export GOOGLE_CLOUD_PROJECT_ID=scentify-513806
export CORS_ALLOWED_ORIGINS=http://localhost:3001
mvn spring-boot:run
```

Use the default profile and a local MySQL database. Do not activate the
`local` profile for catalog or checkout work:
that profile disables the database, JPA, and Flyway, and excludes the
persistent bottle and formula APIs. Flyway seeds the local bottle catalog on
the first startup.

The `local` profile is only for a health/API smoke test without persistence or
JWT authentication:

```sh
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

If you are at the repository root, use Maven's project-file option instead:

```sh
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=local
```

The unauthenticated health endpoint is available at `GET /api/health`.
Business controllers are protected by Spring Security and require a valid
Google Identity Platform JWT, except for the public bottle and active master
formula catalogs.

The default local database is `jdbc:mysql://localhost:3306/scentify`.
Flyway creates the schema in `src/main/resources/db/migration` on first
startup. The same schema is used by Google Cloud SQL for MySQL.

## Java API

The Spring backend owns the application data APIs and validates Google
Identity Platform JWTs:

- `GET|PUT /api/profile`
- `GET /api/ingredients?search=...`
- `POST|PUT|DELETE /api/ingredients`
- `GET /api/bottles`; staff `POST|PUT|DELETE /api/bottles`
- `GET /api/formulas` and `POST /api/formulas` for a signed-in user's formulas
- `GET /api/formulas/catalog` for active public master formulas
- Staff `GET /api/formulas/catalog/manage` and `POST|PUT|DELETE /api/formulas/catalog`
- `GET /api/orders/mine`
- `GET /api/orders` and `POST /api/orders`
- `PATCH /api/orders/{id}/status`
- Staff `GET /api/payments`, with customer `POST /api/payments` and staff
  `PATCH /api/payments/{id}/verify`
- Staff `GET /api/shipping`, `POST /api/shipping`, and `PATCH /api/shipping/{id}`
- `GET|POST /api/chat/messages`
- `GET|POST /api/chat/admin/messages`
- `POST /api/admin/staff`

Flyway migration V5 seeds the bottle and master-formula catalogs, including
their formula-detail ingredient links. Payments and shipping records are
created from real orders rather than seeded as standalone records.

The backend uses Application Default Credentials to administer Identity
Platform users. Grant the Cloud Run service account Identity Platform
administrator permissions; do not create or commit a service-account JSON key.

For Cloud Run, also set `CORS_ALLOWED_ORIGINS` to the deployed frontend origin.
The backend Dockerfile is in this directory and listens on the `PORT`
environment variable supplied by Cloud Run. For a Cloud Run service connected
to Cloud SQL, use this JDBC URL format:

```text
jdbc:mysql://google/scentify?cloudSqlInstance=PROJECT_ID:REGION:INSTANCE_NAME&socketFactory=com.google.cloud.sql.mysql.SocketFactory&cloudSqlRefreshStrategy=lazy
```
