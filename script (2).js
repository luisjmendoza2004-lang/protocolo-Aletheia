function navigate(sectionId) {
    var sections = document.querySelectorAll('.section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }

    document.getElementById(sectionId).classList.add('active');

    var navBtns = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < navBtns.length; i++) {
        navBtns[i].classList.remove('active');
        if (navBtns[i].getAttribute('onclick').indexOf(sectionId) !== -1) {
            navBtns[i].classList.add('active');
        }
    }

    window.scrollTo(0, 0);

    document.body.style.filter = 'hue-rotate(90deg)';
    setTimeout(function() {
        document.body.style.filter = 'none';
    }, 100);
}

function updateClock() {
    var now = new Date();
    var time = now.toLocaleTimeString('es-AR', { hour12: false });
    var clockEl = document.getElementById('clock');
    if (clockEl) clockEl.textContent = time;
}

setInterval(updateClock, 1000);
updateClock();

function registerAnomaly() {
    var input = document.getElementById('anomaly');
    if (!input) return;
    var value = input.value.trim();

    if (!value) {
        alert('ERROR: No se detecto anomalia. Ingresa texto o procede como anonimo.');
        return;
    }

    localStorage.setItem('aletheia_anomaly', value);

    input.style.borderColor = '#00ff41';
    input.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';

    var confirmMsg = document.createElement('div');
    confirmMsg.style.cssText = 'color: #00ff41; margin-top: 10px; font-size: 0.9rem;';
    confirmMsg.innerHTML = 'ANOMALIA REGISTRADA: "' + value + '"<br>COHERENCIA NEURAL: EN ANALISIS...';

    var parent = input.parentElement;
    var existing = parent.querySelector('.confirm-msg');
    if (existing) existing.remove();
    confirmMsg.className = 'confirm-msg';
    parent.appendChild(confirmMsg);

    setTimeout(function() {
        confirmMsg.innerHTML += '<br>ANOMALIA CLASIFICADA. ACCESO AL CUESTIONARIO PERMITIDO.';
    }, 1500);
}

var currentQuestion = 1;
var totalQuestions = 5;
var answers = {};

function updateProgress() {
    var percentage = (currentQuestion / totalQuestions) * 100;
    var fill = document.getElementById('progress-fill');
    var text = document.getElementById('progress-text');
    if (fill) fill.style.width = percentage + '%';
    if (text) text.textContent = 'Pregunta ' + currentQuestion + ' de ' + totalQuestions;
}

function changeQuestion(direction) {
    var currentQ = document.querySelector('.question[data-q="' + currentQuestion + '"]');
    if (!currentQ) return;
    var selected = currentQ.querySelector('input[type="radio"]:checked');

    if (direction === 1 && !selected && currentQuestion < totalQuestions) {
        alert('ERROR: Selecciona una opcion para continuar.');
        return;
    }

    if (selected) {
        answers['q' + currentQuestion] = selected.value;
    }

    currentQ.classList.remove('active');

    currentQuestion += direction;

    if (currentQuestion < 1) currentQuestion = 1;
    if (currentQuestion > totalQuestions) currentQuestion = totalQuestions;

    var nextQ = document.querySelector('.question[data-q="' + currentQuestion + '"]');
    if (nextQ) nextQ.classList.add('active');

    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var submitBtn = document.getElementById('submit-btn');

    if (prevBtn) prevBtn.disabled = currentQuestion === 1;

    if (currentQuestion === totalQuestions) {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (submitBtn) submitBtn.classList.remove('hidden');
    } else {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (submitBtn) submitBtn.classList.add('hidden');
    }

    updateProgress();
}

function calculateResult() {
    var currentQ = document.querySelector('.question[data-q="' + totalQuestions + '"]');
    if (currentQ) {
        var selected = currentQ.querySelector('input[type="radio"]:checked');
        if (selected) {
            answers['q' + totalQuestions] = selected.value;
        }
    }

    var answered = Object.keys(answers).length;
    if (answered < totalQuestions) {
        alert('ERROR: Faltan ' + (totalQuestions - answered) + ' preguntas por responder.');
        return;
    }

    var score = 0;
    var correctAnswers = { q1: 'd', q2: 'b', q3: 'd', q4: 'b', q5: 'd' };

    for (var key in correctAnswers) {
        if (answers[key] === correctAnswers[key]) score++;
    }

    var percentage = (score / totalQuestions) * 100;

    var title, desc, code;
    if (percentage >= 80) {
        title = 'ANOMALIA CRITICA DETECTADA';
        desc = 'Tu coherencia neural es excepcional. El sistema te ha clasificado como amenaza de nivel ALPHA. Tenes acceso completo al protocolo.';
        code = 'COD-7X9-ALPHA';
    } else if (percentage >= 60) {
        title = 'ANOMALIA EN DESARROLLO';
        desc = 'Detectamos potencial de resistencia. Tu conciencia esta despertando. Recomendamos inmersion profunda en el material clasificado.';
        code = 'COD-4B2-BETA';
    } else if (percentage >= 40) {
        title = 'PATRON INESTABLE';
        desc = 'Tu percepcion esta fragmentada. El sistema aun puede influenciarte. Se requiere lectura urgente del manifiesto completo.';
        code = 'COD-1F0-GAMMA';
    } else {
        title = 'CONFORMIDAD DETECTADA';
        desc = 'El sistema te ha marcado. Pero no todo esta perdido: la lectura del libro puede revertir el dano neurologico.';
        code = 'COD-0A0-DELTA';
    }

    var quizForm = document.getElementById('quiz-form');
    var resultPanel = document.getElementById('result-panel');
    var resultTitle = document.getElementById('result-title');
    var resultDesc = document.getElementById('result-desc');
    var resultCode = document.getElementById('result-code');
    var meterFill = document.getElementById('meter-fill');

    if (quizForm) quizForm.classList.add('hidden');
    if (resultPanel) resultPanel.classList.remove('hidden');

    if (resultTitle) {
        resultTitle.textContent = title;
        resultTitle.setAttribute('data-text', title);
    }
    if (resultDesc) resultDesc.textContent = desc;
    if (resultCode) resultCode.textContent = 'CODIGO DE ACCESO: ' + code;

    setTimeout(function() {
        if (meterFill) meterFill.style.width = percentage + '%';
    }, 500);

    localStorage.setItem('aletheia_result', JSON.stringify({
        score: score,
        percentage: percentage,
        code: code,
        title: title
    }));
}

