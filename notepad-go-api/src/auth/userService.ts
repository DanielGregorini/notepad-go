import jwt from "jsonwebtoken";
import "dotenv/config";

interface UserJwtPayload {
  type: "user";
  userId: string;
  email: string;
}

export default class UserJwt {
  static sign(userId: string, email: string): string {

    return jwt.sign(
      {
        type: "user",
        userId,
        email,
      } as UserJwtPayload,
      process.env.JWT_SECRET || "amora",
      { expiresIn: "7d" }
    );
  }

  static verify(token: string): UserJwtPayload {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "amora"
    ) as UserJwtPayload;

    if (payload.type !== "user") {
      throw new Error("JWT inválido");
    }

    return payload;
  }


  static isOwner(token: string, userId: string): boolean {
    try {
      const payload = this.verify(token);
      return payload.userId === userId;
    } catch {
      return false;
    }
  }
}
