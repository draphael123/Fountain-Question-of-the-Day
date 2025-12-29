// Question of the Day Application
class QuestionOfTheDay {
    constructor() {
        this.questions = this.loadQuestions();
        this.answers = this.loadAnswers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayTodayQuestion();
        this.displayAnswers();
        this.setTodayDate();
    }

    setupEventListeners() {
        // Submit answer
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Admin panel toggle
        document.getElementById('adminToggle').addEventListener('click', () => {
            this.toggleAdminPanel();
        });

        document.getElementById('closeAdmin').addEventListener('click', () => {
            this.toggleAdminPanel();
        });

        // Add question
        document.getElementById('addQuestionBtn').addEventListener('click', () => {
            this.addQuestion();
        });

        // Close admin panel when clicking outside
        document.getElementById('adminPanel').addEventListener('click', (e) => {
            if (e.target.id === 'adminPanel') {
                this.toggleAdminPanel();
            }
        });
    }

    setTodayDate() {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('dateBadge').textContent = today.toLocaleDateString('en-US', options);
    }

    getTodayKey() {
        const today = new Date();
        return today.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    getTodayQuestion() {
        const todayKey = this.getTodayKey();
        return this.questions.find(q => q.date === todayKey) || this.getDefaultQuestion();
    }

    getDefaultQuestion() {
        // If no question for today, return a default one tailored to pharmacy operations
        const defaultQuestions = [
            'What is one workflow improvement you noticed today that could enhance patient care?',
            'How did you ensure accuracy in today\'s pharmacy operations?',
            'What patient interaction made a positive impact on your day?',
            'What is one thing you learned about our pharmacy processes today?',
            'How did you contribute to improving our team\'s efficiency today?',
            'What challenge did you overcome in today\'s workflow?',
            'How did you ensure patient safety and medication accuracy today?',
            'What collaboration with a team member helped solve a problem today?'
        ];
        
        // Use day of year to cycle through questions
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const questionIndex = dayOfYear % defaultQuestions.length;
        
        return {
            id: 'default',
            text: defaultQuestions[questionIndex],
            date: this.getTodayKey(),
            number: 1
        };
    }

    displayTodayQuestion() {
        const question = this.getTodayQuestion();
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('questionNumber').textContent = `Question #${question.number || this.questions.length + 1}`;
    }

    submitAnswer() {
        const answerText = document.getElementById('answerInput').value.trim();
        const statusDiv = document.getElementById('answerStatus');

        if (!answerText) {
            statusDiv.className = 'answer-status error';
            statusDiv.textContent = 'Please enter an answer before submitting.';
            statusDiv.style.display = 'block';
            return;
        }

        const todayKey = this.getTodayKey();
        const question = this.getTodayQuestion();
        
        if (!this.answers[todayKey]) {
            this.answers[todayKey] = [];
        }

        const answer = {
            id: Date.now(),
            text: answerText,
            timestamp: new Date().toISOString(),
            questionId: question.id || 'default'
        };

        this.answers[todayKey].push(answer);
        this.saveAnswers();

        // Clear input and show success
        document.getElementById('answerInput').value = '';
        statusDiv.className = 'answer-status success';
        statusDiv.textContent = 'Your answer has been submitted successfully!';
        statusDiv.style.display = 'block';

        // Hide status after 3 seconds
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);

        // Refresh answers display
        this.displayAnswers();
    }

