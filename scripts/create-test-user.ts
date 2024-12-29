import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";  

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("test123", 12);  
  
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      name: "Test User",
      password: password,
      points: 0,
    },
  });

  console.log("Created test user:", {
    id: user.id,
    email: user.email,
    name: user.name
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });