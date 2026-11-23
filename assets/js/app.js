/* MAISTYLIST · lógica de la página (carrusel, reserva y envío por WhatsApp) */
{

const SRV = {}; CATS.forEach(c => c.s.forEach((x,i) => SRV[c.id+i] = { id:c.id+i, cat:c.id, nombre:x[0], min:x[1], precio:x[2] }));

const $ = s => document.querySelector(s);
const pesos = v => '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dur = m => m < 60 ? m + ' min' : Math.floor(m/60) + ' h' + (m%60 ? ' ' + m%60 + ' min' : '');
const DS = ['dom','lun','mar','mié','jue','vie','sáb'], MS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const h12 = m => { const h = Math.floor(m/60), mm = m%60; return (h%12||12) + ':' + String(mm).padStart(2,'0') + (h<12?' a. m.':' p. m.'); };
const ls = { get(k){ try { return JSON.parse(localStorage.getItem('doree_'+k)); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem('doree_'+k, JSON.stringify(v)); } catch(e){} } };

const R = { cat: CATS[0].id, sel: [], fecha: null, hora: null };
let idx = 0;

/* ----- Fotos: primero la nueva, si no existe la actual ----- */
const FOTO = id => `assets/img/servicios/nuevas/${id}.jpg`;
const RESPALDO = id => `assets/img/servicios/actuales/${id}.jpg`;
const img = (id, cls, alt, extra = '') => `<img class="${cls}" src="${FOTO(id)}" alt="${alt}" ${extra} onerror="this.onerror=null;this.src='${RESPALDO(id)}'">`;

/* ----- Carrusel ----- */
const track = $('#track');
track.innerHTML = CATS.map((c,i) => `<article class="slide${i?'':' on'}" aria-roledescription="diapositiva" aria-label="${c.nombre}, ${i+1} de ${CATS.length}">
  ${img(c.id,'fondo','','aria-hidden="true"'+(i>1?' loading="lazy"':''))}${img(c.id,'foto',c.nombre+' en MAISTYLIST',i>1?'loading="lazy"':'')}
  <div class="cap"><div class="k">${c.k}</div><h2>${c.nombre}</h2><p>${c.desc}</p>
  <div class="acc"><button class="btn oro" data-reservar="${c.id}">Reservar ${c.nombre.toLowerCase()}</button><button class="btn vid" data-ver="${c.id}">Ver precios</button></div></div></article>`).join('');
$('#thumbs').innerHTML = CATS.map((c,i) => `<button class="th${i?'':' on'}" role="tab" aria-selected="${!i}" data-i="${i}">${img(c.id,'','','loading="lazy"')}${c.nombre}</button>`).join('');
const slides = [...track.children], thumbs = [...$('#thumbs').children];
const ir = (i, suave = true) => { i = (i + CATS.length) % CATS.length; track.scrollTo({ left: i * track.clientWidth, behavior: suave && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' }); };
const marcar = i => {
  if (i === idx && slides[i].classList.contains('on')) return;
  idx = i;
  slides.forEach((s,j) => s.classList.toggle('on', j === i));
  thumbs.forEach((t,j) => { t.classList.toggle('on', j === i); t.setAttribute('aria-selected', j === i); });
  thumbs[i].scrollIntoView({ block:'nearest', inline:'center', behavior:'smooth' });
  $('#progreso').style.width = ((i+1)/CATS.length*100) + '%';
  if (i) $('#pista').classList.add('fuera');
  elegirCat(CATS[i].id, false);
};
let tScroll;
track.addEventListener('scroll', () => { clearTimeout(tScroll); tScroll = setTimeout(() => marcar(Math.round(track.scrollLeft / track.clientWidth)), 60); }, { passive:true });
addEventListener('resize', () => ir(idx, false));
$('#ant').onclick = () => ir(idx - 1);
$('#sig').onclick = () => ir(idx + 1);
$('#thumbs').onclick = e => { const b = e.target.closest('.th'); if (b) ir(+b.dataset.i); };
track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); ir(idx+1); } if (e.key === 'ArrowLeft') { e.preventDefault(); ir(idx-1); } });
track.addEventListener('click', e => {
  const b = e.target.closest('[data-reservar],[data-ver]'); if (!b) return;
  const id = b.dataset.reservar || b.dataset.ver;
  elegirCat(id, true);
  if (b.dataset.reservar && !R.sel.some(s => SRV[s].cat === id)) toggle(id + '0');
  $('#reserva').scrollIntoView({ behavior:'smooth' });
});
$('#progreso').style.width = (1/CATS.length*100) + '%';

