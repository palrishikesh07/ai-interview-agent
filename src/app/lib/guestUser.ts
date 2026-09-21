import { prisma } from "./prisma";

const GUEST_EMAIL = "guest@ai-interview.local";

export async function getOrCreateGuestUser() {
  return prisma.user.upsert({
    where: { email: GUEST_EMAIL },
    update: {},
    create: {
      email: GUEST_EMAIL,
      name: "Practice candidate",
    },
  });
}
