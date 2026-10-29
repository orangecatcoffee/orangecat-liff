/* Maewsom Beans — การ์ดเมล็ดกาแฟ (ใช้ร่วมกัน: order.html แท็บ BEANS + beans.html)
   หน้าตาเดิม (การ์ดแสตมป์ ขนาดเท่ากันทุกใบ แตะเพื่อขยาย) · รายละเอียด 5 ช่อง: Roast level / Taste notes / Body (1-5) / Recommend drinks / Price (+ราคาเพิ่ม)
   ข้อมูล: bean_profiles + ingredients (จัดการที่ Admin > หน้าเมล็ดกาแฟ) */
(function () {
  var DOSE = 20; // เกณฑ์เดียวกับหน้าสั่ง: สต็อก >= 20g ถึงโชว์
  var TONES = [['choc', 'ช็อกโกแลต · นัท', '#7A4A2B'], ['fruit', 'ผลไม้', '#D9546E'], ['citrus', 'ซิตรัส', '#E8A33A'], ['floral', 'ดอกไม้', '#7FA38B'], ['sweet', 'หวาน · ครีมมี่', '#C98A5A']];
  var ROASTS = ['Light', 'Light-Medium', 'Medium', 'Medium-Dark', 'Dark'];
  var RANK = { store: 0, limited: 1, '': 2 };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  var dash = function (x) { return x ? esc(x) : '—'; };
  var dots = function (n) { n = Number(n) || 0; if (n < 1) return '—'; var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '●' : '○'; return s; };

  var CSS = '.oc-bn{background:#C69C6D;border-radius:18px;padding:22px 16px 26px;color:#2A1A0E}' +
    '.oc-bn h3{font:400 21px/1.3 "Abril Fatface","Mitr",Georgia,serif;margin:0 0 4px}' +
    '.oc-bn .bn-sub{font-size:12.5px;font-weight:300;opacity:.8;margin-bottom:16px}' +
    '.bn-fg{margin-bottom:12px}.bn-fl{font-size:12px;font-weight:300;opacity:.85;margin-bottom:7px}' +
    '.bn-chips{display:flex;flex-wrap:wrap;gap:8px}' +
    '.bn-chip{border:1.5px solid #2A1A0E;background:transparent;border-radius:99px;padding:6px 13px;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:inherit;color:#2A1A0E}' +
    '.bn-chip i{width:9px;height:9px;border-radius:50%;background:var(--d,#999)}.bn-chip.on{background:#2A1A0E;color:#F7F2E7}' +
    '.bn-clear{background:none;border:none;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;color:#2A1A0E;padding:2px 0}' +
    '.bn-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px 12px;align-items:start;margin-top:20px}' +
    '.bn-state{grid-column:1/-1;text-align:center;padding:26px 0;font-size:13px;opacity:.85}' +
    '.bc{container-type:inline-size;aspect-ratio:7/12;width:100%;background:#F7F2E7;color:#231810;box-shadow:0 3px 8px rgba(60,35,10,.26);position:relative;overflow:hidden;cursor:pointer;display:flex;flex-direction:column;text-align:left}' +
    '.bc-in{flex:0 0 auto;padding:4.8cqw 4.8cqw 0}' +
    '.bc-art{position:relative;width:100%;aspect-ratio:1/.98;border:2.3cqw dotted #F7F2E7;background:#8A6A4A center/cover no-repeat}' +
    '.bc-tag{position:absolute;top:0;right:0;z-index:3;font-weight:500;font-size:4.6cqw;line-height:1.5;padding:.4cqw 2.6cqw .6cqw 3.4cqw;border-radius:0 0 0 3cqw;box-shadow:0 1px 3px rgba(0,0,0,.35)}' +
    '.bc-tag.store{background:#E8621A;color:#fff}.bc-tag.limited{background:#6E1F2C;color:#F7F2E7}' +
    '.bc-nm{flex:0 0 14cqw;display:flex;align-items:center;justify-content:center;text-align:center;font:400 10cqw/1.1 "Abril Fatface","Mitr",Georgia,serif;padding:0 2cqw}' +
    '.bc-nm.l2{font-size:8cqw}.bc-nm.l3{font-size:6.4cqw}' +
    '.bc hr{flex:0 0 auto;border:none;border-top:1cqw double rgba(35,24,16,.45);margin:0}' +
    '.bc-g{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:1fr 1fr;align-content:start}' +
    '.bc-c{padding:1.4cqw 2.2cqw 1.6cqw;min-width:0;border-top:.35cqw solid rgba(35,24,16,.45);grid-column:1/-1}' +
    '.bc-c.h{border-top:none;grid-column:auto}.bc-c.h:first-child{border-right:.35cqw solid rgba(35,24,16,.45)}' +
    '.bc-c small{display:block;font:600 6.2cqw/1 "Caveat","Mitr",cursive}' +
    '.bc-c .v{font-size:5.2cqw;line-height:1.3;margin-top:.4cqw;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}' +
    '.bc-c .v.one{-webkit-line-clamp:1}.bc-c .v.dt{color:#C4401E;letter-spacing:.3cqw}.bc-c .v.pr{font-weight:500;color:#B8480F}' +
    '.bn-veil{position:fixed;inset:0;background:rgba(30,16,6,.72);display:none;align-items:center;justify-content:center;z-index:300;padding:16px;overflow-y:auto}.bn-veil.on{display:flex}' +
    '.bn-veil .bc{width:min(86vw,360px);aspect-ratio:auto;overflow:visible;cursor:default;padding-bottom:3cqw;box-shadow:0 14px 40px rgba(0,0,0,.5)}' +
    '.bn-veil .bc-c .v{-webkit-line-clamp:unset;display:block}' +
    '.bn-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;margin:auto}' +
    '.bn-order{font:500 15.5px "Mitr",system-ui,sans-serif;background:#E8621A;color:#fff;border:none;border-radius:99px;padding:14px 22px;box-shadow:0 6px 16px rgba(0,0,0,.4);cursor:pointer;width:min(86vw,360px)}';
  function css() {
    if (document.getElementById('oc-bn-css')) return;
    var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Caveat:wght@600&family=Mitr:wght@300;400;500&display=swap'; document.head.appendChild(l);
    var s = document.createElement('style'); s.id = 'oc-bn-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function card(b, attrs) {
    var tag = b.status === 'store' ? '<span class="bc-tag store">เมล็ดประจำร้าน</span>' : b.status === 'limited' ? '<span class="bc-tag limited">Limited</span>' : '';
    var ph = b.photo ? 'background-image:url(\'' + esc(b.photo) + '\');background-position:' + esc(b.pos || 'center') : '';
    var L = b.name.length <= 11 ? '' : (b.name.length <= 17 ? ' l2' : ' l3');
    var price = b.sur > 0 ? '+' + b.sur + '฿' : 'ไม่บวกเพิ่ม';
    return '<div class="bc" ' + (attrs || '') + '>' + tag + '<div class="bc-in"><div class="bc-art" style="' + ph + '"></div></div>' +
      '<div class="bc-nm' + L + '">' + esc(b.name) + '</div><hr><div class="bc-g">' +
      '<div class="bc-c h"><small>Roast level</small><div class="v one">' + dash(b.roast) + '</div></div>' +
      '<div class="bc-c h"><small>Body</small><div class="v dt one">' + dots(b.body) + '</div></div>' +
      '<div class="bc-c"><small>Taste notes</small><div class="v">' + dash(b.notes) + '</div></div>' +
      '<div class="bc-c"><small>Recommend drinks</small><div class="v">' + dash((b.rec || []).join(' · ')) + '</div></div>' +
      '<div class="bc-c"><small>Price</small><div class="v pr one">' + price + '</div></div></div></div>';
  }

  function mount(el, sb, opts) {
    opts = opts || {};   // opts.onOrder(bean): shows 'order a drink with this bean'; opts.surFor(id, default): price for this member's channel
    css();
    var S = { beans: [], enabled: true, failed: false, loaded: false, recOpts: [], tone: {}, roast: {}, rec: {} };
    el.className = (el.className + ' oc-bn').trim();
    el.innerHTML = '<div class="bn-state">กำลังโหลด…</div>';
    var veil = document.createElement('div'); veil.className = 'bn-veil'; document.body.appendChild(veil);
    veil.addEventListener('click', function (e) {
      var o = e.target.closest('[data-order]');
      veil.classList.remove('on');
      if (o && opts.onOrder) { var b = S.beans[Number(o.dataset.order)]; if (b) opts.onOrder(b); }
    });

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
      var used = {}; S.beans.forEach(function (b) { (b.rec || []).forEach(function (r) { used[r.toLowerCase()] = r; }); });
      var recs = []; S.recOpts.forEach(function (o) { if (used[o.toLowerCase()]) { recs.push([o.toLowerCase(), o]); delete used[o.toLowerCase()]; } });
      Object.keys(used).forEach(function (k) { recs.push([k, used[k]]); });
      var hasF = ['tone', 'roast', 'rec'].some(function (k) { return Object.keys(S[k]).some(function (x) { return S[k][x]; }); });
      var list = S.beans.filter(pass);
      el.innerHTML = '<h3>Maewsom Beans Selection - เลือกเมล็ดกาแฟ</h3><div class="bn-sub">เมล็ดกาแฟในร้านตอนนี้ ' + S.beans.length + ' รายการ · แตะการ์ดเพื่อขยาย</div>' +
        chips('เลือกโทนรสที่ชอบ', 'tone', TONES) + chips('Roast level', 'roast', roasts) + chips('Recommend drinks', 'rec', recs) +
        (hasF ? '<button type="button" class="bn-clear" data-clear="1">ล้างตัวกรอง</button>' : '') +
        '<div class="bn-grid">' + (list.length ? list.map(function (b) { return card(b, 'role="button" tabindex="0" data-i="' + S.beans.indexOf(b) + '"'); }).join('') : '<div class="bn-state">ไม่มีเมล็ดที่ตรงกับตัวกรอง</div>') + '</div>';
    }
    el.addEventListener('click', function (e) {
      var c = e.target.closest('[data-k]');
      if (c) { S[c.dataset.k][c.dataset.v] = !S[c.dataset.k][c.dataset.v]; render(); return; }
      if (e.target.closest('[data-clear]')) { S.tone = {}; S.roast = {}; S.rec = {}; render(); return; }
      var k = e.target.closest('.bc[data-i]');
      if (k) { var b = S.beans[Number(k.dataset.i)]; if (b) { veil.innerHTML = '<div class="bn-wrap">' + card(b, '') + (opts.onOrder && b.ing ? '<button type="button" class="bn-order" data-order="' + S.beans.indexOf(b) + '">☕ สั่งเครื่องดื่มด้วยเมล็ดนี้ ›</button>' : '') + '</div>'; veil.classList.add('on'); } }
    });

    Promise.all([
      sb.from('system_settings').select('key,value').like('key', 'beans_page.%'),
      sb.from('bean_profiles').select('*').eq('visible', true),
      sb.from('ingredients').select('id,name,stock_quantity,customer_bean_surcharge').eq('category', 'coffee_bean').eq('active', true)
    ]).then(function (r) {
      if (r[1].error || r[2].error) throw (r[1].error || r[2].error);
      var set = {}; (r[0].data || []).forEach(function (x) { set[x.key] = x.value; });
      S.enabled = !(set['beans_page.enabled'] === false || set['beans_page.enabled'] === 'false');
      S.recOpts = String(set['beans_page.recommend_options'] || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      var ing = {}; (r[2].data || []).forEach(function (i) { ing[i.id] = i; });
      var ok = function (i) { return i && Number(i.stock_quantity) >= DOSE; };
      S.beans = (r[1].data || []).map(function (p) {
        var name, sur;
        if (p.ingredient_id) { var i = ing[p.ingredient_id]; if (!ok(i)) return null; name = i.name; sur = Number(i.customer_bean_surcharge) || 0; if (opts.surFor) sur = Number(opts.surFor(i.id, sur)) || 0; }
        else { // Houseblend: โชว์เมื่อเมล็ดผสมทุกตัวมีสต็อกพอ — ส่วนผสมไม่แสดงให้ลูกค้า
          var ids = p.blend_member_ids || [], ms = ids.map(function (x) { return ing[x]; });
          if (!ids.length || !ms.every(ok)) return null;
          name = p.display_name; sur = Math.max.apply(null, ms.map(function (m) { return Number(m.customer_bean_surcharge) || 0; }));
        }
        return { name: name, ing: p.ingredient_id || null, sur: sur, photo: p.photo_url, pos: p.photo_pos, roast: p.roast, notes: p.notes, body: p.body_score, rec: p.recommend || [], tones: p.tones || [], status: p.status || '', sort: p.sort_order || 0 };
      }).filter(Boolean).sort(function (a, b) { return (RANK[a.status] - RANK[b.status]) || (a.sort - b.sort) || a.name.localeCompare(b.name); });
    }).catch(function () { S.failed = true; }).then(function () { S.loaded = true; render(); });
  }
  window.OCBeans = { mount: mount };
})();
