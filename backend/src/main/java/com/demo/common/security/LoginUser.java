package com.demo.common.security;

import java.util.Set;

/**
 * 当前登录用户，放在 SecurityContext 里。
 * permissions 是权限标识，如 system:user:list，接口上用 @PreAuthorize("hasAuthority('system:user:list')") 校验。
 */
public record LoginUser(Long id, String username, String nickname, Set<String> roles, Set<String> permissions) {
}
