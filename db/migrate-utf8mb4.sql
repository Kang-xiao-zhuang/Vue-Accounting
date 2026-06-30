-- One-off migration: convert an existing `bookkeeping` database (created as utf8)
-- to utf8mb4 so 4-byte emoji (habit icons, notes, etc.) can be stored.
-- Safe to run on MySQL 5.5+. Run once.

ALTER DATABASE bookkeeping CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci;

USE bookkeeping;

ALTER TABLE app_user       CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE account_record CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE habit          CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE habit_checkin  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE todo_item      CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE budget         CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE recurring_rule CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- If you created the `habit` table before the icon column existed, also run:
--   ALTER TABLE habit ADD COLUMN icon VARCHAR(16) AFTER name;
