package com.demo.modules.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.demo.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_user")
public class SysUser extends BaseEntity {

    /** 雪花 id。返回给前端时转成字符串，避免 JS 精度丢失 */
    @TableId(type = IdType.ASSIGN_ID)
    private Long id;

    private String username;

    /** {bcrypt}... 形式，任何接口都不返回这个字段 */
    private String password;

    private String nickname;

    private String phone;

    private String email;

    /** 1 启用，0 停用 */
    private Integer status;
}
