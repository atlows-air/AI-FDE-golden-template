package com.demo.common.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.ext.javatime.deser.LocalDateDeserializer;
import tools.jackson.databind.ext.javatime.deser.LocalDateTimeDeserializer;
import tools.jackson.databind.ext.javatime.ser.LocalDateSerializer;
import tools.jackson.databind.ext.javatime.ser.LocalDateTimeSerializer;
import tools.jackson.databind.module.SimpleModule;

/**
 * 日期时间统一按 yyyy-MM-dd HH:mm:ss / yyyy-MM-dd 收发，前端直接展示，不用再格式化。
 * 个别字段需要别的格式时，在字段上加 @JsonFormat 覆盖。
 */
@Configuration
public class JacksonConfig {

    public static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    public static final String DATE_PATTERN = "yyyy-MM-dd";

    @Bean
    public JsonMapperBuilderCustomizer dateTimeFormatCustomizer() {
        DateTimeFormatter dateTime = DateTimeFormatter.ofPattern(DATE_TIME_PATTERN);
        DateTimeFormatter date = DateTimeFormatter.ofPattern(DATE_PATTERN);
        SimpleModule module = new SimpleModule("date-time-format");
        module.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(dateTime));
        module.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(dateTime));
        module.addSerializer(LocalDate.class, new LocalDateSerializer(date));
        module.addDeserializer(LocalDate.class, new LocalDateDeserializer(date));
        return builder -> builder.addModule(module);
    }
}
