import { PrismaClient } from "@prisma/client";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const userId = "clygwr5q4000b6hnchuxwxmtx";
  const startDate = subDays(new Date(), 5); // 5 days ago

  for (let i = 0; i < 20; i++) {
    const date = addDays(startDate, Math.floor(Math.random() * 5)); // random date within the last 5 days
    await prisma.result.create({
      data: {
        userId: userId,
        difficulty: "EASY", // replace with actual value
        selectedTime: Math.floor(Math.random() * 60), // replace with actual value
        wpm: Math.floor(Math.random() * 100), // replace with actual value
        accuracy: Math.floor(Math.random() * 100), // replace with actual value
        wrongWords: Math.floor(Math.random() * 10), // replace with actual value
        created: date,
        updated: date,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });