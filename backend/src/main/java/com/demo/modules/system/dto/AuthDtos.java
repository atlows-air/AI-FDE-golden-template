package com.demo.modules.system.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import tools.jackson.databind.annotation.JsonSerialize;
import tools.jackson.databind.ser.std.ToStringSerializer;

/** 登录相关的请求和返回 */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }

    /** expiresIn 单位秒 */
    public record LoginResponse(String token, long expiresIn) {
    }

    public record CurrentUserVO(
            @JsonSerialize(using = ToStringSerializer.class) Long id,
            String username,
            String nickname,
            Set<String> roles,
            Set<String> permissions) {
    }
}
