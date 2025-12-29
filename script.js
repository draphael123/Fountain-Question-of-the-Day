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
        // Questions based on Fountain Workflows document - specific workflows and processes
        const defaultQuestions = [
            'How did you handle a Pharmacy Hub workflow today, and what went well?',
            'What did you learn about the Absolute Pharmacy workflow process today?',
            'How did you navigate the Belmar Pharmacy workflow today?',
            'What challenge did you face with a General Refill request today?',
            'How did you handle an Early Refill request following our workflow?',
            'What did you learn about the Compliance Workflow today?',
            'How did you process a Refunds Workflow request today?',
            'What experience did you have with the Quest Diagnostics workflow today?',
            'How did you use the Getlabs workflow to help a patient today?',
            'What did you learn about the Sharing Medical Info workflow today?',
            'How did you handle a Syringes workflow request today?',
            'What improvement did you notice in the Intercom workflow today?',
            'How did you use Retool to streamline a process today?',
            'What did you learn about the Akute workflow today?',
            'How did you handle a Labcorp workflow request today?',
            'What challenge did you overcome in the Cancellation process today?',
            'How did you handle a patient upset with a long order delay today?',
            'What did you learn about routing orders through our pharmacy workflows today?',
            'How did you ensure proper handling of Semaglutide, Enclomiphene, or Testosterone Cypionate orders today?',
            'What did you learn about the Referral process today?',
            'How did you handle a Trustpilot workflow request today?',
            'What did you learn about the WhatsApp workflow today?',
            'How did you process an Itemized Receipt request today?',
            'What improvement did you make to a workflow process today?',
            'How did you handle a General Tech Issues workflow today?',
            'What did you learn about Controlled Substance handling today?',
            'How did you ensure compliance with our pharmacy protocols today?',
            'What patient communication through Intercom made a difference today?',
            'How did you handle a billing or Stripe-related workflow today?',
            'What workflow efficiency did you improve today?'
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
        // Initialize with questions based on Fountain Workflows document - specific workflows and processes
        const today = new Date();
        const questions = [];
        const questionPool = [
            // Pharmacy Workflows
            'How did you handle a Pharmacy Hub workflow today, and what went well?',
            'What did you learn about the Absolute Pharmacy workflow process today?',
            'How did you navigate the Belmar Pharmacy workflow today?',
            // Refill Processes
            'What challenge did you face with a General Refill request today?',
            'How did you handle an Early Refill request following our workflow?',
            'What did you learn about processing refills efficiently today?',
            // Compliance & Quality
            'What did you learn about the Compliance Workflow today?',
            'How did you ensure compliance with our pharmacy protocols today?',
            'What quality check did you perform in a workflow today?',
            // Financial & Billing
            'How did you process a Refunds Workflow request today?',
            'How did you handle a billing or Stripe-related workflow today?',
            'What did you learn about the Itemized Receipt process today?',
            // Lab Workflows
            'What experience did you have with the Quest Diagnostics workflow today?',
            'How did you use the Getlabs workflow to help a patient today?',
            'How did you handle a Labcorp workflow request today?',
            // Patient Communication
            'What did you learn about the Sharing Medical Info workflow today?',
            'What improvement did you notice in the Intercom workflow today?',
            'What patient communication through Intercom made a difference today?',
            'What did you learn about the WhatsApp workflow today?',
            // Medication & Supplies
            'How did you handle a Syringes workflow request today?',
            'What did you learn about handling Semaglutide orders today?',
            'How did you ensure proper handling of Enclomiphene or Testosterone Cypionate orders today?',
            'What did you learn about Controlled Substance handling today?',
            // Platform & Tools
            'How did you use Retool to streamline a process today?',
            'What did you learn about the Akute workflow today?',
            'What system or tool helped you be more efficient today?',
            // Order Management
            'How did you handle a patient upset with a long order delay today?',
            'What challenge did you overcome in the Cancellation process today?',
            'How did you handle routing orders through our pharmacy workflows today?',
            'What did you learn about order processing efficiency today?',
            // Other Workflows
            'What did you learn about the Referral process today?',
            'How did you handle a Trustpilot workflow request today?',
            'How did you handle a General Tech Issues workflow today?',
            // General Process Improvement
            'What workflow improvement did you implement or notice today?',
            'What process did you streamline or optimize today?',
            'How did you contribute to team efficiency today?',
            'What collaboration helped solve a problem today?',
            'What best practice did you follow or share with the team today?',
            'What detail did you catch that prevented a potential issue?',
            'How did you adapt when a workflow didn\'t go as planned today?'
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

