// @filename: Departments.ts
import { deleteEntity, getFilterEntityData, registerEntity, getFilterEntityCount, getEntityData, updateEntity } from "../../endpoints.js";
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, drawTagsIntoTables } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: currentPage,
    search: "",
    module: "Visitas"
};
let dataPage;
const getTags = async () => {
    //const department = await getEntitiesData('Department');
    //const FCustomer = department.filter((data) => `${data.customer?.id}` === `${customerId}`);
    const baseConditions = [
        {
            "property": "customer.id",
            "operator": "=",
            "value": `${customerId}`
        }
    ];

    if (infoPage.module !== "Todas") {
        baseConditions.push({
            "property": "typeEntity", // Using typeEntity as proxy for module if not available, but let's assume it's "module" or similar.
            // The image says "Módulo". Let's check if there's a field for it.
            // In the registerEntity raw object, it says "typeEntity": "Tag".
            // Maybe we should add a "module" field.
            "operator": "=",
            "value": infoPage.module
        });
    }

  if (infoPage.search.trim() != "") {
    baseConditions.unshift({
        "group": "OR",
        "conditions": [
            {
                "property": "name",
                "operator": "contains",
                "value": `${infoPage.search.toLowerCase()}`
            }
        ]
    });
  }
  let raw = JSON.stringify({
      "filter": {
          "conditions": baseConditions
      },
      sort: "-createdDate",
      limit: Config.tableRows,
      offset: infoPage.offset,
  });
  infoPage.count = await getFilterEntityCount("Tags", raw);
  dataPage = await getFilterEntityData("Tags", raw);
  return dataPage;
};
export class Tags {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data: any*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            search.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    new Tags().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
                }
            });
            btnSearch.addEventListener('click', async () => {
                new Tags().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
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
        this.setTabs();
        let data = await getTags();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody /*, data*/);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, infoPage.currentPage);
    }

    setTabs() {
        const tabs = document.querySelectorAll('.tab_button');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.innerText === infoPage.module) {
                tab.classList.add('active');
            }
            tab.addEventListener('click', () => {
                infoPage.module = tab.innerText;
                new Tags().render(Config.offset, Config.currentPage, infoPage.search);
            });
        });
    }

    getColorName(color) {
        switch (color) {
            case '#4654d3': return 'Azul';
            case '#28a745': return 'Verde';
            case '#dc3545': return 'Rojo';
            case '#ffc107': return 'Ámbar';
            case '#6f42c1': return 'Morado';
            case '#17a2b8': return 'Turquesa';
            default: return 'Azul';
        }
    }
    //<td class="tag"><span>${tag.typeEntity ?? 'Visitas'}</span></td>
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
        <td></td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let tag = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${tag.name}</td>
          <td>${tag.typeEntity ?? 'Visitas'}</td>
          <td><span class="color_circle" style="background-color: ${tag.color || '#4654d3'}"></span> ${this.getColorName(tag.color)}</td>
          <td class="tag"><span>${tag.isActive ? 'Activo' : 'Inactivo'}</span></td>
          <td>${tag.creationDate || ''} ${tag.creationTime || ''}</td>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${tag.id}">
              <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="button" id="remove-entity" data-entityId="${tag.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;
                table.appendChild(row);
                drawTagsIntoTables();
            }
        }
        this.register();
        this.edit();
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
                infoPage.offset = Config.tableRows * (page - 1);
                currentPage = page;
                new Tags().render(infoPage.offset, currentPage, infoPage.search);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
            paginationWrapper.innerHTML = '';
            let pages = pageNumbers(infoPage.count, Config.maxLimitPage, currentPage);
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
                new Tags().render(Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                new Tags().render(infoPage.offset, pageCount, infoPage.search);
            });
        }
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            this.renderInterface();
        });
    }

    edit() {
        const editButtons = document.querySelectorAll('#edit-entity');
        editButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const entityId = button.dataset.entityid;
                this.renderInterface(entityId);
            });
        });
    }

    async renderInterface(entityId = null) {
        this.entityDialogContainer.innerHTML = '';
        this.entityDialogContainer.style.display = 'flex';
        this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-tags"></i></div>
              <h1 class="entity_editor_title">${entityId ? 'Editar' : 'Registrar'} <br><small>Etiqueta</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre de la etiqueta *</label>
            </div>

            <div class="input_module_selection">
                <label>Módulo *</label>
                <div class="module_buttons">
                    <button class="btn_module active" data-module="Visitas">Visitas</button>
                    <button class="btn_module" data-module="Vehicular">Vehicular</button>
                </div>
                <small>Obligatorio: define en qué formulario verá esta etiqueta el guardia.</small>
            </div>

            <div class="input_color_selection">
                <label>Color</label>
                <div class="color_options">
                    <button class="color_option active" data-color="#4654d3" style="background-color: #4654d3;"></button>
                    <button class="color_option" data-color="#28a745" style="background-color: #28a745;"></button>
                    <button class="color_option" data-color="#dc3545" style="background-color: #dc3545;"></button>
                    <button class="color_option" data-color="#ffc107" style="background-color: #ffc107;"></button>
                    <button class="color_option" data-color="#6f42c1" style="background-color: #6f42c1;"></button>
                    <button class="color_option" data-color="#17a2b8" style="background-color: #17a2b8;"></button>
                </div>
            </div>

            <div class="input_switch">
                <label>Estado</label>
                <div class="switch_wrapper">
                    <span>Etiqueta visible para los guardias</span>
                    <label class="switch">
                        <input type="checkbox" id="entity-active" checked>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_transparent btn_widder" id="close-debug">Cancelar</button>
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `;
        // @ts-ignore
        inputObserver();

        const closeButton = document.getElementById('close');
        const cancelButton = document.getElementById('close-debug');
        const editor = document.getElementById('entity-editor-container');
        const closeEditor = () => { new CloseDialog().x(editor); };
        closeButton.addEventListener('click', closeEditor);
        cancelButton.addEventListener('click', closeEditor);

        const moduleButtons = document.querySelectorAll('.btn_module');
        let selectedModule = 'Visitas';
        moduleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                moduleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedModule = btn.dataset.module;
            });
        });

        const colorOptions = document.querySelectorAll('.color_option');
        let selectedColor = '#4654d3';
        colorOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                colorOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                selectedColor = opt.dataset.color;
            });
        });

        if (entityId) {
            const tag = await getEntityData('Tags', entityId);
            document.getElementById('entity-name').value = tag.name;
            document.getElementById('entity-active').checked = tag.isActive;
            selectedModule = tag.typeEntity || 'Visitas';
            selectedColor = tag.color || '#4654d3';

            moduleButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.module === selectedModule) btn.classList.add('active');
            });
            colorOptions.forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.color === selectedColor) opt.classList.add('active');
            });
            if (tag.name) {
                document.getElementById('entity-name').classList.add('input_filled');
            }
        }

        const registerButton = document.getElementById('register-entity');
        registerButton.addEventListener('click', async() => {
            const nameInput = document.getElementById('entity-name');
            const name = nameInput.value.trim().toUpperCase();
            if (name === "") {
                alert("Nombre de etiqueta es obligatorio");
                return;
            }
            const active = document.getElementById('entity-active').checked;
            const raw = JSON.stringify({
                "business": { "id": `${Config.currentUser.business.id}` },
                "customer": { "id": `${customerId}` },
                "name": name,
                'creationDate': `${currentDateTime().date}`,
                'creationTime': `${currentDateTime().timeHHMMSS}`,
                "isActive": active,
                "typeEntity": selectedModule,
                "color": selectedColor,
            });

            if (entityId) {
                await updateEntity('Tags', entityId, raw);
            } else {
                await registerEntity(raw, 'Tags');
            }

            setTimeout(() => {
                closeEditor();
                new Tags().render(Config.offset, Config.currentPage, infoPage.search);
            }, 1000);
        });
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
                  <h2>¿Deseas eliminar esta etiqueta?</h2>
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
                    await deleteEntity('Tags', entityId)
                        .then(res => new Tags().render(infoPage.offset, infoPage.currentPage, infoPage.search));
                    new CloseDialog().x(dialogContent);
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
}
