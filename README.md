# Shoe Shop / StepStyle Footwear - Full-Stack Platform

A unified enterprise footwear commerce platform featuring:
- **Backend:** Spring Boot 3 on Java 17 (`shoe-shop-backend`)
- **Database & Storage:** Shared PostgreSQL & Object Storage hosted on Supabase
- **Admin Portal:** Angular 22 standalone application (`shoe-shop-admin`) running on `http://localhost:4201`
- **Customer Storefront:** Angular 22 e-commerce application (`stepstyle-frontend`) running on `http://localhost:4200`

---

## 1. Architecture & Unified Contract

Both the Admin Portal and the Customer Website interact with the exact same Spring Boot REST API and persist to the exact same Supabase PostgreSQL database and Supabase Storage bucket.

```
+-----------------------------------+        +----------------------------------+
|  Shoe Shop Admin (Port 4201)      |        | Customer Storefront (Port 4200)  |
|  - Angular 22 Standalone          |        | - Angular 22 Standalone          |
|  - Products, Categories, Orders   |        | - Catalog, Cart, Checkout        |
+-----------------+-----------------+        +-----------------+----------------+
                  |                                            |
                  +---------------------+----------------------+
                                        | HTTP REST (JSON)
                                        v
                    +---------------------------------------+
                    | Spring Boot 3 Backend (Port 8080)     |
                    | - Java 17, Spring Security, JWT       |
                    | - Hibernate / Spring Data JPA         |
                    | - Supabase Storage REST Client        |
                    +-------------------+-------------------+
                                        |
                 +----------------------+----------------------+
                 | SSL (PgBouncer port 6543)                   | HTTPS REST API
                 v                                             v
+------------------------------------+        +---------------------------------+
| Supabase PostgreSQL Database       |        | Supabase Storage Bucket         |
| - users, categories, products      |        | - 'product-images' (Public read)|
| - product_images, orders, items    |        +---------------------------------+
+------------------------------------+
```

---

## 2. Environment Variables Specification

All database credentials, JWT secrets, and Supabase keys are strictly loaded via environment variables in `src/main/resources/application.yml`. **No secrets or credentials are hardcoded.**

| Environment Variable | Description | Example / Recommended Value |
|----------------------|-------------|-----------------------------|
| `SUPABASE_DB_URL` | PostgreSQL JDBC connection URL | `jdbc:postgresql://<project-ref>.pooler.supabase.com:6543/postgres?sslmode=require` |
| `SUPABASE_DB_USERNAME` | Supabase pooler / direct database username | `postgres.<project-ref>` or `postgres` |
| `SUPABASE_DB_PASSWORD` | Supabase database password | Your database password |
| `SUPABASE_STORAGE_URL` | Supabase project base URL | `https://<project-ref>.supabase.co` |
| `SUPABASE_STORAGE_BUCKET`| Name of Supabase storage bucket | `product-images` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` secret key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | HMAC-SHA256 secret key (minimum 256 bits) | 64+ character random secret string |
| `ADMIN_BOOTSTRAP_PASSWORD` | Initial admin account password | Strong password (e.g., `AdminSecurePassword!2026`) |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for CORS | `http://localhost:4201,http://localhost:4200` |
| `JPA_DDL_AUTO` | Hibernate DDL validation mode | `none` (or `validate`) |

> [!IMPORTANT]
> Always set `JPA_DDL_AUTO=none` (or `validate`). Never use `update` or `create` with a production Supabase instance.

---

## 3. Supabase Setup Instructions

### Step 3.1: Execute Schema Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/_/sql).
2. Open the **SQL Editor**.
3. Copy and paste the contents of `src/main/resources/db/supabase_complete_schema.sql`.
4. Click **Run**. This will create the required tables (`users`, `categories`, `products`, `product_images`, `orders`, `order_items`), set up automated timestamp triggers, insert default categories, and create storage security policies.

### Step 3.2: Verify Storage Bucket
1. Go to **Storage** in the Supabase sidebar.
2. Ensure the bucket `product-images` exists and is marked **Public**.
3. If not created automatically by the SQL script, create a bucket named `product-images` with Public Access enabled.

### Step 3.3: Obtain Service Role Key & Database Credentials
1. Go to **Project Settings** -> **API**. Copy the `service_role` key (keep this secret; do not expose to Angular).
2. Go to **Project Settings** -> **Database**. Under **Connection Pooling**, copy the connection string for port `6543` (transaction mode) and append `?sslmode=require`.

