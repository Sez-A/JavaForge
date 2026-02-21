// State management
let currentState = {
    categories: [],
    currentCategory: null,
    allQuestions: [], // All questions for the selected category
    questions: [], // Selected/shuffled questions for the quiz
    currentQuestionIndex: 0,
    userAnswers: [],
    results: null,
    totalAvailableQuestions: 0
};

// DOM Elements
const views = {
    categories: document.getElementById('categoriesView'),
    quiz: document.getElementById('quizView'),
    results: document.getElementById('resultsView')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const newQuizBtn = document.getElementById('newQuizBtn');
    const questionCount = document.getElementById('questionCount');

    if (prevBtn) prevBtn.addEventListener('click', previousQuestion);
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
    if (submitBtn) submitBtn.addEventListener('click', submitQuiz);
    if (newQuizBtn) newQuizBtn.addEventListener('click', resetToCategories);
    if (questionCount) questionCount.addEventListener('change', updateQuestionCount);
}

// Load categories from API
async function loadCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Loading categories...</div>';

    try {
        const response = await fetch(`/categories`);
        if (!response.ok) throw new Error('Failed to load categories');

        const categories = await response.json();
        currentState.categories = categories;
        displayCategories(categories);
    } catch (error) {
        container.innerHTML = '<div class="error">Failed to load categories. Please refresh the page.</div>';
        console.error('Error loading categories:', error);
    }
}

