// @filename: Customers.ts
import { registerEntity, getUserInfo, getEntityData, updateEntity, getFilterEntityData, getFilterEntityCount } from "../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, searchUniversalSingle2 } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayout, UIContact } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
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

const getCustomers = async () => {
    const currentUser = await currentBusiness();
    let raw = JSON.stringify({
      "filter": {
          "conditions": [
              {
                  "property": "business.id",
                  "operator": "=",
                  "value": `${currentUser.business.id}`
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
                        },
                        {
                            "property": "ruc",
                            "operator": "contains",
                            "value": `${infoPage.search.toLowerCase()}`
                        }
                    ]
                },
                {
                  "property": "business.id",
                  "operator": "=",
                  "value": `${currentUser.business.id}`
                }
            ]
        },
        sort: "-createdDate",
        limit: Config.tableRows,
        offset: infoPage.offset,
        fetchPlan: 'full',
    });
}
  infoPage.count = await getFilterEntityCount("Customer", raw);
  return await getFilterEntityData("Customer", raw);
};
export class Customers {
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
              new Customers().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
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
        let data = await getCustomers();
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
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>No existen datos</td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let customer = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${customer?.name ?? ''}</dt>
          <td>${customer?.ruc ?? ''}</dt>
          <td class="tag"><span>${customer?.state?.name ?? ''}</span></td>
          <td>${customer?.permitMarcation ? 'Si' : 'No'}</td>
          <td>${customer?.permitVehicular ? 'Si' : 'No'}</td>
          <td>${customer?.permitRoutine ? 'Si' : 'No'}</td>
          <td>${customer?.permitVisitStatic ? 'Si' : 'No'}</td>
          <td class="entity_options">
              <button class="button" id="edit-entity" data-entityId="${customer.id}">
                <i class="fa-solid fa-pen"></i>
              </button>

