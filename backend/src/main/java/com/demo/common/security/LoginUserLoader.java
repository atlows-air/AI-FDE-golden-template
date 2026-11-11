package com.demo.common.security;

/** 按用户 id 加载登录用户。由 system 模块实现，common 层不依赖具体的用户表。 */
public interface LoginUserLoader {

    /** 用户不存在或已停用时返回 null */
    LoginUser load(Long userId);
}