/* ----- Servicios ----- */
function elegirCat(id, moverCarrusel) {
  R.cat = id;
  const c = CATS.find(x => x.id === id), i = CATS.indexOf(c);
  $('#intro').innerHTML = `${img(c.id,'','')}<div><h2>${c.nombre}</h2><p>${c.desc}</p></div>`;
  $('#cats').innerHTML = CATS.map(x => `<button class="cat${x.id===id?' on':''}" data-c="${x.id}">${x.nombre}</button>`).join('');
  pintarLista();
  if (moverCarrusel && i !== idx) ir(i, false);
}
function pintarLista() {
  const c = CATS.find(x => x.id === R.cat);
  $('#lista').innerHTML = c.s.map((x,i) => { const id = c.id + i, on = R.sel.includes(id);
    return `<button class="srv${on?' on':''}" data-s="${id}" aria-pressed="${on}"><span class="ck">✓</span><span><b>${x[0]}</b><small>${dur(x[1])}</small></span><span class="pr">${pesos(x[2])}</span></button>`; }).join('');
}
function toggle(id) {
  R.sel = R.sel.includes(id) ? R.sel.filter(s => s !== id) : [...R.sel, id];
  pintarLista(); pintarHoras(); resumen();
}
$('#cats').onclick = e => { const b = e.target.closest('.cat'); if (b) elegirCat(b.dataset.c, true); };
$('#lista').onclick = e => { const b = e.target.closest('.srv'); if (b) toggle(b.dataset.s); };

/* ----- Días y horas (disponibilidad de ejemplo; se conecta a la agenda real) ----- */
const hoy = new Date(); hoy.setHours(0,0,0,0);
const DIAS = Array.from({ length: DIAS_A_MOSTRAR }, (_,i) => { const d = new Date(hoy); d.setDate(d.getDate() + i); return d; });
const iso = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
const semilla = (s) => { let h = 0; for (const ch of s) h = (h*31 + ch.charCodeAt(0)) >>> 0; return () => (h = (h*1103515245 + 12345) >>> 0) / 4294967296; };
function turnos(d) {
  const h = HORARIO[d.getDay()];
  if (!h) return [];
  const rnd = semilla(iso(d)), out = [];
  for (let m = h[0]; m <= h[1] - 60; m += INTERVALO_MIN) out.push({ m, libre: rnd() > .38 });
  if (iso(d) === iso(new Date())) { const ahora = new Date().getHours()*60 + new Date().getMinutes() + 60; out.forEach(t => { if (t.m < ahora) t.libre = false; }); }
  return out;
}
$('#dias').innerHTML = DIAS.map(d => { const t = turnos(d), n = t.filter(x => x.libre).length;
  return `<button class="dia" data-f="${iso(d)}" ${n?'':'disabled'}><small>${DS[d.getDay()]}</small><b>${d.getDate()}</b><i>${n ? '● ' + n + ' cupos' : HORARIO[d.getDay()] ? 'lleno' : 'cerrado'}</i></button>`; }).join('');
$('#dias').onclick = e => { const b = e.target.closest('.dia'); if (!b) return; R.fecha = b.dataset.f; R.hora = null;
  document.querySelectorAll('.dia').forEach(x => x.classList.toggle('on', x === b)); pintarHoras(); resumen();
  setTimeout(() => $('#horas').scrollIntoView({ behavior:'smooth', block:'nearest' }), 50); };
