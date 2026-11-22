/**
 * "The Head": the film's timeline. One clock; at each time stamp characters move (left/top in % of the stage,
 * rotation, scale), enter or leave, props switch on and off, and a line is said. CSS transitions do the travelling.
 * Lines come in data-lines (27 entries) and speaker names in data-names, both from the locale files.
 */
const root = document.querySelector<HTMLElement>('[data-film]');
if (root) {
  const q = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const stage = q('[data-stage]'), cap = q('[data-cap]'), end = q('[data-end]'), meter = q('[data-meter]');
  const leash = q('[data-leash]'), line = root.querySelector<SVGLineElement>('[data-leash-line]')!, anchor = q('[data-anchor]');
  const rings = q('[data-prop="rings"]'), bar = q('[data-prop="bar"]');
  // characters wait off stage, where lazy images would never load: fetch them all now
  stage.querySelectorAll('img').forEach((im) => { im.loading = 'eager'; });
  const lines: string[] = JSON.parse(root.dataset.lines || '[]');
  const names: Record<string, string> = JSON.parse(root.dataset.names || '{}');

  type Who = 'narr' | 'head' | 'svitko' | 'bower' | 'stock' | 'sun' | 'smile' | 'cursor';
  const COLOR: Record<string, string> = { head: 'var(--mustard)', svitko: 'var(--coral)', bower: 'var(--ochre)', stock: 'var(--cream)', sun: 'var(--mustard)', smile: 'var(--coral)', cursor: 'var(--brown)' };
  const actors = Object.fromEntries(Array.from(root.querySelectorAll<HTMLElement>('[data-actor]')).map((e) => [e.dataset.actor!, e])) as Record<string, HTMLElement>;
  // where each one waits, off stage
  const HOME: Record<string, [number, number]> = { head: [50, 56], svitko: [-25, 58], bower: [58, 140], stock: [128, 60], sun: [30, -30], smile: [72, -30], cursor: [106, 10] };

  type Pose = { x: number; y: number; r?: number; s?: number; snap?: boolean; ms?: number };
  const move = (k: string, p: Pose) => {
    const a = actors[k];
    a.style.transitionDuration = `${p.ms ?? 3000}ms`;
    a.classList.toggle('is-snap', !!p.snap);
    a.style.left = `${p.x}%`; a.style.top = `${p.y}%`;
    a.style.transform = `translate(-50%, -50%) rotate(${p.r ?? 0}deg) scale(${p.s ?? 1})`;
  };
  const enter = (k: string, p: Pose) => { actors[k].classList.add('is-on'); move(k, p); };
  const leave = (k: string, ms = 2600) => { const [x, y] = HOME[k]; move(k, { x, y, ms }); setTimeout(() => actors[k].classList.remove('is-on'), ms);};
  const hit = (...ks: string[]) => ks.forEach((k) => { const a = actors[k]; a.classList.remove('is-hit'); void a.offsetWidth; a.classList.add('is-hit'); setTimeout(() => a.classList.remove('is-hit'), 520); });
  // --- voice: the browser's own speech synthesis, one pitch and pace per character (needs a click on "Sound" first) ---
  const sndBtn = root.querySelector<HTMLButtonElement>('[data-sound]'); // only the English page has sound and captions
  const talk = root.dataset.talk === '1';
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const vlang = sndBtn?.dataset.lang || 'en';
  let sound = false;
  const VOICE: Record<string, [number, number, number]> = { // [pitch, rate, which voice]
    narr: [0.95, 0.98, 0], head: [1.05, 1.02, 0], svitko: [1.6, 1.08, 1], bower: [0.75, 0.88, 2], stock: [1.55, 1.18, 1], sun: [1.25, 0.95, 2], smile: [1.8, 1.12, 0], cursor: [0.45, 1.05, 1],
  };
  // Svitko speaks like a boy: a male voice (found by name), pitched up. Falls back to any non-female voice.
  const MALE = /david|mark|guy|george|james|richard|stefan|conrad|killian|christopher|eric|ryan|thomas|daniel|michael|paul|hans|male|man/i;
  const FEMALE = /zira|hazel|susan|aria|jenny|katja|hedda|amala|female|sara|eva|helena|maria|heather|libby|sonia|hanna|woman/i;
  const pickVoice = (vs: SpeechSynthesisVoice[], who: string, k: number) => {
    if (who === 'svitko') return vs.find((v) => MALE.test(v.name) && !FEMALE.test(v.name)) ?? vs.find((v) => !FEMALE.test(v.name)) ?? vs[0];
    return vs[k % vs.length];
  };
  let talking = false, talkEnd = 0;
  const voices = () => (synth?.getVoices() ?? []).filter((v) => v.lang.toLowerCase().startsWith(vlang));
  let utter: SpeechSynthesisUtterance | null = null; // kept referenced: some browsers drop an utterance that gets garbage-collected
  const speak = (text: string, who: string, tries = 0) => {
    if (!sound || !synth) return;
    const vs = voices();
    if (!vs.length) { if (tries < 6) setTimeout(() => speak(text, who, tries + 1), 250); return; } // voices load lazily
    synth.cancel();
    const [pitch, rate, k] = VOICE[who] ?? VOICE.narr;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = pickVoice(vs, who, k); u.lang = u.voice.lang; u.pitch = pitch; u.rate = rate; u.volume = 1;
    utter = u;
    // the film waits for the line to be spoken to the end (see tick); these make sure it never waits forever
    talking = true;
    const done = () => { if (utter === u) { talking = false; talkEnd = performance.now(); } };
    u.onend = done; u.onerror = done;
    setTimeout(done, Math.max(3000, (text.length * 95) / rate + 1500)); // estimated length, in case the browser never reports the end
    setTimeout(() => { if (utter === u) { synth.resume(); synth.speak(u); } }, 60); // a short pause after cancel() keeps Chrome from swallowing it
  };
  const note = root.querySelector<HTMLElement>('[data-note]');
  const paintSound = () => { if (!sndBtn) return; sndBtn.textContent = sound ? sndBtn.dataset.on! : sndBtn.dataset.off!; sndBtn.setAttribute('aria-pressed', String(sound)); };
  if (!sndBtn || !synth) { if (sndBtn) sndBtn.hidden = true; } else {
    sndBtn.addEventListener('click', () => {
      if (!sound && !voices().length) { sndBtn.textContent = sndBtn.dataset.none!; return; }
      sound = !sound; paintSound(); if (!sound) { synth.cancel(); talking = false; }
    });
    synth.getVoices(); // starts loading the voice list
    synth.addEventListener?.('voiceschanged', () => {}); // voices load lazily in some browsers; speak() looks them up each time
    addEventListener('pagehide', () => synth.cancel());
  }
  const say = (i: number, who: Who) => {
    if (!talk) return; // silent animation: no voice, no captions
    speak(lines[i - 1] ?? '', who);
    cap.classList.add('is-out');
    setTimeout(() => {
      cap.textContent = '';
      if (who !== 'narr') { const b = document.createElement('b'); b.className = 'who'; b.textContent = `${names[who] ?? who}:`; b.style.setProperty('--m', COLOR[who] ?? 'var(--mustard)'); cap.append(b); }
      cap.append(document.createTextNode(lines[i - 1] ?? ''));
      cap.dataset.who = who; cap.classList.remove('is-out');
    }, 380);
  };
  const blink = (on: boolean) => actors.head.querySelector('.face')?.classList.toggle('is-blink', on);
  const click = () => { actors.cursor.classList.add('is-click'); setTimeout(() => actors.cursor.classList.remove('is-click'), 350); };
  const tether = (on: boolean) => { leash.classList.toggle('is-on', on); anchor.classList.toggle('is-on', on); };

  // [time in seconds, what happens]. Stage coordinates are % of its width and height.
  const TOTAL = 114;
  const script: [number, () => void][] = [
    // I. the head alone
    [0.3, () => enter('head', { x: 50, y: 56 })],
    [1, () => say(1, 'narr')],
    [5, () => { say(2, 'head'); move('head', { x: 50, y: 55, r: -3, s: 1.05 }); }],
    [9.5, () => { say(3, 'head'); move('head', { x: 45, y: 56, r: 5 }); }],
    [14, () => { say(4, 'narr'); rings.classList.add('is-on'); move('head', { x: 36, y: 58, r: 0, s: .92 }); }],
    [19, () => { say(5, 'head'); tether(true); move('head', { x: 112, y: 56, r: 14, s: .9, ms: 3400 }); }],
    [23.5, () => { say(6, 'narr'); rings.classList.remove('is-on'); move('head', { x: 50, y: 56, r: 0, s: 1, snap: true, ms: 1400 }); }],
    [28.5, () => tether(false)],
    // II. the cursor hunts the head
    [30, () => { say(7, 'narr'); enter('cursor', { x: 80, y: 28, ms: 2600 }); }],
    [34, () => { say(8, 'cursor'); move('cursor', { x: 60, y: 46, ms: 1200 }); }],
    [35.2, () => { move('head', { x: 33, y: 60, r: -10, ms: 800 }); move('cursor', { x: 50, y: 50, ms: 800 }); }],
    [36.2, () => { move('head', { x: 70, y: 50, r: 12, ms: 800 }); move('cursor', { x: 48, y: 52, ms: 900 }); }],
    [37.3, () => { move('head', { x: 24, y: 58, r: -12, ms: 800 }); move('cursor', { x: 60, y: 52, ms: 800 }); }],
    [38.3, () => { move('cursor', { x: 27, y: 52, ms: 700 }); }],
    [39.1, () => { say(9, 'head'); click(); hit('head'); actors.head.classList.add('is-spin'); blink(true); }],
    [40.2, () => blink(false)],
    [42, () => { move('cursor', { x: 104, y: 8, ms: 2200 }); move('head', { x: 50, y: 56, r: 0, ms: 2400 }); actors.head.classList.remove('is-spin'); }],
    // III. the neighbours
    [45, () => { say(10, 'narr'); enter('svitko', { x: 20, y: 56, ms: 3200 }); move('head', { x: 62, y: 56, s: .9, ms: 2600 }); }],
    [49, () => { say(11, 'svitko'); hit('svitko'); }],
    [54, () => { say(12, 'head'); hit('head'); }],
    [57, () => {
      say(13, 'bower');
      enter('bower', { x: 58, y: 60, s: .92, ms: 2400 });
      move('svitko', { x: 13, y: 58, s: .9, ms: 2200 }); move('head', { x: 35, y: 58, s: .82, ms: 2200 });
    }],
    [62, () => { say(14, 'stock'); enter('stock', { x: 85, y: 60, s: .9, ms: 2400 }); hit('bower'); }],
    [66, () => { say(15, 'sun'); enter('sun', { x: 47, y: 17, ms: 2000 }); }],
    [70, () => { say(16, 'smile'); enter('smile', { x: 70, y: 16, ms: 2000 }); }],
    // IV. what is the point?
    [74, () => { say(17, 'head'); hit('head'); }],
    [78, () => { say(18, 'svitko'); hit('svitko'); }],
    [81, () => { say(19, 'bower'); hit('bower'); }],
    [84, () => { say(20, 'stock'); hit('stock'); }],
    [87, () => { say(21, 'sun'); hit('sun'); }],
    [89.5, () => { say(22, 'smile'); hit('smile'); }],
    [92, () => { say(23, 'cursor'); enter('cursor', { x: 72, y: 38, ms: 1600 }); }],
    [94, () => { click(); hit('head', 'svitko', 'bower', 'stock', 'sun', 'smile'); }],
    // V. 99%
    [96, () => { say(24, 'narr'); move('cursor', { x: 104, y: 8, ms: 2000 }); bar.classList.add('is-on'); setTimeout(() => bar.classList.add('is-full'), 300); }],
    [100.5, () => bar.classList.add('is-stuck')],
    [101, () => { say(25, 'head'); }],
    [106, () => {
      say(26, 'head'); bar.classList.remove('is-on', 'is-full', 'is-stuck');
      ['svitko', 'bower', 'stock', 'sun', 'smile', 'cursor'].forEach((k) => leave(k));
      tether(true); move('head', { x: 6.5, y: 12, r: 0, s: .3, ms: 4200 });
    }],
    [111, () => { end.hidden = false; cap.classList.add('is-out'); }],
  ];

  // lines that start a speech; with sound on, the clock waits for the previous line to be spoken before the next one begins
  const SAYS = new Set<number>([1, 5, 9.5, 14, 19, 23.5, 30, 34, 39.1, 45, 49, 54, 57, 62, 66, 70, 74, 78, 81, 84, 87, 89.5, 92, 96, 101, 106]);
  let vt = 0, last = 0, done = 0, raf = 0, ended = false;
  const trackLeash = () => {
    const s = stage.getBoundingClientRect(), h = actors.head.getBoundingClientRect();
    line.setAttribute('x2', (((h.x + h.width / 2 - s.x) / s.width) * 100).toFixed(2));
    line.setAttribute('y2', (((h.y + h.height / 2 - s.y) / s.height) * 100).toFixed(2));
  };
  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const next = script[done];
    const holding = !!next && SAYS.has(next[0]) && next[0] <= vt + dt && sound && (talking || now - talkEnd < 450);
    if (!holding) vt += dt;
    while (done < script.length && script[done][0] <= vt) script[done++][1]();
    meter.style.width = `${Math.min(100, (vt / TOTAL) * 100).toFixed(2)}%`;
    trackLeash();
    if (vt < TOTAL) raf = requestAnimationFrame(tick); else finish();
  };
  const finish = () => { if (ended) return; ended = true; synth?.cancel(); cancelAnimationFrame(raf); end.hidden = false; cap.classList.add('is-out'); meter.style.width = '100%'; };
  const reset = () => {
    cancelAnimationFrame(raf); synth?.cancel(); ended = false; done = 0;
    end.hidden = true; cap.classList.remove('is-out'); cap.textContent = ''; cap.dataset.who = 'narr'; meter.style.width = '0';
    for (const [k, a] of Object.entries(actors)) {
      a.classList.remove('is-on', 'is-hit', 'is-spin', 'is-snap', 'is-click');
      a.style.transitionDuration = '0ms'; a.style.left = `${HOME[k][0]}%`; a.style.top = `${HOME[k][1]}%`; a.style.transform = 'translate(-50%, -50%)';
    }
    blink(false); tether(false); rings.classList.remove('is-on'); bar.classList.remove('is-on', 'is-full', 'is-stuck');
    void stage.offsetWidth; // apply the reset before transitions are switched back on
  };
  // `?t=70` starts the film at 70 seconds (handy for checking a scene)
  const startAt = Number(new URLSearchParams(location.search).get('t')) || 0;
  const play = () => { reset(); vt = startAt; talking = false; last = performance.now(); raf = requestAnimationFrame(tick); };

  // the film waits on a start card: its buttons are the click the browser needs before it lets anything speak
  const start = q('[data-start]');
  const begin = (withSound: boolean) => {
    start.hidden = true;
    if (withSound && synth) {
      if (voices().length || !synth.getVoices().length) { sound = true; paintSound(); } else if (note) { note.hidden = false; }
    }
    play();
  };
  root.querySelector('[data-play-sound]')?.addEventListener('click', () => {
    if (synth && !voices().length && synth.getVoices().length && note) { note.hidden = false; return; } // this device has no voice for the language: say so, let them pick "without sound"
    begin(true);
  });
  q('[data-play-mute]').addEventListener('click', () => begin(false));
  root.querySelector('[data-replay]')?.addEventListener('click', play);
  root.querySelector('[data-skip]')?.addEventListener('click', finish);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });
  if (startAt > 0) { start.hidden = true; play(); } // ?t=… (for checking a scene) skips the start card
}
