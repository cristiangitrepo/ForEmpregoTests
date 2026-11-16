'use strict';
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const testSelector = document.getElementById('testSelector');
    const examPanel = document.getElementById('examPanel');
    const resultPanel = document.getElementById('resultPanel');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');

    const examTitle = document.getElementById('examTitle');
    const examDescription = document.getElementById('examDescription');
    const currentQuestionEl = document.getElementById('currentQuestion');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressFill = document.getElementById('progressFill');

    const questionTextEl = document.getElementById('questionText');
    const questionTranslationEl = document.getElementById('questionTranslation');
    const optionsList = document.getElementById('optionsList');

    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const finishButton = document.getElementById('finishButton');
    const answeredInfo = document.getElementById('answeredInfo');

    const scorePercentage = document.getElementById('scorePercentage');
    const correctAnswersEl = document.getElementById('correctAnswers');
    const incorrectAnswersEl = document.getElementById('incorrectAnswers');
    const unansweredAnswersEl = document.getElementById('unansweredAnswers');
    const resultMessage = document.getElementById('resultMessage');

    const reviewButton = document.getElementById('reviewButton');
    const restartButton = document.getElementById('restartButton');

    // Estado de la aplicación
    let currentExamData = null;
    let currentQuestionIndex = 0;
    let userAnswers = {}; // Almacena la opción seleccionada por índice de pregunta: { 0: optionId, 1: optionId, ... }
    let isReviewMode = false;
    const exams = new Map();
    document.getElementById('backToResults').addEventListener('click', evaluateExam);
    document.querySelectorAll('[data-choose-exam]').forEach(button => button.addEventListener('click', () => {
        examPanel.hidden = resultPanel.hidden = true;
        document.querySelector('.exam-selector').hidden = false;
        testSelector.value = '';
        testSelector.focus();
    }));

    // 1. Cargar el índice de exámenes al iniciar
    loadExamIndex();

    async function loadExamIndex() {
        showLoading(true);
        testSelector.disabled = true;
        hideError();
        try {
            const catalog = await ExamCatalog.load();
            populateTestSelector(catalog.exams);
            if (catalog.errors.length) showError(catalog.errors.join(' '));
            if (!catalog.exams.length) showError('No hay exámenes válidos disponibles.');
        } catch (error) {
            showError('Error al cargar los exámenes disponibles: ' + error.message);
            testSelector.innerHTML = '<option value="">Error al cargar</option>';
        } finally {
            showLoading(false);
            testSelector.disabled = exams.size === 0;
        }
    }

    function populateTestSelector(tests) {
        testSelector.innerHTML = '<option value="">-- Selecciona un examen --</option>';
        tests.forEach(({ file, exam }) => {
            exams.set(file, exam);
            const option = document.createElement('option');
            option.value = file;
            option.textContent = exam.titulo;
            testSelector.appendChild(option);
        });
    }

    // Evento de selección de examen
    testSelector.addEventListener('change', async (e) => {
        const selectedFile = e.target.value;
        if (!selectedFile) return;

        await loadExamContent(selectedFile);
    });

    async function loadExamContent(fileName) {
        showLoading(true);
        hideError();
        try {
            currentExamData = exams.get(fileName);
            if (!currentExamData) throw new Error('Examen no disponible.');
            initExam();
        } catch (error) {
            showError('Error al cargar el contenido del test: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

    function initExam() {
        currentQuestionIndex = 0;
        userAnswers = {};
        isReviewMode = false;

        examTitle.textContent = currentExamData.titulo;
        examDescription.textContent = currentExamData.descripcion || '';
        totalQuestionsEl.textContent = currentExamData.preguntas.length;

        document.querySelector('.exam-selector').hidden = true;
        resultPanel.hidden = true;
        examPanel.hidden = false;
        finishButton.hidden = true;
        nextButton.hidden = false;

        renderQuestion();
    }

    function renderQuestion() {
        const questionData = currentExamData.preguntas[currentQuestionIndex];
        
        const currentQuestionIndexEl = currentQuestionIndex + 1;
        currentQuestionEl.textContent = currentQuestionIndexEl;
        questionTextEl.textContent = questionData.pregunta;
        
        if (questionData.traduccion) {
            questionTranslationEl.textContent = questionData.traduccion;
            questionTranslationEl.hidden = false;
        } else {
            questionTranslationEl.hidden = true;
        }

        // Renderizar opciones
        optionsList.innerHTML = '';
        questionData.opciones.forEach((option, optionIndex) => {
            const label = document.createElement('label');
            label.className = 'option-card'; // Asumiendo clases estándar o personalizadas
            label.style.animationDelay = `${optionIndex * 0.07}s`;

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question_${currentQuestionIndex}`;
            input.value = option.id;
            
            // Verificar si ya fue respondida previamente
            if (userAnswers[currentQuestionIndex] === option.id) {
                input.checked = true;
            }

            // Si estamos en modo revisión, deshabilitar y mostrar colores de corrección
            if (isReviewMode) {
                input.disabled = true;
                if (option.correcta) {
                    label.classList.add('correct-option');
                } else if (userAnswers[currentQuestionIndex] === option.id && !option.correcta) {
                    label.classList.add('incorrect-option');
                }
            }

            input.addEventListener('change', () => {
                if (!isReviewMode) {
                    userAnswers[currentQuestionIndex] = option.id;
                    updateProgress();
                }
            });

            const contentDiv = document.createElement('span');
            contentDiv.className = 'option-text';
            
            const textStrong = document.createElement('strong');
            textStrong.textContent = option.enunciado;
            contentDiv.appendChild(textStrong);

            if (option.traduccion) {
                const subP = document.createElement('small');
                subP.textContent = option.traduccion;
                contentDiv.appendChild(subP);
            }

            label.appendChild(input);
            const letter = document.createElement('span');
            letter.className = 'option-letter';
            letter.textContent = String.fromCharCode(65 + optionIndex);
            letter.setAttribute('aria-hidden', 'true');
            const indicator = document.createElement('span');
            indicator.className = 'radio-indicator';
            indicator.setAttribute('aria-hidden', 'true');
            if (isReviewMode && (option.correcta || input.checked)) {
                const status = document.createElement('small');
                status.textContent = option.correcta ? 'Respuesta correcta' : 'Tu respuesta: incorrecta';
                contentDiv.appendChild(status);
            }
            label.appendChild(letter);
            label.appendChild(contentDiv);
            label.appendChild(indicator);
            optionsList.appendChild(label);
        });

        // Actualizar botones de navegación
        prevButton.disabled = currentQuestionIndex === 0;
        
        if (currentQuestionIndex === currentExamData.preguntas.length - 1) {
            nextButton.hidden = true;
            finishButton.hidden = isReviewMode; // Si estamos revisando, ocultamos finalizar
        } else {
            nextButton.hidden = false;
            finishButton.hidden = true;
        }

        updateProgress();
        document.getElementById('backToResults').hidden = !isReviewMode;
        questionTextEl.focus();
    }

    function updateProgress() {
        const total = currentExamData.preguntas.length;
        const answeredCount = Object.keys(userAnswers).length;
        const percentage = Math.round((answeredCount / total) * 100);

        progressPercentage.textContent = `${percentage}%`;
        progressFill.style.width = `${percentage}%`;
        document.getElementById('progressBar').setAttribute('aria-valuenow', percentage);

        answeredInfo.textContent = `${answeredCount} de ${total} respuestas seleccionadas`;
    }

    // Navegación Siguiente / Anterior
    nextButton.addEventListener('click', () => {
        if (currentQuestionIndex < currentExamData.preguntas.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    // Finalizar examen y corregir
    finishButton.addEventListener('click', () => {
        evaluateExam();
    });

    function evaluateExam() {
        let correctCount = 0;
        let incorrectCount = 0;
        let unansweredCount = 0;

        currentExamData.preguntas.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer === undefined) {
                unansweredCount++;
            } else {
                const correctOption = q.opciones.find(opt => opt.correcta);
                if (correctOption && correctOption.id === userAnswer) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            }
        });

        const total = currentExamData.preguntas.length;
        const score = Math.round((correctCount / total) * 100);

        // Mostrar resultados en el panel
        scorePercentage.textContent = `${score}%`;
        correctAnswersEl.textContent = correctCount;
        incorrectAnswersEl.textContent = incorrectCount;
        unansweredAnswersEl.textContent = unansweredCount;

        if (score >= 50) {
            resultMessage.textContent = '¡Excelente trabajo! Has superado el examen con éxito.';
        } else {
            resultMessage.textContent = 'Puedes repasar los conceptos e intentarlo de nuevo para mejorar tu nota.';
        }

        examPanel.hidden = true;
        resultPanel.hidden = false;
        document.getElementById('resultHeading').focus();
    }

    // Botón de revisar respuestas
    reviewButton.addEventListener('click', () => {
        isReviewMode = true;
        currentQuestionIndex = 0;
        resultPanel.hidden = true;
        examPanel.hidden = false;
        finishButton.hidden = true;
        nextButton.hidden = false;
        renderQuestion();
    });

    // Botón de repetir / reiniciar examen
    restartButton.addEventListener('click', () => {
        initExam();
    });

    // Funciones auxiliares de UI
    function showLoading(show) {
        if (loadingMessage) loadingMessage.hidden = !show;
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.hidden = false;
        }
    }

    function hideError() {
        if (errorMessage) {
            errorMessage.hidden = true;
            errorMessage.textContent = '';
        }
    }
});
