-- Run this once in MySQL 5.5 to create the database.
-- All tables are created automatically by Hibernate (ddl-auto: update),
-- but the CREATE TABLE statements below are provided if you prefer to create them manually.

CREATE DATABASE IF NOT EXISTS bookkeeping
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_general_ci;

USE bookkeeping;

CREATE TABLE IF NOT EXISTS app_user (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  name       VARCHAR(64) NOT NULL,
  created_at DATETIME,
  PRIMARY KEY (id),
  UNIQUE KEY uk_app_user_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS habit (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT,
  name       VARCHAR(64) NOT NULL,
  color      VARCHAR(16),
  created_at DATETIME,
  PRIMARY KEY (id),
  KEY idx_habit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS habit_checkin (
  id           BIGINT NOT NULL AUTO_INCREMENT,
  habit_id     BIGINT NOT NULL,
  checkin_date DATE   NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_habit_date (habit_id, checkin_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
