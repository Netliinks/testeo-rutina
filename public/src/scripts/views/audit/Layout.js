export const tableLayout = `
  <style>
    .audit-card { background:var(--surface, #fff); border-radius:20px; padding:30px; width:100%; max-width:580px; box-shadow:var(--shadow-lg, 0 16px 38px rgba(25, 35, 70, .12)); margin:0 auto; font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:var(--text-primary, #17233f); }
    .audit-title-section { margin-bottom:25px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
    .audit-title-section h2 { font-size:24px; font-weight:700; margin:0 0 6px; color:var(--text-primary, #17233f); }
    .audit-title-section p { font-size:13.5px; color:var(--text-muted, #74809a); margin:0; }
    .import-btn { flex:none; display:flex; align-items:center; gap:7px; border:1px solid #49ad48; background:#57bd55; color:#fff; border-radius:10px; padding:10px 13px; font-size:13px; font-weight:600; cursor:pointer; }
    .import-btn:hover { background:#49ad48; }
    .import-btn i { color:#fff !important; }
    .step-container { margin-bottom:25px; }
    .step-title { display:block; font-size:11px; font-weight:700; letter-spacing:.8px; text-transform:uppercase; color:var(--text-muted, #74809a); margin-bottom:12px; }
    .report-card { border:1px solid var(--primary, #5a77e8); border-radius:12px; padding:18px; background:var(--primary-tint, #f1f4ff); }
    .card-header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .card-badge { font-size:9.5px; font-weight:800; padding:2.5px 7px; border-radius:4px; color:#fff; text-transform:uppercase; letter-spacing:.5px; background:#10B981; }
    .card-check-icon, .card-check-icon i { font-size:16px; color:#5a77e8 !important; }
    .report-card h3 { font-size:14.5px; font-weight:700; margin:0 0 6px; color:var(--text-primary, #17233f); }
    .report-card p { font-size:11.5px; line-height:1.4; color:var(--text-muted, #74809a); margin:0; }
    .audit-card .material_input_select, .audit-card .material_input { margin:0; max-width:none; }
    .audit-card .material_input_select input, .audit-card .material_input input { background:var(--surface-input, #fff); }
    .audit-customer { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:12px; align-items:center; }
    .audit-select-btn { border:1px solid var(--border, #dce3f0); color:var(--primary, #5a77e8); background:var(--surface, #fff); border-radius:10px; padding:10px 12px; cursor:pointer; }
    .audit-select-btn i { color:#5a77e8 !important; }
    .audit-select-btn:disabled, .scope_disabled { opacity:.52; cursor:not-allowed; }
    .audit-select-btn:disabled { pointer-events:none; }
    .input_checkbox { margin-top:12px; font-size:13px; color:var(--text-secondary, #53627c); }
    .date-row { display:flex; gap:15px; }
    .date-time-group { flex:1; display:flex; flex-direction:column; gap:6px; }
    .date-time-group > label { font-size:12px; font-weight:500; color:var(--text-muted, #74809a); }
    .date-time-inputs { display:grid; grid-template-columns:minmax(116px, 1fr) 132px; gap:8px; }
    .date-time-inputs input { border:1px solid var(--border, #dce3f0); border-radius:10px; padding:10px 12px; font-size:13.5px; color:var(--text-primary, #17233f); background:var(--surface-input, #fff); outline:none; box-sizing:border-box; width:100%; }
    .summary-text { font-size:12.5px; font-weight:600; color:var(--text-secondary, #53627c); margin:25px 0 15px; display:flex; align-items:center; gap:5px; }
    .download-btn { width:100%; border:none; background:var(--primary, #5a77e8); color:#fff; font-size:14px; font-weight:600; padding:14px 0; border-radius:12px; cursor:pointer; display:flex; justify-content:center; align-items:center; gap:8px; box-shadow:var(--shadow-sm, 0 4px 10px rgba(72, 96, 188, .2)); }
    .download-btn i { color:#fff !important; }
    .download-btn:hover { background:var(--primary-hover, #4866d8); transform:translateY(-1px); }
    @media(max-width:700px) { .date-row { display:grid; grid-template-columns:1fr; } }
    @media(max-width:640px) { .audit-card { width:auto; margin:16px; padding:22px; } .audit-customer { display:grid; grid-template-columns:1fr; } }
  </style>
  <div class="datatable" id="datatable">
    <div style="justify-content:center;align-items:center;display:flex;min-height:550px;padding:20px 0;">
      <section class="audit-card" aria-label="Reportes estadísticos">
        <div class="audit-title-section"><div><h2>Reportes estadísticos</h2><p>Genera reportes de cumplimiento de la operación de NetGuard.</p></div><button class="import-btn" id="import-entities" type="button"><i class="fa-solid fa-file-import"></i> Importar</button></div>
        <div class="step-container"><span class="step-title">1 · Tipo de reporte</span><div class="material_input_select"><input type="text" id="entity-theme" class="input_select" readonly placeholder="Cargando..." autocomplete="off"><div id="input-options" class="input_options"></div></div></div>
        <div class="step-container"><span class="step-title">2 · Formato del documento</span><div class="report-card selected"><div class="card-header-row"><span class="card-badge">XLSX</span><span class="card-check-icon"><i class="fa-solid fa-circle-check"></i></span></div><h3 id="stats-report-title">Reporte estadístico</h3><p id="stats-report-description">Cumplimiento individual por usuario con sus métricas del período seleccionado.</p></div></div>
        <div class="step-container" id="stats-scope-step"><span class="step-title">3 · Alcance</span><div class="audit-customer" id="div-customer"><div class="material_input"><input type="text" id="entity-customer" autocomplete="off" disabled><label for="entity-customer"><i class="fa-solid fa-building"></i> Seleccionar cliente</label></div><button class="audit-select-btn" type="button" id="btn-select-element" title="Seleccionar cliente"><i class="fa-solid fa-arrow-up-right-from-square"></i></button></div><div id="stats-allcustomer"><div class="input_checkbox"><label><input type="checkbox" class="checkbox" id="entity-allcustomer"> Todas las empresas activas</label></div></div></div>
        <div class="step-container"><span class="step-title" id="stats-date-step-title">4 · Rango de fecha y hora</span><div class="date-row"><div class="date-time-group"><label for="start-date">Desde</label><div class="date-time-inputs"><input type="date" class="input_date-start" id="start-date" name="start-date"><input type="time" id="start-time" name="start-time" step="1" aria-label="Hora inicial"></div></div><div class="date-time-group"><label for="end-date">Hasta</label><div class="date-time-inputs"><input type="date" class="input_date-end" id="end-date" name="end-date"><input type="time" id="end-time" name="end-time" step="1" aria-label="Hora final"></div></div></div></div>
        <div class="summary-text" id="stats-summary">Reporte estadístico · Excel · --/--/---- — --/--/----</div>
        <button class="download-btn" id="calculate-entity"><i class="fa-solid fa-download"></i><span id="btn-text">Descargar reporte Excel</span></button>
      </section>
    </div>
  </div>`;

