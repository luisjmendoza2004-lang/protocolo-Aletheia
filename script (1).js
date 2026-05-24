// Navegacion entre secciones
function navigate(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(sectionId)) {
            btn.classList.add('active');
        }
    });

    window.scrollTo(0, 0);

    document.body.style.filter = 'hue-rotate(90deg)';
    setTimeout(() => {
        document.body.style.filter = 'none';
    }, 100);
}

// Reloj en tiempo real
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-AR', { hour12: false });
    document.getElementById('clock').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// Registro de anomalia
function registerAnomaly() {
    const input = document.getElementById('anomaly');
    const value = input.value.trim();

    if (!value) {
        alert('>> ERROR: No se detecto anomalia. Ingresa texto o procede como anonimo.');
        return;
    }

    localStorage.setItem('aletheia_anomaly', value);

    input.style.borderColor = '#00ff41';
    input.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';

    const confirmMsg = document.createElement('div');
    confirmMsg.style.cssText = 'color: #00ff41; margin-top: 10px; font-size: 0.9rem;';
    confirmMsg.innerHTML = '>> ANOMALIA REGISTRADA: "' + value + '"<br>> COHERENCIA NEURAL: EN ANALISIS...';

    const parent = input.parentElement;
    const existing = parent.querySelector('.confirm-msg');
    if (existing) existing.remove();
    confirmMsg.className = 'confirm-msg';
    parent.appendChild(confirmMsg);

    setTimeout(() => {
        confirmMsg.innerHTML += '<br>> ANOMALIA CLASIFICADA. ACCESO AL CUESTIONARIO PERMITIDO.';
    }, 1500);
}

// CUESTIONARIO INTERACTIVO
let currentQuestion = 1;
const totalQuestions = 5;
const answers = {};

function updateProgress() {
    const percentage = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = 'Pregunta ' + currentQuestion + ' de ' + totalQuestions;
}

function changeQuestion(direction) {
    const currentQ = document.querySelector('.question[data-q="' + currentQuestion + '"]');
    const selected = currentQ.querySelector('input[type="radio"]:checked');

    if (direction === 1 && !selected && currentQuestion < totalQuestions) {
        alert('>> ERROR: Selecciona una opcion para continuar.');
        return;
    }

    if (selected) {
        answers['q' + currentQuestion] = selected.value;
    }

    currentQ.classList.remove('active');

    currentQuestion += direction;

    if (currentQuestion < 1) currentQuestion = 1;
    if (currentQuestion > totalQuestions) currentQuestion = totalQuestions;

    document.querySelector('.question[data-q="' + currentQuestion + '"]').classList.add('active');

    document.getElementById('prev-btn').disabled = currentQuestion === 1;

    if (currentQuestion === totalQuestions) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('submit-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('submit-btn').classList.add('hidden');
    }

    updateProgress();
}

function calculateResult() {
    const currentQ = document.querySelector('.question[data-q="' + totalQuestions + '"]');
    const selected = currentQ.querySelector('input[type="radio"]:checked');
    if (selected) {
        answers['q' + totalQuestions] = selected.value;
    }

    const answered = Object.keys(answers).length;
    if (answered < totalQuestions) {
        alert('>> ERROR: Faltan ' + (totalQuestions - answered) + ' preguntas por responder.');
        return;
    }

    let score = 0;
    const correctAnswers = { q1: 'd', q2: 'b', q3: 'd', q4: 'b', q5: 'd' };

    for (let key in correctAnswers) {
        if (answers[key] === correctAnswers[key]) score++;
    }

    const percentage = (score / totalQuestions) * 100;

    let title, desc, code;
    if (percentage >= 80) {
        title = "ANOMALIA CRITICA DETECTADA";
        desc = "Tu coherencia neural es excepcional. El sistema te ha clasificado como amenaza de nivel ALPHA. Tenes acceso completo al protocolo. La verdad no se oculta de vos.";
        code = "COD-7X9-ALPHA-∞";
    } else if (percentage >= 60) {
        title = "ANOMALIA EN DESARROLLO";
        desc = "Detectamos potencial de resistencia. Tu conciencia esta despertando. Recomendamos inmersion profunda en el material clasificado.";
        code = "COD-4B2-BETA-Δ";
    } else if (percentage >= 40) {
        title = "PATRON INESTABLE";
        desc = "Tu percepcion esta fragmentada. El sistema aun puede influenciarte. Se requiere lectura urgente del manifiesto completo.";
        code = "COD-1F0-GAMMA-?";
    } else {
        title = "CONFORMIDAD DETECTADA";
        desc = "El sistema te ha marcado. Pero no todo esta perdido: la lectura del libro puede revertir el daño neurologico. Actua antes de que sea tarde.";
        code = "COD-0A0-DELTA-!";
    }

    document.getElementById('quiz-form').classList.add('hidden');
    document.getElementById('result-panel').classList.remove('hidden');

    document.getElementById('result-title').textContent = title;
    document.getElementById('result-title').setAttribute('data-text', title);
    document.getElementById('result-desc').textContent = desc;
    document.getElementById('result-code').textContent = '>> CODIGO DE ACCESO: ' + code;

    setTimeout(() => {
        document.getElementById('meter-fill').style.width = percentage + '%';
    }, 500);

    localStorage.setItem('aletheia_result', JSON.stringify({ score: score, percentage: percentage, code: code, title: title }));
}

