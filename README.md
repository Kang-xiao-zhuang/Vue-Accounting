# Daily Bookkeeping — Full Stack

Two projects on your Desktop:

| Folder | Stack |
|--------|-------|
| `bookkeeping-vue/`    | Vue 3 + Vite (frontend) |
| `bookkeeping-server/` | Spring Boot 2.7.18 · Java 8 · MySQL 5.5 (backend) |

The original single-file `daily-bookkeeping.html` is kept for reference; the Vue project is the same app split into components and wired to the REST API.

---

## 1. Backend — Spring Boot (Java 8 + MySQL 5.5)

### Prerequisites
- JDK **1.8**
- Maven 3.6+
- MySQL **5.5** running on `localhost:3306`

### Setup
1. Create the database (table auto-creates on first run, but the DB must exist):
   ```sql
   SOURCE bookkeeping-server/db/init.sql;
   -- or just: CREATE DATABASE bookkeeping DEFAULT CHARACTER SET utf8;
   ```
2. Edit `bookkeeping-server/src/main/resources/application.yml` and set your MySQL
   `username` / `password`.
3. Run:
   ```bash
   cd bookkeeping-server
   mvn spring-boot:run
   ```
   API starts at **http://localhost:8080**.

### REST API
| Method | Path                | Purpose            |
|--------|---------------------|--------------------|
| GET    | `/api/records`      | List all records   |
| POST   | `/api/records`      | Create a record    |
| PUT    | `/api/records/{id}` | Update a record    |
| DELETE | `/api/records/{id}` | Delete one record  |
| DELETE | `/api/records`      | Delete all records |

Record JSON:
```json
{ "type": "expense", "category": "Dining", "amount": 120.50, "date": "2026-06-26", "note": "lunch" }
```

### Why these versions
- **Spring Boot 2.7.18** — the final 2.7.x release and the best Spring Boot 2 line that still supports Java 8.
- **MySQL Connector/J 5.1.49** with `com.mysql.jdbc.Driver` and Hibernate `MySQL55Dialect` — the correct combo for MySQL 5.5 (the 8.x connector targets newer servers).

---

## 2. Frontend — Vue 3 + Vite

### Prerequisites
- Node.js 18+

### Run (dev)
```bash
cd bookkeeping-vue
npm install
npm run dev
```
Open **http://localhost:5173**. Vite proxies `/api` → `http://localhost:8080`, so start the
backend first.

### Build (production)
```bash
npm run build      # outputs to dist/
npm run preview    # preview the build
```

### Project structure
```
bookkeeping-vue/
├─ index.html
├─ vite.config.js          # dev server + /api proxy
└─ src/
   ├─ main.js
   ├─ App.vue              # state, period logic, API calls
   ├─ style.css            # dark theme + shared styles
   ├─ api.js               # axios REST client
   ├─ categories.js        # categories + color palette
   ├─ utils.js             # date helpers (week range, formatting)
   └─ components/
      ├─ PeriodNav.vue     # Day/Week/Month/All tabs + date navigation
      ├─ SummaryCards.vue  # income / expense / balance
      ├─ RecordForm.vue    # add & edit form
      ├─ CategoryChart.vue # SVG donut breakdown
      └─ RecordList.vue    # list, type filter, CSV export
```

---

## Typical workflow
1. Start MySQL 5.5.
2. `cd bookkeeping-server && mvn spring-boot:run`
3. `cd bookkeeping-vue && npm install && npm run dev`
4. Visit http://localhost:5173.
