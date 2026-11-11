package com.demo.common.exception;

import com.demo.common.result.ResultCode;
import lombok.Getter;

/**
 * 业务异常。业务规则不满足时抛它，由全局异常处理转成 Result 返回，message 会直接展示给用户。
 * 例：throw new BizException(ResultCode.CONFLICT, "用户名已存在");
 */
@Getter
public class BizException extends RuntimeException {

    private final ResultCode resultCode;

    public BizException(ResultCode resultCode) {
        super(resultCode.getMsg());
        this.resultCode = resultCode;
    }

    public BizException(ResultCode resultCode, String message) {
        super(message);
        this.resultCode = resultCode;
    }
}