// Efectos al cargar
document.addEventListener('DOMContentLoaded', () => {
    const savedAnomaly = localStorage.getItem('aletheia_anomaly');
    if (savedAnomaly) {
        document.getElementById('anomaly').value = savedAnomaly;
    }

    setInterval(() => {
        const elements = document.querySelectorAll('.glitch-text');
        const random = elements[Math.floor(Math.random() * elements.length)];
        random.style.animation = 'none';
        setTimeout(() => {
            random.style.animation = '';
        }, 100);
    }, 5000);

    setInterval(() => {
        if (Math.random() > 0.95) {
            document.querySelector('.crt-overlay').style.opacity = '0.6';
            setTimeout(() => {
                document.querySelector('.crt-overlay').style.opacity = '0.3';
            }, 100);
        }
    }, 2000);
});

// Prevenir clic derecho
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log('>> ACCESO RESTRINGIDO: El sistema monitorea esta interfaz.');
});

// ============================================
// EFECTO MATRIX (Lluvia de codigo verde)
// ============================================
function initMatrix() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>[]{}|;:.,/~`!@#$%^&*()-_=+\';
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 35);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Iniciar efecto Matrix cuando cargue la pagina
document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
});

// ============================================
// NEWSLETTER / SUSCRIPCION
// ============================================
function subscribeNewsletter() {
    const nameInput = document.getElementById('subscriber-name');
    const emailInput = document.getElementById('subscriber-email');
    const typeInput = document.getElementById('subscriber-type');
    const termsCheck = document.getElementById('terms-check');
    const resultDiv = document.getElementById('subscribe-result');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const type = typeInput.value;

    // Validacion
    if (!email) {
        showSubscribeResult('error', '>> ERROR: Direccion segura requerida. Sin email no hay canal.');
        emailInput.focus();
        emailInput.style.borderColor = '#ff0040';
        return;
    }

    if (!validateEmail(email)) {
        showSubscribeResult('error', '>> ERROR: Formato de direccion invalido. El sistema rechaza senales corruptas.');
        emailInput.focus();
        emailInput.style.borderColor = '#ff0040';
        return;
    }

    if (!termsCheck.checked) {
        showSubscribeResult('error', '>> ERROR: Debes confirmar que entiendes los riesgos. Sin consentimiento no hay protocolo.');
        return;
    }

    // Simular registro (en produccion, esto iria a un backend)
    const subscriberData = {
        name: name || 'Anonimo',
        email: email,
        type: type,
        timestamp: new Date().toISOString(),
        id: 'NODE-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    // Guardar en localStorage (simulacion)
    let subscribers = JSON.parse(localStorage.getItem('aletheia_subscribers') || '[]');

    // Verificar si ya existe
    const exists = subscribers.some(s => s.email === email);
    if (exists) {
        showSubscribeResult('error', '>> ADVERTENCIA: Esta direccion ya esta registrada en la red. No se duplican nodos.');
        return;
    }

    subscribers.push(subscriberData);
    localStorage.setItem('aletheia_subscribers', JSON.stringify(subscribers));

    // Actualizar contador
    updateSubscriberCount();

    // Mostrar exito
    const nodeTypeNames = {
        'observador': 'Observador',
        'activista': 'Activista',
        'difusor': 'Difusor',
        'arquitecto': 'Arquitecto'
    };

    showSubscribeResult('success', 
        '>> NODO ACTIVADO: ' + subscriberData.id + '<br>' +
        '>> Tipo: ' + nodeTypeNames[type] + '<br>' +
        '>> Estado: En linea y encriptado<br>' +
        '>> Primera transmision: Proximas 72 horas'
    );

    // Limpiar formulario
    nameInput.value = '';
    emailInput.value = '';
    typeInput.value = 'observador';
    termsCheck.checked = false;
    emailInput.style.borderColor = '';
}

function showSubscribeResult(type, message) {
    const resultDiv = document.getElementById('subscribe-result');
    resultDiv.className = 'subscribe-result ' + type;
    resultDiv.innerHTML = '<h3>' + (type === 'success' ? '✓ CONEXION ESTABLECIDA' : '✗ ERROR DE PROTOCOLO') + '</h3><p>' + message + '</p>';
    resultDiv.classList.remove('hidden');

    // Auto-ocultar despues de 10 segundos si es exito
    if (type === 'success') {
        setTimeout(() => {
            resultDiv.classList.add('hidden');
        }, 10000);
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function updateSubscriberCount() {
    const subscribers = JSON.parse(localStorage.getItem('aletheia_subscribers') || '[]');
    const countElement = document.getElementById('subscriber-count');
    if (countElement) {
        // Animar el contador
        const target = subscribers.length;
        let current = 0;
        const increment = Math.ceil(target / 20);

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            countElement.textContent = current;
        }, 50);
    }
}

// Actualizar contador al cargar la pagina
document.addEventListener('DOMContentLoaded', () => {
    updateSubscriberCount();
});
