import User from "./user";

export default interface Slug {
  slug: string;
  context: string;
  passwordProtected: boolean;
  password: string | null;
  userId?: string;
  lastTimeEdited: Date | null;
  createdAt: Date;
  updatedAt: Date;
}