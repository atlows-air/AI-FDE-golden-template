package com.demo.common.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * 业务表实体的基类：创建人、创建时间、更新人、更新时间自动填充（见 MybatisPlusConfig），deleted 逻辑删除。
 * 每张业务表都要有这五列：create_user_id、create_time、update_user_id、update_time、deleted。
 */
@Data
public abstract class BaseEntity {

    @TableField(value = "create_user_id", fill = FieldFill.INSERT, updateStrategy = FieldStrategy.NEVER)
    private Long createUserId;

    @TableField(value = "create_time", fill = FieldFill.INSERT, updateStrategy = FieldStrategy.NEVER)
    private LocalDateTime createTime;

    @TableField(value = "update_user_id", fill = FieldFill.INSERT_UPDATE)
    private Long updateUserId;

    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
