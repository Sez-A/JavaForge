const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file paths
const CATEGORIES_FILE = path.join(__dirname, 'data', 'categories.json');
const QUESTIONS_FILE = path.join(__dirname, 'data', 'questions.json');

// Helper function to read JSON file
async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
}

// API Endpoints

// GET /categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await readJSONFile(CATEGORIES_FILE);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load categories' });
    }
});

// GET /questions?category=OOP
app.get('/questions', async (req, res) => {
    try {
        const category = req.query.category;
        if (!category) {
            return res.status(400).json({ error: 'Category parameter is required' });
        }

        const questions = await readJSONFile(QUESTIONS_FILE);
        const filteredQuestions = questions.filter(q => q.category === category);

        // Remove correctAnswerIndex from response to prevent cheating
        const questionsForClient = filteredQuestions.map(({ correctAnswerIndex, ...rest }) => rest);

        res.json(questionsForClient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load questions' });
    }
});

// GET /questions/count?category=OOP - Get count of questions in a category
app.get('/questions/count', async (req, res) => {
    console.log('GET /questions/count called with query:', req.query);

    try {
        const category = req.query.category;
        if (!category) {
            return res.status(400).json({ error: 'Category parameter is required' });
        }

        const questions = await readJSONFile(QUESTIONS_FILE);

        if (!Array.isArray(questions)) {
            return res.status(500).json({ error: 'Questions data is not in expected format' });
        }

        const count = questions.filter(q => q.category === category).length;

        console.log(`Category "${category}" has ${count} questions`);
        res.json({ count });
    } catch (error) {
        console.error('Error in GET /questions/count:', error);
        res.status(500).json({
            error: 'Failed to get question count',
            details: error.message
        });
    }
});

// POST /submit
app.post('/submit', async (req, res) => {
    try {
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Answers array is required' });
        }

        const questions = await readJSONFile(QUESTIONS_FILE);

        // Create a map of questions by ID for quick lookup
        const questionsMap = new Map(questions.map(q => [q.id, q]));

        let correctCount = 0;
        const results = [];

        answers.forEach(answer => {
            const question = questionsMap.get(answer.questionId);
            if (question) {
                const isCorrect = answer.selectedAnswerIndex === question.correctAnswerIndex;
                if (isCorrect) correctCount++;

                results.push({
                    questionId: question.id,
                    question: question.question,
                    selectedAnswer: question.answers[answer.selectedAnswerIndex],
                    correctAnswer: question.answers[question.correctAnswerIndex],
                    isCorrect,
                    explanation: question.explanation
                });
            }
        });

        const score = (correctCount / answers.length) * 100;

        res.json({
            score: Math.round(score * 100) / 100,
            correctCount,
            totalCount: answers.length,
            results
        });
    } catch (error) {
        console.error('Error processing submission:', error);
        res.status(500).json({ error: 'Failed to process answers' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