// Display categories
function displayCategories(categories) {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    container.innerHTML = '';

    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <h3>${category.name}</h3>
            <p>${category.description || 'Test your knowledge'}</p>
        `;
        card.addEventListener('click', () => startQuiz(category));
        container.appendChild(card);
    });
}

// Start quiz for selected category
async function startQuiz(category) {
    currentState.currentCategory = category;

    const quizView = document.getElementById('quizView');
    if (!quizView) return;

    quizView.innerHTML = '<div class="loading">Loading questions...</div>';

    try {
        // First, get the total count of questions for this category
        const countResponse = await fetch(`/questions/count?category=${encodeURIComponent(category.name)}`);
        if (!countResponse.ok) throw new Error('Failed to get question count');

        const countData = await countResponse.json();
        currentState.totalAvailableQuestions = countData.count;

        if (currentState.totalAvailableQuestions === 0) {
            alert('No questions available for this category yet.');
            showView('categories');
            return;
        }

        // Fetch all questions for the category
        const response = await fetch(`/questions?category=${encodeURIComponent(category.name)}`);
        if (!response.ok) throw new Error('Failed to load questions');

        const allQuestions = await response.json();

        if (!allQuestions || allQuestions.length === 0) {
            alert('No questions available for this category yet.');
            showView('categories');
            return;
        }

        currentState.allQuestions = allQuestions;

        // Restore quiz view HTML structure
        restoreQuizView();

        // Update the question count dropdown with available options
        updateQuestionCountDropdown();

        // Initialize with default 10 questions
        selectRandomQuestions(10);

        showView('quiz');
    } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Failed to load questions. Please try again.');
        showView('categories');
    }
}

// Update question count dropdown with available options
function updateQuestionCountDropdown() {
    const select = document.getElementById('questionCount');
    if (!select) return;

    // Clear existing options
    select.innerHTML = '';

    const total = currentState.totalAvailableQuestions;
    const options = [5, 10, 20, 50];

    options.forEach(count => {
        if (count <= total) {
            const option = document.createElement('option');
            option.value = count;
            option.textContent = `${count} questions`;
            if (count === 10) option.selected = true;
            select.appendChild(option);
        }
    });

    // Add "All questions" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = `All questions (${total})`;
    select.appendChild(allOption);
}

// Update question count based on dropdown selection
function updateQuestionCount() {
    const select = document.getElementById('questionCount');
    if (!select) return;

    const value = select.value;
    let count;

    if (value === 'all') {
        count = currentState.allQuestions.length;
    } else {
        count = parseInt(value);
    }

    selectRandomQuestions(count);
}

// Select random questions from all available questions
function selectRandomQuestions(count) {
    // Shuffle all questions
    const shuffled = [...currentState.allQuestions].sort(() => Math.random() - 0.5);

    // Take first 'count' questions
    currentState.questions = shuffled.slice(0, count);
    currentState.currentQuestionIndex = 0;
    currentState.userAnswers = new Array(currentState.questions.length).fill(null);

    displayQuiz();
}

// Restore quiz view HTML structure
function restoreQuizView() {
    const quizView = document.getElementById('quizView');
    if (!quizView) return;

    quizView.innerHTML = `
        <div class="quiz-header">
            <h2 id="categoryTitle"></h2>
            <div class="quiz-controls-top">
                <div class="question-count-selector">
                    <label for="questionCount">Questions:</label>
                    <select id="questionCount" class="count-select">
                        <option value="5">5 questions</option>
                        <option value="10" selected>10 questions</option>
                        <option value="20">20 questions</option>
                        <option value="50">50 questions</option>
                        <option value="all">All questions</option>
                    </select>
                </div>
                <div class="quiz-progress">
                    Question <span id="currentQuestion">1</span> of <span id="totalQuestions">0</span>
                </div>
            </div>
        </div>
        
        <div id="questionContainer" class="question-container">
            <!-- Question will be displayed here -->
        </div>
        
        <div class="quiz-controls">
            <button id="prevBtn" class="btn btn-secondary" disabled>Previous</button>
            <button id="nextBtn" class="btn btn-primary">Next</button>
            <button id="submitBtn" class="btn btn-success" style="display: none;">Submit Quiz</button>
        </div>
    `;

    // Re-attach event listeners
    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
    document.getElementById('questionCount').addEventListener('change', updateQuestionCount);
}

// Display quiz interface
function displayQuiz() {
    const categoryTitle = document.getElementById('categoryTitle');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    const currentQuestionSpan = document.getElementById('currentQuestion');

    if (categoryTitle) {
        categoryTitle.textContent = currentState.currentCategory ? currentState.currentCategory.name : 'Quiz';
    }

    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = currentState.questions.length;
    }

    if (currentQuestionSpan) {
        currentQuestionSpan.textContent = currentState.currentQuestionIndex + 1;
    }

    displayQuestion();
    updateNavigationButtons();
}

// Display current question
function displayQuestion() {
    const container = document.getElementById('questionContainer');
    if (!container || !currentState.questions.length) return;

    const question = currentState.questions[currentState.currentQuestionIndex];

    let answersHtml = '';
    question.answers.forEach((answer, index) => {
        const isSelected = currentState.userAnswers[currentState.currentQuestionIndex] === index;
        answersHtml += `
            <label class="answer-option ${isSelected ? 'selected' : ''}">
                <input type="radio" name="answer" value="${index}" ${isSelected ? 'checked' : ''}>
                <span class="answer-text">${answer}</span>
            </label>
        `;
    });

    container.innerHTML = `
        <div class="question-text">${question.question}</div>
        <div class="answers-list" id="answersList">
            ${answersHtml}
        </div>
    `;

    // Add event listeners to radio buttons
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            saveAnswer(parseInt(e.target.value));
        });
    });
}

// Save user's answer
function saveAnswer(answerIndex) {
    if (!currentState.userAnswers) return;

    currentState.userAnswers[currentState.currentQuestionIndex] = answerIndex;

    // Update visual selection
    document.querySelectorAll('.answer-option').forEach((option, index) => {
        if (index === answerIndex) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });

    updateNavigationButtons();
}

// Navigate to previous question
function previousQuestion() {
    if (currentState.currentQuestionIndex > 0) {
        currentState.currentQuestionIndex--;
        displayQuestion();
        updateNavigationButtons();

        // Update current question number display
        const currentQuestionSpan = document.getElementById('currentQuestion');
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = currentState.currentQuestionIndex + 1;
        }
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentState.currentQuestionIndex < currentState.questions.length - 1) {
        currentState.currentQuestionIndex++;
        displayQuestion();
        updateNavigationButtons();

        // Update current question number display
        const currentQuestionSpan = document.getElementById('currentQuestion');
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = currentState.currentQuestionIndex + 1;
        }
    }
}

// Update navigation buttons state
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (!prevBtn || !nextBtn || !submitBtn) return;

    prevBtn.disabled = currentState.currentQuestionIndex === 0;

    const isLastQuestion = currentState.currentQuestionIndex === currentState.questions.length - 1;
    nextBtn.style.display = isLastQuestion ? 'none' : 'inline-block';
    submitBtn.style.display = isLastQuestion ? 'inline-block' : 'none';

    // Check if all questions are answered
    const allAnswered = currentState.userAnswers.every(answer => answer !== null);
    submitBtn.disabled = !allAnswered;
}

// Submit quiz answers
async function submitQuiz() {
    // Check if all questions are answered
    if (!currentState.userAnswers || currentState.userAnswers.includes(null)) {
        alert('Please answer all questions before submitting.');
        return;
    }

    // Prepare answers for submission
    const answers = currentState.questions.map((question, index) => ({
        questionId: question.id,
        selectedAnswerIndex: currentState.userAnswers[index]
    }));

    try {
        const response = await fetch(`/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers })
        });

        if (!response.ok) throw new Error('Failed to submit quiz');

        const results = await response.json();
        currentState.results = results;
        displayResults(results);
        showView('results');
    } catch (error) {
        alert('Failed to submit quiz. Please try again.');
        console.error('Error submitting quiz:', error);
    }
}

