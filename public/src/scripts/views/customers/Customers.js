// @filename: Customers.ts
import { registerEntity, getUserInfo, getEntityData, updateEntity, getFilterEntityData, getFilterEntityCount } from "../../endpoints.js";
import { drawTagsIntoTables, inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, searchUniversalSingle2, sleep } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayout, UIContact, UIImport, UIProgress } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
import { isFeatureEnabled, FEATURE_FLAG_FACE_MARCATIONS } from "../../services/featureFlags.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
let infoPage = {
  count: 0,
  offset: Config.offset,
  currentPage: currentPage,
  search: ""
};

const getCustomerFilterRaw = (businessId, search = "", limit = null, offset = null, onlyActive = false) => {
    let conditions = [
        {
            "property": "business.id",
            "operator": "=",
            "value": `${businessId}`
        }
    ];

    if (onlyActive) {
        conditions.push({
            "property": "state.name",
            "operator": "=",
            "value": "Enabled"
        });
    }

    if (search !== "") {
        conditions.unshift({
            "group": "OR",
            "conditions": [
                {
                    "property": "name",
                    "operator": "contains",
                    "value": `${search.toLowerCase()}`
                },
                {
                    "property": "ruc",
                    "operator": "contains",
                    "value": `${search.toLowerCase()}`
                }
            ]
        });
    }

    let rawObj = {
        "filter": { "conditions": conditions },
        "sort": "-createdDate",
        "fetchPlan": "full"
    };

    if (limit !== null) rawObj.limit = limit;
    if (offset !== null) rawObj.offset = offset;

    return JSON.stringify(rawObj);
};

const getCustomers = async () => {
    const raw = getCustomerFilterRaw(Config.currentUser.business.id, infoPage.search, Config.tableRows, infoPage.offset);
    infoPage.count = await getFilterEntityCount("Customer", raw);
    return await getFilterEntityData("Customer", raw);
};

