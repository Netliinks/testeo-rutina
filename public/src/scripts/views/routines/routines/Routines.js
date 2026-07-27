// @filename: Routines.ts
import { registerEntity, getUserInfo, getEntityData, updateEntity, getFilterEntityData, getFilterEntityCount, deleteEntity, getFile } from "../../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, searchUniversalValue, searchUniversalValueComplex, generateFileSimpleXls, sleep } from "../../../tools.js";
import { Config } from "../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
import { Schedules } from "./schedules/Schedules.js";
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
const currentBusiness = async() => {
  const currentUser = await getUserInfo();
  const userid = await getEntityData('User', `${currentUser.attributes.id}`);
  return userid;
}

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
                        <button class="button" id="edit-entity" data-entityId="${routine.id}" title="Editar">
                          <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="schedule-entity" data-entityId="${routine.id}" title="Configurar horarios">
                          <i class="fa-solid fa-clock"></i>
                        </button>

                        <button class="button" id="guard-entity" data-entityId="${routine.id}" title="Asignar guardias">
                          <i class="fa-solid fa-user-police"></i>
                        </button>

                        <button class="button" id="export-entity" data-entityId="${routine.id}" title="Exportar registros">
                          <i class="fa-solid fa-file-pdf"></i>
                        </button>

                        <button class="button" id="export2-entity" data-entityId="${routine.id}" title="Exportar detalles">
                          <i class="fa-solid fa-file-pdf"></i>
                        </button>

                      <button class="button" id="remove-entity" data-entityId="${routine.id}" title="Eliminar">
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
                        <button class="button" id="edit-entity" data-entityId="${routine.id}" title="Editar">
                          <i class="fa-solid fa-pen"></i>
                        </button>

                        <button class="button" id="schedule-entity" data-entityId="${routine.id}" title="Configurar horarios">
                          <i class="fa-solid fa-clock"></i>
                        </button>

                        <button class="button" id="guard-entity" data-entityId="${routine.id}" title="Asignar guardias">
                          <i class="fa-solid fa-user-police"></i>
                        </button>

                        <button class="button" id="export2-entity" data-entityId="${routine.id}" title="Exportar detalles">
                          <i class="fa-solid fa-file-pdf"></i>
                        </button>

                      <button class="button" id="remove-entity" data-entityId="${routine.id}" title="Eliminar">
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
        this.export();
        this.export2();
        this.remove();
        this.schedules();
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

            <div class="form_input">
                <label for="entity-description" class="form_label">Descripción:</label>
                <textarea id="entity-description" class="input_textarea" rows="4"></textarea>
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
                const businessData = await currentBusiness();
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    description: document.getElementById('entity-description'),
                    active: document.getElementById('entity-active'),
                    checkLocation: document.getElementById('entity-checkLocation')
                };
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.trim().toUpperCase()}`,
                    "description": `${inputsCollection.description.value.trim()}`,
                    "business": {
                        "id": `${businessData.business.id}`},
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

            <div class="form_input">
                <label for="entity-description" class="form_label">Descripción:</label>
                <textarea id="entity-description" class="input_textarea" rows="4">${data?.description ?? ''}</textarea>
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
              description: document.getElementById('entity-description'),
              // @ts-ignore
              active: document.getElementById('entity-active'),
              checkLocation: document.getElementById('entity-checkLocation')
          };
            updateButton.addEventListener('click', () => {
              let raw = JSON.stringify({
                  // @ts-ignore
                  "name": `${$value.name.value.trim().toUpperCase()}`,
                  "description": `${$value.description.value.trim()}`,
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
          remove.addEventListener('click', async () => {
              const checkRaw = JSON.stringify({
                  "filter": {
                      "conditions": [
                          {
                              "property": "routine.id",
                              "operator": "=",
                              "value": `${entityId}`
                          }
                      ]
                  }
              });
              const count = await getFilterEntityCount("RoutineRelation", checkRaw);
              if (count > 0) {
                  alert("No se puede eliminar la rutina porque tiene asignaciones en la planificación.");
                  return;
              }
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
                  const locations = await searchUniversalValue('routine.id', '=', entityId, 'RoutineSchedule');
                  if(locations.length != 0 && locations != undefined){
                    for(let i=0; i<locations.length; i++){
                      /*let raw = JSON.stringify({
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
                      }*/
                      deleteEntity('RoutineSchedule', locations[i].id);
                    }
                  }

                  const guards = await searchUniversalValue('routine.id', '=', entityId, 'RoutineUser');
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
  export(){
    const exportRegisters = document.querySelectorAll('#export-entity');
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
                      <label for="status-export">Estados de rutina</label>
                      <br>
                      <br>
                      <select name="status-export" id="status-export">
                          <option value="Todos" selected>Todos</option>
                          <option value="Marcadas">Marcadas</option>
                          <option value="NoMarcadas">No Marcadas</option>
                      </select>
                  </div>
                  <br>
                  <br>
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

          document.getElementById("start-date").value = anio+"-"+mes+"-"+dia;
          document.getElementById("end-date").value = anio+"-"+mes+"-"+dia;
          const _closeButton = document.getElementById('close');
          const exportButton = document.getElementById('export-data');
          const statusExport = document.getElementById('status-export');
          let onPressed = false;
          exportButton.addEventListener('click', async() => {
              if(!onPressed){
                  onPressed = true;
                  this.dialogContainer.style.display = 'block';
                  this.dialogContainer.innerHTML = `
                  <div class="dialog_content" id="dialog-content">
                      <div class="dialog">
                          <div class="dialog_container padding_8">
                              <div class="dialog_header">
                                  <h2>Exportando...</h2>
                              </div>

                              <div class="dialog_message padding_8">
                                  <div class="material_input">
                                      <input type="text" id="export-total" class="input_filled" value="..." readonly>
                                      <label for="export-total"><i class="fa-solid fa-cloud-arrow-down"></i>Obteniendo datos</label>
                                  </div>

                                  <div class="input_detail">
                                      <label for="message-export"><i class="fa-solid fa-file-export"></i></label>
                                      <p id="message-export" class="input_filled" readonly></p>
                                  </div>
                              </div>

                              <div class="dialog_footer">
                                  <button class="btn btn_primary" id="cancel">Cancelar</button>
                              </div>
                          </div>
                      </div>
                  </div>
                  `;
                  inputObserver();
                  let status = false;
                  let conditionStatus = '<>';
                  if(statusExport.value == 'Marcadas'){
                      status = true;
                  }else if(statusExport.value == 'NoMarcadas'){
                      status = true;
                      conditionStatus = '=';
                  }
                  const message1 = document.getElementById("export-total");
                  const message2 = document.getElementById("message-export");
                  const _closeButton = document.getElementById('cancel');
                  _closeButton.onclick = () => {
                      onPressed = false;
                      const _dialog = document.getElementById('dialog-content');
                      new CloseDialog().x(_dialog);
                  };
                  const _values = {
                      start: document.getElementById('start-date'),
                      end: document.getElementById('end-date'),
                  }
                  //console.log(_values.start.value)
                  //console.log(_values.end.value)
                  //const headers = ['Título', 'Contenido', 'Autor', 'Fecha', 'Hora']
                  let rawToExport=(offset)=>{
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
                                      "property": "creationDate",
                                      "operator": ">=",
                                      "value": `${_values.start.value}`
                                  },
                                  {
                                      "property": "creationDate",
                                      "operator": "<=",
                                      "value": `${_values.end.value}`
                                  },
                                  {
                                      "property": "routineState.name",
                                      "operator": `${conditionStatus}`,
                                      "value": `${status ? 'No cumplido' : ""}`
                                  }
                              ],
                          },
                          sort: `-createdDate`,
                          limit: Config.limitExport,
                          offset: offset,
                          fetchPlan: 'full',
                      });
                      return rawExport;
                  }
                  let rawExport = rawToExport(0);
                  const totalRegisters = await getFilterEntityCount("RoutineRegister", rawExport);
                  if(totalRegisters === undefined){
                      onPressed = false;
                      const _dialog = document.getElementById('dialog-content');
                      new CloseDialog().x(_dialog);
                      alert("Ocurrió un error al exportar");
                  }else if(totalRegisters===0){
                      onPressed = false;
                      const _dialog = document.getElementById('dialog-content');
                      new CloseDialog().x(_dialog);
                      alert("No hay ningún registro");  
                  }else {
                      message1.value = `0 / ${totalRegisters}`;
                      const pages = Math.ceil(totalRegisters / Config.limitExport);
                      let array = [];
                      let registers = [];
                      let offset = 0;
                      for(let i = 0; i < pages; i++){
                          if(onPressed){
                              rawExport = rawToExport(offset);
                              array[i] = await getFilterEntityData("RoutineRegister", rawExport); //await getEvents();
                              for(let y=0; y<array[i].length; y++){
                                  registers.push(array[i][y]);
                              }
                              message1.value = `${registers.length} / ${totalRegisters}`;
                              offset = Config.limitExport + (offset);
                              await sleep(Config.timeOutExport);
                          }
                      }
                      message2.innerText = `Generando archivo pdf,\nesto puede tomar un momento.`;
                      let rows = [];
                      for (let i = 0; i < registers.length; i++) {
                        let register = registers[i];
                        // @ts-ignore
                        //if (noteCreationDate >= _values.start.value && noteCreationDate <= _values.end.value) {
                            let image = '';
                            if (register.attachment !== undefined) {
                                image = await getFile(register.attachment);
                            }
                            let obj = {
                                "rutina": `${register?.routine?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                "ubicacion": `${register?.routineSchedule?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                "fecha": `${register.creationDate}`,
                                "hora": `${register.creationTime}`,
                                "estado": `${register?.routineState?.name ?? ''}`,
                                "cords": `${register?.cords ?? ''}`,
                                "cords2": `${register?.routineSchedule?.cords ?? ''}`,
                                "usuario": `${register.user?.firstName ?? ''} ${register.user?.lastName ?? ''}`,
                                "observacion": `${register?.observation?.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim() ?? ''}`,
                                "imagen": `${image}`
                            };
                            rows.push(obj);
                        //}
                      }
                      // @ts-ignore
                      await exportRoutinePdf(rows, _values.start.value, _values.end.value);
                      const _dialog = document.getElementById('dialog-content');
                      new CloseDialog().x(_dialog);
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
                        <option value="Todos" selected>Todos</option>
                        <option value="Marcadas">Marcadas</option>
                        <option value="NoMarcadas">No Marcadas</option>
                    </select>
                </div>
                <br>
                <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-flip-image"> Girar Imágenes (hacia la derecha)</label>
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
            const _closeButton = document.getElementById('close');
            const exportButton = document.getElementById('export-data');
            const statusExport = document.getElementById('status-export');
            const flipImage = document.getElementById('entity-flip-image');
            let onPressed = false;
            exportButton.addEventListener('click', async () => {
                if (!onPressed) {
                    onPressed = true;
                    this.dialogContainer.style.display = 'block';
                    this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Exportando...</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="material_input">
                                    <input type="text" id="export-total" class="input_filled" value="..." readonly>
                                    <label for="export-total"><i class="fa-solid fa-cloud-arrow-down"></i>Obteniendo datos</label>
                                </div>

                                <div class="input_detail">
                                    <label for="message-export"><i class="fa-solid fa-file-export"></i></label>
                                    <p id="message-export" class="input_filled" readonly></p>
                                </div>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_primary" id="cancel">Cancelar</button>
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
                    const message1 = document.getElementById("export-total");
                    const message2 = document.getElementById("message-export");
                    const _closeButton = document.getElementById('cancel');
                    _closeButton.onclick = () => {
                        onPressed = false;
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                    };
                    const _values = {
                        start: document.getElementById('start-date'),
                        end: document.getElementById('end-date'),
                    };
                    //console.log(_values.start.value)
                    //console.log(_values.end.value)
                    //const headers = ['Título', 'Contenido', 'Autor', 'Fecha', 'Hora']
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
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                        alert("Ocurrió un error al exportar");
                    }
                    else if (totalRegisters === 0) {
                        onPressed = false;
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
                        alert("No hay ningún registro");
                    }
                    else {
                        const data = await getEntityData('Routine', entityId);
                        const users = await searchUniversalValueComplex('routine.id', '=', entityId, 'RoutineUser');
                        message1.value = `0 / ${totalRegisters}`;
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
                                message1.value = `${registers.length} / ${totalRegisters}`;
                                offset = Config.limitExport + (offset);
                                await sleep(Config.timeOutExport);
                            }
                        }
                        message2.innerText = `Generando archivo pdf,\nesto puede tomar un momento.`;
                        let rows = [];
                        for (let i = 0; i < registers.length; i++) {
                            let register = registers[i];
                            // @ts-ignore
                            //if (noteCreationDate >= _values.start.value && noteCreationDate <= _values.end.value) {
                            let image = '';
                            if (register.attachment !== undefined) {
                                image = await getFile(register.attachment);
                            }
                            let obj = {
                                //"code": `${data?.customer?.docRoutineCode ?? ''}`,
                                //"version": `${data?.customer?.docRoutineVersion ?? ''}`,
                                //"date": `${data?.customer?.docRoutineDateApproval ?? ''}`,
                                "rutina": `${register?.routine?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                "cliente": `${register?.customer?.name.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim()}`,
                                //"status": `${data?.routineState?.name ?? ''}`,
                                "creado": `${data?.creationDate ?? ''} ${data?.creationTime ?? ''}`,
                                "creadopor": `${data?.user?.firstName ?? ''} ${data?.user?.lastName ?? ''}`,
                                "inicio": `${_values.start.value}`,
                                "fin": `${_values.end.value}`,
                                //"inicio": `${data?.startDate ?? ''} ${data?.startTime ?? ''}`,
                                //"iniciopor": `${data?.startUserId?.firstName ?? ''} ${data?.startUserId?.lastName ?? ''}`,
                                //"fin": `${data?.endDate ?? ''} ${data?.endTime ?? ''}`,
                                //"finpor": `${data?.endUserId?.firstName ?? ''} ${data?.endUserId?.lastName ?? ''}`,
                                "fecha": `${register.creationDate}`,
                                "hora": `${register.creationTime}`,
                                "estado": `${register?.routineState?.name ?? ''}`,
                                "cords": `${register?.latitude ?? ''}\n${register?.longitude ?? ''}`,
                                "usuario": `${register.user?.firstName ?? ''} ${register.user?.lastName ?? ''}`,
                                "observacion": `${register?.observation?.split("\n").join(". ").replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim() ?? ''}`,
                                //"pedido": `${data?.noOrder ?? ''}`,
                                //"guia": `${data?.noGuide ?? ''}`,
                                //"supervisor": `${data?.supervisorId?.firstName ?? ''} ${data?.supervisorId?.lastName ?? ''} ${data?.supervisorId?.secondLastName ?? ''}`,
                                "imagen": `${image}`,
                                "imageTag": `${i + 1}`
                            };
                            rows.push(obj);
                            //}
                        }
                        // @ts-ignore
                        await exportRoutinePdf2(rows, users, flipImage.checked ? true : false);
                        const _dialog = document.getElementById('dialog-content');
                        new CloseDialog().x(_dialog);
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
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Exportando...</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="material_input">
                                    <input type="text" id="export-total" class="input_filled" value="..." readonly>
                                    <label for="export-total"><i class="fa-solid fa-cloud-arrow-down"></i>Obteniendo datos</label>
                                </div>

                                <div class="input_detail">
                                    <label for="message-export"><i class="fa-solid fa-file-export"></i></label>
                                    <p id="message-export" class="input_filled" readonly></p>
                                </div>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_primary" id="cancel">Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
                inputObserver();
                const message1 = document.getElementById("export-total");
                const message2 = document.getElementById("message-export");
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
                    const _dialog = document.getElementById('dialog-content');
                    new CloseDialog().x(_dialog);
                    alert("Ocurrió un error al exportar");
                }else if(totalRegisters===0){
                    onPressed = false;
                    const _dialog = document.getElementById('dialog-content');
                    new CloseDialog().x(_dialog);
                    alert("No hay ningún registro");  
                }else {
                    message1.value = `0 / ${totalRegisters}`;
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
                            message1.value = `${dataToExport.length} / ${totalRegisters}`;
                            offset = Config.limitExport + (offset);
                            await sleep(Config.timeOutExport);
                        }
                    }
                
                    generateFileSimpleXls(dataToExport,"Rutinas","csv");
                    const _dialog = document.getElementById('dialog-content');
                    new CloseDialog().x(_dialog);
                    onPressed = false;
                }
            }
        });
        _closeButton.addEventListener('click', () => {
            new CloseDialog().x(_dialog);
        });     
    });
  }
  
    schedules() {
      const scheudleRoutine = document.querySelectorAll('#schedule-entity');
      scheudleRoutine.forEach((buttonKey) => {
            buttonKey.addEventListener('click', async () => {
                let entityId = buttonKey.dataset.entityid;
                new Schedules().render(Config.offset, Config.currentPage, "", entityId);
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

