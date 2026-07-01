# 每日记账 — 全栈项目

[English](README.md) · **中文**

一个手机样式的个人应用(每个登录账号独立):**记账 + 预算 + 周期交易 + 习惯打卡 + 每日清单 + 计时器/秒表**。JWT 鉴权,可作为 PWA 安装。

| 目录 | 技术栈 |
|------|--------|
| `bookkeeping-server/`             | Spring Boot 2.7.18 · Java 8 · **MyBatis-Plus** · Spring Security(JWT)· MySQL 5.5 |
| `bookkeeping-server/bookkeeping-vue/` | Vue 3 + Vite · Pinia · Vue Router · axios · Vitest |

---

## ✨ 功能

**账号与安全**
- 用户名 + 密码注册/登录(BCrypt 加密),无状态 **JWT** 鉴权。
- 每个用户的数据相互隔离;后端从 token 解析用户身份,并做归属校验。

**记账**
- ➕ 点分类快速录入 + 底部滑出金额面板(22 个支出 / 9 个收入分类,带 emoji 图标)。
- 🧾 记录**按日期分组、每日显示净额小计**;支持按备注/分类**搜索**、按类型筛选、按**金额区间**筛选。
- 📊 统计:日 / 周 / 月 / 全部周期切换,收入·支出·结余汇总卡,**SVG 甜甜圈**分类占比图,以及**近 6 个月收支趋势**柱状图。
- 🎯 **预算**:整体 + 分类月度限额,进度条显示;当月超支时在记录页顶部弹**红色超支提醒**。
- 🔁 **周期交易**(每日 / 每周 / 每月):按计划自动生成,打开 App 时补齐;支持新增/编辑/暂停/删除。
- 📥 CSV 导出 · 💾 整库 **JSON 备份与恢复**。
- 💱 货币符号设置($ / ¥ / NT$ / € …)。
- 💵 金额按**整数分**求和,杜绝浮点误差。

**习惯**
- 🔥 习惯带 emoji **图标**、颜色、**当前连续 / 最长连续**天数、累计打卡次数。
- 4 种可切换视图:**Grid**(贡献热力图)· **Ring**(近 30 天完成率)· **Week**(本周)· **Month**(当月日历)。

**每日清单**
- 📋 按天的待办清单,带完成进度条;可逐天前后切换。

**计时器**
- ⏲️ 圆环**倒计时** + ⏱️ **秒表**(支持计圈);结束响铃 + 震动;刷新后保持。

**体验**
- 底部 4 个标签(**Records · Add · Stats · More**),其余功能收进 More 聚合页。
- 3 套主题 + **Auto**(跟随系统深浅色);Toast 提示;加载态;可安装的 **PWA**(离线可用)。

---

## 1. 后端 — Spring Boot(Java 8 + MySQL 5.5)

### 前置条件
- JDK **1.8**、Maven 3.6+、MySQL **5.5**(运行在 `localhost:3306`)。

### 初始化
1. **建库建表**(持久层是 MyBatis-Plus,**没有自动建表**,此步必做)。表结构使用 **utf8mb4**(存 emoji 必需):
   ```sql
   SOURCE D:/Develop/idea_project/bookkeeping-server/db/init.sql;
   ```
2. 配置数据库账号密码 —— 改 `src/main/resources/application.yml`,或设环境变量:
   `DB_URL`、`DB_USERNAME`、`DB_PASSWORD`。生产环境可另设 `JWT_SECRET`(≥32 字符)。
3. 启动:
   ```bash
   cd bookkeeping-server
   mvn spring-boot:run          # API 在 http://localhost:8030
   ```
4. 跑测试:`mvn test`(JUnit 5 + Mockito,覆盖 service 与 JWT 单元测试)。

### REST API
除 `/api/auth/**` 外,所有接口都需要请求头 `Authorization: Bearer <token>`,用户 id 从 token 解析。

