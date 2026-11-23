/* =========================================================
   MAISTYLIST · CATÁLOGO DE SERVICIOS (datos de ejemplo — reemplázalos por los reales)
   Cada servicio: [nombre, duración en minutos, precio en pesos]
   La foto de cada categoría se busca primero en
   assets/img/servicios/nuevas/<id>.jpg y, si no existe, en .../actuales/<id>.jpg
   ========================================================= */

const CATS = [
  { id:'cabello', nombre:'Cabello', k:'Tu estilo, tu firma', desc:'Corte, color, peinados y tratamientos para un cabello con vida.',
    s:[['Corte y estilo',60,60000],['Cepillado',45,35000],['Ondas o peinado',60,50000],['Color completo',150,180000],['Balayage / mechas',180,280000],['Tratamiento de hidratación',60,70000]] },
  { id:'unas', nombre:'Uñas', k:'Manicure de autor', desc:'Semipermanente, acrílico y nail art pensado para tus manos.',
    s:[['Manicure tradicional',40,25000],['Semipermanente',60,45000],['Uñas acrílicas',120,90000],['Press-on / soft gel',90,80000],['Nail art (por uña)',10,5000]] },
  { id:'maquillaje', nombre:'Maquillaje', k:'Para tu gran día', desc:'Maquillaje social, de novia y para sesiones de fotos.',
    s:[['Maquillaje social',60,90000],['Maquillaje de novia',90,220000],['Maquillaje + peinado',120,180000]] },
  { id:'cejas', nombre:'Cejas', k:'Diseño a tu rostro', desc:'Diseño, laminado y henna para cejas definidas y naturales.',
    s:[['Diseño de cejas',30,25000],['Laminado de cejas',60,65000],['Henna',45,40000],['Diseño + henna',60,55000]] },
  { id:'pestanas', nombre:'Pestañas', k:'Mirada que habla', desc:'Extensiones pelo a pelo, volumen y lifting para una mirada intensa.',
    s:[['Extensiones clásicas',120,110000],['Volumen ruso',150,140000],['Lifting de pestañas',60,70000],['Retoque (hasta 3 semanas)',60,60000]] },
  { id:'facial', nombre:'Facial', k:'Piel que respira', desc:'Limpieza profunda e hidratación para una piel luminosa.',
    s:[['Limpieza facial profunda',75,90000],['Hidratación facial',60,80000],['Dermaplaning',45,70000]] },
  { id:'pedi', nombre:'Pedicure', k:'Pausa para tus pies', desc:'Spa de pies con exfoliación, hidratación profunda y esmaltado.',
    s:[['Pedicure tradicional',50,30000],['Pedicure semipermanente',60,50000],['Spa de pies',75,60000]] },
  { id:'depilacion', nombre:'Depilación', k:'Suave por más tiempo', desc:'Depilación con cera para rostro y cuerpo.',
    s:[['Bozo o mentón',15,15000],['Axilas',20,20000],['Media pierna',30,35000],['Pierna completa',50,60000]] }
];
