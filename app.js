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
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const mobileBackdrop = document.getElementById('mobile-backdrop');

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
    if (logCountEl) logCountEl.textContent = state.logs.length;
    const badgeAll = document.getElementById('badge-all');
    if (badgeAll) badgeAll.textContent = state.logs.length;

    const counts = { ERROR: 0, WARN: 0, HTTP: 0, INFO: 0 };
    state.logs.forEach((l) => {
      if (counts[l.level] !== undefined) counts[l.level]++;
    });

    const badgeErr = document.getElementById('badge-error');
    if (badgeErr) badgeErr.textContent = counts.ERROR;
    const badgeWarn = document.getElementById('badge-warn');
    if (badgeWarn) badgeWarn.textContent = counts.WARN;
    const badgeHttp = document.getElementById('badge-http');
    if (badgeHttp) badgeHttp.textContent = counts.HTTP;
    const badgeInfo = document.getElementById('badge-info');
    if (badgeInfo) badgeInfo.textContent = counts.INFO;
  }

  // Add a Log Entry
  function pushLog(log, animate = true) {
    state.logs.unshift(log);
    if (state.logs.length > 150) {
      state.logs.pop(); // Keep memory lean
    }
    renderLogs();

    if (animate && logStreamList) {
      const firstRow = logStreamList.querySelector('.log-row');
      if (firstRow && firstRow.classList) {
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
    const fallbackVersion = 'v1.9.0';

    try {
      const res = await fetch(`https://registry.npmjs.org/${pkgName}/latest`);
      if (res.ok) {
        const data = await res.json();
        const ver = 'v' + (data.version || '1.9.0');
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
        const ver = 'v' + ((data['dist-tags'] && data['dist-tags'].latest) || '1.9.0');
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

  // Fetch Live NPM Download Stats with Accurate Calculation as per Days Launched
  async function fetchNpmStats() {
    const pkgName = 'tracernest-logger';
    // Package was officially launched on November 16, 2026
    const launchDate = new Date('2026-11-16T00:00:00Z');
    const now = new Date();
    const daysSinceLaunch = Math.max(1, Math.round((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Accurate verified baseline based on NPM registry metrics (5,505 total downloads across 10 days)
    const fallbackStats = {
      daily: Math.round(5505 / daysSinceLaunch).toLocaleString() + '+',
      weekly: '2,975+',
      total: '5,505+'
    };

    let totalDownloads = 5505;

    // 1. Fetch total downloads since launch (last-month encompasses entire lifetime)
    try {
      const resMonthly = await fetch(`https://api.npmjs.org/downloads/point/last-month/${pkgName}`);
      if (resMonthly.ok) {
        const m = await resMonthly.json();
        if (typeof m.downloads === 'number' && m.downloads > 0) {
          totalDownloads = m.downloads;
          if (npmMonthly) npmMonthly.textContent = m.downloads.toLocaleString() + '+';
        } else if (npmMonthly) {
          npmMonthly.textContent = fallbackStats.total;
        }
      } else if (npmMonthly) {
        npmMonthly.textContent = fallbackStats.total;
      }
    } catch (e) {
      if (npmMonthly) npmMonthly.textContent = fallbackStats.total;
    }

    // 2. Compute accurate Daily Downloads as per days since launch
    if (npmDaily) {
      const dailyCount = Math.round(totalDownloads / daysSinceLaunch);
      npmDaily.textContent = dailyCount.toLocaleString() + '+';
    }

    // 3. Fetch past 7 days (weekly) downloads
    try {
      const resWeekly = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkgName}`);
      if (resWeekly.ok) {
        const w = await resWeekly.json();
        if (typeof w.downloads === 'number' && w.downloads > 0) {
          if (npmWeekly) npmWeekly.textContent = w.downloads.toLocaleString() + '+';
        } else if (npmWeekly) {
          npmWeekly.textContent = fallbackStats.weekly;
        }
      } else if (npmWeekly) {
        npmWeekly.textContent = fallbackStats.weekly;
      }
    } catch (e) {
      if (npmWeekly) npmWeekly.textContent = fallbackStats.weekly;
    }
  }

  // Fetch GitHub Contributors dynamically with Lead Maintainer pinned and Join card appended
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
          <span class="contributor-role">Creator &amp; Lead Maintainer</span>
          <span class="contributor-commits">${maintainerItem ? maintainerItem.contributions + ' commits' : 'Project Creator'}</span>
        </div>
        <a href="https://github.com/ankit-kumar-khandelwal" target="_blank" rel="noopener noreferrer" class="contributor-gh-link" title="View GitHub Profile">
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
          <a href="${c.html_url}" target="_blank" rel="noopener noreferrer" class="contributor-gh-link" title="View GitHub Profile">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            <span>@${c.login}</span>
          </a>
        `;
        contributorsGrid.appendChild(card);
      });

      // Join Contributor Invitation Card
      const joinCard = document.createElement('div');
      joinCard.className = 'contributor-card join-contributor-card';
      joinCard.innerHTML = `
        <div class="contributor-avatar-wrap">
          <div class="avatar-placeholder-dashed" title="Become a contributor">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
        </div>
        <div class="contributor-meta">
          <h4>Your Name Here</h4>
          <span class="contributor-role">Future Contributor</span>
          <span class="contributor-commits">Submit your first PR</span>
        </div>
        <a href="#contribute" class="contributor-gh-link join-link">
          <span>View Open Tracks &darr;</span>
        </a>
      `;
      contributorsGrid.appendChild(joinCard);
    } catch (e) {
      // Fallback is preserved in static HTML
    }
  }

  // Fetch Advisor Credits strictly from CREDITS.md on GitHub
  async function fetchCredits() {
    const creditsGrid = document.getElementById('credits-grid');
    if (!creditsGrid) return;

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function getInitials(name) {
      if (!name) return 'TN';
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    // Credits must be fetched always from this file on GitHub not any other
    const CREDITS_URL = 'https://raw.githubusercontent.com/ankit-kumar-khandelwal/tracernest-logger/main/CREDITS.md';
    let raw = '';
    try {
      const res = await fetch(CREDITS_URL, { cache: 'no-cache' });
      if (res.ok) {
        raw = await res.text();
      }
    } catch (e) {
      console.warn('Failed to fetch CREDITS.md from GitHub:', e);
    }

    if (!raw) {
      // If network is offline and grid already has content, preserve it
      if (creditsGrid.querySelector('.credit-card')) return;
      creditsGrid.innerHTML = `
        <div class="credits-status">
          Advisors are credited directly in <a href="https://github.com/ankit-kumar-khandelwal/tracernest-logger/blob/main/CREDITS.md" target="_blank" rel="noopener noreferrer" style="color:var(--teal-400);text-decoration:underline;">CREDITS.md</a>.
        </div>`;
      return;
    }

    // Strip HTML comments to ignore draft or template entries
    const cleaned = raw.replace(/<!--[\s\S]*?-->/g, '');
    const sections = cleaned.split(/\r?\n(?=##\s+)/);
    const advisors = [];

    for (const sec of sections) {
      const trimmed = sec.trim();
      if (!trimmed.startsWith('##')) continue;
      const lines = trimmed.split(/\r?\n/);
      const name = lines[0].replace(/^##\s+/, '').trim();
      if (!name || name.toLowerCase().includes('advisor credits') || name.toLowerCase().includes('credits')) continue;

      let role = '';
      let focus = '';
      let quote = '';
      let profile = '';

      for (let i = 1; i < lines.length; i++) {
        const l = lines[i].trim();
        const mRole = l.match(/^\*\*Role:\*\*\s*(.*)$/i);
        if (mRole) role = mRole[1].trim();
        const mFocus = l.match(/^\*\*Focus:\*\*\s*(.*)$/i);
        if (mFocus) focus = mFocus[1].trim();
        const mQuote = l.match(/^\*\*Quote:\*\*\s*(.*)$/i);
        if (mQuote) quote = mQuote[1].trim();
        const mProf = l.match(/^\*\*Profile:\*\*\s*(.*)$/i);
        if (mProf) profile = mProf[1].trim();
      }

      if (quote.startsWith('"') && quote.endsWith('"')) {
        quote = quote.slice(1, -1);
      }
      if (quote.startsWith('“') && quote.endsWith('”')) {
        quote = quote.slice(1, -1);
      }
      if (quote.startsWith('«') && quote.endsWith('»')) {
        quote = quote.slice(1, -1);
      }

      if (name && role && quote) {
        advisors.push({ name, role, focus, quote, profile });
      }
    }

    if (advisors.length === 0) {
      if (creditsGrid.querySelector('.credit-card')) return;
      creditsGrid.innerHTML = `
        <div class="credits-status">
          No advisor credits found in <a href="https://github.com/ankit-kumar-khandelwal/tracernest-logger/blob/main/CREDITS.md" target="_blank" rel="noopener noreferrer" style="color:var(--teal-400);text-decoration:underline;">CREDITS.md</a>.
        </div>`;
      return;
    }

    creditsGrid.innerHTML = '';
    advisors.forEach((adv) => {
      const card = document.createElement('div');
      card.className = 'credit-card';
      const initials = getInitials(adv.name);
      let footerHtml = '';
      if (adv.profile && adv.profile.startsWith('http')) {
        const isLinkedIn = adv.profile.includes('linkedin.com');
        footerHtml = `
          <div class="credit-card-footer">
            <a href="${escapeHtml(adv.profile)}" target="_blank" rel="noopener noreferrer" class="btn-credit-linkedin" title="View ${escapeHtml(adv.name)}'s ${isLinkedIn ? 'LinkedIn Profile' : 'Profile'}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${isLinkedIn 
                  ? '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>'
                  : '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>'
                }
              </svg>
              <span>${isLinkedIn ? 'LinkedIn Profile &nearr;' : 'View Profile &nearr;'}</span>
            </a>
          </div>`;
      }
      card.innerHTML = `
        <div class="credit-card-top">
          <div class="credit-avatar" aria-hidden="true">${escapeHtml(initials)}</div>
          <div class="credit-person-info">
            <h3 class="credit-name">${escapeHtml(adv.name)}</h3>
            <div class="credit-role">${escapeHtml(adv.role)}</div>
            ${adv.focus ? `<span class="credit-tag">${escapeHtml(adv.focus)}</span>` : ''}
          </div>
        </div>
        <p class="credit-quote">&ldquo;${escapeHtml(adv.quote)}&rdquo;</p>
        ${footerHtml}
      `;
      creditsGrid.appendChild(card);
    });
  }

  // Dark Mode Initialization and Toggle
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('tracernest-theme', nextTheme);
    } catch (e) {}
  }

  function initTheme() {
    try {
      const savedTheme = localStorage.getItem('tracernest-theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
  }

  // Prepopulate Initial Data for Demo Simulator
  function initInitialLogs() {
    if (typeof SAMPLE_LOG_TEMPLATES !== 'undefined' && Array.isArray(SAMPLE_LOG_TEMPLATES)) {
      SAMPLE_LOG_TEMPLATES.forEach((tpl) => {
        state.logs.push(createLogRecord(tpl));
      });
      renderLogs();
    }
  }

  // Setup Event Listeners
  function initEvents() {
    // Stream Toggle
    if (btnToggleStream) {
      btnToggleStream.addEventListener('click', () => {
        if (state.isStreaming) {
          pauseStreaming();
        } else {
          startStreaming();
        }
      });
    }

    // Simulate Error Button
    if (btnSimulateError) {
      btnSimulateError.addEventListener('click', () => {
        const errorTemplate = SAMPLE_LOG_TEMPLATES.find((t) => t.level === 'ERROR');
        pushLog(createLogRecord(errorTemplate), true);

        // Friendly community hint in live console
        if (!state.hasSimulatedCommunityHint) {
          state.hasSimulatedCommunityHint = true;
          setTimeout(() => {
            pushLog({
              id: 'star_' + Date.now().toString(36),
              timestamp: formatTime(new Date()),
              level: 'INFO',
              service: 'community',
              method: 'STAR',
              path: '/repos/ankit-kumar-khandelwal/tracernest-logger',
              statusCode: 200,
              duration: 0.2,
              ip: '127.0.0.1',
              memory: '0.0MB',
              payload: {
                message: "⭐ Zero-port telemetry captured! If TracerNest saves you debugging time, consider starring on GitHub & contributing!",
                repo: "https://github.com/ankit-kumar-khandelwal/tracernest-logger"
              },
              isNew: true
            }, false);
          }, 900);
        }
      });
    }

    // Simulate HTTP Button
    if (btnSimulateHttp) {
      btnSimulateHttp.addEventListener('click', () => {
        const httpTemplate = SAMPLE_LOG_TEMPLATES.find((t) => t.level === 'HTTP');
        pushLog(createLogRecord(httpTemplate), true);
      });
    }

    // Clear Logs
    if (btnClearLogs) {
      btnClearLogs.addEventListener('click', () => {
        state.logs = [];
        renderLogs();
      });
    }

    // Filter Pills
    if (filterPills) {
      filterPills.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          filterPills.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.filterLevel = btn.dataset.level;
          renderLogs();
        });
      });
    }

    // Search Input
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.searchQuery = e.target.value;
          renderLogs();
        }, 150);
      });
    }

    // Regex Toggle
    if (regexToggleBtn) {
      regexToggleBtn.addEventListener('click', () => {
        state.isRegex = !state.isRegex;
        regexToggleBtn.classList.toggle('active', state.isRegex);
        renderLogs();
      });
    }

    // Decrypt Button
    if (btnToggleDecrypt) {
      btnToggleDecrypt.addEventListener('click', () => {
        state.isDecrypted = !state.isDecrypted;
        updateModalPayloadView();
      });
    }

    // Modal Close
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnModalDismiss) btnModalDismiss.addEventListener('click', closeModal);
    if (logModal) {
      logModal.addEventListener('click', (e) => {
        if (e.target === logModal) closeModal();
      });
    }

    // Copy Install Command
    if (copyInstallBtn) {
      copyInstallBtn.addEventListener('click', () => {
        const textToCopy = 'npm install tracernest-logger';
        navigator.clipboard.writeText(textToCopy).then(() => {
          const span = copyInstallBtn.querySelector('span');
          const orig = span ? span.textContent : 'Copy';
          if (span) span.textContent = 'Copied!';
          copyInstallBtn.style.background = 'var(--teal-600)';
          copyInstallBtn.style.color = '#ffffff';
          copyInstallBtn.style.borderColor = 'var(--teal-600)';
          setTimeout(() => {
            if (span) span.textContent = orig;
            copyInstallBtn.style.background = '';
            copyInstallBtn.style.color = '';
            copyInstallBtn.style.borderColor = '';
          }, 2000);
        });
      });
    }

    // Copy Email Buttons (handles multiple copy-email triggers across pages)
    document.querySelectorAll('.copy-email-mini-btn, #btn-copy-email').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const email = 'ankitkhandelwal0003@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          const span = btn.querySelector('span');
          const orig = span ? span.textContent : 'Copy';
          if (span) span.textContent = 'Copied!';
          btn.style.background = 'var(--teal-600)';
          btn.style.color = '#ffffff';
          btn.style.borderColor = 'var(--teal-600)';
          setTimeout(() => {
            if (span) span.textContent = orig;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
        });
      });
    });

    // Mobile Navigation Menu Toggle & Handlers
    function closeMobileMenu() {
      if (mobileMenuToggle) {
        mobileMenuToggle.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
      if (navLinks) {
        navLinks.classList.remove('open');
      }
      if (mobileBackdrop) {
        mobileBackdrop.classList.remove('open');
      }
      document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
      const isOpen = navLinks && navLinks.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        if (mobileMenuToggle) {
          mobileMenuToggle.classList.add('open');
          mobileMenuToggle.setAttribute('aria-expanded', 'true');
        }
        if (navLinks) {
          navLinks.classList.add('open');
        }
        if (mobileBackdrop) {
          mobileBackdrop.classList.add('open');
        }
        document.body.style.overflow = 'hidden';
      }
    }

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
      });
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    if (navLinks) {
      navLinks.querySelectorAll('.nav-link-item').forEach((link) => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (navLinks && navLinks.classList.contains('open')) {
          closeMobileMenu();
        }
        if (logModal && logModal.style.display === 'flex') {
          closeModal();
        }
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960 && navLinks && navLinks.classList.contains('open')) {
        closeMobileMenu();
      }
    });

    // Theme Toggle Handler
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Interactive Contact Form (if present on Contact Page)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = (document.getElementById('contact-name')?.value || '').trim();
        const email = (document.getElementById('contact-email')?.value || '').trim();
        const country = (document.getElementById('contact-country')?.value || '').trim();
        const topic = (document.getElementById('contact-topic')?.value || '').trim();
        const message = (document.getElementById('contact-message')?.value || '').trim();
        const statusEl = document.getElementById('contact-form-status');

        if (!name || !email || !message) {
          if (statusEl) {
            statusEl.textContent = 'Please fill in all required fields (Name, Email, Message).';
            statusEl.className = 'contact-form-status error';
          }
          return;
        }

        const subject = encodeURIComponent(`[TracerNest Inquiry - ${country || 'Global'}] ${topic}: ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCountry: ${country}\nTopic: ${topic}\n\nMessage:\n${message}\n\n--\nSent via TracerNest Contact Portal`);
        
        if (statusEl) {
          statusEl.innerHTML = 'Opening email client... You can also email directly: <a href="mailto:ankitkhandelwal0003@gmail.com" style="color:var(--teal-400);text-decoration:underline;">ankitkhandelwal0003@gmail.com</a>';
          statusEl.className = 'contact-form-status success';
        }

        window.location.href = `mailto:ankitkhandelwal0003@gmail.com?subject=${subject}&body=${body}`;
      });
    }
  }

  // Floating Star Toast Notification
  function initFloatingStarToast() {
    const toast = document.getElementById('floating-star-toast');
    const closeBtn = document.getElementById('toast-close-btn');
    const starBtn = document.getElementById('toast-star-btn');
    const reviewBtn = document.getElementById('toast-review-btn');
    const contributeBtn = document.getElementById('toast-contribute-btn');
    if (!toast) return;

    const DISMISS_KEY = 'tracernest_star_toast_dismissed';
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      // Re-prompt after 7 days if previously dismissed
      if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    } catch (e) {}

    // Display toast after a short delay (3.5 seconds)
    setTimeout(() => {
      toast.style.display = 'block';
    }, 3500);

    function dismissToast() {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 250);
      try {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      } catch (e) {}
    }

    if (closeBtn) closeBtn.addEventListener('click', dismissToast);
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => {
        setTimeout(dismissToast, 1200);
      });
    }
    if (starBtn) {
      starBtn.addEventListener('click', () => {
        setTimeout(dismissToast, 1200);
      });
    }
    if (contributeBtn) {
      contributeBtn.addEventListener('click', () => {
        setTimeout(dismissToast, 600);
      });
    }
  }

  // Default Embedded Technical Articles (Derived from BLOGS.md for zero-latency offline/instant readiness)
  const DEFAULT_BLOG_ARTICLES = [
  {
    "title": "Errsole Alternative for Node.js: Why Zero-Port Telemetry is Replacing Heavy APM Daemons",
    "slug": "errsole-alternative-nodejs-zero-port-telemetry",
    "date": "2026-11-20",
    "author": "Ankit Khandelwal",
    "readTime": "6 min read",
    "tags": [
      "Node.js",
      "Errsole Alternative",
      "Zero-Port",
      "Observability"
    ],
    "summary": "Discover how TracerNest provides an embedded Errsole-style log dashboard directly on your application port with zero extra open ports, zero dependencies, and authenticated AES-256-GCM encryption.",
    "content": "### The Problem with Traditional Log Dashboards\nWhen managing production microservices in Node.js, engineering teams frequently rely on logging dashboards like Errsole, Winston with Express-Winston, or SaaS platforms like Datadog and Sentry. However, traditional dashboard tools introduce two significant engineering compromises:\n1. **Secondary TCP Ports:** Most self-hosted log viewers spin up an independent HTTP/WebSocket server on a dedicated port (e.g. 8001 or 9200). In containerized Kubernetes, AWS ECS, or Docker environments, opening extra ports requires modifying ingress controllers, updating AWS Security Group ingress rules, and handling cross-origin authentication headers.\n2. **Heavy Dependency Trees:** Many log packages pull 40+ transitive npm packages (Express middleware, database drivers, WebSockets,Lodash, etc.), expanding your attack surface and introducing recurring CVE alerts.\n\n### The Zero-Port Architecture Solution\nTracerNest took a fundamentally different approach. Instead of creating a new server instance, TracerNest hooks natively into your application's existing HTTP request router (Express, Koa, Fastify, or vanilla Node.js `http`).\nWhen a client hits your configured dashboard endpoint—such as `GET /tracernest`—the TracerNest middleware intercepts the request on the exact same port your API is already running on:\n```javascript\nconst express = require('express');\nconst { tracerNest } = require('tracernest-logger');\n\nconst app = express();\n\n// Single-line middleware hooks telemetry on your existing port (e.g. 3000)\napp.use(tracerNest({\n  path: '/tracernest',\n  storage: 'sqlite', // or 'mysql'\n  auth: { user: process.env.TN_USER, pass: process.env.TN_PASS }\n}));\n\napp.listen(3000, () => console.log('Server and TracerNest Vault running on port 3000'));\n```\nNo firewall updates. No extra ports. Zero SaaS subscription bills.\n\n---"
  },
  {
    "title": "How to Encrypt Application Logs with AES-256-GCM in Node.js (Zero Dependencies)",
    "slug": "encrypt-application-logs-aes-256-gcm-nodejs",
    "date": "2026-11-22",
    "author": "Ankit Khandelwal",
    "readTime": "7 min read",
    "tags": [
      "Security",
      "Cryptography",
      "AES-256-GCM",
      "Node.js"
    ],
    "summary": "Step-by-step guide on implementing hardware-accelerated authenticated log encryption at rest using Node's standard crypto module with zero external dependencies.",
    "content": "### Why Plaintext Logs Are a Critical Liability\nApplication logs frequently contain sensitive customer data: PII, authorization tokens, session cookies, database connection strings, and user emails captured in uncaught exception stack traces. If a database backup leaks or an unauthorized actor gains read access to the SQLite file or MySQL replica, plaintext logs immediately trigger severe compliance breaches under GDPR, HIPAA, and SOC2.\n\n### Implementing Authenticated AES-256-GCM\nAES-GCM (Galois/Counter Mode) provides both confidentiality and tamper-proof message authenticity. Unlike legacy CBC or ECB modes, GCM produces a 128-bit authentication tag that immediately detects bit-flipping and tampering:\n```javascript\nconst crypto = require('node:crypto');\n\nfunction encryptPayload(plaintext, masterKeyHex) {\n  const masterKey = Buffer.from(masterKeyHex, 'hex'); // 32 bytes (256 bits)\n  const iv = crypto.randomBytes(12); // NIST recommended 96-bit nonce\n\n  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);\n  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);\n  const authTag = cipher.getAuthTag(); // 16 bytes authentication tag\n\n  return {\n    cipherText: encrypted.toString('base64'),\n    iv: iv.toString('hex'),\n    authTag: authTag.toString('hex')\n  };\n}\n```\nTracerNest incorporates this cryptographic pipeline by default. Plaintext logs never touch physical disk or database storage—only the local `.master.key` (with strict `0600` file permissions) can decrypt the log stream.\n\n---"
  },
  {
    "title": "Self-Hosted Logging in Laravel 13: Bridging Monolog with Zero Extra Ports",
    "slug": "self-hosted-logging-laravel-13-monolog-bridge",
    "date": "2026-11-24",
    "author": "Ankit Khandelwal",
    "readTime": "5 min read",
    "tags": [
      "Laravel 13",
      "PHP",
      "Monolog",
      "Telemetry"
    ],
    "summary": "How to seamlessly correlate PHP request lifecycles, route durations, and exception stack traces in Laravel 13 directly with TracerNest's unified log vault.",
    "content": "### Bridging the Monolog Ecosystem\nLaravel 13 continues PHP's modern evolution with PHP 8.2+ type safety and lightning-fast route dispatch. However, logging in distributed microservices where PHP backends communicate with Node.js APIs often leads to fragmented log silos.\n\nTracerNest provides the `tracernest-laravel` bridge, a native Monolog handler and HTTP middleware package that routes Laravel application telemetry into the same encrypted SQLite or MySQL storage as your Node.js services.\n\n### Installation & Middleware Registration\nIn your `config/logging.php`:\n```php\n'channels' => [\n    'tracernest' => [\n        'driver' => 'custom',\n        'via' => \\TracerNest\\Laravel\\TracerNestLogger::class,\n        'level' => env('LOG_LEVEL', 'debug'),\n    ],\n],\n```\nWhen an HTTP request triggers an exception or database query delay, TracerNest records:\n- The correlation ID (`x-request-id`)\n- Controller execution duration\n- Memory peak consumption\n- SQL query execution plan and duration\nAll encrypted at rest without background Redis/RabbitMQ queue workers.\n\n---"
  },
  {
    "title": "Zero-Downtime SQLite to MySQL Auto-Migration: Production Architecture Guide",
    "slug": "zero-downtime-sqlite-to-mysql-migration",
    "date": "2026-11-25",
    "author": "Ankit Khandelwal",
    "readTime": "8 min read",
    "tags": [
      "Databases",
      "SQLite",
      "MySQL",
      "Migrations"
    ],
    "summary": "An architectural deep dive into TracerNest's automated database transition pipeline that scales single-node SQLite logging into high-throughput enterprise MySQL clusters.",
    "content": "### Why Start with SQLite WAL?\nFor single-container applications, edge deployments, and development environments, SQLite with Write-Ahead Logging (`PRAGMA journal_mode = WAL`) offers astonishingly low read/write latency. Readers do not block writers, and zero setup is required.\n\n### The Challenge of Scaling to Multi-Instance Clusters\nWhen your application scales out horizontally across multiple Kubernetes pods or autoscaling server groups, SQLite's single-node file lock becomes a bottleneck. Distributed microservices require a centralized storage backend such as MySQL or MariaDB.\n\n### Automated Schema Drift & Data Migration\nInstead of requiring manual database migration scripts, TracerNest detects when your configuration changes from `storage: 'sqlite'` to `storage: 'mysql'`:\n1. **Schema Verification:** Connects to MySQL and checks for table existence and missing columns using `information_schema.columns`.\n2. **Non-Destructive DDL:** Automatically executes `ALTER TABLE logs ADD COLUMN ...` for any newly added telemetry fields.\n3. **Data Transfer:** Safely migrates existing records from the local `.db` SQLite file into MySQL in streaming batches.\n4. **Vault Preservation:** Preserves your existing `.master.key`, ensuring historical encrypted entries remain readable in the embedded dashboard.\n\n---"
  },
  {
    "title": "Eliminating Supply Chain Vulnerabilities in Node.js Observability Pipelines",
    "slug": "eliminating-supply-chain-vulnerabilities-nodejs",
    "date": "2026-11-26",
    "author": "Ankit Khandelwal",
    "readTime": "6 min read",
    "tags": [
      "Node.js",
      "AppSec",
      "Supply Chain",
      "Zero-Dependencies"
    ],
    "summary": "Why minimizing external npm dependencies is the most effective security practice for enterprise production telemetry.",
    "content": "### The State of NPM Dependency Sprawl\nThe modern JavaScript ecosystem is heavily reliant on open-source packages. A standard `npm install winston` can easily introduce dozens of transitive dependencies. If a single maintainer account is compromised, malicious code can be injected into millions of running servers (as demonstrated in real-world incidents like `event-stream` and `colors.js`).\n\n### Zero Runtime Dependencies by Design\nTracerNest enforces a strict architectural rule: `dependencies: {}` in `package.json`.\n- Cryptography uses `node:crypto`.\n- HTTP routing and dashboard UI delivery use `node:http`.\n- Database operations use `node:sqlite` (native in Node.js 22+) and native MySQL TCP protocol implementation.\nBy avoiding third-party packages, TracerNest delivers:\n- Zero audit warnings (`0 vulnerabilities`).\n- Negligible container image footprint.\n- Instant cold starts for AWS Lambda, Cloudflare Workers, and Docker containers.\n\n---"
  },
  {
    "title": "Global Telemetry Architecture: Self-Hosting Logs Across US, EU, and APAC",
    "slug": "global-telemetry-architecture-self-hosting-logs",
    "date": "2026-11-27",
    "author": "Ankit Khandelwal",
    "readTime": "7 min read",
    "tags": [
      "Global Architecture",
      "Infrastructure",
      "Data Sovereignty",
      "Cloud"
    ],
    "summary": "How distributed engineering teams across the United States, India, Netherlands, Poland, Canada, Germany, United Kingdom, Brazil, and Ireland deploy self-hosted TracerNest nodes.",
    "content": "### Observability in a Multi-Region World\nModern software organizations rarely deploy to a single datacenter. With traffic spanning North America, Europe, Latin America, and the Asia-Pacific region, data sovereignty and latency considerations dictate where logs must be stored:\n- **Europe (Netherlands, Germany, Poland, Ireland):** Strict adherence to GDPR and local data residency mandates that customer telemetry never leaves European Union borders.\n- **North America (United States, Canada):** High-throughput microservice clusters require instant query response times without cross-region internet latency.\n- **Emerging Tech Hubs (India, Brazil):** High-growth platforms experience explosive API volume where third-party SaaS per-gigabyte ingestion fees can exceed server costs.\n\nBy running self-hosted TracerNest instances locally within each regional cluster, organizations maintain complete data sovereignty, eliminate cross-region egress costs, and retain microsecond log capture speeds."
  }
];

  // Blogs System: Instant Search, Tag Filter, Live Hydration from BLOGS.md & Article Reader Modal
  function initBlogs() {
    const grid = document.getElementById('blogs-grid');
    if (!grid) return;

    const searchInput = document.getElementById('blog-search-input');
    const filterPillsContainer = document.getElementById('blog-filter-pills');
    const readerModal = document.getElementById('blog-reader-modal');
    const modalTitle = document.getElementById('modal-article-title');
    const modalTag = document.getElementById('modal-article-tag');
    const modalDate = document.getElementById('modal-article-date');
    const modalReadTime = document.getElementById('modal-article-readtime');
    const modalAuthor = document.getElementById('modal-article-author');
    const modalBody = document.getElementById('modal-article-body');
    const modalClose = document.getElementById('modal-article-close');
    const modalCloseBottom = document.getElementById('modal-article-close-bottom');

    // Default to embedded articles immediately
    let articles = DEFAULT_BLOG_ARTICLES.slice();
    let activeTag = 'all';
    let searchQuery = '';

    // Markdown Parser for Article Body (Safe & Zero-dependency)
    function renderMarkdownToHtml(md) {
      if (!md) return '';
      let html = md;

      // Code blocks ```lang ... ```
      html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
        const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<div class="blog-code-block"><div class="blog-code-header"><span>' + (lang || 'code') + '</span></div><pre><code>' + escaped + '</code></pre></div>';
      });

      // Inline code `code`
      html = html.replace(/`([^`]+)`/g, '<code class="blog-inline-code">$1</code>');

      // Headings ### and ####
      html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
      html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

      // Bold & Italic
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Links [text](url)
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="blog-content-link">$1</a>');

      // Unordered lists - item
      html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
      // Numbered lists 1. item
      html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="blog-num-li">$1</li>');

      // Wrap consecutive <li> into <ul>
      html = html.replace(/(<li>[\s\S]*?<\/li>)/gi, '<ul>$1</ul>');
      html = html.replace(/<\/ul>\s*<ul>/gi, '');

      // Paragraphs
      const lines = html.split(/\n{2,}/);
      html = lines.map(block => {
        block = block.trim();
        if (!block) return '';
        if (block.startsWith('<h') || block.startsWith('<div') || block.startsWith('<ul') || block.startsWith('<ol')) {
          return block;
        }
        return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
      }).join('\n');

      return html;
    }

    // Parse BLOGS.md into structured articles array
    function parseBlogsMarkdown(mdText) {
      if (!mdText) return [];
      const sections = mdText.split(/\n(?=## )/);
      const list = [];
      for (const sec of sections) {
        if (!sec.trim().startsWith('## ')) continue;
        const lines = sec.trim().split('\n');
        const titleLine = lines[0].replace(/^##\s+/, '').trim();
        let slug = '';
        let date = '';
        let author = 'Ankit Khandelwal';
        let readTime = '5 min read';
        let tags = [];
        let summary = '';
        const bodyLines = [];
        let inBody = false;

        for (let i = 1; i < lines.length; i++) {
          const l = lines[i].trimEnd();
          if (!inBody) {
            if (l.startsWith('**Slug:**')) {
              slug = l.replace('**Slug:**', '').trim();
            } else if (l.startsWith('**Date:**')) {
              date = l.replace('**Date:**', '').trim();
            } else if (l.startsWith('**Author:**')) {
              author = l.replace('**Author:**', '').trim();
            } else if (l.startsWith('**ReadTime:**')) {
              readTime = l.replace('**ReadTime:**', '').trim();
            } else if (l.startsWith('**Tags:**')) {
              tags = l.replace('**Tags:**', '').split(',').map(t => t.trim());
            } else if (l.startsWith('**Summary:**')) {
              summary = l.replace('**Summary:**', '').trim();
              inBody = true;
            }
          } else {
            bodyLines.push(l);
          }
        }

        if (titleLine) {
          list.push({
            title: titleLine,
            slug: slug || titleLine.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            date: date || '2026-11-27',
            author: author,
            readTime: readTime,
            tags: tags,
            summary: summary,
            content: bodyLines.join('\n').trim()
          });
        }
      }
      return list;
    }

    // Open Reader Modal for Article
    function openArticleReader(article) {
      if (!readerModal || !article) return;
      if (modalTitle) modalTitle.textContent = article.title;
      if (modalTag) modalTag.textContent = article.tags && article.tags[0] ? article.tags[0] : 'Engineering';
      if (modalDate) modalDate.textContent = article.date;
      if (modalReadTime) modalReadTime.textContent = article.readTime;
      if (modalAuthor) modalAuthor.textContent = article.author;
      if (modalBody) modalBody.innerHTML = renderMarkdownToHtml(article.content);

      readerModal.style.display = 'flex';
      readerModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      history.replaceState(null, '', '#' + article.slug);
    }

    function closeArticleReader() {
      if (!readerModal) return;
      readerModal.style.display = 'none';
      readerModal.classList.remove('active');
      document.body.style.overflow = '';
      if (window.location.hash.startsWith('#') && window.location.hash !== '#') {
        history.replaceState(null, '', window.location.pathname);
      }
    }

    if (modalClose) modalClose.addEventListener('click', closeArticleReader);
    if (modalCloseBottom) modalCloseBottom.addEventListener('click', closeArticleReader);
    if (readerModal) {
      readerModal.addEventListener('click', (e) => {
        if (e.target === readerModal) closeArticleReader();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && readerModal && (readerModal.style.display === 'flex' || readerModal.classList.contains('active'))) {
        closeArticleReader();
      }
    });

    // Render Cards in Grid
    function renderCards(articleList) {
      grid.innerHTML = '';
      if (!articleList || articleList.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">' +
          '<p style="font-size: 1.15rem; margin-bottom: 0.5rem;">No technical guides found matching your query.</p>' +
          '<button class="btn btn-secondary-outline btn-sm" id="btn-reset-filters">Reset Search</button>' +
        '</div>';
        const resetBtn = document.getElementById('btn-reset-filters');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            searchQuery = '';
            activeTag = 'all';
            if (filterPillsContainer) {
              filterPillsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tag') === 'all'));
            }
            applyFilters();
          });
        }
        return;
      }

      articleList.forEach(art => {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.setAttribute('data-tags', (art.tags || []).join(', '));
        card.setAttribute('data-slug', art.slug);

        const tagsHtml = (art.tags || []).map(t => '<span class="blog-tag">' + t + '</span>').join(' ');

        card.innerHTML =
          '<div class="blog-card-meta">' +
            '<span class="blog-card-date">' + art.date + '</span>' +
            '<span class="blog-card-dot">&bull;</span>' +
            '<span class="blog-card-read">' + art.readTime + '</span>' +
          '</div>' +
          '<h2 class="blog-card-title">' +
            '<a href="#' + art.slug + '" class="blog-title-link">' + art.title + '</a>' +
          '</h2>' +
          '<p class="blog-card-excerpt">' + art.summary + '</p>' +
          '<div class="blog-card-tags">' + tagsHtml + '</div>' +
          '<div class="blog-card-footer">' +
            '<span class="blog-author-by">By <strong>' + art.author + '</strong></span>' +
            '<a href="#' + art.slug + '" class="btn btn-secondary-outline blog-read-btn">Read Article &rarr;</a>' +
          '</div>';

        grid.appendChild(card);
      });
    }

    // Apply Filter & Search
    function applyFilters() {
      const q = searchQuery.toLowerCase().trim();
      const filtered = articles.filter(art => {
        const matchesQuery = !q ||
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          (art.tags || []).some(t => t.toLowerCase().includes(q));

        const matchesTag = activeTag === 'all' ||
          (art.tags || []).some(t => t.toLowerCase() === activeTag.toLowerCase());

        return matchesQuery && matchesTag;
      });

      renderCards(filtered);
    }

    // Event Delegation for Grid (Guarantees clicks work on any card at any time!)
    grid.addEventListener('click', (e) => {
      const readBtn = e.target.closest('.blog-read-btn');
      const titleLink = e.target.closest('.blog-title-link');
      if (readBtn || titleLink) {
        e.preventDefault();
        const card = (readBtn || titleLink).closest('.blog-card');
        const slug = card ? card.getAttribute('data-slug') : null;
        if (slug) {
          const found = articles.find(a => a.slug === slug || a.slug.includes(slug) || slug.includes(a.slug));
          if (found) {
            openArticleReader(found);
            return;
          }
        }
      }
    });

    // Event Delegation for Filter Buttons
    if (filterPillsContainer) {
      filterPillsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        filterPillsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTag = btn.getAttribute('data-tag') || 'all';
        applyFilters();
      });
    }

    // Search Input Listeners (input and keyup for immediate responsive filtering)
    if (searchInput) {
      const onSearch = (e) => {
        searchQuery = e.target.value;
        applyFilters();
      };
      searchInput.addEventListener('input', onSearch);
      searchInput.addEventListener('keyup', onSearch);
    }

    function checkUrlHash() {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      const cleanSlug = hash.replace(/^article-/, '');
      const found = articles.find(a => a.slug === cleanSlug || a.slug.includes(cleanSlug) || cleanSlug.includes(a.slug));
      if (found) {
        openArticleReader(found);
      }
    }

    window.addEventListener('hashchange', checkUrlHash);

    // Initial render using default embedded articles (immediate, 0 latency)
    renderCards(articles);
    checkUrlHash();

    // Background fetch & live hydration from BLOGS.md
    function fetchAndHydrate() {
      fetch('./BLOGS.md')
        .then(res => {
          if (!res.ok) throw new Error('Local BLOGS.md HTTP status: ' + res.status);
          return res.text();
        })
        .catch(() => {
          // Fallback to GitHub raw repository
          return fetch('https://raw.githubusercontent.com/ankit-kumar-khandelwal/tracernest-landing-page/main/BLOGS.md')
            .then(res => {
              if (!res.ok) throw new Error('GitHub raw HTTP status: ' + res.status);
              return res.text();
            });
        })
        .then(mdText => {
          const parsed = parseBlogsMarkdown(mdText);
          if (parsed && parsed.length > 0) {
            articles = parsed;
            applyFilters();
            checkUrlHash();
          }
        })
        .catch(err => {
          // Silent fallback - embedded articles are already active
          console.info('TracerNest Blog: Running on embedded articles (' + articles.length + ' articles active)');
        });
    }

    fetchAndHydrate();
  }

  // Initialize Application
  function init() {
    initTheme();
    if (document.getElementById('log-stream')) {
      initInitialLogs();
      startStreaming();
    }
    initEvents();
    fetchDynamicVersion();
    fetchNpmStats();
    if (document.getElementById('contributors-grid')) {
      fetchContributors();
    }
    if (document.getElementById('credits-grid')) {
      fetchCredits();
    }
    if (document.getElementById('blogs-grid')) {
      initBlogs();
    }
    initFloatingStarToast();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
