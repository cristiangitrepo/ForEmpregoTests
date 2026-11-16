'use strict';

window.ExamCatalog = (() => {
    function validate(exam) {
        const text = value => typeof value === 'string' && value.trim().length > 0;
        const optionalText = value => value === undefined || typeof value === 'string';
        if (!exam || !text(exam.titulo) || !optionalText(exam.descripcion) ||
            !Array.isArray(exam.preguntas) || !exam.preguntas.length) {
            throw new Error('El test debe tener título y al menos una pregunta.');
        }
        exam.preguntas.forEach((question, index) => {
            if (!question || !text(question.pregunta) || !optionalText(question.traduccion) ||
                !Array.isArray(question.opciones) || question.opciones.length < 2) {
                throw new Error(`Pregunta ${index + 1}: enunciado u opciones no válidos.`);
            }
            const ids = new Set();
            question.opciones.forEach(option => {
                if (!option || !(typeof option.id === 'string' && text(option.id) ||
                    typeof option.id === 'number' && Number.isFinite(option.id)) ||
                    ids.has(option.id) || !text(option.enunciado) ||
                    !optionalText(option.traduccion) || typeof option.correcta !== 'boolean') {
                    throw new Error(`Pregunta ${index + 1}: opciones o identificadores no válidos.`);
                }
                ids.add(option.id);
            });
            if (question.opciones.filter(option => option.correcta).length !== 1) {
                throw new Error(`Pregunta ${index + 1}: debe haber una única respuesta correcta.`);
            }
        });
        return exam;
    }

    async function load() {
        const response = await fetch('./data/catalog.json', { cache: 'no-store' });
        if (!response.ok) throw new Error('No se pudo cargar el catálogo de data.');
        const files = await response.json();
        if (!Array.isArray(files) || files.some(file => typeof file !== 'string' ||
            !/^[^/\\]+\.json$/i.test(file) || ['catalog.json', 'test.json'].includes(file))) {
            throw new Error('Catálogo de archivos no válido.');
        }
        const results = await Promise.allSettled([...new Set(files)].map(async file => {
            const result = await fetch(`./data/${encodeURIComponent(file)}`, { cache: 'no-store' });
            if (!result.ok) throw new Error(`${file}: no se pudo cargar.`);
            try {
                return { file, exam: validate(await result.json()) };
            } catch (error) {
                throw new Error(`${file}: ${error.message}`);
            }
        }));
        return {
            exams: results.filter(result => result.status === 'fulfilled').map(result => result.value),
            errors: results.filter(result => result.status === 'rejected').map(result => result.reason.message)
        };
    }
    return { load, validate };
})();
