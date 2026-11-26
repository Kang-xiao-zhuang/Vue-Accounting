# Daily Bookkeeping

一个手机样式的个人记账应用。v2.0 起改为与 Track100 一致的**纯前端静态架构**：无后端、无数据库、无账号，数据只存在本机浏览器 / WebView 中。

## 技术栈

Next.js 15（`output: "export"` 静态导出）· React 19 · TypeScript · TailwindCSS · Zustand · Recharts · Framer Motion · React Hook Form + Zod · Vitest · Playwright · Capacitor 6

数据层：`lib/storage.ts`（localStorage 单一入口，延迟写 + 配额告警）+ `lib/backup.ts`（JSON 导出 / 导入 / 快照回滚）。金额一律按**整数分**求和，避免浮点误差。

## 本地运行

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # 静态导出到 out/
npm run typecheck # TypeScript 严格检查
npm test          # Vitest 单元测试
```

## 打包 Android

前置条件：**JDK 17+**（Capacitor 6 / AGP 8.x 要求）与 Android SDK（compileSdk 34）。
本机默认 `JAVA_HOME` 若指向 JDK 8，`scripts/build-apk.mjs` 会自动回退到可用的 JDK 17+；
也可显式设置 `JAVA_HOME` / `ANDROID_HOME` 覆盖。

```bash
npx cap add android          # 首次生成 android/ 工程（已完成，android/ 已入库）
npm run android:apk          # next build + cap sync + assembleDebug
npm run android:apk:release  # 同上，但出 assembleRelease（正式签名）
```

产物：debug 在 `android/app/build/outputs/apk/debug/app-debug.apk`，
release 在 `android/app/build/outputs/apk/release/app-release.apk`（约 3.5 MB，比 debug 小 0.8 MB）。

正式签名靠 `android/keystore.properties`（不入库）：

```properties
storeFile=release.jks
storePassword=***
keyAlias=bookkeeping
keyPassword=***
```

没有该文件时 Gradle 仍能出包，但产物是 `app-release-unsigned.apk`，无法直接安装。
本机已生成 `android/app/release.jks`（别名 `bookkeeping`，有效期 10000 天），密码见 `keystore.properties`；
**换机器或重装前务必备份这两个文件，丢了就无法覆盖升级已安装的 App。**

`capacitor.config.ts` 的 `webDir` 指向 `out`，包名 `com.kang.bookkeeping`，minSdk 22 / targetSdk 34。

## 目录

```
src/
  app/          路由页面（/ 记录+统计、/add 记账、/habits 习惯、/more、/budgets 预算、/settings 设置、
                /history 历史、/todos 清单、/recurring 周期）
  components/   layout / common（含 habit-card）/ pages（ledger-page 记录统计合并页、stats-panel 按需加载）
  store/        Zustand（records / budgets / settings / habits / todos / rules）
  lib/          storage / backup / i18n / theme / money / categories / recurring
  utils/        date / stats / habits
  types/        LedgerRecord / Budget / Habit / TodoItem / RecurringRule / AppSettings

底部导航：记账 · 记录 · 习惯 · 更多。统计作为记录页内的标签，共用周期导航与汇总卡；
图表（recharts）走 `next/dynamic`，只在切到统计标签时加载。
```

## 交付进度

**阶段一（已完成）**：框架与数据层、记账录入、记录列表与搜索筛选、统计（汇总 / 分类占比 / 月对比 / 6 月趋势）、预算、主题 / 语言 / 货币、JSON 备份与 CSV 导出。统计已并入记录页，作为记录页内的标签。

**阶段二（已完成）**：
- `/history` 全量历史：关键词 / 类型 / 日期区间过滤，20 条分页（原服务端分页改为客户端内存过滤）。
- `/habits` 习惯打卡：新建 / 编辑 / 删除，热力网格 / 30 天圆环 / 周 / 月历四种视图，连续与最长天数统计。
- `/todos` 每日清单：按日导航、优先级、时间区间、完成进度、按优先级 / 时间排序、行内编辑。
- `/recurring` 周期交易：规则 CRUD / 暂停启用 / 立即执行；App 启动时自动补齐到期记录（替代旧后端 Quartz 定时任务）。

备份格式升级到 v2（含习惯 / 清单 / 周期规则），仍可导入 v1 备份。纯 UI 偏好（习惯视图、清单布局）不进备份。

## 与 v1.x 的差异

| v1.x（Spring Boot + Vue） | v2.x（当前） |
|---|---|
| Spring Boot 2.7 / Java 8 / MyBatis-Plus | 无服务端 |
| MySQL 5.5，8 张表，需 `db/init.sql` | localStorage JSON |
| JWT + BCrypt，多账号隔离 | 无账号，单用户本机数据 |
| axios 调 `/api/**`，Vite dev proxy | Zustand 直接读写本地存储 |
| 跨设备同步（同一后端） | 靠 JSON 导出 / 导入换机 |
| Capacitor 8，`webDir: dist`，依赖后端地址 | Capacitor 6，`webDir: out`，完全离线 |

> 旧架构代码已打 git tag `legacy/vue-springboot`（指向 `5fddce2`），可用 `git show legacy/vue-springboot:<path>` 或 `git checkout legacy/vue-springboot` 回溯。
> 历史 MySQL 数据按约定**不迁移**，新 App 从空数据开始。存储配额约 5MB，请定期导出备份。

## 分支与发布

- `dev2.0`：**开发分支**，日常改动都提交在这里。
- `master`：**主分支**，内容与 `dev2.0` 保持一致，只做快进（`git push github dev2.0:master`），不单独提交。
- `dev1.0`：v1.x（Spring Boot + Vue）历史分支，只读保留。

发布一个版本：

1. 改版本号：`package.json` 的 `version`，以及 `android/app/build.gradle` 的 `versionCode` / `versionName`（两处必须同步，`versionCode` 每次加 1）。
2. `npm run android:apk:release` 产出 `android/app/build/outputs/apk/release/app-release.apk`（正式签名）。
3. 提交到 `dev2.0` → 快进 `master` → 打 tag `vX.Y.Z` 并推送。
4. `gh release create vX.Y.Z <apk> --title ... --notes-file ...` 把 APK 作为 Release 附件上传（**APK 不入库**，避免仓库随版本膨胀）。

当前版本：[v2.0.0](https://github.com/Kang-xiao-zhuang/Vue-Accounting/releases/tag/v2.0.0)（`versionCode 2` / `versionName 2.0.0`）。