export const UIContact = `<div class="dialog_content" id="dialog-content"><div class="dialog"><div class="dialog_container padding_8"><div class="dialog_header"><h2>Actualizar Contacto</h2></div><div class="dialog_message padding_8"><div class="material_input"><input type="text" id="entity-contact-name" class="input_filled"><label for="entity-contact-name">Nombre Contacto</label></div><div class="material_input"><input type="text" id="entity-contact-phone" class="input_filled" maxlength="10"><label for="entity-contact-phone">Teléfono Contacto</label></div></div><div class="dialog_footer"><button class="btn btn_primary" id="cancel">Cancelar</button><button class="btn btn_danger" id="update-contact">Actualizar</button></div></div></div></div>`;

export const UIProgress = `<div class="dialog_content" id="dialog-progress"><div class="dialog"><div class="dialog_container padding_8"><div class="dialog_header"><h2 id="progress-title">Procesando...</h2></div><div class="dialog_message padding_8"><div id="progress-container" style="width:100%;background:#eee;border-radius:5px;overflow:hidden;"><div id="progress-bar" style="width:0%;height:20px;background:#007bff;transition:width .3s;"></div></div><p id="progress-text" style="text-align:center;margin-top:10px;">0%</p><div id="error-container" style="display:none;color:red;margin-top:10px;border:1px solid red;padding:10px;border-radius:5px;max-height:150px;overflow-y:scroll;white-space:pre-wrap;font-family:monospace;font-size:12px;scrollbar-width:thin;scrollbar-color:#f87171 transparent;"><strong>Detalles:</strong><br><span id="error-message" style="font-weight:bold;"></span><br><span id="error-cause"></span></div></div><div class="dialog_footer" id="progress-footer" style="display:none;"><button class="btn btn_primary" id="close-progress">Cerrar</button></div></div></div></div>`;
