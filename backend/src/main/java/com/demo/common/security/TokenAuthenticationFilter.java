package com.demo.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/** 从 Authorization: Bearer <token> 解析登录用户。没有或无效时不设置身份，由后面的规则返回 401。 */
@RequiredArgsConstructor
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private static final String PREFIX = "Bearer ";

    private final TokenService tokenService;
    private final LoginUserLoader loginUserLoader;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(PREFIX)) {
            Long userId = tokenService.parseUserId(header.substring(PREFIX.length()).trim());
            LoginUser user = userId == null ? null : loginUserLoader.load(userId);
            if (user != null) {
                var authorities = user.permissions().stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toSet());
                user.roles().forEach(role -> authorities.add(new SimpleGrantedAuthority("ROLE_" + role)));
                SecurityContextHolder.getContext().setAuthentication(
                        UsernamePasswordAuthenticationToken.authenticated(user, null, authorities));
            }
        }
        chain.doFilter(request, response);
    }
}
