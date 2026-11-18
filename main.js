// ==========================================
// LÓGICA COMPLETA DE LUPA UABCS (JS)
// ==========================================

// ESTADO DE ACCESIBILIDAD
let currentFontSizeLevel = 0; 
let isHighContrast = false;
let isDyslexicFont = false;
let isSpeaking = false;

// AJUSTAR TAMAÑO DE FUENTE
function adjustFontSize(delta) {
    const body = document.body;
    currentFontSizeLevel = Math.min(Math.max(currentFontSizeLevel + delta, -1), 2);

    body.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');

    if (currentFontSizeLevel === -1) {
        body.classList.add('text-sm');
    } else if (currentFontSizeLevel === 0) {
        body.classList.add('text-base');
    } else if (currentFontSizeLevel === 1) {
        body.classList.add('text-lg');
    } else if (currentFontSizeLevel === 2) {
        body.classList.add('text-xl');
    }
}

function resetFontSize() {
    currentFontSizeLevel = 0;
    adjustFontSize(0);
}

// ALTO CONTRASTE
function toggleHighContrast() {
    isHighContrast = !isHighContrast;
    const body = document.getElementById('main-body');
    const btn = document.getElementById('btn-contrast');

    if (isHighContrast) {
        body.classList.add('high-contrast');
        btn.setAttribute('aria-pressed', 'true');
    } else {
        body.classList.remove('high-contrast');
        btn.setAttribute('aria-pressed', 'false');
    }
}

// FUENTE PARA DISLEXIA
function toggleDyslexicFont() {
    isDyslexicFont = !isDyslexicFont;
    const body = document.getElementById('main-body');
    const btn = document.getElementById('btn-dyslexic');

    if (isDyslexicFont) {
        body.classList.add('font-dyslexic-mode');
        btn.setAttribute('aria-pressed', 'true');
    } else {
        body.classList.remove('font-dyslexic-mode');
        btn.setAttribute('aria-pressed', 'false');
    }
}

// LECTURA EN VOZ ALTA
function readPageText() {
    if (!('speechSynthesis' in window)) {
        alert("Tu navegador no soporta sintetizador de voz integrado.");
        return;
    }

    if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        document.getElementById('tts-btn-text').innerText = "Escuchar Página";
        return;
    }

    const inicioEl = document.getElementById('inicio');
    const reportesEl = document.getElementById('reportes');
    const mainContent = (inicioEl ? inicioEl.innerText : "") + ". " + (reportesEl ? reportesEl.innerText : "");

    const utterance = new SpeechSynthesisUtterance(mainContent);
    utterance.lang = 'es-MX';
    utterance.rate = 0.95;

    utterance.onend = () => {
        isSpeaking = false;
        document.getElementById('tts-btn-text').innerText = "Escuchar Página";
    };

    utterance.onerror = () => {
        isSpeaking = false;
        document.getElementById('tts-btn-text').innerText = "Escuchar Página";
    };

    window.speechSynthesis.speak(utterance);
    isSpeaking = true;
    document.getElementById('tts-btn-text').innerText = "Detener Voz";
}

// CARRUSEL
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('#carousel-dots button');

function showSlide(index) {
    if (!slides.length) return;

    slides.forEach((slide, i) => {
        if (i === index) {
            slide.classList.remove('opacity-0', 'pointer-events-none');
            slide.classList.add('opacity-100');
        } else {
            slide.classList.remove('opacity-100');
            slide.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.remove('bg-white/50');
            dot.classList.add('bg-uabcs-gold');
        } else {
            dot.classList.remove('bg-uabcs-gold');
            dot.classList.add('bg-white/50');
        }
    });

    currentSlide = index;
}

function nextSlide() {
    if (!slides.length) return;
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
}

function prevSlide() {
    if (!slides.length) return;
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
}

function goToSlide(index) {
    showSlide(index);
}

if (slides.length) {
    setInterval(nextSlide, 4000);
}

// MODAL DE SERVICIOS
function openModal(title, body) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerText = body;
    document.getElementById('info-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('info-modal').classList.add('hidden');
}

