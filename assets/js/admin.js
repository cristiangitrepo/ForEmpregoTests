'use strict';
let tests = [];
let editingIndex = null;
let baseTitles = [];

        function renderList() {
            const grid = document.getElementById('testGrid');
            const emptyState = document.getElementById('emptyState');
            const countBadge = document.getElementById('testCount');

            grid.innerHTML = '';
            countBadge.textContent = `${tests.length} test${tests.length === 1 ? '' : 's'}`;

            if (tests.length === 0) {
                emptyState.classList.remove('hidden');
                return;
            } else {
                emptyState.classList.add('hidden');
            }

            tests.forEach((test, index) => {
                const card = document.createElement('div');
                card.className = "bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4";

                card.innerHTML = `
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg line-clamp-1">${escapeHtml(test.titulo)}</h3>
                        <p class="text-slate-500 text-xs mt-1 line-clamp-2">${escapeHtml(test.descripcion)}</p>
                        <div class="mt-3 flex items-center gap-2">
                            <span class="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-0.5 rounded">
                                <i class="fa-solid fa-circle-question mr-1"></i> ${test.preguntas ? test.preguntas.length : 0} preguntas
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                        <button data-action="export" data-index="${index}" title="Descargar JSON" class="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                            <i class="fa-solid fa-download"></i>
                        </button>
                        <button data-action="edit" data-index="${index}" title="Editar" class="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button data-action="delete" data-index="${index}" title="Eliminar" class="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                wireEvents(card);
                grid.appendChild(card);
            });
        }

        function nuevoTest() {
            editingIndex = null;
            document.getElementById('editorTitle').textContent = "Crear Nuevo Test";
            document.getElementById('testTitulo').value = '';
            document.getElementById('testDescripcion').value = '';
            document.getElementById('preguntasContainer').innerHTML = '';

            // Añadir una pregunta vacía por defecto
            agregarPregunta();

            document.getElementById('listView').classList.add('hidden');
            document.getElementById('editorView').classList.remove('hidden');
        }

        function editarTest(index) {
            editingIndex = index;
            const test = tests[index];
            document.getElementById('editorTitle').textContent = "Editar Test: " + test.titulo;
            document.getElementById('testTitulo').value = test.titulo;
            document.getElementById('testDescripcion').value = test.descripcion || '';

            const container = document.getElementById('preguntasContainer');
            container.innerHTML = '';

            test.preguntas.forEach((p, pIndex) => {
                agregarPreguntaConDatos(p, pIndex);
            });

            document.getElementById('listView').classList.add('hidden');
            document.getElementById('editorView').classList.remove('hidden');
        }

        function volverAlListado() {
            document.getElementById('editorView').classList.add('hidden');
            document.getElementById('listView').classList.remove('hidden');
            renderList();
        }

        function agregarPregunta() {
            agregarPreguntaConDatos({ pregunta: '', traduccion: '', opciones: Array.from({length: 4}, (_, i) => ({id: i + 1, enunciado: '', traduccion: '', correcta: i === 0})) }, document.getElementById('preguntasContainer').children.length);
        }

        function agregarPreguntaConDatos(pData, pIndex) {
            const container = document.getElementById('preguntasContainer');
            const pDiv = document.createElement('div');
            pDiv.className = "p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 relative pregunta-card";
            pDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-slate-500 uppercase">Pregunta #${pIndex + 1}</span>
                    <button type="button" data-action="removeQuestion" class="text-rose-500 hover:text-rose-700 text-xs font-medium flex items-center gap-1">
                        <i class="fa-solid fa-trash"></i> Eliminar Pregunta
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label class="block text-xs font-medium text-slate-600 mb-1">Enunciado de la pregunta</label>
                        <input type="text" name="pregunta-enunciado" value="${escapeHtml(pData.pregunta || '')}" required class="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-slate-600 mb-1">Traducción / Explicación breve</label>
                        <input type="text" name="pregunta-traduccion" value="${escapeHtml(pData.traduccion || '')}" class="w-full px-3 py-1.5 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    </div>
                </div>
                <div class="mt-2">
                    <label class="block text-xs font-medium text-slate-600 mb-1">Opciones de respuesta (marca la correcta)</label>
                    <div class="space-y-2 opciones-container">
                        ${generarOpcionesHTML(pData.opciones)}
                    </div>
                </div>
            `;
            container.appendChild(pDiv);
            wireEvents(pDiv);
            associateLabels(pDiv);
        }


        function generarOpcionesHTML(opciones) {
            // Generar un identificador único para cada pregunta
            const grupoRadio = `correcta-radio-${++fieldId}`;

            return opciones.map((opt, index) => `
        <div class="flex items-center gap-2 opcion-row">
            <input
                type="radio"
                name="${grupoRadio}"
                ${opt.correcta ? 'checked' : ''}
                class="opcion-correcta-radio text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                title="Marcar como correcta"
            >
            <input
                type="text"
                value="${escapeHtml(opt.enunciado || '')}"
                placeholder="Enunciado opción ${index + 1}"
                required
                class="flex-grow px-2.5 py-1 border border-slate-300 rounded text-xs option-enunciado"
            >
            <input
                type="text"
                value="${escapeHtml(opt.traduccion || '')}"
                placeholder="Traducción opcional"
                class="w-1/3 px-2.5 py-1 border border-slate-300 rounded text-xs option-traduccion"
            >
        </div>
    `).join('');
        }


        function guardarTest(event) {
            event.preventDefault();

            const titulo = document.getElementById('testTitulo').value.trim();
            const descripcion = document.getElementById('testDescripcion').value.trim();
            const preguntaCards = document.querySelectorAll('.pregunta-card');

            if (preguntaCards.length === 0) {
                alert('Debes añadir al menos una pregunta.');
                return;
            }

            const preguntas = [];

            for (let card of preguntaCards) {
                const pregunta = card.querySelector('[name="pregunta-enunciado"]').value.trim();
                const traduccion = card.querySelector('[name="pregunta-traduccion"]').value.trim();
                const opcionRows = card.querySelectorAll('.opcion-row');

                const opciones = [];
                let tieneCorrecta = false;

                opcionRows.forEach((row, oIndex) => {
                    const correcta = row.querySelector('.opcion-correcta-radio').checked;
                    if (correcta) tieneCorrecta = true;

                    opciones.push({
                        id: oIndex + 1,
                        enunciado: row.querySelector('.option-enunciado').value.trim(),
                        traduccion: row.querySelector('.option-traduccion').value.trim(),
                        correcta: correcta
                    });
                });

                if (!tieneCorrecta) {
                    alert(`La pregunta "${pregunta}" debe tener una opción marcada como correcta.`);
                    return;
                }

                preguntas.push({
                    pregunta,
                    traduccion,
                    opciones
                });
            }

            const testObj = {
                titulo,
                descripcion,
                preguntas
            };

            try {
                ExamCatalog.validate(testObj);
                const next = tests.slice();
                if (editingIndex !== null) next[editingIndex] = testObj;
                else next.push(testObj);
                persist(next);
                volverAlListado();
            } catch (error) { alert(error.message); }
        }

        function eliminarTest(index) {
            if (confirm('¿Estás seguro de que deseas eliminar este test?')) {
                try {
                    persist(tests.filter((_, i) => i !== index));
                    renderList();
                } catch (error) { alert(error.message); }
            }
        }

        function exportarTestJSON(index) {
            const test = tests[index];
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(test, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `${test.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }

        function importarJSON(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const json = JSON.parse(e.target.result);
                    ExamCatalog.validate(json);
                    persist([...tests, json]);
                    renderList();
                    alert('Test importado correctamente.');
                } catch (err) {
                    alert('Error al importar el fichero JSON: ' + err.message);
                }
                event.target.value = ''; // limpiar input
            };
            reader.onerror = () => { alert('No se pudo leer el archivo.'); event.target.value = ''; };
            reader.readAsText(file);
        }

        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

function persist(next) {
    try { localStorage.setItem('crud_tests', JSON.stringify({ tests: next, baseTitles })); }
    catch { throw new Error('No se pudieron guardar los cambios. Exporta tus tests antes de cerrar.'); }
    tests = next;
}
let fieldId = 0;
function associateLabels(root) {
    root.querySelectorAll('label').forEach(label => {
        const input = label.nextElementSibling;
        if (input && input.matches('input, textarea')) {
            if (!input.id) input.id = 'editor-field-' + (++fieldId);
            label.htmlFor = input.id;
        }
    });
    root.querySelectorAll('.opcion-row').forEach((row, i) => {
        row.querySelector('.opcion-correcta-radio').setAttribute('aria-label', 'Opción ' + (i + 1) + ' correcta');
        row.querySelector('.option-enunciado').setAttribute('aria-label', 'Enunciado opción ' + (i + 1));
        row.querySelector('.option-traduccion').setAttribute('aria-label', 'Traducción opción ' + (i + 1));
    });
}
function wireEvents(root) {
    const actions = { export: exportarTestJSON, edit: editarTest, delete: eliminarTest };
    root.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.action === 'removeQuestion') {
                button.closest('.pregunta-card').remove();
                document.querySelectorAll('.pregunta-card').forEach((card, i) => {
                    card.querySelector('span').textContent = 'Pregunta #' + (i + 1);
                });
            } else actions[button.dataset.action](Number(button.dataset.index));
        });
    });
}
(async () => {
    associateLabels(document);
    document.getElementById('importFile').addEventListener('change', importarJSON);
    document.getElementById('testForm').addEventListener('submit', guardarTest);
    document.querySelectorAll('[data-new]').forEach(b => b.addEventListener('click', nuevoTest));
    document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', volverAlListado));
    document.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', agregarPregunta));
    try {
        const catalog = await ExamCatalog.load();
        tests = catalog.exams.map(entry => entry.exam);
        baseTitles = tests.map(test => test.titulo);
        if (catalog.errors.length) alert(catalog.errors.join('\n'));
    } catch (error) { alert(error.message); }
    try {
        const saved = localStorage.getItem('crud_tests');
        if (saved !== null) {
            const stored = JSON.parse(saved);
            const drafts = Array.isArray(stored) ? stored : stored.tests;
            if (!Array.isArray(drafts)) throw new Error('El almacenamiento no contiene una lista.');
            drafts.forEach(ExamCatalog.validate);
            const previousTitles = Array.isArray(stored.baseTitles) ? stored.baseTitles : [];
            const merged = new Map(tests.filter(test => !previousTitles.includes(test.titulo)).map(test => [test.titulo, test]));
            drafts.forEach(test => merged.set(test.titulo, test));
            tests = [...merged.values()];
        }
    } catch (error) { alert('No se pudieron recuperar los borradores: ' + error.message); }
    renderList();
})();

