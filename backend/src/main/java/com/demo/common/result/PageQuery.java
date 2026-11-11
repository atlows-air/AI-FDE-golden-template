package com.demo.common.result;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/** 分页查询参数的基类，列表查询的 Query 对象继承它。 */
@Data
public class PageQuery {

    @Min(1)
    private long current = 1;

    @Min(1)
    @Max(200)
    private long size = 10;

    public <T> Page<T> toPage() {
        return Page.of(current, size);
    }
}
