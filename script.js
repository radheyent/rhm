/* ==========================================================
   RICKY // HACKING MACHINE
   100% client-side visual simulation.
   No network requests, no storage, no real credential handling.
   ========================================================== */

(() => {
  'use strict';

  /* ---------- State ---------- */
  const state = {
    soundOn: true,
    duration: 60,
    remaining: 60,
    timerHandle: null,
    tickHandle: null,
    paused: false,
    stageIndex: 0,
    opId: '',
    audioCtx: null,
  };

  /* ---------- Utility ---------- */
  const $ = (id) => document.getElementById(id);
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const hexChunk = (len) => Array.from({ length: len }, () => rand(0, 15).toString(16)).join('');
  const pad2 = (n) => n.toString().padStart(2, '0');

  function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
  }

  /* ---------- Sound (Web Audio API, local only) ---------- */
  function ensureAudio() {
    if (!state.audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) state.audioCtx = new AC();
    }
    return state.audioCtx;
  }

  function blip(freq = 440, dur = 0.05, type = 'square', vol = 0.04) {
    if (!state.soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now);
    osc.stop(now + dur);
  }

  function keyClick() { blip(rand(180, 260), 0.02, 'square', 0.02); }
  function stageChime() { blip(660, 0.09, 'sine', 0.05); setTimeout(() => blip(880, 0.09, 'sine', 0.04), 90); }
  function warnTone() { blip(180, 0.18, 'sawtooth', 0.05); }
  function successFanfare() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'triangle', 0.05), i * 110));
  }
  function dramaticSting() {
    blip(120, 0.4, 'sawtooth', 0.06);
    setTimeout(() => blip(80, 0.5, 'square', 0.05), 150);
  }

  /* ---------- Matrix background ---------- */
  function initMatrix() {
    const canvas = $('matrix-bg');
    const ctx = canvas.getContext('2d');
    let w, h, cols, drops;
    const chars = 'アイウエオカキクケコ01{}<>[]#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / 16);
      drops = Array.from({ length: cols }, () => rand(0, h / 16));
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = 'rgba(6,8,7,0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#3dff8a';
      ctx.font = '14px monospace';
      for (let i = 0; i < drops.length; i++) {
        const text = pick(chars);
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- Clock ---------- */
  function initClock() {
    function tick() {
      const now = new Date();
      $('sysClock').textContent = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Controls: sound / fullscreen ---------- */
  function initTopControls() {
    $('soundToggle').addEventListener('click', () => {
      state.soundOn = !state.soundOn;
      $('soundToggle').textContent = state.soundOn ? '🔊' : '🔇';
      if (state.soundOn) blip(440, 0.05);
    });

    $('fullscreenToggle').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });
  }

  /* ---------- Screen 1 -> 2: Boot sequence ---------- */
  const bootMessages = [
    'Initializing secure environment...',
    'Loading simulation kernel...',
    'Establishing encrypted visual channel...',
    'Loading analysis modules...',
    'Verifying sandbox...',
    'Simulation environment confirmed.',
    'Target interface initialized.',
    'Awaiting operator input...'
  ];

  function runBootSequence() {
    switchScreen('screen-boot');
    const term = $('bootTerminal');
    term.innerHTML = '';
    const fill = $('bootProgressFill');
    const pct = $('bootProgressPct');
    fill.style.width = '0%';
    pct.textContent = '0%';

    let i = 0;
    let progress = 0;

    function nextLine() {
      if (i >= bootMessages.length) {
        setTimeout(() => runTargetForm(), 500);
        return;
      }
      const line = document.createElement('div');
      line.className = 'boot-line' + (Math.random() > 0.7 ? ' dim' : '');
      term.appendChild(line);
      typeText(line, bootMessages[i], 14, () => {
        keyClick();
        i++;
        progress = Math.min(100, Math.round((i / bootMessages.length) * 100));
        fill.style.width = progress + '%';
        pct.textContent = progress + '%';
        term.scrollTop = term.scrollHeight;
        setTimeout(nextLine, 160 + rand(0, 220));
      });
    }
    nextLine();
  }

  function typeText(el, text, speed, done) {
    let idx = 0;
    (function step() {
      if (idx <= text.length) {
        el.textContent = text.slice(0, idx);
        idx++;
        if (idx % 3 === 0) keyClick();
        setTimeout(step, speed);
      } else if (done) done();
    })();
  }

  function runTargetForm() {
    switchScreen('screen-form');
  }

  /* ---------- Screen 3 -> 4: Form submit ---------- */
  function initForm() {
    $('targetForm').addEventListener('submit', (e) => {
      e.preventDefault();
      state.duration = parseInt($('opDuration').value, 10) || 60;
      state.remaining = state.duration;

      // Clear password field immediately; never read/stored beyond this point.
      $('targetPassword').value = '';

      startSimulation();
    });
  }

  /* ---------- Screen 4: Hacking simulation ---------- */
  const terminalLines = [
    { t: '[OK] Initializing analysis engine', c: '' },
    { t: '[OK] Target profile loaded', c: '' },
    { t: '[RUN] Mapping digital footprint...', c: '' },
    { t: '[RUN] Analyzing encrypted structures...', c: '' },
    { t: '[SIM] Generating packet sequence...', c: 'sim' },
    { t: '[SIM] Reconstructing data architecture...', c: 'sim' },
    { t: '[WARN] Security layer detected', c: 'warn' },
    { t: '[SIM] Attempting visual bypass...', c: 'sim' },
    { t: '[OK] Simulation layer synchronized', c: '' },
    { t: '[RUN] Parsing target metadata...', c: '' },
    { t: '[RUN] Generating entropy map...', c: '' },
    { t: '[SIM] Simulating packet reconstruction...', c: 'sim' },
    { t: '[WARN] Security layer detected...', c: 'warn' },
    { t: '[RUN] Switching analysis protocol...', c: '' },
    { t: '[RUN] Running deep profile simulation...', c: '' },
    { t: '[SIM] Generating encrypted response...', c: 'sim' },
    { t: '[RUN] Rechecking integrity...', c: '' },
    { t: '[RUN] Final analysis in progress...', c: '' },
  ];

  const sqlCommands = [
    'SELECT target_profile FROM simulation_core;',
    'ANALYZE digital_signature;',
    'SCAN security_layers;',
    'VERIFY simulation_access;',
    'GENERATE intelligence_report;'
  ];

  const suspenseEvents = [
    'SECURITY ANOMALY DETECTED',
    'ENCRYPTION LAYER IDENTIFIED',
    'SECONDARY DEFENSE ACTIVE'
  ];

  const stageNames = [
    'TARGET ANALYSIS', 'IDENTITY RESOLUTION', 'ENCRYPTED CHANNEL', 'PACKET SIMULATION',
    'DATABASE SIMULATION', 'SECURITY LAYER', 'ACCESS ANALYSIS', 'FINAL VERIFICATION'
  ];

  function startSimulation() {
    switchScreen('screen-sim');
    state.paused = false;
    state.stageIndex = 0;
    $('pauseBtn').textContent = '[ PAUSE ]';

    // Reset visuals
    $('terminalOutput').innerHTML = '';
    document.querySelectorAll('.stage-list li').forEach(li => li.classList.remove('active', 'done'));
    ['pf0','pf1','pf2','pf3','pf4'].forEach(id => $(id).style.width = '0%');
    ['pv0','pv1','pv2','pv3','pv4'].forEach(id => $(id).textContent = '0%');
    $('sqlBlock').textContent = '';
    ['db-tp-id','db-tp-platform','db-sl-tier'].forEach(id => {});
    $('db-tp-id').textContent = '—';
    $('db-tp-platform').textContent = $('targetPlatform')?.value || '—';
    $('db-tp-status').textContent = 'PENDING';
    $('db-sl-tier').textContent = '—';
    $('db-sl-integrity').textContent = '—';
    $('db-ds-hash').textContent = '—';
    $('db-sim-entries').textContent = '0';
    $('db-ar-confidence').textContent = '0%';

    state.opId = 'OP-' + hexChunk(8).toUpperCase();
    $('opId').textContent = 'OP-ID: ' + state.opId;

    // Countdown ring setup
    const ring = $('countdownRing');
    const circumference = 2 * Math.PI * 45;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = 0;

    updateCountdownDisplay();

    // Kick off loops
    state.timerHandle && clearInterval(state.timerHandle);
    state.tickHandle && clearInterval(state.tickHandle);

    state.timerHandle = setInterval(() => {
      if (state.paused) return;
      state.remaining--;
      updateCountdownDisplay();
      const frac = 1 - (state.remaining / state.duration);
      ring.style.strokeDashoffset = circumference * frac;

      // advance stage roughly evenly across duration
      const targetStage = Math.min(7, Math.floor(frac * 8));
      if (targetStage > state.stageIndex) {
        state.stageIndex = targetStage;
        activateStage(state.stageIndex);
      }

      if (state.remaining <= 0) {
        clearInterval(state.timerHandle);
        clearInterval(state.tickHandle);
        finishSimulation();
      }
    }, 1000);

    activateStage(0);

    state.tickHandle = setInterval(() => {
      if (state.paused) return;
      simTick();
    }, 650);

    // random suspense + glitch events
    scheduleRandomEvents();

    // meters loop
    meterLoop();
  }

  function updateCountdownDisplay() {
    const m = Math.floor(Math.max(0, state.remaining) / 60);
    const s = Math.max(0, state.remaining) % 60;
    $('countdownText').textContent = `${pad2(m)}:${pad2(s)}`;
  }

  function activateStage(idx) {
    const items = document.querySelectorAll('.stage-list li');
    items.forEach((li, i) => {
      li.classList.remove('active');
      if (i < idx) li.classList.add('done');
      if (i === idx) li.classList.add('active');
    });
    stageChime();
    addTerminalLine({ t: `[RUN] Entering stage: ${stageNames[idx] || 'FINALIZING'}`, c: 'sim' });
  }

  function addTerminalLine(entry) {
    const out = $('terminalOutput');
    const now = new Date();
    const ts = `[${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}]`;
    const div = document.createElement('div');
    div.className = 'term-line' + (entry.c ? ' ' + entry.c : '');
    div.textContent = `${ts} ${entry.t}`;
    out.insertBefore(div, out.firstChild);
    while (out.children.length > 60) out.removeChild(out.lastChild);
    const entries = parseInt($('db-sim-entries').textContent, 10) || 0;
    $('db-sim-entries').textContent = entries + 1;
  }

  function simTick() {
    // terminal line
    addTerminalLine(pick(terminalLines));

    // progress bars random walk toward completion based on time fraction
    const frac = 1 - (state.remaining / state.duration);
    for (let i = 0; i < 5; i++) {
      const base = Math.min(99, Math.round(frac * 100 + rand(-8, 8)));
      const val = Math.max(0, Math.min(99, base));
      $('pf' + i).style.width = val + '%';
      $('pv' + i).textContent = val + '%';
    }

    // sql block
    if (Math.random() > 0.5) {
      $('sqlBlock').textContent = pick(sqlCommands);
    }

    // db fields
    $('db-tp-id').textContent = hexChunk(6).toUpperCase();
    $('db-tp-status').textContent = pick(['SCANNING', 'MAPPING', 'RESOLVING', 'ANALYZING']);
    $('db-sl-tier').textContent = pick(['TIER-1', 'TIER-2', 'TIER-3', 'ADAPTIVE']);
    $('db-sl-integrity').textContent = rand(70, 99) + '%';
    $('db-ds-hash').textContent = hexChunk(4) + '…' + hexChunk(4);
    $('db-ar-confidence').textContent = Math.min(99, Math.round(frac * 100)) + '%';

    // prompt cursor cycling
    $('promptCmd').textContent = pick(['analyze --deep', 'scan --target', 'sync --layer', 'trace --sim']);
  }

  function meterLoop() {
    const handle = setInterval(() => {
      if (document.getElementById('screen-sim').classList.contains('active') === false) {
        clearInterval(handle);
        return;
      }
      if (state.paused) return;
      $('cpuMeter').textContent = rand(22, 97) + '%';
      $('encMeter').textContent = pick([128, 192, 256, 512]) + '-bit';
      $('tempMeter').textContent = rand(41, 68) + '°C';
      $('nodeMeter').textContent = rand(3, 42);
    }, 900);
  }

  function scheduleRandomEvents() {
    const glitchHandle = setInterval(() => {
      if (!document.getElementById('screen-sim').classList.contains('active')) {
        clearInterval(glitchHandle);
        return;
      }
      if (state.paused) return;
      if (Math.random() > 0.55) triggerGlitch();
      if (Math.random() > 0.8) triggerSuspenseEvent();
    }, 1800);
  }

  function triggerGlitch() {
    const overlay = $('glitchOverlay');
    overlay.classList.remove('active'); void overlay.offsetWidth;
    overlay.classList.add('active');
    document.querySelector('.sim-wrap').classList.remove('shake'); void document.querySelector('.sim-wrap').offsetWidth;
    document.querySelector('.sim-wrap').classList.add('shake');
    setTimeout(() => overlay.classList.remove('active'), 260);
  }

  function triggerSuspenseEvent() {
    const banner = $('eventBanner');
    banner.textContent = pick(suspenseEvents);
    banner.classList.add('show');
    warnTone();
    const flash = $('warningFlash');
    flash.classList.remove('active'); void flash.offsetWidth;
    flash.classList.add('active');
    addTerminalLine({ t: `[WARN] ${banner.textContent}`, c: 'warn' });
    setTimeout(() => banner.classList.remove('show'), 1800);
  }

  function initSimControls() {
    $('pauseBtn').addEventListener('click', () => {
      state.paused = !state.paused;
      $('pauseBtn').textContent = state.paused ? '[ RESUME ]' : '[ PAUSE ]';
    });
    $('abortBtn').addEventListener('click', () => {
      clearInterval(state.timerHandle);
      clearInterval(state.tickHandle);
      switchScreen('screen-landing');
    });
  }

  /* ---------- Screen 4 -> 5: Finish + reveal ---------- */
  function finishSimulation() {
    switchScreen('screen-result');
    $('resultStageComplete').classList.remove('hidden');
    $('resultStageReveal').classList.add('hidden');
    $('accessGranted').textContent = 'ACCESS GRANTED';
    successFanfare();

    setTimeout(() => {
      dramaticSting();
      $('resultStageComplete').classList.add('hidden');
      $('resultStageReveal').classList.remove('hidden');
    }, 2600);
  }

  function initResultControls() {
    $('runAgainBtn').addEventListener('click', () => {
      state.remaining = state.duration;
      startSimulation();
    });
    $('newTargetBtn').addEventListener('click', () => {
      $('targetForm').reset();
      switchScreen('screen-form');
    });
  }

  /* ---------- Landing ---------- */
  function initLanding() {
    $('initiateBtn').addEventListener('click', () => {
      blip(520, 0.06);
      runBootSequence();
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    initClock();
    initTopControls();
    initLanding();
    initForm();
    initSimControls();
    initResultControls();
  });

})();
