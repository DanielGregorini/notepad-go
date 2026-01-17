import { Router } from "express";
import UserRepository from "../repository/user";
import SlugRepository from "../repository/slug";

import UserJwt from "../auth/userService";

export default function userRoutes(
  userRepository: UserRepository,
  slugRepository: SlugRepository,
) {
  const router = Router();

  /**
   * Criar usuário
   * POST /user
   */
  router.post("/", async (req, res) => {
    try {
      const { id, name, email, password } = req.body;

      if (!id || !name || !email || !password) {
        return res.status(400).json({ error: "Dados inválidos" });
      }

      await userRepository.create({ id, name, email, password });
      res.status(201).json({ ok: true });
    } catch {
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  /**
   * Login do usuário
   * POST /user/login
   */
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log(email, password);
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha obrigatórios" });
      }

      const user = await userRepository.findByEmail(email);

      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      console.log("Usuário autenticado:", user.id);

      // gera JWT do usuário
      const token = UserJwt.sign(user.id, user.email);

      // remove senha antes de retornar
      const { password: _, ...userSafe } = user;

      res.json({
        token,
        user: userSafe,
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  /**
   * Buscar usuário
   * GET /user/:id
   */
  router.get("/:id", async (req, res) => {
    try {
      let user = await userRepository.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // remove senha antes de retornar

      user.password = "";

      res.json(user);
    } catch {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });

  /**
   * Listar slugs do usuário
   * GET /user/:id/slugs
   */
  router.get("/:id/slugs", async (req, res) => {
    try {
      const slugs = await userRepository.findSlugsByUser(req.params.id);
      res.json(slugs);
    } catch {
      res.status(500).json({ error: "Erro ao buscar slugs" });
    }
  });

  /**
   * Atualizar / definir senha de um slug
   * PUT /user/:userId/slugs/:slug/password
   */
  /**
   * Definir ou atualizar senha de um slug
   * PUT /user/:slug/password
   */
  /**
   * Editar usuário
   * PUT /user/:id
   */
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const [, token] = authHeader.split(" ");

      let payload;
      try {
        payload = UserJwt.verify(token);
      } catch {
        return res.status(401).json({ error: "Token inválido" });
      }

      if (payload.userId !== id) {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const updateData: {
        name?: string;
        email?: string;
        password?: string;
      } = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password?.trim()) updateData.password = password;

      if (Object.keys(updateData).length > 0) {
        await userRepository.update(id, updateData);
      }

      // BUSCA USUÁRIO ATUALIZADO
      let updatedUser = await userRepository.findById(id);
      if (!updatedUser) {
        return res
          .status(500)
          .json({ error: "Erro ao buscar usuário atualizado" });
      }

      updatedUser.password = "";

      res.json({
        user: updatedUser,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  router.put("/:slug/password", async (req, res) => {
    try {
      const { slug } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Senha obrigatória" });
      }

      // 🔐 JWT obrigatório
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" });
      }

      const [, token] = authHeader.split(" ");

      let payload;
      try {
        payload = UserJwt.verify(token);
      } catch {
        return res.status(401).json({ error: "Token inválido" });
      }

      const userId = payload.userId;

      let slugData = await slugRepository.findBySlug(slug);

      if (!slugData) {
        // cria slug vazio
        await slugRepository.create({
          slug,
          context: "",
          passwordProtected: false,
          password: null,
        });

        // busca novamente após criar
        slugData = await slugRepository.findBySlug(slug);
      }

      // 🏷️ define dono se não existir
      if (!slugData?.userId) {
        await slugRepository.setOwner(slug, userId);
      }
      // impede outros usuários
      else if (slugData.userId !== userId) {
        return res.status(403).json({ error: "Slug já possui dono" });
      }

      await slugRepository.updatePassword(slug, true, password);

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao definir senha do slug" });
    }
  });

  /**
   * Remover senha de um slug
   * DELETE /user/:userId/slugs/:slug/password
   */
  router.delete("/:userId/slugs/:slug/password", async (req, res) => {
    try {
      const { userId, slug } = req.params;

      const slugData = await slugRepository.findBySlug(slug);

      if (!slugData) {
        return res.status(404).json({ error: "Slug não encontrado" });
      }

      if (slugData.userId !== userId) {
        return res.status(403).json({ error: "Você não é dono deste slug" });
      }

      await slugRepository.updatePassword(slug, false, null);

      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "Erro ao remover senha do slug" });
    }
  });

  return router;
}
