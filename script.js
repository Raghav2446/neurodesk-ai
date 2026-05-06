/* ═══════════════════════════════════════════════════════════════
   NeuroDesk AI — script.js
   Vanilla JavaScript — No Frameworks
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   GLOBAL STATE
───────────────────────────────────────────────────────────── */
const state = {
  tasks:         JSON.parse(localStorage.getItem('nd_tasks') || '[]'),
  focusMinutes:  parseInt(localStorage.getItem('nd_focus') || '0', 10),
  pomoCompleted: parseInt(localStorage.getItem('nd_pomo_done') || '0', 10),
  currentFilter: 'all',
  theme:         localStorage.getItem('nd_theme') || 'dark',
  accent:        localStorage.getItem('nd_accent') || 'blue',
  pomoSettings: {
    focus: 25,
    short: 5,
    long:  15
  }
};

/* ─── Timer internal ──────────────────────────────────────── */
const timer = {
  interval:    null,
  running:     false,
  totalSec:    25 * 60,
  remainSec:   25 * 60,
  mode:        'Focus',
  session:     1,
  circumference: 2 * Math.PI * 90  // r=90 → 565.49
};

/* ─────────────────────────────────────────────────────────────
   DOM SHORTCUTS
───────────────────────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────────────────────────
   INITIALISE
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  applyThemeFromState();
  initTyped();
  initParticles();
  initNavigation();
  renderTasks();
  updateStatCards();
  newQuote();
  initTimerRingGradient();
  updateTimerDisplay();
  updatePomoStats();
  initSidebarToggle();
  syncSettingsUI();

});

/* ─────────────────────────────────────────────────────────────
   TYPED.JS — Hero subtitle
───────────────────────────────────────────────────────────── */
function initTyped() {
  new Typed('#typed-output', {
    strings: [
      'Supercharge your focus with AI.',
      'Organise tasks. Beat procrastination.',
      'Generate smart notes in seconds.',
      'Work smarter. Not harder.',
      'Your AI workspace. Redefined.'
    ],
    typeSpeed:    40,
    backSpeed:    25,
    backDelay:    2000,
    loop:         true,
    cursorChar:   '█',
    smartBackspace: true
  });
}

/* ─────────────────────────────────────────────────────────────
   PARTICLES.JS — Background particles
───────────────────────────────────────────────────────────── */
function initParticles() {
  if (typeof particlesJS === 'undefined') return;

  particlesJS('particles-js', {
    particles: {
      number: { value: 55, density: { enable: true, value_area: 900 } },
      color:  { value: ['#00f3ff', '#7b2fff', '#00ff88'] },
      shape:  { type: 'circle' },
      opacity: {
        value: 0.35,
        random: true,
        anim: { enable: true, speed: 0.5, opacity_min: 0.05, sync: false }
      },
      size: {
        value: 2,
        random: true,
        anim: { enable: true, speed: 2, size_min: 0.3, sync: false }
      },
      line_linked: {
        enable: true,
        distance: 140,
        color: '#00f3ff',
        opacity: 0.07,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.6,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out'
      }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick:  { enable: true, mode: 'push' }
      },
      modes: {
        grab: { distance: 120, line_linked: { opacity: 0.3 } },
        push: { particles_nb: 3 }
      }
    },
    retina_detect: true
  });
}

/* ─────────────────────────────────────────────────────────────
   NAVIGATION — Sidebar section switching
───────────────────────────────────────────────────────────── */
function initNavigation() {
  $$('.nav-item').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const section = link.dataset.section;
      switchSection(section);
      closeSidebar();
    });
  });
}

