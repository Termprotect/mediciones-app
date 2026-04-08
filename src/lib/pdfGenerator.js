import {
  WINDOW_TYPES, TIPOS_SIN_HOJA_PRINCIPAL, COLORS, PERSIANAS, MEDIDA_PERSIANA_OPTS,
  ACCIONAMIENTOS, TIPO_MOTOR, GUIAS, MOSQUITEROS, TAPAJUNTAS, VIDRIOS,
  USERS, COMERCIALES, SERVICIOS_OBRA, getLabel,
} from "./constants";

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 60"><rect width="320" height="60" rx="6" fill="#1a1a1a"/><rect x="8" y="8" width="44" height="44" rx="4" fill="#1a1a1a" stroke="#FACC15" stroke-width="2"/><line x1="30" y1="8" x2="30" y2="52" stroke="#FACC15" stroke-width="2"/><line x1="8" y1="30" x2="52" y2="30" stroke="#FACC15" stroke-width="2"/><rect x="10" y="10" width="18" height="18" rx="1" fill="#FACC15"/><rect x="32" y="10" width="18" height="18" rx="1" fill="#FFFFFF"/><rect x="10" y="32" width="18" height="18" rx="1" fill="#FFFFFF"/><rect x="32" y="32" width="18" height="18" rx="1" fill="#FACC15"/><text x="62" y="32" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="bold" fill="#FFFFFF" letter-spacing="1"><tspan fill="#FACC15">TERM</tspan><tspan fill="#FFFFFF">PROTECT</tspan></text><text x="62" y="48" font-family="Arial,Helvetica,sans-serif" font-size="9" fill="#94A3B8" font-style="italic" letter-spacing="1.5">SISTEMAS DE VENTANAS Y PUERTAS</text></svg>`;

function getLogoUri() {
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(LOGO_SVG)));
}

/**
 * Render drawing elements to a temp canvas and return a high-res PNG data URL.
 * Auto-scales content to fit within the output canvas with padding.
 */
