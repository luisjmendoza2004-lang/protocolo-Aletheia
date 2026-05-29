// ═══════════════════════════════════════════════════════
// C.R.O.M.A.D.H. — SISTEMA DE NODOS v1.0
// Agregar AL FINAL de index.html, antes de </body>:
// <script type="module" src="cromadh-patch.js"></script>
// ═══════════════════════════════════════════════════════

import {
  db, doc, setDoc, getDoc, collection,
  query, where, getDocs, runTransaction, serverTimestamp
} from './firebase-config.js';

const BASE_URL = 'https://aletheia.projet45-lang.github.io/protocolo-Aletheia';

// ── UTILIDADES ───────────────────────────────────────────────

async function hashEmail(email) {
  const data = new TextEncoder().encode(email.toLowerCase().trim());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 24);
}

async function getNextNodeId() {
  const counterRef = doc(db, '_config', 'counter');
  let newNumber;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().total : 0;
    newNumber = current + 1;
    tx.set(counterRef, { total: newNumber });
  });
  return `NODO-${String(newNumber).padStart(3, '0')}`;
}

function mostrarMensaje(contenedor, texto, color = '#D4AF37') {
  let el = document.getElementById('_cromadh_msg');
  if (!el) {
    el = document.createElement('div');
    el.id = '_cromadh_msg';
    el.style.cssText = [
      'font-family: "Share Tech Mono", monospace',
      'font-size: 12px',
      'letter-spacing: 0.15em',
      'margin-top: 10px',
      'padding: 8px 12px',
      'border-left: 2px solid currentColor',
      'transition: all 0.3s ease',
      'line-height: 1.6'
    ].join(';');
    contenedor.parentNode.insertBefore(el, contenedor.nextSibling);
  }
  el.style.color = color;
  el.innerHTML = texto;
}

// ── 1. CAPTURAR REFERIDO DESDE URL ───────────────────────────

const urlParams = new URLSearchParams(window.location.search);
const refCode   = urlParams.get('ref');
if (refCode && refCode.startsWith('NODO-')) {
  localStorage.setItem('cromadh_ref', refCode);
}

// ── 2. REGISTRAR NODO EN FIREBASE ────────────────────────────

async function registrarNodo(email, codename, tipo) {
  const emailHash = await hashEmail(email);
  const emailRef  = doc(db, '_emails', emailHash);
  const emailSnap = await getDoc(emailRef);

  // Ya registrado: redirigir a su dashboard
  if (emailSnap.exists()) {
    const nodeId = emailSnap.data().nodeId;
    localStorage.setItem('cromadh_my_node', nodeId);
    return { yaExiste: true, nodeId };
  }

  const nodeId  = await getNextNodeId();
  const parentId = localStorage.getItem('cromadh_ref') || 'RAIZ';

  const nodoData = {
    nodeId,
    codename:   codename || 'Anónimo',
    tipo:       tipo     || 'observador',
    parentId,
    fechaRegistro:      serverTimestamp(),
    totalHijos:         0,
    totalDescendientes: 0,
    activo: true
  };

  // Guardar nodo
  await setDoc(doc(db, 'nodos', nodeId), nodoData);

  // Guardar índice de email (sin exponer el email)
  await setDoc(emailRef, { nodeId, ts: serverTimestamp() });

  // Actualizar contador de hijos del padre
  if (parentId !== 'RAIZ') {
    try {
      const parentRef = doc(db, 'nodos', parentId);
      await runTransaction(db, async (tx) => {
        const parentSnap = await tx.get(parentRef);
        if (parentSnap.exists()) {
          const d = parentSnap.data();
          tx.update(parentRef, {
            totalHijos:         (d.totalHijos         || 0) + 1,
            totalDescendientes: (d.totalDescendientes || 0) + 1
          });
        }
      });
    } catch (e) { /* falla silenciosa si el padre no existe */ }
  }

  localStorage.setItem('cromadh_my_node', nodeId);
  return { nodeId };
}

