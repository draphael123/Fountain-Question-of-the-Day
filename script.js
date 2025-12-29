// Question of the Day Application
class QuestionOfTheDay {
    constructor() {
        this.questionPool = this.createQuestionPool();
        this.currentQuestionIndex = this.loadCurrentQuestionIndex();
        this.questions = this.loadQuestions(); // For admin panel custom questions
        this.answers = this.loadAnswers();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayCurrentQuestion();
        this.displayAnswers();
        this.setTodayDate();
    }

    setupEventListeners() {
        // Submit answer
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextQuestion();
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

    getCurrentQuestion() {
        return this.questionPool[this.currentQuestionIndex] || this.questionPool[0];
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
        } else {
            this.currentQuestionIndex = this.questionPool.length - 1; // Wrap to last question
        }
        this.saveCurrentQuestionIndex();
        this.displayCurrentQuestion();
        // Clear answer input when changing questions
        document.getElementById('answerInput').value = '';
        document.getElementById('answerStatus').style.display = 'none';
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questionPool.length - 1) {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex = 0; // Wrap to first question
        }
        this.saveCurrentQuestionIndex();
        this.displayCurrentQuestion();
        // Clear answer input when changing questions
        document.getElementById('answerInput').value = '';
        document.getElementById('answerStatus').style.display = 'none';
    }

    getCorrectAnswer(questionText) {
        // Map all 100 questions to their correct answers (with variations)
        const answerMap = {
            // Pharmacy Questions (1-20)
            'Which pharmacy serves as a backup for Semaglutide, Enclomiphene, and Testosterone Cypionate?': ['absolute', 'absolute pharmacy'],
            'True or False: Absolute Pharmacy requires signatures for delivery.': ['false', 'f', 'no'],
            'Which three states does Absolute Pharmacy NOT ship to?': ['va, al, ny', 'virginia, alabama, new york', 'va al ny', 'virginia alabama new york'],
            'Which pharmacies primarily fill Semaglutide, Enclomiphene, and Testosterone Cypionate?': ['pharmacy hub', 'curexa', 'pharmacy hub or curexa', 'pharmacy hub and curexa', 'curexa or pharmacy hub'],
            'True or False: We currently use Absolute Pharmacy for patient orders.': ['false', 'f', 'no'],
            'Why should Absolute Pharmacy only be used when partner pharmacies are unable to supply medications?': ['higher processing costs', 'processing costs are higher', 'costs are higher', 'more expensive', 'higher costs'],
            'What is the Absolute Rx Portal used for?': ['refills and clarification', 'refills', 'clarification', 'refills and clarification only'],
            'Which pharmacy requires signatures for delivery?': ['curexa', 'curexa pharmacy'],
            'Name the three medications that Absolute Pharmacy serves as backup for.': ['semaglutide, enclomiphene, testosterone cypionate', 'semaglutide enclomiphene testosterone cypionate'],
            'What is the primary purpose of the Pharmacy Hub workflow?': ['fill medications', 'fill prescriptions', 'primary pharmacy', 'medication fulfillment'],
            'What is the Belmar Pharmacy workflow used for?': ['belmar pharmacy', 'belmar', 'belmar orders'],
            'What should you remember about Absolute Pharmacy\'s processing costs?': ['higher', 'more expensive', 'costs are higher', 'higher processing costs'],
            'What is the difference between Absolute and Curexa regarding delivery signatures?': ['absolute no signature', 'curexa requires signature', 'absolute does not require', 'curexa requires'],
            'Which states are excluded from Absolute Pharmacy shipping?': ['va, al, ny', 'virginia, alabama, new york', 'va al ny'],
            'What is the primary reason Absolute Pharmacy should be used sparingly?': ['higher processing costs', 'processing costs are higher', 'costs are higher', 'more expensive'],
            'What should you do if an order is sent to Absolute Pharmacy?': ['error', 'it was done in error', 'contact', 'fix', 'correct'],
            'Which pharmacy has higher processing costs?': ['absolute', 'absolute pharmacy'],
            'Does Absolute Pharmacy ship to Virginia?': ['no', 'false', 'f'],
            'Does Absolute Pharmacy ship to Alabama?': ['no', 'false', 'f'],
            'Does Absolute Pharmacy ship to New York?': ['no', 'false', 'f'],
            // Order Management Questions (21-35)
            'In which order stages cannot orders be cancelled?': ['verification', 'shipping', 'verification and shipping', 'verification or shipping'],
            'What is the Cancellation workflow used for?': ['cancellations', 'cancel orders', 'order cancellations'],
            'What is the General Refill workflow for?': ['refills', 'general refills', 'refill requests'],
            'What is the Early Refill workflow for?': ['early refills', 'early refill requests'],
            'What is the purpose of the "Patients Upset With Long Order" workflow?': ['patient concerns', 'order delays', 'long orders', 'patient complaints'],
            'What happens when an order reaches the verification stage?': ['cannot cancel', 'no cancellation', 'verification'],
            'What happens when an order reaches the shipping stage?': ['cannot cancel', 'no cancellation', 'shipping'],
            'Can orders be cancelled during verification?': ['no', 'false', 'f', 'cannot'],
            'Can orders be cancelled during shipping?': ['no', 'false', 'f', 'cannot'],
            'What is the purpose of order routing?': ['routing', 'route orders', 'direct orders'],
            'What should you do when a patient is upset about order delays?': ['patients upset workflow', 'address concerns', 'help patient'],
            'What is the difference between General Refill and Early Refill?': ['timing', 'early vs general', 'refill timing'],
            'How do you handle order delays?': ['order delay workflow', 'address delays', 'communicate'],
            'What is the purpose of tracking order status?': ['track orders', 'monitor orders', 'order tracking'],
            'What information is needed for order cancellation?': ['order details', 'order information', 'cancellation info'],
            // Lab Workflows Questions (36-50)
            'Which workflow handles Quest Diagnostics lab orders?': ['quest diagnostics', 'quest diagnostics workflow', 'quest'],
            'What is the Getlabs workflow used for?': ['lab orders', 'labs', 'lab processing', 'getlabs'],
            'Which workflow handles Labcorp orders?': ['labcorp', 'labcorp workflow'],
            'What is the Labcorp Link workflow for?': ['labcorp link', 'labcorp', 'lab orders'],
            'What is the purpose of monitoring labs?': ['monitor labs', 'lab monitoring', 'track labs'],
            'How do you process Quest Diagnostics orders?': ['quest diagnostics workflow', 'quest workflow', 'quest'],
            'How do you process Getlabs orders?': ['getlabs workflow', 'getlabs'],
            'How do you process Labcorp orders?': ['labcorp workflow', 'labcorp'],
            'What is the difference between Quest Diagnostics and Labcorp workflows?': ['different labs', 'quest vs labcorp', 'lab providers'],
            'What information is needed for lab orders?': ['lab information', 'patient info', 'lab details'],
            'How do you track lab results?': ['lab monitoring', 'track results', 'monitor labs'],
            'What is the purpose of lab monitoring?': ['monitor labs', 'track labs', 'lab tracking'],
            'What should you do if lab results are delayed?': ['follow up', 'contact lab', 'check status'],
            'How do you handle lab order issues?': ['troubleshoot', 'resolve issues', 'lab support'],
            'What is the Labcorp Link used for?': ['labcorp link', 'labcorp access', 'lab orders'],
            // Communication Workflows Questions (51-65)
            'Which workflow handles sharing medical information?': ['sharing medical info', 'sharing medical information', 'medical info'],
            'What is the Intercom workflow used for?': ['intercom', 'intercom communication', 'customer communication'],
            'What is the WhatsApp workflow used for?': ['whatsapp', 'whatsapp communication', 'whatsapp messages'],
            'Which workflow handles Intercom phone calls?': ['intercom', 'intercom workflow', 'intercom phone calls'],
            'What is the purpose of the Routing Workflow?': ['routing', 'route messages', 'team routing'],
            'How do you handle patient communications through Intercom?': ['intercom workflow', 'intercom'],
            'How do you handle patient communications through WhatsApp?': ['whatsapp workflow', 'whatsapp'],
            'What is the difference between Intercom and WhatsApp workflows?': ['different platforms', 'intercom vs whatsapp', 'communication channels'],
            'When should you use the Sharing Medical Info workflow?': ['share medical info', 'medical information', 'when needed'],
            'What information can be shared through the medical info workflow?': ['medical information', 'patient info', 'health info'],
            'How do you route messages to the correct team?': ['routing workflow', 'team routing', 'route messages'],
            'What is the purpose of team routing?': ['route to team', 'team assignment', 'routing'],
            'How do you handle urgent patient communications?': ['urgent', 'priority', 'escalate'],
            'What is the Intercom phone call workflow for?': ['phone calls', 'intercom calls', 'calls'],
            'How do you document patient communications?': ['document', 'record', 'log'],
            // Medication & Supplies Questions (66-75)
            'What is the Syringes workflow used for?': ['syringes', 'syringe orders', 'syringe requests'],
            'What is the General Medications workflow for?': ['medications', 'general medications', 'medication orders'],
            'What does the Controlled Substance workflow handle?': ['controlled substances', 'controlled substance', 'controlled substance orders'],
            'Which medications are primarily filled through Pharmacy Hub or Curexa?': ['semaglutide', 'enclomiphene', 'testosterone cypionate', 'semaglutide enclomiphene testosterone cypionate'],
            'How do you handle syringe requests?': ['syringes workflow', 'syringe workflow'],
            'How do you handle controlled substance orders?': ['controlled substance workflow', 'controlled substances'],
            'What is the difference between general medications and controlled substances?': ['controlled vs general', 'substance type', 'regulation'],
            'What information is needed for medication orders?': ['medication info', 'prescription', 'order details'],
            'How do you verify medication orders?': ['verify', 'verification', 'check'],
            'What is the purpose of the medication management workflow?': ['manage medications', 'medication management', 'medications'],
            // Platform & Tools Questions (76-85)
            'Which platform workflow uses Retool?': ['retool', 'retool workflow'],
            'What is the Akute workflow used for?': ['akute', 'akute platform'],
            'What is the Retool workflow used for?': ['retool', 'retool platform'],
            'Which workflow handles General Tech Issues?': ['general tech issues', 'tech issues', 'general tech issues workflow'],
            'How do you use Retool in workflows?': ['retool', 'retool platform', 'retool workflow'],
            'What is the Akute platform used for?': ['akute', 'akute platform'],
            'How do you handle general tech issues?': ['tech issues workflow', 'general tech issues'],
            'What tools are available in Retool?': ['retool tools', 'retool features', 'retool'],
            'What is the purpose of platform workflows?': ['platform', 'tools', 'workflow management'],
            'How do you troubleshoot tech issues?': ['troubleshoot', 'tech support', 'resolve'],
            // Compliance & Quality Questions (86-90)
            'What is the purpose of the Compliance Workflow?': ['compliance', 'ensure compliance', 'compliance protocols'],
            'What does the Compliance Workflow ensure?': ['compliance', 'regulatory compliance', 'compliance protocols'],
            'How do you ensure compliance with regulations?': ['compliance workflow', 'compliance'],
            'What is checked in the compliance workflow?': ['compliance checks', 'regulations', 'compliance'],
            'Why is compliance important?': ['regulations', 'legal', 'requirements'],
            // Financial & Billing Questions (91-95)
            'Which workflow handles refund requests?': ['refunds', 'refunds workflow', 'stripe refunds'],
            'What is the Stripe Refunds Workflow for?': ['refunds', 'stripe refunds', 'refund processing'],
            'What is the Itemized Receipt process for?': ['itemized receipts', 'receipts', 'itemized receipt'],
            'What is the Billing workflow used for?': ['billing', 'billing issues', 'payment processing'],
            'How do you process refunds?': ['refunds workflow', 'stripe refunds', 'refund process'],
            // Other Workflows Questions (96-100)
            'What is the Referral process used for?': ['referrals', 'referral process', 'referral requests'],
            'Which workflow handles Trustpilot requests?': ['trustpilot', 'trustpilot workflow'],
            'What is the purpose of the Trustpilot workflow?': ['trustpilot', 'reviews', 'customer reviews'],
            'What does the "Unknown Leads" tag folder indicate?': ['unknown leads', 'unidentified leads', 'new leads'],
            'What is the "Critical Escalations" tag folder for?': ['critical escalations', 'escalations', 'urgent issues']
        };
        
        return answerMap[questionText] || null;
    }

    checkAnswer(userAnswer, correctAnswers) {
        if (!correctAnswers || correctAnswers.length === 0) return null;
        
        const normalizedUserAnswer = userAnswer.toLowerCase().trim();
        
        // Check for exact match or contains match
        for (const correctAnswer of correctAnswers) {
            const normalizedCorrect = correctAnswer.toLowerCase().trim();
            
            // Exact match
            if (normalizedUserAnswer === normalizedCorrect) {
                return true;
            }
            
            // Contains match (for longer answers)
            if (normalizedUserAnswer.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUserAnswer)) {
                return true;
            }
            
            // Check if all key words are present (for multi-word answers)
            const correctWords = normalizedCorrect.split(/[\s,]+/).filter(w => w.length > 2);
            const userWords = normalizedUserAnswer.split(/[\s,]+/).filter(w => w.length > 2);
            
            if (correctWords.length > 0) {
                const matchingWords = correctWords.filter(word => 
                    userWords.some(uw => uw.includes(word) || word.includes(uw))
                );
                
                // If most key words match, consider it correct
                if (matchingWords.length >= Math.ceil(correctWords.length * 0.7)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    createQuestionPool() {
        // Create a pool of 100 trivia questions based on Fountain Workflows document
        const questionTexts = [
            // Pharmacy Questions (1-20)
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
            'What should you remember about Absolute Pharmacy\'s processing costs?',
            'What is the difference between Absolute and Curexa regarding delivery signatures?',
            'Which states are excluded from Absolute Pharmacy shipping?',
            'What is the primary reason Absolute Pharmacy should be used sparingly?',
            'What should you do if an order is sent to Absolute Pharmacy?',
            'Which pharmacy has higher processing costs?',
            'Does Absolute Pharmacy ship to Virginia?',
            'Does Absolute Pharmacy ship to Alabama?',
            'Does Absolute Pharmacy ship to New York?',
            // Order Management Questions (21-35)
            'In which order stages cannot orders be cancelled?',
            'What is the Cancellation workflow used for?',
            'What is the General Refill workflow for?',
            'What is the Early Refill workflow for?',
            'What is the purpose of the "Patients Upset With Long Order" workflow?',
            'What happens when an order reaches the verification stage?',
            'What happens when an order reaches the shipping stage?',
            'Can orders be cancelled during verification?',
            'Can orders be cancelled during shipping?',
            'What is the purpose of order routing?',
            'What should you do when a patient is upset about order delays?',
            'What is the difference between General Refill and Early Refill?',
            'How do you handle order delays?',
            'What is the purpose of tracking order status?',
            'What information is needed for order cancellation?',
            // Lab Workflows Questions (36-50)
            'Which workflow handles Quest Diagnostics lab orders?',
            'What is the Getlabs workflow used for?',
            'Which workflow handles Labcorp orders?',
            'What is the Labcorp Link workflow for?',
            'What is the purpose of monitoring labs?',
            'How do you process Quest Diagnostics orders?',
            'How do you process Getlabs orders?',
            'How do you process Labcorp orders?',
            'What is the difference between Quest Diagnostics and Labcorp workflows?',
            'What information is needed for lab orders?',
            'How do you track lab results?',
            'What is the purpose of lab monitoring?',
            'What should you do if lab results are delayed?',
            'How do you handle lab order issues?',
            'What is the Labcorp Link used for?',
            // Communication Workflows Questions (51-65)
            'Which workflow handles sharing medical information?',
            'What is the Intercom workflow used for?',
            'What is the WhatsApp workflow used for?',
            'Which workflow handles Intercom phone calls?',
            'What is the purpose of the Routing Workflow?',
            'How do you handle patient communications through Intercom?',
            'How do you handle patient communications through WhatsApp?',
            'What is the difference between Intercom and WhatsApp workflows?',
            'When should you use the Sharing Medical Info workflow?',
            'What information can be shared through the medical info workflow?',
            'How do you route messages to the correct team?',
            'What is the purpose of team routing?',
            'How do you handle urgent patient communications?',
            'What is the Intercom phone call workflow for?',
            'How do you document patient communications?',
            // Medication & Supplies Questions (66-75)
            'What is the Syringes workflow used for?',
            'What is the General Medications workflow for?',
            'What does the Controlled Substance workflow handle?',
            'Which medications are primarily filled through Pharmacy Hub or Curexa?',
            'How do you handle syringe requests?',
            'How do you handle controlled substance orders?',
            'What is the difference between general medications and controlled substances?',
            'What information is needed for medication orders?',
            'How do you verify medication orders?',
            'What is the purpose of the medication management workflow?',
            // Platform & Tools Questions (76-85)
            'Which platform workflow uses Retool?',
            'What is the Akute workflow used for?',
            'What is the Retool workflow used for?',
            'Which workflow handles General Tech Issues?',
            'How do you use Retool in workflows?',
            'What is the Akute platform used for?',
            'How do you handle general tech issues?',
            'What tools are available in Retool?',
            'What is the purpose of platform workflows?',
            'How do you troubleshoot tech issues?',
            // Compliance & Quality Questions (86-90)
            'What is the purpose of the Compliance Workflow?',
            'What does the Compliance Workflow ensure?',
            'How do you ensure compliance with regulations?',
            'What is checked in the compliance workflow?',
            'Why is compliance important?',
            // Financial & Billing Questions (91-95)
            'Which workflow handles refund requests?',
            'What is the Stripe Refunds Workflow for?',
            'What is the Itemized Receipt process for?',
            'What is the Billing workflow used for?',
            'How do you process refunds?',
            // Other Workflows Questions (96-100)
            'What is the Referral process used for?',
            'Which workflow handles Trustpilot requests?',
            'What is the purpose of the Trustpilot workflow?',
            'What does the "Unknown Leads" tag folder indicate?',
            'What is the "Critical Escalations" tag folder for?'
        ];

        return questionTexts.map((text, index) => ({
            id: `q${index + 1}`,
            text: text,
            number: index + 1
        }));
    }

    loadCurrentQuestionIndex() {
        const stored = localStorage.getItem('fountainVitality_currentQuestionIndex');
        return stored ? parseInt(stored, 10) : 0;
    }

    saveCurrentQuestionIndex() {
        localStorage.setItem('fountainVitality_currentQuestionIndex', this.currentQuestionIndex.toString());
    }

    displayCurrentQuestion() {
        const question = this.getCurrentQuestion();
        document.getElementById('questionText').textContent = question.text;
        document.getElementById('questionNumber').textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questionPool.length}`;
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = false;
        document.getElementById('nextBtn').disabled = false;
        
        // Refresh answers for current question
        this.displayAnswers();
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

        const question = this.getCurrentQuestion();
        const questionId = question.id;
        
        // Check if answer is correct
        const correctAnswers = this.getCorrectAnswer(question.text);
        const isCorrect = this.checkAnswer(answerText, correctAnswers);
        
        if (!this.answers[questionId]) {
            this.answers[questionId] = [];
        }

        const answer = {
            id: Date.now(),
            text: answerText,
            timestamp: new Date().toISOString(),
            questionId: questionId,
            isCorrect: isCorrect,
            correctAnswer: correctAnswers ? correctAnswers[0] : null
        };

        this.answers[questionId].push(answer);
        this.saveAnswers();

        // Clear input and show result
        document.getElementById('answerInput').value = '';
        
        if (isCorrect === true) {
            statusDiv.className = 'answer-status success';
            statusDiv.innerHTML = '✓ <strong>Correct!</strong> Great job!';
        } else if (isCorrect === false) {
            statusDiv.className = 'answer-status error';
            const correctAnswerText = correctAnswers ? `The correct answer is: <strong>${correctAnswers[0]}</strong>` : '';
            statusDiv.innerHTML = `✗ <strong>Incorrect.</strong> ${correctAnswerText}`;
        } else {
            // No answer key available (for custom questions)
            statusDiv.className = 'answer-status success';
            statusDiv.textContent = 'Your answer has been submitted successfully!';
        }
        
        statusDiv.style.display = 'block';

        // Hide status after 5 seconds (longer for trivia feedback)
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);

        // Refresh answers display
        this.displayAnswers();
    }

    displayAnswers() {
        const question = this.getCurrentQuestion();
        const questionId = question.id;
        const container = document.getElementById('answersContainer');
        const answers = this.answers[questionId] || [];

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

            let correctnessBadge = '';
            if (answer.isCorrect === true) {
                correctnessBadge = '<span class="correct-badge">✓ Correct</span>';
            } else if (answer.isCorrect === false) {
                correctnessBadge = '<span class="incorrect-badge">✗ Incorrect</span>';
            }

            return `
                <div class="answer-card">
                    <div class="answer-text">${this.escapeHtml(answer.text)}</div>
                    <div class="answer-meta">
                        <span>Submitted at ${timeString}</span>
                        ${correctnessBadge}
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
        const allQuestionIds = Object.keys(this.answers).sort();

        if (allQuestionIds.length === 0) {
            container.innerHTML = '<p class="no-answers">No answers submitted yet.</p>';
            return;
        }

        container.innerHTML = allQuestionIds.map(questionId => {
            const question = this.questionPool.find(q => q.id === questionId);
            const answers = this.answers[questionId] || [];

            if (answers.length === 0 || !question) return '';

            return `
                <div class="answer-group">
                    <div class="answer-group-question">
                        Question ${question.number}: ${this.escapeHtml(question.text)}
                    </div>
                    <div class="answer-group-answers">
                        ${answers.map(answer => {
                            const time = new Date(answer.timestamp);
                            const timeString = time.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                            });

                            let correctnessBadge = '';
                            if (answer.isCorrect === true) {
                                correctnessBadge = '<span class="correct-badge">✓ Correct</span>';
                            } else if (answer.isCorrect === false) {
                                correctnessBadge = '<span class="incorrect-badge">✗ Incorrect</span>';
                            }

                            return `
                                <div class="answer-card">
                                    <div class="answer-text">${this.escapeHtml(answer.text)}</div>
                                    <div class="answer-meta">
                                        <span>Submitted at ${timeString}</span>
                                        ${correctnessBadge}
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
        this.displayCurrentQuestion();
    }

    deleteQuestion(questionId) {
        if (confirm('Are you sure you want to delete this question?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.saveQuestions();
            this.displayQuestionsList();
            this.displayCurrentQuestion();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // LocalStorage methods
    loadQuestions() {
        // This is for custom questions added via admin panel (separate from the 100-question pool)
        const stored = localStorage.getItem('fountainVitality_questions');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
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

