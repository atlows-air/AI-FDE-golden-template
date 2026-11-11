package com.demo.common.result;

import com.baomidou.mybatisplus.core.metadata.IPage;
import java.util.List;
import java.util.function.Function;

/** 分页结果。前端表格统一按 { records, total, current, size } 读取。 */
public record PageResult<T>(List<T> records, long total, long current, long size) {

    public static <E, T> PageResult<T> of(IPage<E> page, Function<E, T> mapper) {
        return new PageResult<>(page.getRecords().stream().map(mapper).toList(),
                page.getTotal(), page.getCurrent(), page.getSize());
    }
}
