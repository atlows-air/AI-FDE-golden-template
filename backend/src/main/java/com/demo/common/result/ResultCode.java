package com.demo.common.result;

import lombok.Getter;

/**
 * 统一错误码。code 是 HTTP 语义的数字码，errorCode 是给前端判断用的字符串码。
 * 新增业务错误码加在这里，不要在代码里直接写字符串。
 */
@Getter
public enum ResultCode {

    OK(0, "OK", "OK"),
    PARAM_ERROR(400, "PARAM_ERROR", "参数错误"),
    UNAUTHORIZED(401, "UNAUTHORIZED", "未登录或登录已过期"),
    LOGIN_FAILED(401, "LOGIN_FAILED", "用户名或密码错误"),
    FORBIDDEN(403, "FORBIDDEN", "没有权限"),
    NOT_FOUND(404, "NOT_FOUND", "资源不存在"),
    CONFLICT(409, "CONFLICT", "资源状态冲突"),
    SERVICE_ERROR(500, "SERVICE_ERROR", "服务异常");

    private final int code;
    private final String errorCode;
    private final String msg;

    ResultCode(int code, String errorCode, String msg) {
        this.code = code;
        this.errorCode = errorCode;
        this.msg = msg;
    }
}
