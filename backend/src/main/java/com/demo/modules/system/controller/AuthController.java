package com.demo.modules.system.controller;

import com.demo.common.result.Result;
import com.demo.common.security.LoginUser;
import com.demo.common.security.SecurityUtils;
import com.demo.modules.system.dto.AuthDtos.CurrentUserVO;
import com.demo.modules.system.dto.AuthDtos.LoginRequest;
import com.demo.modules.system.dto.AuthDtos.LoginResponse;
import com.demo.modules.system.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "登录")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "用户名密码登录")
    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.ok(authService.login(request));
    }

    @Operation(summary = "当前登录用户，含角色和权限标识")
    @GetMapping("/me")
    public Result<CurrentUserVO> me() {
        LoginUser user = SecurityUtils.currentUser();
        return Result.ok(new CurrentUserVO(user.id(), user.username(), user.nickname(), user.roles(),
                user.permissions()));
    }
}
