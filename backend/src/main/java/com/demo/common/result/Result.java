package com.demo.common.result;

import lombok.Data;
import org.slf4j.MDC;

/**
 * 所有接口的统一返回体：{ code, errorCode, success, msg, data, requestId }。
 * Controller 一律返回 Result，不直接返回实体。
 */
@Data
public class Result<T> {

    /** 数字码，0 表示成功，其余与 HTTP 状态码语义一致 */
    private int code;
    /** 字符串错误码，见 {@link ResultCode} */
    private String errorCode;
    private boolean success;
    private String msg;
    private T data;
    /** 本次请求的 id，排查问题时用，同时写在响应头 X-Request-Id 里 */
    private String requestId;

    public static <T> Result<T> ok(T data) {
        Result<T> result = of(ResultCode.OK, ResultCode.OK.getMsg());
        result.setData(data);
        return result;
    }

    public static Result<Void> ok() {
        return ok(null);
    }

    public static <T> Result<T> fail(ResultCode code) {
        return of(code, code.getMsg());
    }

    public static <T> Result<T> fail(ResultCode code, String msg) {
        return of(code, msg);
    }

    private static <T> Result<T> of(ResultCode code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code.getCode());
        result.setErrorCode(code.getErrorCode());
        result.setSuccess(code == ResultCode.OK);
        result.setMsg(msg);
        result.setRequestId(MDC.get(RequestIdFilter.MDC_KEY));
        return result;
    }
}
