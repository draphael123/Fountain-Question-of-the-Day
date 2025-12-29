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
        // Trivia questions based on Fountain Workflows document - testing knowledge of workflows and processes
        const defaultQuestions = [
            'Which pharmacy serves as a backup for Semaglutide, Enclomiphene, and Testosterone Cypionate?',
            'True or False: Absolute Pharmacy requires signatures for delivery.',
            'Which three states does Absolute Pharmacy NOT ship to?',
            'Which pharmacies primarily fill Semaglutide, Enclomiphene, and Testosterone Cypionate?',
            'True or False: We currently use Absolute Pharmacy for patient orders.',
            'Why should Absolute Pharmacy only be used when partner pharmacies are unable to supply medications?',
            'What is the Absolute Rx Portal used for?',
            'Which pharmacy requires signatures for delivery?',
            'Name the three medications that Absolute Pharmacy serves as backup for.',
            'In which order stages cannot orders be cancelled?',
            'What is the primary purpose of the Pharmacy Hub workflow?',
            'Which workflow handles Quest Diagnostics lab orders?',
            'What is the Getlabs workflow used for?',
            'Which workflow handles sharing medical information?',
            'What is the Syringes workflow used for?',
            'Which platform workflow uses Retool?',
            'What is the Akute workflow used for?',
            'Which workflow handles Labcorp orders?',
            'What is the purpose of the Compliance Workflow?',
            'Which workflow handles refund requests?',
            'What is the General Refill workflow for?',
            'What is the Early Refill workflow for?',
            'Which workflow handles cancellations?',
            'What is the Referral process used for?',
            'Which workflow handles Trustpilot requests?',
            'What is the WhatsApp workflow used for?',
            'What is the Itemized Receipt process for?',
            'Which workflow handles General Tech Issues?',
            'What does the Controlled Substance workflow handle?',
            'Which workflow is used for Intercom phone calls?'
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
        // Initialize with trivia questions based on Fountain Workflows document - testing knowledge
        const today = new Date();
        const questions = [];
        const questionPool = [
            // Pharmacy Trivia
            'Which pharmacy serves as a backup for Semaglutide, Enclomiphene, and Testosterone Cypionate?',
            'True or False: Absolute Pharmacy requires signatures for delivery.',
            'Which three states does Absolute Pharmacy NOT ship to?',
            'Which pharmacies primarily fill Semaglutide, Enclomiphene, and Testosterone Cypionate?',
            'True or False: We currently use Absolute Pharmacy for patient orders.',
            'Why should Absolute Pharmacy only be used when partner pharmacies are unable to supply medications?',
            'What is the Absolute Rx Portal used for?',
            'Which pharmacy requires signatures for delivery?',
            'Name the three medications that Absolute Pharmacy serves as backup for.',
            'What is the primary purpose of the Pharmacy Hub workflow?',
            'What is the Belmar Pharmacy workflow used for?',
            // Order Management Trivia
            'In which order stages cannot orders be cancelled?',
            'What should you do if an order is sent to Absolute Pharmacy?',
            'What is the Cancellation workflow used for?',
            'What is the General Refill workflow for?',
            'What is the Early Refill workflow for?',
            'What is the purpose of the "Patients Upset With Long Order" workflow?',
            // Lab Workflows Trivia
            'Which workflow handles Quest Diagnostics lab orders?',
            'What is the Getlabs workflow used for?',
            'Which workflow handles Labcorp orders?',
            'What is the Labcorp Link workflow for?',
            'What is the purpose of monitoring labs?',
            // Communication Workflows Trivia
            'Which workflow handles sharing medical information?',
            'What is the Intercom workflow used for?',
            'What is the WhatsApp workflow used for?',
            'Which workflow handles Intercom phone calls?',
            'What is the purpose of the Routing Workflow?',
            // Medication & Supplies Trivia
            'What is the Syringes workflow used for?',
            'What is the General Medications workflow for?',
            'What does the Controlled Substance workflow handle?',
            'Which medications are primarily filled through Pharmacy Hub or Curexa?',
            // Platform & Tools Trivia
            'Which platform workflow uses Retool?',
            'What is the Akute workflow used for?',
            'What is the Retool workflow used for?',
            'Which workflow handles General Tech Issues?',
            // Compliance & Quality Trivia
            'What is the purpose of the Compliance Workflow?',
            'What does the Compliance Workflow ensure?',
            // Financial & Billing Trivia
            'Which workflow handles refund requests?',
            'What is the Stripe Refunds Workflow for?',
            'What is the Itemized Receipt process for?',
            'What is the Billing workflow used for?',
            // Other Workflows Trivia
            'What is the Referral process used for?',
            'Which workflow handles Trustpilot requests?',
            'What is the purpose of the Trustpilot workflow?',
            'What does the "Unknown Leads" tag folder indicate?',
            'What is the "Critical Escalations" tag folder for?',
            'What is the "Extra Medication" tag folder used for?',
            // Process Knowledge Trivia
            'What should you remember about Absolute Pharmacy\'s processing costs?',
            'What is the difference between Absolute and Curexa regarding delivery signatures?',
            'Which states are excluded from Absolute Pharmacy shipping?',
            'What is the primary reason Absolute Pharmacy should be used sparingly?'
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

