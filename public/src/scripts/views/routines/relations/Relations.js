// @filename: RoutineRelations.ts
import { deleteEntity, getEntitiesData, registerEntity, updateEntity, getEntityData, getFilterEntityData, getFilterEntityCount, getUserInfo } from "../../../endpoints.js";
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, getDetails, equivalentTime } from "../../../tools.js";
import { Config } from "../../../Configs.js";
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

const getRoutineRelations = async () => {
  let raw = JSON.stringify({
    "filter": {
      "conditions": [
        {
          "property": "customer.id",
          "operator": "=",
          "value": `${customerId}`
        },
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
                "property": "routineSchedule.name",
                "operator": "contains",
                "value": `${infoPage.search.toLowerCase()}`
              },
              {
                "property": "qrPoint.name",
                "operator": "contains",
                "value": `${infoPage.search.toLowerCase()}`
              },
              {
                "property": "routine.name",
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

  infoPage.count = await getFilterEntityCount("RoutineRelation", raw);
  dataPage = await getFilterEntityData("RoutineRelation", raw);
  return dataPage;
};

export class RoutineRelations {
  constructor() {
    this.dialogContainer = document.getElementById('app-dialogs');
    this.entityDialogContainer = document.getElementById('entity-editor-container');
    this.content = document.getElementById('datatable-container');

    this.searchEntity = async (tableBody) => {
      const search = document.getElementById('search');
      const btnSearch = document.getElementById('btnSearch');
      search.value = infoPage.search;

      btnSearch.addEventListener('click', async () => {
        new RoutineRelations().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
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
    let data = await getRoutineRelations();
    tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
    this.load(tableBody, currentPage, data);
    this.searchEntity(tableBody);
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
      if (customerId == null) { mensaje = 'Seleccione una empresa'; }
      let row = document.createElement('tr');
      row.innerHTML = `
        <td>${mensaje}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      `;
      table.appendChild(row);
    } else {
      for (let i = 0; i < paginatedItems.length; i++) {
        let relation = paginatedItems[i];
        let row = document.createElement('tr');
        row.innerHTML += `
          <td>${relation.routine?.name ?? ''}</td>
          <td>${relation.routineSchedule?.name ?? ''}</td>
          <td>${relation.qrPoint?.name ?? ''}</td>
          <td>${relation?.frequency ?? 0}</td>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${relation.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="button" id="remove-entity" data-entityId="${relation.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;
        table.appendChild(row);
      }
    }
    this.register();
    this.edit(this.entityDialogContainer, data);
    this.remove();
  }

  pagination(items, limitRows, currentPage) {
    const paginationWrapper = document.getElementById('pagination-container');
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
        currentPage = page;
        new RoutineRelations().render(Config.tableRows * (page - 1), currentPage, infoPage.search);
      });
      return button;
    }

    function pagesOptions(items, currentPage) {
      paginationWrapper.innerHTML = '';
      let pages = pageNumbers(pageCount, Config.maxLimitPage, currentPage);
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
        new RoutineRelations().render(Config.offset, 1, infoPage.search);
      });
      nextButton.addEventListener('click', () => {
        new RoutineRelations().render(Config.tableRows * (pageCount - 1), pageCount, infoPage.search);
      });
    }
  }

  register() {
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
              <div class="avatar"><i class="fa-solid fa-link"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Asignación</small></h1>
            </div>
            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-schedule" autocomplete="none" readonly class="input_select">
              <label for="entity-schedule">Seleccionar Horario <button id="btn-select-schedule" style="background:white; color:blue; border:none; cursor:pointer"><i class="fa-solid fa-arrow-up-right-from-square"></i></button></label>
            </div>
            <div class="material_input">
              <input type="text" id="entity-qrPoint" autocomplete="none" readonly class="input_select">
              <label for="entity-qrPoint">Seleccionar Punto QR <button id="btn-select-qrPoint" style="background:white; color:blue; border:none; cursor:pointer"><i class="fa-solid fa-arrow-up-right-from-square"></i></button></label>
            </div>
            <div class="material_input">
              <label class="form_label" for="entity-frequency">Frecuencia (minutos)</label>
              <br><br>
              <select id="entity-frequency" class="input_select" style="width: 100%;">
                <option value="10" selected>10</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
                <option value="120">120</option>
              </select>
            </div>
          </div>
          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `;

      inputObserver();
      this.close();

      const btnSelectSchedule = document.getElementById('btn-select-schedule');
      btnSelectSchedule.addEventListener('click', () => {
        this.modalTableSchedule();
      });

      const btnSelectQrPoint = document.getElementById('btn-select-qrPoint');
      btnSelectQrPoint.addEventListener('click', () => {
        this.modalTableQrPoint();
      });

      const registerButton = document.getElementById('register-entity');
      registerButton.addEventListener('click', async () => {
        const scheduleInput = document.getElementById('entity-schedule');
        const qrPointInput = document.getElementById('entity-qrPoint');
        const frequencyInput = document.getElementById('entity-frequency');

        if (!scheduleInput.dataset.optionid || !qrPointInput.dataset.optionid || !frequencyInput.value) {
          alert("Por favor complete todos los campos");
          return;
        }

        const raw = JSON.stringify({
          "business": { "id": `${Config.currentUser.business.id}` },
          "customer": { "id": `${customerId}` },
          "routine": { "id": `${scheduleInput.dataset.routineid}` },
          "routineSchedule": { "id": `${scheduleInput.dataset.optionid}` },
          "qrPoint": { "id": `${qrPointInput.dataset.optionid}` },
          "frequency": parseInt(frequencyInput.value),
          "creationDate": currentDateTime().date,
          "creationTime": currentDateTime().timeHHMMSS
        });

        await registerEntity(raw, 'RoutineRelation');
        setTimeout(() => {
          const container = document.getElementById('entity-editor-container');
          new CloseDialog().x(container);
          new RoutineRelations().render(Config.offset, Config.currentPage, infoPage.search);
        }, 1000);
      });
    };
  }

  modalTableSchedule() {
    const dialogContainer = document.getElementById('app-dialogs');
    const modal = async (offset, search) => {
      let raw = JSON.stringify({
        "filter": {
          "conditions": [
            { "property": "customer.id", "operator": "=", "value": `${customerId}` }
          ],
        },
        sort: "+name",
        limit: Config.modalRows,
        offset: offset,
        fetchPlan: 'full'
      });

      if (search != "") {
        raw = JSON.stringify({
          "filter": {
            "conditions": [
              { "property": "name", "operator": "contains", "value": `${search.toLowerCase()}` },
              { "property": "customer.id", "operator": "=", "value": `${customerId}` }
            ],
          },
          sort: "+name",
          limit: Config.modalRows,
          offset: offset,
          fetchPlan: 'full'
        });
      }

      let dataModal = await getFilterEntityData("RoutineSchedule", raw);
      dialogContainer.style.display = 'block';
      dialogContainer.innerHTML = `
        <div class="dialog_content" id="dialog-content">
          <div class="dialog">
            <div class="dialog_container padding_8">
              <div class="dialog_header"><h2>Seleccione un Horario</h2></div>
              <div class="dialog_message padding_8">
                <div class="datatable_tools">
                  <input type="search" class="search_input" placeholder="Buscar" id="search-modal">
                  <button class="datatable_button" id="btnSearchModal"><i class="fa-solid fa-search"></i></button>
                </div>
                <div class="dashboard_datatable">
                  <table class="datatable_content margin_t_16">
                    <thead>
                      <tr><th>Nombre</th><th>Rutina</th><th></th></tr>
                    </thead>
                    <tbody id="datatable-modal-body"></tbody>
                  </table>
                </div>
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
      const tableBody = document.getElementById('datatable-modal-body');
      if (dataModal.length === 0) {
        tableBody.innerHTML = '<tr><td>No hay datos</td><td></td><td></td></tr>';
      } else {
        dataModal.forEach(item => {
          let row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.routine?.name ?? ''}</td>
            <td class="entity_options">
              <button class="button" id="select-item" data-entityId="${item.id}" data-entityName="${item.name}" data-routineId="${item.routine?.id}">
                <i class="fa-solid fa-check"></i>
              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      }

      document.getElementById('search-modal').value = search;
      document.getElementById('btnSearchModal').onclick = () => modal(0, document.getElementById('search-modal').value);
      document.getElementById('cancel').onclick = () => new CloseDialog().x(document.getElementById('dialog-content'));
      document.getElementById('nextModal').onclick = () => modal(offset + Config.modalRows, search);
      document.getElementById('prevModal').onclick = () => { if (offset > 0) modal(offset - Config.modalRows, search); };

      const selectButtons = document.querySelectorAll('#select-item');
      selectButtons.forEach(btn => {
        btn.onclick = () => {
          const input = document.getElementById('entity-schedule');
          input.value = btn.dataset.entityname;
          input.dataset.optionid = btn.dataset.entityid;
          input.dataset.routineid = btn.dataset.routineid;
          input.classList.add('input_filled');
          new CloseDialog().x(document.getElementById('dialog-content'));
        };
      });
    };
    modal(0, "");
  }

  modalTableQrPoint() {
    const dialogContainer = document.getElementById('app-dialogs');
    const modal = async (offset, search) => {
      let raw = JSON.stringify({
        "filter": {
          "conditions": [
            { "property": "customer.id", "operator": "=", "value": `${customerId}` }
          ],
        },
        sort: "+name",
        limit: Config.modalRows,
        offset: offset,
        fetchPlan: 'full'
      });

      if (search != "") {
        raw = JSON.stringify({
          "filter": {
            "conditions": [
              { "property": "name", "operator": "contains", "value": `${search.toLowerCase()}` },
              { "property": "customer.id", "operator": "=", "value": `${customerId}` }
            ],
          },
          sort: "+name",
          limit: Config.modalRows,
          offset: offset,
          //fetchPlan: 'full'
        });
      }

      let dataModal = await getFilterEntityData("QRPoint", raw);
      dialogContainer.style.display = 'block';
      dialogContainer.innerHTML = `
        <div class="dialog_content" id="dialog-content">
          <div class="dialog">
            <div class="dialog_container padding_8">
              <div class="dialog_header"><h2>Seleccione un Punto QR</h2></div>
              <div class="dialog_message padding_8">
                <div class="datatable_tools">
                  <input type="search" class="search_input" placeholder="Buscar" id="search-modal">
                  <button class="datatable_button" id="btnSearchModal"><i class="fa-solid fa-search"></i></button>
                </div>
                <div class="dashboard_datatable">
                  <table class="datatable_content margin_t_16">
                    <thead>
                      <tr><th>Nombre</th><th></th></tr>
                    </thead>
                    <tbody id="datatable-modal-body"></tbody>
                  </table>
                </div>
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
      const tableBody = document.getElementById('datatable-modal-body');
      if (dataModal.length === 0) {
        tableBody.innerHTML = '<tr><td>No hay datos</td><td></td></tr>';
      } else {
        dataModal.forEach(item => {
          let row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.name}</td>
            <td class="entity_options">
              <button class="button" id="select-item" data-entityId="${item.id}" data-entityName="${item.name}">
                <i class="fa-solid fa-check"></i>
              </button>
            </td>
          `;
          tableBody.appendChild(row);
        });
      }

      document.getElementById('search-modal').value = search;
      document.getElementById('btnSearchModal').onclick = () => modal(0, document.getElementById('search-modal').value);
      document.getElementById('cancel').onclick = () => new CloseDialog().x(document.getElementById('dialog-content'));
      document.getElementById('nextModal').onclick = () => modal(offset + Config.modalRows, search);
      document.getElementById('prevModal').onclick = () => { if (offset > 0) modal(offset - Config.modalRows, search); };

      const selectButtons = document.querySelectorAll('#select-item');
      selectButtons.forEach(btn => {
        btn.onclick = () => {
          const input = document.getElementById('entity-qrPoint');
          input.value = btn.dataset.entityname;
          input.dataset.optionid = btn.dataset.entityid;
          input.classList.add('input_filled');
          new CloseDialog().x(document.getElementById('dialog-content'));
        };
      });
    };
    modal(0, "");
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
                  <h2>¿Deseas eliminar esta asignación?</h2>
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
          await deleteEntity('RoutineRelation', entityId)
            .then(res => new RoutineRelations().render(infoPage.offset, infoPage.currentPage, infoPage.search));
          new CloseDialog().x(dialogContent);
        };
        cancelButton.onclick = () => {
          new CloseDialog().x(dialogContent);
        };
      });
    });
  }

  edit(container, data) {
    const editButtons = document.querySelectorAll('#edit-entity');
    editButtons.forEach((btn) => {
      const entityId = btn.dataset.entityid;
      btn.addEventListener('click', () => {
        RInterface('RoutineRelation', entityId);
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
              <div class="avatar"><i class="fa-solid fa-link"></i></div>
              <h1 class="entity_editor_title">Editar <br><small>Asignación</small></h1>
            </div>
            <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
          </div>
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" value="${data.routine?.name ?? ''}" class="input_filled" readonly>
              <label>Rutina</label>
            </div>
            <div class="material_input">
              <input type="text" value="${data.routineSchedule?.name ?? ''}" class="input_filled" readonly>
              <label>Horario</label>
            </div>
            <div class="material_input">
              <input type="text" value="${data.qrPoint?.name ?? ''}" class="input_filled" readonly>
              <label>Punto QR</label>
            </div>
            <div class="material_input">
              <label class="form_label" for="entity-frequency">Frecuencia (minutos)</label>
              <br><br>
              <select id="entity-frequency" class="input_select" style="width: 100%;">
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
                <option value="120">120</option>
              </select>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; margin-top:20px;">
              <img id="qrcode" style="margin-bottom:10px;">
              <button class="btn btn_primary" id="btnDescargar">Descargar QR</button>
            </div>
          </div>
          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
          </div>
        </div>
      `;

      inputObserver();
      document.getElementById("entity-frequency").value = data?.frequency ?? 10;
      this.close();

      const qr = document.getElementById("qrcode");
      // @ts-ignore
      new QRious({
        element: qr,
        value: data.id,
        size: 250,
        backgroundAlpha: 1,
        foreground: "#1D4C82FF",
        level: "H",
      });

      const btnDescargar = document.getElementById('btnDescargar');
      btnDescargar.addEventListener('click', () => {
        const enlace = document.createElement("a");
        enlace.href = qr.src;
        enlace.download = `QR_Asignacion_${data.id}.png`;
        enlace.click();
      });

      UUpdate(entityID);
    };

    const UUpdate = async (entityId) => {
      const updateButton = document.getElementById('update-changes');
      updateButton.addEventListener('click', () => {
        const frequencyInput = document.getElementById('entity-frequency');
        let raw = JSON.stringify({
          "frequency": parseInt(frequencyInput.value)
        });
        update(raw);
      });

      const update = async (raw) => {
        await updateEntity('RoutineRelation', entityId, raw)
          .then(() => {
            setTimeout(() => {
              const container = document.getElementById('entity-editor-container');
              new CloseDialog().x(container);
              new RoutineRelations().render(infoPage.offset, infoPage.currentPage, infoPage.search);
            }, 100);
          });
      };
    };
  }

  close() {
    const closeButton = document.getElementById('close');
    const editor = document.getElementById('entity-editor-container');
    closeButton.addEventListener('click', () => {
      new CloseDialog().x(editor);
    });
  }
}

const agregarCero = (valor) => {
  return valor < 10 ? "0" + valor : valor;
};
