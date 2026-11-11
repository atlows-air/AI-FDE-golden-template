package com.demo.modules.system.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.demo.common.exception.BizException;
import com.demo.common.result.PageResult;
import com.demo.common.result.ResultCode;
import com.demo.common.security.SecurityUtils;
import com.demo.modules.system.dto.UserDtos.RoleVO;
import com.demo.modules.system.dto.UserDtos.UserQuery;
import com.demo.modules.system.dto.UserDtos.UserSaveRequest;
import com.demo.modules.system.dto.UserDtos.UserVO;
import com.demo.modules.system.entity.SysUser;
import com.demo.modules.system.mapper.SysRoleMapper;
import com.demo.modules.system.mapper.SysRoleMapper.UserRoleRow;
import com.demo.modules.system.mapper.SysUserMapper;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/** 用户管理。这是模板里的参考实现：新业务模块的 Service 照这个写法来。 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final PasswordEncoder passwordEncoder;

    public PageResult<UserVO> page(UserQuery query) {
        LambdaQueryWrapper<SysUser> wrapper = Wrappers.<SysUser>lambdaQuery()
                .eq(query.getStatus() != null, SysUser::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysUser::getUsername, query.getKeyword())
                        .or().like(SysUser::getNickname, query.getKeyword())
                        .or().like(SysUser::getPhone, query.getKeyword()))
                .orderByDesc(SysUser::getCreateTime)
                .orderByDesc(SysUser::getId);
        IPage<SysUser> page = userMapper.selectPage(query.toPage(), wrapper);

        // 一次查出这一页用户的角色，避免 N+1
        Map<Long, List<RoleVO>> rolesByUser = page.getRecords().isEmpty()
                ? Map.of()
                : roleMapper.selectByUserIds(page.getRecords().stream().map(SysUser::getId).toList()).stream()
                        .collect(Collectors.groupingBy(UserRoleRow::userId,
                                Collectors.mapping(row -> new RoleVO(row.id(), row.code(), row.name()),
                                        Collectors.toList())));
        return PageResult.of(page, user -> toVO(user, rolesByUser.getOrDefault(user.getId(), List.of())));
    }

    public UserVO get(Long id) {
        SysUser user = requireUser(id);
        List<RoleVO> roles = roleMapper.selectByUserId(id).stream()
                .map(role -> new RoleVO(role.getId(), role.getCode(), role.getName()))
                .toList();
        return toVO(user, roles);
    }

    @Transactional
    public Long create(UserSaveRequest request) {
        if (!StringUtils.hasText(request.password())) {
            throw new BizException(ResultCode.PARAM_ERROR, "新增用户必须设置密码");
        }
        ensureUsernameFree(request.username(), null);
        SysUser user = new SysUser();
        apply(user, request);
        user.setPassword(passwordEncoder.encode(request.password()));
        userMapper.insert(user);
        saveRoles(user.getId(), request.roleIds());
        return user.getId();
    }

    @Transactional
    public void update(Long id, UserSaveRequest request) {
        SysUser user = requireUser(id);
        ensureUsernameFree(request.username(), id);
        if (Objects.equals(id, SecurityUtils.currentUserIdOrNull()) && request.status() != 1) {
            throw new BizException(ResultCode.CONFLICT, "不能停用自己的账号");
        }
        apply(user, request);
        if (StringUtils.hasText(request.password())) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        userMapper.updateById(user);
        saveRoles(id, request.roleIds());
    }

    @Transactional
    public void delete(Long id) {
        requireUser(id);
        if (Objects.equals(id, SecurityUtils.currentUserIdOrNull())) {
            throw new BizException(ResultCode.CONFLICT, "不能删除自己的账号");
        }
        userMapper.deleteById(id);
        roleMapper.deleteUserRoles(id);
    }

    public List<RoleVO> listRoles() {
        return roleMapper.selectList(null).stream()
                .map(role -> new RoleVO(role.getId(), role.getCode(), role.getName()))
                .toList();
    }

    private SysUser requireUser(Long id) {
        SysUser user = userMapper.selectById(id);
        if (user == null) {
            throw new BizException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return user;
    }

    private void ensureUsernameFree(String username, Long selfId) {
        boolean taken = userMapper.exists(Wrappers.<SysUser>lambdaQuery()
                .eq(SysUser::getUsername, username)
                .ne(selfId != null, SysUser::getId, selfId));
        if (taken) {
            throw new BizException(ResultCode.CONFLICT, "用户名已存在");
        }
    }

    private void saveRoles(Long userId, List<Long> roleIds) {
        roleMapper.deleteUserRoles(userId);
        for (Long roleId : new HashSet<>(roleIds)) {
            if (roleMapper.selectById(roleId) == null) {
                throw new BizException(ResultCode.PARAM_ERROR, "角色不存在：" + roleId);
            }
            roleMapper.insertUserRole(userId, roleId);
        }
    }

    private static void apply(SysUser user, UserSaveRequest request) {
        user.setUsername(request.username());
        user.setNickname(request.nickname());
        user.setPhone(StringUtils.hasText(request.phone()) ? request.phone() : null);
        user.setEmail(StringUtils.hasText(request.email()) ? request.email() : null);
        user.setStatus(request.status());
    }

    private static UserVO toVO(SysUser user, List<RoleVO> roles) {
        return new UserVO(user.getId(), user.getUsername(), user.getNickname(), user.getPhone(), user.getEmail(),
                user.getStatus(), roles, user.getCreateTime());
    }
}
