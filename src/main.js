import './style.css';
import { translations } from './i18n.js';

/* =====================================================
   Settings
   ===================================================== */
const REDIRECT_AFTER_VERIFY = null; // e.g. '/dashboard'. null = stay on the page (demo)
const RESEND_SECONDS = 30;
const DEMO_CODE = '1234'; // demo only

/* =====================================================
   API placeholders: replace with your real backend calls
   ===================================================== */
async function sendCode(phone, mode, name) {
  // await fetch('/api/auth/send-code', { method: 'POST', body: JSON.stringify({ phone, mode, name }) });
  await sleep(400);
}

async function verifyCode(phone, code) {
  // const res = await fetch('/api/auth/verify', { method: 'POST', body: JSON.stringify({ phone, code }) });
  // return res.ok;
  await sleep(600);
  return code === DEMO_CODE;
}

/* =====================================================
   Helpers
   ===================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const normalizeDigits = (s) =>
  s
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const toFa = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

const state = {
  lang: localStorage.getItem('lang') === 'en' ? 'en' : 'fa',
  mode: 'login',
  phone: '',
  busy: false,
  status: null, // { key, type }
  remaining: 0,
  timer: null,
};

const t = (key, vars = {}) => {
  let s = translations[state.lang][key] ?? key;
  for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
  return s;
};
const localizeDigits = (s) => (state.lang === 'fa' ? toFa(s) : String(s));

/* =====================================================
   Elements
   ===================================================== */
const stepPhone = $('#stepPhone');
const stepOtp = $('#stepOtp');
const phoneForm = $('#phoneForm');
const nameInput = $('#nameInput');
const phoneInput = $('#phoneInput');
const nameError = $('#nameError');
const phoneError = $('#phoneError');
const stage = $('#otpStage');
const chipLayer = $('#chipLayer');
const otpInputs = $$('.otp-input');
const otpStatus = $('#otpStatus');
const resendText = $('#resendText');
const resendBtn = $('#resendBtn');

/* =====================================================
   Language (FA / EN) + RTL / LTR
   ===================================================== */
function applyLang(lang) {
  state.lang = lang;
  localStorage.setItem('lang', lang);

  const html = document.documentElement;
  html.lang = lang;
  html.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.title = t('page_title');

  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$('[data-i18n-placeholder]').forEach((el) => (el.placeholder = t(el.dataset.i18nPlaceholder)));
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('.lang-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));

  $('#year').textContent = localizeDigits(new Date().getFullYear());
  renderDynamic();
}

// Texts that contain variables or change at runtime
function renderDynamic() {
  $('#otpSub').innerHTML = t('otp_sub', {
    phone: `<bdi dir="ltr" class="font-mono text-lilac">${localizeDigits(state.phone)}</bdi>`,
  });

  if (state.remaining > 0) {
    resendText.textContent = t('otp_resend_in', { s: localizeDigits(state.remaining) });
  }

  if (state.status) {
    const { key, type } = state.status;
    otpStatus.textContent = t(key);
    otpStatus.className =
      'min-h-6 text-center text-sm font-medium ' +
      (type === 'ok' ? 'text-ok' : type === 'bad' ? 'text-bad' : 'text-lilac');
  } else {
    otpStatus.textContent = '';
  }
}

function setStatus(key, type) {
  state.status = key ? { key, type } : null;
  renderDynamic();
}

$$('.lang-btn').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));

/* =====================================================
   Tabs: login / signup
   ===================================================== */
function setMode(mode) {
  state.mode = mode;
  $$('.tab').forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.mode === mode)));
  $('#nameField').hidden = mode !== 'signup';
  $('#title').dataset.i18n = `title_${mode}`;
  $('#subtitle').dataset.i18n = `sub_${mode}`;
  $('#sendBtn').dataset.i18n = `btn_send_${mode}`;
  clearErrors();
  applyLang(state.lang);
}
$$('.tab').forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

/* =====================================================
   Step 1: phone form
   ===================================================== */
