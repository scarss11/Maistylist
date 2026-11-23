# MAISTYLIST · Página de reservas

Página de reservas de MAISTYLIST · Estilista Integral. Al entrar se ve la foto de un servicio en grande, se desliza de lado para ver los demás, y la reserva se envía por WhatsApp.

## Estructura

```
maistylist-web/
├── index.html                  ← la página (estructura)
├── manifest.webmanifest        ← permite "instalarla" en el celular
├── README.md
└── assets/
    ├── css/
    │   └── estilos.css         ← colores, tipografías y diseño
    ├── js/
    │   ├── config.js           ← WhatsApp y horario  ✏️ EDITAR
    │   ├── servicios.js        ← servicios, duraciones y precios  ✏️ EDITAR
    │   └── app.js              ← funcionamiento (no hace falta tocarlo)
    └── img/
        ├── marca/              ← logo (lila, transparente y claro), favicon, íconos de app e imagen para compartir
        └── servicios/
            ├── nuevas/         ← fotos nuevas verticales (aquí van las de Canva)
            └── actuales/       ← fotos anteriores (se usan si falta una nueva)
```

## Fotos de los servicios

Cada servicio busca primero su foto en `assets/img/servicios/nuevas/` y, si no la encuentra, usa la de `actuales/`. Basta con poner el archivo con el nombre exacto y la página la toma sola.

| Servicio   | Nombre del archivo | Foto nueva en Canva |
|------------|--------------------|---------------------|
| Cabello    | `cabello.jpg`      | pendiente |
| Uñas       | `unas.jpg`         | https://www.canva.com/M/MAHbw66NSbo |
| Pestañas   | `pestanas.jpg`     | https://www.canva.com/M/MAHbwz2uiH8 |
| Cejas      | `cejas.jpg`        | https://www.canva.com/M/MAHbwxP2-3U |
| Pedicure   | `pedi.jpg`         | https://www.canva.com/M/MAHbw0sytvI |
| Maquillaje | `maquillaje.jpg`   | https://www.canva.com/M/MAHbw25Mdzg |
| Facial     | `facial.jpg`       | pendiente (se agotaron los créditos de Canva) |
| Depilación | `depilacion.jpg`   | pendiente |

Pasos: abre cada enlace, descarga la imagen en JPG, renómbrala como dice la tabla y guárdala en `assets/img/servicios/nuevas/`.

Las fotos de Canva se generaron con fondos color vino; combinan con la portada oscura, pero si quieres que tiren más al lila de la marca, genera las nuevas cambiando "vino burdeos" por "lila lavanda" en los textos de abajo.

Recomendado: formato vertical 9:16 (por ejemplo 1080 × 1920), en JPG de menos de 400 KB.

### Textos para generar las 3 fotos que faltan (mismo estilo)

- **facial.jpg**: Fotografía editorial vertical de lujo para un spa facial: mujer relajada con los ojos cerrados recibiendo un tratamiento facial, piel luminosa e hidratada, manos de esteticista aplicando suero, toalla blanca en el cabello, luz cálida suave, fondo desenfocado en tonos vino burdeos con detalles dorados, estética premium, sin texto
- **cabello.jpg**: Fotografía editorial vertical de lujo para un salón de belleza: mujer de espaldas con cabello largo castaño, brillante, con ondas suaves recién peinadas, luz cálida que resalta el brillo del cabello, fondo desenfocado en tonos vino burdeos con destellos dorados, estética elegante y premium, sin texto
- **depilacion.jpg**: Fotografía editorial vertical de lujo para un spa: pierna femenina suave e hidratada extendida sobre una camilla con sábana de seda color vino burdeos, junto a un calentador de cera y una espátula de madera, detalles dorados, luz cálida de estudio, estética elegante y premium, sin texto

## Configuración

1. **WhatsApp**: en `assets/js/config.js`, escribe el número en `WHATSAPP` con indicativo y sin espacios (ej. `'573001234567'`).
2. **Horario**: en el mismo archivo, ajusta `HORARIO` (los días con `null` salen como cerrados).
3. **Servicios y precios**: en `assets/js/servicios.js`. Los que trae son **de ejemplo**: reemplázalos por los reales.

> Los cupos por día y hora son simulados. Para mostrar la disponibilidad real hay que conectar la página a la agenda (el sistema de Google que usa la página actual).

## Publicar en GitHub Pages

1. Sube todo el contenido de `maistylist-web/` a la raíz del repositorio.
2. En el repositorio: **Settings → Pages → Branch: main / (root) → Save**.
3. En un par de minutos queda en `https://<usuario>.github.io/<repositorio>/`.

Para probar en tu computador basta con abrir `index.html` en el navegador.
