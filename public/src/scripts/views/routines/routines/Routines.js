// @filename: Routines.ts
import { registerEntity, getUserInfo, getEntityData, updateEntity, getFilterEntityData, getFilterEntityCount, deleteEntity, getFile, sendMail2 } from "../../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, getDetails, generateFileSimpleXls, sleep } from "../../../tools.js";
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
export class Routines {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', () => {
                /*const arrayData = data.filter((data) => `${data.name}
                 ${data.ruc}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredResult = arrayData.length;
                let result = arrayData;
                if (filteredResult >= tableRows)
                    filteredResult = tableRows;
                this.load(tableBody, currentPage, result);
                this.pagination(result, tableRows, currentPage);*/
            });
            btnSearch.addEventListener('click', async () => {
              new Routines().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
          });
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
        this.searchEntity(tableBody /*, data*/);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, infoPage.currentPage);
    }
    load(table, currentPage, data) {
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let mensaje = 'No existen datos';
            if(customerId == null){mensaje = 'Seleccione una empresa';}
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>${mensaje}</td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let routine = paginatedItems[i];
                let row = document.createElement('tr');
                if(routine.customer.id == "2dd22d6d-a61f-5a11-b9ad-b1afc0dc1603" || routine.customer.id == "c7afa17d-0544-7351-f50f-b5630a6a93c7"){
                  row.innerHTML += `
                    <td>${routine?.name ?? ''}</dt>
                    <td>${routine?.isActive ? 'Sí' : 'No'}</dt>
                    <td>${routine?.checkLocation ? 'Sí' : 'No'}</dt>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="location-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-map-location"></i>
                        </button>

                        <button class="button" id="guard-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-user-police"></i>
                        </button>

                        <button class="button" id="export2-entity" data-entityId="${routine.id}" title="Exportar registros">
                    <i class="fa-solid fa-file-export"></i>
                </button>

                      <button class="button" id="remove-entity" data-entityId="${routine.id}">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </dt>
                  `;
                }else{
                  row.innerHTML += `
                    <td>${routine?.name ?? ''}</dt>
                    <td>${routine?.isActive ? 'Sí' : 'No'}</dt>
                    <td>${routine?.checkLocation ? 'Sí' : 'No'}</dt>
                    <td class="entity_options">
                        <button class="button" id="edit-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="location-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-map-location"></i>
                        </button>

                        <button class="button" id="guard-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-user-police"></i>
                        </button>

                        <button class="button" id="export2-entity" data-entityId="${routine.id}">
                          <i class="fa-solid fa-file-pdf"></i>
                        </button>

                      <button class="button" id="remove-entity" data-entityId="${routine.id}">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </dt>
                  `;
                  
                }
                table.appendChild(row);
                drawTagsIntoTables();
            }
        }
        this.register();
        this.ex();
        this.export2();
        this.remove();
        this.location();
        this.assignGuard();
        this.edit(this.entityDialogContainer, data);
    }
    pagination(items, limitRows, currentPage) {
      const tableBody = document.getElementById('datatable-body');
      const paginationWrapper = document.getElementById('pagination-container');
      paginationWrapper.innerHTML = '';
      let pageCount;
      pageCount = Math.ceil(infoPage.count / limitRows);
      let button;
      if (pageCount <= Config.maxLimitPage) {
          for (let i = 1; i < pageCount + 1; i++) {
              button = setupButtons(i /*, items, currentPage, tableBody, limitRows*/);
              paginationWrapper.appendChild(button);
          }
          fillBtnPagination(currentPage, Config.colorPagination);
      }
      else {
          pagesOptions(items, currentPage);
      }
      function setupButtons(page /*, items, currentPage, tableBody, limitRows*/) {
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
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface();
        });
        const renderInterface = async () => {
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-gear"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Rutina</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-active" checked> Activo</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-checkLocation"> Validar Ubicación</label>
            </div>

          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `;
            // @ts-ignore
            inputObserver();
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', async() => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    active: document.getElementById('entity-active'),
                    checkLocation: document.getElementById('entity-checkLocation')
                };
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value}`,
                    "business": {
                        "id": `${Config.currentUser.business.id}`},
                    "customer": {
                      "id": `${customerId}`},
                    "isActive": `${inputsCollection.active.checked ? true : false}`,
                    "checkLocation": `${inputsCollection.checkLocation.checked ? true : false}`,
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().timeHHMMSS}`,
                });
                if(inputsCollection.name.value == '' || inputsCollection.name.value == null || inputsCollection.name.value == undefined){
                  alert("Debe completar el nombre");
                }else{
                  registerEntity(raw, 'Routine').then((res) => {
                    setTimeout(() => {
                        const container = document.getElementById('entity-editor-container');
                        new CloseDialog().x(container);
                        new Routines().render(Config.offset, Config.currentPage, infoPage.search);
                    }, 1000);
                  });
                }
            });
        };
        const reg = async (raw) => {
        };
    }
    edit(container, data) {
        // Edit entity
        const edit = document.querySelectorAll('#edit-entity');
        edit.forEach((edit) => {
            const entityId = edit.dataset.entityid;
            edit.addEventListener('click', () => {
                RInterface('Routine', entityId);
            });
        });
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-regular fa-gear"></i></div>
              <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">

            <div class="material_input">
              <input type="text"
                id="entity-name"
                class="input_filled"
                value="${data?.name ?? ''}">
              <label for="entity-name">Nombre</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-active"> Activo</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-checkLocation"> Validar Ubicación</label>
            </div>

            <br>
            <br>

            <div class="input_detail">
                <label for="creation-date"><i class="fa-solid fa-calendar"></i></label>
                <input type="date" id="creation-date" class="input_filled" value="${data.creationDate}" readonly>
            </div>
            <br>
            <div class="input_detail">
                <label for="creation-time"><i class="fa-solid fa-clock"></i></label>
                <input type="time" id="creation-time" class="input_filled" value="${data.creationTime}" readonly>
            </div>
            <br>
            <div class="input_detail">
                <label for="log-user"><i class="fa-solid fa-user"></i></label>
                <input type="text" id="log-user" class="input_filled" value="${data.createdBy}" readonly>
            </div>

          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
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

            inputObserver();
            this.close();
            UUpdate(entityID);
        };
        const UUpdate = async (entityId) => {
            const updateButton = document.getElementById('update-changes');
            const $value = {
              // @ts-ignore
              name: document.getElementById('entity-name'),
              // @ts-ignore
              active: document.getElementById('entity-active'),
              checkLocation: document.getElementById('entity-checkLocation')
          };
            updateButton.addEventListener('click', () => {
              let raw = JSON.stringify({
                  // @ts-ignore
                  "name": `${$value.name.value}`,
                  "isActive": `${$value.active.checked ? true : false}`,
                  "checkLocation": `${$value.checkLocation.checked ? true : false}`
              });
              if($value.name.value == '' || $value.name.value == null || $value.name.value == undefined){
                alert("Debe completar el nombre");
              }else{
                update(raw);
              }
            });
            const update = (raw) => {
              updateEntity('Routine', entityId, raw)
                  .then((res) => {
                  setTimeout(async () => {
                      let tableBody;
                      let container;
                      let data;
                      //data = await getRoutines();
                      new CloseDialog()
                          .x(container =
                          document.getElementById('entity-editor-container'));
                      new Routines().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                  }, 100);
              });
          };
        };
    }
    remove() {
      const remove = document.querySelectorAll('#remove-entity');
      remove.forEach((remove) => {
          const entityId = remove.dataset.entityid;
          // BOOKMARK: MODAL
          remove.addEventListener('click', () => {
              this.dialogContainer.style.display = 'block';
              this.dialogContainer.innerHTML = `
                  <div class="dialog_content" id="dialog-content">
                      <div class="dialog dialog_danger">
                      <div class="dialog_container">
                          <div class="dialog_header">
                          <h2>¿Deseas eliminar esta rutina?</h2>
                          </div>

                          <div class="dialog_message">
                          <p>Esta acción no se puede revertir</p>
                          </div>

                          <div class="dialog_footer">
                          <button class="btn btn_primary" id="cancel">Cancelar</button>
                          <button class="btn btn_danger" id="delete">Eliminar</button>
                          </div>
                      </div>
                      </div>
                  </div>`;
              const deleteButton = document.getElementById('delete');
              const cancelButton = document.getElementById('cancel');
              const dialogContent = document.getElementById('dialog-content');
              deleteButton.onclick = async() => {
                  const locations = await getDetails('routine.id', entityId, 'RoutineSchedule');
                  if(locations.length != 0 && locations != undefined){
                    for(let i=0; i<locations.length; i++){
                      let raw = JSON.stringify({
                        "filter": {
                            "conditions": [
                                {
                                  "property": "routineSchedule.id",
                                  "operator": "=",
                                  "value": `${locations[i].id}`
                                },
                            ],
                        },
                        sort: "-createdDate",
                      });
                      let times = await getFilterEntityData("RoutineTime", raw);
                      for(let i=0; i<times.length; i++){
                        deleteEntity('RoutineTime', times[i].id);
                      }
                      deleteEntity('RoutineSchedule', locations[i].id);
                    }
                  }

                  const guards = await getDetails('routine.id', entityId, 'RoutineUser');
                  if(guards.length != 0 && guards != undefined){
                    for(let i=0; i<guards.length; i++){
                      deleteEntity('RoutineUser', guards[i].id);
                    }
                  }
                  deleteEntity('Routine', entityId)
                  .then((res) => {
                      setTimeout(async () => {
                          //let data = await getUsers();
                          const tableBody = document.getElementById('datatable-body');
                          new CloseDialog().x(dialogContent);
                          new Routines().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                      }, 1000);
                  });
              };
              cancelButton.onclick = () => {
                  new CloseDialog().x(dialogContent);
              };
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
                    <br>
                    <br>
                    <select name="status-export" id="status-export">
                        <option value="Todos">Todos</option>
                        <option value="Marcadas" selected>Marcadas</option>
                        <option value="NoMarcadas">No Marcadas</option>
                    </select>
                </div>
                <br>
                <div class="material_input">
                    <label for="export-format">Formato de archivo</label>
                    <br>
                    <br>
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

                <br>
                <br>

            </div>
            <!-- END EDITOR BODY -->

            <div class="entity_editor_footer">
                <button class="btn btn_primary btn_widder" id="export-data">Listo</button>
            </div>
            </div>
        `;

            inputObserver();
            let fecha = new Date(); //Fecha actual
            let mes = fecha.getMonth()+1; //obteniendo mes
            let dia = fecha.getDate(); //obteniendo dia
            let anio = fecha.getFullYear(); //obteniendo año
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10
            // @ts-ignore
            //document.getElementById("entity-date").value = anio+"-"+mes+"-"+dia;
            document.getElementById("start-date").value = anio+"-"+mes+"-"+dia;
            // @ts-ignore
            document.getElementById("end-date").value = anio+"-"+mes+"-"+dia;

            document.getElementById("start-time").value = "00:00";
            document.getElementById("end-time").value = "23:59";

            const _closeButton = document.getElementById('close');
            const exportButton = document.getElementById('export-data');
            const statusExport = document.getElementById('status-export');
            const exportFormat = document.getElementById('export-format');
            const flipImage = document.getElementById('entity-flip-image');

            exportFormat.addEventListener('change', () => {
                const flipContainer = document.getElementById('flip-image-container');
                if (exportFormat.value === 'excel') {
                    flipContainer.style.display = 'none';
                } else {
                    flipContainer.style.display = 'block';
                }
            });

            let onPressed = false;
            exportButton.addEventListener('click', async () => {
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
                    }
                    else if (statusExport.value == 'NoMarcadas') {
                        status = true;
                        conditionStatus = '=';
                    }
                    const messageTotal = document.getElementById("export-total");
                    const messageExport = document.getElementById("message-export");
                    const messageLabel = document.getElementById("export-status-label");
                    const progressBarContainer = document.getElementById("progress-bar-container");
                    const progressBar = document.getElementById("progress-bar");
                    const timeContainer = document.getElementById("time-container");
                    const timeEstimate = document.getElementById("time-estimate");
                    const errorLog = document.getElementById("error-log");
                    const errorContainer = document.getElementById("error-container");
                    const _closeButton = document.getElementById('cancel');
                    _closeButton.onclick = () => {
                        onPressed = false;
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
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

                    const checkEmail = { checked: false };
                    const checkAllCustomers = { checked: false };

                    let rawToExport = (offset) => {
                        let rawExport = JSON.stringify({
                            "filter": {
                                "conditions": [
                                    {
                                        "property": `customer.id`,
                                        "operator": "=",
                                        "value": `${customerId}`
                                    },
                                    {
                                        "property": "routine.id",
                                        "operator": `=`,
                                        "value": `${entityId}`
                                    },
                                    {
                                        "property": "routineState.name",
                                        "operator": `${conditionStatus}`,
                                        "value": `${status ? 'No cumplido' : ""}`
                                    },
                                    {
                                        "property": "creationDate",
                                        "operator": ">=",
                                        "value": `${_values.start.value}`
                                    },
                                    {
                                        "property": "creationDate",
                                        "operator": "<=",
                                        "value": `${_values.end.value}`
                                    },
                                    ...timeConditions
                                ],
                            },
                            sort: `-createdDate`,
                            limit: Config.limitExport,
                            offset: offset,
                            fetchPlan: 'full',
                        });
                        return rawExport;
                    };
                        let rawExport = rawToExport(0);
                        const totalRegisters = await getFilterEntityCount("RoutineRegister", rawExport);
                        if (totalRegisters === undefined) {
                            onPressed = false;
                            errorContainer.style.display = 'block';
                            errorLog.innerHTML += `<div style="margin-bottom: 4px; color: #721c24; background: #f8d7da; padding: 4px 8px; border-radius: 4px; border: 1px solid #f5c6cb;">
                                <i class="fa-solid fa-circle-xmark"></i> Ocurrió un error al exportar.
                            </div>`;
                            messageLabel.innerText = "Error en el proceso";
                            const cancelButton = document.getElementById('cancel');
                            if (cancelButton) cancelButton.innerText = "Cerrar Ventana";
                        }
                        else if (totalRegisters === 0) {
                            onPressed = false;
                            errorContainer.style.display = 'block';
                            errorLog.innerHTML += `<div style="margin-bottom: 4px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
                                <i class="fa-solid fa-file-circle-xmark"></i> No hay ningún registro para exportar.
                            </div>`;
                            messageLabel.innerText = "Sin registros";
                            const cancelButton = document.getElementById('cancel');
                            if (cancelButton) cancelButton.innerText = "Cerrar Ventana";
                        }
                        else {
                            progressBarContainer.style.display = 'block';
                            messageLabel.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> Obteniendo registros...`;
                            const users = await getDetails('routine.id', entityId, 'RoutineUser');
                            messageTotal.innerText = `0 / ${totalRegisters}`;
                            const pages = Math.ceil(totalRegisters / Config.limitExport);
                            let array = [];
                            let registers = [];
                            let offset = 0;
                            for (let i = 0; i < pages; i++) {
                                if (onPressed) {
                                    rawExport = rawToExport(offset);
                                    array[i] = await getFilterEntityData("RoutineRegister", rawExport); //await getEvents();
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

                                if (i % 5 === 0 || i === registers.length - 1) {
                                    messageTotal.innerText = `${i + 1} / ${registers.length} registros`;
                                }

                                let image = '';
                                if (exportFormat.value === 'pdf') {
                                    if (register.attachment !== undefined) {
                                        image = await getFile(register.attachment);
                                    }
                                }

                                let obj = {
                                    "cliente": `${register?.customer?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                    "rutina": `${register?.routine?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                    "ubicacion": `${register?.routineSchedule?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                    "inicio": `${_values.start.value} ${_values.startTime.value}`,
                                    "fin": `${_values.end.value} ${_values.endTime.value}`,
                                    "fecha": `${register.creationDate}`,
                                    "hora": `${register.creationTime}`,
                                    "estado": `${register?.routineState?.name ?? ''}`,
                                    "latitud": `${register?.latitude ?? ''}`,
                                    "longitud": `${register?.longitude ?? ''}`,
                                    "cords": `${register?.latitude ?? ''}\n${register?.longitude ?? ''}`,
                                    "usuario": `${register.user?.firstName ?? ''} ${register.user?.lastName ?? ''}`,
                                    "observacion": `${register?.observation?.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim() ?? ''}`,
                                };

                                if (exportFormat.value === 'pdf') {
                                    obj.imagen = image;
                                    obj.imageTag = i + 1;
                                }

                                rows.push(obj);
                                progressBar.style.width = `${50 + ((i + 1) / registers.length) * 50}%`;
                            }

                            // @ts-ignore
                            const customer = await getEntityData('Customer', customerId);

                            if (onPressed) {
                                if (exportFormat.value === 'pdf') {
                                    messageLabel.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Generando documento...`;
                                    messageExport.innerText = `Preparando PDF para ${customer?.name ?? ''}...`;
                                    // @ts-ignore
                                    await exportRoutinePdf2(rows, users, flipImage.checked ? true : false, false, customer?.email ?? '', 1, 1);
                                } else {
                                    messageLabel.innerHTML = `<i class="fa-solid fa-file-excel"></i> Generando Excel...`;
                                    messageExport.innerText = `Preparando archivo para ${customer?.name ?? ''}...`;
                                    // Excel / CSV
                                    let headerInfo = `REPORTE DE RUTINA\n`;
                                    headerInfo += `Cliente:;${customer.name}\n`;
                                    headerInfo += `Periodo:;${_values.start.value} al ${_values.end.value}\n`;
                                    headerInfo += `Horario:;${_values.startTime.value} a ${_values.endTime.value}\n\n`;

                                    let contenido = "\ufeff" + headerInfo + Object.keys(rows[0]).filter(k => !['inicio', 'fin', 'imagen', 'imageTag', 'cords'].includes(k)).join(";") + "\n";
                                    rows.forEach(row => {
                                        contenido += Object.keys(row).filter(k => !['inicio', 'fin', 'imagen', 'imageTag', 'cords'].includes(k)).map(key => String(row[key] ?? "").replace(/[\n\r]+/g, ' ').replace(/;/g, ',').trim()).join(";") + "\n";
                                    });

                                    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement("a");
                                    const d = new Date();
                                    link.href = url;
                                    link.download = `Reporte_Rutina_${customer.name.replace(/\s+/g, '_')}_${d.getDate()}_${d.getMonth() + 1}.csv`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                }
                            }

                            const hasIssues = errorLog.innerHTML !== "";
                            if (hasIssues) {
                                messageLabel.innerText = "Proceso terminado con observaciones";
                                const cancelButton = document.getElementById('cancel');
                                if (cancelButton) cancelButton.innerText = "Cerrar Ventana";
                            } else {
                                const _dialog = document.getElementById('dialog-content');
                                new CloseDialog().x(_dialog);
                            }
                            onPressed = false;
                        }
                    }
                });
            _closeButton.onclick = () => {
                onPressed = false;
                const editor = document.getElementById('entity-editor-container');
                new CloseDialog().x(editor);
            };
        });
    });
}
  ex(){
    const exportRegisters = document.getElementById('ex-entity');
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
        const _dialog = document.getElementById('dialog-content');
        const _checkAllCustomer = document.getElementById('check-allCustomer');
        let onPressed = false;
        exportButton.addEventListener('click', async () => {
            if(!onPressed){
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

                                <div id="error-container" style="display: none;">
                                    <div id="error-log" style="background: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; max-height: 120px; overflow-y: scroll; font-size: 11.5px; line-height: 1.5; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;"></div>
                                </div>
                            </div>

                            <div class="dialog_footer" style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
                                <button class="btn btn_secondary" id="cancel" style="border-radius: 6px; padding: 8px 16px;">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                inputObserver();
                const messageTotal = document.getElementById("export-total");
                const messageExport = document.getElementById("message-export");
                const messageLabel = document.getElementById("export-status-label");
                const progressBar = document.getElementById("progress-bar");
                const errorLog = document.getElementById("error-log");
                const errorContainer = document.getElementById("error-container");
                const _closeButton = document.getElementById('cancel');
                _closeButton.onclick = () => {
                    onPressed = false;
                    const _dialog = document.getElementById('dialog-content');
                    new CloseDialog().x(_dialog);
                };
                let rawToExport=(offset)=>{
                    const raw = JSON.stringify({
                        "filter": {
                            "conditions": [
                                {
                                    "property": `${_checkAllCustomer.checked ? 'business.id' : 'customer.id'}`,
                                    "operator": "=",
                                    "value": `${_checkAllCustomer.checked ? Config.currentUser.business.id : customerId}`
                                },
                                {
                                    "property": "business.state.name",
                                    "operator": "=",
                                    "value": `Enabled`
                                },
                            ]
                        },
                        sort: "+customer.name,+routine.name",
                        limit: Config.limitExport,
                        offset: offset,
                        fetchPlan: 'full',
                    });
                    return raw;
                }
                let rawExport = rawToExport(0);
                const totalRegisters = await getFilterEntityCount("RoutineSchedule", rawExport);
                if(totalRegisters === undefined){
                    onPressed = false;
                    errorContainer.style.display = 'block';
                    errorLog.innerHTML += `<div style="margin-bottom: 4px; color: #721c24; background: #f8d7da; padding: 4px 8px; border-radius: 4px; border: 1px solid #f5c6cb;">
                        <i class="fa-solid fa-circle-xmark"></i> Ocurrió un error al exportar.
                    </div>`;
                    messageLabel.innerText = "Error en el proceso";
                    const cancelButton = document.getElementById('cancel');
                    if (cancelButton) cancelButton.innerText = "Cerrar Ventana";
                }else if(totalRegisters===0){
                    onPressed = false;
                    errorContainer.style.display = 'block';
                    errorLog.innerHTML += `<div style="margin-bottom: 4px; color: #475569; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
                        <i class="fa-solid fa-file-circle-xmark"></i> No hay ningún registro para exportar.
                    </div>`;
                    messageLabel.innerText = "Sin registros";
                    const cancelButton = document.getElementById('cancel');
                    if (cancelButton) cancelButton.innerText = "Cerrar Ventana";
                }else {
                    messageTotal.innerText = `0 / ${totalRegisters}`;
                    const pages = Math.ceil(totalRegisters / Config.limitExport);
                    let array = [];
                    let dataToExport = [];
                    let offset = 0;
                    for(let i = 0; i < pages; i++){
                        if(onPressed){
                            rawExport = rawToExport(offset);
                            array[i] = await getFilterEntityData("RoutineSchedule", rawExport); //await getEvents();
                            for(let y=0; y<array[i].length; y++){
                                dataToExport.push({
                                    "Empresa":array[i][y].customer.name,
                                    "Rutina":array[i][y].routine.name,
                                    "Activo":array[i][y].routine.isActive ? "Si" : "No",
                                    "GPS":array[i][y].routine.checkLocation ? "Si" : "No",
                                    "Ubicacion":array[i][y].name,
                                    "Coordenadas":array[i][y].cords,
                                    "Horario":`${array[i][y].scheduleTime} - ${array[i][y].scheduleTimeEnd ?? ''}`,
                                    "Frecuencia":array[i][y].frequency ?? 0,
                                    "Distancia":array[i][y].distance ?? 0
                                });
                            }
                            messageTotal.innerText = `${dataToExport.length} / ${totalRegisters}`;
                            progressBar.style.width = `${(dataToExport.length / totalRegisters) * 100}%`;
                            offset = Config.limitExport + (offset);
                            await sleep(Config.timeOutExport);
                        }
                    }
                
                    generateFileSimpleXls(dataToExport,"Rutinas","csv");
                    const hasIssues = errorLog.innerHTML !== "";
                    if (hasIssues) {
                        messageLabel.innerText = "Proceso terminado con observaciones";
                        const cancelButton = document.getElementById('cancel');
                        if (cancelButton) cancelButton.innerText = "Cerrar Ventana";
                    } else {
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                    }
                    onPressed = false;
                }
            }
        });
        _closeButton.addEventListener('click', () => {
            new CloseDialog().x(_dialog);
        });     
    });
  }
  
    location() {
      const locationRoutine = document.querySelectorAll('#location-entity');
      locationRoutine.forEach((buttonKey) => {
            buttonKey.addEventListener('click', async () => {
                let entityId = buttonKey.dataset.entityid;
                new Locations().render(Config.offset, Config.currentPage, "", entityId);
            });
        });
  }
  assignGuard() {
    const userRoutine = document.querySelectorAll('#guard-entity');
    userRoutine.forEach((buttonKey) => {
          buttonKey.addEventListener('click', async () => {
              let entityId = buttonKey.dataset.entityid;
              new RoutineUsers().render(Config.offset, Config.currentPage, "", entityId);
          });
      });
}
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            //console.log('close');
            new CloseDialog().x(editor);
        });
    }
}

