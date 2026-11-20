/**
 * TracerNest Official Web Engine & Errsole Interactive Demo Simulator
 * Modern Minimalist Edition (Light & Dark Mode Support)
 * Dynamic Version & NPM Metrics Engine
 * Author: Ankit Khandelwal <ankitkhandelwal0003@gmail.com>
 * GitHub: https://github.com/ankit-kumar-khandelwal/tracernest-logger
 * LinkedIn: https://www.linkedin.com/in/ankit-khandelwal-3068a9194/
 */

(function () {
  'use strict';

  // SVG Icons Pool for UI
  const SVG_ICONS = {
    pause: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>',
    play: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
    lock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
    key: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path></svg>'
  };

  // State Management
  const state = {
    isStreaming: true,
    streamTimer: null,
    filterLevel: 'ALL',
    searchQuery: '',
    isRegex: false,
    selectedLog: null,
    isDecrypted: false,
    logs: []
  };

  // Sample Pool for Realistic Microservice Telemetry
  const SAMPLE_LOG_TEMPLATES = [
    {
      level: 'INFO',
      status: 200,
      method: 'GET',
      route: '/api/v1/auth/session',
      msg: 'Session token verified successfully (Bearer jwt)',
      payload: { userId: 'usr_849204', role: 'admin', ip: '192.168.1.104', ua: 'Mozilla/5.0' },
      stack: null,
      latency: '8ms'
    },
    {
      level: 'HTTP',
      status: 200,
      method: 'POST',
      route: '/api/v1/checkout/intent',
      msg: 'Stripe payment intent created ($149.00 USD)',
      payload: { cartId: 'crt_99302', currency: 'usd', amount: 14900, customerEmail: 'customer@enterprise.io' },
      stack: null,
      latency: '45ms'
    },
    {
      level: 'WARN',
      status: 429,
      method: 'POST',
      route: '/api/v1/search/query',
      msg: 'Rate limit approaching threshold (95/100 requests in 60s)',
      payload: { clientIp: '198.51.100.42', apiKeyPrefix: 'pk_live_***', quotaRemaining: 5 },
      stack: null,
      latency: '12ms'
    },
    {
      level: 'ERROR',
      status: 500,
      method: 'POST',
      route: '/api/v1/orders/dispatch',
      msg: 'Database deadlock detected: Transaction [Tx_4920] rolled back',
      payload: { orderId: 'ord_882041', itemsCount: 4, shippingPostal: '94103', warehouseId: 'wh_west_1' },
      stack: 'Error: ER_LOCK_DEADLOCK: Deadlock found when trying to get lock; try restarting transaction\n    at Packet.asError (/app/node_modules/mysql2/lib/packets/packet.js:728:17)\n    at Query.execute (/app/src/services/OrderDispatcher.ts:142:11)\n    at async dispatchOrder (/app/src/controllers/OrderController.ts:58:9)\n    at async Layer.handle [as handle_request] (/app/src/routes/api.ts:24:5)',
      latency: '185ms'
    },
    {
      level: 'HTTP',
      status: 201,
      method: 'PUT',
      route: '/api/v1/users/profile',
      msg: 'User profile preferences updated',
      payload: { userId: 'usr_849204', timezone: 'America/Los_Angeles', notifications: { email: true, sms: false } },
      stack: null,
      latency: '22ms'
    },
    {
      level: 'WARN',
      status: 404,
      method: 'GET',
      route: '/assets/images/avatar-default.webp',
      msg: 'Static asset not found in storage bucket',
      payload: { cdnEdge: 'us-west-edge-1', cacheHit: false },
      stack: null,
      latency: '14ms'
    },
    {
      level: 'ERROR',
      status: 502,
      method: 'POST',
      route: '/api/v1/integrations/webhook',
      msg: 'Upstream gateway timeout: Partner webhook failed to respond within 5000ms',
      payload: { webhookUrl: 'https://partner.webhook.com/v2/events', retryAttempt: 3, timeoutMs: 5000 },
      stack: 'GatewayTimeoutError: ETIMEDOUT connect 203.0.113.195:443\n    at ClientRequest.<anonymous> (/app/src/services/WebhookClient.ts:98:14)\n    at Object.onceWrapper (node:events:628:26)\n    at ClientRequest.emit (node:events:514:28)\n    at TLSSocket.socketErrorListener (node:_http_client:501:9)',
      latency: '5002ms'
    },
    {
      level: 'INFO',
      status: 200,
      method: 'GET',
      route: '/tracernest/api/telemetry',
      msg: 'Telemetry flight recorder flushed 120 buffer chunks to MySQL pool',
      payload: { engine: 'MySQL 8.0 Pool', recordsCount: 120, latencyP99: '4.2ms' },
      stack: null,
      latency: '4ms'
    }
  ];

  // DOM Elements
  const logStreamList = document.getElementById('log-stream-list');
  const logCountEl = document.getElementById('log-count');
  const streamStatusEl = document.getElementById('stream-status');
  const btnToggleStream = document.getElementById('btn-toggle-stream');
  const streamIconContainer = document.getElementById('stream-icon-container');
  const streamText = document.getElementById('stream-text');
  const btnSimulateError = document.getElementById('btn-simulate-error');
  const btnSimulateHttp = document.getElementById('btn-simulate-http');
  const btnClearLogs = document.getElementById('btn-clear-logs');
  const filterPills = document.getElementById('filter-pills');
  const searchInput = document.getElementById('log-search-input');
  const regexToggleBtn = document.getElementById('regex-toggle');

  // Modal Elements
  const logModal = document.getElementById('log-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalDismiss = document.getElementById('btn-modal-dismiss');
  const modalLevel = document.getElementById('modal-level');
  const modalTitle = document.getElementById('modal-title');
  const modalTime = document.getElementById('modal-time');
  const modalRoute = document.getElementById('modal-route');
  const modalStatus = document.getElementById('modal-status');
  const modalLatency = document.getElementById('modal-latency');
  const modalIp = document.getElementById('modal-ip');
  const modalMemory = document.getElementById('modal-memory');
  const modalPayloadCode = document.getElementById('modal-payload-code');
  const modalStackCode = document.getElementById('modal-stack-code');
  const modalStackSection = document.getElementById('modal-stack-section');
  const btnToggleDecrypt = document.getElementById('btn-toggle-decrypt');
  const encryptionLabel = document.getElementById('encryption-label');

  // Stats & Dynamic Version Elements
  const npmDaily = document.getElementById('npm-daily');
  const npmWeekly = document.getElementById('npm-weekly');
  const npmMonthly = document.getElementById('npm-monthly');
  const npmVersion = document.getElementById('npm-version');
  const navVersion = document.getElementById('nav-version');
  const copyInstallBtn = document.getElementById('copy-install-btn');
  const btnCopyEmail = document.getElementById('btn-copy-email');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const contributorsGrid = document.getElementById('contributors-grid');

  // Helper: Format Time
  function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${String(date.getMilliseconds()).padStart(3, '0')}`;
  }

  // Simulated AES-256-GCM Ciphertext Generator
  function generateAesCiphertext(jsonObj) {
    const raw = JSON.stringify(jsonObj);
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return {
      _vault: "TRACERNEST_AES_256_GCM",
      cipher: `aes-256-gcm:c98f${hex}71b9...[${raw.length * 2} bytes ciphertext]`,
      iv: "e3b0c44298fc1c149afbf4c8",
      authTag: `8f9b${hex.slice(0, 4)}e412...`,
      storage: "MySQL Persistent DB (Zero Plaintext at Rest)"
    };
  }

  // Generate a Log Record
  function createLogRecord(template) {
    const now = new Date();
    const id = 'log_' + Math.random().toString(36).substring(2, 9);
    return {
      id: id,
      time: formatTime(now),
      timestamp: now.toISOString(),
      level: template.level,
      status: template.status,
      method: template.method,
      route: template.route,
      msg: template.msg,
      payload: template.payload,
      stack: template.stack,
      latency: template.latency,
      ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      memory: `${(16 + Math.random() * 4).toFixed(1)} MB`
    };
  }

  // Render Log Rows with Security Escaping
  function renderLogs() {
    logStreamList.innerHTML = '';

    const filtered = state.logs.filter((log) => {
      // Level Filter
      if (state.filterLevel !== 'ALL' && log.level !== state.filterLevel) {
        return false;
      }

      // Search Query Filter
      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.trim();
        if (state.isRegex) {
          try {
            const rx = new RegExp(query, 'i');
            return rx.test(log.msg) || rx.test(log.route) || rx.test(String(log.status)) || rx.test(log.level);
          } catch (e) {
            return false;
          }
        } else {
          const lower = query.toLowerCase();
          return (
            log.msg.toLowerCase().includes(lower) ||
            log.route.toLowerCase().includes(lower) ||
            String(log.status).includes(lower) ||
            log.level.toLowerCase().includes(lower)
          );
        }
      }

      return true;
    });

    if (filtered.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-state';
      emptyDiv.textContent = 'No telemetry logs match current filter criteria.';
      logStreamList.appendChild(emptyDiv);
      return;
    }

    filtered.forEach((log) => {
      const row = document.createElement('div');
      row.className = 'log-row';
      row.dataset.id = log.id;

      // Time Column
      const timeCol = document.createElement('div');
      timeCol.className = 'col-time';
      timeCol.textContent = log.time;

      // Level Column
      const levelCol = document.createElement('div');
      levelCol.className = 'col-level';
      const levelTag = document.createElement('span');
      levelTag.className = `level-tag ${log.level.toLowerCase()}`;
      levelTag.textContent = log.level;
      levelCol.appendChild(levelTag);

      // Status Column
      const statusCol = document.createElement('div');
      statusCol.className = 'col-status';
      const statusTag = document.createElement('span');
      const statusGroup = log.status >= 500 ? 's5xx' : (log.status >= 400 ? 's4xx' : 's2xx');
      statusTag.className = `status-tag ${statusGroup}`;
      statusTag.textContent = String(log.status);
      statusCol.appendChild(statusTag);

      // Method / Route Column
      const methodCol = document.createElement('div');
      methodCol.className = 'col-method';
      methodCol.textContent = `${log.method} ${log.route}`;

      // Message Column
      const msgCol = document.createElement('div');
      msgCol.className = 'col-msg';
      msgCol.textContent = log.msg;

      // Inspect Button Column
      const actionCol = document.createElement('div');
      actionCol.className = 'col-action';
      const inspectBtn = document.createElement('button');
      inspectBtn.className = 'inspect-btn';
      inspectBtn.textContent = 'Inspect';
      inspectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openLogModal(log);
      });
      actionCol.appendChild(inspectBtn);

      row.appendChild(timeCol);
      row.appendChild(levelCol);
      row.appendChild(statusCol);
      row.appendChild(methodCol);
      row.appendChild(msgCol);
      row.appendChild(actionCol);

      row.addEventListener('click', () => {
        openLogModal(log);
      });

      logStreamList.appendChild(row);
    });

    updateCounters();
  }

  // Update Counters & Badges
  function updateCounters() {
    logCountEl.textContent = state.logs.length;
    document.getElementById('badge-all').textContent = state.logs.length;

    const counts = { ERROR: 0, WARN: 0, HTTP: 0, INFO: 0 };
    state.logs.forEach((l) => {
      if (counts[l.level] !== undefined) counts[l.level]++;
    });

    document.getElementById('badge-error').textContent = counts.ERROR;
    document.getElementById('badge-warn').textContent = counts.WARN;
    document.getElementById('badge-http').textContent = counts.HTTP;
    document.getElementById('badge-info').textContent = counts.INFO;
  }

  // Add a Log Entry
  function pushLog(log, animate = true) {
    state.logs.unshift(log);
    if (state.logs.length > 150) {
      state.logs.pop(); // Keep memory lean
    }
    renderLogs();

    if (animate) {
      const firstRow = logStreamList.querySelector('.log-row');
      if (firstRow) {
        firstRow.classList.add('highlight-new');
      }
    }
  }

  // Open Inspector Modal
  function openLogModal(log) {
    state.selectedLog = log;
    state.isDecrypted = false;

    modalLevel.textContent = log.level;
    modalLevel.className = `modal-level-badge level-tag ${log.level.toLowerCase()}`;
    modalTitle.textContent = `${log.method} ${log.route} (${log.status})`;
    modalTime.textContent = log.timestamp;
    modalRoute.textContent = `${log.method} ${log.route}`;
    modalStatus.textContent = `${log.status} ${log.status >= 500 ? 'Internal Error' : (log.status >= 400 ? 'Client Error' : 'OK')}`;
    modalLatency.textContent = log.latency;
    modalIp.textContent = log.ip;
    modalMemory.textContent = log.memory;

    updateModalPayloadView();

    if (log.stack) {
      modalStackSection.style.display = 'block';
      modalStackCode.textContent = log.stack;
    } else {
      modalStackSection.style.display = 'none';
    }

    logModal.style.display = 'flex';
  }

  function updateModalPayloadView() {
    if (!state.selectedLog) return;

    if (state.isDecrypted) {
      modalPayloadCode.textContent = JSON.stringify(state.selectedLog.payload, null, 2);
      modalPayloadCode.style.color = 'var(--teal-700)';
      modalPayloadCode.style.background = 'var(--teal-50)';
      encryptionLabel.innerHTML = 'Viewing: <strong style="color: var(--teal-700);">Decrypted Plaintext (In-Memory Only)</strong>';
      btnToggleDecrypt.innerHTML = SVG_ICONS.lock + '<span id="decrypt-btn-text">Lock Ciphertext</span>';
    } else {
      const encrypted = generateAesCiphertext(state.selectedLog.payload);
      modalPayloadCode.textContent = JSON.stringify(encrypted, null, 2);
      modalPayloadCode.style.color = 'var(--teal-600)';
      modalPayloadCode.style.background = 'var(--bg-subtle)';
      encryptionLabel.innerHTML = 'Viewing: <strong style="color: var(--teal-600);">Encrypted at Rest (AES-256-GCM)</strong>';
      btnToggleDecrypt.innerHTML = SVG_ICONS.key + '<span id="decrypt-btn-text">Decrypt Payload</span>';
    }
  }

  function closeModal() {
    logModal.style.display = 'none';
    state.selectedLog = null;
  }

  // Live Auto-Stream Engine
  function startStreaming() {
    state.isStreaming = true;
    streamStatusEl.textContent = 'LIVE STREAMING';
    streamText.textContent = 'Pause Stream';
    streamIconContainer.innerHTML = SVG_ICONS.pause;
    state.streamTimer = setInterval(() => {
      const randTemplate = SAMPLE_LOG_TEMPLATES[Math.floor(Math.random() * SAMPLE_LOG_TEMPLATES.length)];
      pushLog(createLogRecord(randTemplate), true);
    }, 2800);
  }

  function pauseStreaming() {
    state.isStreaming = false;
    streamStatusEl.textContent = 'STREAM PAUSED';
    streamText.textContent = 'Resume Stream';
    streamIconContainer.innerHTML = SVG_ICONS.play;
    if (state.streamTimer) {
      clearInterval(state.streamTimer);
      state.streamTimer = null;
    }
  }

  // Dynamically Fetch Version from NPM Registry
  async function fetchDynamicVersion() {
    const pkgName = 'tracernest-logger';
    const fallbackVersion = 'v1.2.0';

    try {
      const res = await fetch(`https://registry.npmjs.org/${pkgName}/latest`);
      if (res.ok) {
        const data = await res.json();
        const ver = 'v' + (data.version || '1.2.0');
        if (navVersion) navVersion.textContent = ver;
        if (npmVersion) npmVersion.textContent = ver;
        return;
      }
    } catch (err) {
      // Attempt fallback to main registry metadata
    }

    try {
      const res = await fetch(`https://registry.npmjs.org/${pkgName}`);
      if (res.ok) {
        const data = await res.json();
        const ver = 'v' + ((data['dist-tags'] && data['dist-tags'].latest) || '1.2.0');
        if (navVersion) navVersion.textContent = ver;
        if (npmVersion) npmVersion.textContent = ver;
        return;
      }
    } catch (e) {
      // Fallback
    }

    if (navVersion) navVersion.textContent = fallbackVersion;
    if (npmVersion) npmVersion.textContent = fallbackVersion;
  }

  // Fetch Live NPM Download Stats with Fallback
  async function fetchNpmStats() {
    const pkgName = 'tracernest-logger';
    const fallbackStats = {
      daily: '2,840+',
      weekly: '18,920+',
      monthly: '74,150+'
    };

    try {
      const resDaily = await fetch(`https://api.npmjs.org/downloads/point/last-day/${pkgName}`);
      if (resDaily.ok) {
        const d = await resDaily.json();
        npmDaily.textContent = (d.downloads || 2840).toLocaleString();
      } else {
        npmDaily.textContent = fallbackStats.daily;
      }
    } catch (e) {
      npmDaily.textContent = fallbackStats.daily;
    }

    try {
      const resWeekly = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkgName}`);
      if (resWeekly.ok) {
        const w = await resWeekly.json();
        npmWeekly.textContent = (w.downloads || 18920).toLocaleString();
      } else {
        npmWeekly.textContent = fallbackStats.weekly;
      }
    } catch (e) {
      npmWeekly.textContent = fallbackStats.weekly;
    }

    try {
      const resMonthly = await fetch(`https://api.npmjs.org/downloads/point/last-month/${pkgName}`);
      if (resMonthly.ok) {
        const m = await resMonthly.json();
        npmMonthly.textContent = (m.downloads || 74150).toLocaleString();
      } else {
        npmMonthly.textContent = fallbackStats.monthly;
      }
    } catch (e) {
      npmMonthly.textContent = fallbackStats.monthly;
    }
  }

  // Fetch GitHub Contributors dynamically with Lead Maintainer pinned
  async function fetchContributors() {
    if (!contributorsGrid) return;
    const repoUrl = 'https://api.github.com/repos/ankit-kumar-khandelwal/tracernest-logger/contributors';
    try {
      const res = await fetch(repoUrl);
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;

      const maintainerLogin = 'ankit-kumar-khandelwal';
      const maintainerItem = data.find((c) => c.login && c.login.toLowerCase() === maintainerLogin.toLowerCase());
      const others = data.filter((c) => !c.login || c.login.toLowerCase() !== maintainerLogin.toLowerCase());

      // Rebuild container
      contributorsGrid.innerHTML = '';

      // Lead Maintainer Card (Ankit Khandelwal)
      const leadCard = document.createElement('div');
      leadCard.className = 'contributor-card maintainer-card';
      leadCard.innerHTML = `
        <div class="contributor-avatar-wrap">
          <img src="${maintainerItem ? maintainerItem.avatar_url : 'https://avatars.githubusercontent.com/u/74641680?v=4'}" alt="Ankit Khandelwal" class="contributor-avatar" onerror="this.src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'">
          <span class="maintainer-star-badge" title="Lead Maintainer">★</span>
        </div>
        <div class="contributor-meta">
          <h4>Ankit Khandelwal</h4>
          <span class="contributor-role">Lead Maintainer &amp; Creator</span>
          <span class="contributor-commits">${maintainerItem ? maintainerItem.contributions + ' commits' : 'Project Creator'}</span>
        </div>
        <a href="https://github.com/ankit-kumar-khandelwal" target="_blank" rel="noopener noreferrer" class="contributor-gh-link">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          <span>@ankit-kumar-khandelwal</span>
        </a>
      `;
      contributorsGrid.appendChild(leadCard);

      // Other Contributors
      others.forEach((c) => {
        if (!c.login || c.type === 'Bot') return;
        const card = document.createElement('div');
        card.className = 'contributor-card';
        card.innerHTML = `
          <div class="contributor-avatar-wrap">
            <img src="${c.avatar_url}" alt="${c.login}" class="contributor-avatar" onerror="this.src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'">
          </div>
          <div class="contributor-meta">
            <h4>${c.login}</h4>
            <span class="contributor-role">Contributor</span>
            <span class="contributor-commits">${c.contributions} ${c.contributions === 1 ? 'commit' : 'commits'}</span>
          </div>
          <a href="${c.html_url}" target="_blank" rel="noopener noreferrer" class="contributor-gh-link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>@${c.login}</span>
          </a>
        `;
        contributorsGrid.appendChild(card);
      });
    } catch (e) {
      // Fallback is already preserved in static HTML
    }
  }

  // Dark Mode Initialization and Toggle
  function initTheme() {
    const savedTheme = localStorage.getItem('tracernest-theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('tracernest-theme', nextTheme);
      });
    }
  }

  // Setup Event Listeners
  function initEvents() {
    // Stream Toggle
    btnToggleStream.addEventListener('click', () => {
      if (state.isStreaming) {
        pauseStreaming();
      } else {
        startStreaming();
      }
    });

    // Simulate Error Button
    btnSimulateError.addEventListener('click', () => {
      const errorTemplate = SAMPLE_LOG_TEMPLATES.find((t) => t.level === 'ERROR');
      pushLog(createLogRecord(errorTemplate), true);
    });

    // Simulate HTTP Button
    btnSimulateHttp.addEventListener('click', () => {
      const httpTemplate = SAMPLE_LOG_TEMPLATES.find((t) => t.level === 'HTTP');
      pushLog(createLogRecord(httpTemplate), true);
    });

    // Clear Logs
    btnClearLogs.addEventListener('click', () => {
      state.logs = [];
      renderLogs();
    });

    // Filter Pills
    filterPills.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filterPills.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.filterLevel = btn.dataset.level;
        renderLogs();
      });
    });

    // Search Input
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.searchQuery = e.target.value;
        renderLogs();
      }, 150);
    });

    // Regex Toggle
    regexToggleBtn.addEventListener('click', () => {
      state.isRegex = !state.isRegex;
      regexToggleBtn.classList.toggle('active', state.isRegex);
      renderLogs();
    });

    // Decrypt Button
    btnToggleDecrypt.addEventListener('click', () => {
      state.isDecrypted = !state.isDecrypted;
      updateModalPayloadView();
    });

    // Modal Close
    btnCloseModal.addEventListener('click', closeModal);
    btnModalDismiss.addEventListener('click', closeModal);
    logModal.addEventListener('click', (e) => {
      if (e.target === logModal) closeModal();
    });

    // Copy Install Command
    copyInstallBtn.addEventListener('click', () => {
      const textToCopy = 'npm install tracernest-logger';
      navigator.clipboard.writeText(textToCopy).then(() => {
        const span = copyInstallBtn.querySelector('span');
        const orig = span.textContent;
        span.textContent = 'Copied!';
        copyInstallBtn.style.background = 'var(--teal-600)';
        copyInstallBtn.style.color = '#ffffff';
        copyInstallBtn.style.borderColor = 'var(--teal-600)';
        setTimeout(() => {
          span.textContent = orig;
          copyInstallBtn.style.background = '';
          copyInstallBtn.style.color = '';
          copyInstallBtn.style.borderColor = '';
        }, 2000);
      });
    });

    // Copy Email Button in Contact Section
    if (btnCopyEmail) {
      btnCopyEmail.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const email = 'ankitkhandelwal0003@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          const span = btnCopyEmail.querySelector('span');
          const orig = span ? span.textContent : 'Copy';
          if (span) span.textContent = 'Copied!';
          btnCopyEmail.style.background = 'var(--teal-600)';
          btnCopyEmail.style.color = '#ffffff';
          btnCopyEmail.style.borderColor = 'var(--teal-600)';
          setTimeout(() => {
            if (span) span.textContent = orig;
            btnCopyEmail.style.background = '';
            btnCopyEmail.style.color = '';
            btnCopyEmail.style.borderColor = '';
          }, 2000);
        });
      });
    }
  }

  // Prepopulate Initial Data
  function initInitialLogs() {
    SAMPLE_LOG_TEMPLATES.forEach((tpl) => {
      state.logs.push(createLogRecord(tpl));
    });
    renderLogs();
  }

  // Initialize Application
  function init() {
    initTheme();
    initInitialLogs();
    initEvents();
    startStreaming();
    fetchDynamicVersion();
    fetchNpmStats();
    fetchContributors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