    displayAnswers() {
        const todayKey = this.getTodayKey();
        const container = document.getElementById('answersContainer');
        const answers = this.answers[todayKey] || [];

        if (answers.length === 0) {
            container.innerHTML = '<p class="no-answers">No responses yet. Be the first to share!</p>';
            return;
        }

        container.innerHTML = answers.map(answer => {
            const date = new Date(answer.timestamp);
            const timeString = date.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });

            return `
                <div class="answer-card">
                    <div class="answer-text">${this.escapeHtml(answer.text)}</div>
                    <div class="answer-meta">
                        <span>Submitted at ${timeString}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleAdminPanel() {
        const panel = document.getElementById('adminPanel');
        panel.classList.toggle('active');
        
        if (panel.classList.contains('active')) {
            this.loadAdminPanel();
        }
    }

    loadAdminPanel() {
        this.displayQuestionsList();
        this.displayAllAnswers();
        
        // Set today's date as default
        document.getElementById('questionDate').value = this.getTodayKey();
    }

    displayQuestionsList() {
        const container = document.getElementById('questionsList');
        
        if (this.questions.length === 0) {
            container.innerHTML = '<p class="no-answers">No questions added yet.</p>';
            return;
        }

        container.innerHTML = this.questions.map((question, index) => {
            const date = new Date(question.date);
            const dateString = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            return `
                <div class="question-item">
                    <div class="question-item-content">
                        <div class="question-item-text">${this.escapeHtml(question.text)}</div>
                        <div class="question-item-date">${dateString}</div>
                    </div>
                    <button class="delete-btn" onclick="app.deleteQuestion('${question.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }

    displayAllAnswers() {
        const container = document.getElementById('allAnswers');
        const allDates = Object.keys(this.answers).sort().reverse();

        if (allDates.length === 0) {
            container.innerHTML = '<p class="no-answers">No answers submitted yet.</p>';
            return;
        }

        container.innerHTML = allDates.map(date => {
            const question = this.questions.find(q => q.date === date) || this.getDefaultQuestion();
            const answers = this.answers[date] || [];

            if (answers.length === 0) return '';

            const dateObj = new Date(date);
            const dateString = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            return `
                <div class="answer-group">
                    <div class="answer-group-question">
                        ${dateString}: ${this.escapeHtml(question.text)}
                    </div>
                    <div class="answer-group-answers">
                        ${answers.map(answer => {
                            const time = new Date(answer.timestamp);
                            const timeString = time.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            });
                            return `
                                <div class="answer-card">
                                    <div class="answer-text">${this.escapeHtml(answer.text)}</div>
                                    <div class="answer-meta">
                                        <span>Submitted at ${timeString}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    addQuestion() {
        const questionText = document.getElementById('newQuestionInput').value.trim();
        const questionDate = document.getElementById('questionDate').value;

        if (!questionText) {
            alert('Please enter a question.');
            return;
        }

        if (!questionDate) {
            alert('Please select a date.');
            return;
        }

        const question = {
            id: Date.now().toString(),
            text: questionText,
            date: questionDate,
            number: this.questions.length + 1
        };

        this.questions.push(question);
        this.questions.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.saveQuestions();

        // Clear input
        document.getElementById('newQuestionInput').value = '';
        document.getElementById('questionDate').value = this.getTodayKey();

        // Refresh display
        this.displayQuestionsList();
        this.displayTodayQuestion();
    }

    deleteQuestion(questionId) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.saveQuestions();
            this.displayQuestionsList();
            this.displayTodayQuestion();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // LocalStorage methods
    loadQuestions() {
        const stored = localStorage.getItem('fountainVitality_questions');
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize with pharmacy/healthcare-focused questions for the next 30 days
        const today = new Date();
        const questions = [];
        const questionPool = [
            'What workflow improvement did you implement or notice today?',
            'How did you ensure medication accuracy in today\'s operations?',
            'What patient interaction stood out to you today and why?',
            'What is one thing you learned about our pharmacy processes today?',
            'How did you contribute to team efficiency today?',
            'What challenge did you overcome in today\'s workflow?',
            'How did you ensure patient safety in your work today?',
            'What collaboration helped solve a problem today?',
            'What best practice did you follow or share with the team today?',
            'How did you handle a complex prescription or order today?',
            'What communication strategy worked well for you today?',
            'What quality check or verification did you perform today?',
            'How did you prioritize tasks to improve patient care today?',
            'What feedback did you receive or give that improved operations?',
            'What system or tool helped you be more efficient today?',
            'How did you ensure compliance with pharmacy protocols today?',
            'What patient concern did you help resolve today?',
            'What cross-functional collaboration improved a process today?',
            'What detail did you catch that prevented a potential issue?',
            'How did you balance speed and accuracy in your work today?',
            'What training or knowledge sharing happened in your team today?',
            'What process did you streamline or optimize today?',
            'How did you maintain quality standards under pressure today?',
            'What patient outcome are you most proud of from today?',
            'What technology or resource helped you serve patients better today?',
            'How did you ensure proper documentation today?',
            'What proactive step did you take to prevent an issue?',
            'What teamwork moment made a difference today?',
            'How did you adapt when a process didn\'t go as planned?',
            'What positive change did you observe in our operations today?'
        ];
        
        // Create questions for the next 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const questionIndex = i % questionPool.length;
            
            questions.push({
                id: `pregen_${i}`,
                text: questionPool[questionIndex],
                date: dateKey,
                number: i + 1
            });
        }
        
        return questions;
    }

    saveQuestions() {
        localStorage.setItem('fountainVitality_questions', JSON.stringify(this.questions));
    }

    loadAnswers() {
        const stored = localStorage.getItem('fountainVitality_answers');
        return stored ? JSON.parse(stored) : {};
    }

    saveAnswers() {
        localStorage.setItem('fountainVitality_answers', JSON.stringify(this.answers));
    }
}

// Initialize the application
const app = new QuestionOfTheDay();

