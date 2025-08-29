import request from "supertest";
import app from "../helpers/testApp"; // Express app
import crypto from "crypto";

describe("User Controller", () => {
  const userData = { username: "testeuser", password: "123456" };

  describe("Registro de usuário", () => {
    it("deve criar usuário com sucesso", async () => {
      const res = await request(app).post("/users").send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Usuário criado com sucesso.");

      const check = await global.pool.query(
        "SELECT * FROM users WHERE username=$1",
        [userData.username]
      );
      expect(check.rows.length).toBe(1);
    });

    it("não deve permitir criar usuário com username muito curto", async () => {
      const invalidUser = { username: "ab", password: "123456" };
      const res = await request(app).post("/users").send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo username deve ter no mínimo 3 caracteres");
    });

    it("não deve permitir criar usuário com password menor que 6 caracteres", async () => {
      const invalidUser = { username: "testuser", password: "12345" };
      const res = await request(app).post("/users").send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo password deve ter no mínimo 6 caracteres");
    });

    it("não deve permitir criar usuário duplicado", async () => {
      await request(app).post("/users").send(userData);
      const res = await request(app).post("/users").send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Login de usuário", () => {
    beforeEach(async () => {
      await request(app).post("/users").send(userData);
    });

    it("deve permitir login com credenciais válidas e retornar token JWT", async () => {
      const res = await request(app).post("/users/login").send(userData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.username).toBe(userData.username);
    });

    it("deve bloquear login com senha incorreta", async () => {
      const wrongPassword = { username: userData.username, password: "senhaerrada" };
      const res = await request(app).post("/users/login").send(wrongPassword);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Credenciais inválidas.");
    });

    it("deve bloquear login com usuário inexistente", async () => {
      const nonExistentUser = { username: "usuarioinexistente", password: "123456" };
      const res = await request(app).post("/users/login").send(nonExistentUser);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Credenciais inválidas.");
    });

    it("deve bloquear login com campos ausentes - username", async () => {
      const missingUsername = { password: "123456" };
      const res = await request(app).post("/users/login").send(missingUsername);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo obrigatório: username");
    });

    it("deve bloquear login com campos ausentes - password", async () => {
      const missingPassword = { username: "testuser" };
      const res = await request(app).post("/users/login").send(missingPassword);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo obrigatório: password");
    });
  });

  describe("Logout de usuário", () => {
    let token: string;

    beforeEach(async () => {
      await request(app).post("/users").send(userData);
      const loginRes = await request(app).post("/users/login").send(userData);
      token = loginRes.body.data.token;
    });

    it("deve realizar logout de usuário autenticado e invalidar token", async () => {
      const res = await request(app)
        .post("/users/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Logout realizado com sucesso. Token invalidado.");

      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const blacklisted = await global.redis.get(`blacklist:jwt:${tokenHash}`);
      expect(blacklisted).toBe("true");
    });

    it("deve garantir que requisição com token deslogado seja rejeitada", async () => {
      // Primeiro faz logout
      await request(app)
        .post("/users/logout")
        .set("Authorization", `Bearer ${token}`);

      // Tenta usar o token novamente
      const res = await request(app)
        .post("/users/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token expirado ou inválido");
    });

    it("deve bloquear logout sem token", async () => {
      const res = await request(app).post("/users/logout");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token não fornecido");
    });
  });
});
