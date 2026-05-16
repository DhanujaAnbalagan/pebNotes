import prisma from "@/lib/prisma";

export class NoteService {
  static async getNotesByUser(userId: string) {
    return prisma.note.findMany({
      where: { userId, archived: false },
      orderBy: { updatedAt: "desc" },
      include: {
        tags: true,
      },
    });
  }

  static async getNotes(userId: string, filters: {
    q?: string;
    category?: string;
    tag?: string;
    sort?: string;
    archived?: boolean;
    isPublic?: boolean;
    scheduled?: boolean;
  }) {
    const { q, category, tag, sort, archived = false, isPublic, scheduled } = filters;

    let orderBy: any = { updatedAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "a-z") orderBy = { title: "asc" };
    if (sort === "z-a") orderBy = { title: "desc" };

    return prisma.note.findMany({
      where: {
        userId,
        archived,
        ...(isPublic !== undefined && { isPublic }),
        ...(scheduled && {
          reminderAt: {
            not: null
          }
        }),
        ...(category && category !== "All" && { category }),
        ...(tag && {
          tags: {
            some: { name: tag }
          }
        }),
        ...(q && {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ]
        })
      },
      orderBy,
      include: {
        tags: true,
      }
    });
  }

  static async getArchivedNotesByUser(userId: string) {
    return prisma.note.findMany({
      where: { userId, archived: true },
      orderBy: { updatedAt: "desc" },
      include: {
        tags: true,
      },
    });
  }

  static async getNoteById(id: string, userId: string) {
    return prisma.note.findFirst({
      where: { id, userId },
      include: {
        tags: true,
        aiInsights: true,
      },
    });
  }

  static async createNote(userId: string, data: { title: string; content?: string; category?: string }) {
    return prisma.note.create({
      data: {
        ...data,
        userId,
      },
      include: {
        tags: true,
      },
    });
  }

  static async updateNote(id: string, userId: string, data: { 
    title?: string; 
    content?: string; 
    category?: string;
    archived?: boolean;
    isPublic?: boolean;
    shareId?: string | null;
    reminderAt?: Date | null;
    reminderDismissed?: boolean;
    tags?: string[]; // Array of tag names
  }) {
    const { tags, ...rest } = data;

    return prisma.note.update({
      where: { id, userId },
      data: {
        ...rest,
        ...(tags && {
          tags: {
            set: [], // Clear existing tags
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: {
        tags: true,
      },
    });
  }

  static async deleteNote(id: string, userId: string) {
    return prisma.note.delete({
      where: { id, userId },
    });
  }

  static async archiveNote(id: string, userId: string) {
    return this.updateNote(id, userId, { archived: true });
  }

  static async restoreNote(id: string, userId: string) {
    return this.updateNote(id, userId, { archived: false });
  }

  static async shareNote(id: string, userId: string) {
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return this.updateNote(id, userId, { isPublic: true, shareId });
  }

  static async unshareNote(id: string, userId: string) {
    return this.updateNote(id, userId, { isPublic: false, shareId: null });
  }

  static async getNoteByShareId(shareId: string) {
    return prisma.note.findUnique({
      where: { shareId, isPublic: true },
      include: {
        tags: true,
        aiInsights: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
    });
  }
}
