import { prisma } from "@/lib/prisma";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        unitPreference: true,
        heightCm: true,
        passwordHash: true,
      },
    });
  },

  updateName(id: string, name: string) {
    return prisma.user.update({ where: { id }, data: { name } });
  },

  updateUnitPreference(id: string, unitPreference: "KG" | "LBS") {
    return prisma.user.update({ where: { id }, data: { unitPreference } });
  },

  updateImage(id: string, image: string) {
    return prisma.user.update({ where: { id }, data: { image } });
  },

  updatePasswordHash(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },
};