function clearErrors() {
  nameError.textContent = '';
  phoneError.textContent = '';
  nameInput.classList.remove('invalid');
  phoneInput.classList.remove('invalid');
}

phoneInput.addEventListener('input', () => {
  phoneInput.value = normalizeDigits(phoneInput.value).replace(/\D/g, '');
  phoneInput.classList.remove('invalid');
  phoneError.textContent = '';
});
nameInput.addEventListener('input', () => {
  nameInput.classList.remove('invalid');
  nameError.textContent = '';
});

phoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const name = nameInput.value.trim();
  const phone = normalizeDigits(phoneInput.value).replace(/\D/g, '');
  let valid = true;

  if (state.mode === 'signup' && name.length < 2) {
    nameError.textContent = t('err_name');
    nameInput.classList.add('invalid');
    valid = false;
  }
  if (!/^09\d{9}$/.test(phone)) {
    phoneError.textContent = t('err_phone');
    phoneInput.classList.add('invalid');
    valid = false;
  }
  if (!valid) return;

  state.phone = phone;
  $('#sendBtn').disabled = true;
  await sendCode(phone, state.mode, name);
  $('#sendBtn').disabled = false;
  showOtpStep();
});

/* =====================================================
   Step 2: OTP
   ===================================================== */
function resetOtp() {
  chipLayer.innerHTML = '';
  stage.classList.remove('hide-inputs', 'is-spinning', 'burst-ok', 'burst-bad');
  chipLayer.classList.remove('shake');
  otpInputs.forEach((i) => {
    i.value = '';
    i.disabled = false;
  });
  state.busy = false;
}

function showOtpStep() {
  stepPhone.hidden = true;
  stepOtp.hidden = false;
  resetOtp();
  setStatus(null);
  startTimer();
  renderDynamic();
  otpInputs[0].focus();
}

function showPhoneStep() {
  stopTimer();
  resetOtp();
  setStatus(null);
  stepOtp.hidden = true;
  stepPhone.hidden = false;
  phoneInput.focus();
}

$('#editPhone').addEventListener('click', showPhoneStep);

/* Resend timer */
function startTimer() {
  stopTimer();
  state.remaining = RESEND_SECONDS;
  resendBtn.hidden = true;
  resendText.hidden = false;
  renderDynamic();
  state.timer = setInterval(() => {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      stopTimer();
      resendText.hidden = true;
      resendBtn.hidden = false;
    } else {
      renderDynamic();
    }
  }, 1000);
}
function stopTimer() {
  clearInterval(state.timer);
  state.timer = null;
  state.remaining = 0;
}

resendBtn.addEventListener('click', async () => {
  await sendCode(state.phone, state.mode, nameInput.value.trim());
  resetOtp();
  setStatus(null);
  startTimer();
  otpInputs[0].focus();
});

/* Typing, pasting, backspace, SMS autofill */
function fillFrom(start, digits) {
  let idx = start;
  for (const d of digits) {
    if (idx > 3) break;
    otpInputs[idx].value = d;
    idx += 1;
  }
  otpInputs[Math.min(idx, 3)].focus();
}

otpInputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    if (state.busy) return;
    const digits = normalizeDigits(input.value).replace(/\D/g, '');
    input.value = '';
    if (state.status?.type === 'bad') setStatus(null);
    if (digits) fillFrom(i, digits.slice(0, 4 - i));
    checkComplete();
  });

  input.addEventListener('keydown', (e) => {
    if (state.busy) return;
    if (e.key === 'Backspace' && !input.value && i > 0) {
      otpInputs[i - 1].value = '';
      otpInputs[i - 1].focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      otpInputs[i - 1].focus();
    } else if (e.key === 'ArrowRight' && i < 3) {
      otpInputs[i + 1].focus();
    }
  });

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = normalizeDigits(e.clipboardData.getData('text')).replace(/\D/g, '');
    if (!text) return;
    fillFrom(i, text.slice(0, 4 - i));
    checkComplete();
  });

  input.addEventListener('focus', () => input.select());
});

function checkComplete() {
  if (state.busy) return;
  if (otpInputs.every((i) => i.value !== '')) startVerify();
}