---

## 4. Running the Platform (Windows PowerShell)

### Step 4.1: Start Spring Boot Backend (Port 8080)
Open PowerShell in `d:\Shoe Shop\Shoe_Shop`:

```powershell
# Set Environment Variables
$env:SUPABASE_DB_URL="jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require"
$env:SUPABASE_DB_USERNAME="postgres.rlryucrhtugglzefnwxq"
$env:SUPABASE_DB_PASSWORD="YourSupabasePassword"
$env:SUPABASE_STORAGE_URL="https://rlryucrhtugglzefnwxq.supabase.co"
$env:SUPABASE_STORAGE_BUCKET="product-images"
$env:SUPABASE_SERVICE_ROLE_KEY="YourServiceRoleKey"
$env:JWT_SECRET="StepStyleFootwearStoreSecretKeyMustBeAtLeast256BitsLongForHmacSha256Security12345"
$env:ADMIN_BOOTSTRAP_PASSWORD="AdminSecurePassword!2026"
$env:CORS_ALLOWED_ORIGINS="http://localhost:4201,http://localhost:4200"

# Compile and package using local Maven wrapper
.\mvn.bat clean package -DskipTests

# Run the backend
java -jar target/stepstyle-backend-1.0.0.jar
```

The backend starts at `http://localhost:8080`. Swagger documentation is available at `http://localhost:8080/swagger-ui.html`.

### Step 4.2: Start Shoe Shop Admin Application (Port 4201)
Open a second PowerShell window in `d:\Shoe Shop\shoe-shop-admin`:

```powershell
npm install
npm start -- --port 4201
```

The admin portal is accessible at `http://localhost:4201`.
Log in with:
- **Email:** `admin@stepstyle.com`
- **Password:** The value provided in `$env:ADMIN_BOOTSTRAP_PASSWORD`

### Step 4.3: Start Customer Footwear Storefront (Port 4200)
Open a third PowerShell window in `d:\Shoe Shop\Shoe_Shop\stepstyle-frontend`:

```powershell
npm install
npm start -- --port 4200
```

The customer storefront is accessible at `http://localhost:4200`.

---

## 5. Troubleshooting Guide

### 1. Database Connection & SSL Errors
- **Symptom:** `FATAL: no pg_hba.conf entry for host ... SSL off` or `Connection refused`.
- **Cause:** Supabase enforces SSL encryption for all external database connections.
- **Fix:** Verify that the JDBC URL ends with `?sslmode=require`:
  `jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require`
- **Pooler vs Direct:** Supabase uses port `6543` for connection pooling (PgBouncer) and port `5432` for direct connections. If using IPv4, always use the pooler host and port `6543`.

### 2. CORS Errors in Browser
- **Symptom:** `Access to XMLHttpRequest at 'http://localhost:8080/api/...' has been blocked by CORS policy`.
- **Cause:** Request origin is not in the allowed list or credentials mismatch.
- **Fix:** Verify that `SecurityConfig.java` has both origins configured via `$env:CORS_ALLOWED_ORIGINS`:
  `http://localhost:4201,http://localhost:4200`. Preflight `OPTIONS` requests are explicitly permitted without authentication.

### 3. JWT & Authentication (401 / 403)
- **Symptom:** `401 Unauthorized` or `403 Forbidden` on Admin endpoints.
- **Cause:** Missing or expired `Bearer <token>` in the HTTP `Authorization` header, or user does not possess `ROLE_ADMIN`.
- **Fix:** Ensure the Angular `auth.interceptor.ts` attaches the token from `localStorage.getItem('token')`. Verify that the logged-in user in the `users` table has `role = 'ROLE_ADMIN'`.

### 4. Supabase Storage Image Upload Errors
- **Symptom:** `500 Internal Server Error` during `POST /api/products/upload-image`.
- **Cause:** Invalid `SUPABASE_SERVICE_ROLE_KEY` or missing bucket policies.
- **Fix:** Ensure `SUPABASE_SERVICE_ROLE_KEY` contains the `service_role` secret (not the public `anon` key). Verify the bucket name is `product-images` and is marked public.

### 5. Angular SSR Build / Node Port Conflicts
- **Symptom:** `Port 4200 or 4201 is already in use`.
- **Fix:** Kill existing node processes in PowerShell:
  ```powershell
  Get-Process -Name node | Stop-Process -Force
  ```