function switchSection(section) {
  /* Deactivate all */
  $$('.nav-item').forEach(l => l.classList.remove('active'));
  $$('.section').forEach(s => s.classList.remove('active'));

  /* Activate target */
  const link = $(`[data-section="${section}"]`);
  if (link) link.classList.add('active');

  const sec = $(`#section-${section}`);
  if (sec) {
    sec.classList.add('active');
    /* Trigger re-animation */
    sec.style.animation = 'none';
    sec.offsetHeight;
    sec.style.animation = '';
  }

  /* Update breadcrumb */
  const labels = {
    dashboard: 'Dashboard',
    'ai-notes': 'AI Notes',
    tasks: 'Tasks',
    pomodoro: 'Pomodoro',
    settings: 'Settings'
  };
  $('#currentSection').textContent = labels[section] || section;
}

/* Helper for CTA buttons */
window.scrollToSection = section => switchSection(section);

/* ─────────────────────────────────────────────────────────────
   SIDEBAR TOGGLE (mobile)
───────────────────────────────────────────────────────────── */
function initSidebarToggle() {
  $('#sidebarToggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });

  /* Close when clicking main content on mobile */
  $('#mainContent').addEventListener('click', () => {
    if (window.innerWidth <= 900) closeSidebar();
  });
}

function closeSidebar() {
  if (window.innerWidth <= 900) $('#sidebar').classList.remove('open');
}

/* ─────────────────────────────────────────────────────────────
   THEME — Dark / Light
───────────────────────────────────────────────────────────── */
function applyThemeFromState() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const icon = $('#themeIcon');
  if (icon) icon.className = state.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';

  const sw = $('#darkModeSwitch');
  if (sw) sw.checked = state.theme === 'dark';
}

/* Topbar icon-btn toggle */
document.addEventListener('DOMContentLoaded', () => {
  $('#themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('nd_theme', state.theme);
    applyThemeFromState();
    showToast(state.theme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  });
});

/* Settings page switch — linked to toggle-switch #darkModeSwitch */
window.applyTheme = () => {
  const sw = $('#darkModeSwitch');
  state.theme = sw.checked ? 'dark' : 'light';
  localStorage.setItem('nd_theme', state.theme);
  applyThemeFromState();
};

/* ─────────────────────────────────────────────────────────────
   ACCENT COLOUR
───────────────────────────────────────────────────────────── */
const accentMap = {
  blue:   { accent: '#00f3ff', accent2: '#7b2fff', glow: 'rgba(0,243,255,0.25)',  glow2: 'rgba(123,47,255,0.2)' },
  purple: { accent: '#b400ff', accent2: '#ff00c8', glow: 'rgba(180,0,255,0.25)',  glow2: 'rgba(255,0,200,0.2)'  },
  green:  { accent: '#00ff88', accent2: '#00cfff', glow: 'rgba(0,255,136,0.22)',  glow2: 'rgba(0,207,255,0.18)' },
  pink:   { accent: '#ff006e', accent2: '#ff8c00', glow: 'rgba(255,0,110,0.25)',  glow2: 'rgba(255,140,0,0.2)'  }
};

