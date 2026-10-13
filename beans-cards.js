/* Maewsom Beans — การ์ดเมล็ดกาแฟ (ใช้ร่วมกัน: order.html แท็บ BEANS + beans.html)
   ข้อมูล: bean_profiles + ingredients (จัดการที่ Admin > หน้าเมล็ดกาแฟ) · การ์ด 5 ช่อง: Roast level / Taste notes / Body / Recommend drinks / Price (+ราคาเพิ่ม) */
(function () {
  var DOSE = 20; // เกณฑ์เดียวกับหน้าสั่ง: สต็อก >= 20g ถึงโชว์
  var TONES = [['choc', 'ช็อกโกแลต · นัท', '#7A4A2B'], ['fruit', 'ผลไม้', '#D9546E'], ['citrus', 'ซิตรัส', '#E8A33A'], ['floral', 'ดอกไม้', '#7FA38B'], ['sweet', 'หวาน · ครีมมี่', '#C98A5A']];
  var ROASTS = ['Light', 'Light-Medium', 'Medium', 'Medium-Dark', 'Dark'];
  var RANK = { store: 0, limited: 1, '': 2 };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  var dash = function (x) { return x ? esc(x) : '—'; };

  var CSS = '.oc-bn{background:#C69C6D;border-radius:18px;padding:16px 12px 20px;color:#2A1A0E;font-family:inherit}' +
    '.oc-bn h3{font-size:17px;font-weight:700;line-height:1.3;margin:0 0 12px}' +
    '.bn-fg{margin-bottom:10px}.bn-fl{font-size:11.5px;opacity:.8;margin-bottom:6px}' +
    '.bn-chips{display:flex;flex-wrap:wrap;gap:6px}' +
    '.bn-chip{border:1.5px solid #2A1A0E;background:transparent;border-radius:99px;padding:5px 11px;font-size:12.5px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;font-family:inherit;color:#2A1A0E}' +
    '.bn-chip i{width:8px;height:8px;border-radius:50%;background:var(--d,#999)}.bn-chip.on{background:#2A1A0E;color:#F7F2E7}' +
    '.bn-clear{background:none;border:none;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;color:#2A1A0E;padding:2px 0;margin-bottom:6px}' +
    '.bn-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;align-items:start}' +
    '.bn-state{grid-column:1/-1;text-align:center;padding:26px 0;font-size:13px;opacity:.85}' +
    '.bc{background:#F7F2E7;color:#231810;border-radius:14px;overflow:hidden;box-shadow:0 3px 8px rgba(60,35,10,.26)}' +
    '.bc-ph{position:relative;aspect-ratio:1/1;background:#8A6A4A center/cover no-repeat}' +
    '.bc-tag{position:absolute;top:0;right:0;font-size:11px;font-weight:700;line-height:1.3;padding:4px 10px 5px 12px;border-radius:0 0 0 12px;box-shadow:0 1px 3px rgba(0,0,0,.3)}' +
    '.bc-tag.store{background:#E8621A;color:#fff}.bc-tag.limited{background:#6E1F2C;color:#F7F2E7}' +
    '.bc-nm{font:700 16px/1.25 Georgia,"Times New Roman",serif;padding:10px 12px 6px}' +
    '.bc-r{padding:6px 12px;border-top:1px solid rgba(35,24,16,.14)}' +
    '.bc-r b{display:block;font-size:9.5px;letter-spacing:.6px;text-transform:uppercase;color:#8A6F5A;font-weight:600}' +
    '.bc-r span{display:block;font-size:13px;line-height:1.35;margin-top:1px;overflow-wrap:anywhere}' +
    '.bc-r.pr span{font-weight:700;color:#C4531A}';
  function css() { if (document.getElementById('oc-bn-css')) return; var s = document.createElement('style'); s.id = 'oc-bn-css'; s.textContent = CSS; document.head.appendChild(s); }

  function card(b) {
    var tag = b.status === 'store' ? '<span class="bc-tag store">เมล็ดประจำร้าน</span>' : b.status === 'limited' ? '<span class="bc-tag limited">Limited</span>' : '';
    var ph = b.photo ? 'background-image:url(\'' + esc(b.photo) + '\');background-position:' + esc(b.pos || 'center') : '';
    var price = b.sur > 0 ? '+' + b.sur + '฿' : 'ไม่บวกเพิ่ม';
    return '<div class="bc"><div class="bc-ph" style="' + ph + '">' + tag + '</div><div class="bc-nm">' + esc(b.name) + '</div>' +
      '<div class="bc-r"><b>Roast level</b><span>' + dash(b.roast) + '</span></div>' +
      '<div class="bc-r"><b>Taste notes</b><span>' + dash(b.notes) + '</span></div>' +
      '<div class="bc-r"><b>Body</b><span>' + dash(b.body) + '</span></div>' +
      '<div class="bc-r"><b>Recommend drinks</b><span>' + dash((b.rec || []).join(' · ')) + '</span></div>' +
      '<div class="bc-r pr"><b>Price</b><span>' + price + '</span></div></div>';
  }

  function mount(el, sb) {
    css();
    var S = { beans: [], enabled: true, failed: false, loaded: false, tone: {}, roast: {}, rec: {} };
    el.className = (el.className + ' oc-bn').trim();
    el.innerHTML = '<div class="bn-state">กำลังโหลด…</div>';

    function chips(label, key, opts) {
      if (!opts.length) return '';
      return '<div class="bn-fg"><div class="bn-fl">' + label + '</div><div class="bn-chips">' + opts.map(function (o) {
        return '<button type="button" class="bn-chip' + (S[key][o[0]] ? ' on' : '') + '"' + (o[2] ? ' style="--d:' + o[2] + '"' : '') + ' data-k="' + key + '" data-v="' + esc(o[0]) + '">' + (o[2] ? '<i></i>' : '') + esc(o[1]) + '</button>';
      }).join('') + '</div></div>';
    }
    function pass(b) {
      var any = function (k, vals) { var on = Object.keys(S[k]).filter(function (x) { return S[k][x]; }); return !on.length || vals.some(function (v) { return on.indexOf(v) >= 0; }); };
      return any('tone', b.tones) && any('roast', b.roast ? [b.roast] : []) && any('rec', (b.rec || []).map(function (x) { return x.toLowerCase(); }));
    }
    function render() {
      if (!S.loaded) return;
      if (S.failed) { el.innerHTML = '<div class="bn-state">โหลดข้อมูลไม่สำเร็จ ลองเปิดใหม่อีกครั้งนะคะ</div>'; return; }
      if (!S.enabled) { el.innerHTML = '<div class="bn-state">หน้าเมล็ดกาแฟกำลังเตรียมตัว เร็วๆ นี้นะคะ 🐱</div>'; return; }
      var roasts = ROASTS.filter(function (r) { return S.beans.some(function (b) { return b.roast === r; }); }).map(function (r) { return [r, r]; });
      var recMap = {}; S.beans.forEach(function (b) { (b.rec || []).forEach(function (r) { if (!recMap[r.toLowerCase()]) recMap[r.toLowerCase()] = r; }); });
      var recs = Object.keys(recMap).map(function (k) { return [k, recMap[k]]; });
      var hasF = ['tone', 'roast', 'rec'].some(function (k) { return Object.keys(S[k]).some(function (x) { return S[k][x]; }); });
      var list = S.beans.filter(pass);
      el.innerHTML = '<h3>Maewsom Beans Selection - เลือกเมล็ดกาแฟ</h3>' +
        chips('โทนรส', 'tone', TONES) + chips('Roast level', 'roast', roasts) + chips('Recommend drinks', 'rec', recs) +
        (hasF ? '<button type="button" class="bn-clear" data-clear="1">ล้างตัวกรอง</button>' : '') +
        '<div class="bn-grid">' + (list.length ? list.map(card).join('') : '<div class="bn-state">ไม่มีเมล็ดที่ตรงกับตัวกรอง</div>') + '</div>';
    }
    el.addEventListener('click', function (e) {
      var c = e.target.closest('[data-k]');
      if (c) { S[c.dataset.k][c.dataset.v] = !S[c.dataset.k][c.dataset.v]; render(); return; }
      if (e.target.closest('[data-clear]')) { S.tone = {}; S.roast = {}; S.rec = {}; render(); }
    });

    Promise.all([
      sb.from('system_settings').select('key,value').eq('key', 'beans_page.enabled'),
      sb.from('bean_profiles').select('*').eq('visible', true),
      sb.from('ingredients').select('id,name,stock_quantity,customer_bean_surcharge').eq('category', 'coffee_bean').eq('active', true)
    ]).then(function (r) {
      if (r[1].error || r[2].error) throw (r[1].error || r[2].error);
      var en = (r[0].data || [])[0]; S.enabled = !(en && (en.value === false || en.value === 'false'));
      var ing = {}; (r[2].data || []).forEach(function (i) { ing[i.id] = i; });
      var ok = function (i) { return i && Number(i.stock_quantity) >= DOSE; };
      S.beans = (r[1].data || []).map(function (p) {
        var name, sur;
        if (p.ingredient_id) { var i = ing[p.ingredient_id]; if (!ok(i)) return null; name = i.name; sur = Number(i.customer_bean_surcharge) || 0; }
        else { // Houseblend: โชว์เมื่อเมล็ดผสมทุกตัวมีสต็อกพอ — ส่วนผสมไม่แสดงให้ลูกค้า
          var ids = p.blend_member_ids || [], ms = ids.map(function (x) { return ing[x]; });
          if (!ids.length || !ms.every(ok)) return null;
          name = p.display_name; sur = Math.max.apply(null, ms.map(function (m) { return Number(m.customer_bean_surcharge) || 0; }));
        }
        return { name: name, sur: sur, photo: p.photo_url, pos: p.photo_pos, roast: p.roast, notes: p.notes, body: p.body, rec: p.recommend || [], tones: p.tones || [], status: p.status || '', sort: p.sort_order || 0 };
      }).filter(Boolean).sort(function (a, b) { return (RANK[a.status] - RANK[b.status]) || (a.sort - b.sort) || a.name.localeCompare(b.name); });
    }).catch(function () { S.failed = true; }).then(function () { S.loaded = true; render(); });
  }
  window.OCBeans = { mount: mount };
})();
