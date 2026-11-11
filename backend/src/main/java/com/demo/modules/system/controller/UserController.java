package com.demo.modules.system.controller;

import com.demo.common.result.PageResult;
import com.demo.common.result.Result;
import com.demo.modules.system.dto.UserDtos.RoleVO;
import com.demo.modules.system.dto.UserDtos.UserQuery;
import com.demo.modules.system.dto.UserDtos.UserSaveRequest;
import com.demo.modules.system.dto.UserDtos.UserVO;
import com.demo.modules.system.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.annotation.JsonSerialize;
import tools.jackson.databind.ser.std.ToStringSerializer;

/**
 * 用户管理接口。这是模板里的参考实现，新业务模块的 Controller 照这个写：
 * 路径 /api/<模块>/<资源复数>，每个方法用 @PreAuthorize 声明权限标识 <模块>:<资源>:<动作>。
 */
@Tag(name = "系统管理 - 用户")
@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户列表（分页）")
    @GetMapping
    @PreAuthorize("hasAuthority('system:user:list')")
    public Result<PageResult<UserVO>> page(@Valid UserQuery query) {
        return Result.ok(userService.page(query));
    }

    @Operation(summary = "用户详情")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:list')")
    public Result<UserVO> get(@PathVariable Long id) {
        return Result.ok(userService.get(id));
    }

    @Operation(summary = "新增用户")
    @PostMapping
    @PreAuthorize("hasAuthority('system:user:create')")
    public Result<IdVO> create(@Valid @RequestBody UserSaveRequest request) {
        return Result.ok(new IdVO(userService.create(request)));
    }

    @Operation(summary = "编辑用户，password 留空表示不修改")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:update')")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody UserSaveRequest request) {
        userService.update(id, request);
        return Result.ok();
    }

    @Operation(summary = "删除用户（逻辑删除）")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:delete')")
    public Result<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return Result.ok();
    }

    @Operation(summary = "可选的角色")
    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('system:user:list')")
    public Result<List<RoleVO>> roles() {
        return Result.ok(userService.listRoles());
    }

    public record IdVO(@JsonSerialize(using = ToStringSerializer.class) Long id) {
    }
}