const getCustomersPaginated = async (limit, offset, onlyActive = false) => {
  const raw = getCustomerFilterRaw(Config.currentUser.business.id, "", limit, offset, onlyActive);
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
          <td>${customer?.permitPersonalStatic ? 'Si' : 'No'}</td>
          <td>${customer?.licenseType ? customer?.licenseType : ''}</td>
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
        this.export();
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
    export() {
      const exportBtn = document.getElementById('import-emails');
      if (exportBtn) {
          exportBtn.addEventListener('click', async () => {
              this.renderImportInterface();
          });
      }
    }
    renderImportInterface() {
      this.dialogContainer.style.display = 'block';
      this.dialogContainer.innerHTML = UIImport;
      const downloadBtn = document.getElementById('download-template');
      const processBtn = document.getElementById('process-import');
      const cancelBtn = document.getElementById('cancel');
      const fileInput = document.getElementById('file-input');
      const dialogContent = document.getElementById('dialog-content');
      downloadBtn.addEventListener('click', () => {
          new CloseDialog().x(dialogContent);
          this.downloadCSV();
      });
      cancelBtn.addEventListener('click', () => {
          new CloseDialog().x(dialogContent);
      });
      processBtn.addEventListener('click', async () => {
          const file = fileInput.files[0];
          if (!file) {
              alert("Por favor seleccione un archivo.");
              return;
          }
          const reader = new FileReader();
          reader.onload = async (e) => {
              const text = e.target.result;
              new CloseDialog().x(dialogContent);
              await this.processCSV(text);
          };
          reader.readAsText(file);
      });
    }

    showProgress(title, subtitle = "Iniciando...") {
        this.dialogContainer.style.display = 'block';
        this.dialogContainer.innerHTML = UIProgress;
        document.getElementById('progress-title').innerText = title;
        document.getElementById('progress-subtitle').innerText = subtitle;
        const closeBtn = document.getElementById('close-progress');
        closeBtn.addEventListener('click', () => {
            new CloseDialog().x(document.getElementById('dialog-progress'));
        });
    }

    updateProgress(percentage, message = "") {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressMessage = document.getElementById('progress-message');
        if (progressBar && progressText) {
            progressBar.style.width = `${percentage}%`;
            progressText.innerText = `${Math.round(percentage)}%`;
        }
        if (progressMessage && message) {
            progressMessage.innerText = message;
        }
    }

    showProgressError(message, cause) {
        const errorContainer = document.getElementById('error-container');
        const errorMsg = document.getElementById('error-message');
        const errorCause = document.getElementById('error-cause');
        const footer = document.getElementById('progress-footer');
        if (errorContainer) {
            errorContainer.style.display = 'block';
            errorMsg.innerText = message;
            errorCause.innerText = cause;
            footer.style.display = 'flex';
        }
    }

    finishProgress() {
        const footer = document.getElementById('progress-footer');
        if (footer) footer.style.display = 'flex';
    }

    async processCSV(text) {
      this.showProgress("Importando Correos", "Validando archivo...");
      try {
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
          const total = lines.length - 1; // Excluir cabecera
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const errors = [];

          const parseCSVLine = (line) => {
              const result = [];
              let current = '';
              let inQuotes = false;
              for (let i = 0; i < line.length; i++) {
                  const char = line[i];
                  if (char === '"') {
                      if (inQuotes && line[i + 1] === '"') {
                          current += '"';
                          i++;
                      }
                      else {
                          inQuotes = !inQuotes;
                      }
                  }
                  else if ((char === ';' || char === ',') && !inQuotes) {
                      result.push(current);
                      current = '';
                  }
                  else {
                      current += char;
                  }
              }
              result.push(current);
              return result;
          };

          // FASE 1: VALIDACIÓN PREVIA
          for (let i = 1; i < lines.length; i++) {
              const values = parseCSVLine(lines[i]);
              const email1 = values[2] ? values[2].trim() : "";
              const email2 = values[3] ? values[3].trim() : "";

              if (email1 !== "" && !emailRegex.test(email1)) {
                  errors.push(`Línea ${i + 1}: Correo 1 inválido (${email1})`);
              }
              if (email2 !== "" && !emailRegex.test(email2)) {
                  errors.push(`Línea ${i + 1}: Correo 2 inválido (${email2})`);
              }

              if (i % 20 === 0) {
                  this.updateProgress((i / lines.length) * 100, `Validando: ${i} de ${lines.length} líneas`);
              }
          }

          if (errors.length > 0) {
              const maxErrors = 10;
              let errorMessage = errors.slice(0, maxErrors).join('\n');
              if (errors.length > maxErrors) errorMessage += `\n... y ${errors.length - maxErrors} errores más.`;
              this.showProgressError("Errores de formato en el CSV", errorMessage);
              return;
          }

          // FASE 2: IMPORTACIÓN REAL
          document.getElementById('progress-subtitle').innerText = "Actualizando base de datos...";
          let successCount = 0;
          let failCount = 0;
          const importErrors = [];

          for (let i = 1; i < lines.length; i++) {
              try {
                  const values = parseCSVLine(lines[i]);
                  const id = values[0] ? values[0].trim() : null;
                  const email1 = values[2] ? values[2].trim() : "";
                  const email2 = values[3] ? values[3].trim() : "";

                  let emails = [];
                  if (email1) emails.push(email1);
                  if (email2) emails.push(email2);

                  if (id && id !== "") {
                      // Verificar si el cliente existe mediante conteo (más eficiente)
                      const rawCheck = JSON.stringify({
                          "filter": {
                              "conditions": [{ "property": "id", "operator": "=", "value": id }]
                          }
                      });
                      const count = await getFilterEntityCount('Customer', rawCheck);

                      if (count > 0) {
                          const raw = JSON.stringify({ "email": emails.join(',') });
                          await updateEntity('Customer', id, raw);
                          successCount++;
                      } else {
                          failCount++;
                          importErrors.push(`ID no encontrado: ${id}`);
                          console.warn(`Cliente con ID ${id} con nombre ${values[1]} no encontrado.`);
                      }
                      // Pequeña pausa para evitar sobrecarga del servidor (Throttling)
                      await sleep(50);
                  }
                  this.updateProgress((i / total) * 100, `Procesando: ${i} de ${total} registros`);
              } catch (lineError) {
                  failCount++;
                  importErrors.push(`Línea ${i + 1}: ${lineError.message}`);
                  console.error(`Error en línea ${i + 1}:`, lineError);
              }
          }
          this.updateProgress(100);

          if (failCount > 0) {
              const finalTitle = `Finalizado con ${failCount} errores`;
              document.getElementById('progress-title').innerText = finalTitle;
              this.showProgressError(`Se actualizaron ${successCount} registros.`, importErrors.join('\n'));
          } else {
              document.getElementById('progress-title').innerText = "Importación Finalizada";
              this.finishProgress();
              await sleep(1000);
              new CloseDialog().x(document.getElementById('dialog-progress'));
          }
          new Customers().render(infoPage.offset, infoPage.currentPage, infoPage.search);
      } catch (error) {
          this.showProgressError("Error al procesar el archivo CSV", error.message);
      }
    }

    async downloadCSV() {
      if (!Config.currentUser || !Config.currentUser.business) {
          alert("Error: No se pudo identificar la empresa actual.");
          return;
      }
      this.showProgress("Generando Plantilla", "Preparando datos...");
      try {
          const businessId = Config.currentUser.business.id;
          const filterRaw = getCustomerFilterRaw(businessId, "", null, null, true);

          const totalCount = await getFilterEntityCount("Customer", filterRaw);
          if (totalCount === undefined || totalCount === 0) {
              this.updateProgress(100, "No se encontraron registros activos para exportar.");
              const footer = document.getElementById('progress-footer');
              if (footer) footer.style.display = 'flex';
              return;
          }

          let csvContent = "ID;Nombre;Correo 1;Correo 2\n";
          const batchSize = 100;
          let processed = 0;

          while (processed < totalCount) {
              const batchData = await getCustomersPaginated(batchSize, processed, true);
              if (!batchData || batchData.length === 0) break;

              batchData.forEach(customer => {
                  let emails = [];
                  if (customer.email) {
                      emails = customer.email.split(/[,;]/).map(e => e.trim()).filter(e => e !== "");
                  }

                  let row = [
                      customer.id,
                      `"${(customer.name || '').replace(/"/g, '""')}"`,
                      emails[0] ? `"${emails[0].replace(/"/g, '""')}"` : "",
                      emails[1] ? `"${emails[1].replace(/"/g, '""')}"` : ""
                  ];
                  csvContent += row.join(";") + "\n";
              });

              processed += batchData.length;
              this.updateProgress((processed / totalCount) * 100, `Obteniendo registros: ${processed} de ${totalCount}`);
          }

          if (processed > 0) {
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", "plantilla_clientes_email.csv");
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);

              document.getElementById('progress-title').innerText = "Plantilla Generada";
              this.finishProgress();
              await sleep(1000);
              new CloseDialog().x(document.getElementById('dialog-progress'));
          } else {
              this.showProgressError("Sin registros", "No se procesó ningún registro.");
          }
      } catch (error) {
          console.error("Error downloading CSV:", error);
          this.showProgressError("Error al generar la plantilla", error.message);
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

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-personal-static"> Permitir QR estático para personal</label>
            </div>
            <br>

            <div class="material_input">
                <label for="license-type">Tipo de licencia</label>
                <br>
                <br>
                <select name="license-type" id="license-type">
                    <option value="STANDARD" selected>STANDARD</option>
                    <option value="POOL 50">POOL 50</option>
                </select>
            </div>
            <br>
            <div class="material_input">
              <input type="text"
                id="entity-email"
                autocomplete="none">
              <label for="entity-email">Email (máx 2, sep por , o ;)</label>
            </div>

            <br>
            <br>
            <div class="material_input">
              <input type="number"
                id="entity-required-visitemer"
               autocomplete="none" min="0" value="0">
              <label for="entity-required-visitemer">Requerido visita emergente</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-vehicular"
               autocomplete="none" min="0" value="0">
              <label for="entity-required-vehicular">Requerido ingreso vehicular</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-report"
               autocomplete="none" min="0" value="0">
              <label for="entity-required-report">Requerido reportes</label>
            </div>

            <div class="material_input">
              <input type="number"
                id="entity-required-routine"
               autocomplete="none" min="0" value="0">
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
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    ruc: document.getElementById('entity-ruc'),
                    email: document.getElementById('entity-email'),
                    state: document.getElementById('entity-state'),
                    marcation: document.getElementById('entity-marcation'),
                    vehicular: document.getElementById('entity-vehicular'),
                    routine: document.getElementById('entity-routine'),
                    qrstatic: document.getElementById('entity-qr-static'),
                    personalstatic: document.getElementById('entity-personal-static'),
                    reqNroVisitEmer: document.getElementById('entity-required-visitemer'),
                    reqNroVehicle: document.getElementById('entity-required-vehicular'),
                    reqNroReport: document.getElementById('entity-required-report'),
                    reqNroRoutine: document.getElementById('entity-required-routine'),
                    licenseType: document.getElementById('license-type'),
                };
                const emails = inputsCollection.email.value.split(/[,;]/).map(e => e.trim()).filter(e => e !== "");
                if (emails.length > 2) {
                    alert("Se permiten máximo 2 correos electrónicos.");
                    return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                for (const email of emails) {
                    if (!emailRegex.test(email)) {
                        alert(`Formato de correo inválido: ${email}`);
                        return;
                    }
                }

                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.trim()}`,
                    "business": {
                        "id": `${Config.currentUser.business.id}`},
                    "ruc": `${inputsCollection.ruc.value.trim()}`,
                    "email": `${emails.join(',')}`,
                    "state": {
                      "id": `${inputsCollection.state.dataset.optionid}`},
                    "firebaseId":`${inputsCollection.name.value}`,
                    "associate":`${Config.currentUser.business.name}`,
                    "permitMarcation": `${inputsCollection.marcation.checked ? true : false}`,
                    "permitVehicular": `${inputsCollection.vehicular.checked ? true : false}`,
                    "permitRoutine": `${inputsCollection.routine.checked ? true : false}`,
                    'permitVisitStatic': `${inputsCollection.qrstatic.checked ? true : false}`,
                    'permitPersonalStatic': `${inputsCollection.personalstatic.checked ? true : false}`,
                    'reqNroVisitEmer': `${inputsCollection.reqNroVisitEmer.value ?? 0}`,
                    'reqNroVehicle': `${inputsCollection.reqNroVehicle.value ?? 0}`,
                    'reqNroReport': `${inputsCollection.reqNroReport.value ?? 0}`,
                    'reqNroRoutine': `${inputsCollection.reqNroRoutine.value ?? 0}`,
                    'licenseType': `${inputsCollection.licenseType.value ?? 'STANDARD'}`
                });
                const exist = await searchUniversalSingle2('name', 'contains', inputsCollection.name.value, 'business.id', '=', Config.currentUser.business.id, 'Customer');
                //const exist = await searchCustomerbyName(inputsCollection.name.value, businessId)
                if(inputsCollection.name.value === '' || inputsCollection.name.value === undefined){
                    alert("¡Nombre vacío!")
                }else if(Config.currentUser.business.id == undefined || Config.currentUser.business.id == null){
                    alert("¡Id empresa seguridad vacío!")
                }else if(exist == undefined || exist != 'none'){
                    alert("¡Nombre de empresa ya existente o no se ha podido comprobar!")
                }else{
                  registerEntity(raw, 'Customer')
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
        const faceMarcationsEnabled = isFeatureEnabled(FEATURE_FLAG_FACE_MARCATIONS);
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

            <div class="input_checkbox">
                <label><input type="checkbox" class="checkbox" id="entity-personal-static"> Permitir QR estático para personal</label>
            </div>
            <br>

             <div class="material_input">
                <label for="license-type">Tipo de licencia</label>
                <br>
                <br>
                <select name="license-type" id="license-type">
                    <option value="STANDARD" selected>STANDARD</option>
                    <option value="POOL 50">POOL 50</option>
                </select>
            </div>
            <br>
            <div class="material_input">
              <input type="text"
                id="entity-email"
                class="input_filled"
                value="${data?.email ?? ''}">
              <label for="entity-email">Email (máx 2, sep por , o ;)</label>
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

            ${faceMarcationsEnabled ? `
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
                 autocomplete="none" min="1" max="60" step="any" class="input_filled" value="${data?.locationRadius ?? 60}">
                <label for="entity-location-radius">Radio de ubicación (metros)</label>
              </div>
              <input type="hidden" id="entity-location-zoom" value="${data?.zoomLevel ?? ''}">
              <div class="entity_map" id="entity-map"></div>
            </div>
            ` : ''}

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

            const checkboxPersonalStatic = document.getElementById('entity-personal-static');
            if (data?.permitPersonalStatic === true) {
                checkboxPersonalStatic?.setAttribute('checked', 'true');
            }

            const licenseType = document.getElementById('license-type');
            licenseType.value = data?.licenseType ?? 'STANDARD';
            inputObserver();
            inputSelect('State', 'entity-state', data.state.name);
            if (faceMarcationsEnabled) {
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
            }
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
            zoomInput.value = map.getZoom();
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
              email: document.getElementById('entity-email'),
              // @ts-ignore
              status: document.getElementById('entity-state'),
              // @ts-ignore
              marcation: document.getElementById('entity-marcation'),
              // @ts-ignore
              vehicular: document.getElementById('entity-vehicular'),
              // @ts-ignore
              routine: document.getElementById('entity-routine'),
              qrstatic: document.getElementById('entity-qr-static'),
              personalstatic: document.getElementById('entity-personal-static'),
              reqNroVisitEmer: document.getElementById('entity-required-visitemer'),
              reqNroVehicle: document.getElementById('entity-required-vehicular'),
              reqNroReport: document.getElementById('entity-required-report'),
              reqNroRoutine: document.getElementById('entity-required-routine'),
              locationEnabled: document.getElementById('entity-location-enabled'),
              latitude: document.getElementById('entity-latitude'),
              longitude: document.getElementById('entity-longitude'),
              locationRadius: document.getElementById('entity-location-radius'),
              locationZoom: document.getElementById('entity-location-zoom'),
              licenseType: document.getElementById('license-type'),
          };
            updateButton.addEventListener('click', () => {
              if (faceMarcationsEnabled) {
                const locationRadiusValue = parseFloat($value.locationRadius.value);
                if ($value.locationEnabled.checked && !(locationRadiusValue > 0 && locationRadiusValue <= 60)) {
                  alert('El radio de ubicación debe ser un número mayor a 0 y menor o igual a 60');
                  return;
                }
              }

              const emails = $value.email.value.split(/[,;]/).map(e => e.trim()).filter(e => e !== "");
              if (emails.length > 2) {
                  alert("Se permiten máximo 2 correos electrónicos.");
                  return;
              }
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              for (const email of emails) {
                  if (!emailRegex.test(email)) {
                      alert(`Formato de correo inválido: ${email}`);
                      return;
                  }
              }

              const payload = {
                  // @ts-ignore
                  "ruc": `${$value.ruc.value.trim()}`,
                  "email": `${emails.join(',')}`,
                  "state": {
                      "id": `${$value.status?.dataset.optionid}`
                  },
                  "permitMarcation": `${$value.marcation.checked ? true : false}`,
                  "permitVehicular": `${$value.vehicular.checked ? true : false}`,
                  "permitRoutine": `${$value.routine.checked ? true : false}`,
                  'permitVisitStatic': `${$value.qrstatic.checked ? true : false}`,
                  'permitPersonalStatic': `${$value.personalstatic.checked ? true : false}`,
                  'reqNroVisitEmer': `${$value.reqNroVisitEmer.value ?? 0}`,
                  'reqNroVehicle': `${$value.reqNroVehicle.value ?? 0}`,
                  'reqNroReport': `${$value.reqNroReport.value ?? 0}`,
                  'reqNroRoutine': `${$value.reqNroRoutine.value ?? 0}`,
                  'licenseType': `${$value.licenseType.value ?? 'STANDARD'}`,
              };
              if (faceMarcationsEnabled) {
                payload.locationEnabled = `${$value.locationEnabled.checked ? true : false}`;
                if ($value.latitude.value !== '') {
                    payload.latitude = `${$value.latitude.value}`;
                }
                if ($value.longitude.value !== '') {
                    payload.longitude = `${$value.longitude.value}`;
                }
                if ($value.locationRadius.value !== '') {
                    payload.locationRadius = `${$value.locationRadius.value}`;
                }
                if ($value.locationZoom.value !== '') {
                    payload.zoomLevel = `${$value.locationZoom.value}`;
                }
              }
              const raw = JSON.stringify(payload);
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

