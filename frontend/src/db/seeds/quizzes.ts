import { db } from '@/db';
import { quizzes } from '@/db/schema';

async function main() {
    const sampleQuizzes = [
        // CODING QUESTIONS (10 total)
        {
            subject: 'coding',
            question: 'What is the output of console.log([1,2].map(parseInt))?',
            options: JSON.stringify(['[1, 2]', '[1, NaN]', '[NaN, NaN]', '[0, 1]']),
            correctAnswer: 1,
            difficulty: 3,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'What will this code output? let x = 1; function test() { console.log(x); let x = 2; } test();',
            options: JSON.stringify(['1', '2', 'undefined', 'ReferenceError']),
            correctAnswer: 3,
            difficulty: 3,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'Which array method creates a new array with all elements that pass a test?',
            options: JSON.stringify(['map()', 'filter()', 'reduce()', 'forEach()']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'What does the "this" keyword refer to in an arrow function?',
            options: JSON.stringify(['The function itself', 'The global object', 'The lexical scope', 'undefined']),
            correctAnswer: 2,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'Which of the following is NOT a primitive data type in JavaScript?',
            options: JSON.stringify(['string', 'number', 'object', 'boolean']),
            correctAnswer: 2,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'What is a closure in JavaScript?',
            options: JSON.stringify(['A function with no parameters', 'A function that returns another function', 'A function that has access to outer scope variables', 'A function that is immediately invoked']),
            correctAnswer: 2,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'What does async/await help with in JavaScript?',
            options: JSON.stringify(['Making synchronous code', 'Handling asynchronous operations', 'Creating loops', 'Declaring variables']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'What will Object.keys({a: 1, b: 2}) return?',
            options: JSON.stringify(['[1, 2]', '["a", "b"]', '[["a", 1], ["b", 2]]', '{"a": 1, "b": 2}']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'Which operator is used for strict equality comparison?',
            options: JSON.stringify(['=', '==', '===', '!==']),
            correctAnswer: 2,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'coding',
            question: 'What is the difference between let and var in terms of scope?',
            options: JSON.stringify(['No difference', 'let is function-scoped, var is block-scoped', 'let is block-scoped, var is function-scoped', 'Both are global-scoped']),
            correctAnswer: 2,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        
        // VOCAB QUESTIONS (10 total)
        {
            subject: 'vocab',
            question: 'What is a synonym for "eloquent"?',
            options: JSON.stringify(['silent', 'articulate', 'confused', 'simple']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'What does "ubiquitous" mean?',
            options: JSON.stringify(['Rare and hard to find', 'Present everywhere', 'Extremely valuable', 'Dangerous or harmful']),
            correctAnswer: 1,
            difficulty: 3,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'What is an antonym for "benevolent"?',
            options: JSON.stringify(['kind', 'generous', 'malevolent', 'helpful']),
            correctAnswer: 2,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'The root "bio" means:',
            options: JSON.stringify(['life', 'earth', 'water', 'fire']),
            correctAnswer: 0,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'Which word means "to make less severe"?',
            options: JSON.stringify(['aggravate', 'mitigate', 'complicate', 'terminate']),
            correctAnswer: 1,
            difficulty: 3,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'What does "ephemeral" mean?',
            options: JSON.stringify(['Lasting forever', 'Very expensive', 'Short-lived', 'Extremely large']),
            correctAnswer: 2,
            difficulty: 3,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'A "novice" is someone who is:',
            options: JSON.stringify(['experienced', 'new to something', 'very old', 'highly skilled']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'What does "candid" mean?',
            options: JSON.stringify(['dishonest', 'frank and honest', 'secretive', 'confused']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'The prefix "pre-" means:',
            options: JSON.stringify(['after', 'before', 'against', 'together']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'vocab',
            question: 'What does "gregarious" describe?',
            options: JSON.stringify(['Someone who is shy', 'Someone who is sociable', 'Someone who is angry', 'Someone who is intelligent']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        
        // FINANCE QUESTIONS (10 total)
        {
            subject: 'finance',
            question: 'What is compound interest?',
            options: JSON.stringify(['Interest calculated only on the principal', 'Interest calculated on principal plus previously earned interest', 'A fixed rate of return', 'Interest that decreases over time']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What does diversification mean in investing?',
            options: JSON.stringify(['Putting all money in one investment', 'Spreading investments across different assets', 'Only investing in stocks', 'Avoiding all risks']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What is a 401(k)?',
            options: JSON.stringify(['A type of loan', 'A retirement savings plan', 'A credit card', 'A type of insurance']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What does APR stand for?',
            options: JSON.stringify(['Annual Percentage Rate', 'Average Payment Ratio', 'Automated Payment Request', 'Annual Profit Return']),
            correctAnswer: 0,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What is inflation?',
            options: JSON.stringify(['Decrease in prices over time', 'Increase in prices over time', 'Stable prices', 'Government spending']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What is the recommended emergency fund size?',
            options: JSON.stringify(['1 month of expenses', '3-6 months of expenses', '1 year of expenses', '2 weeks of expenses']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What is a mutual fund?',
            options: JSON.stringify(['A single stock purchase', 'A pooled investment vehicle', 'A type of bank account', 'A government bond']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What does it mean to "pay yourself first"?',
            options: JSON.stringify(['Pay bills before saving', 'Save money before spending on other things', 'Only pay minimum payments', 'Spend money on yourself first']),
            correctAnswer: 1,
            difficulty: 2,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What is a credit score used for?',
            options: JSON.stringify(['Measuring intelligence', 'Assessing creditworthiness', 'Calculating taxes', 'Determining salary']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        },
        {
            subject: 'finance',
            question: 'What is the difference between a debit and credit card?',
            options: JSON.stringify(['No difference', 'Debit uses your money, credit borrows money', 'Credit uses your money, debit borrows money', 'Both borrow money']),
            correctAnswer: 1,
            difficulty: 1,
            antiCheatFlags: JSON.stringify({ timer: 60, max_attempts: 3 })
        }
    ];

    await db.insert(quizzes).values(sampleQuizzes);
    
    console.log('✅ Quiz seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});