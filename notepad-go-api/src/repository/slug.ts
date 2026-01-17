import { Collection, Db } from "mongodb";
import Slug from "../model/slug";

export default class SlugRepository {
  private collection: Collection<Slug>;

  constructor(db: Db) {
    this.collection = db.collection<Slug>("slugs");
  }

  async create(data: {
    slug: string;
    context: string;
    passwordProtected?: boolean;
    password?: string | null;
  }): Promise<void> {
    await this.collection.insertOne({
      slug: data.slug,
      context: data.context,
      passwordProtected: data.passwordProtected ?? false,
      password: data.password ?? null,
      lastTimeEdited: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async findBySlug(slug: string): Promise<Slug | null> {
    console.log("Finding slug:", slug);
    return this.collection.findOne({ slug });
  }

  async updateContext(slug: string, context: string): Promise<void> {
    console.log("Updating context for slug:", slug);
    await this.collection.updateOne(
      { slug },
      {
        $set: {
          context,
          lastTimeEdited: new Date(),
          updatedAt: new Date(),
        },
      },
    );
  }

  async updatePassword(
    slug: string,
    passwordProtected: boolean,
    password?: string | null,
  ): Promise<void> {
    await this.collection.updateOne(
      { slug },
      {
        $set: {
          passwordProtected,
          password: passwordProtected ? (password ?? null) : null,
          updatedAt: new Date(),
        },
      },
    );
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.collection.deleteMany({
      updatedAt: { $lt: date },
    });

    return result.deletedCount ?? 0;
  }

  async removePassword(slug: string): Promise<void> {
    await this.collection.updateOne(
      { slug },
      {
        $set: {
          passwordProtected: false,
          password: null,
          userId: undefined,
          updatedAt: new Date(),
        },
      },
    );
  }

  async delete(slug: string): Promise<void> {
    await this.collection.deleteOne({ slug });
  }

  async exists(slug: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ slug });
    return count > 0;
  }

  async setOwner(slug: string, userId: string): Promise<void> {
    await this.collection.updateOne(
      { slug },
      {
        $set: {
          userId,
          updatedAt: new Date(),
        },
      },
    );
  }
}
