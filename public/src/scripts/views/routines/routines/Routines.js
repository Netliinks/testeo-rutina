// @filename: Routines.ts
import { registerEntity, getUserInfo, getEntityData, updateEntity, getFilterEntityData, getFilterEntityCount, deleteEntity, getFile, sendMail2, generateRoutineTimes } from "../../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, getDetails, getDetails2, generateFileSimpleXls, generateRoutineReportXlsx, sleep, equivalentTime } from "../../../tools.js";
import { Config } from "../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
import { Locations } from "../routines/locations/Locations.js";
import { RoutineUsers } from "../routines/users/Users.js";
import { exportRoutinePdf, exportRoutinePdf2 } from "../../../exportFiles/extraRoutine.js";

const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let infoPage = {
  count: 0,
  offset: Config.offset,
  currentPage: currentPage,
  search: ""
};

const currentBusiness = async () => {
  const currentUser = await getUserInfo();
  const userid = await getEntityData('User', `${currentUser.attributes.id}`);
  return userid;
};

const getRoutines = async () => {
  let raw = JSON.stringify({
    "filter": {
      "conditions": [
        {
          "property": "customer.id",
          "operator": "=",
          "value": `${customerId}`
        }
      ],
    },
    sort: "-createdDate",
    limit: Config.tableRows,
    offset: infoPage.offset,
    fetchPlan: 'full',
  });
  if (infoPage.search != "") {
    raw = JSON.stringify({
      "filter": {
        "conditions": [
          {
            "group": "OR",
            "conditions": [
              {
                "property": "name",
                "operator": "contains",
                "value": `${infoPage.search.toLowerCase()}`
              }
            ]
          },
          {
            "property": "customer.id",
            "operator": "=",
            "value": `${customerId}`
          }
        ]
      },
      sort: "-createdDate",
      limit: Config.tableRows,
      offset: infoPage.offset,
      fetchPlan: 'full',
    });
  }
  infoPage.count = await getFilterEntityCount("Routine", raw);
  return await getFilterEntityData("Routine", raw);
};

const formatDayPills = (weekDayStr) => {
  const daysMap = [
    { label: 'L', key: 'LUNES' },
    { label: 'M', key: 'MARTES' },
    { label: 'X', key: 'MIERCOLES' },
    { label: 'J', key: 'JUEVES' },
    { label: 'V', key: 'VIERNES' },
    { label: 'S', key: 'SABADO' },
    { label: 'D', key: 'DOMINGO' }
  ];
  const activeDays = weekDayStr ? weekDayStr.toUpperCase() : 'LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO';
  return `<div style="display:inline-flex; gap:4px; align-items:center;">
    ${daysMap.map(d => {
      const isActive = activeDays.includes(d.key);
      return `<span class="ng-day-pill ${isActive ? 'active' : 'inactive'}">${d.label}</span>`;
    }).join('')}
  </div>`;
};

export class Routines {
  constructor() {
    this.dialogContainer = document.getElementById('app-dialogs');
    this.entityDialogContainer = document.getElementById('entity-editor-container');
    this.content = document.getElementById('datatable-container');

    this.searchEntity = async (tableBody) => {
      const search = document.getElementById('search');
      const btnSearch = document.getElementById('btnSearch');
      if (search) {
        search.value = infoPage.search;
        btnSearch?.addEventListener('click', async () => {
          new Routines().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
        });
      }
    };
  }

  async render(offset, actualPage, search) {
    infoPage.offset = offset;
    infoPage.currentPage = actualPage;
    infoPage.search = search;
    this.content.innerHTML = '';
    this.content.innerHTML = tableLayout;
    const tableBody = document.getElementById('datatable-body');
    tableBody.innerHTML = '.Cargando...';
    let data = await getRoutines();
    tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
    this.load(tableBody, currentPage, data);
    this.searchEntity(tableBody);
    new filterDataByHeaderType().filter();
    this.pagination(data, tableRows, infoPage.currentPage);

    // Bind New Routine wizard button
    const btnNewRoutine = document.getElementById('new-entity');
    if (btnNewRoutine) {
      btnNewRoutine.onclick = () => this.renderWizard();
    }
  }

  load(table, currentPage, data) {
    table.innerHTML = '';
    currentPage--;
    let start = tableRows * currentPage;
    let end = start + tableRows;
    let paginatedItems = data.slice(start, end);
    if (data.length === 0) {
      let mensaje = 'No existen datos';
      if (customerId == null) { mensaje = 'Seleccione una empresa'; }
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>${mensaje}</td>
        <td></td>
        <td></td>
      `;
      table.appendChild(row);
    } else {
      for (let i = 0; i < paginatedItems.length; i++) {
        let routine = paginatedItems[i];
        let row = document.createElement('tr');
        const activeBadge = routine?.isActive
          ? `<span class="ng-badge ng-badge-ok"><i class="fa-solid fa-circle" style="font-size:6px; margin-right:4px;"></i> ACTIVO</span>`
          : `<span class="ng-badge ng-badge-bad"><i class="fa-solid fa-circle" style="font-size:6px; margin-right:4px;"></i> INACTIVO</span>`;

        const locationBadge = routine?.checkLocation
          ? `<span class="ng-badge ng-badge-info"><i class="fa-solid fa-location-crosshairs" style="margin-right:4px;"></i> VÁLIDA UBICACIÓN</span>`
          : `<span class="ng-badge ng-badge-neu">SIN VALIDAR</span>`;

        row.innerHTML = `
          <td>
            <strong style="color:var(--ng-primary); font-size:14px;">${routine?.name ?? ''}</strong>
            <br>
            <small style="font-family:monospace; color:#64748b; font-size:11px;">ID: ${routine?.id ?? ''}</small>
          </td>
          <td>${activeBadge}</td>
          <td>${locationBadge}</td>
          <td class="entity_options">
              <button class="ng-btn ng-btn-secondary" id="detail-entity" data-entityId="${routine.id}" title="Ver detalle unificado">
                <i class="fa-solid fa-eye"></i> Ver detalle
              </button>

              <button class="button" id="edit-entity" data-entityId="${routine.id}" title="Editar rutina">
                <i class="fa-solid fa-pen"></i>
              </button>

              <button class="button" id="export2-entity" data-entityId="${routine.id}" title="Exportar reportes">
                <i class="fa-solid fa-file-export"></i>
              </button>
          </td>
        `;
        table.appendChild(row);
      }
    }
    this.bindDetailEvents();
    this.register();
    this.ex();
    this.export2();
    this.edit(this.entityDialogContainer, data);
  }

  bindDetailEvents() {
    const detailBtns = document.querySelectorAll('#detail-entity');
    detailBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const entityId = btn.dataset.entityid;
        this.renderDetail(entityId, 0, 0);
      });
    });
  }

  pagination(items, limitRows, currentPage) {
    const paginationWrapper = document.getElementById('pagination-container');
    if (!paginationWrapper) return;
    paginationWrapper.innerHTML = '';
    let pageCount = Math.ceil(infoPage.count / limitRows);
    let button;
    if (pageCount <= Config.maxLimitPage) {
      for (let i = 1; i < pageCount + 1; i++) {
        button = setupButtons(i);
        paginationWrapper.appendChild(button);
      }
      fillBtnPagination(currentPage, Config.colorPagination);
    } else {
      pagesOptions(items, currentPage);
    }

    function setupButtons(page) {
      const button = document.createElement('button');
      button.classList.add('pagination_button');
      button.setAttribute("name", "pagination-button");
      button.setAttribute("id", "btnPag" + page);
      button.innerText = page;
      button.addEventListener('click', () => {
        infoPage.offset = Config.tableRows * (page - 1);
        currentPage = page;
        new Routines().render(infoPage.offset, currentPage, infoPage.search);
      });
      return button;
    }

    function pagesOptions(items, currentPage) {
      paginationWrapper.innerHTML = '';
      let pages = pageNumbers(items, Config.maxLimitPage, currentPage);
      const prevButton = document.createElement('button');
      prevButton.classList.add('pagination_button');
      prevButton.innerText = "<<";
      paginationWrapper.appendChild(prevButton);
      const nextButton = document.createElement('button');
      nextButton.classList.add('pagination_button');
      nextButton.innerText = ">>";
      for (let i = 0; i < pages.length; i++) {
        if (pages[i] > 0 && pages[i] <= pageCount) {
          button = setupButtons(pages[i]);
          paginationWrapper.appendChild(button);
        }
      }
      paginationWrapper.appendChild(nextButton);
      fillBtnPagination(currentPage, Config.colorPagination);
      setupButtonsEvents(prevButton, nextButton);
    }

    function setupButtonsEvents(prevButton, nextButton) {
      prevButton.addEventListener('click', () => {
        new Routines().render(Config.offset, Config.currentPage, infoPage.search);
      });
      nextButton.addEventListener('click', () => {
        infoPage.offset = Config.tableRows * (pageCount - 1);
        new Routines().render(infoPage.offset, pageCount, infoPage.search);
      });
    }
  }

  // =========================================================================
  // VISTA DE DETALLE UNIFICADA (NTL-155) CON PAGINACIÓN EN HORARIOS Y GUARDIAS
  // =========================================================================
  async renderDetail(routineId, scheduleOffset = 0, guardOffset = 0) {
    this.content.innerHTML = `<div class="ng-container" style="text-align:center; padding:40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--ng-primary);"></i><p style="margin-top:12px; font-weight:600;">Cargando detalle de rutina...</p></div>`;

    const limitSchedules = 5;
    const limitGuards = 5;

    let routine;
    let schedules = [];
    let totalSchedules = 0;
    let guards = [];
    let totalGuards = 0;

    try {
      routine = await getEntityData("Routine", routineId);

      // Raw for RoutineSchedules Count & Data
      const rawSchedulesBase = {
        "filter": {
          "conditions": [
            { "property": "customer.id", "operator": "=", "value": `${customerId}` },
            { "property": "routine.id", "operator": "=", "value": `${routineId}` }
          ]
        }
      };

      totalSchedules = await getFilterEntityCount("RoutineSchedule", JSON.stringify(rawSchedulesBase)) || 0;

      const rawSchedulesPaginated = JSON.stringify({
        ...rawSchedulesBase,
        sort: "-createdDate",
        limit: limitSchedules,
        offset: scheduleOffset,
        fetchPlan: 'full'
      });
      schedules = await getFilterEntityData("RoutineSchedule", rawSchedulesPaginated) || [];

      // Raw for RoutineUsers Count & Data
      const rawUsersBase = {
        "filter": {
          "conditions": [
            { "property": "customer.id", "operator": "=", "value": `${customerId}` },
            { "property": "routine.id", "operator": "=", "value": `${routineId}` }
          ]
        }
      };

      totalGuards = await getFilterEntityCount("RoutineUser", JSON.stringify(rawUsersBase)) || 0;

      const rawUsersPaginated = JSON.stringify({
        ...rawUsersBase,
        sort: "-createdDate",
        limit: limitGuards,
        offset: guardOffset,
        fetchPlan: 'full'
      });
      guards = await getFilterEntityData("RoutineUser", rawUsersPaginated) || [];

    } catch (err) {
      console.error("Error al cargar detalle de rutina:", err);
      alert("No se pudieron obtener los datos completos de la rutina.");
      return this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
    }

    const activeBadge = routine?.isActive
      ? `<span class="ng-badge ng-badge-ok"><i class="fa-solid fa-circle" style="font-size:6px; margin-right:4px;"></i> ACTIVO</span>`
      : `<span class="ng-badge ng-badge-bad"><i class="fa-solid fa-circle" style="font-size:6px; margin-right:4px;"></i> INACTIVO</span>`;

    const locationBadge = routine?.checkLocation
      ? `<span class="ng-badge ng-badge-info"><i class="fa-solid fa-location-crosshairs" style="margin-right:4px;"></i> VÁLIDA UBICACIÓN</span>`
      : `<span class="ng-badge ng-badge-neu">SIN VALIDAR</span>`;

    let schedulesHtml = '';
    if (schedules.length === 0) {
      schedulesHtml = `<div style="padding:16px; color:#64748b; font-style:italic;">No hay ubicaciones o horarios registrados para esta rutina.</div>`;
    } else {
      schedules.forEach((sch, idx) => {
        const midnight = sch.scheduleTimeEnd < sch.scheduleTime;
        const midnightBadge = midnight
          ? `<span class="ng-badge ng-badge-warn"><i class="fa-solid fa-moon" style="margin-right:4px;"></i> CRUZA MEDIANOCHE</span>`
          : '';

        schedulesHtml += `
          <div style="background:var(--ng-surface-2); border:1px solid var(--ng-border); border-radius:10px; padding:16px; margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
              <div>
                <strong style="color:var(--ng-primary); font-size:15px; text-transform:uppercase;">UBICACIÓN ${scheduleOffset + idx + 1} · ${sch.name}</strong>
                <div style="display:flex; align-items:center; gap:12px; margin-top:4px; flex-wrap:wrap;">
                  <span style="font-family:monospace; font-size:18px; font-weight:700; color:#1e293b;">
                    <i class="fa-solid fa-clock" style="color:var(--ng-accent); margin-right:4px;"></i>
                    ${sch.scheduleTime || '00:00'} - ${sch.scheduleTimeEnd || '00:00'}
                  </span>
                  ${formatDayPills(sch.weekDay)}
                </div>
              </div>

              <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                <span class="ng-badge ng-badge-info">CADA ${sch.frequency || 0} MIN</span>
                <span class="ng-badge ng-badge-info">${sch.distance || 0} METROS</span>
                ${midnightBadge}
              </div>
            </div>

            <table class="ng-table" style="background:#ffffff; border-radius:8px; overflow:hidden;">
              <thead>
                <tr>
                  <th>UBICACIÓN / NOMBRE</th>
                  <th>COORDENADAS [LAT, LONG]</th>
                  <th>FRECUENCIA / DISTANCIA</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${sch.name}</strong>
                    <br><small style="font-family:monospace; color:#64748b;">ID: ${sch.id}</small>
                  </td>
                  <td><span style="font-family:monospace; font-size:12px;">${sch.cords || `${sch.latitude || 0}, ${sch.longitude || 0}`}</span></td>
                  <td>Cada ${sch.frequency || 0} min · ${sch.distance || 0} m</td>
                  <td>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <button class="ng-btn ng-btn-secondary view-qr-btn" data-schid="${sch.id}" data-schname="${sch.name}" title="Ver Código QR">
                        <i class="fa-solid fa-qrcode" style="color:var(--ng-accent);"></i> QR
                      </button>
                      <button class="ng-btn-icon edit-sch-btn" data-schidx="${idx}" title="Editar Ubicación/Horario">
                        <i class="fa-solid fa-pen" style="color:var(--ng-accent);"></i>
                      </button>
                      <button class="ng-btn-icon view-sch-btn" data-schid="${sch.id}" title="Ver Tiempos">
                        <i class="fa-solid fa-eye" style="color:var(--ng-accent);"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
      });

      // Schedules Pagination Controls
      const totalSchedulePages = Math.ceil(totalSchedules / limitSchedules) || 1;
      const currentSchedulePage = Math.floor(scheduleOffset / limitSchedules) + 1;
      schedulesHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid var(--ng-border);">
          <span style="font-size:12px; color:var(--ng-text-muted);">
            Página ${currentSchedulePage} de ${totalSchedulePages} (${totalSchedules} ubicaciones)
          </span>
          <div style="display:flex; gap:6px;">
            <button class="ng-btn ng-btn-secondary" id="prev-sch-page-btn" ${scheduleOffset <= 0 ? 'disabled style="opacity:0.5;"' : ''}>
              <i class="fa-solid fa-chevron-left"></i> Anterior
            </button>
            <button class="ng-btn ng-btn-secondary" id="next-sch-page-btn" ${scheduleOffset + limitSchedules >= totalSchedules ? 'disabled style="opacity:0.5;"' : ''}>
              Siguiente <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      `;
    }

    let guardsHtml = '';
    if (guards.length === 0) {
      guardsHtml = `<div style="padding:16px; color:#64748b; font-style:italic; font-size:13px;">No hay guardias asignados a esta rutina.</div>`;
    } else {
      guardsHtml = `<div style="display:flex; flex-direction:column;">`;
      guards.forEach((g, idx) => {
        const firstName = g.user?.firstName || '';
        const lastName = g.user?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Guardia';
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'GU';
        const subtext = g.user?.dni || (g.user?.username ? `${g.user.username}` : '');
        const isLast = idx === guards.length - 1;

        guardsHtml += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 0; ${isLast ? '' : 'border-bottom:1px solid var(--ng-border);'}">
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="ng-avatar" style="width:38px; height:38px; font-size:13px; background:#F1F5F9; color:var(--ng-primary); border:1px solid var(--ng-border); font-weight:700;">
                ${initials}
              </div>
              <div>
                <strong style="display:block; color:var(--ng-primary); font-size:13.5px; font-weight:700;">${fullName}</strong>
                <small style="color:var(--ng-text-muted); font-size:11.5px;">${subtext}</small>
              </div>
            </div>
            <button class="ng-btn-icon remove-guard-btn" data-guardid="${g.id}" title="Quitar guardia">
              <i class="fa-solid fa-trash" style="color:#dc2626;"></i>
            </button>
          </div>
        `;
      });
      guardsHtml += `</div>`;

      // Guards Pagination Controls
      const totalGuardPages = Math.ceil(totalGuards / limitGuards) || 1;
      const currentGuardPage = Math.floor(guardOffset / limitGuards) + 1;
      guardsHtml += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid var(--ng-border);">
          <span style="font-size:11px; color:var(--ng-text-muted);">
            Pág. ${currentGuardPage}/${totalGuardPages} (${totalGuards})
          </span>
          <div style="display:flex; gap:6px;">
            <button class="ng-btn ng-btn-secondary" id="prev-guard-page-btn" style="padding:4px 8px;" ${guardOffset <= 0 ? 'disabled style="opacity:0.5;"' : ''}>
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="ng-btn ng-btn-secondary" id="next-guard-page-btn" style="padding:4px 8px;" ${guardOffset + limitGuards >= totalGuards ? 'disabled style="opacity:0.5;"' : ''}>
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      `;
    }

    this.content.innerHTML = `
      <div class="ng-container">
        <!-- HEADER TOP -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="ng-btn ng-btn-secondary" id="back-to-list-btn">
              <i class="fa-solid fa-arrow-left"></i> Volver a lista
            </button>
            <div>
              <h1 style="font-size:1.5rem; font-weight:800; color:var(--ng-primary); margin:0; display:flex; align-items:center; gap:10px;">
                ${routine.name}
              </h1>
              <small style="font-family:monospace; color:var(--ng-text-muted);">ID: ${routine.id}</small>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            ${activeBadge}
            ${locationBadge}
            <button class="ng-btn ng-btn-secondary" id="detail-edit-routine-btn">
              <i class="fa-solid fa-pen"></i> Editar Datos
            </button>
          </div>
        </div>

        <!-- LAYOUT DE 2 COLUMNAS (IZQ: UBICACIONES / HORARIOS, DER: GUARDIAS ASIGNADOS) -->
        <div class="ng-detail-grid">
          <!-- COLUMNA IZQUIERDA: HORARIOS Y UBICACIONES -->
          <div>
            <div class="ng-card">
              <div class="ng-card-header">
                <h2 class="ng-card-title">
                  <i class="fa-solid fa-layer-group" style="color:var(--ng-accent);"></i>
                  Horarios y Ubicaciones (${totalSchedules})
                </h2>
                <button class="ng-btn ng-btn-primary" id="detail-add-location-btn">
                  <i class="fa-solid fa-plus"></i> Agregar Ubicación
                </button>
              </div>
              ${schedulesHtml}
            </div>
          </div>

          <!-- COLUMNA DERECHA: GUARDIAS ASIGNADOS -->
          <div>
            <div class="ng-card">
              <div class="ng-card-header">
                <h2 class="ng-card-title" style="font-size:12px; text-transform:uppercase; letter-spacing:0.04em;">
                  <i class="fa-solid fa-user-shield" style="color:var(--ng-accent);"></i>
                  Guardias Asignados (${totalGuards})
                </h2>
                <button class="ng-btn ng-btn-primary" id="detail-add-guard-btn" style="padding:6px 10px; font-size:12px;">
                  <i class="fa-solid fa-user-plus"></i> Asignar
                </button>
              </div>
              ${guardsHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    // Event Listeners for Detail View
    document.getElementById('back-to-list-btn')?.addEventListener('click', () => {
      this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
    });

    document.getElementById('detail-edit-routine-btn')?.addEventListener('click', () => {
      this.RInterface('Routine', routineId, 'detail');
    });

    // Schedules Pagination Events
    document.getElementById('prev-sch-page-btn')?.addEventListener('click', () => {
      if (scheduleOffset > 0) {
        this.renderDetail(routineId, scheduleOffset - limitSchedules, guardOffset);
      }
    });

    document.getElementById('next-sch-page-btn')?.addEventListener('click', () => {
      if (scheduleOffset + limitSchedules < totalSchedules) {
        this.renderDetail(routineId, scheduleOffset + limitSchedules, guardOffset);
      }
    });

    // Guards Pagination Events
    document.getElementById('prev-guard-page-btn')?.addEventListener('click', () => {
      if (guardOffset > 0) {
        this.renderDetail(routineId, scheduleOffset, guardOffset - limitGuards);
      }
    });

    document.getElementById('next-guard-page-btn')?.addEventListener('click', () => {
      if (guardOffset + limitGuards < totalGuards) {
        this.renderDetail(routineId, scheduleOffset, guardOffset + limitGuards);
      }
    });

    // Add Location directly on detail page
    document.getElementById('detail-add-location-btn')?.addEventListener('click', () => {
      this.openAddScheduleModalDirect(routineId, scheduleOffset, guardOffset);
    });

    // Edit Location directly on detail page
    document.querySelectorAll('.edit-sch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const schIdx = parseInt(btn.dataset.schidx);
        const schItem = schedules[schIdx];
        if (schItem) {
          this.openEditScheduleModalDirect(schItem, routineId, scheduleOffset, guardOffset);
        }
      });
    });

    // View times
    document.querySelectorAll('.view-sch-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const schId = btn.dataset.schid;
        this.openViewScheduleModalDirect(0, schId);
      });
    });

    // Assign Guard directly on detail page
    document.getElementById('detail-add-guard-btn')?.addEventListener('click', () => {
      this.openSelectGuardsModalDirect(routineId, scheduleOffset, guardOffset);
    });

    // Remove Guard Event directly on detail page
    document.querySelectorAll('.remove-guard-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const guardBtn = e.currentTarget;
        const guardId = guardBtn.dataset.guardid;
        if (confirm("¿Desea eliminar esta asignación de guardia?")) {
          guardBtn.setAttribute('disabled', 'true');
          guardBtn.classList.add('ng-btn-disabled');
          try {
            await deleteEntity('RoutineUser', guardId);
            this.renderDetail(routineId, scheduleOffset, guardOffset);
          } catch (e) {
            alert("Error al eliminar la asignación del guardia.");
            guardBtn.removeAttribute('disabled');
            guardBtn.classList.remove('ng-btn-disabled');
          }
        }
      });
    });

    // View QR Modal Event
    document.querySelectorAll('.view-qr-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const schId = btn.dataset.schid;
        const schName = btn.dataset.schname;
        this.openQRModal(schId, schName);
      });
    });
  }

  async openAddScheduleModalDirect(routineId, scheduleOffset = 0, guardOffset = 0) {
    this.openAddScheduleModal(async (newSch, resetModalBtn) => {
      try {
        const businessData = await currentBusiness();
        const dt = currentDateTime();
        const rawSch = JSON.stringify({
          "name": newSch.name.toUpperCase(),
          "cords": newSch.cords,
          "latitude": newSch.latitude,
          "longitude": newSch.longitude,
          "frequency": `${newSch.frequency}`,
          "distance": `${newSch.distance}`,
          "business": { "id": `${businessData.business.id}` },
          "customer": { "id": `${customerId}` },
          "routine": { "id": `${routineId}` },
          "scheduleTime": newSch.scheduleTime,
          "scheduleTimeEnd": newSch.scheduleTimeEnd,
          "creationDate": `${dt.date}`,
          "creationTime": `${dt.timeHHMMSS}`
        });
        const saved = await registerEntity(rawSch, 'RoutineSchedule');
        if (saved && saved.id) {
          await generateRoutineTimes(saved.id);
        }
        new CloseDialog().x(document.getElementById('dialog-content'));
        this.renderDetail(routineId, scheduleOffset, guardOffset);
      } catch (err) {
        console.error("Error al agregar la ubicación/horario:", err);
        alert("Error al agregar la ubicación/horario.");
        if (typeof resetModalBtn === 'function') resetModalBtn();
      }
    });
  }

  async openEditScheduleModalDirect(sch, routineId, scheduleOffset = 0, guardOffset = 0) {
    this.dialogContainer.style.display = 'flex';
    this.dialogContainer.innerHTML = `
      <div class="dialog_content" id="dialog-content">
        <div class="ng-modal-card" style="max-width:520px; width:90%;">
          <div class="ng-modal-header">
            <h2 class="ng-modal-title"><i class="fa-solid fa-pen-to-square" style="color:var(--ng-accent);"></i> Editar Ubicación / Horario</h2>
            <button class="ng-btn-icon" id="cancel-sch-modal-x"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="ng-form-group">
            <label class="ng-label" for="sch-modal-name">Nombre de Ubicación</label>
            <input type="text" class="ng-input" id="sch-modal-name" value="${sch.name || ''}" autocomplete="off">
          </div>

          <div class="ng-form-group">
            <label class="ng-label" for="sch-modal-cords">Coordenadas [Lat, Long]</label>
            <input type="text" class="ng-input" id="sch-modal-cords" value="${sch.cords || `${sch.latitude || 0}, ${sch.longitude || 0}`}" autocomplete="off">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-start">Hora Inicio</label>
              <input type="time" class="ng-input" id="sch-modal-start" value="${sch.scheduleTime || '19:00'}">
            </div>
            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-end">Hora Fin</label>
              <input type="time" class="ng-input" id="sch-modal-end" value="${sch.scheduleTimeEnd || '07:00'}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-freq">Frecuencia (minutos)</label>
              <select class="ng-select" id="sch-modal-freq">
                <option value="10" ${`${sch.frequency}` === '10' ? 'selected' : ''}>10 min</option>
                <option value="15" ${`${sch.frequency}` === '15' ? 'selected' : ''}>15 min</option>
                <option value="30" ${`${sch.frequency}` === '30' ? 'selected' : ''}>30 min</option>
                <option value="60" ${`${sch.frequency}` === '60' ? 'selected' : ''}>60 min</option>
                <option value="120" ${`${sch.frequency}` === '120' ? 'selected' : ''}>120 min</option>
                <option value="180" ${`${sch.frequency}` === '180' ? 'selected' : ''}>180 min</option>
                <option value="240" ${`${sch.frequency}` === '240' ? 'selected' : ''}>240 min</option>
              </select>
            </div>

            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-dist">Distancia Radio (metros)</label>
              <select class="ng-select" id="sch-modal-dist">
                <option value="5" ${`${sch.distance}` === '5' ? 'selected' : ''}>5 m</option>
                <option value="10" ${`${sch.distance}` === '10' ? 'selected' : ''}>10 m</option>
                <option value="20" ${`${sch.distance}` === '20' ? 'selected' : ''}>20 m</option>
                <option value="30" ${`${sch.distance}` === '30' ? 'selected' : ''}>30 m</option>
                <option value="50" ${`${sch.distance}` === '50' ? 'selected' : ''}>50 m</option>
                <option value="60" ${`${sch.distance}` === '60' ? 'selected' : ''}>60 m</option>
              </select>
            </div>
          </div>

          <div class="ng-modal-footer">
            <button class="ng-btn ng-btn-secondary" id="cancel-sch-modal">Cancelar</button>
            <button class="ng-btn ng-btn-primary" id="save-sch-modal"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('cancel-sch-modal-x')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('cancel-sch-modal')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('save-sch-modal')?.addEventListener('click', async (e) => {
      const updateBtn = e.currentTarget;
      if (updateBtn.disabled) return;
      updateBtn.setAttribute('disabled', 'true');
      updateBtn.classList.add('ng-btn-disabled');
      const originalText = updateBtn.innerHTML;
      updateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Actualizando...`;

      const resetBtn = () => {
        updateBtn.removeAttribute('disabled');
        updateBtn.classList.remove('ng-btn-disabled');
        updateBtn.innerHTML = originalText;
      };

      const name = document.getElementById('sch-modal-name')?.value.trim();
      const cords = document.getElementById('sch-modal-cords')?.value.trim();
      const start = document.getElementById('sch-modal-start')?.value;
      const end = document.getElementById('sch-modal-end')?.value;
      const freq = document.getElementById('sch-modal-freq')?.value;
      const dist = document.getElementById('sch-modal-dist')?.value;

      if (!name) {
        alert("Ingrese el nombre de la ubicación.");
        resetBtn();
        return;
      }

      const timeIni = start.split(':');
      const hourIni = parseInt(timeIni[0].trim());
      const minIni = parseInt(timeIni[1].trim());
      const timeEnd = end.split(':');
      const hourEnd = parseInt(timeEnd[0].trim());
      const minEnd = parseInt(timeEnd[1].trim());

      if (hourIni == hourEnd && minIni > minEnd) {
        alert("Minutos iniciales no pueden ser mayores a las del final en horas iguales.");
        resetBtn();
        return;
      }

      const coordsArr = cords ? cords.split(',') : [sch.latitude || "-2.18679", sch.longitude || "-79.89489"];
      const lat = parseFloat(coordsArr[0]?.trim() || "-2.18679");
      const lng = parseFloat(coordsArr[1]?.trim() || "-79.89489");

      const rawSch = JSON.stringify({
        "name": name.toUpperCase(),
        "cords": `${lat}, ${lng}`,
        "latitude": `${lat}`,
        "longitude": `${lng}`,
        "frequency": `${freq}`,
        "distance": `${dist}`,
        "scheduleTime": start,
        "scheduleTimeEnd": end
      });

      try {
        await updateEntity('RoutineSchedule', sch.id, rawSch);
        await generateRoutineTimes(sch.id);
        new CloseDialog().x(document.getElementById('dialog-content'));
        this.renderDetail(routineId, scheduleOffset, guardOffset);
      } catch (e) {
        console.error("Error al actualizar la ubicación:", e);
        alert("Error al actualizar la ubicación.");
        resetBtn();
      }
    });
  }

  async openViewScheduleModalDirect(offset, schId) {
    const id = schId;
    const dialogContainer = document.getElementById('app-dialogs');
    let raw = JSON.stringify({
      "filter": {
        "conditions": [
          {
            "property": "routineSchedule.id",
            "operator": "=",
            "value": `${id}`
          }
        ],
      },
      sort: "+routineTimePoint",
      limit: Config.modalRows,
      offset: offset
    });
    let dataModal = await getFilterEntityData("RoutineTime", raw);
    dialogContainer.style.display = 'block';
    dialogContainer.innerHTML = `
      <div class="dialog_content" id="dialog-content">
        <div class="dialog">
          <div class="dialog_container padding_8">
            <div class="dialog_header">
              <h2>Tiempos Calculados</h2>
            </div>

            <div class="dialog_message padding_8">
              <div class="dashboard_datatable">
                <table class="datatable_content margin_t_16">
                  <thead>
                    <tr>
                      <th>Tiempo</th>
                    </tr>
                  </thead>
                  <tbody id="datatable-modal-body">
                  </tbody>
                </table>
              </div>
              <br>
            </div>

            <div class="dialog_footer">
              <button class="btn btn_primary" id="prevModal"><i class="fa-solid fa-arrow-left"></i></button>
              <button class="btn btn_primary" id="nextModal"><i class="fa-solid fa-arrow-right"></i></button>
              <button class="btn btn_danger" id="cancel">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    inputObserver();
    const datetableBody = document.getElementById('datatable-modal-body');
    if (!dataModal || dataModal.length === 0) {
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>No hay datos</td>
      `;
      datetableBody.appendChild(row);
    } else {
      for (let i = 0; i < dataModal.length; i++) {
        let time = dataModal[i];
        let row = document.createElement('tr');
        row.innerHTML += `
          <td>${time?.routineTimePoint ?? ''}</td>
        `;
        datetableBody.appendChild(row);
      }
    }
    const _closeButton = document.getElementById('cancel');
    const _dialog = document.getElementById('dialog-content');
    const prevModalButton = document.getElementById('prevModal');
    const nextModalButton = document.getElementById('nextModal');

    _closeButton.onclick = () => {
      new CloseDialog().x(_dialog);
    };
    nextModalButton.onclick = () => {
      offset = Config.modalRows + (offset);
      this.openViewScheduleModalDirect(offset, id);
    };
    prevModalButton.onclick = () => {
      if (offset > 0) {
        offset = offset - Config.modalRows;
        this.openViewScheduleModalDirect(offset, id);
      }
    };
  }

  async openSelectGuardsModalDirect(routineId, scheduleOffset = 0, guardOffset = 0) {
    this.openSelectGuardsModal(async (selectedGuards, resetModalBtn) => {
      if (selectedGuards.length === 0) {
        if (typeof resetModalBtn === 'function') resetModalBtn();
        return;
      }
      try {
        const businessData = await currentBusiness();
        const dt = currentDateTime();

        for (let i = 0; i < selectedGuards.length; i++) {
          const g = selectedGuards[i];
          const existGuard = await getDetails2('routine.id', routineId, 'user.id', g.id, 'RoutineUser');
          if (existGuard.length === 0) {
            const rawGuard = JSON.stringify({
              "business": { "id": `${businessData.business.id}` },
              "customer": { "id": `${customerId}` },
              "routine": { "id": `${routineId}` },
              "user": { "id": `${g.id}` },
              "creationDate": `${dt.date}`,
              "creationTime": `${dt.timeHHMMSS}`
            });
            await registerEntity(rawGuard, 'RoutineUser');
          }
        }
        new CloseDialog().x(document.getElementById('dialog-content'));
        this.renderDetail(routineId, scheduleOffset, guardOffset);
      } catch (err) {
        alert("Error al asignar guardias.");
        if (typeof resetModalBtn === 'function') resetModalBtn();
      }
    });
  }

  openQRModal(schId, schName) {
    this.dialogContainer.style.display = 'flex';
    this.dialogContainer.innerHTML = `
      <div class="dialog_content" id="dialog-content">
        <div class="ng-modal-card" style="max-width:400px; width:90%; text-align:center;">
          <div class="ng-modal-header">
            <h2 class="ng-modal-title"><i class="fa-solid fa-qrcode" style="color:var(--ng-accent);"></i> Código QR</h2>
            <button class="ng-btn-icon" id="close-qr-modal-x"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <p style="color:var(--ng-text-muted); font-size:13px; margin-bottom:16px;">${schName}</p>

          <div style="background:#ffffff; padding:16px; border:1px solid var(--ng-border); border-radius:10px; display:inline-block; margin-bottom:16px;">
            <canvas id="qrcode-canvas" width="200" height="200"></canvas>
          </div>

          <p style="font-family:monospace; font-size:11px; color:#64748b; margin-bottom:20px;">ID: ${schId}</p>

          <div class="ng-modal-footer" style="justify-content:center;">
            <button class="ng-btn ng-btn-secondary" id="close-qr-modal">Cerrar</button>
            <button class="ng-btn ng-btn-primary" id="download-qr-btn">
              <i class="fa-solid fa-download"></i> Descargar PNG
            </button>
          </div>
        </div>
      </div>
    `;

    const qrCanvas = document.getElementById("qrcode-canvas");
    let qrInst;
    // @ts-ignore
    if (window.QRious) {
      // @ts-ignore
      qrInst = new window.QRious({
        element: qrCanvas,
        value: schId,
        size: 200,
        backgroundAlpha: 1,
        foreground: "#1B2A4E",
        level: "H"
      });
    }

    document.getElementById('close-qr-modal-x')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('close-qr-modal')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('download-qr-btn')?.addEventListener('click', () => {
      const enlace = document.createElement("a");
      enlace.href = qrCanvas.toDataURL("image/png");
      enlace.download = `QR_${schName.replace(/\s+/g, '_')}_${schId.substring(0, 8)}.png`;
      enlace.click();
    });
  }

  // =========================================================================
  // WIZARD CREADOR EN 4 PASOS (NTL-155)
  // =========================================================================
  async renderWizard() {
    let currentStep = 1;
    let wizardData = {
      name: '',
      isActive: true,
      checkLocation: true
    };
    let wizardSchedules = [];
    let wizardGuards = [];

    const drawWizardStep = async () => {
      let stepContent = '';

      if (currentStep === 1) {
        stepContent = `
          <div class="ng-card">
            <div class="ng-card-header">
              <h3 class="ng-card-title"><i class="fa-solid fa-file-signature" style="color:var(--ng-accent);"></i> Paso 1: Datos Principales de la Rutina</h3>
            </div>

            <div class="ng-form-group">
              <label class="ng-label" for="wizard-name">Nombre de la Rutina</label>
              <input type="text" class="ng-input" id="wizard-name" value="${wizardData.name}" placeholder="Ej: RONDA PERIMETRAL NOCTURNA" autocomplete="off">
            </div>

            <div class="ng-form-group">
              <label class="ng-toggle">
                <input type="checkbox" id="wizard-active" ${wizardData.isActive ? 'checked' : ''}>
                <span>Estado Activo</span>
              </label>
            </div>

            <div class="ng-form-group" style="margin-bottom:0;">
              <label class="ng-toggle">
                <input type="checkbox" id="wizard-checkLocation" ${wizardData.checkLocation ? 'checked' : ''}>
                <span>Validar Ubicación GPS</span>
              </label>
            </div>
          </div>
        `;
      } else if (currentStep === 2) {
        let schedulesTableRows = wizardSchedules.length === 0
          ? `<tr><td colspan="5" style="text-align:center; color:#64748b;">No ha agregado ninguna ubicación u horario.</td></tr>`
          : wizardSchedules.map((s, idx) => `
            <tr>
              <td><strong>${s.name}</strong></td>
              <td>${s.scheduleTime} - ${s.scheduleTimeEnd}</td>
              <td>Cada ${s.frequency} min</td>
              <td>${s.distance} m</td>
              <td>
                <button class="ng-btn-icon remove-sch-step" data-idx="${idx}"><i class="fa-solid fa-trash" style="color:#dc2626;"></i></button>
              </td>
            </tr>
          `).join('');

        stepContent = `
          <div class="ng-card">
            <div class="ng-card-header">
              <h3 class="ng-card-title"><i class="fa-solid fa-map-location-dot" style="color:var(--ng-accent);"></i> Paso 2: Definición de Horarios y Ubicaciones</h3>
              <button class="ng-btn ng-btn-primary" id="wizard-add-sch-btn"><i class="fa-solid fa-plus"></i> Agregar Ubicación</button>
            </div>

            <table class="ng-table">
              <thead>
                <tr>
                  <th>NOMBRE UBICACIÓN</th>
                  <th>HORARIO (INICIO - FIN)</th>
                  <th>FRECUENCIA</th>
                  <th>DISTANCIA</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                ${schedulesTableRows}
              </tbody>
            </table>
          </div>
        `;
      } else if (currentStep === 3) {
        let guardsTableRows = wizardGuards.length === 0
          ? `<tr><td colspan="3" style="text-align:center; color:#64748b;">No ha seleccionado ningún guardia.</td></tr>`
          : wizardGuards.map((g, idx) => `
            <tr>
              <td><strong>${g.fullName}</strong></td>
              <td>${g.username}</td>
              <td>
                <button class="ng-btn-icon remove-guard-step" data-idx="${idx}"><i class="fa-solid fa-trash" style="color:#dc2626;"></i></button>
              </td>
            </tr>
          `).join('');

        stepContent = `
          <div class="ng-card">
            <div class="ng-card-header">
              <h3 class="ng-card-title"><i class="fa-solid fa-user-shield" style="color:var(--ng-accent);"></i> Paso 3: Asignación de Guardias</h3>
              <button class="ng-btn ng-btn-primary" id="wizard-add-guard-btn"><i class="fa-solid fa-user-plus"></i> Seleccionar Guardias</button>
            </div>

            <table class="ng-table">
              <thead>
                <tr>
                  <th>GUARDIA</th>
                  <th>USUARIO</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                ${guardsTableRows}
              </tbody>
            </table>
          </div>
        `;
      } else if (currentStep === 4) {
        stepContent = `
          <div class="ng-card">
            <div class="ng-card-header">
              <h3 class="ng-card-title"><i class="fa-solid fa-clipboard-check" style="color:var(--ng-accent);"></i> Paso 4: Resumen y Confirmación</h3>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
              <div style="background:var(--ng-surface-2); padding:16px; border-radius:10px; border:1px solid var(--ng-border);">
                <p style="margin-bottom:8px;"><strong>Rutina:</strong> ${wizardData.name}</p>
                <p style="margin-bottom:8px;"><strong>Estado:</strong> ${wizardData.isActive ? '<span class="ng-badge ng-badge-ok">ACTIVO</span>' : '<span class="ng-badge ng-badge-bad">INACTIVO</span>'}</p>
                <p><strong>Validación GPS:</strong> ${wizardData.checkLocation ? '<span class="ng-badge ng-badge-info">SI</span>' : '<span class="ng-badge ng-badge-neu">NO</span>'}</p>
              </div>

              <div style="background:var(--ng-surface-2); padding:16px; border-radius:10px; border:1px solid var(--ng-border);">
                <p style="margin-bottom:8px;"><strong>Total Ubicaciones:</strong> ${wizardSchedules.length}</p>
                <p><strong>Total Guardias:</strong> ${wizardGuards.length}</p>
              </div>
            </div>

            <p style="color:var(--ng-text-muted); font-size:13px; margin:0;">Al hacer clic en "Guardar Rutina Completa", el sistema registrará la rutina y asociará automáticamente sus ubicaciones y guardias.</p>
          </div>
        `;
      }

      this.content.innerHTML = `
        <div class="ng-container" style="max-width:900px; margin:0 auto;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h1 style="font-size:1.4rem; font-weight:800; color:var(--ng-primary); margin:0;">
              Creación de Rutina Unificada
            </h1>
            <button class="ng-btn ng-btn-secondary" id="wizard-cancel-btn">Cancelar</button>
          </div>

          <!-- STEPS BAR -->
          <div class="ng-wizard-steps">
            <div class="ng-wizard-step ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}">
              <div class="ng-wizard-step-num">1</div>
              <span>Datos</span>
            </div>
            <div class="ng-wizard-step ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">
              <div class="ng-wizard-step-num">2</div>
              <span>Ubicaciones</span>
            </div>
            <div class="ng-wizard-step ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">
              <div class="ng-wizard-step-num">3</div>
              <span>Guardias</span>
            </div>
            <div class="ng-wizard-step ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : ''}">
              <div class="ng-wizard-step-num">4</div>
              <span>Confirmación</span>
            </div>
          </div>

          <!-- STEP CONTENT -->
          ${stepContent}

          <!-- WIZARD FOOTER CONTROLS -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
            <button class="ng-btn ng-btn-secondary" id="wizard-prev-btn" ${currentStep === 1 ? 'disabled style="opacity:0.5;"' : ''}>
              <i class="fa-solid fa-arrow-left"></i> Anterior
            </button>

            ${currentStep < 4
          ? `<button class="ng-btn ng-btn-primary" id="wizard-next-btn">Siguiente <i class="fa-solid fa-arrow-right"></i></button>`
          : `<button class="ng-btn ng-btn-primary" id="wizard-save-btn"><i class="fa-solid fa-floppy-disk"></i> Guardar Rutina Completa</button>`
        }
          </div>
        </div>
      `;

      // Bind Cancel
      document.getElementById('wizard-cancel-btn')?.addEventListener('click', () => {
        this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
      });

      // Bind Prev
      document.getElementById('wizard-prev-btn')?.addEventListener('click', () => {
        if (currentStep > 1) {
          saveStepState();
          currentStep--;
          drawWizardStep();
        }
      });

      // Bind Next
      document.getElementById('wizard-next-btn')?.addEventListener('click', () => {
        if (currentStep === 1) {
          const nameInput = document.getElementById('wizard-name');
          if (!nameInput || !nameInput.value.trim()) {
            alert("Por favor ingrese el nombre de la rutina.");
            return;
          }
        }
        saveStepState();
        currentStep++;
        drawWizardStep();
      });

      // Bind Save
      document.getElementById('wizard-save-btn')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        if (btn.disabled) return;
        btn.setAttribute('disabled', 'true');
        btn.classList.add('ng-btn-disabled');
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

        this.saveCompleteRoutine(wizardData, wizardSchedules, wizardGuards, () => {
          btn.removeAttribute('disabled');
          btn.classList.remove('ng-btn-disabled');
          btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Rutina Completa`;
        });
      });

      // Step 2 Add Schedule Event
      document.getElementById('wizard-add-sch-btn')?.addEventListener('click', () => {
        this.openAddScheduleModal((newSch) => {
          wizardSchedules.push(newSch);
          drawWizardStep();
        });
      });

      // Step 2 Remove Schedule Event
      document.querySelectorAll('.remove-sch-step').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          wizardSchedules.splice(idx, 1);
          drawWizardStep();
        });
      });

      // Step 3 Add Guard Event
      document.getElementById('wizard-add-guard-btn')?.addEventListener('click', () => {
        this.openSelectGuardsModal((selectedGuards) => {
          selectedGuards.forEach(sg => {
            if (!wizardGuards.some(g => g.id === sg.id)) {
              wizardGuards.push(sg);
            }
          });
          drawWizardStep();
        });
      });

      // Step 3 Remove Guard Event
      document.querySelectorAll('.remove-guard-step').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx);
          wizardGuards.splice(idx, 1);
          drawWizardStep();
        });
      });
    };

    const saveStepState = () => {
      if (currentStep === 1) {
        const nameInput = document.getElementById('wizard-name');
        const activeInput = document.getElementById('wizard-active');
        const checkLocInput = document.getElementById('wizard-checkLocation');
        if (nameInput) wizardData.name = nameInput.value.trim().toUpperCase();
        if (activeInput) wizardData.isActive = activeInput.checked;
        if (checkLocInput) wizardData.checkLocation = checkLocInput.checked;
      }
    };

    drawWizardStep();
  }

  openAddScheduleModal(onAdd) {
    this.dialogContainer.style.display = 'flex';
    this.dialogContainer.innerHTML = `
      <div class="dialog_content" id="dialog-content">
        <div class="ng-modal-card" style="max-width:520px; width:90%;">
          <div class="ng-modal-header">
            <h2 class="ng-modal-title"><i class="fa-solid fa-map-location-dot" style="color:var(--ng-accent);"></i> Agregar Ubicación / Horario</h2>
            <button class="ng-btn-icon" id="cancel-sch-modal-x"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div class="ng-form-group">
            <label class="ng-label" for="sch-modal-name">Nombre de Ubicación</label>
            <input type="text" class="ng-input" id="sch-modal-name" placeholder="Ej: PUNTO ENTRADA PRINCIPAL" autocomplete="off">
          </div>

          <div class="ng-form-group">
            <label class="ng-label" for="sch-modal-cords">Coordenadas [Lat, Long]</label>
            <input type="text" class="ng-input" id="sch-modal-cords" value="-2.18679, -79.89489" autocomplete="off">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-start">Hora Inicio</label>
              <input type="time" class="ng-input" id="sch-modal-start" value="19:00">
            </div>
            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-end">Hora Fin</label>
              <input type="time" class="ng-input" id="sch-modal-end" value="07:00">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px;">
            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-freq">Frecuencia (minutos)</label>
              <select class="ng-select" id="sch-modal-freq">
                <option value="10">10 min</option>
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="60" selected>60 min</option>
                <option value="120">120 min</option>
                <option value="180">180 min</option>
                <option value="240">240 min</option>
              </select>
            </div>

            <div class="ng-form-group">
              <label class="ng-label" for="sch-modal-dist">Distancia Radio (metros)</label>
              <select class="ng-select" id="sch-modal-dist">
                <option value="5">5 m</option>
                <option value="10" selected>10 m</option>
                <option value="20">20 m</option>
                <option value="30">30 m</option>
                <option value="50">50 m</option>
                <option value="60">60 m</option>
              </select>
            </div>
          </div>

          <div class="ng-modal-footer">
            <button class="ng-btn ng-btn-secondary" id="cancel-sch-modal">Cancelar</button>
            <button class="ng-btn ng-btn-primary" id="save-sch-modal"><i class="fa-solid fa-plus"></i> Agregar Ubicación</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('cancel-sch-modal-x')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('cancel-sch-modal')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('save-sch-modal')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (btn.disabled) return;
      btn.setAttribute('disabled', 'true');
      btn.classList.add('ng-btn-disabled');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

      const resetBtn = () => {
        btn.removeAttribute('disabled');
        btn.classList.remove('ng-btn-disabled');
        btn.innerHTML = originalText;
      };

      const name = document.getElementById('sch-modal-name')?.value.trim().toUpperCase();
      const cords = document.getElementById('sch-modal-cords')?.value.trim();
      const start = document.getElementById('sch-modal-start')?.value;
      const end = document.getElementById('sch-modal-end')?.value;
      const freq = document.getElementById('sch-modal-freq')?.value;
      const dist = document.getElementById('sch-modal-dist')?.value;

      if (!name) {
        alert("Ingrese el nombre de la ubicación.");
        resetBtn();
        return;
      }

      const timeIni = start.split(':');
      const hourIni = parseInt(timeIni[0].trim());
      const minIni = parseInt(timeIni[1].trim());
      const timeEnd = end.split(':');
      const hourEnd = parseInt(timeEnd[0].trim());
      const minEnd = parseInt(timeEnd[1].trim());

      if (hourIni == hourEnd && minIni > minEnd) {
        alert("Minutos iniciales no pueden ser mayores a las del final en horas iguales.");
        resetBtn();
        return;
      }

      const coordsArr = cords ? cords.split(',') : ["-2.18679", "-79.89489"];
      const lat = parseFloat(coordsArr[0]?.trim() || "-2.18679");
      const lng = parseFloat(coordsArr[1]?.trim() || "-79.89489");

      onAdd({
        name,
        cords: `${lat}, ${lng}`,
        latitude: `${lat}`,
        longitude: `${lng}`,
        scheduleTime: start,
        scheduleTimeEnd: end,
        frequency: freq,
        distance: dist
      }, resetBtn);
    });
  }

  async openSelectGuardsModal(onSelect) {
    const modalLimitGuards = 10;
    this.dialogContainer.style.display = 'flex';
    this.dialogContainer.innerHTML = `
      <div class="dialog_content" id="dialog-content">
        <div class="ng-modal-card" style="max-width:620px; width:90%;">
          <div class="ng-modal-header">
            <h2 class="ng-modal-title"><i class="fa-solid fa-user-plus" style="color:var(--ng-accent);"></i> Seleccionar Guardias</h2>
            <button class="ng-btn-icon" id="cancel-guard-modal-x"><i class="fa-solid fa-xmark"></i></button>
          </div>

          <div style="display:flex; gap:8px; margin-bottom:16px;">
            <input type="search" class="ng-input" id="search-guard-modal" placeholder="Buscar guardia por nombre o usuario..." style="flex:1;">
            <button class="ng-btn ng-btn-primary" id="btn-search-guard-modal"><i class="fa-solid fa-search"></i> Buscar</button>
          </div>

          <div style="max-height:300px; overflow-y:auto; border:1px solid var(--ng-border); border-radius:10px; margin-bottom:12px;">
            <table class="ng-table">
              <thead>
                <tr>
                  <th style="width:40px;"></th>
                  <th>GUARDIA</th>
                  <th>USUARIO</th>
                </tr>
              </thead>
              <tbody id="guards-modal-body">
                <tr><td colspan="3" style="text-align:center;">Cargando guardias...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- PAGINACIÓN EN MODAL DE GUARDIAS -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-top:8px; border-top:1px solid var(--ng-border);">
            <span id="guards-modal-page-info" style="font-size:12px; color:var(--ng-text-muted);">Página 1</span>
            <div style="display:flex; gap:6px;">
              <button class="ng-btn ng-btn-secondary" id="prev-guard-modal-page" style="padding:4px 10px; font-size:12px;" disabled>
                <i class="fa-solid fa-chevron-left"></i> Anterior
              </button>
              <button class="ng-btn ng-btn-secondary" id="next-guard-modal-page" style="padding:4px 10px; font-size:12px;" disabled>
                Siguiente <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="ng-modal-footer">
            <button class="ng-btn ng-btn-secondary" id="cancel-guard-modal">Cancelar</button>
            <button class="ng-btn ng-btn-primary" id="save-guard-modal"><i class="fa-solid fa-check"></i> Seleccionar Guardias</button>
          </div>
        </div>
      </div>
    `;

    let currentModalOffset = 0;
    let currentSearchQuery = "";
    let totalGuardsModal = 0;

    const fetchAndRenderGuards = async (search = "", offset = 0) => {
      currentModalOffset = offset;
      currentSearchQuery = search;

      const tbody = document.getElementById('guards-modal-body');
      const pageInfo = document.getElementById('guards-modal-page-info');
      const prevBtn = document.getElementById('prev-guard-modal-page');
      const nextBtn = document.getElementById('next-guard-modal-page');

      if (!tbody) return;
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Cargando...</td></tr>`;

      try {
        const conditions = [
          { "property": "customer.id", "operator": "=", "value": `${customerId}` },
          { "property": "state.name", "operator": "=", "value": `Enabled` },
          { "property": "userType", "operator": "=", "value": `GUARD` },
          { "property": "isSuper", "operator": "=", "value": `${false}` }
        ];

        if (search) {
          conditions.unshift({
            "group": "OR",
            "conditions": [
              { "property": "firstName", "operator": "contains", "value": `${search.toLowerCase()}` },
              { "property": "lastName", "operator": "contains", "value": `${search.toLowerCase()}` },
              { "property": "username", "operator": "contains", "value": `${search.toLowerCase()}` }
            ]
          });
        }

        const rawCount = JSON.stringify({
          "filter": { "conditions": conditions }
        });

        totalGuardsModal = await getFilterEntityCount("User", rawCount) || 0;

        const rawData = JSON.stringify({
          "filter": { "conditions": conditions },
          sort: "+username",
          limit: modalLimitGuards,
          offset: offset,
          fetchPlan: 'full'
        });

        const data = await getFilterEntityData("User", rawData) || [];

        if (data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No se encontraron guardias.</td></tr>`;
        } else {
          tbody.innerHTML = data.map(u => `
            <tr>
              <td><input type="checkbox" class="guard-chk" data-uid="${u.id}" data-fullname="${u.firstName || ''} ${u.lastName || ''}" data-username="${u.username || ''}"></td>
              <td>${u.firstName || ''} ${u.lastName || ''}</td>
              <td>${u.username || ''}</td>
            </tr>
          `).join('');
        }

        // Update pagination controls
        const totalPages = Math.ceil(totalGuardsModal / modalLimitGuards) || 1;
        const currentPageNum = Math.floor(offset / modalLimitGuards) + 1;

        if (pageInfo) {
          pageInfo.innerText = `Página ${currentPageNum} de ${totalPages} (${totalGuardsModal} guardias)`;
        }

        if (prevBtn) {
          if (offset <= 0) {
            prevBtn.setAttribute('disabled', 'true');
            prevBtn.style.opacity = '0.5';
          } else {
            prevBtn.removeAttribute('disabled');
            prevBtn.style.opacity = '1';
          }
        }

        if (nextBtn) {
          if (offset + modalLimitGuards >= totalGuardsModal) {
            nextBtn.setAttribute('disabled', 'true');
            nextBtn.style.opacity = '0.5';
          } else {
            nextBtn.removeAttribute('disabled');
            nextBtn.style.opacity = '1';
          }
        }

      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#dc2626;">Error al cargar guardias.</td></tr>`;
      }
    };

    fetchAndRenderGuards();

    document.getElementById('btn-search-guard-modal')?.addEventListener('click', () => {
      const searchVal = document.getElementById('search-guard-modal')?.value.trim();
      fetchAndRenderGuards(searchVal, 0);
    });

    document.getElementById('search-guard-modal')?.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const searchVal = document.getElementById('search-guard-modal')?.value.trim();
        fetchAndRenderGuards(searchVal, 0);
      }
    });

    document.getElementById('prev-guard-modal-page')?.addEventListener('click', () => {
      if (currentModalOffset > 0) {
        fetchAndRenderGuards(currentSearchQuery, currentModalOffset - modalLimitGuards);
      }
    });

    document.getElementById('next-guard-modal-page')?.addEventListener('click', () => {
      if (currentModalOffset + modalLimitGuards < totalGuardsModal) {
        fetchAndRenderGuards(currentSearchQuery, currentModalOffset + modalLimitGuards);
      }
    });

    document.getElementById('cancel-guard-modal-x')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('cancel-guard-modal')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('dialog-content'));
    });

    document.getElementById('save-guard-modal')?.addEventListener('click', (e) => {
      const saveBtn = e.currentTarget;
      if (saveBtn.disabled) return;
      saveBtn.setAttribute('disabled', 'true');
      saveBtn.classList.add('ng-btn-disabled');
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Asignando...`;

      const resetBtn = () => {
        saveBtn.removeAttribute('disabled');
        saveBtn.classList.remove('ng-btn-disabled');
        saveBtn.innerHTML = originalText;
      };

      const selected = [];
      document.querySelectorAll('.guard-chk:checked').forEach(chk => {
        selected.push({
          id: chk.dataset.uid,
          fullName: chk.dataset.fullname.trim() || 'Guardia',
          username: chk.dataset.username
        });
      });

      if (selected.length === 0) {
        alert("Seleccione al menos un guardia para asignar.");
        resetBtn();
        return;
      }

      onSelect(selected, resetBtn);
    });
  }

  // =========================================================================
  // PERSISTENCIA EN CASCADA / ENVOÍO COMPLETO (NTL-155)
  // =========================================================================
  async saveCompleteRoutine(routineData, schedulesData, guardsData, onErrorCallback) {
    this.dialogContainer.style.display = 'flex';
    this.dialogContainer.innerHTML = `
      <div class="dialog_content" id="dialog-content">
        <div class="ng-modal-card" style="max-width:450px; width:90%; padding:28px; text-align:center;">
          <div style="margin-bottom:16px;">
            <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--ng-accent);"></i>
          </div>
          <h3 id="progress-modal-title" style="color:var(--ng-primary); font-size:16px; margin-bottom:8px;">Guardando Rutina Completa...</h3>
          <p id="progress-modal-status" style="color:var(--ng-text-muted); font-size:13px; margin-bottom:0;">Iniciando registro de datos...</p>
        </div>
      </div>
    `;

    const statusEl = document.getElementById('progress-modal-status');
    const businessData = await currentBusiness();
    const dt = currentDateTime();

    try {
      // 1. Crear Routine (convert name to UPPERCASE)
      if (statusEl) statusEl.innerText = "Registrando datos de la rutina madre...";
      const routineName = routineData.name.trim().toUpperCase();
      const rawRoutine = JSON.stringify({
        "name": routineName,
        "business": { "id": `${businessData.business.id}` },
        "customer": { "id": `${customerId}` },
        "isActive": routineData.isActive,
        "checkLocation": routineData.checkLocation,
        "creationDate": `${dt.date}`,
        "creationTime": `${dt.timeHHMMSS}`
      });

      let createdRoutineRes = await registerEntity(rawRoutine, 'Routine');
      let createdRoutineId = createdRoutineRes?.id;

      // Fallback si res no trae id directo
      if (!createdRoutineId) {
        if (statusEl) statusEl.innerText = "Verificando ID asignado...";
        const rawLookup = JSON.stringify({
          "filter": {
            "conditions": [
              { "property": "name", "operator": "=", "value": `${routineName}` },
              { "property": "customer.id", "operator": "=", "value": `${customerId}` }
            ]
          },
          sort: "-createdDate",
          limit: 1,
          fetchPlan: 'full'
        });
        const lookupRes = await getFilterEntityData("Routine", rawLookup);
        if (lookupRes && lookupRes.length > 0) {
          createdRoutineId = lookupRes[0].id;
        }
      }

      if (!createdRoutineId) {
        throw new Error("No se pudo obtener el ID de la rutina creada.");
      }

      // 2. Crear RoutineSchedules (convert schedule name to UPPERCASE)
      if (schedulesData.length > 0) {
        if (statusEl) statusEl.innerText = `Generando ${schedulesData.length} ubicaciones / horarios...`;
        for (let i = 0; i < schedulesData.length; i++) {
          const sch = schedulesData[i];
          const schName = sch.name.trim().toUpperCase();
          const rawSch = JSON.stringify({
            "name": schName,
            "cords": sch.cords,
            "latitude": sch.latitude,
            "longitude": sch.longitude,
            "frequency": `${sch.frequency}`,
            "distance": `${sch.distance}`,
            "business": { "id": `${businessData.business.id}` },
            "customer": { "id": `${customerId}` },
            "routine": { "id": `${createdRoutineId}` },
            "scheduleTime": sch.scheduleTime,
            "scheduleTimeEnd": sch.scheduleTimeEnd,
            "creationDate": `${dt.date}`,
            "creationTime": `${dt.timeHHMMSS}`
          });
          const saved = await registerEntity(rawSch, 'RoutineSchedule');
          if (saved && saved.id) {
            await generateRoutineTimes(saved.id);
          }
        }
      }

      // 3. Crear RoutineUsers
      if (guardsData.length > 0) {
        if (statusEl) statusEl.innerText = `Asignando ${guardsData.length} guardias...`;
        for (let i = 0; i < guardsData.length; i++) {
          const g = guardsData[i];
          const rawGuard = JSON.stringify({
            "business": { "id": `${businessData.business.id}` },
            "customer": { "id": `${customerId}` },
            "routine": { "id": `${createdRoutineId}` },
            "user": { "id": `${g.id}` },
            "creationDate": `${dt.date}`,
            "creationTime": `${dt.timeHHMMSS}`
          });
          await registerEntity(rawGuard, 'RoutineUser');
        }
      }

      if (statusEl) statusEl.innerText = "¡Rutina creada exitosamente!";
      await sleep(800);
      new CloseDialog().x(document.getElementById('dialog-content'));

      // Render Detail View for newly created routine
      this.renderDetail(createdRoutineId, 0, 0);

    } catch (err) {
      console.error("Error al guardar rutina completa:", err);
      new CloseDialog().x(document.getElementById('dialog-content'));
      alert("Ocurrió un error al guardar la rutina completa: " + (err.message || err));
      if (typeof onErrorCallback === 'function') {
        onErrorCallback();
      }
    }
  }

  // =========================================================================
  // MÉTODOS EXISTENTES Y AUXILIARES
  // =========================================================================

  register() {
    const openEditor = document.getElementById('new-entity');
    if (openEditor) {
      openEditor.onclick = () => this.renderWizard();
    }
  }

  edit(container, data) {
    const editBtns = document.querySelectorAll('#edit-entity');
    editBtns.forEach((edit) => {
      const entityId = edit.dataset.entityid;
      edit.addEventListener('click', () => {
        this.RInterface('Routine', entityId, 'list');
      });
    });
  }

  async RInterface(entities, entityID, origin = 'list') {
    const data = await getEntityData(entities, entityID);
    this.entityDialogContainer.innerHTML = '';
    this.entityDialogContainer.style.display = 'flex';
    this.entityDialogContainer.innerHTML = `
      <div class="ng-modal-card" id="entity-editor" style="max-width:480px; width:90%;">
        <div class="ng-modal-header">
          <h2 class="ng-modal-title"><i class="fa-solid fa-gear" style="color:var(--ng-accent);"></i> Editar Datos de Rutina</h2>
          <button class="ng-btn-icon" id="close"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="ng-form-group">
          <label class="ng-label" for="entity-name">Nombre de la Rutina</label>
          <input type="text" id="entity-name" class="ng-input" value="${data?.name ?? ''}" autocomplete="off">
        </div>

        <div class="ng-form-group">
          <label class="ng-toggle">
            <input type="checkbox" id="entity-active">
            <span>Estado Activo</span>
          </label>
        </div>

        <div class="ng-form-group">
          <label class="ng-toggle">
            <input type="checkbox" id="entity-checkLocation">
            <span>Validar Ubicación GPS</span>
          </label>
        </div>

        <div style="background:var(--ng-surface-2); padding:12px; border-radius:8px; margin-top:16px;">
          <small style="color:var(--ng-text-muted); display:block; margin-bottom:4px;"><i class="fa-solid fa-calendar"></i> Creado: ${data.creationDate} ${data.creationTime}</small>
          <small style="color:var(--ng-text-muted); display:block;"><i class="fa-solid fa-user"></i> Por: ${data.createdBy || 'Sistema'}</small>
        </div>

        <div class="ng-modal-footer">
          <button class="ng-btn ng-btn-secondary" id="cancel-edit-btn">Cancelar</button>
          <button class="ng-btn ng-btn-primary" id="update-changes"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
        </div>
      </div>
    `;

    const checkboxActive = document.getElementById('entity-active');
    if (data.isActive === true) {
      checkboxActive?.setAttribute('checked', 'true');
    }

    const checkbox2Active = document.getElementById('entity-checkLocation');
    if (data.checkLocation === true) {
      checkbox2Active?.setAttribute('checked', 'true');
    }

    this.close();

    document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
      new CloseDialog().x(document.getElementById('entity-editor-container'));
    });

    const updateButton = document.getElementById('update-changes');
    updateButton?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      if (btn.disabled) return;
      btn.setAttribute('disabled', 'true');
      btn.classList.add('ng-btn-disabled');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

      const resetBtn = () => {
        btn.removeAttribute('disabled');
        btn.classList.remove('ng-btn-disabled');
        btn.innerHTML = originalText;
      };

      const nameVal = document.getElementById('entity-name')?.value.trim().toUpperCase();
      const activeVal = document.getElementById('entity-active')?.checked;
      const checkLocVal = document.getElementById('entity-checkLocation')?.checked;

      if (!nameVal) {
        alert("Debe completar el nombre");
        resetBtn();
        return;
      }

      let raw = JSON.stringify({
        "name": `${nameVal}`,
        "isActive": activeVal ? true : false,
        "checkLocation": checkLocVal ? true : false
      });

      updateEntity('Routine', entityID, raw).then(() => {
        setTimeout(() => {
          new CloseDialog().x(document.getElementById('entity-editor-container'));
          if (origin === 'detail') {
            this.renderDetail(entityID, 0, 0);
          } else {
            this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
          }
        }, 100);
      }).catch(err => {
        console.error("Error al actualizar rutina:", err);
        alert("Error al actualizar la rutina.");
        resetBtn();
      });
    });
  }

  export2() {
    const exportRegisters = document.querySelectorAll('#export2-entity');
    exportRegisters.forEach((exports) => {
      const entityId = exports.dataset.entityid;
      exports.addEventListener('click', () => {
        this.entityDialogContainer.innerHTML = '';
        this.entityDialogContainer.style.display = 'flex';
        this.entityDialogContainer.innerHTML = `
            <div class="entity_editor" id="entity-editor">
            <div class="entity_editor_header">
                <div class="user_info">
                <div class="avatar"><i class="fa-regular fa-file-export"></i></div>
                <h1 class="entity_editor_title">Exportar<br><small>Datos</small></h1>
                </div>

                <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
            </div>

            <!-- EDITOR BODY -->
            <div class="entity_editor_body">
                <div class="material_input">
                    <label for="status-export">Estados del registro</label>
                    <br><br>
                    <select name="status-export" id="status-export">
                        <option value="Todos">Todos</option>
                        <option value="Marcadas" selected>Marcadas</option>
                        <option value="NoMarcadas">No Marcadas</option>
                    </select>
                </div>
                <br>
                <div class="material_input">
                    <label for="export-format">Formato de archivo</label>
                    <br><br>
                    <select name="export-format" id="export-format">
                        <option value="pdf" selected>PDF (con imágenes)</option>
                        <option value="excel">Excel / CSV (solo datos)</option>
                    </select>
                </div>
                <br>
                <div class="input_checkbox" id="flip-image-container">
                <label><input type="checkbox" class="checkbox" id="entity-flip-image"> Girar Imágenes (PDF)</label>
                </div>
                <br>
                <div class="form_group">
                    <div class="form_input">
                        <label class="form_label" for="start-date">Desde:</label>
                        <input type="date" class="input_date input_date-start" id="start-date" name="start-date">
                    </div>

                    <div class="form_input">
                        <label class="form_label" for="end-date">Hasta:</label>
                        <input type="date" class="input_date input_date-end" id="end-date" name="end-date">
                    </div>

                </div>
                <br>
                <div class="form_group">
                    <div class="form_input">
                        <label class="form_label" for="start-time">Hora Inicio:</label>
                        <input type="time" class="input_time" id="start-time" name="start-time">
                    </div>

                    <div class="form_input">
                        <label class="form_label" for="end-time">Hora Fin:</label>
                        <input type="time" class="input_time" id="end-time" name="end-time">
                    </div>
                </div>

                <br><br>

            </div>

            <div class="entity_editor_footer">
                <button class="btn btn_primary btn_widder" id="export-data">Listo</button>
            </div>
            </div>
        `;

        inputObserver();
        let fecha = new Date();
        let mes = fecha.getMonth() + 1;
        let dia = fecha.getDate();
        let anio = fecha.getFullYear();
        if (dia < 10) dia = '0' + dia;
        if (mes < 10) mes = '0' + mes;

        document.getElementById("start-date").value = anio + "-" + mes + "-" + dia;
        document.getElementById("end-date").value = anio + "-" + mes + "-" + dia;
        document.getElementById("start-time").value = "00:00";
        document.getElementById("end-time").value = "23:59";

        const _closeButton = document.getElementById('close');
        const exportButton = document.getElementById('export-data');
        const statusExport = document.getElementById('status-export');
        const exportFormat = document.getElementById('export-format');
        const flipImage = document.getElementById('entity-flip-image');

        exportFormat?.addEventListener('change', () => {
          const flipContainer = document.getElementById('flip-image-container');
          if (exportFormat.value === 'excel') {
            flipContainer.style.display = 'none';
          } else {
            flipContainer.style.display = 'block';
          }
        });

        let onPressed = false;
        exportButton?.addEventListener('click', async () => {
          const startDate = document.getElementById('start-date').value;
          const endDate = document.getElementById('end-date').value;
          const startTime = document.getElementById('start-time').value;
          const endTime = document.getElementById('end-time').value;

          if (startDate > endDate) {
            alert('La fecha "Desde" no puede ser mayor que la fecha "Hasta"');
            return;
          }
          if (startDate === endDate && startTime > endTime) {
            alert('La hora de inicio no puede ser mayor que la hora de fin para el mismo día');
            return;
          }

          if (!onPressed) {
            onPressed = true;
            this.dialogContainer.style.display = 'block';
            this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog" style="width: 450px; max-width: 90%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <div class="dialog_container padding_16">
                            <div class="dialog_header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
                                <h2 style="margin: 0; color: #1e293b; font-size: 1.25rem;">Procesando Exportación</h2>
                            </div>

                            <div class="dialog_message">
                                <div style="margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                        <span id="export-status-label" style="font-size: 13px; font-weight: 600; color: #64748b;">Iniciando...</span>
                                        <span id="export-total" style="font-size: 12px; color: #94a3b8;">...</span>
                                    </div>
                                    <div id="progress-bar-container" style="background: #f1f5f9; border-radius: 10px; height: 8px; overflow: hidden; display: none; margin-bottom: 4px;">
                                        <div id="progress-bar" style="background: #3b82f6; height: 100%; width: 0%; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px;"></div>
                                    </div>
                                    <p id="message-export" style="margin: 4px 0 0 0; font-size: 13px; color: #334155; font-weight: 500;"></p>
                                </div>

                                <div id="time-container" style="display: none; background: #eff6ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #dbeafe;">
                                    <p id="time-estimate" style="margin: 0; font-size: 12px; color: #1d4ed8; display: flex; align-items: center;">
                                        <i class="fa-solid fa-hourglass-half" style="margin-right: 8px;"></i>
                                        Calculando tiempo...
                                    </p>
                                </div>

                                <div id="error-container" style="display: none;">
                                    <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.025em;">Registros y Avisos:</p>
                                    <div id="error-log" style="background: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; max-height: 120px; overflow-y: scroll; font-size: 11.5px; line-height: 1.5; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;"></div>
                                </div>
                            </div>

                            <div class="dialog_footer" style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
                                <button class="btn btn_secondary" id="cancel" style="border-radius: 6px; padding: 8px 16px;">Cancelar Proceso</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            inputObserver();
            let status = false;
            let conditionStatus = '<>';
            if (statusExport.value == 'Marcadas') {
              status = true;
            } else if (statusExport.value == 'NoMarcadas') {
              status = true;
              conditionStatus = '=';
            }

            const messageTotal = document.getElementById("export-total");
            const messageExport = document.getElementById("message-export");
            const messageLabel = document.getElementById("export-status-label");
            const progressBarContainer = document.getElementById("progress-bar-container");
            const progressBar = document.getElementById("progress-bar");
            const errorLog = document.getElementById("error-log");
            const errorContainer = document.getElementById("error-container");
            const _cancelButton = document.getElementById('cancel');

            _cancelButton.onclick = () => {
              onPressed = false;
              new CloseDialog().x(document.getElementById('dialog-content'));
            };

            const _values = {
              start: document.getElementById('start-date'),
              end: document.getElementById('end-date'),
              startTime: document.getElementById('start-time'),
              endTime: document.getElementById('end-time'),
            };

            const timeConditions = [];
            if (_values.startTime.value <= _values.endTime.value) {
              timeConditions.push(
                { "property": "creationTime", "operator": ">=", "value": `${_values.startTime.value}:00` },
                { "property": "creationTime", "operator": "<=", "value": `${_values.endTime.value}:59` }
              );
            } else {
              timeConditions.push({
                "group": "OR",
                "conditions": [
                  { "property": "creationTime", "operator": ">=", "value": `${_values.startTime.value}:00` },
                  { "property": "creationTime", "operator": "<=", "value": `${_values.endTime.value}:59` }
                ]
              });
            }

            let rawToExport = (offset) => {
              return JSON.stringify({
                "filter": {
                  "conditions": [
                    { "property": `customer.id`, "operator": "=", "value": `${customerId}` },
                    { "property": "routine.id", "operator": `=`, "value": `${entityId}` },
                    { "property": "routineState.name", "operator": `${conditionStatus}`, "value": `${status ? 'No cumplido' : ""}` },
                    { "property": "creationDate", "operator": ">=", "value": `${_values.start.value}` },
                    { "property": "creationDate", "operator": "<=", "value": `${_values.end.value}` },
                    ...timeConditions
                  ],
                },
                sort: `-createdDate`,
                limit: Config.limitExport,
                offset: offset,
                fetchPlan: 'full',
              });
            };

            let rawExport = rawToExport(0);
            const totalRegisters = await getFilterEntityCount("RoutineRegister", rawExport);
            if (totalRegisters === undefined) {
              onPressed = false;
              errorContainer.style.display = 'block';
              errorLog.innerHTML += `<div style="margin-bottom: 4px; color: #721c24; background: #f8d7da; padding: 4px 8px; border-radius: 4px;">Error al exportar.</div>`;
              messageLabel.innerText = "Error en el proceso";
            } else if (totalRegisters === 0) {
              onPressed = false;
              errorContainer.style.display = 'block';
              errorLog.innerHTML += `<div style="margin-bottom: 4px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 4px;">No hay ningún registro para exportar.</div>`;
              messageLabel.innerText = "Sin registros";
            } else {
              progressBarContainer.style.display = 'block';
              messageLabel.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Obteniendo registros...`;
              messageTotal.innerText = `0 / ${totalRegisters}`;
              const pages = Math.ceil(totalRegisters / Config.limitExport);
              let array = [];
              let registers = [];
              let offset = 0;
              for (let i = 0; i < pages; i++) {
                if (onPressed) {
                  rawExport = rawToExport(offset);
                  array[i] = await getFilterEntityData("RoutineRegister", rawExport);
                  for (let y = 0; y < array[i].length; y++) {
                    registers.push(array[i][y]);
                  }
                  messageTotal.innerText = `${registers.length} / ${totalRegisters}`;
                  messageExport.innerText = `Cargando: ${registers.length} registros`;
                  progressBar.style.width = `${(registers.length / totalRegisters) * 50}%`;
                  offset = Config.limitExport + (offset);
                  await sleep(Config.timeOutExport);
                }
              }

              messageLabel.innerHTML = `<i class="fa-solid fa-image"></i> Descargando datos...`;
              messageExport.innerText = `Procesando imágenes...`;
              let rows = [];
              for (let i = 0; i < registers.length; i++) {
                if (!onPressed) break;
                let register = registers[i];
                let image = '';
                if (exportFormat.value === 'pdf') {
                  if (register.attachment !== undefined) {
                    image = await getFile(register.attachment);
                  }
                }

                let obj = {
                  "cliente": `${register?.customer?.name ?? ''}`,
                  "rutina": `${register?.routine?.name ?? ''}`,
                  "ubicacion": `${register?.routineSchedule?.name ?? ''}`,
                  "intervaloInicio": `${register?.routineSchedule?.scheduleTime ?? ''}`,
                  "intervaloFin": `${register?.routineSchedule?.scheduleTimeEnd ?? ''}`,
                  "inicio": `${_values.start.value} ${_values.startTime.value}`,
                  "fin": `${_values.end.value} ${_values.endTime.value}`,
                  "fecha": `${register.creationDate}`,
                  "hora": `${register.creationTime}`,
                  "estado": `${register?.routineState?.name ?? ''}`,
                  "latitud": `${register?.latitude ?? ''}`,
                  "longitud": `${register?.longitude ?? ''}`,
                  "usuario": `${register.user?.firstName ?? ''} ${register.user?.lastName ?? ''}`,
                  "observacion": `${register?.observation ?? ''}`,
                };

                if (exportFormat.value === 'pdf') {
                  obj.imagen = image;
                  obj.imageTag = i + 1;
                }

                rows.push(obj);
                progressBar.style.width = `${50 + ((i + 1) / registers.length) * 50}%`;
              }

              const customer = await getEntityData('Customer', customerId);
              if (onPressed) {
                if (exportFormat.value === 'pdf') {
                  messageLabel.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Generando documento...`;
                  await exportRoutinePdf2(rows, [], flipImage?.checked ? true : false, false, customer?.email ?? '', 1, 1);
                } else {
                  messageLabel.innerHTML = `<i class="fa-solid fa-file-excel"></i> Generando Excel...`;
                  const d = new Date();
                  await generateRoutineReportXlsx(rows, {
                    customerName: customer?.name ?? '',
                    startDate: _values.start.value,
                    endDate: _values.end.value,
                    startTime: _values.startTime.value,
                    endTime: _values.endTime.value,
                    filename: `Reporte_Rutina_${(customer?.name || '').replace(/\s+/g, '_')}_${d.getDate()}_${d.getMonth() + 1}.xlsx`,
                  });
                }
              }

              new CloseDialog().x(document.getElementById('dialog-content'));
              onPressed = false;
            }
          }
        });

        _closeButton.onclick = () => {
          onPressed = false;
          new CloseDialog().x(document.getElementById('entity-editor-container'));
        };
      });
    });
  }

  ex() {
    const exportRegisters = document.getElementById('ex-entity');
    if (!exportRegisters) return;

    exportRegisters.addEventListener('click', async () => {
      this.dialogContainer.style.display = 'block';
      this.dialogContainer.innerHTML = `
        <div class="dialog_content" id="dialog-content">
            <div class="dialog">
                <div class="dialog_container padding_8">
                    <div class="dialog_header">
                        <h2>Antes de exportar</h2>
                    </div>

                    <div class="dialog_message padding_8">
                        <div class="input_checkbox">
                            <label><input type="checkbox" class="checkbox" id="check-allCustomer"> Descargar rutinas de todas las empresas</label>
                        </div>
                    </div>

                    <div class="dialog_footer">
                        <button class="btn btn_primary" id="cancel">Cancelar</button>
                        <button class="btn btn_danger" id="export-data">Exportar</button>
                    </div>
                </div>
            </div>
        </div>`;

      inputObserver();
      const _closeButton = document.getElementById('cancel');
      const exportButton = document.getElementById('export-data');
      const _checkAllCustomer = document.getElementById('check-allCustomer');
      let onPressed = false;

      exportButton?.addEventListener('click', async () => {
        if (!onPressed) {
          onPressed = true;
          this.dialogContainer.style.display = 'block';
          this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog" style="width: 450px; max-width: 90%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                        <div class="dialog_container padding_16">
                            <div class="dialog_header" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px;">
                                <h2 style="margin: 0; color: #1e293b; font-size: 1.25rem;">Exportando Rutinas</h2>
                            </div>

                            <div class="dialog_message">
                                <div style="margin-bottom: 20px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                        <span id="export-status-label" style="font-size: 13px; font-weight: 600; color: #64748b;">Obteniendo datos...</span>
                                        <span id="export-total" style="font-size: 12px; color: #94a3b8;">...</span>
                                    </div>
                                    <div id="progress-bar-container" style="background: #f1f5f9; border-radius: 10px; height: 8px; overflow: hidden; margin-bottom: 4px;">
                                        <div id="progress-bar" style="background: #3b82f6; height: 100%; width: 0%; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 10px;"></div>
                                    </div>
                                    <p id="message-export" style="margin: 4px 0 0 0; font-size: 13px; color: #334155; font-weight: 500;"></p>
                                </div>
                            </div>

                            <div class="dialog_footer" style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
                                <button class="btn btn_secondary" id="cancel">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;

          inputObserver();
          const messageTotal = document.getElementById("export-total");
          const progressBar = document.getElementById("progress-bar");
          const _cancelButton = document.getElementById('cancel');

          _cancelButton.onclick = () => {
            onPressed = false;
            new CloseDialog().x(document.getElementById('dialog-content'));
          };

          let rawToExport = (offset) => {
            return JSON.stringify({
              "filter": {
                "conditions": [
                  {
                    "property": `${_checkAllCustomer.checked ? 'business.id' : 'customer.id'}`,
                    "operator": "=",
                    "value": `${_checkAllCustomer.checked ? Config.currentUser.business.id : customerId}`
                  },
                  { "property": "business.state.name", "operator": "=", "value": `Enabled` }
                ]
              },
              sort: "+customer.name,+routine.name",
              limit: Config.limitExport,
              offset: offset,
              fetchPlan: 'full',
            });
          };

          let rawExport = rawToExport(0);
          const totalRegisters = await getFilterEntityCount("RoutineSchedule", rawExport);
          if (totalRegisters && totalRegisters > 0) {
            messageTotal.innerText = `0 / ${totalRegisters}`;
            const pages = Math.ceil(totalRegisters / Config.limitExport);
            let array = [];
            let dataToExport = [];
            let offset = 0;
            for (let i = 0; i < pages; i++) {
              if (onPressed) {
                rawExport = rawToExport(offset);
                array[i] = await getFilterEntityData("RoutineSchedule", rawExport);
                for (let y = 0; y < array[i].length; y++) {
                  dataToExport.push({
                    "Empresa": array[i][y].customer?.name ?? '',
                    "Rutina": array[i][y].routine?.name ?? '',
                    "Activo": array[i][y].routine?.isActive ? "Si" : "No",
                    "GPS": array[i][y].routine?.checkLocation ? "Si" : "No",
                    "Ubicacion": array[i][y].name ?? '',
                    "Coordenadas": array[i][y].cords ?? '',
                    "Horario": `${array[i][y].scheduleTime ?? ''} - ${array[i][y].scheduleTimeEnd ?? ''}`,
                    "Frecuencia": array[i][y].frequency ?? 0,
                    "Distancia": array[i][y].distance ?? 0
                  });
                }
                messageTotal.innerText = `${dataToExport.length} / ${totalRegisters}`;
                progressBar.style.width = `${(dataToExport.length / totalRegisters) * 100}%`;
                offset = Config.limitExport + (offset);
                await sleep(Config.timeOutExport);
              }
            }
            generateFileSimpleXls(dataToExport, "Rutinas", "xls");
          }

          new CloseDialog().x(document.getElementById('dialog-content'));
          onPressed = false;
        }
      });

      _closeButton?.addEventListener('click', () => {
        new CloseDialog().x(document.getElementById('dialog-content'));
      });
    });
  }

  close() {
    const closeButton = document.getElementById('close');
    const editor = document.getElementById('entity-editor-container');
    if (closeButton && editor) {
      closeButton.addEventListener('click', () => {
        new CloseDialog().x(editor);
      });
    }
  }
}
