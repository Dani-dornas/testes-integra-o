import { Router } from "express";
import { 
  createContact, 
  getContacts, 
  updateContact, 
  deleteContact 
} from "../controllers/contact.controller";
import { validateBody } from "../middlewares/validateBody";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Todas as rotas de contatos requerem autenticação
router.use(authMiddleware);

// Criar contato
router.post(
  "/",
  validateBody([
    { name: "name", required: true, type: "string", minLength: 2 },
    { name: "phone", required: true, type: "string", pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ },
  ]),
  createContact
);

// Listar contatos
router.get("/", getContacts);

// Atualizar contato
router.put(
  "/:id",
  validateBody([
    { name: "name", required: true, type: "string", minLength: 2 },
    { name: "phone", required: true, type: "string", pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ },
  ]),
  updateContact
);

// Deletar contato
router.delete("/:id", deleteContact);

export default router;