window.setAccent = (color, el) => {
  $$('.color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
  const c = accentMap[color];
  if (!c) return;
  const root = document.documentElement;
  root.style.setProperty('--accent',      c.accent);
  root.style.setProperty('--accent-2',    c.accent2);
  root.style.setProperty('--accent-glow', c.glow);
  root.style.setProperty('--accent-2-glow', c.glow2);
  state.accent = color;
  localStorage.setItem('nd_accent', color);
  initTimerRingGradient();
  showToast(`✦ Accent: ${color}`);
};

/* ─────────────────────────────────────────────────────────────
   PARTICLES TOGGLE
───────────────────────────────────────────────────────────── */
window.toggleParticles = () => {
  const canvas = $('canvas');
  if (canvas) canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
};

/* ─────────────────────────────────────────────────────────────
   STAT CARDS — Animated counters
───────────────────────────────────────────────────────────── */
function updateStatCards() {
  const activeTasks = state.tasks.length;
  const focusMin    = state.focusMinutes;
  const completed   = state.tasks.filter(t => t.completed).length;
  const score       = activeTasks > 0 ? Math.round((completed / activeTasks) * 100) : 0;

  animateCounter('#statTasks', activeTasks);
  animateCounter('#statFocus', focusMin);
  animateCounter('#statScore', score);
}

function animateCounter(selector, target) {
  const el = $(selector);
  if (!el) return;
  const duration = 1000;
  const start = performance.now();
  const from   = parseInt(el.textContent, 10) || 0;

  const tick = now => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = Math.round(from + (target - from) * eased);
    el.firstChild.textContent = value;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ─────────────────────────────────────────────────────────────
   QUOTES WIDGET
───────────────────────────────────────────────────────────── */
const quotes = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'It not about ideas. It about making ideas happen.', author: 'Scott Belsky' },
  { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert Kiyosaki' },
 // ✅ ALSO FIXED — double quotes wrap the string, apostrophes are fine inside
{ text: "Don't count the days. Make the days count.", author: "Muhammad Ali" },
{ text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: 'Energy and persistence conquer all things.', author: 'Benjamin Franklin' },
  { text: 'Small deeds done are better than great deeds planned.', author: 'Peter Marshall' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
  { text: 'Hard work beats talent when talent doesn\'t work hard.', author: 'Tim Notke' }
];

let lastQuoteIdx = -1;

window.newQuote = () => {
  let idx;
  do { idx = Math.floor(Math.random() * quotes.length); } while (idx === lastQuoteIdx);
  lastQuoteIdx = idx;
  const q = quotes[idx];

  const textEl   = $('#quoteText');
  const authorEl = $('#quoteAuthor');

  /* Fade out → update → fade in */
  [textEl, authorEl].forEach(el => {
    el.style.transition = 'opacity 0.3s';
    el.style.opacity = '0';
  });

  setTimeout(() => {
    textEl.textContent   = `"${q.text}"`;
    authorEl.textContent = `— ${q.author}`;
    [textEl, authorEl].forEach(el => (el.style.opacity = '1'));
  }, 320);
};

/* ─────────────────────────────────────────────────────────────
   AI NOTES GENERATOR
───────────────────────────────────────────────────────────── */
const notesDB = {
  'machine learning': {
    heading: 'Machine Learning — Core Concepts',
    sections: [
      { title: '📌 Definition', points: ['Subset of AI enabling systems to learn from data without explicit programming.', 'Key paradigms: Supervised, Unsupervised, and Reinforcement Learning.'] },
      { title: '🔬 Key Algorithms', points: ['Linear & Logistic Regression', 'Decision Trees, Random Forest, Gradient Boosting', 'Support Vector Machines (SVM)', 'Neural Networks & Deep Learning', 'K-Means Clustering, PCA'] },
      { title: '⚙️ Workflow', points: ['Data Collection → Preprocessing → Feature Engineering → Model Training → Evaluation → Deployment', 'Use cross-validation to avoid overfitting.', 'Metrics: Accuracy, Precision, Recall, F1-Score, AUC-ROC.'] },
      { title: '🚀 Applications', points: ['Computer vision, NLP, recommendation engines, fraud detection, autonomous vehicles.'] }
    ]
  },
  'blockchain': {
    heading: 'Blockchain Technology — Key Insights',
    sections: [
      { title: '📌 Core Concept', points: ['A distributed, immutable ledger recording transactions across a peer-to-peer network.', 'Each block contains a cryptographic hash of the previous block, transaction data, and a timestamp.'] },
      { title: '🔗 Consensus Mechanisms', points: ['Proof of Work (PoW): Energy-intensive; used by Bitcoin.', 'Proof of Stake (PoS): Validators stake crypto to propose blocks; more energy-efficient.', 'Delegated PoS, Proof of Authority, BFT variants for enterprise chains.'] },
      { title: '📦 Use Cases', points: ['Cryptocurrency (Bitcoin, Ethereum)', 'Smart Contracts — self-executing code on-chain', 'DeFi, NFTs, Supply Chain, Healthcare records, Voting systems'] },
      { title: '⚠️ Limitations', points: ['Scalability trilemma: security, decentralisation, scalability — pick two.', 'High energy consumption for PoW chains.', 'Immutability complicates error correction.'] }
    ]
  },
  'cybersecurity': {
    heading: 'Cybersecurity — Threat Landscape & Defense',
    sections: [
      { title: '📌 CIA Triad', points: ['Confidentiality: protect data from unauthorised access.', 'Integrity: ensure data is accurate and unaltered.', 'Availability: ensure systems are accessible when needed.'] },
      { title: '🕵️ Common Threats', points: ['Phishing & Social Engineering', 'Malware: Ransomware, Trojans, Spyware', 'SQL Injection, XSS, CSRF (web vulnerabilities)', 'Man-in-the-Middle Attacks, Zero-Day Exploits'] },
      { title: '🛡️ Defence Strategies', points: ['Multi-Factor Authentication (MFA)', 'Zero Trust Architecture: never trust, always verify.', 'Encryption at rest and in transit (TLS 1.3, AES-256)', 'Regular penetration testing and red-team exercises.', 'SOC — Security Operations Centre for continuous monitoring.'] },
      { title: '📋 Frameworks', points: ['NIST Cybersecurity Framework', 'ISO/IEC 27001', 'MITRE ATT&CK Matrix'] }
    ]
  },
  'quantum computing': {
    heading: 'Quantum Computing — The Next Frontier',
    sections: [
      { title: '📌 Core Principles', points: ['Qubits can exist in superposition (0 and 1 simultaneously).', 'Entanglement: correlated qubits share quantum states over distance.', 'Quantum interference amplifies correct answers; cancels incorrect ones.'] },
      { title: '⚡ Quantum Advantage', points: ['Shor\'s Algorithm: factors large integers exponentially faster — threatens RSA.', 'Grover\'s Algorithm: quadratic speedup for unstructured search.', 'Quantum simulation for drug discovery and materials science.'] },
      { title: '🏗️ Hardware Approaches', points: ['Superconducting qubits (IBM, Google)', 'Trapped Ion (IonQ, Quantinuum)', 'Photonic, Topological, Neutral Atom platforms'] },
      { title: '🔮 Limitations', points: ['Decoherence: qubits are fragile; require near absolute-zero temperatures.', 'Error rates still too high for fault-tolerant computation at scale.', 'NISQ era — Noisy Intermediate-Scale Quantum devices are current state.'] }
    ]
  },
  'neural networks': {
    heading: 'Neural Networks — Architecture & Learning',
    sections: [
      { title: '📌 Fundamentals', points: ['Inspired by biological neurons; composed of layers of interconnected nodes.', 'Input Layer → Hidden Layer(s) → Output Layer.', 'Each connection has a weight; neurons apply an activation function.'] },
      { title: '🧠 Popular Architectures', points: ['Feedforward Network (MLP) — basic classification & regression.', 'Convolutional Neural Networks (CNN) — image recognition.', 'Recurrent Neural Networks (RNN, LSTM, GRU) — sequential data, NLP.', 'Transformers (Attention mechanism) — underpins GPT, BERT, Claude.', 'GANs — generative adversarial networks for synthetic data.'] },
      { title: '📐 Training', points: ['Forward pass → compute loss → backpropagation → gradient descent.', 'Optimisers: SGD, Adam, AdaGrad, RMSProp.', 'Regularisation: Dropout, L1/L2, Batch Normalisation.'] },
      { title: '🚀 Applications', points: ['Computer Vision, NLP, Speech Recognition, Drug Discovery, Autonomous Driving.'] }
    ]
  }
};

/* Default fallback for unrecognised topics */
function buildGenericNote(topic) {
  return {
    heading: `${topic} — AI-Generated Overview`,
    sections: [
      {
        title: '📌 Overview',
        points: [
          `${topic} is an evolving area with significant real-world impact.`,
          'Understanding its core principles enables better problem-solving.'
        ]
      },
      {
        title: '🔑 Key Concepts',
        points: [
          'Foundational theory and historical context.',
          'Modern developments and current research trends.',
          'Practical applications in industry and academia.'
        ]
      },
      {
        title: '⚙️ Tools & Technologies',
        points: [
          'Open-source libraries and frameworks to accelerate development.',
          'Cloud platforms for scalable deployment.',
          'Community resources: papers, courses, forums.'
        ]
      },
      {
        title: '🚀 Next Steps',
        points: [
          'Read foundational papers and documentation.',
          'Build small proof-of-concept projects.',
          'Join communities and contribute to open-source.'
        ]
      }
    ]
  };
}

window.generateNotes = () => {
  const topicEl  = $('#notesTopic');
  const outputEl = $('#notesOutput');
  const btnEl    = $('#generateBtn');
  const raw      = topicEl.value.trim();

  if (!raw) {
    showToast('⚠️  Please enter a topic');
    topicEl.focus();
    return;
  }

  const key  = raw.toLowerCase();
  const data = notesDB[key] || buildGenericNote(raw);

  /* Loading state */
  btnEl.disabled = true;
  btnEl.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Synthesising…';
  outputEl.innerHTML = '<div class="output-placeholder"><i class="fa-solid fa-brain fa-beat-fade"></i><p>Neural synthesis in progress…</p></div>';
  outputEl.classList.remove('has-content');

  setTimeout(() => {
    renderNotes(data, outputEl);
    btnEl.disabled = false;
    btnEl.innerHTML = '<i class="fa-solid fa-sparkles"></i> Generate';
    outputEl.classList.add('has-content');
    showToast('✦ Notes generated successfully');
  }, 1200);
};

function renderNotes(data, container) {
  let html = `<span class="note-heading">// ${data.heading}</span>`;
  data.sections.forEach(sec => {
    html += `<span class="note-heading">${sec.title}</span>`;
    sec.points.forEach(p => {
      html += `<span class="note-bullet">${p}</span>`;
    });
  });
  container.innerHTML = html;

  /* Staggered fade-in for each line */
  const lines = container.children;
  [...lines].forEach((line, i) => {
    line.style.opacity  = '0';
    line.style.transform = 'translateX(-8px)';
    line.style.transition = `opacity 0.3s ease ${i * 40}ms, transform 0.3s ease ${i * 40}ms`;
    setTimeout(() => {
      line.style.opacity  = '1';
      line.style.transform = 'translateX(0)';
    }, 50);
  });
}

window.quickTopic = topic => {
  $('#notesTopic').value = topic;
  generateNotes();
};

/* ─────────────────────────────────────────────────────────────
   TASK MANAGER
───────────────────────────────────────────────────────────── */
window.addTask = () => {
  const input    = $('#taskInput');
  const priority = $('#taskPriority');
  const text     = input.value.trim();

  if (!text) {
    showToast('⚠️  Task cannot be empty');
    input.focus();
    return;
  }

  const task = {
    id:        Date.now(),
    text,
    priority:  priority.value,
    completed: false,
    created:   new Date().toISOString()
  };

  state.tasks.unshift(task);
  saveTasks();
  input.value = '';
  renderTasks();
  updateStatCards();
  showToast('✦ Task added');
};

window.deleteTask = id => {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStatCards();
  showToast('🗑  Task removed');
};

window.toggleTask = id => {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStatCards();
    showToast(task.completed ? '✅ Task complete!' : '↩ Task reopened');
  }
};

window.filterTasks = (filter, btn) => {
  $$('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.currentFilter = filter;
  renderTasks();
};

window.clearCompleted = () => {
  const count = state.tasks.filter(t => t.completed).length;
  if (!count) { showToast('No completed tasks to clear'); return; }
  state.tasks = state.tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  updateStatCards();
  showToast(`🗑  Cleared ${count} completed task${count > 1 ? 's' : ''}`);
};

function saveTasks() {
  localStorage.setItem('nd_tasks', JSON.stringify(state.tasks));
}

function renderTasks() {
  const list = $('#taskList');

  let filtered = state.tasks;
  if (state.currentFilter === 'active')    filtered = state.tasks.filter(t => !t.completed);
  if (state.currentFilter === 'completed') filtered = state.tasks.filter(t => t.completed);

  if (!filtered.length) {
    list.innerHTML = `
      <div class="task-empty">
        <i class="fa-solid fa-inbox"></i>
        <p>${state.currentFilter === 'completed' ? 'No completed tasks yet.' : 'Your task list is clear!'}</p>
      </div>`;
  } else {
    list.innerHTML = filtered.map(t => `
      <li class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
        <div class="task-check ${t.completed ? 'checked' : ''}"
             onclick="toggleTask(${t.id})" role="checkbox" aria-checked="${t.completed}"></div>
        <span class="task-text">${escapeHtml(t.text)}</span>
        <span class="priority-badge ${t.priority}">${t.priority}</span>
        <button class="task-delete" onclick="deleteTask(${t.id})" aria-label="Delete task">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </li>`).join('');
  }

  /* Update count */
  const remaining = state.tasks.filter(t => !t.completed).length;
  $('#taskCount').textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─────────────────────────────────────────────────────────────
   POMODORO TIMER
───────────────────────────────────────────────────────────── */
function initTimerRingGradient() {
  const svg = $('svg.timer-ring');
  if (!svg) return;

  /* Remove old defs */
  const oldDefs = svg.querySelector('defs');
  if (oldDefs) oldDefs.remove();

  const ns   = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(ns, 'defs');
  const grad = document.createElementNS(ns, 'linearGradient');
  grad.setAttribute('id', 'ringGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
  grad.setAttribute('x2', '100%'); grad.setAttribute('y2', '100%');

  const computed = getComputedStyle(document.documentElement);
  const c1 = computed.getPropertyValue('--accent').trim()   || '#00f3ff';
  const c2 = computed.getPropertyValue('--accent-2').trim() || '#7b2fff';

  const s1 = document.createElementNS(ns, 'stop');
  s1.setAttribute('offset', '0%');
  s1.setAttribute('stop-color', c1);

  const s2 = document.createElementNS(ns, 'stop');
  s2.setAttribute('offset', '100%');
  s2.setAttribute('stop-color', c2);

  grad.appendChild(s1); grad.appendChild(s2);
  defs.appendChild(grad);
  svg.prepend(defs);
}

window.setMode = (minutes, label, el) => {
  clearInterval(timer.interval);
  timer.running   = false;
  timer.totalSec  = minutes * 60;
  timer.remainSec = minutes * 60;
  timer.mode      = label;

  $$('.pomo-mode').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  $('#playIcon').className        = 'fa-solid fa-play';
  $('#timerModeLabel').textContent = label;
  updateTimerDisplay();
  updateRing(1);
};

window.toggleTimer = () => {
  if (timer.running) {
    pauseTimer();
  } else {
    startTimer();
  }
};

function startTimer() {
  timer.running = true;
  $('#playIcon').className = 'fa-solid fa-pause';

  timer.interval = setInterval(() => {
    if (timer.remainSec <= 0) {
      clearInterval(timer.interval);
      timer.running = false;
      onTimerComplete();
      return;
    }
    timer.remainSec--;
    updateTimerDisplay();
    updateRing(timer.remainSec / timer.totalSec);
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer.interval);
  timer.running = false;
  $('#playIcon').className = 'fa-solid fa-play';
}

window.resetTimer = () => {
  clearInterval(timer.interval);
  timer.running   = false;
  timer.remainSec = timer.totalSec;
  $('#playIcon').className = 'fa-solid fa-play';
  updateTimerDisplay();
  updateRing(1);
};

window.skipSession = () => {
  clearInterval(timer.interval);
  timer.running = false;
  onTimerComplete();
};

function onTimerComplete() {
  playChime();

  if (timer.mode === 'Focus') {
    /* Record focus time */
    state.focusMinutes += Math.floor(timer.totalSec / 60);
    localStorage.setItem('nd_focus', state.focusMinutes);

    state.pomoCompleted++;
    localStorage.setItem('nd_pomo_done', state.pomoCompleted);

    /* Advance session dot */
    timer.session = (timer.session % 4) + 1;
    updateSessionDots();
    updatePomoStats();
    updateStatCards();

    showToast('🎉 Focus session complete! Take a break.');
    /* Auto-switch to short break */
    const shortBtn = $$('.pomo-mode')[1];
    setMode(state.pomoSettings.short, 'Short Break', shortBtn);
  } else {
    showToast('⏱ Break over! Back to focus.');
    const focusBtn = $$('.pomo-mode')[0];
    setMode(state.pomoSettings.focus, 'Focus', focusBtn);
  }

  $('#playIcon').className = 'fa-solid fa-play';
  updateTimerDisplay();
  updateRing(1);
}

function updateTimerDisplay() {
  const m = Math.floor(timer.remainSec / 60).toString().padStart(2, '0');
  const s = (timer.remainSec % 60).toString().padStart(2, '0');
  $('#timerDisplay').textContent  = `${m}:${s}`;
  $('#timerModeLabel').textContent = timer.mode;
  $('#sessionLabel').textContent   = `Session ${timer.session}`;
}

function updateRing(fraction) {
  const offset = timer.circumference * (1 - fraction);
  $('#ringProgress').setAttribute('stroke-dashoffset', offset.toFixed(2));
}

function updateSessionDots() {
  const dots = $$('.sdot');
  dots.forEach((d, i) => {
    d.classList.remove('active', 'done');
    if (i + 1 < timer.session)     d.classList.add('done');
    if (i + 1 === timer.session)   d.classList.add('active');
  });
}

function updatePomoStats() {
  const el = $('#pomoCompleted');
  const ft = $('#pomoFocusTotal');
  if (el) el.textContent = state.pomoCompleted;
  if (ft) ft.textContent = `${state.focusMinutes}m`;
}

/* Simple chime using Web Audio API */
function playChime() {
  if (!$('#soundSwitch')?.checked) return;
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  } catch (e) { /* Safari / older browsers silent fail */ }
}

/* ─────────────────────────────────────────────────────────────
   SETTINGS — Pomodoro adjusters
───────────────────────────────────────────────────────────── */
window.adjustPomo = (type, delta) => {
  const map = { focus: 'settingFocus', short: 'settingShort', long: 'settingLong' };
  const mins = { focus: [1, 90], short: [1, 30], long: [1, 60] };
  const el   = $(`#${map[type]}`);
  if (!el) return;

  let val = parseInt(el.textContent, 10) + delta;
  val = Math.max(mins[type][0], Math.min(mins[type][1], val));
  el.textContent = val;
  state.pomoSettings[type] = val;

  /* If currently in matching mode, update timer */
  const modeMap = { focus: 'Focus', short: 'Short Break', long: 'Long Break' };
  if (timer.mode === modeMap[type] && !timer.running) {
    timer.totalSec  = val * 60;
    timer.remainSec = val * 60;
    updateTimerDisplay();
    updateRing(1);
  }
};

function syncSettingsUI() {
  const sw = $('#darkModeSwitch');
  if (sw) sw.checked = state.theme === 'dark';

  const accentDots = $$('.color-dot');
  accentDots.forEach(d => {
    d.classList.toggle('active', d.dataset.color === state.accent);
  });
}

/* ─────────────────────────────────────────────────────────────
   VOICE INPUT — Web Speech API
───────────────────────────────────────────────────────────── */
let recognition = null;

document.addEventListener('DOMContentLoaded', () => {
  const voiceBtn    = $('#voiceBtn');
  const voiceBanner = $('#voiceBanner');
  const stopVoice   = $('#stopVoice');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceBtn.title = 'Voice input not supported in this browser';
    voiceBtn.style.opacity = '0.4';
    voiceBtn.onclick = () => showToast('⚠️ Voice input not supported in this browser');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.lang           = 'en-US';

  recognition.onstart = () => {
    voiceBtn.classList.add('recording');
    voiceBanner.classList.add('active');
    $('#voiceText').textContent = 'Listening… speak now';
  };

  recognition.onresult = e => {
    const transcript = [...e.results]
      .map(r => r[0].transcript)
      .join('');
    $('#voiceText').textContent = transcript;

    if (e.results[e.results.length - 1].isFinal) {
      /* Route transcript to whichever input is visible */
      const taskInput  = $('#taskInput');
      const notesInput = $('#notesTopic');
      const activeSection = $('section.active');

      if (activeSection?.id === 'section-tasks') {
        taskInput.value = transcript;
      } else if (activeSection?.id === 'section-ai-notes') {
        notesInput.value = transcript;
      } else {
        /* Default: task input */
        taskInput.value = transcript;
        switchSection('tasks');
      }
      stopRecognition();
      showToast('🎤 Voice captured');
    }
  };

  recognition.onerror = e => {
    stopRecognition();
    showToast(`🎤 Error: ${e.error}`);
  };

  recognition.onend = () => stopRecognition();

  voiceBtn.addEventListener('click', () => {
    if (voiceBtn.classList.contains('recording')) {
      recognition.stop();
    } else {
      try { recognition.start(); }
      catch (err) { showToast('🎤 Could not start voice recognition'); }
    }
  });

  stopVoice.addEventListener('click', () => {
    recognition.stop();
  });
});

function stopRecognition() {
  const voiceBtn    = $('#voiceBtn');
  const voiceBanner = $('#voiceBanner');
  voiceBtn.classList.remove('recording');
  voiceBanner.classList.remove('active');
}

/* ─────────────────────────────────────────────────────────────
   RESET ALL DATA
───────────────────────────────────────────────────────────── */
window.clearAllData = () => {
  if (!confirm('Reset all data? This cannot be undone.')) return;
  localStorage.clear();
  state.tasks         = [];
  state.focusMinutes  = 0;
  state.pomoCompleted = 0;
  timer.remainSec = timer.totalSec = 25 * 60;
  timer.running   = false;
  timer.session   = 1;
  clearInterval(timer.interval);
  updateTimerDisplay();
  updateRing(1);
  renderTasks();
  updateStatCards();
  updatePomoStats();
  showToast('🗑  All data reset');
};

/* ─────────────────────────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────────────────────────── */
let toastTimer = null;

function showToast(msg) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ─────────────────────────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  /* Alt + number to switch sections */
  const sections = ['dashboard', 'ai-notes', 'tasks', 'pomodoro', 'settings'];
  if (e.altKey && e.key >= '1' && e.key <= '5') {
    e.preventDefault();
    switchSection(sections[parseInt(e.key, 10) - 1]);
  }

  /* Space to toggle Pomodoro when focused on timer */
  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    const active = $('section.active');
    if (active?.id === 'section-pomodoro') {
      e.preventDefault();
      toggleTimer();
    }
  }
});

/* ─────────────────────────────────────────────────────────────
   SCROLL-INTO-SECTION helper (smooth)
───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Reinitialise ring on window resize */
  window.addEventListener('resize', debounce(initTimerRingGradient, 250));
});

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}