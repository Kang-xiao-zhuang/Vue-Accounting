# Daily Bookkeeping — Full Stack

**English** · [中文](README.zh-CN.md)

A mobile-style, single-account-per-login personal app: **bookkeeping + budgets + recurring transactions + habits + a daily checklist + a timer/stopwatch**. JWT auth, installable as a PWA.

| Folder | Stack |
|--------|-------|
| `bookkeeping-server/`             | Spring Boot 2.7.18 · Java 8 · **MyBatis-Plus** · Spring Security (JWT) · MySQL 5.5 |
| `bookkeeping-server/bookkeeping-vue/` | Vue 3 + Vite · Pinia · Vue Router · axios · Vitest |

---

## ✨ Features

**Accounts & security**
- Register / login with username + password (BCrypt), stateless **JWT** auth.
- Every user's data is private; the backend derives the user from the token (with ownership checks).

**Bookkeeping**
- ➕ Tap-a-category entry with a slide-up amount sheet (22 expense / 9 income categories, emoji icons).
- 🧾 Records grouped **by date with daily net subtotals**; search by note/category, filter by type, and by **amount range**.
- 📊 Stats: Day / Week / Month / All periods, income·expense·balance summary cards, an **SVG donut** category breakdown, and a **6-month income-vs-expense trend** chart.
- 🎯 **Budgets**: overall + per-category monthly limits with progress bars; a **red overspend alert** on the Records screen when you go over.
- 🔁 **Recurring transactions** (daily / weekly / monthly): auto-generated on a schedule and caught up on app open; full add/edit/pause/delete.
- 📥 CSV export · 💾 full **JSON backup & restore**.
- 💱 Currency symbol setting ($ / ¥ / NT$ / € …).
- 💵 Money is summed in integer cents (no floating-point drift).

**Habits**
- 🔥 Habits with an emoji **icon**, color, current & longest **streaks**, and total check-ins.
- 4 switchable visualizations: **Grid** (contribution heatmap) · **Ring** (last-30-day %) · **Week** · **Month** calendar.

**Daily checklist**
- 📋 Per-day to-do list; navigate day by day, inline-edit, check off tasks.
- 🚩 **Priority** flags (low / medium / high) with a color-coded flag you can tap to cycle; optional **date + time range** (start~end) per task.
- ↕️ **Sort** by priority or by time; two **layout views** — a stacked list with a progress bar, or a **completion ring** (color shifts red→green with progress) on the left beside the tasks. Chosen view is remembered.

**Timer**
- ⏲️ Circular **countdown** timer + ⏱️ **stopwatch** (with laps); alarm + vibration; survives refresh.

**UX**
- 4-tab bottom nav (**Records · Add · Stats · More**) with a More hub for the rest.
- 8 color themes + **custom palette** (color picker) + **Auto** (follows the OS); **English / 中文** language switch; toast notifications; installable **PWA** (offline shell).

---

## 1. Backend — Spring Boot (Java 8 + MySQL 5.5)

### Prerequisites
- JDK **1.8**, Maven 3.6+, MySQL **5.5** on `localhost:3306`.

### Setup
1. **Create the database & tables** (persistence is MyBatis-Plus — there is **no auto-DDL**, so this step is required). The schema uses **utf8mb4** (needed for emoji):
   ```sql
   SOURCE D:/Develop/idea_project/bookkeeping-server/db/init.sql;
   ```
2. Configure DB credentials — either edit `src/main/resources/application.yml` or set env vars:
   `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`. Optionally `JWT_SECRET` (≥32 chars) for production.
3. Run:
   ```bash
   cd bookkeeping-server
   mvn spring-boot:run          # API on http://localhost:8030
   ```
4. Run tests: `mvn test` (JUnit 5 + Mockito service/JWT unit tests).

### REST API
All endpoints require `Authorization: Bearer <token>` **except** `/api/auth/**`. The user id comes from the token.

