// @filename: Schedules.ts
import { deleteEntity, getEntitiesData, registerEntity, updateEntity, getEntityData, getFilterEntityData, getFilterEntityCount, getUserInfo } from "../../../../endpoints.js";
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, getDetails, equivalentTime } from "../../../../tools.js";
import { Config } from "../../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let infoPage = {
  count: 0,
  offset: Config.offset,
  currentPage: currentPage,
  search: ""
};
let dataPage;
let routine;
const currentBusiness = async() => {
    const currentUser = await getUserInfo();
    const userid = await getEntityData('User', `${currentUser.attributes.id}`);
    return userid;
  }
const getSchedules = async (routineId) => {
    //nombre de la entidad
    /*const location = await getEntitiesData('Location');
    const FCustomer = location.filter((data) => `${data.customer?.id}` === `${customerId}`);
    return FCustomer;*/
    routine = await getEntityData("Routine", routineId)
    let raw = JSON.stringify({
      "filter": {
          "conditions": [
              {
                  "property": "customer.id",
                  "operator": "=",
                  "value": `${customerId}`
              },
              {
                "property": "routine.id",
                "operator": "=",
                "value": `${routineId}`
              },
          ],
      },
      sort: "-createdDate",
      limit: Config.tableRows,
      offset: infoPage.offset,
      //fetchPlan: 'full',
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
                  },
                  {
                    "property": "routine.id",
                    "operator": "=",
                    "value": `${routine.id}`
                  },
              ]
          },
          sort: "-createdDate",
          limit: Config.tableRows,
          offset: infoPage.offset,
          //fetchPlan: 'full',
      });
  }
  infoPage.count = await getFilterEntityCount("RoutineSchedule", raw);
  dataPage = await getFilterEntityData("RoutineSchedule", raw);
  return dataPage;
};
export class Schedules {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', () => {
                /*const arrayData = data.filter((user) => `${user.name}`
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
              new Schedules().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim(), routine.id);
            });
        };
    }

    async render(offset, actualPage, search, routineId) {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        const subtitle = document.getElementById('datatable_subtitle')  
        tableBody.innerHTML = '.Cargando...';
        let data = await getSchedules(routineId);
        subtitle.innerText = `Rutina: ${routine.name}`
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody /*, data*/);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, infoPage.currentPage);
    }

    load(table, currentPage, data) {
        //createRoutines('INS', routine.id, null);
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
                let schedule = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${schedule?.name ?? ''}</td>
          <td>${schedule?.scheduleTime ?? ''} - ${schedule?.scheduleTimeEnd ?? ''}</td>
          <td>${schedule?.midnightCheck ? 'Sí' : 'No'}</td>
          <td>${schedule?.isActive ? 'Sí' : 'No'}</td>
          <td>${schedule?.checkLocation ? 'Sí' : 'No'}</td>
          <td>${schedule?.weekDay ?? ''}</td>
          <td>${schedule?.weekCheck ? 'Sí' : 'No'}</td>
          <td class="entity_options">
          <button class="button" id="edit-entity" data-entityId="${schedule.id}">
            <i class="fa-solid fa-pen"></i>
          </button>
            <button class="button" id="remove-entity" data-entityId="${schedule.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;
                table.appendChild(row);
            }
        }
        this.register();
        this.edit(this.entityDialogContainer, data);
        //this.selectModal();
        this.remove();

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
                currentPage = page;
                new Schedules().render(infoPage.offset, currentPage, infoPage.search, routine.id);
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
              new Schedules().render(Config.offset, Config.currentPage, infoPage.search, routine.id);
          });
          nextButton.addEventListener('click', () => {
              infoPage.offset = Config.tableRows * (pageCount - 1);
              new Schedules().render(infoPage.offset, pageCount, infoPage.search, routine.id);
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
            let fecha = new Date(); //Fecha actual
            let mes = fecha.getMonth()+1; //obteniendo mes
            let dia = fecha.getDate(); //obteniendo dia
            let anio = fecha.getFullYear(); //obteniendo año
            let _hours = fecha.getHours();
            let _minutes = fecha.getMinutes();
            let _fixedHours = ('0' + _hours).slice(-2);
            let _fixedMinutes = ('0' + _minutes).slice(-2);
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-clock"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Horario</small></h1>
            </div>
            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>
          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre del Horario</label>
            </div>
            <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="entity-scheduleTime">Inicio:</label>
                    <input type="time" class="input_time input_time-start" id="entity-scheduleTime" name="entity-scheduleTime" value="${_fixedHours}:${_fixedMinutes}">
                </div>

                <div class="form_input">
                    <label class="form_label" for="entity-scheduleTimeEnd">Fin:</label>
                    <input type="time" class="input_time input_time-end" id="entity-scheduleTimeEnd" name="entity-scheduleTimeEnd" value="${_fixedHours}:${_fixedMinutes}">
                </div>
            </div>

            <br>
            <div class="input_checkbox_group" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                <label class="form_label">Configuración:</label>
                <div class="input_checkbox">
                    <label><input type="checkbox" id="entity-isActive" checked> Activo</label>
                </div>
                <div class="input_checkbox">
                    <label><input type="checkbox" id="entity-checkLocation" checked> Validar Ubicación</label>
                </div>
                <div class="input_checkbox">
                    <label><input type="checkbox" id="entity-weekCheck"> Repetir Semanal</label>
                </div>
            </div>

            <div class="form_input" style="margin-bottom: 24px;">
              <label class="form_label">Días de la semana:</label>
              <div class="checkbox_grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="LUNES"> Lunes</label></div>
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="MARTES"> Martes</label></div>
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="MIERCOLES"> Miércoles</label></div>
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="JUEVES"> Jueves</label></div>
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="VIERNES"> Viernes</label></div>
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="SABADO"> Sábado</label></div>
                <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="DOMINGO"> Domingo</label></div>
              </div>
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
            registerButton.addEventListener('click', async () => {
                const businessData = await currentBusiness();
                const weekDaySelected = Array.from(document.querySelectorAll('input[name="weekDay"]:checked')).map(cb => cb.value);
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    scheduleTime: document.getElementById('entity-scheduleTime'),
                    scheduleTimeEnd: document.getElementById('entity-scheduleTimeEnd'),
                    isActive: document.getElementById('entity-isActive'),
                    checkLocation: document.getElementById('entity-checkLocation'),
                    weekCheck: document.getElementById('entity-weekCheck'),
                };

                const timeIni = inputsCollection.scheduleTime.value.split(':');
                const hourIni = parseInt(timeIni[0].trim());
                const minIni = parseInt(timeIni[1].trim());
                const timeEnd = inputsCollection.scheduleTimeEnd.value.split(':');
                const hourEnd = parseInt(timeEnd[0].trim());
                const minEnd = parseInt(timeEnd[1].trim());
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.trim().toUpperCase()}`,
                    "isActive": inputsCollection.isActive.checked,
                    "checkLocation": inputsCollection.checkLocation.checked,
                    "weekCheck": inputsCollection.weekCheck.checked,
                    "weekDay": weekDaySelected.join(', '),
                    "business": {
                        "id": `${businessData.business.id}`
                    },
                    "customer": {
                        "id": `${customerId}`
                    },
                    "routine": {
                    "id": `${routine.id}`
                    },
                    'scheduleTime': `${inputsCollection.scheduleTime.value}`,
                    'scheduleTimeEnd': `${inputsCollection.scheduleTimeEnd.value}`,
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().timeHHMMSS}`,
                });
                if(inputsCollection.name.value.trim() == "" || inputsCollection.name.value == undefined){
                    alert("Nombre de Ubicación vacía");
                }else if(routine.id == '' || routine.id == null || routine.id == undefined){
                    alert("No hay rutina");
                }else if(hourIni == hourEnd && minIni > minEnd){
                    alert("Minutos iniciales no pueden ser mayores a las del final en horas iguales.");
                }else if(weekDaySelected.length <= 0){
                    alert("Debe seleccionar al menos un día de la semana.");
                }else{
                    registerEntity(raw, 'RoutineSchedule');
                setTimeout(() => {
                    const container = document.getElementById('entity-editor-container');
                    new CloseDialog().x(container);
                    new Schedules().render(Config.offset, Config.currentPage, infoPage.search, routine.id);
                }, 1000);
                }
            });
            }
    }
    edit(container, data) {

      const edit = document.querySelectorAll('#edit-entity');
      edit.forEach((edit) => {
          const entityId = edit.dataset.entityid;
          edit.addEventListener('click', () => {
              RInterface('RoutineSchedule', entityId);
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
            <div class="avatar"><i class="fa-solid fa-clock"></i></div>
            <h1 class="entity_editor_title">Editar <br><small>Horario</small></h1>
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
                <label for="entity-name">Nombre del Horario</label>
              </div>
              <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="entity-scheduleTime">Inicio:</label>
                    <input type="time" class="input_time input_time-start" id="entity-scheduleTime" name="entity-scheduleTime" value="${data?.scheduleTime ?? ''}">
                </div>

                <div class="form_input">
                    <label class="form_label" for="entity-scheduleTimeEnd">Fin:</label>
                    <input type="time" class="input_time input_time-end" id="entity-scheduleTimeEnd" name="entity-scheduleTimeEnd" value="${data?.scheduleTimeEnd ?? ''}">
                </div>
              </div>

              <br>
              <div class="input_checkbox_group" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                  <label class="form_label">Configuración:</label>
                  <div class="input_checkbox">
                      <label><input type="checkbox" id="entity-isActive" ${data?.isActive ? 'checked' : ''}> Activo</label>
                  </div>
                  <div class="input_checkbox">
                      <label><input type="checkbox" id="entity-checkLocation" ${data?.checkLocation ? 'checked' : ''}> Validar Ubicación</label>
                  </div>
                  <div class="input_checkbox">
                      <label><input type="checkbox" id="entity-weekCheck" ${data?.weekCheck ? 'checked' : ''}> Repetir Semanal</label>
                  </div>
                  <div class="input_checkbox" style="background-color: #f8f9fa; padding: 8px; border-radius: 4px;">
                      <label style="color: #6c757d;"><input type="checkbox" id="entity-midnightCheck" ${data?.midnightCheck ? 'checked' : ''} disabled> Cruza medianoche (Informativo)</label>
                  </div>
              </div>

              <div class="form_input" style="margin-bottom: 24px;">
                <label class="form_label">Días de la semana:</label>
                <div class="checkbox_grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="LUNES" ${data?.weekDay?.includes('LUNES') ? 'checked' : ''}> Lunes</label></div>
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="MARTES" ${data?.weekDay?.includes('MARTES') ? 'checked' : ''}> Martes</label></div>
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="MIERCOLES" ${data?.weekDay?.includes('MIERCOLES') ? 'checked' : ''}> Miércoles</label></div>
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="JUEVES" ${data?.weekDay?.includes('JUEVES') ? 'checked' : ''}> Jueves</label></div>
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="VIERNES" ${data?.weekDay?.includes('VIERNES') ? 'checked' : ''}> Viernes</label></div>
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="SABADO" ${data?.weekDay?.includes('SABADO') ? 'checked' : ''}> Sábado</label></div>
                  <div class="input_checkbox"><label><input type="checkbox" name="weekDay" value="DOMINGO" ${data?.weekDay?.includes('DOMINGO') ? 'checked' : ''}> Domingo</label></div>
                </div>
              </div>
        </div>
        <!-- END EDITOR BODY -->
        <div class="entity_editor_footer">
          <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
        </div>
      </div>
    `;

          inputObserver();
          this.close();
          UUpdate(entityID, data);
      };

      const UUpdate = async (entityId, data) => {
          const updateButton = document.getElementById('update-changes');
          const $value = {
            // @ts-ignore
            name: document.getElementById('entity-name'),
            scheduleTime: document.getElementById('entity-scheduleTime'),
            scheduleTimeEnd: document.getElementById('entity-scheduleTimeEnd'),
            // @ts-ignore
            isActive: document.getElementById('entity-isActive'),
            checkLocation: document.getElementById('entity-checkLocation'),
            weekCheck: document.getElementById('entity-weekCheck'),
          };
          updateButton.addEventListener('click', () => {
            const weekDaySelected = Array.from(document.querySelectorAll('input[name="weekDay"]:checked')).map(cb => cb.value);
            const timeIni = $value.scheduleTime.value.split(':');
            const hourIni = parseInt(timeIni[0].trim());
            const minIni = parseInt(timeIni[1].trim());
            const timeEnd = $value.scheduleTimeEnd.value.split(':');
            const hourEnd = parseInt(timeEnd[0].trim());
            const minEnd = parseInt(timeEnd[1].trim());
            let raw = JSON.stringify({
                // @ts-ignore
                "name": `${$value.name.value.trim().toUpperCase()}`,
                // @ts-ignore
                "scheduleTime": `${$value.scheduleTime.value}`,
                "scheduleTimeEnd": `${$value.scheduleTimeEnd.value}`,
                "isActive": $value.isActive.checked,
                "checkLocation": $value.checkLocation.checked,
                "weekCheck": $value.weekCheck.checked,
                "weekDay": weekDaySelected.join(', '),
            });
            if($value.name.value.trim() == "" || $value.name.value == undefined){
                alert("Nombre de Ubicación vacía");
            }else if(hourIni == hourEnd && minIni > minEnd){
                alert("Minutos iniciales no pueden ser mayores a las del final en horas iguales.");
            }else if(weekDaySelected.length <= 0){
                alert("Debe seleccionar al menos un día de la semana.");
            }else{
                update(raw);
            }
          });
          const update = (raw) => {
            updateEntity('RoutineSchedule', entityId, raw)
                .then((res) => {
                setTimeout(async () => {
                    let tableBody;
                    let container;
                    new CloseDialog()
                        .x(container =
                        document.getElementById('entity-editor-container'));
                    new Schedules().render(infoPage.offset, infoPage.currentPage, infoPage.search, routine.id);
                }, 100);
            });
        };
      };
  }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar esta Ubicación?</h2>
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
          </div>
        `;
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = async () => {
                    //createRoutines('DLT', null, entityId);
                    deleteEntity('RoutineSchedule', entityId)
                        .then(res => new Schedules().render(infoPage.offset, infoPage.currentPage, infoPage.search, routine.id));
                    new CloseDialog().x(dialogContent);
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
    /*selectModal() {
      // register entity
      const view = document.querySelectorAll('#view-entity');
      view.forEach((element) => {
        const entityId = element.dataset.entityid;
        element.addEventListener('click', () => {
          modalTable(0, entityId);
        });
      });
      async function modalTable(offset, id) {
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
        if (dataModal.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
                  <td>No hay datos</td>
                  <td></td>
                  <td></td>
              `;
            datetableBody.appendChild(row);
        }
        else {
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
            modalTable(offset, id);
        };
        prevModalButton.onclick = () => {
            if(offset > 0){
              offset = offset - Config.modalRows;
              modalTable(offset, id);
            }
        };
    }

  }*/
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            console.log('close');
            new CloseDialog().x(editor);
        });
    }
}
/*const agregarCero = (valor) => {
  valor < 10 ? valor = "0"+valor : valor;
  return valor;
}

const createRoutines = async (mode, routineId, scheduleId) => {
  const insertTimes = (ubications) => {
    const schedules = calculoTimes(ubications);
    schedules.forEach(async (schedule) => {
      const raw = JSON.stringify({ 
        "business": {
            "id": `${ubications.business.id}`
        },                 
        "customer": {
            "id": `${customerId}`
        },
        "routine": {
          "id": `${routineId}`
        },
        "routineSchedule": {
          "id": `${ubications.id}`
        },
        'routineTimePoint': `${schedule}`
      });
      registerEntity(raw, 'RoutineTime');
    });
    
  }

  const deleteTimes = (times) => {
    for(let i=0; i<times.length; i++){
      deleteEntity('RoutineTime', times[i].id);
    }
  }

  const calculoTimes = (ubications) => {
    let timesResults = [];
    const timeIni = ubications.scheduleTime.split(":");
    const timeEnd = ubications.scheduleTimeEnd.split(":");
    timesResults.push(ubications.scheduleTime);
    let minAdd = timeIni[1];
    let minRest = 0;
    let hourAdd = 0;
    let validators; 
    let releaseHour = false;
    let releaseMin = false;
    let exceed = false;
    let i = 0;
    do {
      minAdd = parseInt(minAdd) + 30; // Use default or fixed frequency if needed, though the prompt implies frequency is gone.
      if(exceed){
        releaseHour = true;
        releaseMin = true;
      }else{
        validators = timesResults[i].split(":");
        if(((equivalentTime(timeEnd[0]) == equivalentTime(validators[0])) && releaseHour == false)){
          releaseHour = true;
        }
      }

      if(releaseHour == true && (minAdd > parseInt(timeEnd[1]))){
        releaseMin = true;
      }else{
        if(parseInt(minAdd) > 59){
            minRest = minAdd - 60; //minutos restantes
            hourAdd += 1;
            minAdd = minRest;

            if((parseInt(timeIni[0]) + hourAdd) > 24){

              if(((parseInt(timeIni[0]) + hourAdd)-24)==parseInt(timeEnd[0]) && minRest > parseInt(timeEnd[1])){
                exceed = true;
              }else{
                timesResults.push(agregarCero((parseInt(timeIni[0]) + hourAdd)-24)+":"+agregarCero(minRest)+":00");
              }
              
              
            }else if((parseInt(timeIni[0]) + hourAdd) == 24){
              
              if((equivalentTime(parseInt(timeIni[0]) + hourAdd))==parseInt(timeEnd[0]) && minRest > parseInt(timeEnd[1])){
                exceed = true;
              }else{
                timesResults.push(agregarCero(equivalentTime(parseInt(timeIni[0]) + hourAdd))+":"+agregarCero(minRest)+":00");
              }
            
            }else{
  
              if((parseInt(timeIni[0]) + hourAdd)==parseInt(timeEnd[0]) && minRest > parseInt(timeEnd[1])){
                exceed = true;
              }else{
                timesResults.push(agregarCero(parseInt(timeIni[0]) + hourAdd)+":"+agregarCero(minRest)+":00");
              }
              
            }

        }else{
          if((parseInt(timeIni[0]) + hourAdd) > 24){

            if(((parseInt(timeIni[0]) + hourAdd)-24)==parseInt(timeEnd[0]) && minAdd > parseInt(timeEnd[1])){
              exceed = true;
            }else{
              timesResults.push(agregarCero((parseInt(timeIni[0]) + hourAdd)-24)+":"+agregarCero(minAdd)+":00");
            }
          }else if((parseInt(timeIni[0]) + hourAdd) == 24){

            if((equivalentTime(parseInt(timeIni[0]) + hourAdd))==parseInt(timeEnd[0]) && minAdd > parseInt(timeEnd[1])){
              exceed = true;
            }else{
              timesResults.push(agregarCero(equivalentTime(parseInt(timeIni[0]) + hourAdd))+":"+agregarCero(minAdd)+":00");
            }
            
          }else{

            if((parseInt(timeIni[0]) + hourAdd)==parseInt(timeEnd[0]) && minAdd > parseInt(timeEnd[1])){
              exceed = true;
            }else{
              timesResults.push(agregarCero(parseInt(timeIni[0]) + hourAdd)+":"+agregarCero(minAdd)+":00");;
            }
          }
        }
        i+=1;
      }
      
    } while (releaseMin != true);
    return timesResults;
  }

  if(mode == 'INS'){
    let data = await getDetails("routine.id", routineId, "RoutineSchedule");
    data.forEach(async (ubications) => {
      let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                  "property": "routineSchedule.id",
                  "operator": "=",
                  "value": `${ubications.id}`
                },
            ],
        },
        sort: "-createdDate",
      });
      let times = await getFilterEntityData("RoutineTime", raw);
      if(times != undefined && times.length == 0){
        insertTimes(ubications);
      }
    });
  }else if(mode == 'UPD'){
    const data = await getEntityData("RoutineSchedule", scheduleId);
    let raw = JSON.stringify({
      "filter": {
          "conditions": [
              {
                "property": "routineSchedule.id",
                "operator": "=",
                "value": `${scheduleId}`
              },
          ],
      },
      sort: "-createdDate",
    });
    let times = await getFilterEntityData("RoutineTime", raw);
    if(times != undefined && times.length != 0){
      deleteTimes(times);
      insertTimes(data);
    }
  }else if(mode == 'DLT'){
    let raw = JSON.stringify({
      "filter": {
          "conditions": [
              {
                "property": "routineSchedule.id",
                "operator": "=",
                "value": `${scheduleId}`
              },
          ],
      },
      sort: "-createdDate",
    });
    let times = await getFilterEntityData("RoutineTime", raw);
    if(times != undefined && times.length != 0){
      deleteTimes(times);
    }
  }
};*/