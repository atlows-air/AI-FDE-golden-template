package com.demo.common.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import org.jose4j.jws.AlgorithmIdentifiers;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.MalformedClaimException;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.keys.HmacKey;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** 签发和校验登录令牌（HS256）。令牌里只放用户 id，权限每次请求从库里读，改了权限立即生效。 */
@Service
public class TokenService {

    private final Key key;
    private final int expireMinutes;

    public TokenService(@Value("${app.security.token-secret}") String secret,
                        @Value("${app.security.token-expire-minutes}") int expireMinutes) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("app.security.token-secret 至少 32 个字节");
        }
        this.key = new HmacKey(bytes);
        this.expireMinutes = expireMinutes;
    }

    public String issue(Long userId) {
        JwtClaims claims = new JwtClaims();
        claims.setIssuedAtToNow();
        claims.setExpirationTimeMinutesInTheFuture(expireMinutes);
        claims.setGeneratedJwtId();
        claims.setSubject(String.valueOf(userId));

        JsonWebSignature jws = new JsonWebSignature();
        jws.setPayload(claims.toJson());
        jws.setKey(key);
        jws.setAlgorithmHeaderValue(AlgorithmIdentifiers.HMAC_SHA256);
        try {
            return jws.getCompactSerialization();
        } catch (JoseException e) {
            throw new IllegalStateException("签发令牌失败", e);
        }
    }

    /** 令牌有效时返回用户 id，无效或过期返回 null */
    public Long parseUserId(String token) {
        JwtConsumer consumer = new JwtConsumerBuilder()
                .setAllowedClockSkewInSeconds(30)
                .setRequireSubject()
                .setRequireExpirationTime()
                .setVerificationKey(key)
                .build();
        try {
            return Long.valueOf(consumer.processToClaims(token).getSubject());
        } catch (InvalidJwtException | MalformedClaimException | NumberFormatException e) {
            return null;
        }
    }

    public int getExpireMinutes() {
        return expireMinutes;
    }
}
