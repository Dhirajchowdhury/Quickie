# Quickie — JSON-Driven App Generator

Upload a JSON config → get a working form + table backed by PostgreSQL.

---

## Project Structure

```
quickie/
  client/       React + Vite + Tailwind frontend
  server/       Node.js + Express backend
  config/       DB schema + example JSON config
```

---

## Setup

### 1. Database

Create a PostgreSQL database and run the schema:

```bash
psql -U <user> -d <dbname> -f quickie/config/schema.sql
```

### 2. Backend

```bash
cd quickie/server
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET
npm install
npm run dev
```

Server runs on `http://localhost:4000`.

### 3. Frontend

```bash
cd quickie/client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` to the server.

---

## Usage

1. Open the app and create an account (or sign in).
2. Paste or upload a JSON config (see `config/example.json`).
3. Click **Generate App** — the form and table render instantly.
4. Submit records via the form; they appear in the table immediately.

---

## Example Config

```json
{
  "appName": "Student Manager",
  "entities": [
    {
      "name": "students",
      "fields": [
        { "name": "name",  "type": "text",   "required": true },
        { "name": "age",   "type": "number" },
        { "name": "email", "type": "text" }
      ]
    }
  ]
}
```

### Supported field types
| type     | description        |
|----------|--------------------|
| `text`   | plain text input   |
| `number` | numeric input      |

`required: true` enforces the field on both client and server.

---

## API Reference

| Method | Path                    | Auth | Description          |
|--------|-------------------------|------|----------------------|
| POST   | /api/auth/signup        | —    | Create account       |
| POST   | /api/auth/login         | —    | Get JWT token        |
| POST   | /api/config             | JWT  | Upload/save config   |
| GET    | /api/config             | JWT  | Load saved config    |
| POST   | /api/:entity            | JWT  | Create record        |
| GET    | /api/:entity            | JWT  | List records         |
| PUT    | /api/:entity/:id        | JWT  | Update record        |
| DELETE | /api/:entity/:id        | JWT  | Delete record        |
