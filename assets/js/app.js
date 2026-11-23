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

/* ----- Datos, resumen y envío ----- */
const prev = ls.get('cliente') || {};
$('#nombre').value = prev.nombre || ''; $('#tel').value = prev.tel || '';
const fechaLarga = f => { const d = DIAS.find(x => iso(x) === f); return DS[d.getDay()].replace(/^./, c => c.toUpperCase()) + ' ' + d.getDate() + ' de ' + MS[d.getMonth()]; };
function resumen() {
  const s = R.sel.map(id => SRV[id]), tot = s.reduce((a,x) => a + x.precio, 0), min = s.reduce((a,x) => a + x.min, 0);
  $('#res').classList.toggle('ver', s.length > 0 || window.scrollY > innerHeight * .6);
  $('#resT').textContent = s.length ? pesos(tot) + ' · ' + dur(min) : 'Elige un servicio';
  $('#resS').textContent = s.length ? (s.length === 1 ? s[0].nombre : s.length + ' servicios') + (R.fecha ? ' · ' + fechaLarga(R.fecha) + (R.hora != null ? ', ' + h12(R.hora) : '') : '') : '';
  const listo = s.length && R.fecha && R.hora != null;
  $('#confirmar').disabled = !s.length;
  $('#confirmar').textContent = listo ? 'Confirmar' : !R.fecha ? 'Elegir día' : 'Elegir hora';
}
addEventListener('scroll', resumen, { passive:true });
$('#confirmar').onclick = () => {
  if (!R.fecha) return $('#dias').closest('.sec').scrollIntoView({ behavior:'smooth' });
  if (R.hora == null) return $('#horas').closest('.sec').scrollIntoView({ behavior:'smooth' });
  const nombre = $('#nombre').value.trim(), tel = $('#tel').value.replace(/\D/g,'');
  if (nombre.length < 3 || tel.length < 7) {
    $('#err').textContent = nombre.length < 3 ? 'Escribe tu nombre para apartar el cupo.' : 'Escribe un celular válido para confirmarte.';
    $('#form').closest('.sec').scrollIntoView({ behavior:'smooth' }); return;
  }
  $('#err').textContent = ''; ls.set('cliente', { nombre, tel });
  const s = R.sel.map(id => SRV[id]), tot = s.reduce((a,x) => a + x.precio, 0), min = s.reduce((a,x) => a + x.min, 0);
  const notas = $('#notas').value.trim();
  $('#detalle').innerHTML = s.map(x => `<dt>${x.nombre}</dt><dd>${pesos(x.precio)}</dd>`).join('') +
    `<dt>Fecha</dt><dd>${fechaLarga(R.fecha)}</dd><dt>Hora</dt><dd>${h12(R.hora)} · ${dur(min)}</dd><dt>A nombre de</dt><dd>${nombre.replace(/</g,'&lt;')}</dd>` +
    `<dt class="tot">Total</dt><dd class="tot">${pesos(tot)}</dd>`;
  const msg = `Hola MAISTYLIST, quiero reservar:\n${s.map(x => '• ' + x.nombre + ' (' + pesos(x.precio) + ')').join('\n')}\n📅 ${fechaLarga(R.fecha)}, ${h12(R.hora)}\n👤 ${nombre} · ${tel}${notas ? '\n📝 ' + notas : ''}\nTotal: ${pesos(tot)}`;
  $('#enviar').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
  $('#copiar').onclick = async () => { try { await navigator.clipboard.writeText(msg); $('#copiar').textContent = 'Mensaje copiado'; } catch(e) { $('#copiar').textContent = 'No se pudo copiar'; } setTimeout(() => $('#copiar').textContent = 'Copiar mensaje', 2000); };
  $('#capa').classList.add('ver'); $('#enviar').focus();
};
const cerrar = () => { $('#capa').classList.remove('ver'); $('#confirmar').focus(); };
$('#cerrar').onclick = cerrar;
$('#capa').onclick = e => { if (e.target.id === 'capa') cerrar(); };
addEventListener('keydown', e => { if (e.key === 'Escape' && $('#capa').classList.contains('ver')) cerrar(); });
['nombre','tel'].forEach(id => $('#'+id).addEventListener('input', () => $('#err').textContent = ''));

elegirCat(R.cat, false); resumen();
}
