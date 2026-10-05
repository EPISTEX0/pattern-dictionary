/* Từ điển pattern — khung trang chung (nav, mục lục, chip keyword, nút Xem lại).
   Nạp bằng <script src="assets/dict.js"></script> ở CUỐI <body>, TRƯỚC script riêng của trang.
   Xem SHELL.md. */

/* Danh sách trang — nguồn duy nhất. Thêm trang mới = thêm một dòng.
   count: số pattern (0 = chưa có / chưa điền). */
const DICT_GROUPS = ['Hình thức', 'Chức năng'];
const DICT_PAGES = [
  { file: 'aesthetic.html',     name: 'Phong cách',         group: 'Hình thức', count: 8,  desc: 'Cùng một nội dung mặc tám bộ “quần áo” thẩm mỹ khác nhau.' },
  { file: 'layout.html',        name: 'Bố cục',             group: 'Hình thức', count: 6,  desc: 'Cách chia khung trang: thứ gì nằm đâu, chiếm bao nhiêu cột.' },
  { file: 'motion.html',        name: 'Chuyển động',        group: 'Hình thức', count: 11, desc: 'Trang web động đậy khi cuộn, bấm hay chỉ nhìn vào nó.' },
  { file: 'surface.html',       name: 'Bề mặt',             group: 'Hình thức', count: 6,  desc: 'Hạt nhiễu, dải màu, chấm in, ánh sáng — chất liệu của màn hình.' },
  { file: 'navigation.html',    name: 'Điều hướng',         group: 'Chức năng', count: 7,  desc: 'Cách người dùng biết mình đang ở đâu và đi tiếp tới đâu.' },
  { file: 'forms.html',         name: 'Form & nhập liệu',   group: 'Chức năng', count: 6,  desc: 'Ô nhập, lựa chọn và kiểm lỗi giúp người dùng điền nhanh, ít sai.' },
  { file: 'feedback.html',      name: 'Phản hồi & lớp phủ', group: 'Chức năng', count: 7,  desc: 'Thông báo, hộp thoại, tooltip — hệ thống trả lời lại người dùng.' },
  { file: 'data.html',          name: 'Hiển thị dữ liệu',   group: 'Chức năng', count: 6,  desc: 'Bảng, danh sách, thẻ số liệu và biểu đồ dễ đọc.' },
  { file: 'ux.html',            name: 'Thành phần UX',      group: 'Chức năng', count: 8,  desc: 'Những khối quen thuộc giúp người dùng quyết định nhanh hơn.' },
  { file: 'onboarding.html',    name: 'Onboarding',         group: 'Chức năng', count: 4,  desc: 'Dẫn người mới từ lần mở đầu tiên tới lúc thấy giá trị.' },
  { file: 'dark-patterns.html', name: 'Dark patterns',      group: 'Chức năng', count: 7,  desc: 'Mẹo giao diện lừa người dùng — để nhận ra và tránh.' },
];

const Dict = (() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const here = location.pathname.split('/').pop() || 'index.html';
  const page = DICT_PAGES.find(p => p.file === here);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- nav: thương hiệu + một popover cho mỗi cụm ---------- */
  const nav = document.querySelector('nav.dnav');
  if (nav) {
    nav.setAttribute('aria-label', 'Các nhóm pattern');
    nav.innerHTML = '<div class="dnav-in"><a class="brand" href="index.html">Từ điển pattern</a>' +
      DICT_GROUPS.map((g, gi) => {
        const items = DICT_PAGES.filter(p => p.group === g);
        const cur = items.find(p => p === page);
        return `<button type="button" class="dnav-btn${cur ? ' is-cur' : ''}" popovertarget="dnav-p${gi}" aria-label="${esc(g)}${cur ? ', đang xem ' + esc(cur.name) : ''}">` +
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

  /* ---------- đầu trang: nhãn nhóm + mục lục chip từ article.pattern ---------- */
  const arts = $$('article.pattern');
  const head = document.querySelector('header.head');
  if (head && arts.length) {
    const eb = document.createElement('div'); eb.className = 'eyebrow';
    eb.textContent = `${page ? page.group + ' · ' : ''}${arts.length} pattern`;
    head.prepend(eb);
    const toc = document.createElement('nav'); toc.className = 'toc'; toc.setAttribute('aria-label', 'Mục lục');
    toc.innerHTML = arts.map((a, i) => `<a href="#${a.id}"><span>${String(i + 1).padStart(2, '0')}</span>` +
      `${esc(a.dataset.toc || a.querySelector(':scope>h2').textContent)}</a>`).join('');
    head.append(toc);
  }

  /* ---------- chip keyword: bấm để copy ---------- */
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
    b.dataset.msg = ok ? 'Đã copy' : 'Không copy được';
    b.classList.remove('ok', 'err'); b.classList.add(ok ? 'ok' : 'err');
    clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('ok', 'err'), 1200);
  });

  /* ---------- nút ↻ Xem lại ---------- */
  const replays = {};
  const fixReplay = b => { b.type = 'button'; b.textContent = '↻ Xem lại'; };
  $$('.replay').forEach(fixReplay);
  document.addEventListener('click', e => {
    const b = e.target.closest('.demo .replay'); if (!b) return;
    replays[b.closest('.pattern').id]?.();
  });
  const replay = (id, fn) => { replays[id] = fn; };

  /* ---------- chạy một lần khi phần tử vào khung nhìn ---------- */
  const onView = (el, fn, threshold = .35) => {
    const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
    io.observe(el);
  };

  /* ---------- demo chuẩn: init khi vào khung, Xem lại = dựng lại từ HTML gốc ----------
     init(demoEl, articleEl) -> cleanup | undefined. Article nhận class .on khi đã mount. */
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