/* =====================================================
   Auto verify with the vortex animation
   ===================================================== */
async function startVerify() {
  state.busy = true;
  const code = otpInputs.map((i) => i.value).join('');

  otpInputs.forEach((i) => (i.disabled = true));
  document.activeElement?.blur();
  setStatus('st_verifying', 'info');

  const resultPromise = verifyCode(state.phone, code).catch(() => false);

  const ok = await runVortex(code.split(''), resultPromise, (result) => {
    // Called when the result is known and the spin starts to settle
    stage.classList.add(result ? 'burst-ok' : 'burst-bad');
    setStatus(result ? 'st_ok' : 'st_bad', result ? 'ok' : 'bad');
  });

  if (ok) {
    stopTimer();
    resendText.hidden = true;
    resendBtn.hidden = true;
    if (REDIRECT_AFTER_VERIFY) {
      await sleep(1200);
      window.location.assign(REDIRECT_AFTER_VERIFY);
    }
    return;
  }

  // Wrong code: shake in red, then let the user try again
  chipLayer.classList.add('shake');
  await sleep(1300);
  resetOtp();
  otpInputs[0].focus(); // the "wrong code" message stays until they type again
}

function runVortex(digits, resultPromise, onResult) {
  const sr = stage.getBoundingClientRect();
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height / 2;

  // Where each digit sits in the row
  const rows = otpInputs.map((inp) => {
    const r = inp.getBoundingClientRect();
    return { x: r.left + r.width / 2 - cx, y: r.top + r.height / 2 - cy, w: r.width, h: r.height };
  });

  chipLayer.innerHTML = '';
  const chips = digits.map((d, i) => {
    const c = document.createElement('span');
    c.className = 'chip';
    c.textContent = localizeDigits(d);
    c.style.width = rows[i].w + 'px';
    c.style.height = rows[i].h + 'px';
    chipLayer.appendChild(c);
    return c;
  });

  stage.classList.add('hide-inputs', 'is-spinning');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = Math.min(58, sr.width * 0.17); // orbit radius
  const SPIN_UP = 700; // ms to go from the row into the circle
  const MIN_SPIN = reduce ? 600 : 1800; // minimum time spinning
  const SETTLE = 800; // ms to stop and go back to the row
  const W = reduce ? 5 : 15; // angular speed (rad/s)

  let angle = 0;
  let prev = performance.now();
  const t0 = prev;
  let settleAt = null;
  let ok = null;
  let w0 = 0;
  let resultVal;

  resultPromise.then((v) => (resultVal = !!v));

  return new Promise((resolve) => {
    function frame(now) {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const el = now - t0;
      let blend; // 1 = full circle, 0 = back in the row
      let omega;

      if (settleAt === null) {
        const u = clamp(el / SPIN_UP);
        blend = easeInOut(u);
        omega = W * easeOut(u);

        if (el >= MIN_SPIN && resultVal !== undefined) {
          settleAt = now;
          ok = resultVal;
          w0 = omega;
          chips.forEach((c) => c.classList.add(ok ? 'ok' : 'bad'));
          stage.classList.remove('is-spinning');
          onResult(ok);
        }
      } else {
        const p = clamp((now - settleAt) / SETTLE);
        blend = 1 - easeInOut(p);
        omega = w0 * Math.pow(1 - p, 2);
      }

      angle += omega * dt;

      chips.forEach((c, i) => {
        const a = angle + (i * Math.PI) / 2;
        const r = R * (0.82 + 0.18 * Math.sin(el / 160 + i * 1.9)); // slight spiral wobble
        const x = lerp(rows[i].x, Math.cos(a) * r, blend);
        const y = lerp(rows[i].y, Math.sin(a) * r, blend);
        const s = lerp(1, 0.62, blend);
        c.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${s})`;
      });

      if (settleAt !== null && now - settleAt >= SETTLE) {
        resolve(ok);
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

/* =====================================================
   Init
   ===================================================== */
setMode('login');
applyLang(state.lang);
