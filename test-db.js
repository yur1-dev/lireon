const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Testing database connection...");
  try {
    await prisma.$connect();
    console.log("✅ Connected successfully!");

    // Try to query users
    const users = await prisma.user.findMany();
    console.log("Found users:", users.length);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
