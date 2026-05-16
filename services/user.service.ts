import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export class UserService {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createUser(data: Pick<User, "name" | "email" | "password" | "avatar">) {
    return prisma.user.create({
      data,
    });
  }
}
