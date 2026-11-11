-- 演示数据。mock 模式每次启动都会执行；登录账号：admin / admin123（全部权限），viewer / demo123（只读）

INSERT INTO sys_role (id, code, name, create_time, update_time, deleted) VALUES
    (1, 'admin', '管理员', '2026-01-05 09:00:00', '2026-01-05 09:00:00', 0),
    (2, 'viewer', '只读用户', '2026-01-05 09:00:00', '2026-01-05 09:00:00', 0);

INSERT INTO sys_role_permission (role_id, permission) VALUES
    (1, 'system:user:list'), (1, 'system:user:create'), (1, 'system:user:update'), (1, 'system:user:delete'),
    (2, 'system:user:list');

INSERT INTO sys_user (id, username, password, nickname, phone, email, status, create_time, update_time, deleted) VALUES
    (1, 'admin', '{bcrypt}$2b$10$kV4XufX5dYxgoE7ARfBsMuqvUUREo9unKJI.IVmm9fMx/qCJkZ4yK', '系统管理员', '13800000001', 'admin@example.com', 1, '2026-01-05 09:00:00', '2026-01-05 09:00:00', 0),
    (2, 'viewer', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '演示访客', '13800000002', NULL, 1, '2026-01-05 09:10:00', '2026-01-05 09:10:00', 0),
    (100, 'zhangwei', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '张伟', '13512345678', 'zhangwei@example.com', 1, '2026-02-01 09:00:00', '2026-02-01 09:00:00', 0),
    (101, 'wangfang', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '王芳', '13612353597', 'wangfang@example.com', 1, '2026-02-04 10:13:00', '2026-02-04 10:13:00', 0),
    (102, 'lina', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '李娜', '13712361516', NULL, 1, '2026-02-07 11:26:00', '2026-02-07 11:26:00', 0),
    (103, 'liuyang', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '刘洋', NULL, 'liuyang@example.com', 1, '2026-02-10 12:39:00', '2026-02-10 12:39:00', 0),
    (104, 'chenjing', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '陈静', '13912377354', 'chenjing@example.com', 1, '2026-02-13 13:52:00', '2026-02-13 13:52:00', 0),
    (105, 'yangguang', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '杨光', '13012385273', 'yangguang@example.com', 1, '2026-02-16 14:05:00', '2026-02-16 14:05:00', 0),
    (106, 'zhaomin', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '赵敏', '13112393192', NULL, 0, '2026-02-19 15:18:00', '2026-02-19 15:18:00', 0),
    (107, 'huangxiaoming', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '黄晓明', '13212401111', 'huangxiaoming@example.com', 1, '2026-02-22 16:31:00', '2026-02-22 16:31:00', 0),
    (108, 'zhoujie', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '周杰', NULL, 'zhoujie@example.com', 1, '2026-02-25 09:44:00', '2026-02-25 09:44:00', 0),
    (109, 'wuxiaoli', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '吴晓丽', '13412416949', 'wuxiaoli@example.com', 1, '2026-02-01 10:57:00', '2026-02-01 10:57:00', 0),
    (110, 'xuhaoran', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '徐浩然', '13512424868', NULL, 1, '2026-03-04 11:10:00', '2026-03-04 11:10:00', 0),
    (111, 'sunli', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '孙丽', '13612432787', 'sunli@example.com', 1, '2026-03-07 12:23:00', '2026-03-07 12:23:00', 0),
    (112, 'maqiang', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '马强', '13712440706', 'maqiang@example.com', 1, '2026-03-10 13:36:00', '2026-03-10 13:36:00', 0),
    (113, 'zhuting', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '朱婷', NULL, 'zhuting@example.com', 1, '2026-03-13 14:49:00', '2026-03-13 14:49:00', 0),
    (114, 'hujun', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '胡军', '13912456544', NULL, 1, '2026-03-16 15:02:00', '2026-03-16 15:02:00', 0),
    (115, 'guoyan', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '郭燕', '13012464463', 'guoyan@example.com', 0, '2026-03-19 16:15:00', '2026-03-19 16:15:00', 0),
    (116, 'heqing', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '何青', '13112472382', 'heqing@example.com', 1, '2026-03-22 09:28:00', '2026-03-22 09:28:00', 0),
    (117, 'linzihan', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '林子涵', '13212480301', 'linzihan@example.com', 1, '2026-03-25 10:41:00', '2026-03-25 10:41:00', 0),
    (118, 'luoyi', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '罗毅', NULL, NULL, 1, '2026-03-01 11:54:00', '2026-03-01 11:54:00', 0),
    (119, 'zhengshuang', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '郑爽', '13412496139', 'zhengshuang@example.com', 1, '2026-03-04 12:07:00', '2026-03-04 12:07:00', 0),
    (120, 'liangchen', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '梁晨', '13512504058', 'liangchen@example.com', 1, '2026-04-07 13:20:00', '2026-04-07 13:20:00', 0),
    (121, 'songyu', '{bcrypt}$2b$10$Pev2QU74zmLclcgMxsEJuexjM5H6vYOsnsYAHXReLgOpriIgYb6y6', '宋宇', '13612511977', 'songyu@example.com', 1, '2026-04-10 14:33:00', '2026-04-10 14:33:00', 0);

INSERT INTO sys_user_role (user_id, role_id) VALUES
    (1, 1), (2, 2), (100, 1), (101, 2), (102, 2), (103, 2), (104, 1), (105, 2), (106, 2), (107, 2), (108, 2), (109, 2), (110, 2), (111, 2), (112, 2), (113, 2), (114, 2), (115, 2), (116, 2), (117, 2), (118, 2), (119, 2), (120, 2), (121, 2);
