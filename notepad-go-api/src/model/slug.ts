import User from "./user";

interface Slug {
    context: string;
    slug: string;
    user: User | null;
    passwordProtected: boolean;
    password: string | null;
    lastTimeEdited: Date | null;
    createdAt: Date;
    updatedAt: Date;
}