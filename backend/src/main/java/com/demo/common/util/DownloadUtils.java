package com.demo.common.util;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;

/** 文件下载的响应头。中文文件名按 RFC 5987 编码，前端 download() 能正确解析 */
public final class DownloadUtils {

    private DownloadUtils() {
    }

    public static HttpHeaders attachmentHeaders(String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename(filename, StandardCharsets.UTF_8)
                .build());
        // 让前端能读到 Content-Disposition（跨域部署时需要）
        headers.setAccessControlExposeHeaders(List.of(HttpHeaders.CONTENT_DISPOSITION));
        return headers;
    }
}
