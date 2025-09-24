import { db } from '@/db';
import { achievements } from '@/db/schema';

async function main() {
    const sampleAchievements = [
        {
            name: 'First Quiz',
            description: 'Complete your first quiz',
            icon: '🎯',
            type: 'milestone',
            criteria: JSON.stringify({ type: 'milestone', condition: 'first_quiz' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Level 5 Coding',
            description: 'Reach level 5 in coding',
            icon: '💻',
            type: 'level',
            criteria: JSON.stringify({ type: 'level', value: 5, subject: 'coding' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Level 5 Vocab',
            description: 'Reach level 5 in vocabulary',
            icon: '📚',
            type: 'level',
            criteria: JSON.stringify({ type: 'level', value: 5, subject: 'vocab' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Level 5 Finance',
            description: 'Reach level 5 in finance',
            icon: '💰',
            type: 'level',
            criteria: JSON.stringify({ type: 'level', value: 5, subject: 'finance' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Quiz Master',
            description: 'Complete 50 quizzes total',
            icon: '🏆',
            type: 'quiz',
            criteria: JSON.stringify({ type: 'quiz_count', value: 50 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Multi-Subject Learner',
            description: 'Complete quizzes in all 3 subjects',
            icon: '⭐',
            type: 'milestone',
            criteria: JSON.stringify({ type: 'milestone', condition: 'multi_subject', value: 3 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Coding Expert',
            description: 'Score 500 XP in coding',
            icon: '💎',
            type: 'score',
            criteria: JSON.stringify({ type: 'score', value: 500, subject: 'coding' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Vocabulary Expert',
            description: 'Score 500 XP in vocabulary',
            icon: '🎖️',
            type: 'score',
            criteria: JSON.stringify({ type: 'score', value: 500, subject: 'vocab' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Finance Expert',
            description: 'Score 500 XP in finance',
            icon: '💪',
            type: 'score',
            criteria: JSON.stringify({ type: 'score', value: 500, subject: 'finance' }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Perfectionist',
            description: 'Get 10 correct answers in a row',
            icon: '🌟',
            type: 'milestone',
            criteria: JSON.stringify({ type: 'milestone', condition: 'perfect_score', value: 10 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Dedicated Learner',
            description: 'Login for 7 consecutive days',
            icon: '🔥',
            type: 'streak',
            criteria: JSON.stringify({ type: 'streak', value: 7 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Level 10 Master',
            description: 'Reach level 10 in any subject',
            icon: '🎊',
            type: 'level',
            criteria: JSON.stringify({ type: 'level', value: 10 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Quiz Completionist',
            description: 'Complete 100 quizzes total',
            icon: '🏅',
            type: 'quiz',
            criteria: JSON.stringify({ type: 'quiz_count', value: 100 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'XP Collector',
            description: 'Earn 1000 total XP',
            icon: '✨',
            type: 'score',
            criteria: JSON.stringify({ type: 'score', value: 1000 }),
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Consistent Performer',
            description: 'Maintain 30-day streak',
            icon: '🚀',
            type: 'streak',
            criteria: JSON.stringify({ type: 'streak', value: 30 }),
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(achievements).values(sampleAchievements);
    
    console.log('✅ Achievements seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});