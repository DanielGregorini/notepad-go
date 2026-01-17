import { Router } from "express";
import SlugRepository from "../repository/slug";
import SlugJwt from "../auth/slugService";
import UserJwt from "../auth/userService";

export default function slugRoutes(slugRepository: SlugRepository) {
  const router = Router();

  /**
   * Entrar no slug com senha
   * POST /slug/:slug/auth
   */
  router.post("/:slug/auth", async (req, res) => {
    try {
      const { slug } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Senha obrigatória" });
      }

      const slugData = await slugRepository.findBySlug(slug);

      if (!slugData || !slugData.passwordProtected) {
        return res.status(404).json({ error: "Slug não protegido" });
      }

      if (slugData.password !== password) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      // 🔐 gera token do slug
      const token = SlugJwt.sign(slug);

      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao autenticar slug" });
    }
  });

  //delete /slug/:slug/password

  router.delete("/:slug/password", async (req, res) => {
    try {
      const { slug } = req.params;

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

      const slugData = await slugRepository.findBySlug(slug);

      if (!slugData) {
        return res.status(404).json({ error: "Slug não encontrado" });
      }

      // 🔒 só o dono pode remover a senha
      if (slugData.userId !== userId) {
        return res.status(403).json({ error: "Você não é dono deste slug" });
      }

      if (!slugData.passwordProtected) {
        return res.json({ ok: true });
      }

      await slugRepository.removePassword(slug);

      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao remover senha do slug" });
    }
  });

  /**
   * Ver se slug possui senha
   * GET /slug/:slug/has-password
   */
  router.get("/:slug/has-password", async (req, res) => {
    try {
      const { slug } = req.params;

      const slugData = await slugRepository.findBySlug(slug);

      if (!slugData) {
        return res.json({ hasPassword: false });
      }

      res.json({
        hasPassword: slugData.passwordProtected === true,
      });
    } catch {
      res.status(500).json({ error: "Erro ao verificar senha do slug" });
    }
  });

  return router;
}
