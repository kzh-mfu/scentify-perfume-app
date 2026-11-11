# Scentify Spring Boot backend

This module is the Spring Boot API boundary for the browser application. It uses
MySQL, Flyway migrations, Spring Data JPA, and Google Identity Platform JWT bearer
authentication.

## Run locally

Run these commands from the `backend/` directory. Set `DATABASE_URL`,
`DATABASE_USERNAME`, `DATABASE_PASSWORD`, and `GOOGLE_CLOUD_PROJECT_ID`, then
run:

```sh
cd backend
mvn spring-boot:run
```

For a local UI/API smoke test without MySQL or an OAuth issuer, run the
local profile:

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
Google Identity Platform JWT.

The default local database is `jdbc:mysql://localhost:3306/scentify`.
Flyway creates the schema in `src/main/resources/db/migration` on first
startup. The same schema is used by Google Cloud SQL for MySQL.

## Java API

The Spring backend owns the application data APIs and validates Google
Identity Platform JWTs:

- `GET|PUT /api/profile`
- `GET /api/ingredients?search=...`
- `POST|PUT|DELETE /api/ingredients`
- `GET /api/orders/mine`
- `GET /api/orders` and `POST /api/orders`
- `PATCH /api/orders/{id}/status`
- `GET|POST /api/chat/messages`
- `GET|POST /api/chat/admin/messages`
- `POST /api/admin/staff`

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
