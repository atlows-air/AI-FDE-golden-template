package com.demo;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

/** 跑在 mock profile 上：登录、权限、增删改查和统一返回体。 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("mock")
@DirtiesContext
class UserApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JsonMapper jsonMapper;

    private String login(String username, String password) throws Exception {
        String body = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + jsonMapper.readTree(body).path("data").path("token").asString();
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("LOGIN_FAILED"));
    }

    @Test
    void anonymousGets401InResultFormat() throws Exception {
        mvc.perform(get("/api/system/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void adminCanPageCreateAndDelete() throws Exception {
        String token = login("admin", "admin123");

        mvc.perform(get("/api/auth/me").header("Authorization", token))
                .andExpect(jsonPath("$.data.username").value("admin"))
                // 加了组件后权限会变多，这里只检查用户管理的权限都在
                .andExpect(jsonPath("$.data.permissions").value(hasItems(
                        "system:user:list", "system:user:create", "system:user:update", "system:user:delete")));

        mvc.perform(get("/api/system/users").param("size", "5").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.records.length()").value(5))
                .andExpect(jsonPath("$.data.total").value(greaterThan(20)))
                .andExpect(jsonPath("$.data.records[0].password").doesNotExist());

        String created = mvc.perform(post("/api/system/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"tester","password":"secret1","nickname":"测试","status":1,"roleIds":["2"]}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String id = jsonMapper.readTree(created).path("data").path("id").asString();

        mvc.perform(get("/api/system/users/" + id).header("Authorization", token))
                .andExpect(jsonPath("$.data.roles[0].code").value("viewer"))
                .andExpect(jsonPath("$.data.createTime").value(matchesPattern("\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}")));

        mvc.perform(post("/api/system/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"tester","password":"secret1","nickname":"重复","status":1,"roleIds":[]}
                                """))
                .andExpect(status().isConflict());

        mvc.perform(delete("/api/system/users/" + id).header("Authorization", token))
                .andExpect(status().isOk());
        mvc.perform(get("/api/system/users/" + id).header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    void viewerCannotDelete() throws Exception {
        String token = login("viewer", "demo123");
        mvc.perform(get("/api/system/users").header("Authorization", token)).andExpect(status().isOk());
        mvc.perform(delete("/api/system/users/100").header("Authorization", token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    void validationErrorsUseResultFormat() throws Exception {
        String token = login("admin", "admin123");
        mvc.perform(post("/api/system/users").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"a\",\"nickname\":\"\",\"status\":1,\"roleIds\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("PARAM_ERROR"));
    }
}
