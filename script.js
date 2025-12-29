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
        // Clear selection when changing questions
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('submitBtn').disabled = true;
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
        // Clear selection when changing questions
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('submitBtn').disabled = true;
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
        // Create a pool of 100 multiple choice questions based on Fountain Workflows document
        const questions = [
            // Pharmacy Questions (1-20)
            {
                text: 'Which pharmacy serves as a backup for Semaglutide, Enclomiphene, and Testosterone Cypionate?',
                options: ['Absolute Pharmacy', 'Curexa Pharmacy', 'Pharmacy Hub', 'Belmar Pharmacy'],
                correct: 0
            },
            {
                text: 'Does Absolute Pharmacy require signatures for delivery?',
                options: ['Yes', 'No'],
                correct: 1
            },
            {
                text: 'Which three states does Absolute Pharmacy NOT ship to?',
                options: ['VA, AL, NY', 'CA, TX, FL', 'NY, CA, TX', 'FL, AL, VA'],
                correct: 0
            },
            {
                text: 'Which pharmacies primarily fill Semaglutide, Enclomiphene, and Testosterone Cypionate?',
                options: ['Pharmacy Hub and Curexa', 'Absolute and Belmar', 'Curexa only', 'Pharmacy Hub only'],
                correct: 0
            },
            {
                text: 'Do we currently use Absolute Pharmacy for patient orders?',
                options: ['Yes', 'No'],
                correct: 1
            },
            {
                text: 'Why should Absolute Pharmacy only be used when partner pharmacies are unable to supply medications?',
                options: ['Higher processing costs', 'Slower delivery', 'Limited medications', 'Poor quality'],
                correct: 0
            },
            {
                text: 'What is the Absolute Rx Portal used for?',
                options: ['Refills and clarification only', 'New orders', 'Billing', 'Customer service'],
                correct: 0
            },
            {
                text: 'Which pharmacy requires signatures for delivery?',
                options: ['Curexa', 'Absolute', 'Pharmacy Hub', 'Belmar'],
                correct: 0
            },
            {
                text: 'Which medications does Absolute Pharmacy serve as backup for?',
                options: ['Semaglutide, Enclomiphene, Testosterone Cypionate', 'Only Semaglutide', 'Only Testosterone', 'All medications'],
                correct: 0
            },
            {
                text: 'What is the primary purpose of the Pharmacy Hub workflow?',
                options: ['Fill medications', 'Handle refunds', 'Process labs', 'Manage billing'],
                correct: 0
            },
            {
                text: 'What is the Belmar Pharmacy workflow used for?',
                options: ['Belmar pharmacy orders', 'Lab orders', 'Refunds', 'Billing'],
                correct: 0
            },
            {
                text: 'Are Absolute Pharmacy\'s processing costs higher than partner pharmacies?',
                options: ['Yes', 'No'],
                correct: 0
            },
            {
                text: 'What is the difference between Absolute and Curexa regarding delivery signatures?',
                options: ['Absolute does not require, Curexa requires', 'Both require', 'Neither requires', 'Curexa does not require'],
                correct: 0
            },
            {
                text: 'Which states are excluded from Absolute Pharmacy shipping?',
                options: ['VA, AL, NY', 'CA, TX, FL', 'All states', 'None'],
                correct: 0
            },
            {
                text: 'What is the primary reason Absolute Pharmacy should be used sparingly?',
                options: ['Higher processing costs', 'Slower service', 'Limited availability', 'Quality issues'],
                correct: 0
            },
            {
                text: 'If an order is sent to Absolute Pharmacy, what should you do?',
                options: ['It was done in error - correct it', 'Process normally', 'Contact patient', 'Ignore it'],
                correct: 0
            },
            {
                text: 'Which pharmacy has higher processing costs?',
                options: ['Absolute', 'Curexa', 'Pharmacy Hub', 'Belmar'],
                correct: 0
            },
            {
                text: 'Does Absolute Pharmacy ship to Virginia?',
                options: ['No', 'Yes'],
                correct: 0
            },
            {
                text: 'Does Absolute Pharmacy ship to Alabama?',
                options: ['No', 'Yes'],
                correct: 0
            },
            {
                text: 'Does Absolute Pharmacy ship to New York?',
                options: ['No', 'Yes'],
                correct: 0
            },
            // Order Management Questions (21-35)
            {
                text: 'In which order stages cannot orders be cancelled?',
                options: ['Verification and shipping', 'Pending only', 'All stages', 'None'],
                correct: 0
            },
            {
                text: 'What is the Cancellation workflow used for?',
                options: ['Cancel orders', 'Process refunds', 'Handle delays', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the General Refill workflow for?',
                options: ['Process refill requests', 'Handle new orders', 'Manage billing', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the Early Refill workflow for?',
                options: ['Process early refill requests', 'Handle cancellations', 'Manage labs', 'Track orders'],
                correct: 0
            },
            {
                text: 'What is the purpose of the "Patients Upset With Long Order" workflow?',
                options: ['Handle patient concerns about delays', 'Process refunds', 'Cancel orders', 'Track shipments'],
                correct: 0
            },
            {
                text: 'Can orders be cancelled during verification?',
                options: ['No', 'Yes'],
                correct: 0
            },
            {
                text: 'Can orders be cancelled during shipping?',
                options: ['No', 'Yes'],
                correct: 0
            },
            {
                text: 'What is the purpose of order routing?',
                options: ['Direct orders to correct team', 'Process payments', 'Track shipments', 'Handle refunds'],
                correct: 0
            },
            {
                text: 'What should you do when a patient is upset about order delays?',
                options: ['Use "Patients Upset With Long Order" workflow', 'Cancel the order', 'Refund immediately', 'Ignore the concern'],
                correct: 0
            },
            {
                text: 'What is the difference between General Refill and Early Refill?',
                options: ['Timing of refill request', 'Medication type', 'Pharmacy used', 'None'],
                correct: 0
            },
            {
                text: 'What is the purpose of tracking order status?',
                options: ['Monitor order progress', 'Process payments', 'Handle refunds', 'Cancel orders'],
                correct: 0
            },
            {
                text: 'What information is needed for order cancellation?',
                options: ['Order details', 'Patient payment info', 'Shipping address', 'Medication type'],
                correct: 0
            },
            {
                text: 'What happens when an order reaches the verification stage?',
                options: ['Cannot be cancelled', 'Can be cancelled', 'Automatically ships', 'Requires payment'],
                correct: 0
            },
            {
                text: 'What happens when an order reaches the shipping stage?',
                options: ['Cannot be cancelled', 'Can be cancelled', 'Requires signature', 'Needs verification'],
                correct: 0
            },
            {
                text: 'How do you handle order delays?',
                options: ['Use appropriate delay workflow', 'Cancel order', 'Refund immediately', 'Ignore'],
                correct: 0
            },
            // Lab Workflows Questions (36-50)
            {
                text: 'Which workflow handles Quest Diagnostics lab orders?',
                options: ['Quest Diagnostics workflow', 'Getlabs workflow', 'Labcorp workflow', 'General lab workflow'],
                correct: 0
            },
            {
                text: 'What is the Getlabs workflow used for?',
                options: ['Process Getlabs lab orders', 'Handle Quest orders', 'Manage Labcorp', 'Track all labs'],
                correct: 0
            },
            {
                text: 'Which workflow handles Labcorp orders?',
                options: ['Labcorp workflow', 'Quest workflow', 'Getlabs workflow', 'General lab workflow'],
                correct: 0
            },
            {
                text: 'What is the Labcorp Link workflow for?',
                options: ['Access Labcorp orders', 'Process Quest orders', 'Handle Getlabs', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the purpose of monitoring labs?',
                options: ['Track lab results and orders', 'Process payments', 'Handle refunds', 'Cancel orders'],
                correct: 0
            },
            {
                text: 'How do you process Quest Diagnostics orders?',
                options: ['Use Quest Diagnostics workflow', 'Use Getlabs workflow', 'Use Labcorp workflow', 'General process'],
                correct: 0
            },
            {
                text: 'How do you process Getlabs orders?',
                options: ['Use Getlabs workflow', 'Use Quest workflow', 'Use Labcorp workflow', 'General process'],
                correct: 0
            },
            {
                text: 'How do you process Labcorp orders?',
                options: ['Use Labcorp workflow', 'Use Quest workflow', 'Use Getlabs workflow', 'General process'],
                correct: 0
            },
            {
                text: 'What is the difference between Quest Diagnostics and Labcorp workflows?',
                options: ['Different lab providers', 'Same process', 'Different medications', 'None'],
                correct: 0
            },
            {
                text: 'What information is needed for lab orders?',
                options: ['Lab and patient information', 'Payment info only', 'Shipping address', 'Medication type'],
                correct: 0
            },
            {
                text: 'How do you track lab results?',
                options: ['Through lab monitoring', 'Via email only', 'Phone calls', 'Not tracked'],
                correct: 0
            },
            {
                text: 'What is the purpose of lab monitoring?',
                options: ['Track lab results and status', 'Process payments', 'Handle refunds', 'Cancel orders'],
                correct: 0
            },
            {
                text: 'What should you do if lab results are delayed?',
                options: ['Follow up with lab provider', 'Cancel order', 'Refund patient', 'Ignore'],
                correct: 0
            },
            {
                text: 'How do you handle lab order issues?',
                options: ['Troubleshoot using lab workflow', 'Cancel immediately', 'Refund', 'Ignore'],
                correct: 0
            },
            {
                text: 'What is the Labcorp Link used for?',
                options: ['Access Labcorp lab orders', 'Process payments', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            // Communication Workflows Questions (51-65)
            {
                text: 'Which workflow handles sharing medical information?',
                options: ['Sharing Medical Info workflow', 'Intercom workflow', 'WhatsApp workflow', 'General communication'],
                correct: 0
            },
            {
                text: 'What is the Intercom workflow used for?',
                options: ['Patient communications via Intercom', 'Process orders', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the WhatsApp workflow used for?',
                options: ['Patient communications via WhatsApp', 'Process orders', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            {
                text: 'Which workflow handles Intercom phone calls?',
                options: ['Intercom workflow', 'WhatsApp workflow', 'General communication', 'Billing workflow'],
                correct: 0
            },
            {
                text: 'What is the purpose of the Routing Workflow?',
                options: ['Route messages to correct team', 'Process payments', 'Handle refunds', 'Track orders'],
                correct: 0
            },
            {
                text: 'How do you handle patient communications through Intercom?',
                options: ['Use Intercom workflow', 'Use WhatsApp workflow', 'Email only', 'Phone only'],
                correct: 0
            },
            {
                text: 'How do you handle patient communications through WhatsApp?',
                options: ['Use WhatsApp workflow', 'Use Intercom workflow', 'Email only', 'Phone only'],
                correct: 0
            },
            {
                text: 'What is the difference between Intercom and WhatsApp workflows?',
                options: ['Different communication platforms', 'Same platform', 'Different medications', 'None'],
                correct: 0
            },
            {
                text: 'When should you use the Sharing Medical Info workflow?',
                options: ['When sharing medical information', 'For all communications', 'Only for refunds', 'Never'],
                correct: 0
            },
            {
                text: 'What information can be shared through the medical info workflow?',
                options: ['Medical information', 'Payment info', 'Shipping addresses', 'All information'],
                correct: 0
            },
            {
                text: 'How do you route messages to the correct team?',
                options: ['Use Routing Workflow', 'Email directly', 'Phone call', 'Ignore'],
                correct: 0
            },
            {
                text: 'What is the purpose of team routing?',
                options: ['Direct messages to appropriate team', 'Process payments', 'Handle refunds', 'Track orders'],
                correct: 0
            },
            {
                text: 'How do you handle urgent patient communications?',
                options: ['Escalate appropriately', 'Ignore', 'Delay response', 'Auto-reply'],
                correct: 0
            },
            {
                text: 'What is the Intercom phone call workflow for?',
                options: ['Handle Intercom phone calls', 'Process orders', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            {
                text: 'How do you document patient communications?',
                options: ['Record in appropriate workflow', 'Email only', 'Not documented', 'Phone notes only'],
                correct: 0
            },
            // Medication & Supplies Questions (66-75)
            {
                text: 'What is the Syringes workflow used for?',
                options: ['Handle syringe requests', 'Process medications', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the General Medications workflow for?',
                options: ['Handle general medication orders', 'Process labs', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What does the Controlled Substance workflow handle?',
                options: ['Controlled substance orders', 'General medications', 'Labs', 'Refunds'],
                correct: 0
            },
            {
                text: 'Which medications are primarily filled through Pharmacy Hub or Curexa?',
                options: ['Semaglutide, Enclomiphene, Testosterone Cypionate', 'All medications', 'Only Semaglutide', 'None'],
                correct: 0
            },
            {
                text: 'How do you handle syringe requests?',
                options: ['Use Syringes workflow', 'General medication workflow', 'Lab workflow', 'Refund workflow'],
                correct: 0
            },
            {
                text: 'How do you handle controlled substance orders?',
                options: ['Use Controlled Substance workflow', 'General medication workflow', 'Lab workflow', 'Refund workflow'],
                correct: 0
            },
            {
                text: 'What is the difference between general medications and controlled substances?',
                options: ['Regulation level', 'Same thing', 'Different pharmacies', 'None'],
                correct: 0
            },
            {
                text: 'What information is needed for medication orders?',
                options: ['Medication and prescription info', 'Payment only', 'Shipping only', 'None'],
                correct: 0
            },
            {
                text: 'How do you verify medication orders?',
                options: ['Through verification process', 'No verification', 'Email only', 'Phone only'],
                correct: 0
            },
            {
                text: 'What is the purpose of the medication management workflow?',
                options: ['Manage medication orders', 'Process payments', 'Handle refunds', 'Track shipments'],
                correct: 0
            },
            // Platform & Tools Questions (76-85)
            {
                text: 'Which platform workflow uses Retool?',
                options: ['Retool workflow', 'Akute workflow', 'General tech workflow', 'Billing workflow'],
                correct: 0
            },
            {
                text: 'What is the Akute workflow used for?',
                options: ['Akute platform operations', 'Retool operations', 'General tech', 'Billing'],
                correct: 0
            },
            {
                text: 'What is the Retool workflow used for?',
                options: ['Retool platform operations', 'Akute operations', 'General tech', 'Billing'],
                correct: 0
            },
            {
                text: 'Which workflow handles General Tech Issues?',
                options: ['General Tech Issues workflow', 'Retool workflow', 'Akute workflow', 'Billing workflow'],
                correct: 0
            },
            {
                text: 'How do you use Retool in workflows?',
                options: ['Through Retool workflow', 'Direct access only', 'Email', 'Phone'],
                correct: 0
            },
            {
                text: 'What is the Akute platform used for?',
                options: ['Akute platform operations', 'Retool operations', 'General tech', 'Billing'],
                correct: 0
            },
            {
                text: 'How do you handle general tech issues?',
                options: ['Use General Tech Issues workflow', 'Ignore', 'Email IT', 'Phone support'],
                correct: 0
            },
            {
                text: 'What tools are available in Retool?',
                options: ['Retool platform tools', 'No tools', 'External tools only', 'Limited tools'],
                correct: 0
            },
            {
                text: 'What is the purpose of platform workflows?',
                options: ['Manage platform operations', 'Process payments', 'Handle refunds', 'Track orders'],
                correct: 0
            },
            {
                text: 'How do you troubleshoot tech issues?',
                options: ['Use appropriate tech workflow', 'Ignore', 'Email only', 'Phone only'],
                correct: 0
            },
            // Compliance & Quality Questions (86-90)
            {
                text: 'What is the purpose of the Compliance Workflow?',
                options: ['Ensure regulatory compliance', 'Process payments', 'Handle refunds', 'Track orders'],
                correct: 0
            },
            {
                text: 'What does the Compliance Workflow ensure?',
                options: ['Regulatory compliance', 'Fast processing', 'Low costs', 'High volume'],
                correct: 0
            },
            {
                text: 'How do you ensure compliance with regulations?',
                options: ['Use Compliance Workflow', 'Ignore regulations', 'Email only', 'Phone only'],
                correct: 0
            },
            {
                text: 'What is checked in the compliance workflow?',
                options: ['Compliance requirements', 'Payment info', 'Shipping addresses', 'Medication types'],
                correct: 0
            },
            {
                text: 'Why is compliance important?',
                options: ['Legal and regulatory requirements', 'Speed', 'Cost', 'Volume'],
                correct: 0
            },
            // Financial & Billing Questions (91-95)
            {
                text: 'Which workflow handles refund requests?',
                options: ['Refunds workflow', 'Billing workflow', 'Order workflow', 'Lab workflow'],
                correct: 0
            },
            {
                text: 'What is the Stripe Refunds Workflow for?',
                options: ['Process Stripe refunds', 'Process orders', 'Handle labs', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the Itemized Receipt process for?',
                options: ['Provide itemized receipts', 'Process orders', 'Handle labs', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What is the Billing workflow used for?',
                options: ['Handle billing issues', 'Process orders', 'Handle labs', 'Track shipments'],
                correct: 0
            },
            {
                text: 'How do you process refunds?',
                options: ['Use Refunds workflow', 'Email only', 'Phone only', 'Not processed'],
                correct: 0
            },
            // Other Workflows Questions (96-100)
            {
                text: 'What is the Referral process used for?',
                options: ['Handle referrals', 'Process orders', 'Handle labs', 'Track shipments'],
                correct: 0
            },
            {
                text: 'Which workflow handles Trustpilot requests?',
                options: ['Trustpilot workflow', 'Refund workflow', 'Billing workflow', 'Order workflow'],
                correct: 0
            },
            {
                text: 'What is the purpose of the Trustpilot workflow?',
                options: ['Handle customer reviews', 'Process orders', 'Handle labs', 'Track shipments'],
                correct: 0
            },
            {
                text: 'What does the "Unknown Leads" tag folder indicate?',
                options: ['Unidentified leads', 'Known customers', 'Refunds', 'Orders'],
                correct: 0
            },
            {
                text: 'What is the "Critical Escalations" tag folder for?',
                options: ['Urgent issues requiring escalation', 'Regular orders', 'Refunds', 'Labs'],
                correct: 0
            }
        ];

        return questions.map((q, index) => ({
            id: `q${index + 1}`,
            text: q.text,
            options: q.options,
            correct: q.correct,
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
        
        // Display multiple choice options
        const optionsContainer = document.getElementById('multipleChoiceOptions');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <button class="choice-btn" data-index="${index}">
                <span class="choice-letter">${String.fromCharCode(65 + index)}</span>
                <span class="choice-text">${this.escapeHtml(option)}</span>
            </button>
        `).join('');
        
        // Add click handlers for choice buttons
        optionsContainer.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons
                optionsContainer.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
                // Add selected class to clicked button
                btn.classList.add('selected');
                // Enable submit button
                document.getElementById('submitBtn').disabled = false;
            });
        });
        
        // Update navigation buttons
        document.getElementById('prevBtn').disabled = false;
        document.getElementById('nextBtn').disabled = false;
        
        // Disable submit button until option is selected
        document.getElementById('submitBtn').disabled = true;
        
        // Refresh answers for current question
        this.displayAnswers();
    }

    submitAnswer() {
        const statusDiv = document.getElementById('answerStatus');
        const selectedBtn = document.querySelector('.choice-btn.selected');

        if (!selectedBtn) {
            statusDiv.className = 'answer-status error';
            statusDiv.textContent = 'Please select an answer before submitting.';
            statusDiv.style.display = 'block';
            return;
        }

        const question = this.getCurrentQuestion();
        const questionId = question.id;
        const selectedIndex = parseInt(selectedBtn.dataset.index);
        const selectedAnswer = question.options[selectedIndex];
        const isCorrect = selectedIndex === question.correct;
        
        if (!this.answers[questionId]) {
            this.answers[questionId] = [];
        }

        const answer = {
            id: Date.now(),
            text: selectedAnswer,
            selectedIndex: selectedIndex,
            timestamp: new Date().toISOString(),
            questionId: questionId,
            isCorrect: isCorrect,
            correctAnswer: question.options[question.correct]
        };

        this.answers[questionId].push(answer);
        this.saveAnswers();

        // Clear selection and show result
        document.querySelectorAll('.choice-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('submitBtn').disabled = true;
        
        if (isCorrect === true) {
            statusDiv.className = 'answer-status success';
            statusDiv.innerHTML = '✓ <strong>Correct!</strong> Great job!';
        } else {
            statusDiv.className = 'answer-status error';
            statusDiv.innerHTML = `✗ <strong>Incorrect.</strong> The correct answer is: <strong>${question.options[question.correct]}</strong>`;
        }
        
        statusDiv.style.display = 'block';

        // Hide status after 5 seconds
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

