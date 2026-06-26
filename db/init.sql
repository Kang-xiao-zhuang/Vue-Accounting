-- Run this once in MySQL 5.5 to create the database.
-- The `account_record` table is created automatically by Hibernate (ddl-auto: update),
-- but the CREATE TABLE below is provided if you prefer to create it manually.

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
