package com.demo.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.demo.modules.system.entity.SysRole;
import java.util.Collection;
import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/** 角色，以及用户-角色、角色-权限两张关联表。简单的关联查询直接写注解 SQL，复杂的放 resources/mapper/*.xml。 */
public interface SysRoleMapper extends BaseMapper<SysRole> {

    @Select("""
            SELECT r.* FROM sys_role r
            JOIN sys_user_role ur ON ur.role_id = r.id
            WHERE ur.user_id = #{userId} AND r.deleted = 0
            """)
    List<SysRole> selectByUserId(@Param("userId") Long userId);

    @Select("""
            <script>
            SELECT DISTINCT permission FROM sys_role_permission WHERE role_id IN
            <foreach collection="roleIds" item="id" open="(" separator="," close=")">#{id}</foreach>
            </script>
            """)
    List<String> selectPermissions(@Param("roleIds") Collection<Long> roleIds);

    @Select("""
            <script>
            SELECT ur.user_id AS userId, r.id AS id, r.code AS code, r.name AS name
            FROM sys_user_role ur JOIN sys_role r ON r.id = ur.role_id
            WHERE r.deleted = 0 AND ur.user_id IN
            <foreach collection="userIds" item="id" open="(" separator="," close=")">#{id}</foreach>
            </script>
            """)
    List<UserRoleRow> selectByUserIds(@Param("userIds") Collection<Long> userIds);

    @Delete("DELETE FROM sys_user_role WHERE user_id = #{userId}")
    void deleteUserRoles(@Param("userId") Long userId);

    @Insert("INSERT INTO sys_user_role (user_id, role_id) VALUES (#{userId}, #{roleId})")
    void insertUserRole(@Param("userId") Long userId, @Param("roleId") Long roleId);

    record UserRoleRow(Long userId, Long id, String code, String name) {
    }
}
