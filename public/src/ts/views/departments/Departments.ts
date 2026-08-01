// @filename: Departments.ts

import { deleteEntity, getEntitiesData, registerEntity } from "../../endpoints.js"
import { inputObserver, inputSelect, CloseDialog } from "../../tools.js"
import { InterfaceElement } from "../../types.js"
import { Config } from "../../Configs.js"
import { tableLayout } from "./Layout.js"
import { tableLayoutTemplate } from "./Template.js"

const tableRows = Config.tableRows
const currentPage = Config.currentPage

const getDepartments = async (): Promise<void> => {
    const department: any = await getEntitiesData('Department')
    return department

}

export class Departments {
    private dialogContainer: InterfaceElement =
        document.getElementById('app-dialogs')

    private entityDialogContainer: InterfaceElement =
        document.getElementById('entity-editor-container')

    private content: InterfaceElement =
        document.getElementById('datatable-container')

    public async render(): Promise<void> {
        let data = await getDepartments()
        this.content.innerHTML = ''
        this.content.innerHTML = tableLayout
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows)
        this.load(tableBody, currentPage, data)

        this.searchEntity(tableBody, data)
    }

    public load(table: InterfaceElement, currentPage: number, data?: any) {
        table.innerHTML = ''
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = data.slice(start, end)
        if (data.length === 0) {
            let row: InterfaceElement = document.createElement('tr')
            row.innerHTML = `
        <td>los datos no coinciden con su búsqueda</td>
        <td></td>
        <td></td>
      `
            table.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let department = paginatedItems[i]
                let row: InterfaceElement =
                    document.createElement('tr')
                row.innerHTML += `
          <td>${department.name}</dt>
          <td class="entity_options">
            <button class="button" id="remove-entity" data-entityId="${department.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </dt>
        `
                table.appendChild(row)
            }
        }

        this.register()
        this.remove()
    }

    public searchEntity = async (tableBody: InterfaceElement, data: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayData: any = data.filter((user: any) =>
                `${user.firstName}
                 ${user.lastName}
                 ${user.username}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredResult = arrayData.length
            let result = arrayData
            if (filteredResult >= tableRows) filteredResult = tableRows

            this.load(tableBody, currentPage, result)

        })

    }

    public register() {
        // register entity
        const openEditor: InterfaceElement = document.getElementById('new-entity')
        openEditor.addEventListener('click', (): void => {
            renderInterface()
        })

        const renderInterface = async (): Promise<void> => {
            this.entityDialogContainer.innerHTML = ''
            this.entityDialogContainer.style.display = 'flex'
            this.entityDialogContainer.innerHTML = `
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-building"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Departamento</small></h1>
            </div>

            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>

          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre</label>
            </div>

            <div class="material_input_select">
              <label for="entity-customer">Cliente</label>
              <input type="text" id="entity-customer" class="input_select" readonly placeholder="cargando...">
              <div id="input-options" class="input_options">
              </div>
            </div>
          </div>
          <!-- END EDITOR BODY -->

          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `

            // @ts-ignore
            inputObserver()
            inputSelect('Customer', 'entity-customer')
            this.close()


            const registerButton: InterfaceElement = document.getElementById('register-entity')
            registerButton.addEventListener('click', (): void => {
                const inputsCollection: any = {
                    name: document.getElementById('entity-name'),
                    customer: document.getElementById('entity-customer'),
                }

                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value}`,
                    "customer": {
                        "id": `${inputsCollection.customer.dataset.optionid}`
                    }
                })

                registerEntity(raw, 'Department')
                setTimeout(() => {
                    const container: InterfaceElement = document.getElementById('entity-editor-container')

                    new CloseDialog().x(container)
                    new Departments().render()
                }, 1000)
            })

        }

        const reg = async (raw: any) => {
        }
    }

    public remove() {
        const remove: InterfaceElement = document.querySelectorAll('#remove-entity')
        remove.forEach((remove: InterfaceElement) => {

            const entityId = remove.dataset.entityid

            remove.addEventListener('click', (): void => {
                this.dialogContainer.style.display = 'flex'
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar este cliente?</h2>
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
        `

                // delete button
                // cancel button
                // dialog content
                const deleteButton: InterfaceElement = document.getElementById('delete')
                const cancelButton: InterfaceElement = document.getElementById('cancel')
                const dialogContent: InterfaceElement = document.getElementById('dialog-content')

                deleteButton.onclick = () => {
                    deleteEntity('Department', entityId)
                        .then(res => new Departments().render())

                    new CloseDialog().x(dialogContent)
                }

                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent)
                }
            })
        })

    }

    public close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            console.log('close')
            new CloseDialog().x(editor)
        })
    }
}


export const setNewPassword: any = async (): Promise<void> => {
    const users: any = await getEntitiesData('User')
    const FNewUsers: any = users.filter((data: any) => data.isSuper === false)

    FNewUsers.forEach((newUser: any) => {

    })
    console.group('Nuevos usuarios')
    console.log(FNewUsers)
    console.time(FNewUsers)
    console.groupEnd()
}