// MENÚ MÓVIL
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.getElementById('mobile-menu-btn');
    if (!menu || !btn) return;

    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isExpanded));
}

// ESTADÍSTICAS PÚBLICAS AGREGADAS DE SUPABASE
const reportCategoryLabels = [
    'Equipos de cómputo',
    'Internet y conectividad',
    'Software y licencias',
    'Laboratorios y aulas',
    'Docencia y asesorías',
    'Infraestructura',
    'Accesibilidad',
    'Proyectos estudiantiles',
    'Acoso',
    'Otra sugerencia'
];
const demoReportStats = {
    total: 182,
    statuses: { Solucionado: 142, 'En proceso': 28, Pendiente: 12 },
    categories: {
        'Equipos de cómputo': 34,
        'Internet y conectividad': 28,
        'Software y licencias': 17,
        'Laboratorios y aulas': 25,
        'Docencia y asesorías': 14,
        Infraestructura: 22,
        Accesibilidad: 12,
        'Proyectos estudiantiles': 11,
        Acoso: 5,
        'Otra sugerencia': 14
    }
};
const demoReports = [
    {
        folio: 'DEMO-001',
        subject: 'Equipo de proyección del aula',
        category: 'Equipos de cómputo',
        status: 'Solucionado',
        description: 'Ejemplo: se revisó la conexión del proyector y quedó funcionando.'
    },
    {
        folio: 'DEMO-002',
        subject: 'Señal de internet en zona de estudio',
        category: 'Internet y conectividad',
        status: 'En proceso',
        description: 'Ejemplo: el área de soporte está verificando la cobertura.'
    },
    {
        folio: 'DEMO-003',
        subject: 'Acceso a licencia de software',
        category: 'Software y licencias',
        status: 'Pendiente',
        description: 'Ejemplo: solicitud recibida, en espera de revisión.'
    },
    {
        folio: 'DEMO-004',
        subject: 'Acceso sin barreras al edificio',
        category: 'Accesibilidad',
        status: 'Solucionado',
        description: 'Ejemplo: se ajustó el acceso para facilitar el tránsito.'
    },
    {
        folio: 'DEMO-005',
        subject: 'Iluminación de un salón',
        category: 'Laboratorios y aulas',
        status: 'En proceso',
        description: 'Ejemplo: mantenimiento tiene el caso asignado.'
    },
    {
        folio: 'DEMO-006',
        subject: 'Propuesta para mejorar un espacio común',
        category: 'Otra sugerencia',
        status: 'Pendiente',
        description: 'Ejemplo: sugerencia recibida para valoración.'
    }
];
let categoryChart = null;
let statusChart = null;
let supabaseClient = null;

function showStatsError(message) {
    const errorElement = document.getElementById('stats-error');
    if (!errorElement) return;

    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function hideStatsError() {
    const errorElement = document.getElementById('stats-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
}

function getSupabaseClient() {
    const config = window.LUPA_SUPABASE_CONFIG;
    if (!window.supabase) {
        throw new Error('No se pudo cargar Supabase. Revisa tu conexión a internet e inténtalo otra vez.');
    }
    if (!config || !config.url || !config.publishableKey) {
        throw new Error('Falta configurar la URL y la clave pública de Supabase en supabase-config.js.');
    }
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(config.url, config.publishableKey);
    }
    return supabaseClient;
}

function readCount(value, label) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        throw new Error(`La estadística "${label}" no tiene un valor válido.`);
    }
    return value;
}

