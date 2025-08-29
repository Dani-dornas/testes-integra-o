import express from "express";
import user from "./users.routes";
import contacts from "./contacts.routes";

const router = express.Router();

router.use("/users", user);
router.use("/contacts", contacts);

export default router;

