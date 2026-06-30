-- Run this once in MySQL 5.5 to create the database and tables.
-- (Persistence is MyBatis-Plus — there is NO auto-DDL, so this script must be run.)
-- utf8mb4 is required so 4-byte emoji (habit icons, notes) can be stored.

CREATE DATABASE IF NOT EXISTS bookkeeping
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE bookkeeping;

CREATE TABLE IF NOT EXISTS app_user (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(64)  NOT NULL,
  password   VARCHAR(100),            -- BCrypt hash; nullable for legacy rows
  created_at DATETIME,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_user_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS account_record (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT,
  type        VARCHAR(16)  NOT NULL,
  category    VARCHAR(64)  NOT NULL,
  amount      DECIMAL(12,2) NOT NULL,
  record_date DATE         NOT NULL,
  note        VARCHAR(255),
  created_at  DATETIME,
  PRIMARY KEY (id),
  KEY idx_account_record_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS habit (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT,
  name       VARCHAR(64) NOT NULL,
  icon       VARCHAR(16),
  color      VARCHAR(16),
  created_at DATETIME,
  PRIMARY KEY (id),
  KEY idx_habit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- If the habit table already exists from before, add the new column:
--   ALTER TABLE habit ADD COLUMN icon VARCHAR(16) AFTER name;

CREATE TABLE IF NOT EXISTS habit_checkin (
  id           BIGINT NOT NULL AUTO_INCREMENT,
  habit_id     BIGINT NOT NULL,
  checkin_date DATE   NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_habit_date (habit_id, checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Daily checklist (todo) items. The text column is named `content`
-- because `text` is a reserved word in MySQL.
CREATE TABLE IF NOT EXISTS todo_item (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  user_id    BIGINT,
  todo_date  DATE         NOT NULL,
  content    VARCHAR(255) NOT NULL,
  done       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME,
  PRIMARY KEY (id),
  KEY idx_todo_user_date (user_id, todo_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Monthly budgets. An empty category means the overall monthly budget.
CREATE TABLE IF NOT EXISTS budget (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  user_id       BIGINT,
  category      VARCHAR(64)   NOT NULL DEFAULT '',
  monthly_limit DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_budget_user_cat (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Recurring transaction rules; the app materializes AccountRecords from these.
CREATE TABLE IF NOT EXISTS recurring_rule (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  user_id       BIGINT,
  type          VARCHAR(16)   NOT NULL,
  category      VARCHAR(64)   NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  note          VARCHAR(255),
  frequency     VARCHAR(16)   NOT NULL,   -- DAILY | WEEKLY | MONTHLY
  next_run_date DATE          NOT NULL,
  active        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME,
  PRIMARY KEY (id),
  KEY idx_recurring_user (user_id),
  KEY idx_recurring_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
