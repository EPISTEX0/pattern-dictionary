/* Pattern Dictionary — shared page chrome (nav, table of contents, keyword chips, Replay button).
   Load with <script src="assets/dict.js"></script> at the END of <body>, BEFORE the page's own script.
   See SHELL.md. */

/* Page list — the single source of truth. Adding a page = adding one line.
   count: number of patterns (0 = not available yet). */
const DICT_GROUPS = ['Visual', 'Functional'];
const DICT_PAGES = [
  { file: 'aesthetic.html',     name: 'Visual styles',       group: 'Visual',     count: 8,  desc: 'One piece of content presented in eight distinct visual styles.' },
  { file: 'layout.html',        name: 'Layout',              group: 'Visual',     count: 6,  desc: 'How a page is divided: the position, order and column count of each content block.' },
  { file: 'motion.html',        name: 'Motion',              group: 'Visual',     count: 11, desc: 'Animation that responds to scrolling, tapping and pointer movement.' },
  { file: 'surface.html',       name: 'Surfaces & texture',  group: 'Visual',     count: 6,  desc: 'Surface treatments: grain, gradients, halftone dots and light effects.' },
  { file: 'navigation.html',    name: 'Navigation',          group: 'Functional', count: 7,  desc: 'Structures that show users where they are and where they can go next.' },
  { file: 'forms.html',         name: 'Forms & input',       group: 'Functional', count: 6,  desc: 'Inputs, choices and validation that help users complete forms quickly and accurately.' },
  { file: 'feedback.html',      name: 'Feedback & overlays', group: 'Functional', count: 7,  desc: 'Notifications, dialogs and tooltips that report the result of a user action.' },
  { file: 'data.html',          name: 'Data display',        group: 'Functional', count: 6,  desc: 'Tables, lists, metric cards and charts that present data clearly.' },
  { file: 'ux.html',            name: 'UX components',       group: 'Functional', count: 8,  desc: 'Familiar components that help users make decisions faster.' },
  { file: 'onboarding.html',    name: 'Onboarding',          group: 'Functional', count: 4,  desc: 'Flows that take new users from first launch to the moment they see the product’s value.' },
  { file: 'dark-patterns.html', name: 'Dark patterns',       group: 'Functional', count: 7,  desc: 'Interface tricks that steer users toward choices against their interest, with how to spot and replace them.' },
];

const Dict = (() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const here = location.pathname.split('/').pop() || 'index.html';
  const page = DICT_PAGES.find(p => p.file === here);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- nav: brand + one popover per group ---------- */
  const nav = document.querySelector('nav.dnav');
  if (nav) {
    nav.setAttribute('aria-label', 'Pattern groups');
    nav.innerHTML = '<div class="dnav-in"><a class="brand" href="index.html" aria-label="Pattern Dictionary — home"><span>Pattern<span class="b2"> Dictionary</span></span></a>' +
      DICT_GROUPS.map((g, gi) => {
        const items = DICT_PAGES.filter(p => p.group === g);
        const cur = items.find(p => p === page);
        return `<button type="button" class="dnav-btn${cur ? ' is-cur' : ''}" popovertarget="dnav-p${gi}" aria-label="${esc(g)}${cur ? ', current page: ' + esc(cur.name) : ''}">` +
          `${esc(g)}${cur ? `<span class="dnav-here">${esc(cur.name)}</span>` : ''}<span class="dnav-car" aria-hidden="true">▾</span></button>` +
          `<div class="dnav-pop" id="dnav-p${gi}" popover><div class="dnav-gt">${esc(g)}</div>` +
          items.map(p => `<a href="${p.file}"${p === page ? ' aria-current="page"' : ''}>` +
            `<b>${esc(p.name)}</b><span class="dnav-n">${p.count ? p.count : ''}</span><small>${esc(p.desc)}</small></a>`).join('') +
          '</div>';
      }).join('') + '</div>';
    $$('.dnav-pop', nav).forEach(pop => {
      const btn = nav.querySelector(`[popovertarget="${pop.id}"]`);
      const links = () => $$('a', pop);
      pop.addEventListener('toggle', e => {
        btn.setAttribute('aria-expanded', e.newState === 'open');
        if (e.newState !== 'open') return;
        const r = btn.getBoundingClientRect();
        pop.style.top = r.bottom + 8 + 'px';
        pop.style.left = Math.max(8, Math.min(r.left, document.documentElement.clientWidth - pop.offsetWidth - 8)) + 'px';
      });
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('keydown', e => {
        if (e.key !== 'ArrowDown') return;
        e.preventDefault(); pop.showPopover(); links()[0].focus();
      });
      pop.addEventListener('keydown', e => {
        const d = { ArrowDown: 1, ArrowUp: -1 }[e.key]; if (!d) return;
        e.preventDefault(); const l = links(), i = l.indexOf(document.activeElement);
        l[(i + d + l.length) % l.length].focus();
      });
    });
  }

  /* ---------- page head: group eyebrow + chip table of contents from article.pattern ---------- */
  const arts = $$('article.pattern');
  const head = document.querySelector('header.head');
  if (head && arts.length) {
    const eb = document.createElement('div'); eb.className = 'eyebrow';
    eb.textContent = `${page ? page.group + ' · ' : ''}${arts.length} pattern${arts.length === 1 ? '' : 's'}`;
    head.prepend(eb);
    const toc = document.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', 'Contents');
    toc.innerHTML = arts.map((a, i) => `<a href="#${a.id}"><span>${String(i + 1).padStart(2, '0')}</span>` +
      `${esc(a.dataset.toc || a.querySelector(':scope>h2').textContent)}</a>`).join('');
    head.append(toc);
  }

  /* ---------- keyword chips: click to copy ---------- */
  const copy = async t => {
    try { await navigator.clipboard.writeText(t); return true; } catch (_) {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); return ok;
    }
  };
  document.addEventListener('click', async e => {
    const b = e.target.closest('.pattern>.kw button'); if (!b) return;
    const ok = await copy(b.textContent.trim());
    b.dataset.msg = ok ? 'Copied' : 'Couldn’t copy';
    b.classList.remove('ok', 'err'); b.classList.add(ok ? 'ok' : 'err');
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('ok', 'err'), 1200);
  });

  /* ---------- ↻ Replay button ---------- */
  const replays = {};
  const fixReplay = b => { b.type = 'button'; b.textContent = '↻ Replay'; };
  $$('.replay').forEach(fixReplay);
  document.addEventListener('click', e => {
    const b = e.target.closest('.demo .replay'); if (!b) return;
    replays[b.closest('.pattern').id]?.();
  });
  const replay = (id, fn) => { replays[id] = fn; };

  /* ---------- run once when an element enters the viewport ---------- */
  const onView = (el, fn, threshold = .35) => {
    const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
    io.observe(el);
  };

  /* ---------- standard demo: init on entering the viewport; Replay = rebuild from the original HTML ----------
     init(demoEl, articleEl) -> cleanup | undefined. The article gets class .on once mounted. */
  const demo = (id, init) => {
    const a = document.getElementById(id), d = a.querySelector('.demo'), html = d.innerHTML;
    let clean = null;
    const mount = () => { clean?.(); clean = init?.(d, a) || null; };
    onView(a, () => { a.classList.add('on'); mount(); });
    replay(id, () => {
      clean?.(); clean = null; d.innerHTML = html; $$('.replay', d).forEach(fixReplay);
      a.classList.remove('on'); void a.offsetWidth; a.classList.add('on'); mount();
    });
  };

  return { RM, pages: DICT_PAGES, page, copy, onView, replay, demo };
})();
