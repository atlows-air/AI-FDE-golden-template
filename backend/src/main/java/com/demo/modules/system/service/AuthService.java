package com.demo.modules.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.demo.common.exception.BizException;
import com.demo.common.result.ResultCode;
import com.demo.common.security.LoginUser;
import com.demo.common.security.LoginUserLoader;
import com.demo.common.security.TokenService;
import com.demo.modules.system.dto.AuthDtos.LoginRequest;
import com.demo.modules.system.dto.AuthDtos.LoginResponse;
import com.demo.modules.system.entity.SysRole;
import com.demo.modules.system.entity.SysUser;
import com.demo.modules.system.mapper.SysRoleMapper;
import com.demo.modules.system.mapper.SysUserMapper;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService implements LoginUserLoader {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public LoginResponse login(LoginRequest request) {
        SysUser user = userMapper.selectOne(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUsername, request.username()));
        // 用户不存在和密码错误返回同一个提示，不暴露哪个用户名存在
        if (user == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BizException(ResultCode.LOGIN_FAILED);
        }
        if (user.getStatus() == null || user.getStatus() != 1) {
            throw new BizException(ResultCode.FORBIDDEN, "账号已停用");
        }
        return new LoginResponse(tokenService.issue(user.getId()), tokenService.getExpireMinutes() * 60L);
    }

    @Override
    public LoginUser load(Long userId) {
        SysUser user = userMapper.selectById(userId);
        if (user == null || user.getStatus() == null || user.getStatus() != 1) {
            return null;
        }
        List<SysRole> roles = roleMapper.selectByUserId(userId);
        Set<String> roleCodes = roles.stream().map(SysRole::getCode).collect(Collectors.toSet());
        Set<String> permissions = roles.isEmpty()
                ? Set.of()
                : new HashSet<>(roleMapper.selectPermissions(roles.stream().map(SysRole::getId).toList()));
        return new LoginUser(user.getId(), user.getUsername(), user.getNickname(), roleCodes, permissions);
    }
}
