// GemCore site: menu, video on click, demo replay, gallery viewer. No cookies, no tracking, no external requests.
(() => {
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.today').forEach((e) => (e.textContent = '24 November 2026'));

  // mobile menu
  const burger = $('#burger'), links = $('#links');
  burger.onclick = () => { const o = links.classList.toggle('open'); burger.setAttribute('aria-expanded', o); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); burger.innerHTML = o ? '&#10005;' : '&#9776;'; };
  links.addEventListener('click', (e) => { if (e.target.closest('a') && links.classList.contains('open')) burger.click(); });

  // video: loaded only on click; the same click starts the voice (same-origin iframe, ?autoplay)
  $('#vplay').onclick = () => {
    const box = $('#vbox'); const bar = document.createElement('div'); bar.className = 'loading'; box.appendChild(bar);
    $('#vplay').querySelector('.play').innerHTML = '<b>&#8987;</b> Loading the video…';
    const f = document.createElement('iframe'); f.title = 'GemCore video with voice'; f.allow = 'autoplay; fullscreen'; f.allowFullscreen = true;
    f.src = 'video/gemcore_video.html?autoplay=1';
    f.onload = () => { $('#vplay').remove(); bar.remove(); try { f.contentWindow.focus(); } catch (e) {} };
    box.appendChild(f);
  };

  // tools only used by the 3D panel (names from mcp_server/server.py)
  const VT = ["viewer_welcome_model","viewer_set_welcome","viewer_open_request","viewer_asset","viewer_history","viewer_timeline","viewer_restore","viewer_painted","viewer_paint_stones","viewer_mesh","viewer_activity","viewer_tutorial_index","viewer_tutorial_control","viewer_styles","viewer_apply_style","viewer_typologies","viewer_typology","viewer_start_typology","viewer_subd_preview","viewer_size","viewer_sculptable","viewer_sculpt","viewer_sculpt_alpha","viewer_engraving_sheet","viewer_engraving_preview","viewer_apply_engraving_sheet","viewer_ropes","viewer_cage","viewer_set_cage","viewer_set_ropes","viewer_set_size","viewer_set_stone","viewer_set_metal","viewer_parts","viewer_move_part","viewer_sheet","viewer_save_annotation","viewer_make_room","viewer_signet_frame","viewer_set_signet_frame","viewer_signet_outline","viewer_select","viewer_options","viewer_narrate","viewer_set_tips","viewer_feedback","viewer_set_interpreter","viewer_export_stl","viewer_save_renders"];
  $('#vtools').innerHTML = VT.map((n) => `<code>${n}</code>`).join('');

  // demo replay: real tool names and real catalogue ids; requests and replies are examples
  const D = [
    { k: 0, ask: 'A solitaire, size 14, yellow gold, 6 mm round stone', words: 'solitaire', typ: 'classic', v: 'solitaire', extra: [], say: 'Done: solitaire, IT size 14, 750 yellow gold, 6 mm round stone on four prongs. Shank 2 × 1.7 mm (my choice). Open the Shank panel to try a cathedral?' },
    { k: 1, ask: 'An oval halo ring in white gold', words: 'oval halo', typ: 'halo', v: 'halo', extra: [], say: 'Done: halo with an oval centre stone, 750 white gold, IT size 14 (my choice). The Stones panel changes the halo stones.' },
    { k: 4, ask: 'A signet with my initials GC', words: 'signet initials', typ: 'signet', v: 'classic', extra: [], say: 'Done: classic signet with “GC” cut into the face. The Crop panel shapes the face.' },
    { k: 6, ask: 'A serpent ring with scales', words: 'serpent scales', typ: 'spiral', v: 'serpent', extra: [], say: 'Done: serpent with scales wrapping the finger. The Drawing panel moves every point on its axes.' },
    { k: 10, ask: 'Braided wires with small stones', words: 'braided wires stones', typ: 'braided', v: 'twisted_stones', extra: [], say: 'Done: twisted wires with small stones set along them. The Rope panel changes the wires.' },
    { k: 13, ask: 'A band that looks like molten metal', words: 'molten metal band', typ: 'sculpted', v: 'molten', extra: [], say: 'Done: molten-metal band. The Sculpt panel adds or smooths the texture by hand.' },
  ];
  const asks = $('#asks'), chat = $('#chat'), spin = $('#spin'), wait = $('#swait'), sbar = $('#sbar'), st = $('#stage3d');
  let frame = 0, cur = null, run = 0, auto = null;
  const setF = (f) => { frame = ((f % 30) + 30) % 30; spin.style.backgroundPosition = `${(frame % 6) * 20}% ${Math.floor(frame / 6) * 25}%`; };
  const add = (cls, html) => { const p = document.createElement('p'); p.className = 'msg ' + cls; p.innerHTML = html; chat.appendChild(p); chat.scrollTop = chat.scrollHeight; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  async function play(d, btn) {
    const my = ++run; clearInterval(auto);
    asks.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === btn));
    chat.innerHTML = ''; wait.hidden = false; wait.textContent = 'GemCore is building…'; sbar.style.width = '5%';
    const img = new Image(); img.src = `img/spin/${d.k}.webp`;
    add('u', '<span class="exlabel">EXAMPLE</span><br>' + d.ask);
    const calls = [`list_ring_typologies({ user_words: "${d.words}" })`, `start_ring_typology({ typology: "${d.typ}", variant: "${d.v}" })`, ...d.extra, `show_jewelry_viewer({ project_id })`];
    for (let j = 0; j < calls.length; j++) { await sleep(650); if (my !== run) return; add('t', '→ ' + calls[j]); sbar.style.width = (20 + 75 * (j + 1) / calls.length) + '%'; }
    await img.decode().catch(() => {}); if (my !== run) return;
    spin.style.backgroundImage = `url(img/spin/${d.k}.webp)`; setF(0); wait.hidden = true; sbar.style.width = '0';
    await sleep(300); add('a', '<span class="exlabel" style="color:var(--bronze)">EXAMPLE REPLY</span><br>' + d.say);
    cur = d; if (!reduce) auto = setInterval(() => setF(frame + 1), 120);
  }
  D.forEach((d, n) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = d.ask; b.setAttribute('aria-pressed', 'false'); b.onclick = () => play(d, b); asks.appendChild(b); });
  // drag / keys to turn
  let dx = null, f0 = 0;
  st.tabIndex = 0; st.setAttribute('role', 'img'); st.setAttribute('aria-label', 'Turntable of the generated ring; use arrow keys to turn');
  st.addEventListener('pointerdown', (e) => { if (!cur) return; dx = e.clientX; f0 = frame; clearInterval(auto); st.setPointerCapture(e.pointerId); st.style.cursor = 'grabbing'; });
  st.addEventListener('pointermove', (e) => { if (dx !== null) setF(f0 + Math.round((e.clientX - dx) / 12)); });
  const up = () => { dx = null; st.style.cursor = ''; }; st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  st.addEventListener('keydown', (e) => { if (!cur) return; if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); clearInterval(auto); setF(frame + (e.key === 'ArrowRight' ? 1 : -1)); } });

  // gallery + lightbox (feature screenshots join the same viewer)
  const lb = $('#lb'), lbimg = $('#lbimg'); let list = [], at = 0;
  const open = (l, i) => { list = l; at = i; show(); if (!lb.open) lb.showModal(); };
  const show = () => { const it = list[at]; lbimg.src = it.src; lbimg.alt = it.cap; $('#lbcap').textContent = it.cap; $('#lbn').textContent = `${at + 1} / ${list.length}`; };
  $('#lbprev').onclick = () => { at = (at - 1 + list.length) % list.length; show(); };
  $('#lbnext').onclick = () => { at = (at + 1) % list.length; show(); };
  $('#lbclose').onclick = () => lb.close();
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') $('#lbprev').click(); if (e.key === 'ArrowRight') $('#lbnext').click(); });
  const shots = [...document.querySelectorAll('.shot')].map((b) => ({ src: b.dataset.src, cap: b.dataset.cap }));
  document.querySelectorAll('.shot').forEach((b, i) => (b.onclick = () => open(shots, i)));
  const G = [["Solitaire","With a stone"],["Oval halo","With a stone"],["Trilogy","With a stone"],["Three-row pavé band","Bands"],["Signet with initials","Signets"],["Cameo from a photo","Signets"],["Scaled serpent","Complex shapes"],["Drop with a tail","Complex shapes"],["Bypass spiral","Complex shapes"],["Double-wrap crossover","Complex shapes"],["Braided wires with stones","Braided"],["Braided branches","Braided"],["Band with a rope","Braided"],["Molten metal","Organic"],["Wavy band","Organic"],["Open cuff","Organic"],["Sculpted waves","Organic"],["Dome with a flush drop","Organic"]];
  const gl = G.map((g, k) => ({ src: `img/gallery/${String(k).padStart(2, '0')}b.webp`, thumb: `img/gallery/${String(k).padStart(2, '0')}.webp`, cap: `${g[0]} · ${g[1]}` }));
  $('#gal').innerHTML = G.map((g, k) => `<button type="button" data-i="${k}"><img src="${gl[k].thumb}" loading="lazy" width="480" height="480" alt="${g[0]}, ring generated by GemCore"><span>${g[0]}</span><small>${g[1]}</small></button>`).join('');
  $('#gal').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) open(gl, +b.dataset.i); });
})();
