package com.demo.common.security;

import com.demo.common.result.Result;
import com.demo.common.result.ResultCode;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import tools.jackson.databind.json.JsonMapper;

/**
 * 无状态的令牌鉴权。除了登录和接口文档，/api/** 都要登录；细粒度权限在 Controller 方法上用 @PreAuthorize。
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /** 不需要登录的地址。新增公开接口加在这里 */
    private static final String[] PUBLIC_PATHS = {
            "/api/auth/login",
            "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**",
            "/actuator/health", "/error",
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, TokenService tokenService,
                                                   LoginUserLoader loginUserLoader, JsonMapper jsonMapper)
            throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(handling -> handling
                        .authenticationEntryPoint((request, response, e) ->
                                write(response, jsonMapper, ResultCode.UNAUTHORIZED))
                        .accessDeniedHandler((request, response, e) ->
                                write(response, jsonMapper, ResultCode.FORBIDDEN)))
                .addFilterBefore(new TokenAuthenticationFilter(tokenService, loginUserLoader),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** 密码存成 {bcrypt}... 的形式，以后换算法不用迁移旧数据 */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    private static void write(HttpServletResponse response, JsonMapper jsonMapper, ResultCode code)
            throws IOException {
        response.setStatus(code.getCode());
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(jsonMapper.writeValueAsString(Result.fail(code)));
    }
}