              <button class="button" id="convert-entity" data-entityId="${customer.id}">
                <i class="fa-solid fa-shield"></i>
            </button>
          </dt>
        `;
                table.appendChild(row);
                drawTagsIntoTables();
            }
        }
        this.register();
        this.updateContact();
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
              new Customers().render(infoPage.offset, currentPage, infoPage.search);
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
            new Customers().render(Config.offset, Config.currentPage, infoPage.search);
          });
          nextButton.addEventListener('click', () => {
            infoPage.offset = Config.tableRows * (pageCount - 1);
            new Customers().render(infoPage.offset, pageCount, infoPage.search);
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
              <div class="avatar"><i class="fa-solid fa-briefcase"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Empresa</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre</label>
            </div>

            <div class="material_input">
              <input type="text"
                id="entity-ruc"
                maxlength="13" autocomplete="none">
              <label for="entity-ruc">RUC</label>
            </div>

            <div class="material_input_select">
              <label for="entity-state">Estado</label>
              <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando..." autocomplete="none">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-marcation" checked> Permitir Marcación</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-vehicular"> Permitir Vehicular</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-routine"> Permitir Rutina</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-qr-static"> Permitir QR estático para visita</label>
            </div>

            <br>
            <br>
            <div class="material_input">
              <input type="number"
                id="entity-required-visitemer"
               autocomplete="none" min="0">
              <label for="entity-required-visitemer">Requerido visita emergente</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-vehicular"
               autocomplete="none" min="0">
              <label for="entity-required-vehicular">Requerido ingreso vehicular</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-report"
               autocomplete="none" min="0">
              <label for="entity-required-report">Requerido reportes</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-routine"
               autocomplete="none" min="0">
              <label for="entity-required-routine">Requerido rutinas</label>
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
            inputSelect('State', 'entity-state');
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', async() => {
                const businessData = await currentBusiness();
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    ruc: document.getElementById('entity-ruc'),
                    state: document.getElementById('entity-state'),
                    marcation: document.getElementById('entity-marcation'),
                    vehicular: document.getElementById('entity-vehicular'),
                    routine: document.getElementById('entity-routine'),
                    qrstatic: document.getElementById('entity-qr-static'),
                    reqNroVisitEmer: document.getElementById('entity-required-visitemer'),
                    reqNroVehicle: document.getElementById('entity-required-vehicular'),
                    reqNroReport: document.getElementById('entity-required-report'),
                    reqNroRoutine: document.getElementById('entity-required-routine'),
                };
                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value}`,
                    "business": {
                        "id": `${businessData.business.id}`},
                    "ruc": `${inputsCollection.ruc.value}`,
                    "state": {
                      "id": `${inputsCollection.state.dataset.optionid}`},
                    "firebaseId":`${inputsCollection.name.value}`,
                    "associate":`${businessData.business.name}`,
                    "permitMarcation": `${inputsCollection.marcation.checked ? true : false}`,
                    "permitVehicular": `${inputsCollection.vehicular.checked ? true : false}`,
                    "permitRoutine": `${inputsCollection.routine.checked ? true : false}`,
                    'permitVisitStatic': `${inputsCollection.qrstatic.checked ? true : false}`,
                    'reqNroVisitEmer': `${inputsCollection.reqNroVisitEmer.value ?? 0}`,
                    'reqNroVehicle': `${inputsCollection.reqNroVehicle.value ?? 0}`,
                    'reqNroReport': `${inputsCollection.reqNroReport.value ?? 0}`,
                    'reqNroRoutine': `${inputsCollection.reqNroRoutine.value ?? 0}`,
                });
                const exist = await searchUniversalSingle2('name', 'contains', inputsCollection.name.value, 'business.id', '=', businessData.business.id, 'Customer');
                //const exist = await searchCustomerbyName(inputsCollection.name.value, businessId)
                if(inputsCollection.name.value === '' || inputsCollection.name.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(businessData.business.id == undefined || businessData.business.id == null){
                    alert("¡Id empresa seguridad vacío!")
                }else if(exist == undefined || exist != 'none'){
                    alert("¡Nombre de empresa ya existente o no se ha podido comprobar!")
                }else{
                  registerEntity(raw, 'Customer');
                  setTimeout(() => {
                      const container = document.getElementById('entity-editor-container');
                      new CloseDialog().x(container);
                      new Customers().render(Config.offset, Config.currentPage, infoPage.search);
                  }, 1000);
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
                RInterface('Customer', entityId);
            });
        });
        let locationMapInstance = null;
        const RInterface = async (entities, entityID) => {
            const data = await getEntityData(entities, entityID);
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-regular fa-briefcase"></i></div>
              <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text"
                id="entity-ruc"
                class="input_filled"
                maxlength="10"
                value="${data?.ruc ?? ''}">
              <label for="entity-ruc">RUC</label>
            </div>

            <div class="material_input_select">
              <label for="entity-state">Estado</label>
              <input type="text" id="entity-state" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-marcation"> Permitir Marcación</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-vehicular"> Permitir Vehicular</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-routine"> Permitir Rutina</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-qr-static"> Permitir QR estático para visita</label>
            </div>

            <br>
            <br>
            <div class="material_input">
              <input type="number"
                id="entity-required-visitemer"
               autocomplete="none" min="0" class="input_filled" value="${data?.reqNroVisitEmer ?? 0}">
              <label for="entity-required-visitemer">Requerido visita emergente</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-vehicular"
               autocomplete="none" min="0" class="input_filled" value="${data?.reqNroVehicle ?? 0}">
              <label for="entity-required-vehicular">Requerido ingreso vehicular</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-report"
               autocomplete="none" min="0" class="input_filled" value="${data?.reqNroReport ?? 0}">
              <label for="entity-required-report">Requerido reportes</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-routine"
               autocomplete="none" min="0" class="input_filled" value="${data?.reqNroRoutine ?? 0}">
              <label for="entity-required-routine">Requerido rutinas</label>
            </div>

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-location-enabled"> Habilitar ubicación</label>
            </div>

            <div class="entity_map_field" id="entity-location-fields" style="display: none;">
              <label class="entity_map_label">Ubicación</label>
              <p class="entity_map_hint">Escribe la latitud y longitud o selecciona el punto en el mapa.</p>
              <div class="entity_map_coords">
                <div class="material_input">
                  <input type="number"
                    id="entity-latitude"
                   autocomplete="none" step="any" class="input_filled" value="${data?.latitude ?? ''}">
                  <label for="entity-latitude">Latitud</label>
                </div>
                <div class="material_input">
                  <input type="number"
                    id="entity-longitude"
                   autocomplete="none" step="any" class="input_filled" value="${data?.longitude ?? ''}">
                  <label for="entity-longitude">Longitud</label>
                </div>
              </div>
              <div class="material_input">
                <input type="number"
                  id="entity-location-radius"
                 autocomplete="none" min="1" step="any" class="input_filled" value="${data?.locationRadius ?? ''}">
                <label for="entity-location-radius">Radio de ubicación (metros)</label>
              </div>
              <input type="hidden" id="entity-location-zoom" value="${data?.zoomLevel ?? ''}">
              <div class="entity_map" id="entity-map"></div>
            </div>

          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
          </div>
        </div>
      `;
            if (locationMapInstance) {
              locationMapInstance.remove();
              locationMapInstance = null;
            }
            const checkboxMarcation = document.getElementById('entity-marcation');
            if (data.permitMarcation === true) {
              checkboxMarcation?.setAttribute('checked', 'true');
            }

            const checkboxVehicular = document.getElementById('entity-vehicular');
            if (data.permitVehicular === true) {
              checkboxVehicular?.setAttribute('checked', 'true');
            }

            const checkboxRoutine = document.getElementById('entity-routine');
            if (data.permitRoutine === true) {
              checkboxRoutine?.setAttribute('checked', 'true');
            }

            const checkboxQRStatic = document.getElementById('entity-qr-static');
            if (data?.permitVisitStatic === true) {
              checkboxQRStatic?.setAttribute('checked', 'true');
            }
            inputObserver();
            inputSelect('State', 'entity-state', data.state.name);
            const checkboxLocationEnabled = document.getElementById('entity-location-enabled');
            const locationFields = document.getElementById('entity-location-fields');
            if (data?.locationEnabled === true) {
              checkboxLocationEnabled?.setAttribute('checked', 'true');
              locationFields.style.display = 'block';
              initLocationMap(data);
            }
            checkboxLocationEnabled.addEventListener('change', () => {
              if (checkboxLocationEnabled.checked) {
                locationFields.style.display = 'block';
                initLocationMap(data);
              } else {
                locationFields.style.display = 'none';
              }
            });
            this.close();
            UUpdate(entityID);
        };
        const initLocationMap = (data) => {
            if (locationMapInstance) {
                setTimeout(() => locationMapInstance.invalidateSize(), 200);
                return;
            }
            const latInput = document.getElementById('entity-latitude');
            const lngInput = document.getElementById('entity-longitude');
            const zoomInput = document.getElementById('entity-location-zoom');
            const defaultCenter = [-1.8312, -78.1834];
            const defaultZoom = 6;
            const savedZoomFallback = 15;
            const savedLat = parseFloat(data?.latitude);
            const savedLng = parseFloat(data?.longitude);
            const hasSavedPosition = !isNaN(savedLat) && !isNaN(savedLng);
            const initialCenter = hasSavedPosition ? [savedLat, savedLng] : defaultCenter;
            const savedZoom = parseInt(zoomInput.value);
            const initialZoom = hasSavedPosition ? (isNaN(savedZoom) ? savedZoomFallback : savedZoom) : defaultZoom;
            const map = L.map('entity-map').setView(initialCenter, initialZoom);
            locationMapInstance = map;
            map.on('zoomend', () => {
                zoomInput.value = map.getZoom();
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);
            let marker = hasSavedPosition ? L.marker(initialCenter, { draggable: true }).addTo(map) : null;
            const setPosition = (lat, lng, recenter) => {
                latInput.value = lat;
                lngInput.value = lng;
                latInput.classList.add('input_filled');
                lngInput.classList.add('input_filled');
                if (marker) {
                    marker.setLatLng([lat, lng]);
                } else {
                    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
                    marker.on('dragend', () => {
                        const position = marker.getLatLng();
                        setPosition(position.lat, position.lng, false);
                    });
                }
                if (recenter) {
                    map.setView([lat, lng], map.getZoom() < 15 ? 15 : map.getZoom());
                }
            };
            if (marker) {
                marker.on('dragend', () => {
                    const position = marker.getLatLng();
                    setPosition(position.lat, position.lng, false);
                });
            }
            map.on('click', (e) => {
                setPosition(e.latlng.lat, e.latlng.lng, false);
            });
            const onCoordsInput = () => {
                const lat = parseFloat(latInput.value);
                const lng = parseFloat(lngInput.value);
                if (!isNaN(lat) && !isNaN(lng)) {
                    setPosition(lat, lng, true);
                }
            };
            latInput.addEventListener('change', onCoordsInput);
            lngInput.addEventListener('change', onCoordsInput);
            setTimeout(() => map.invalidateSize(), 200);
        };
        const UUpdate = async (entityId) => {
            const updateButton = document.getElementById('update-changes');
            const $value = {
              // @ts-ignore
              ruc: document.getElementById('entity-ruc'),
              // @ts-ignore
              status: document.getElementById('entity-state'),
              // @ts-ignore
              marcation: document.getElementById('entity-marcation'),
              // @ts-ignore
              vehicular: document.getElementById('entity-vehicular'),
              // @ts-ignore
              routine: document.getElementById('entity-routine'),
              qrstatic: document.getElementById('entity-qr-static'),
              reqNroVisitEmer: document.getElementById('entity-required-visitemer'),
              reqNroVehicle: document.getElementById('entity-required-vehicular'),
              reqNroReport: document.getElementById('entity-required-report'),
              reqNroRoutine: document.getElementById('entity-required-routine'),
              locationEnabled: document.getElementById('entity-location-enabled'),
              latitude: document.getElementById('entity-latitude'),
              longitude: document.getElementById('entity-longitude'),
              locationRadius: document.getElementById('entity-location-radius'),
              locationZoom: document.getElementById('entity-location-zoom'),
          };
            updateButton.addEventListener('click', () => {
              if ($value.locationEnabled.checked && !(parseFloat($value.locationRadius.value) > 0)) {
                alert('El radio de ubicación debe ser un número positivo');
                return;
              }
              let raw = JSON.stringify({
                  // @ts-ignore
                  "ruc": `${$value.ruc.value}`,
                  "state": {
                      "id": `${$value.status?.dataset.optionid}`
                  },
                  "permitMarcation": `${$value.marcation.checked ? true : false}`,
                  "permitVehicular": `${$value.vehicular.checked ? true : false}`,
                  "permitRoutine": `${$value.routine.checked ? true : false}`,
                  'permitVisitStatic': `${$value.qrstatic.checked ? true : false}`,
                  'reqNroVisitEmer': `${$value.reqNroVisitEmer.value ?? 0}`,
                  'reqNroVehicle': `${$value.reqNroVehicle.value ?? 0}`,
                  'reqNroReport': `${$value.reqNroReport.value ?? 0}`,
                  'reqNroRoutine': `${$value.reqNroRoutine.value ?? 0}`,
                  'locationEnabled': `${$value.locationEnabled.checked ? true : false}`,
                  'latitude': `${$value.latitude.value}`,
                  'longitude': `${$value.longitude.value}`,
                  'locationRadius': `${$value.locationRadius.value}`,
                  'zoomLevel': `${$value.locationZoom.value}`,
              });
              update(raw);
            });
            const update = (raw) => {
              updateEntity('Customer', entityId, raw)
                  .then((res) => {
                  setTimeout(async () => {
                      let tableBody;
                      let container;
                      let data;
                      //data = await getCustomers();
                      new CloseDialog()
                          .x(container =
                          document.getElementById('entity-editor-container'));
                      new Customers().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                  }, 100);
              });
          };
        };
    }
    updateContact() {
      const changeUser = document.querySelectorAll('#convert-entity');
      changeUser.forEach((buttonKey) => {
            buttonKey.addEventListener('click', async () => {
                let entityId = buttonKey.dataset.entityid;
                this.dialogContainer.style.display = 'block';
                this.dialogContainer.innerHTML = UIContact;
                inputObserver();
                const _contactName= document.getElementById('entity-contact-name');
                const _contactPhone = document.getElementById('entity-contact-phone');
                const data = await getEntityData("Customer", entityId);
                _contactName.value = data.contact?.name ?? "";
                _contactPhone.value = data.contact?.phone ?? "";
                const _updateContactButton = document.getElementById('update-contact');
                const _closeButton = document.getElementById('cancel');
                const _dialog = document.getElementById('dialog-content');
                _updateContactButton.addEventListener('click', async () => {
                    if (_contactName.value === '') {
                        alert('El campo Nombre no puede estar vacío.');
                    }
                    else if (_contactPhone.value === '') {
                        alert('El campo Teléfono no puede estar vacío.');
                    }
                    else if (data.contact?.id === '' || data.contact?.id === null || data.contact?.id === undefined) {
                        let raw = JSON.stringify({
                            "name": `${_contactName.value}`,
                            "phone": `${_contactPhone.value}`
                        });
                        await registerEntity(raw, 'Contact')
                            .then(() => {
                            setTimeout(async () => {
                              let rawSearch = JSON.stringify({
                                "filter": {
                                    "conditions": [
                                        {
                                            "property": "name",
                                            "operator": "=",
                                            "value": `${_contactName.value}`
                                        },
                                        {
                                            "property": "phone",
                                            "operator": "=",
                                            "value": `${_contactPhone.value}`
                                        }
                                    ]
                                }
                              });
                              let contactData = await getFilterEntityData("Contact", rawSearch);
                              console.log(contactData);
                              contactData.forEach(async (newContact) => {
                                let rawCustomer = JSON.stringify({
                                  "contact": {
                                      "id": `${newContact.id}`
                                  },
                                });
                                await updateEntity('Customer', entityId, rawCustomer)
                                    .then(() => {
                                    setTimeout(() => {
                                        new CloseDialog().x(_dialog);
                                    }, 1000);
                                });
                              });
                            }, 1000);
                        });

                    }
                    else {
                      let raw = JSON.stringify({
                        "name": `${_contactName.value}`,
                        "phone": `${_contactPhone.value}`
                      });
                      await updateEntity('Contact', data.contact.id, raw)
                          .then(() => {
                          setTimeout(() => {
                              new CloseDialog().x(_dialog);
                          }, 1000);
                      });
                    }
                });
                _closeButton.onclick = () => {
                    new CloseDialog().x(_dialog);
                };
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