function subscribeNewsletter() {
    var nameInput = document.getElementById('subscriber-name');
    var emailInput = document.getElementById('subscriber-email');
    var typeInput = document.getElementById('subscriber-type');
    var termsCheck = document.getElementById('terms-check');
    var resultDiv = document.getElementById('subscribe-result');

    var name = nameInput ? nameInput.value.trim() : '';
    var email = emailInput ? emailInput.value.trim() : '';
    var type = typeInput ? typeInput.value : 'observador';

    if (!email) {
        showSubscribeResult('error', 'ERROR: Direccion segura requerida. Sin email no hay canal.');
        if (emailInput) emailInput.focus();
        return;
    }

    if (!validateEmail(email)) {
        showSubscribeResult('error', 'ERROR: Formato de direccion invalido.');
        if (emailInput) emailInput.focus();
        return;
    }

    if (!termsCheck || !termsCheck.checked) {
        showSubscribeResult('error', 'ERROR: Debes confirmar que entiendes los riesgos.');
        return;
    }

    var subscriberData = {
        name: name || 'Anonimo',
        email: email,
        type: type,
        timestamp: new Date().toISOString(),
        id: 'NODE-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    var subscribers = JSON.parse(localStorage.getItem('aletheia_subscribers') || '[]');

    var exists = false;
    for (var i = 0; i < subscribers.length; i++) {
        if (subscribers[i].email === email) {
            exists = true;
            break;
        }
    }

    if (exists) {
        showSubscribeResult('error', 'ADVERTENCIA: Esta direccion ya esta registrada.');
        return;
    }

    subscribers.push(subscriberData);
    localStorage.setItem('aletheia_subscribers', JSON.stringify(subscribers));

    updateSubscriberCount();

    var nodeTypeNames = {
        'observador': 'Observador',
        'activista': 'Activista',
        'difusor': 'Difusor',
        'arquitecto': 'Arquitecto'
    };

    showSubscribeResult('success',
        'NODO ACTIVADO: ' + subscriberData.id + '<br>' +
        'Tipo: ' + (nodeTypeNames[type] || type) + '<br>' +
        'Estado: En linea y encriptado<br>' +
        'Primera transmision: Proximas 72 horas'
    );

    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
    if (typeInput) typeInput.value = 'observador';
    if (termsCheck) termsCheck.checked = false;
}

function showSubscribeResult(type, message) {
    var resultDiv = document.getElementById('subscribe-result');
    if (!resultDiv) return;

    resultDiv.className = 'subscribe-result ' + type;
    var header = type === 'success' ? '✓ CONEXION ESTABLECIDA' : '✗ ERROR DE PROTOCOLO';
    resultDiv.innerHTML = '<h3>' + header + '</h3><p>' + message + '</p>';
    resultDiv.classList.remove('hidden');

    if (type === 'success') {
        setTimeout(function() {
            resultDiv.classList.add('hidden');
        }, 10000);
    }
}

function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function updateSubscriberCount() {
    var subscribers = JSON.parse(localStorage.getItem('aletheia_subscribers') || '[]');
    var countElement = document.getElementById('subscriber-count');
    if (countElement) {
        countElement.textContent = subscribers.length;
    }
}

function initMatrix() {
    var canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>[]{}|;:.,/~`!@#$%^&*()-_=+';
    var fontSize = 14;
    var columns = Math.floor(canvas.width / fontSize);

    var drops = [];
    for (var i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff41';
        ctx.font = fontSize + 'px monospace';

        for (var i = 0; i < drops.length; i++) {
            var text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 35);

    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var savedAnomaly = localStorage.getItem('aletheia_anomaly');
    if (savedAnomaly) {
        var anomalyInput = document.getElementById('anomaly');
        if (anomalyInput) anomalyInput.value = savedAnomaly;
    }

    initMatrix();
    updateSubscriberCount();

    setInterval(function() {
        var elements = document.querySelectorAll('.glitch-text');
        if (elements.length === 0) return;
        var random = elements[Math.floor(Math.random() * elements.length)];
        random.style.animation = 'none';
        setTimeout(function() {
            random.style.animation = '';
        }, 100);
    }, 5000);

    setInterval(function() {
        if (Math.random() > 0.95) {
            var overlay = document.querySelector('.crt-overlay');
            if (overlay) {
                overlay.style.opacity = '0.6';
                setTimeout(function() {
                    overlay.style.opacity = '0.3';
                }, 100);
            }
        }
    }, 2000);
});

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    console.log('ACCESO RESTRINGIDO: El sistema monitorea esta interfaz.');
});
