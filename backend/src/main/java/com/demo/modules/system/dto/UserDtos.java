package com.demo.modules.system.dto;

import com.demo.common.result.PageQuery;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;
import tools.jackson.databind.annotation.JsonSerialize;
import tools.jackson.databind.ser.std.ToStringSerializer;

/**
 * 用户管理的请求和返回。一个模块的 DTO 可以按功能放在一个文件里，字段多了再拆。
 * 约定：Query 是列表查询参数，SaveRequest 是新增/编辑的请求体，VO 是返回给前端的对象。
 */
public final class UserDtos {

    private UserDtos() {
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class UserQuery extends PageQuery {
        /** 按用户名、昵称、手机号模糊搜索 */
        private String keyword;
        private Integer status;
    }

    /** 编辑时 password 留空表示不修改 */
    public record UserSaveRequest(
            @NotBlank @Size(min = 3, max = 32) @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "只能包含字母、数字和下划线")
            String username,
            @Size(min = 6, max = 64) String password,
            @NotBlank @Size(max = 32) String nickname,
            @Pattern(regexp = "^$|^1\\d{10}$", message = "手机号格式不对") String phone,
            @Email @Size(max = 64) String email,
            @NotNull @Min(0) @Max(1) Integer status,
            @NotNull List<@NotNull Long> roleIds) {
    }

    public record RoleVO(@JsonSerialize(using = ToStringSerializer.class) Long id, String code, String name) {
    }

    public record UserVO(
            @JsonSerialize(using = ToStringSerializer.class) Long id,
            String username,
            String nickname,
            String phone,
            String email,
            Integer status,
            List<RoleVO> roles,
            LocalDateTime createTime) {
    }
}
