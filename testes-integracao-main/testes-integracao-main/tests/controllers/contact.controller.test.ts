import request from "supertest";
import app from "../helpers/testApp";

describe("Contact Controller", () => {
  const userData = { username: "testuser", password: "123456" };
  const contactData = { name: "João Silva", phone: "(11) 99999-9999" };
  let token: string;
  let userId: number;

  beforeEach(async () => {
    // Criar usuário e fazer login para obter token
    await request(app).post("/users").send(userData);
    const loginRes = await request(app).post("/users/login").send(userData);
    token = loginRes.body.data.token;
    userId = loginRes.body.data.user.id;
  });

  describe("Criação de contato", () => {
    it("deve criar contato válido com sucesso", async () => {
      const res = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(contactData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Contato criado com sucesso.");
      expect(res.body.data.contact).toBeDefined();
      expect(res.body.data.contact.name).toBe(contactData.name);
      expect(res.body.data.contact.phone).toBe(contactData.phone);
      expect(res.body.data.contact.user_id).toBe(userId);

      // Verificar se foi salvo no banco
      const check = await global.pool.query(
        "SELECT * FROM contacts WHERE name = $1 AND user_id = $2",
        [contactData.name, userId]
      );
      expect(check.rows.length).toBe(1);
    });

    it("deve impedir criação de contato sem campo obrigatório - name", async () => {
      const invalidContact = { phone: "(11) 99999-9999" };
      const res = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidContact);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo obrigatório: name");
    });

    it("deve impedir criação de contato sem campo obrigatório - phone", async () => {
      const invalidContact = { name: "João Silva" };
      const res = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidContact);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo obrigatório: phone");
    });

    it("deve impedir criação de contato com name muito curto", async () => {
      const invalidContact = { name: "A", phone: "(11) 99999-9999" };
      const res = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidContact);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo name deve ter no mínimo 2 caracteres");
    });

    it("deve impedir criação de contato com telefone em formato inválido", async () => {
      const invalidContact = { name: "João Silva", phone: "11999999999" };
      const res = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(invalidContact);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Erro de validação dos campos");
      expect(res.body.data).toContain("Campo phone não corresponde ao formato esperado");
    });

    it("deve impedir criação de contato sem autenticação", async () => {
      const res = await request(app)
        .post("/contacts")
        .send(contactData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token não fornecido");
    });
  });

  describe("Listagem de contatos", () => {
    beforeEach(async () => {
      // Criar alguns contatos para teste
      await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "João Silva", phone: "(11) 99999-9999" });
      
      await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Maria Santos", phone: "(11) 88888-8888" });
    });

    it("deve listar somente os contatos do usuário autenticado", async () => {
      const res = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts).toBeDefined();
      expect(res.body.data.contacts).toHaveLength(2);
      expect(res.body.data.contacts[0].name).toBeDefined();
      expect(res.body.data.contacts[0].phone).toBeDefined();
      expect(res.body.data.contacts[0].id).toBeDefined();
    });

    it("deve garantir que a resposta seja uma lista de contatos no formato correto", async () => {
      const res = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.contacts)).toBe(true);
      
      if (res.body.data.contacts.length > 0) {
        const contact = res.body.data.contacts[0];
        expect(contact).toHaveProperty("id");
        expect(contact).toHaveProperty("name");
        expect(contact).toHaveProperty("phone");
        expect(contact).not.toHaveProperty("user_id"); // Não deve expor user_id
      }
    });

    it("deve retornar lista vazia para usuário sem contatos", async () => {
      // Criar novo usuário
      const newUser = { username: "newuser", password: "123456" };
      await request(app).post("/users").send(newUser);
      const loginRes = await request(app).post("/users/login").send(newUser);
      const newToken = loginRes.body.data.token;

      const res = await request(app)
        .get("/contacts")
        .set("Authorization", `Bearer ${newToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contacts).toHaveLength(0);
    });

    it("deve impedir listagem sem autenticação", async () => {
      const res = await request(app).get("/contacts");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token não fornecido");
    });
  });

  describe("Atualização de contato", () => {
    let contactId: number;

    beforeEach(async () => {
      const createRes = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(contactData);
      contactId = createRes.body.data.contact.id;
    });

    it("deve atualizar contato existente com sucesso", async () => {
      const updatedData = { name: "João Santos", phone: "(11) 77777-7777" };
      const res = await request(app)
        .put(`/contacts/${contactId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Contato atualizado com sucesso.");
      expect(res.body.data.contact.name).toBe(updatedData.name);
      expect(res.body.data.contact.phone).toBe(updatedData.phone);

      // Verificar se foi atualizado no banco
      const check = await global.pool.query(
        "SELECT * FROM contacts WHERE id = $1",
        [contactId]
      );
      expect(check.rows[0].name).toBe(updatedData.name);
      expect(check.rows[0].phone).toBe(updatedData.phone);
    });

    it("deve retornar erro 404 ao tentar atualizar contato inexistente", async () => {
      const updatedData = { name: "João Santos", phone: "(11) 77777-7777" };
      const res = await request(app)
        .put("/contacts/99999")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Contato não encontrado.");
    });

    it("deve impedir atualização de contato de outro usuário", async () => {
      // Criar outro usuário
      const otherUser = { username: "otheruser", password: "123456" };
      await request(app).post("/users").send(otherUser);
      const otherLoginRes = await request(app).post("/users/login").send(otherUser);
      const otherToken = otherLoginRes.body.data.token;

      const updatedData = { name: "João Santos", phone: "(11) 77777-7777" };
      const res = await request(app)
        .put(`/contacts/${contactId}`)
        .set("Authorization", `Bearer ${otherToken}`)
        .send(updatedData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Contato não encontrado.");
    });

    it("deve impedir atualização sem autenticação", async () => {
      const updatedData = { name: "João Santos", phone: "(11) 77777-7777" };
      const res = await request(app)
        .put(`/contacts/${contactId}`)
        .send(updatedData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token não fornecido");
    });
  });

  describe("Exclusão de contato", () => {
    let contactId: number;

    beforeEach(async () => {
      const createRes = await request(app)
        .post("/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send(contactData);
      contactId = createRes.body.data.contact.id;
    });

    it("deve deletar contato existente com sucesso", async () => {
      const res = await request(app)
        .delete(`/contacts/${contactId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Contato deletado com sucesso.");

      // Verificar se foi removido do banco
      const check = await global.pool.query(
        "SELECT * FROM contacts WHERE id = $1",
        [contactId]
      );
      expect(check.rows.length).toBe(0);
    });

    it("deve retornar erro 404 ao tentar deletar contato inexistente", async () => {
      const res = await request(app)
        .delete("/contacts/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Contato não encontrado.");
    });

    it("deve impedir exclusão de contato de outro usuário", async () => {
      // Criar outro usuário
      const otherUser = { username: "otheruser", password: "123456" };
      await request(app).post("/users").send(otherUser);
      const otherLoginRes = await request(app).post("/users/login").send(otherUser);
      const otherToken = otherLoginRes.body.data.token;

      const res = await request(app)
        .delete(`/contacts/${contactId}`)
        .set("Authorization", `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Contato não encontrado.");
    });

    it("deve impedir exclusão sem autenticação", async () => {
      const res = await request(app)
        .delete(`/contacts/${contactId}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("Token não fornecido");
    });
  });
});