function renderReportStats(stats) {
    if (!stats || typeof stats !== 'object' ||
        !stats.statuses || typeof stats.statuses !== 'object' ||
        !stats.categories || typeof stats.categories !== 'object') {
        throw new Error('Supabase devolvió estadísticas con un formato inválido.');
    }

    const total = readCount(stats.total, 'total');
    const solved = readCount(stats.statuses['Solucionado'], 'Solucionado');
    const inProgress = readCount(stats.statuses['En proceso'], 'En proceso');
    const pending = readCount(stats.statuses['Pendiente'], 'Pendiente');
    const categoryCounts = reportCategoryLabels.map(label =>
        readCount(stats.categories[label] === undefined ? 0 : stats.categories[label], label)
    );
    const resolutionRate = total ? Math.round((solved / total) * 100) : 0;

    // Las tarjetas del HTML solo tienen resueltos, en proceso y pendientes:
    // los ids stat-total y stat-eficiencia pueden no existir en la página.
    const escribir = (id, valor) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    };

    escribir('stats-description', 'Monitoreo de incidencias reportadas y su grado de resolución.');
    escribir('stat-total', total);
    escribir('stat-resueltos', solved);
    escribir('stat-proceso', inProgress);
    escribir('stat-pendientes', pending);
    escribir('stat-eficiencia', `${resolutionRate}%`);

    if (typeof Chart === 'undefined') {
        renderFallbackCharts(categoryCounts, [solved, inProgress, pending]);
        showStatsError('No se pudo cargar Chart.js. Se muestran los conteos y gráficas alternativas.');
        return;
    }
    document.getElementById('chartCategorias').hidden = false;
    document.getElementById('chartEstatus').hidden = false;
    document.getElementById('chartCategoriasFallback').classList.add('hidden');
    document.getElementById('chartEstatusFallback').classList.add('hidden');

    if (!categoryChart) {
        const canvas = document.getElementById('chartCategorias');
        if (canvas) {
            categoryChart = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: reportCategoryLabels,
                    datasets: [{
                        label: 'Número de reportes',
                        data: categoryCounts,
                        backgroundColor: '#002B49',
                        borderColor: '#D4AF37',
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }
            });
        }
    } else {
        categoryChart.data.datasets[0].data = categoryCounts;
        categoryChart.update();
    }

    const statusCounts = [solved, inProgress, pending];
    if (!statusChart) {
        const canvas = document.getElementById('chartEstatus');
        if (canvas) {
            statusChart = new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Resueltos', 'En proceso', 'Pendientes'],
                    datasets: [{
                        data: statusCounts,
                        backgroundColor: ['#10B981', '#F59E0B', '#002B49'],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    } else {
        statusChart.data.datasets[0].data = statusCounts;
        statusChart.update();
    }

    hideStatsError();
}

function renderFallbackCharts(categoryCounts, statusCounts) {
    const categoryCanvas = document.getElementById('chartCategorias');
    const statusCanvas = document.getElementById('chartEstatus');
    const categoryFallback = document.getElementById('chartCategoriasFallback');
    const statusFallback = document.getElementById('chartEstatusFallback');
    categoryCanvas.hidden = true;
    statusCanvas.hidden = true;
    categoryFallback.classList.remove('hidden');
    statusFallback.classList.remove('hidden');
    categoryFallback.replaceChildren();
    statusFallback.replaceChildren();

    const maxCategoryCount = Math.max(...categoryCounts, 1);
    reportCategoryLabels.forEach((label, index) => {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 text-xs';
        const categoryLabel = document.createElement('span');
        categoryLabel.className = 'w-36 shrink-0 truncate text-slate-700';
        categoryLabel.textContent = label;
        const track = document.createElement('div');
        track.className = 'h-3 flex-1 overflow-hidden rounded bg-slate-200';
        const bar = document.createElement('div');
        bar.className = 'h-full rounded bg-uabcs-blue';
        bar.style.width = `${(categoryCounts[index] / maxCategoryCount) * 100}%`;
        track.appendChild(bar);
        const count = document.createElement('span');
        count.className = 'w-7 text-right font-bold text-slate-700';
        count.textContent = categoryCounts[index];
        row.append(categoryLabel, track, count);
        categoryFallback.appendChild(row);
    });

    const statusLabels = ['Resueltos', 'En proceso', 'Pendientes'];
    const statusColors = ['#10B981', '#F59E0B', '#002B49'];
    const totalStatuses = statusCounts.reduce((sum, count) => sum + count, 0) || 1;
    const statusBar = document.createElement('div');
    statusBar.className = 'flex h-8 overflow-hidden rounded-full bg-slate-200';
    const statusLegend = document.createElement('div');
    statusLegend.className = 'space-y-3';
    statusCounts.forEach((count, index) => {
        const segment = document.createElement('div');
        segment.style.width = `${(count / totalStatuses) * 100}%`;
        segment.style.backgroundColor = statusColors[index];
        statusBar.appendChild(segment);

        const item = document.createElement('div');
        item.className = 'flex items-center justify-between text-sm';
        const label = document.createElement('span');
        label.className = 'flex items-center gap-2 text-slate-700';
        const marker = document.createElement('span');
        marker.className = 'inline-block h-3 w-3 rounded-full';
        marker.style.backgroundColor = statusColors[index];
        const name = document.createElement('span');
        name.textContent = statusLabels[index];
        label.append(marker, name);
        const value = document.createElement('strong');
        value.className = 'text-slate-900';
        value.textContent = `${count} (${Math.round((count / totalStatuses) * 100)}%)`;
        item.append(label, value);
        statusLegend.appendChild(item);
    });
    statusFallback.append(statusBar, statusLegend);
}

function renderDemoReports() {
    const demoCases = document.getElementById('demo-cases');
    const demoCaseList = document.getElementById('demo-case-list');
    demoCaseList.replaceChildren();
    demoReports.forEach(report => {
        const card = document.createElement('article');
        card.className = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm';
        const heading = document.createElement('div');
        heading.className = 'flex items-start justify-between gap-3';
        const subject = document.createElement('h4');
        subject.className = 'font-bold text-uabcs-blue';
        subject.textContent = report.subject;
        const badge = document.createElement('span');
        badge.className = report.status === 'Solucionado'
            ? 'shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800'
            : report.status === 'En proceso'
                ? 'shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800'
                : 'shrink-0 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-800';
        badge.textContent = report.status;
        heading.append(subject, badge);
        const folio = document.createElement('p');
        folio.className = 'mt-2 text-xs font-semibold text-slate-500';
        folio.textContent = `Folio ${report.folio} · ${report.category}`;
        const description = document.createElement('p');
        description.className = 'mt-3 text-sm leading-relaxed text-slate-700';
        description.textContent = report.description;
        card.append(heading, folio, description);
        demoCaseList.appendChild(card);
    });
    demoCases.classList.remove('hidden');
}

async function updateReportStats() {
    try {
        const { data, error } = await getSupabaseClient().rpc('get_public_report_stats');
        if (error) throw error;
        if (data && data.total === 0) {
            renderReportStats(demoReportStats);
            renderDemoReports();
            showStatsError('Modo de demostración: Supabase está conectado, pero aún no hay reportes reales. Los casos mostrados son ficticios.');
            return;
        }
        renderReportStats(data);
        document.getElementById('demo-cases').classList.add('hidden');
    } catch (error) {
        renderReportStats(demoReportStats);
        renderDemoReports();
        const message = error && error.message ? error.message : 'Error desconocido.';
        if ((error && error.code === 'PGRST202') || message.includes('get_public_report_stats')) {
            showStatsError('Modo de demostración: los casos son ficticios porque aún falta configurar las estadísticas de Supabase. Ejecuta supabase/schema.sql para conectar datos reales.');
        } else {
            showStatsError(`Modo de demostración: no se pudieron cargar datos reales de Supabase (${message}). Los casos mostrados son ficticios.`);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderReportStats(demoReportStats);
    renderDemoReports();
    showStatsError('Modo de demostración: se muestran casos ficticios mientras se intenta conectar con Supabase.');
    updateReportStats();
});
window.addEventListener('pageshow', updateReportStats);
if ('BroadcastChannel' in window) {
    const statsChannel = new BroadcastChannel('lupa-report-stats');
    statsChannel.addEventListener('message', event => {
        if (event.data && event.data.type === 'stats-updated') {
            updateReportStats();
        }
    });
}
window.addEventListener('focus', () => {
    if (document.visibilityState === 'visible') {
        updateReportStats();
    }
});