function renderDrawingToDataUrl(drawingData) {
  if (!drawingData || drawingData.length === 0) return null;

  // 1. Compute bounding box of all elements (with generous margin for labels)
  const PAD = 25; // padding for labels around shapes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  function extendBounds(x, y) { if (x < minX) minX = x; if (y < minY) minY = y; if (x > maxX) maxX = x; if (y > maxY) maxY = y; }

  drawingData.forEach((el) => {
    if (el.type === "line") {
      extendBounds(el.x1, el.y1); extendBounds(el.x2, el.y2);
    } else if (el.type === "rect" || el.type === "triangle" || el.type === "halfmoon") {
      extendBounds(Math.min(el.x1, el.x2), Math.min(el.y1, el.y2));
      extendBounds(Math.max(el.x1, el.x2), Math.max(el.y1, el.y2));
    } else if (el.type === "freehand" && el.points) {
      el.points.forEach((p) => extendBounds(p.x, p.y));
    } else if (el.type === "text") {
      extendBounds(el.x, el.y); extendBounds(el.x + 80, el.y + 16);
    }
  });

  if (minX === Infinity) return null;
  minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD;
  const contentW = maxX - minX;
  const contentH = maxY - minY;

  // 2. Output canvas: fixed 350×210 CSS px, 2x resolution
  const outW = 350, outH = 210, retina = 2;
  const fitScale = Math.min(outW / contentW, outH / contentH, 1); // never upscale
  const canvas = document.createElement("canvas");
  canvas.width = outW * retina;
  canvas.height = outH * retina;
  const ctx = canvas.getContext("2d");
  ctx.scale(retina, retina);

  // Dark background
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, outW, outH);

  // Grid
  ctx.strokeStyle = "rgba(148,163,184,0.06)";
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx <= outW; gx += 15) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, outH); ctx.stroke(); }
  for (let gy = 0; gy <= outH; gy += 15) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(outW, gy); ctx.stroke(); }

  // 3. Transform: center content in the output
  const drawW = contentW * fitScale, drawH = contentH * fitScale;
  const offX = (outW - drawW) / 2, offY = (outH - drawH) / 2;
  ctx.translate(offX, offY);
  ctx.scale(fitScale, fitScale);
  ctx.translate(-minX, -minY);

  // Label helper (scaled font)
  const fontSize = Math.max(9, Math.min(11, 11 / fitScale * 0.7));
  function pdfLabel(cx, cy, label, c, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    let rot = angle || 0;
    if (rot > Math.PI / 2 || rot < -Math.PI / 2) rot += Math.PI;
    ctx.rotate(rot);
    ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const tw = ctx.measureText(label).width + 8;
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    ctx.fillRect(-tw / 2, -fontSize - 5, tw, fontSize + 3);
    ctx.fillStyle = c;
    ctx.fillText(label, 0, -3);
    ctx.restore();
  }

  // 4. Draw elements
  drawingData.forEach((el) => {
    const lw = el.width || 2;
    if (el.type === "line") {
      ctx.beginPath(); ctx.strokeStyle = el.color; ctx.lineWidth = lw; ctx.lineCap = "round";
      ctx.moveTo(el.x1, el.y1); ctx.lineTo(el.x2, el.y2); ctx.stroke();
      if (el.label) pdfLabel((el.x1 + el.x2) / 2, (el.y1 + el.y2) / 2, el.label, el.color, Math.atan2(el.y2 - el.y1, el.x2 - el.x1));
    } else if (el.type === "rect") {
      const x = Math.min(el.x1, el.x2), y = Math.min(el.y1, el.y2);
      const w = Math.abs(el.x2 - el.x1), h = Math.abs(el.y2 - el.y1);
      ctx.beginPath(); ctx.strokeStyle = el.color; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h);
      if (el.labelW) pdfLabel(x + w / 2, y - 2, el.labelW, el.color, 0);
      if (el.labelH) pdfLabel(x - 2, y + h / 2, el.labelH, el.color, -Math.PI / 2);
    } else if (el.type === "triangle") {
      const x = Math.min(el.x1, el.x2), y = Math.min(el.y1, el.y2);
      const w = Math.abs(el.x2 - el.x1), h = Math.abs(el.y2 - el.y1);
      ctx.beginPath(); ctx.strokeStyle = el.color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.stroke();
      if (el.label) pdfLabel(x + w / 2, y + h + 4, el.label, el.color, 0);
    } else if (el.type === "halfmoon") {
      const cx = (el.x1 + el.x2) / 2, cy = Math.max(el.y1, el.y2);
      const rx = Math.abs(el.x2 - el.x1) / 2, ry = Math.abs(el.y2 - el.y1);
      ctx.beginPath(); ctx.strokeStyle = el.color; ctx.lineWidth = lw;
      ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); ctx.closePath(); ctx.stroke();
      if (el.label) pdfLabel(cx, cy + 4, el.label, el.color, 0);
    } else if (el.type === "freehand") {
      if (!el.points || el.points.length < 2) return;
      ctx.beginPath(); ctx.strokeStyle = el.color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) ctx.lineTo(el.points[i].x, el.points[i].y);
      ctx.stroke();
    } else if (el.type === "text") {
      ctx.font = `bold ${el.size || 13}px 'Segoe UI', Arial, sans-serif`;
      const tw = ctx.measureText(el.text).width + 6;
      ctx.fillStyle = "rgba(15,23,42,0.8)";
      ctx.fillRect(el.x - 3, el.y - 2, tw, (el.size || 13) + 6);
      ctx.fillStyle = el.color; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillText(el.text, el.x, el.y);
    }
  });

  return canvas.toDataURL("image/png");
}

function fld(label, value) {
  if (!value || value === "—") return "";
  return `<div class="f"><span class="fl">${label}</span><span class="fv">${value}</span></div>`;
}

