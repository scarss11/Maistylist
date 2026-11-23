/* =========================================================
   MAISTYLIST · CONFIGURACIÓN — edita solo este archivo y servicios.js
   ========================================================= */

/* Número de WhatsApp del negocio con indicativo, sin espacios ni "+".
   Ej. '573001234567'. Vacío = la clienta elige a quién enviar el mensaje. */
const WHATSAPP = '';

/* Horario de atención (minutos desde medianoche). 0 = domingo … 6 = sábado.
   null = cerrado ese día. */
const HORARIO = {
  0: null,
  1: [8*60, 19*60], 2: [8*60, 19*60], 3: [8*60, 19*60], 4: [8*60, 19*60], 5: [8*60, 19*60],
  6: [8*60, 15*60]
};
const INTERVALO_MIN = 30;   // cada cuánto se ofrece un turno
const DIAS_A_MOSTRAR = 21;  // cuántos días hacia adelante se pueden reservar
