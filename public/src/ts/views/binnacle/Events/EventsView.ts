// @filename: EvetnsView.ts

import { Config } from "../../../Configs.js"
import { getEntityData, getEntitiesData, getFile } from "../../../endpoints.js"
import { CloseDialog, fixDate, renderRightSidebar } from "../../../tools.js"
import { InterfaceElement, InterfaceElementCollection } from "../../../types.js"
import { UIContentLayout, UIRightSidebar } from "./Layout.js"
import { UITableSkeletonTemplate } from "./Template.js"

// Local configs
const tableRows = Config.tableRows
let currentPage = Config.currentPage
const pageName = 'Eventos'

const getEvents = async (): Promise<void> => {
    const events = await getEntitiesData('Notification')
    // notificationType.name
    const removeVisitsFromList: any = events.filter((data: any) => data.notificationType.name !== "Visita")
    const removeVehicularFromList: any = removeVisitsFromList.filter((data: any) => data.notificationType.name !== 'Vehicular')
    return removeVehicularFromList
}

export class Events {
    private dialogContainer: InterfaceElement = document.getElementById('app-dialogs')
    private siebarDialogContainer: InterfaceElement = document.getElementById('entity-editor-container')
    private appContainer: InterfaceElement = document.getElementById('datatable-container')

    public render = async (): Promise<void> => {
        let eventsArray: any = await getEvents()
        this.appContainer.innerHTML = ''
        this.appContainer.innerHTML = UIContentLayout

        // Getting interface elements
        const viewTitle: InterfaceElement = document.getElementById('view-title')
        const tableBody: InterfaceElement = document.getElementById('datatable-body')

        // Changing interface element content
        viewTitle.innerText = pageName
        tableBody.innerHTML = UITableSkeletonTemplate.repeat(tableRows)

        // Exec functions
        this.load(tableBody, currentPage, eventsArray)
        this.searchNotes(tableBody, eventsArray)
        this.pagination(eventsArray, tableRows, currentPage)

        // Rendering icons
    }

    public load = (tableBody: InterfaceElement, currentPage: number, events: any): void => {
        tableBody.innerHTML = '' // clean table

        // configuring max table row size
        currentPage--
        let start: number = tableRows * currentPage
        let end: number = start + tableRows
        let paginatedItems: any = events.slice(start, end)

        // Show message if page is empty
        if (events.length === 0) {
            let row: InterfaceElement = document.createElement('TR')
            row.innerHTML = `
            <td>No existen datos<td>
            <td></td>
            <td></td>
            `

            tableBody.appendChild(row)
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let event = paginatedItems[i] // getting note items
                let row: InterfaceElement = document.createElement('TR')
                row.innerHTML += `
                    <td>${event.title}</td>
                    <td>${event.description}</td>
                    <td id="table-date">${event.creationDate}</td>
                    <td>
                        <button class="button" id="entity-details" data-entityId="${event.id}">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </button>
                    </td>
                `
                tableBody.appendChild(row)
                this.previewEvent(event.id)
                // TODO: Corret this fixer
                // fixDate()
            }
        }
    }

    private searchNotes = async (tableBody: InterfaceElement, events: any) => {
        const search: InterfaceElement = document.getElementById('search')

        await search.addEventListener('keyup', () => {
            const arrayEvents: any = events.filter((event: any) =>
                `${event.title}
                ${event.description}
                ${event.creationDate}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase())
            )

            let filteredEvents = arrayEvents.length
            let result = arrayEvents

            if (filteredEvents >= Config.tableRows) filteredEvents = Config.tableRows

            this.load(tableBody, currentPage, result)
            this.pagination(result, tableRows, currentPage)

            // Rendering icons
        })
    }

    private previewEvent = async (noteID: string): Promise<void> => {
        const openPreview: InterfaceElement = document.querySelectorAll('#entity-details')
        openPreview.forEach((preview: InterfaceElement) => {
            let currentEventId = preview.dataset.entityid
            preview.addEventListener('click', (): void => {
                previewBox(currentEventId)
            })
        })

        const previewBox = async (noteId: string): Promise<void> => {
            const event = await getEntityData('Notification', noteId)

            renderRightSidebar(UIRightSidebar)
            const sidebarContainer: InterfaceElement = document.getElementById('entity-editor-container')
            const closeSidebar: InterfaceElement = document.getElementById('close')
            closeSidebar.addEventListener('click', (): void => {
                new CloseDialog().x(sidebarContainer)
            })
            // Event details
            const _details: InterfaceElementCollection = {
                title: document.getElementById('event-title'),
                content: document.getElementById('event-content'),
                author: document.getElementById('event-author'),
                authorId: document.getElementById('event-author-id'),
                date: document.getElementById('creation-date'),
                time: document.getElementById('creation-time')
            }

            const eventCreationDateAndTime = event.creationDate.split('T')
            const eventCreationTime = eventCreationDateAndTime[1]
            const eventCreationDate = eventCreationDateAndTime[0]

            _details.title.innerText = event.title
            _details.content.innerText = event.description
            _details.author.value = `${event.user.firstName} ${event.user.lastName}`
            _details.authorId.value = event.createdBy
            _details.date.value = eventCreationDate
            _details.time.value = event.creationTime
        }
    }

    private pagination(items: [], limitRows: number, currentPage: number) {
        const tableBody: InterfaceElement = document.getElementById('datatable-body')
        const paginationWrapper: InterfaceElement = document.getElementById('pagination-container')
        paginationWrapper.innerHTML = ''

        let pageCount: number
        pageCount = Math.ceil(items.length / limitRows)

        let button: InterfaceElement

        for (let i = 1; i < pageCount + 1; i++) {
            button = setupButtons(
                i, items, currentPage, tableBody, limitRows
            )

            paginationWrapper.appendChild(button)
        }

        function setupButtons(page: any, items: any, currentPage: number, tableBody: InterfaceElement, limitRows: number) {
            const button: InterfaceElement = document.createElement('button')
            button.classList.add('pagination_button')
            button.innerText = page

            button.addEventListener('click', (): void => {
                currentPage = page
                new Events().load(tableBody, page, items)
            })

            return button
        }
    }

    private closeRightSidebar = (): void => {
        const closeButton: InterfaceElement = document.getElementById('close')

        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', (): void => {
            new CloseDialog().x(editor)
        })
    }
}