// ── 3. HOOKEAR EL FORMULARIO EXISTENTE ───────────────────────

window.addEventListener('DOMContentLoaded', () => {

  // Buscar los campos del formulario con múltiples estrategias
  const emailInput = (
    document.querySelector('input[type="email"]') ||
    [...document.querySelectorAll('input')].find(i =>
      /email|correo|direccion/i.test(i.placeholder + i.name + i.id)
    )
  );

  const codenameInput = [...document.querySelectorAll('input')].find(i =>
    /codigo|nombre|codename|alias/i.test(i.placeholder + i.name + i.id)
  );

  const tipoSelect = document.querySelector('select');

  const submitBtn = [...document.querySelectorAll('button')].find(btn =>
    /activar|nodo|registrar|suscrib/i.test(btn.textContent)
  );

  if (!emailInput || !submitBtn) {
    console.warn('[CROMADH] Formulario no detectado.');
    return;
  }

  // ── Mostrar referido activo ──
  const storedRef = localStorage.getItem('cromadh_ref');
  if (storedRef) {
    const refEl = document.createElement('div');
    refEl.style.cssText = 'color:#D4AF37;font-family:monospace;font-size:11px;letter-spacing:0.2em;margin-bottom:10px;';
    refEl.textContent = `> Referido por ${storedRef}. Tu anomalía será parte de su red.`;
    emailInput.closest('div, section, form') ?
      emailInput.closest('div, section, form').insertBefore(refEl, emailInput) :
      emailInput.parentNode.insertBefore(refEl, emailInput);
  }

  // ── Mostrar acceso rápido si ya está registrado ──
  const myNode = localStorage.getItem('cromadh_my_node');
  if (myNode) {
    const dashEl = document.createElement('div');
    dashEl.style.cssText = 'color:#27AE60;font-family:monospace;font-size:11px;letter-spacing:0.15em;margin-bottom:10px;cursor:pointer;text-decoration:underline;';
    dashEl.textContent = `> Ya sos ${myNode}. Ver tu red de anomalías →`;
    dashEl.onclick = () => { window.location.href = `nodo.html?id=${myNode}`; };
    emailInput.parentNode.insertBefore(dashEl, emailInput);
  }

  // ── Interceptar el botón ──
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const email = emailInput.value.trim();
    if (!email || !email.includes('@')) {
      mostrarMensaje(submitBtn, '> ERROR: Dirección segura inválida. Reintentá.', '#C0392B');
      return;
    }

    submitBtn.disabled = true;
    mostrarMensaje(submitBtn, '> Conectando con nodos descentralizados...<br>> Encriptando identidad...', '#D4AF37');

    try {
      const codename = codenameInput ? codenameInput.value.trim() : '';
      const tipo     = tipoSelect    ? tipoSelect.value           : 'observador';

      const result = await registrarNodo(email, codename, tipo);

      if (result.yaExiste) {
        mostrarMensaje(submitBtn,
          `> Este canal ya está activo como <strong>${result.nodeId}</strong>.<br>> Redirigiendo a tu red...`,
          '#D4AF37'
        );
        setTimeout(() => { window.location.href = `nodo.html?id=${result.nodeId}`; }, 2000);
        return;
      }

      mostrarMensaje(submitBtn,
        `> ✓ NODO <strong>${result.nodeId}</strong> ACTIVADO.<br>> Accediendo a tu universo de anomalías...`,
        '#27AE60'
      );

      setTimeout(() => { window.location.href = `nodo.html?id=${result.nodeId}`; }, 1800);

    } catch (err) {
      console.error('[CROMADH]', err);
      mostrarMensaje(submitBtn,
        '> ERROR DE CONEXIÓN. El sistema resiste. Reintentá en 30 segundos.',
        '#C0392B'
      );
      submitBtn.disabled = false;
    }
  }, true);

});
