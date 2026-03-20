import { PrismaClient, AchievementType } from '@prisma/client'

const prisma = new PrismaClient()

const achievements = [
    {
        type: AchievementType.FIRST_TEST,
        name: 'First Steps',
        description: 'Complete your first typing test',
        icon: '🎯'
    },
    {
        type: AchievementType.SPEED_50,
        name: 'Speed Learner',
        description: 'Reach 50 WPM',
        icon: '🚀'
    },
    {
        type: AchievementType.SPEED_75,
        name: 'Fast Typer',
        description: 'Reach 75 WPM',
        icon: '⚡'
    },
    {
        type: AchievementType.SPEED_DEMON,
        name: 'Speed Demon',
        description: 'Reach 100+ WPM',
        icon: '👹'
    },
    {
        type: AchievementType.ACCURACY_90,
        name: 'Precise',
        description: 'Achieve 90%+ accuracy',
        icon: '🎓'
    },
    {
        type: AchievementType.ACCURACY_95,
        name: 'Almost Perfect',
        description: 'Achieve 95%+ accuracy',
        icon: '💎'
    },
    {
        type: AchievementType.PERFECTIONIST,
        name: 'Perfectionist',
        description: 'Achieve 100% accuracy',
        icon: '👑'
    },
    {
        type: AchievementType.CONSISTENT,
        name: 'Consistent',
        description: 'Maintain a 7-day streak',
        icon: '🔥'
    },
    {
        type: AchievementType.MARATHON,
        name: 'Marathon Runner',
        description: 'Maintain a 30-day streak',
        icon: '🏃'
    },
    {
        type: AchievementType.CENTURY,
        name: 'Century Club',
        description: 'Complete 100 typing tests',
        icon: '💯'
    }
]

async function main() {
    console.log('Start seeding achievements...')

    for (const achievement of achievements) {
        await prisma.achievement.upsert({
            where: { type: achievement.type },
            update: achievement,
            create: achievement
        })
        console.log(`✓ Achievement: ${achievement.name}`)
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