function pintarHoras() {
  if (!R.fecha) return;
  const d = DIAS.find(x => iso(x) === R.fecha), t = turnos(d);
  const grupo = (tit, a, b) => { const g = t.filter(x => x.m >= a && x.m < b); return g.length ? `<div class="franja">${tit}</div><div class="horas">${g.map(x => `<button class="hora${R.hora===x.m?' on':''}" data-h="${x.m}" ${x.libre?'':'disabled'}>${h12(x.m)}</button>`).join('')}</div>` : ''; };
  $('#horas').innerHTML = grupo('Mañana', 0, 12*60) + grupo('Tarde', 12*60, 24*60);
}
$('#horas').onclick = e => { const b = e.target.closest('.hora'); if (!b) return; R.hora = +b.dataset.h; pintarHoras(); resumen(); };

/* ----- Datos, resumen y factura ----- */
const prev = ls.get('cliente') || {};
$('#nombre').value = prev.nombre || ''; $('#tel').value = prev.tel || '';
const fechaLarga = f => { const d = DIAS.find(x => iso(x) === f); return DS[d.getDay()].replace(/^./, c => c.toUpperCase()) + ' ' + d.getDate() + ' de ' + MS[d.getMonth()]; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const telVista = t => t.length === 10 ? t.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3') : t;
const numFactura = () => {
  const d = new Date(), p = n => String(n).padStart(2,'0');
  return 'MS-' + p(d.getDate()) + p(d.getMonth()+1) + String(d.getFullYear()).slice(2) + '-' + Math.floor(100 + Math.random()*900);
};
let msgListo = '', facturaPendiente = null;

function resumen() {
  const s = R.sel.map(id => SRV[id]), tot = s.reduce((a,x) => a + x.precio, 0), min = s.reduce((a,x) => a + x.min, 0);
  $('#res').classList.toggle('ver', s.length > 0 || window.scrollY > innerHeight * .6);
  $('#resT').textContent = s.length ? pesos(tot) + ' · ' + dur(min) : 'Elige un servicio';
  $('#resS').textContent = s.length ? (s.length === 1 ? s[0].nombre : s.length + ' servicios') + (R.fecha ? ' · ' + fechaLarga(R.fecha) + (R.hora != null ? ', ' + h12(R.hora) : '') : '') : '';
  const listo = s.length && R.fecha && R.hora != null;
  $('#confirmar').disabled = !s.length;
  $('#confirmar').textContent = listo ? 'Confirmar' : !R.fecha ? 'Elegir día' : 'Elegir hora';
  $('#limpiar').hidden = !s.length;
}
addEventListener('scroll', resumen, { passive:true });
$('#limpiar').onclick = () => {
  R.sel = []; R.fecha = null; R.hora = null;
  document.querySelectorAll('.dia.on').forEach(x => x.classList.remove('on'));
  $('#horas').innerHTML = '<div class="vacio">Primero elige un día.</div>';
  pintarLista(); resumen();
};

function datosFactura() {
  const nombre = $('#nombre').value.trim(), tel = $('#tel').value.replace(/\D/g,'');
  const lineas = R.sel.map(id => { const x = SRV[id], cat = CATS.find(c => c.id === x.cat); return { ...x, catNombre: cat.nombre }; });
  const total = lineas.reduce((a,x) => a + x.precio, 0), minutos = lineas.reduce((a,x) => a + x.min, 0);
  return {
    num: numFactura(), nombre, tel, telVista: telVista(tel),
    fecha: fechaLarga(R.fecha), hora: h12(R.hora), duracion: dur(minutos),
    notas: $('#notas').value.trim(), lineas, total
  };
}
function armarMensaje(d) {
  const partes = [
    'Hola MAISTYLIST, quiero reservar mi cita.',
    '',
    'Factura ' + d.num,
    'Nombre: ' + d.nombre,
    'Celular: ' + d.telVista,
    'Fecha: ' + d.fecha,
    'Hora: ' + d.hora + ' · ' + d.duracion,
    '',
    ...d.lineas.map(x => '• ' + x.nombre + ' — ' + pesos(x.precio))
  ];
  if (d.notas) partes.push('', 'Notas: ' + d.notas);
  partes.push('', 'Total: ' + pesos(d.total), '', 'Adjunto la factura con el detalle de mi cita.');
  return partes.join('\n');
}
function htmlFactura(d) {
  const filas = d.lineas.map(x => `<tr><td><div class="lin">${img(x.cat,'mini',x.nombre)}<span><b>${esc(x.nombre)}</b><small>${esc(x.catNombre)} · ${dur(x.min)}</small></span></div></td><td class="imp">${pesos(x.precio)}</td></tr>`).join('');
  const notas = d.notas ? `<p class="fac-notas"><b>Notas.</b> ${esc(d.notas)}</p>` : '';
  return `<div class="blob b1"></div><div class="blob b2"></div>
    <div class="fac-head"><h4 id="capaT">FACTURA</h4><img class="fac-logo" src="assets/img/marca/logo-transparente.png" alt="MAISTYLIST"></div>
    <div class="fac-meta">
      <div><small>DATOS DEL CLIENTE</small><b>${esc(d.nombre)}</b><span>WhatsApp ${esc(d.telVista)}</span></div>
      <div class="fac-num"><div><small>Nº FACTURA</small><b>${esc(d.num)}</b></div><div><small>FECHA</small><b>${esc(d.fecha)}</b></div><div><small>HORA</small><b>${esc(d.hora)}</b></div></div>
    </div>
    <table><thead><tr><th>DESCRIPCIÓN</th><th>IMPORTE</th></tr></thead><tbody>${filas}</tbody></table>
    ${notas}
    <div class="fac-tot"><div><span>Duración</span><b>${esc(d.duracion)}</b></div><div class="gran"><span>TOTAL</span><b>${pesos(d.total)}</b></div></div>
    <div class="fac-foot"><div><b>MAISTYLIST</b><span>Estilista integral</span><span>304 207 5328</span></div><div class="gracias"><em>Gracias</em><span>Tu cita queda por confirmar</span></div></div>`;
}

function cargarSrc(src) {
  return new Promise(resolve => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => resolve(null); im.src = src; });
}
function cargarFoto(id) {
  return cargarSrc(FOTO(id)).then(im => im || cargarSrc(RESPALDO(id)));
}
function trazo(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r); ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r); ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
}
function recortar(ctx, texto, max) {
  if (ctx.measureText(texto).width <= max) return texto;
  let t = texto; while (t && ctx.measureText(t + '…').width > max) t = t.slice(0,-1); return t + '…';
}
function dibujarFoto(ctx, im, x, y, w, h, radio) {
  ctx.save(); trazo(ctx, x, y, w, h, radio); ctx.clip();
  if (!im) { ctx.fillStyle = '#f6e4e9'; ctx.fillRect(x, y, w, h); ctx.restore(); return; }
  const ir = im.width / im.height, r = w / h; let dw, dh, dx, dy;
  if (ir > r) { dh = h; dw = h * ir; dx = x - (dw - w) / 2; dy = y; }
  else { dw = w; dh = w / ir; dx = x; dy = y - (dh - h) / 2; }
  ctx.drawImage(im, dx, dy, dw, dh); ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(184,145,58,.45)'; ctx.lineWidth = 2; trazo(ctx, x, y, w, h, radio); ctx.stroke(); ctx.restore();
}
async function dibujarFactura(d) {
  try { await document.fonts.load('64px "Great Vibes"'); await document.fonts.load('600 72px Jost'); } catch (e) {}
  const fotos = await Promise.all(d.lineas.map(x => cargarFoto(x.cat)));
  const logo = await cargarSrc('assets/img/marca/logo-transparente.png');
  const W = 1000, pad = 56, rowH = 92;
  const H = 430 + d.lineas.length * rowH + (d.notas ? 70 : 0) + 230;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f7e3e8'; ctx.beginPath(); ctx.ellipse(W - 30, 20, 250, 170, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f3c9d4'; ctx.beginPath(); ctx.ellipse(W + 10, -20, 150, 110, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f8e7eb'; ctx.beginPath(); ctx.ellipse(-10, H - 30, 230, 160, 0.4, 0, Math.PI * 2); ctx.fill();
  if (logo) { const lh = 108, lw = lh * logo.width / logo.height; ctx.drawImage(logo, W - pad - lw, 28, lw, lh); }
  ctx.fillStyle = '#161616'; ctx.font = '600 78px Jost, sans-serif'; ctx.textBaseline = 'top';
  ctx.fillText('FACTURA', pad, 48);
  const metaY = 176;
  ctx.fillStyle = '#c48998'; ctx.font = '600 13px Jost, sans-serif';
  ctx.fillText('DATOS DEL CLIENTE', pad, metaY);
  ctx.fillStyle = '#161616'; ctx.font = '600 24px Jost, sans-serif';
  ctx.fillText(recortar(ctx, d.nombre, 460), pad, metaY + 24);
  ctx.fillStyle = '#5c5360'; ctx.font = '16px Jost, sans-serif';
  ctx.fillText('WhatsApp ' + d.telVista, pad, metaY + 56);
  const derecha = [ ['Nº FACTURA', d.num], ['FECHA', d.fecha], ['HORA', d.hora] ];
  derecha.forEach((par, i) => {
    const y = metaY + i * 52;
    ctx.fillStyle = '#c48998'; ctx.font = '600 13px Jost, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(par[0], W - pad, y);
    ctx.fillStyle = '#161616'; ctx.font = '600 20px Jost, sans-serif';
    ctx.fillText(recortar(ctx, par[1], 420), W - pad, y + 22);
  });
  ctx.textAlign = 'left';
  let y = 360;
  trazo(ctx, pad, y, W - pad * 2, 44, 8); ctx.fillStyle = '#e8b7c3'; ctx.fill();
  ctx.fillStyle = '#3a2430'; ctx.font = '600 13px Jost, sans-serif';
  ctx.fillText('DESCRIPCIÓN', pad + 16, y + 14);
  ctx.textAlign = 'right'; ctx.fillText('IMPORTE', W - pad - 16, y + 14); ctx.textAlign = 'left';
  y += 44;
  d.lineas.forEach((linea, i) => {
    dibujarFoto(ctx, fotos[i], pad + 8, y + 16, 60, 60, 12);
    ctx.fillStyle = '#161616'; ctx.font = '600 20px Jost, sans-serif'; ctx.textBaseline = 'top';
    ctx.fillText(recortar(ctx, linea.nombre, W - pad * 2 - 240), pad + 84, y + 24);
    ctx.fillStyle = '#7d7080'; ctx.font = '15px Jost, sans-serif';
    ctx.fillText(linea.catNombre + ' · ' + dur(linea.min), pad + 84, y + 50);
    ctx.fillStyle = '#161616'; ctx.font = '600 20px Jost, sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(pesos(linea.precio), W - pad - 8, y + 34); ctx.textAlign = 'left';
    ctx.strokeStyle = '#f3e3e8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad, y + rowH); ctx.lineTo(W - pad, y + rowH); ctx.stroke();
    y += rowH;
  });
  if (d.notas) {
    y += 18; ctx.fillStyle = '#5c5360'; ctx.font = '16px Jost, sans-serif';
    ctx.fillText(recortar(ctx, 'Notas: ' + d.notas, W - pad * 2), pad, y); y += 36;
  }
  y += 22;
  ctx.textAlign = 'right'; ctx.fillStyle = '#5c5360'; ctx.font = '16px Jost, sans-serif';
  ctx.fillText('Duración', W - pad - 180, y); ctx.fillStyle = '#161616'; ctx.font = '600 16px Jost, sans-serif'; ctx.fillText(d.duracion, W - pad, y);
  y += 18; ctx.strokeStyle = '#f0dde3'; ctx.beginPath(); ctx.moveTo(W - pad - 250, y); ctx.lineTo(W - pad, y); ctx.stroke();
  y += 14; ctx.fillStyle = '#161616'; ctx.font = '600 22px Jost, sans-serif'; ctx.fillText('TOTAL', W - pad - 180, y);
  ctx.fillStyle = '#8a6230'; ctx.fillText(pesos(d.total), W - pad, y);
  ctx.textAlign = 'left';
  const fy = H - 150;
  ctx.fillStyle = '#161616'; ctx.font = '600 14px Jost, sans-serif'; ctx.fillText('MAISTYLIST', pad, fy);
  ctx.fillStyle = '#6d6470'; ctx.font = '15px Jost, sans-serif';
  ctx.fillText('Estilista integral', pad, fy + 24); ctx.fillText('304 207 5328', pad, fy + 46);
  ctx.textAlign = 'right'; ctx.fillStyle = '#2a2a2a'; ctx.font = '64px "Great Vibes", cursive';
  ctx.fillText('Gracias', W - pad, fy - 8);
  ctx.font = '14px Jost, sans-serif'; ctx.fillStyle = '#6d6470';
  ctx.fillText('Tu cita queda por confirmar', W - pad, fy + 58);
  ctx.textAlign = 'left';
  return canvas;
}
function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function abrirWhatsApp(texto) {
  const url = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  window.open(url, '_blank', 'noopener');
}

$('#confirmar').onclick = () => {
  if (!R.fecha) return $('#dias').closest('.sec').scrollIntoView({ behavior:'smooth' });
  if (R.hora == null) return $('#horas').closest('.sec').scrollIntoView({ behavior:'smooth' });
  const nombre = $('#nombre').value.trim(), tel = $('#tel').value.replace(/\D/g,'');
  if (nombre.length < 3 || tel.length < 7) {
    $('#err').textContent = nombre.length < 3 ? 'Escribe tu nombre para apartar el cupo.' : 'Escribe un celular válido para confirmarte.';
    $('#form').closest('.sec').scrollIntoView({ behavior:'smooth' }); return;
  }
  $('#err').textContent = '';
  const d = datosFactura();
  ls.set('cliente', { nombre, tel });
  ls.set('reserva', { num: d.num, nombre, tel, fecha: R.fecha, hora: R.hora, servicios: d.lineas.map(x => x.id), total: d.total });
  msgListo = armarMensaje(d);
  $('#factura').innerHTML = htmlFactura(d);
  $('#facEstado').textContent = '';
  $('#enviar').disabled = false; $('#enviar').textContent = 'Enviar factura por WhatsApp';
  facturaPendiente = dibujarFactura(d);
  $('#capa').classList.add('ver'); $('#enviar').focus();
};
$('#enviar').onclick = async () => {
  $('#enviar').disabled = true; $('#enviar').textContent = 'Preparando factura…'; $('#facEstado').textContent = '';
  try {
    const canvas = await facturaPendiente;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const archivo = new File([blob], 'Factura-MAISTYLIST.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], text: msgListo, title: 'Factura MAISTYLIST' });
        $('#facEstado').textContent = 'Si elegiste WhatsApp, la factura va en el chat con el mensaje.';
        return;
      } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    abrirWhatsApp(msgListo);
    descargar(blob, archivo.name);
    $('#facEstado').textContent = 'Se abrió WhatsApp con el mensaje al 304 207 5328. La factura se descargó: adjúntala en el chat.';
  } catch (e) {
    abrirWhatsApp(msgListo);
    $('#facEstado').textContent = 'Se abrió WhatsApp con el mensaje. No se pudo preparar la imagen de la factura.';
  } finally {
    $('#enviar').disabled = false; $('#enviar').textContent = 'Enviar factura por WhatsApp';
  }
};
$('#copiar').onclick = async () => {
  try { await navigator.clipboard.writeText(msgListo); $('#copiar').textContent = 'Mensaje copiado'; }
  catch (e) { $('#copiar').textContent = 'No se pudo copiar'; }
  setTimeout(() => $('#copiar').textContent = 'Copiar mensaje', 2000);
};
const cerrar = () => { $('#capa').classList.remove('ver'); $('#confirmar').focus(); };
$('#cerrar').onclick = cerrar;
$('#capa').onclick = e => { if (e.target.id === 'capa') cerrar(); };
addEventListener('keydown', e => { if (e.key === 'Escape' && $('#capa').classList.contains('ver')) cerrar(); });
['nombre','tel'].forEach(id => $('#'+id).addEventListener('input', () => $('#err').textContent = ''));

elegirCat(R.cat, false); resumen();
}
