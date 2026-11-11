-- 表结构。H2（MySQL 兼容模式）和 MySQL 8 都能直接执行。
-- 新增业务表加在本文件末尾，必须带 create_user_id、create_time、update_user_id、update_time、deleted 五列。

DROP TABLE IF EXISTS sys_role_permission;
DROP TABLE IF EXISTS sys_user_role;
DROP TABLE IF EXISTS sys_role;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
    id             BIGINT       NOT NULL PRIMARY KEY,
    username       VARCHAR(32)  NOT NULL,
    password       VARCHAR(100) NOT NULL,
    nickname       VARCHAR(32)  NOT NULL,
    phone          VARCHAR(20),
    email          VARCHAR(64),
    status         TINYINT      NOT NULL DEFAULT 1,
    create_user_id BIGINT,
    create_time    DATETIME     NOT NULL,
    update_user_id BIGINT,
    update_time    DATETIME     NOT NULL,
    deleted        TINYINT      NOT NULL DEFAULT 0
);
CREATE INDEX idx_sys_user_username ON sys_user (username);

CREATE TABLE sys_role (
    id             BIGINT      NOT NULL PRIMARY KEY,
    code           VARCHAR(32) NOT NULL,
    name           VARCHAR(32) NOT NULL,
    create_user_id BIGINT,
    create_time    DATETIME    NOT NULL,
    update_user_id BIGINT,
    update_time    DATETIME    NOT NULL,
    deleted        TINYINT     NOT NULL DEFAULT 0
);

CREATE TABLE sys_user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- 权限标识直接挂在角色上：<模块>:<资源>:<动作>，如 system:user:list
CREATE TABLE sys_role_permission (
    role_id    BIGINT      NOT NULL,
    permission VARCHAR(64) NOT NULL,
    PRIMARY KEY (role_id, permission)
);
