import { Router } from "express";
import SlugRepository from "../repository/slug";
import SlugJwt from "../auth/slugService";
import UserJwt from "../auth/userService";

export default function slugRoutes(slugRepository: SlugRepository) {
  const router = Router();

  /**
   * @swagger
   * /slug/{slug}/auth:
   *   post:
   *     summary: Authenticate into a protected room (slug)
   *     tags: [Slug]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Slug room identifier
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - password
   *             properties:
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Authenticated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *       401:
   *         description: Invalid password
   *       404:
   *         description: Slug not protected or not found
   */
  router.post("/:slug/auth", async (req, res) => {
    try {
      const { slug } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password required" });
      }

      const slugData = await slugRepository.findBySlug(slug);

      if (!slugData || !slugData.passwordProtected) {
        return res.status(404).json({ error: "Slug not protected" });
      }

      if (slugData.password !== password) {
        return res.status(401).json({ error: "Invalid password" });
      }

      const token = SlugJwt.sign(slug);
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: "Slug authentication failed" });
    }
  });

  /**
   * @swagger
   * /slug/{slug}/password:
   *   delete:
   *     summary: Remove password protection from a slug
   *     tags: [Slug]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Password removed successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not slug owner
   *       404:
   *         description: Slug not found
   */
  router.delete("/:slug/password", async (req, res) => {
    try {
      const { slug } = req.params;

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Token not provided" });
      }

      const [, token] = authHeader.split(" ");

      let payload;
      try {
        payload = UserJwt.verify(token);
      } catch {
        return res.status(401).json({ error: "Invalid token" });
      }

      const userId = payload.userId;
      const slugData = await slugRepository.findBySlug(slug);

      if (!slugData) {
        return res.status(404).json({ error: "Slug not found" });
      }

      if (slugData.userId !== userId) {
        return res.status(403).json({ error: "Not slug owner" });
      }

      if (!slugData.passwordProtected) {
        return res.json({ ok: true });
      }

      await slugRepository.removePassword(slug);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "Failed to remove slug password" });
    }
  });

  /**
   * @swagger
   * /slug/{slug}/has-password:
   *   get:
   *     summary: Check if a slug is password protected
   *     tags: [Slug]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Password protection status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 hasPassword:
   *                   type: boolean
   */
  router.get("/:slug/has-password", async (req, res) => {
    try {
      const { slug } = req.params;

      const slugData = await slugRepository.findBySlug(slug);

      res.json({
        hasPassword: slugData?.passwordProtected === true,
      });
    } catch {
      res.status(500).json({ error: "Failed to check slug password" });
    }
  });

  return router;
}