// Display results
function displayResults(results) {
    const scorePercentage = document.getElementById('scorePercentage');
    const scoreDetails = document.getElementById('scoreDetails');
    const explanationsContainer = document.getElementById('explanationsContainer');

    if (scorePercentage) {
        scorePercentage.textContent = `${Math.round(results.score)}%`;
    }

    if (scoreDetails) {
        scoreDetails.textContent = `You got ${results.correctCount} out of ${results.totalCount} questions correct!`;
    }

    if (!explanationsContainer) return;

    explanationsContainer.innerHTML = '<h3>Detailed Explanations</h3>';

    results.results.forEach(result => {
        const card = document.createElement('div');
        card.className = `explanation-card ${result.isCorrect ? 'correct' : 'incorrect'}`;

        card.innerHTML = `
            <div class="explanation-question">${result.question}</div>
            <div class="explanation-answers">
                <div class="${result.isCorrect ? 'explanation-correct' : 'explanation-incorrect'}">
                    Your answer: ${result.selectedAnswer}
                </div>
                ${!result.isCorrect ? `
                    <div class="explanation-correct">
                        Correct answer: ${result.correctAnswer}
                    </div>
                ` : ''}
            </div>
            <div class="explanation-text">
                <strong>Explanation:</strong> ${result.explanation}
            </div>
        `;

        explanationsContainer.appendChild(card);
    });
}

// Reset to categories view
function resetToCategories() {
    currentState = {
        categories: currentState.categories,
        currentCategory: null,
        allQuestions: [],
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: [],
        results: null,
        totalAvailableQuestions: 0
    };

    showView('categories');
}

// Helper function to show a specific view
function showView(viewName) {
    // Hide all views
    Object.keys(views).forEach(key => {
        if (views[key]) {
            views[key].classList.remove('active');
        }
    });

    // Show selected view
    if (views[viewName]) {
        views[viewName].classList.add('active');
    }
}

// Helper function to show loading state
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Loading...</div>';
    }
}

// Helper function to show error state
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error">${message}</div>`;
    }
}