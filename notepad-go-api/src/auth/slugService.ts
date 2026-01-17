import jwt from "jsonwebtoken";
import "dotenv/config";

interface SlugJwtPayload {
  type: "slug";
  slug: string;
}

export default class SlugJwt {
  static sign(slug: string): string {
    return jwt.sign(
      {
        type: "slug",
        slug,
      } as SlugJwtPayload,
      process.env.JWT_SECRET || "amora",
      { expiresIn: "2d" }
    );
  }

  static verify(token: string, slug: string): SlugJwtPayload {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "amora"
    ) as SlugJwtPayload;

    if (payload.type !== "slug" || payload.slug !== slug) {
      throw new Error("JWT do slug inválido");
    }

    return payload;
  }

  static canEdit(token: string, slug: string): boolean {
    try {
      const payload = this.verify(token, slug);
      return true;
    } catch {
      return false;
    }
  }

  
}
