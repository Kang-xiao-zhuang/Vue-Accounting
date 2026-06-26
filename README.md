# Daily Bookkeeping — Full Stack

A mobile-style, multi-user bookkeeping app. The frontend lives inside the backend folder:

| Folder | Stack |
|--------|-------|
| `D:\Develop\idea_project\bookkeeping-server\`                  | Spring Boot 2.7.18 · Java 8 · MySQL 5.5 (backend) |
| `D:\Develop\idea_project\bookkeeping-server\bookkeeping-vue\`  | Vue 3 + Vite (frontend) |

### Features
- 📱 Phone-sized UI with a bottom tab bar: **Records · Add · Stats · Me**
- ➕ Tap-a-category entry screen with a slide-up amount sheet
- 📊 Day / Week / Month / All periods with date navigation, summary cards, and an SVG donut chart
- 👤 Multiple users (full CRUD) — each user has their own records
- 🗑 Per-user "clear my records"
- 📥 CSV export

---

## 1. Backend — Spring Boot (Java 8 + MySQL 5.5)

### Prerequisites
- JDK **1.8**
- Maven 3.6+
- MySQL **5.5** running on `localhost:3306`

### Setup
1. Create the database (tables auto-create on first run via `ddl-auto: update`, but the DB must exist):
   ```sql
   SOURCE D:/Develop/idea_project/bookkeeping-server/db/init.sql;
   -- or just: CREATE DATABASE bookkeeping DEFAULT CHARACTER SET utf8;
   ```
2. Edit `src/main/resources/application.yml` and set your MySQL `username` / `password`.
3. Run:
   ```bash
   cd D:\Develop\idea_project\bookkeeping-server
   mvn spring-boot:run
   ```
   API starts at **http://localhost:8030**.

### REST API

**Records**
| Method | Path                       | Purpose                                   |
|--------|----------------------------|-------------------------------------------|
| GET    | `/api/records?userId={id}` | List a user's records (omit for all)      |
| POST   | `/api/records`             | Create a record                           |
| PUT    | `/api/records/{id}`        | Update a record                           |
| DELETE | `/api/records/{id}`        | Delete one record                         |
| DELETE | `/api/records?userId={id}` | Clear a user's records (omit for all)     |

**Users**
| Method | Path              | Purpose            |
|--------|-------------------|--------------------|
| GET    | `/api/users`      | List users         |
| POST   | `/api/users`      | Create a user      |
| PUT    | `/api/users/{id}` | Rename a user      |
| DELETE | `/api/users/{id}` | Delete a user      |

Record JSON:
```json
{ "userId": 1, "type": "expense", "category": "Dining", "amount": 120.50, "date": "2026-06-26", "note": "lunch" }
```
User JSON:
```json
{ "name": "Alice" }
```

### Database tables
- `app_user` — id, name (unique), created_at  *(table is `app_user` because `user` is reserved in MySQL)*
- `account_record` — id, user_id, type, category, amount, record_date, note, created_at

### Why these versions
- **Spring Boot 2.7.18** — the final 2.7.x release and the best Spring Boot 2 line that still supports Java 8.
- **MySQL Connector/J 5.1.49** with `com.mysql.jdbc.Driver` and Hibernate `MySQL55Dialect` — the correct combo for MySQL 5.5 (the 8.x connector targets newer servers).

### Backend structure
```
bookkeeping-server/
├─ pom.xml
├─ db/init.sql
└─ src/main/
   ├─ java/com/bookkeeping/
   │  ├─ BookkeepingApplication.java
   │  ├─ config/WebConfig.java              # CORS for the Vite dev server
   │  ├─ controller/                        # AccountRecordController, UserController
   │  ├─ entity/                            # AccountRecord, User
   │  ├─ repository/                        # AccountRecordRepository, UserRepository
   │  └─ service/                           # AccountRecordService, UserService
   └─ resources/application.yml             # port 8030, datasource, JPA
```

---

## 2. Frontend — Vue 3 + Vite

### Prerequisites
- Node.js 18+

### Run (dev)
```bash
cd D:\Develop\idea_project\bookkeeping-server\bookkeeping-vue
npm install
npm run dev
```
Open **http://localhost:5173**. Vite proxies `/api` → `http://localhost:8030`, so start the
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
├─ vite.config.js              # dev server + /api proxy (-> :8030)
└─ src/
   ├─ main.js
   ├─ App.vue                  # shell: tabs, state, period logic, API calls
   ├─ style.css                # dark theme, phone frame, tab bar
   ├─ api.js                   # axios REST client (records + users)
   ├─ categories.js            # categories + color palette
   ├─ utils.js                 # date helpers (week range, formatting)
   ├─ components/
   │  ├─ TabBar.vue            # bottom navigation
   │  ├─ EntrySheet.vue        # slide-up add/edit sheet
   │  ├─ PeriodNav.vue         # Day/Week/Month/All + date navigation
   │  ├─ SummaryCards.vue      # income / expense / balance
   │  ├─ CategoryChart.vue     # SVG donut breakdown
   │  └─ RecordList.vue        # list, type filter, CSV export
   └─ views/
      ├─ RecordsView.vue       # period + summary + list
      ├─ AddView.vue           # tap-a-category grid
      ├─ StatsView.vue         # period + summary + chart
      └─ ProfileView.vue       # user CRUD + clear my records
```

---

## Typical workflow
1. Start MySQL 5.5 and make sure the `bookkeeping` database exists.
2. `cd D:\Develop\idea_project\bookkeeping-server && mvn spring-boot:run`
3. `cd D:\Develop\idea_project\bookkeeping-server\bookkeeping-vue && npm install && npm run dev`
4. Visit **http://localhost:5173** → add a user on the **Me** tab → start logging on **Add**.
