// src/controllers/contact.controller.ts
import { Request, Response } from "express";
import db from "../configs/db";

// --- Criar contato ---
export const createContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const userId = req.user?.id;

    const result = await db.query(
      "INSERT INTO contacts (name, phone, user_id) VALUES ($1, $2, $3) RETURNING *",
      [name, phone, userId]
    );

    res.status(201).json({
      success: true,
      data: {
        message: "Contato criado com sucesso.",
        contact: result.rows[0]
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: "Erro ao criar contato." 
    });
  }
};

// --- Listar contatos do usuário ---
export const getContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const result = await db.query(
      "SELECT id, name, phone FROM contacts WHERE user_id = $1 ORDER BY name",
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        contacts: result.rows
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: "Erro ao listar contatos." 
    });
  }
};

// --- Atualizar contato ---
export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    const userId = req.user?.id;

    const result = await db.query(
      "UPDATE contacts SET name = $1, phone = $2 WHERE id = $3 AND user_id = $4 RETURNING *",
      [name, phone, id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Contato não encontrado."
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Contato atualizado com sucesso.",
        contact: result.rows[0]
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: "Erro ao atualizar contato." 
    });
  }
};

// --- Deletar contato ---
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await db.query(
      "DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: "Contato não encontrado."
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        message: "Contato deletado com sucesso."
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: "Erro ao deletar contato." 
    });
  }
};

