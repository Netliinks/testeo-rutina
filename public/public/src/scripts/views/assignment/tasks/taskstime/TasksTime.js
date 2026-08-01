// @filename: Fixed.ts
import { deleteEntity, getEntitiesData, registerEntity, updateEntity, getEntityData,setFile,getUserInfo,getFile,postNotificationPush } from "../../../../endpoints.js";
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType } from "../../../../tools.js";
import { Config } from "../../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";

const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
const getTaksTime= async () => {
    //nombre de la entidad
    const TaksTime = await getEntitiesData('TaskTime');
    const FCustomer = TaksTime.filter((data) => `${data.customer?.id}` === `${customerId}`);
    return FCustomer;
};
export class TasksTime {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody, data) => {
            const search = document.getElementById('search');
            await search.addEventListener('keyup', () => {
                const arrayData = data.filter((user) => `${user.name}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredResult = arrayData.length;
                let result = arrayData;
                if (filteredResult >= tableRows)
                    filteredResult = tableRows;
                this.load(tableBody, currentPage, result);
                this.pagination(result, tableRows, currentPage);
            });
        };
    }
    
    async render() {
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = '.Cargando...';
        let data = await getTaksTime();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody, data);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, currentPage);
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
                let taskFixed = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${taskFixed.name}</dt>
          
          <td>${taskFixed.execTime}</dt>
          <td class="entity_options">
            <button class="button" id="edit-entity" data-entityId="${taskFixed.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="button" id="remove-entity" data-entityId="${taskFixed.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </dt>
        `;
                table.appendChild(row);
            }
        }
        this.edit(this.entityDialogContainer, data);
        this.register(); 
        this.remove();
        
        //FUNCION PARA DESCARGAR EL ARCHIVO
        

    }
    