| Group | Method & path | Purpose |
|-------|---------------|---------|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` | → `{ token, id, name }` |
|      | `GET /api/auth/me` | current account |
| Records | `GET/POST /api/records`, `PUT/DELETE /api/records/{id}`, `DELETE /api/records` | CRUD + clear all |
|      | `GET /api/records/page?page=&size=&type=&q=&from=&to=` | paginated/filtered history |
| Habits | `GET/POST /api/habits`, `PUT/DELETE /api/habits/{id}` | CRUD |
|      | `POST /api/habits/{id}/toggle?date=YYYY-MM-DD` | toggle a check-in |
| Todos | `GET/POST /api/todos`, `PUT/DELETE /api/todos/{id}`, `POST /api/todos/{id}/toggle` | daily checklist |
| Budgets | `GET /api/budgets`, `PUT /api/budgets`, `DELETE /api/budgets/{id}` | list / upsert / delete |
| Recurring | `GET/POST /api/recurring`, `PUT/DELETE /api/recurring/{id}`, `POST /api/recurring/run` | rules + catch-up |
| Backup | `GET /api/backup`, `POST /api/backup/restore` | export / restore all data |

Record JSON: `{ "type": "expense", "category": "Dining", "amount": 120.50, "date": "2026-06-26", "note": "lunch" }`

### Database tables (all utf8mb4)
- `app_user` — id, name (unique), password (BCrypt), created_at
- `account_record` — id, user_id, type, category, amount, record_date, note, created_at · index `(user_id, record_date)`
- `habit` — id, user_id, name, icon, color, created_at
- `habit_checkin` — id, habit_id, checkin_date · unique `(habit_id, checkin_date)`
- `todo_item` — id, user_id, todo_date, content, done, **priority** (0/1/2), **start_time**, **end_time** (`"HH:mm"`), created_at · index `(user_id, todo_date)`
- `budget` — id, user_id, category (`""` = overall), monthly_limit · unique `(user_id, category)`
- `recurring_rule` — id, user_id, type, category, amount, note, frequency, next_run_date, active, created_at

> Notes: table is `app_user` because `user` is reserved in MySQL; `todo_item.content` because `text` is reserved.
> Migrations for existing DBs (utf8mb4 / habit `icon` / composite index) are in `db/migrate-utf8mb4.sql` and comments in `db/init.sql`.

### Backend structure
```
bookkeeping-server/
├─ pom.xml
├─ db/init.sql · db/migrate-utf8mb4.sql
└─ src/main/java/com/bookkeeping/
   ├─ BookkeepingApplication.java        # @EnableScheduling, @MapperScan
   ├─ config/MybatisPlusConfig.java      # pagination plugin
   ├─ security/                          # JwtService, JwtAuthFilter, SecurityConfig, SecurityUtil
   ├─ web/GlobalExceptionHandler.java    # uniform { status, error, message } JSON
   ├─ scheduler/RecurringScheduler.java  # daily recurring generation
   ├─ controller/  entity/  mapper/  service/  dto/
```

### Why these versions
- **Spring Boot 2.7.18** — last 2.7.x, best Spring Boot 2 line that still supports Java 8.
- **MyBatis-Plus 3.5.3.2** — lightweight persistence (replaced Spring Data JPA).
- **MySQL Connector/J 5.1.49** (`com.mysql.jdbc.Driver`) — the right driver for MySQL 5.5.

---

## 2. Frontend — Vue 3 + Vite

### Run
```bash
cd bookkeeping-server/bookkeeping-vue
npm install
npm run dev        # http://localhost:5173 (proxies /api -> :8030, so start the backend first)
npm run build      # production build -> dist/
npm run test       # Vitest unit tests
```

### Structure
```
bookkeeping-vue/src/
├─ main.js · App.vue (thin layout) · style.css
├─ router/index.js            # routes + auth guard (lazy-loaded views)
├─ api.js                     # axios client (+ bearer token & 401 handling)
├─ currency.js · toast.js · utils.js · categories.js
├─ stores/                    # Pinia: auth, records, habits, todos, budgets, recurring, ui
├─ views/                     # Login, Records, Add, Stats, Habits, Todos, Timer, Budgets, Recurring, More, Profile
└─ components/                # TabBar, EntrySheet, Toast, PeriodNav, SummaryCards, RecordList,
                              # CategoryChart, TrendChart, BudgetAlert, HabitCard
```

---

## Typical workflow
1. Start MySQL 5.5 and run `db/init.sql` (creates the `bookkeeping` database + tables in utf8mb4).
2. `cd bookkeeping-server && mvn spring-boot:run`
3. `cd bookkeeping-server/bookkeeping-vue && npm install && npm run dev`
4. Open **http://localhost:5173** → **register an account** → start logging on **Add**, set budgets/habits under **More**.
