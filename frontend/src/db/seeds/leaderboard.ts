import { db } from '@/db';
import { leaderboard } from '@/db/schema';

async function main() {
    const sampleLeaderboard = [
        {
            userId: 'user_001',
            xp: 850,
            rank: 1,
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_002',
            xp: 720,
            rank: 2,
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_003',
            xp: 680,
            rank: 3,
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_004',
            xp: 450,
            rank: 4,
            updatedAt: new Date().toISOString(),
        },
        {
            userId: 'user_005',
            xp: 320,
            rank: 5,
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(leaderboard).values(sampleLeaderboard);
    
    console.log('✅ Leaderboard seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});