    pagination(items, limitRows, currentPage) {
      const tableBody = document.getElementById('datatable-body');
      const paginationWrapper = document.getElementById('pagination-container');
      paginationWrapper.innerHTML = '';
      let pageCount;
      pageCount = Math.ceil(items.length / limitRows);
      let button;
      for (let i = 1; i < pageCount + 1; i++) {
          button = setupButtons(i, items, currentPage, tableBody, limitRows);
          paginationWrapper.appendChild(button);
      }
      function setupButtons(page, items, currentPage, tableBody, limitRows) {
          const button = document.createElement('button');
          button.classList.add('pagination_button');
          button.innerText = page;
          button.addEventListener('click', () => {
              currentPage = page;
              new TaksTime().load(tableBody, page, items);
          });
          return button;
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
              <div class="avatar"><i class="fa-solid fa-building"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Tiempo</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            
            <div class="form_group">
                <div class="form_input">
                    <label class="form_label" for="tasktime">Horas:</label>
                    <input type="radio" class="input_time input_tasktime" id="tasktime" name="tasktime">
                </div>
                <div class="form_input">
                  <label class="form_label" for="tasktime">Días:</label>
                  <input type="radio" class="input_time input_tasktime" id="tasktime" name="tasktime">
                </div>
               
            </div>
            <br>
            <br> 
            <div class="material_input">
              <input type="number" id="entity-name" autocomplete="none" required>
              <label for="entity-name"></label>
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
            const _fileHandler = document.getElementById('file-handler');
            const registerButton = document.getElementById('register-entity');
            const fecha = new Date();
            const day = fecha.getDate();
            const month = fecha.getMonth() + 1; 
            const year = fecha.getFullYear();

            const dateFormat = year + '-' + month + '-' + day;
            
            const hour = fecha.getHours();
            const minutes  = fecha.getMinutes();
            const seconds = fecha.getSeconds();

            const hourFormat = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

   
            registerButton.addEventListener('click', async(e) => {
                e.preventDefault();
               
                const tasktime = document.getElementById('tasktime')
                
                if(tasktime.value.trim() === '' || tasktime.value.trim() === null){
                  alert('Debe especificar la hora de ejecución de la consigna')
                }
                else{
                  const inputsCollection = {
                      tasktime: tasktime
                      
                    
                  };
                  let _userInfo = await getUserInfo();
                  const customerId = localStorage.getItem('customer_id');
                  
                  const raw = JSON.stringify({
                      "timeTask": `${inputsCollection.tasktime.value}`,
                   
                      "user":  {
                        "id": `${_userInfo['attributes']['id']}`
                      },   
                      "customer": {
                          "id": `${customerId}`
                      },
                   
                      
                  });
                  
                  
                  registerEntity(raw, 'TaskTime');
                  
                
                  setTimeout(() => {
                      const container = document.getElementById('entity-editor-container');
                      new CloseDialog().x(container);
                      new Fixed().render();
                  }, 1000);
                }
            });
          
            
        };
       
    }
    edit(container, data) {
      // Edit entity
      const edit = document.querySelectorAll('#edit-entity');
      edit.forEach((edit) => {
          const entityId = edit.dataset.entityid;
          edit.addEventListener('click', () => {
              RInterface('TaskTime', entityId);
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
                  <div class="avatar"><i class="fa-regular fa-user"></i></div>
                  <h1 class="entity_editor_title">Editar <br><small>${data.name} </small></h1>
                  </div>

                  <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
              </div>

              <!-- EDITOR BODY -->
              <div class="entity_editor_body">
                  <div class="material_input">
                    <input type="text" id="entity-name" class="input_filled" value="${data.name}" >
                    <label for="entity-name">Nombre</label>
                  </div>
                  <div class="form_group">
                      <div class="form_input">
                          <label class="form_label" for="execution-time">Hora de ejecución:</label>
                          <input type="time" class="input_time input_time-execution" id="execution-time" name="execution-time" value="${data.execTime}">
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
          UUpdate(entityID);
      };
      const UUpdate = async (entityId) => {
          const updateButton = document.getElementById('update-changes');
          const $value = {
            // @ts-ignore
            name: document.getElementById('entity-name'),
            // @ts-ignore
            execTime: document.getElementById('execution-time'),
            // @ts-ignore
           
           
        };
          updateButton.addEventListener('click', (e) => {
            e.preventDefault()
            const name = document.getElementById('entity-name')
            const executionTime = document.getElementById('execution-time')
                if(name.value.trim() === '' || name.value.trim() === null){
                  alert('Nombre del consigna fija vacío')
                }
                else if(executionTime.value.trim() === '' || executionTime.value.trim() === null){
                  alert('Debe especificar la hora de ejecución de la consigna')
                }
                else{
                  let raw = JSON.stringify({
                      // @ts-ignore
                      "name": `${$value.name.value}`,
                      // @ts-ignore
                      "execTime": `${$value.execTime.value}`,
                      
                  });
                  update(raw);
                }
          });
          const update = (raw) => {
            updateEntity('TaskTime', entityId, raw)
                .then((res) => {
                setTimeout(async () => {
                    let tableBody;
                    let container;
                    let data;
                    data = await getTaksTime();
                    new CloseDialog()
                        .x(container =
                        document.getElementById('entity-editor-container'));
                    new Fixed().load(tableBody
                        = document.getElementById('datatable-body'), currentPage, data);
                }, 100);
            });
        };
        const data = {"title": "Notificación fija", "body":`${$value.name.value}` }
        const envioPush = await postNotificationPush(data);
      };
  }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            console.log(entityId)
            remove.addEventListener('click', () => {
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este Consigna fija?</h2>
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
                // delete button
                // cancel button
                // dialog content
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = () => {
                    deleteEntity('TaskTime', entityId)
                        .then(res => new Fixed().render());
                    new CloseDialog().x(dialogContent);
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            console.log('close');
            new CloseDialog().x(editor);
        });
    }
}
export const setNewPassword = async () => {
    const users = await getEntitiesData('User');
    const FNewUsers = users.filter((data) => data.isSuper === false);
    FNewUsers.forEach((newUser) => {
    });
    console.group('Nuevos usuarios');
    console.log(FNewUsers);
    console.time(FNewUsers);
    console.groupEnd();
};