| 分组 | 方法与路径 | 说明 |
|------|-----------|------|
| 鉴权 | `POST /api/auth/register` · `POST /api/auth/login` | → `{ token, id, name }` |
|      | `GET /api/auth/me` | 当前账号 |
| 记录 | `GET/POST /api/records`、`PUT/DELETE /api/records/{id}`、`DELETE /api/records` | 增删改查 + 清空 |
|      | `GET /api/records/page?page=&size=&type=&q=&from=&to=` | 分页/条件历史查询 |
| 习惯 | `GET/POST /api/habits`、`PUT/DELETE /api/habits/{id}` | 增删改查 |
|      | `POST /api/habits/{id}/toggle?date=YYYY-MM-DD` | 打卡/取消打卡 |
| 清单 | `GET/POST /api/todos`、`PUT/DELETE /api/todos/{id}`、`POST /api/todos/{id}/toggle` | 每日清单 |
| 预算 | `GET /api/budgets`、`PUT /api/budgets`、`DELETE /api/budgets/{id}` | 列表 / 新增或更新 / 删除 |
| 周期 | `GET/POST /api/recurring`、`PUT/DELETE /api/recurring/{id}`、`POST /api/recurring/run` | 规则 + 立即补齐 |
| 备份 | `GET /api/backup`、`POST /api/backup/restore` | 导出 / 恢复全部数据 |

记录 JSON:`{ "type": "expense", "category": "Dining", "amount": 120.50, "date": "2026-06-26", "note": "午餐" }`

### 数据库表(均为 utf8mb4)
- `app_user` — id、name(唯一)、password(BCrypt)、created_at
- `account_record` — id、user_id、type、category、amount、record_date、note、created_at · 索引 `(user_id, record_date)`
- `habit` — id、user_id、name、icon、color、created_at
- `habit_checkin` — id、habit_id、checkin_date · 唯一键 `(habit_id, checkin_date)`
- `todo_item` — id、user_id、todo_date、content、done、created_at
- `budget` — id、user_id、category(`""` 表示整体预算)、monthly_limit · 唯一键 `(user_id, category)`
- `recurring_rule` — id、user_id、type、category、amount、note、frequency、next_run_date、active、created_at

> 说明:表名用 `app_user` 是因为 `user` 是 MySQL 保留字;`todo_item.content` 是因为 `text` 是保留字。
> 已有数据库的增量迁移(utf8mb4 / habit 的 `icon` 列 / 复合索引)见 `db/migrate-utf8mb4.sql` 及 `db/init.sql` 中的注释。

### 后端结构
```
bookkeeping-server/
├─ pom.xml
├─ db/init.sql · db/migrate-utf8mb4.sql
└─ src/main/java/com/bookkeeping/
   ├─ BookkeepingApplication.java        # @EnableScheduling, @MapperScan
   ├─ config/MybatisPlusConfig.java      # 分页插件
   ├─ security/                          # JwtService、JwtAuthFilter、SecurityConfig、SecurityUtil
   ├─ web/GlobalExceptionHandler.java    # 统一返回 { status, error, message }
   ├─ scheduler/RecurringScheduler.java  # 每日生成周期记录
   ├─ controller/  entity/  mapper/  service/  dto/
```

### 为什么用这些版本
- **Spring Boot 2.7.18** —— 2.7.x 最后一版,也是仍支持 Java 8 的最佳 Spring Boot 2 线。
- **MyBatis-Plus 3.5.3.2** —— 更轻量的持久层(已替换掉 Spring Data JPA)。
- **MySQL Connector/J 5.1.49**(`com.mysql.jdbc.Driver`)—— 匹配 MySQL 5.5 的正确驱动。

---

## 2. 前端 — Vue 3 + Vite

### 运行
```bash
cd bookkeeping-server/bookkeeping-vue
npm install
npm run dev        # http://localhost:5173(把 /api 代理到 :8030,请先启动后端)
npm run build      # 生产构建 -> dist/
npm run test       # Vitest 单元测试
```

### 结构
```
bookkeeping-vue/src/
├─ main.js · App.vue(纯布局) · style.css
├─ router/index.js            # 路由 + 鉴权守卫(视图懒加载)
├─ api.js                     # axios 客户端(带 token 与 401 处理)
├─ currency.js · toast.js · utils.js · categories.js
├─ stores/                    # Pinia:auth、records、habits、todos、budgets、recurring、ui
├─ views/                     # Login、Records、Add、Stats、Habits、Todos、Timer、Budgets、Recurring、More、Profile
└─ components/                # TabBar、EntrySheet、Toast、PeriodNav、SummaryCards、RecordList、
                              # CategoryChart、TrendChart、BudgetAlert、HabitCard
```

---

## 常规启动流程
1. 启动 MySQL 5.5,运行 `db/init.sql`(以 utf8mb4 建 `bookkeeping` 库和所有表)。
2. `cd bookkeeping-server && mvn spring-boot:run`
3. `cd bookkeeping-server/bookkeeping-vue && npm install && npm run dev`
4. 打开 **http://localhost:5173** → **注册账号** → 在 **Add** 记账,在 **More** 里设预算/习惯等。
