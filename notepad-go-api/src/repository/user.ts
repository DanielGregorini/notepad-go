import { Collection, Db } from "mongodb";
import User from "../model/user";
import Slug from "../model/slug";

export default class UserRepository {
  private users: Collection<User>;
  private slugs: Collection<Slug>;

constructor(db: Db) {
    this.users = db.collection<User>("users");
    this.slugs = db.collection<Slug>("slugs");
  }

  // criar usuário
  async create(data: {
    id: string;
    name: string;
    email: string;
    password: string;
  }): Promise<void> {
    await this.users.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // buscar usuário por id
  async findById(id: string): Promise<User | null> {
    return this.users.findOne({ id });
  }

  // buscar usuário por email
  async findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ email });
  }

  // atualizar dados básicos
  async update(
    id: string,
    data: Partial<Pick<User, "name" | "email" | "password">>
  ): Promise<void> {
    await this.users.updateOne(
      { id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      }
    );
  }


  // listar todos os slugs de um usuário
  async findSlugsByUser(userId: string): Promise<Slug[]> {
    return this.slugs
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  // remover usuário
  async delete(id: string): Promise<void> {
    await this.users.deleteOne({ id });
  }
}