/**
 * Generate and open a professional PDF for a client measurement.
 * @param {Object} opts
 * @param {Object} opts.client - Client object with measurement data
 * @param {Object} [opts.route] - Route object (optional, for medidor/date info)
 * @param {Array}  [opts.windows] - Override windows array (for MeasurementForm which holds local state)
 * @param {string} [opts.globalNotas] - Override global notes
 */
export function generateMeasurementPdf({ client, route, windows: winOverride, globalNotas: notasOverride }) {
  const windows = winOverride || client.measurement?.windows || [];
  const globalNotas = notasOverride ?? client.measurement?.globalNotas ?? "";
  if (windows.length === 0) return;

  const medidor = route ? USERS.find((u) => u.id === route.assignedTo) : null;
  const comercial = COMERCIALES.find((cm) => cm.id === client.comercialId);
  const logoUri = getLogoUri();
  const dateStr = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  const routeDateStr = route?.date ? new Date(route.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "";

  const hubspotHtml = client.hubspotLink
    ? `<a href="${client.hubspotLink}" class="hs-link">HubSpot</a>` : "";

  // Approval status
  let approvalHtml = "";
  if (client.measurementApproval?.status === "aprobado") {
    const dt = client.measurementApproval.approvedAt
      ? new Date(client.measurementApproval.approvedAt).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
      : "";
    approvalHtml = `<div class="approval approved">APROBADA${dt ? " — " + dt : ""}</div>`;
  } else if (client.measurementApproval?.status === "pendiente_aprobacion") {
    approvalHtml = `<div class="approval pending">PENDIENTE DE APROBACION</div>`;
  }

  // Build windows HTML
  let windowsHtml = "";
  windows.forEach((w, idx) => {
    const tipoLabel = getLabel(WINDOW_TYPES, w.tipo) || "Ventana";
    const badges = [];
    if (w.persiana !== "sin") badges.push('<span class="badge bp">Persiana</span>');
    if (w.accionamiento === "motor") badges.push('<span class="badge bm">Motor</span>');

    // Fields row 1: core info
    let fieldsHtml = "";
    fieldsHtml += fld("Tipo", tipoLabel);
    fieldsHtml += fld("Ancho", w.ancho ? w.ancho + " mm" : null);
    fieldsHtml += fld("Alto", w.alto ? w.alto + " mm" : null);
    fieldsHtml += fld("Apertura", w.sentidoApertura);
    if (!TIPOS_SIN_HOJA_PRINCIPAL.includes(w.tipo)) {
      fieldsHtml += fld("Hoja Ppal.", w.hojaPrincipal);
    }
    fieldsHtml += fld("Color", getLabel(COLORS, w.color) || w.colorOtro);
    fieldsHtml += fld("Ubicacion", w.ubicacion);

    // Persiana fields
    if (w.persiana !== "sin") {
      fieldsHtml += fld("Persiana", getLabel(PERSIANAS, w.persiana));
      fieldsHtml += fld("Med. Persiana", getLabel(MEDIDA_PERSIANA_OPTS, w.medidaPersiana));
      fieldsHtml += fld("Accionamiento", getLabel(ACCIONAMIENTOS, w.accionamiento));
      fieldsHtml += fld("Sent. Recogedor", w.sentidoPersiana);
      if (w.accionamiento === "motor") {
        fieldsHtml += fld("Tipo Motor", getLabel(TIPO_MOTOR, w.tipoMotor));
      }
    } else {
      fieldsHtml += fld("Persiana", "Sin persiana");
    }

    // Complementos
    fieldsHtml += fld("Guia", getLabel(GUIAS, w.guia) || w.guiaOtro);
    fieldsHtml += fld("Mosquitera", getLabel(MOSQUITEROS, w.mosquitero) || w.mosquiteroOtro);
    fieldsHtml += fld("Tapajuntas", getLabel(TAPAJUNTAS, w.tapajuntas) || w.tapajuntasObs);
    fieldsHtml += fld("Vidrio", getLabel(VIDRIOS, w.vidrio) || w.vidrioOtro);
    if (w.accesoriosAdicionales) fieldsHtml += fld("Accesorios", w.accesoriosAdicionales);
    if (w.notas) fieldsHtml += fld("Notas", w.notas);

    // Images (max 2)
    let imagesHtml = "";
    const images = (w.media || []).filter((m) => m.type === "image").slice(0, 2);
    if (images.length > 0) {
      imagesHtml = `<div class="win-images">${images.map((m) =>
        `<div class="win-img-wrap"><img src="${m.url}" alt="${m.name || "Foto"}" /></div>`
      ).join("")}</div>`;
    }

    // Drawing
    let drawingHtml = "";
    if (w.drawing && w.drawing.length > 0) {
      const drawingDataUrl = renderDrawingToDataUrl(w.drawing);
      if (drawingDataUrl) {
        drawingHtml = `<div class="win-drawing"><div class="drawing-label">Dibujo Técnico</div><img src="${drawingDataUrl}" alt="Dibujo" /></div>`;
      }
    }

    windowsHtml += `
      <div class="win-card">
        <div class="win-head">
          <div class="win-title"><span class="win-num">${idx + 1}</span>${tipoLabel} ${badges.join(" ")}</div>
          <div class="win-dims"><strong>${w.ancho || "?"}</strong> <small>ancho</small> &times; <strong>${w.alto || "?"}</strong> <small>alto</small> mm</div>
        </div>
        <div class="win-body">
          <div class="fields">${fieldsHtml}</div>
          ${imagesHtml}
          ${drawingHtml}
        </div>
      </div>`;
  });

  // Servicios de obra
  const servicios = client.measurement?.servicios || {};
  const activeServicios = SERVICIOS_OBRA.filter((s) => servicios[s.id]);
  let serviciosHtml = "";
  if (activeServicios.length > 0) {
    serviciosHtml = `<div class="servicios"><strong>Servicios de Obra</strong><div class="serv-tags">${activeServicios.map((s) =>
      `<span class="serv-tag">${s.label}</span>`
    ).join("")}</div></div>`;
  }

  // Global notes
  let globalNotasHtml = "";
  if (globalNotas) {
    globalNotasHtml = `<div class="global-notes"><strong>Notas Globales</strong><p>${globalNotas}</p></div>`;
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Medicion - ${client.name}</title>
<style>
  @page { margin: 12mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #1e293b; font-size: 11px; line-height: 1.45; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 2.5px solid #FACC15; margin-bottom: 14px; }
  .header img { height: 38px; }
  .header-right { text-align: right; font-size: 9.5px; color: #64748b; line-height: 1.5; }
  .header-right .date { font-weight: 600; color: #1e293b; font-size: 10px; }
  .header-right .ref { color: #FACC15; font-weight: 700; font-size: 10px; }

  /* Client card */
  .client { background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; display: flex; gap: 16px; align-items: flex-start; }
  .client-main { flex: 1; }
  .client h2 { font-size: 16px; margin-bottom: 2px; letter-spacing: 0.3px; }
  .client .biz { color: #FACC15; font-size: 11px; font-weight: 600; margin-bottom: 6px; }
  .client .biz .hs-link { color: #60a5fa; text-decoration: none; font-size: 10px; margin-left: 6px; }
  .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 10px; }
  .client-grid .cl { color: #94A3B8; }
  .client-grid .cv { color: #fff; font-weight: 500; }
  .client-meta { background: #0f172a; border-radius: 8px; padding: 10px 12px; min-width: 140px; text-align: center; }
  .client-meta .cm-label { font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; }
  .client-meta .cm-val { font-size: 20px; font-weight: 700; color: #FACC15; margin: 2px 0; }
  .client-meta .cm-sub { font-size: 9px; color: #94A3B8; }

  /* Approval */
  .approval { border-radius: 8px; padding: 7px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; text-align: center; }
  .approval.approved { background: #dcfce7; border: 1px solid #86efac; color: #166534; }
  .approval.pending { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }

  /* Window card */
  .win-card { border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 12px; overflow: hidden; page-break-inside: avoid; }
  .win-head { background: #f1f5f9; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
  .win-title { font-weight: 600; font-size: 12px; display: flex; align-items: center; gap: 6px; }
  .win-num { background: #FACC15; color: #1a1a1a; font-weight: 800; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; }
  .win-dims { font-size: 11px; color: #475569; }
  .win-dims strong { color: #1e293b; font-size: 12px; }
  .win-dims small { font-size: 9px; color: #94a3b8; }
  .win-body { padding: 10px 12px; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .bp { background: #dbeafe; color: #1e40af; }
  .bm { background: #fce7f3; color: #9d174d; }

  /* Field grid */
  .fields { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px 10px; }
  .f { padding: 4px 0; border-bottom: 1px dotted #f1f5f9; }
  .fl { display: block; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; font-weight: 600; line-height: 1.3; }
  .fv { display: block; font-size: 11px; font-weight: 500; color: #1e293b; line-height: 1.4; }

  /* Window images */
  .win-images { display: flex; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
  .win-img-wrap { flex: 0 0 auto; width: 120px; height: 90px; border-radius: 6px; overflow: hidden; border: 1px solid #e2e8f0; }
  .win-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

  /* Window drawing */
  .win-drawing { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0; }
  .win-drawing .drawing-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
  .win-drawing img { max-width: 350px; border-radius: 6px; border: 1px solid #cbd5e1; }

  /* Servicios de obra */
  .servicios { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
  .servicios strong { font-size: 11px; color: #166534; display: block; margin-bottom: 6px; }
  .serv-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .serv-tag { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 9.5px; font-weight: 600; background: #166534; color: #fff; letter-spacing: 0.2px; }

  /* Global notes */
  .global-notes { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
  .global-notes strong { font-size: 11px; color: #92400e; display: block; margin-bottom: 3px; }
  .global-notes p { font-size: 10.5px; color: #78350f; line-height: 1.4; }

  /* Footer */
  .footer { margin-top: 20px; padding-top: 10px; border-top: 2px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94A3B8; }
  .footer .brand { color: #FACC15; font-weight: 700; font-size: 10px; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <img src="${logoUri}" alt="TermProtect" />
  <div class="header-right">
    <div class="date">${dateStr}</div>
    <div>Informe de Medicion</div>
    <div class="ref">${windows.length} ventana${windows.length !== 1 ? "s" : ""}</div>
  </div>
</div>

<!-- Client -->
<div class="client">
  <div class="client-main">
    ${client.businessName ? `<div class="biz">${client.businessName} ${hubspotHtml}</div>` : ""}
    <h2>${client.name}</h2>
    <div class="client-grid" style="margin-top:8px;">
      <div><span class="cl">Direccion</span><br/><span class="cv">${client.address || "—"}</span></div>
      <div><span class="cl">Telefono</span><br/><span class="cv">${client.phone || "—"}</span></div>
      ${medidor ? `<div><span class="cl">Medidor</span><br/><span class="cv">${medidor.name}</span></div>` : ""}
      ${comercial ? `<div><span class="cl">Comercial</span><br/><span class="cv">${comercial.nombre}</span></div>` : ""}
    </div>
  </div>
  <div class="client-meta">
    <div class="cm-label">Ventanas</div>
    <div class="cm-val">${windows.length}</div>
    ${routeDateStr ? `<div class="cm-sub">${routeDateStr}</div>` : ""}
  </div>
</div>

${approvalHtml}

<!-- Windows -->
${windowsHtml}

${serviciosHtml}

${globalNotasHtml}

<!-- Footer -->
<div class="footer">
  <span><span class="brand">TERMPROTECT</span> — Sistemas de Ventanas y Puertas</span>
  <span>Generado: ${new Date().toLocaleString("es-ES")}</span>
</div>

</body>
</html>`;

  const printWindow = window.open("", "", "height=800,width=900");
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}
