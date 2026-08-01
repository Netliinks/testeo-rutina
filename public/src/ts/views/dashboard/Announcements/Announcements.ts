// @filename: announcements

import { deleteEntity, getEntitiesData, getUserInfo, registerEntity } from "../../../endpoints.js";
import { CloseDialog, inputObserver, userInfo } from "../../../tools.js";
import { InterfaceElement } from "../../../types.js";
import { announcementCreatorController } from "./AnnouncementsCreatorControllers.js";

export class Announcements {
    private _newAnnouncementButton: InterfaceElement = document.getElementById('new-announcement')
    private _announcementCardContainer: InterfaceElement = document.getElementById('cards-container')
    private _announcementCardControlsContainers: InterfaceElement = document.getElementById('cards-controls-container')

    public async render(): Promise<any> {
        this._announcementCardContainer.innerHTML = ''
        this._announcementCardControlsContainers.innerHTML = ''
        const announcementsList: any = await getEntitiesData('Announcement')
        let _userinfo: any = await getUserInfo()
        let prop: any

        announcementsList.forEach((announcement: any) => {
            const _card = document.createElement('DIV')
            _card.classList.add('card')
            _card.innerHTML = `
                <button class="btn btn_remove_announcement" data-announcementid="${announcement.id}" id="remove-announcement"><i class="fa-solid fa-trash"></i></button>
                <h3 class="card_title">${announcement.title}</h3>
                <p class="card_content">${announcement.content}</p>
            `

            let _currentUserId = _userinfo.attributes.id

            this._announcementCardContainer.appendChild(_card)
            const _dotButton = document.createElement('BUTTON')
            _dotButton.classList.add('card_dotbutton')
            this._announcementCardControlsContainers.appendChild(_dotButton)

        }) // End Rendering

        this._newAnnouncementButton.addEventListener('click', (): void => {
            this.publish()
        })

        const container: InterfaceElement = document.querySelector('.cards_container')
        container.style.transform = 'translatex(0%)'

        // BUTTONS
        const _controlButtons: InterfaceElement = document.querySelectorAll('.card_dotbutton')
        _controlButtons[0].classList.add('card_dotbutton-active')
        _controlButtons.forEach((_controlButton: InterfaceElement) => {
            let index = 0;
            _controlButton.addEventListener('click', (e: any): void => {
                const parent: InterfaceElement = _controlButton.parentNode
                const grantParent: InterfaceElement = parent.parentNode
                const container: InterfaceElement = grantParent.querySelector('.cards_container')

                const childrenList = Array.from(parent.children)
                index = childrenList.indexOf(_controlButton)
                container.style.transform = `translatex(-${index * 100}%)`
                // Remove active status
                _controlButtons.forEach((_controlButton: InterfaceElement) => _controlButton.classList.remove('card_dotbutton-active'))
                // Add active status
                _controlButton.classList.add('card_dotbutton-active')
            })
        })

        this.remove()
    }

    private async publish(): Promise<void> {
        const _sidebarRightcontainer: InterfaceElement = document.getElementById('entity-editor-container')
        _sidebarRightcontainer.innerHTML = ''
        _sidebarRightcontainer.style.display = 'flex'
        _sidebarRightcontainer.innerHTML = announcementCreatorController

        this.post()
        this.close()
        inputObserver()
    }

    private async post(): Promise<void> {
        const _buttonPostAnnouncement: InterfaceElement = document.getElementById('post-announcement')
        const _announcementTitle: InterfaceElement = document.getElementById('announcement-title')
        const _announcementContent: InterfaceElement = document.getElementById('announcement-content')

        _buttonPostAnnouncement.addEventListener('click', async (): Promise<void> => {
            let _userInfo: any = await userInfo
            const _date = new Date()
            // TIME
            const _hours: number = _date.getHours()
            const _minutes: number = _date.getMinutes()
            const _seconds: number = _date.getSeconds()
            const _fixedHours: string = ('0' + _hours).slice(-2)
            const _fixedMinutes: string = ('0' + _minutes).slice(-2)
            const _fixedSeconds: string = ('0' + _seconds).slice(-2)
            const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`
            // DATE
            const _day: number = _date.getDate()
            const _month: number = _date.getMonth() + 1
            const _year: number = _date.getFullYear()
            const date: string = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`

            // RAW
            const announcementRaw: string = JSON.stringify({
                "title": `${_announcementTitle.value}`,
                "content": `${_announcementContent.value}`,
                "user": {
                    "id": `${_userInfo.attributes.id}`
                },
                "creationTime": `${currentTime}`,
                "creationDate": `${date}`
            })

            if (_announcementTitle.value === '') {
                alert('El campo "título" no puede estar vacío')
            } else if (_announcementContent.value === '') {
                alert('El campo "Contenido" no puede estar vacío')
            } else {
                await registerEntity(announcementRaw, 'Announcement')
                    .then(res => {
                        setTimeout((): void => {
                            const container = document.getElementById('entity-editor-container')
                            new CloseDialog().x(container)
                            this.render()
                        }, 1000)
                    })
            }

        })
    }

    private async remove(): Promise<void> {
        // Remove Announcement
        const _removeAnnouncementButtons: InterfaceElement = document.querySelectorAll('#remove-announcement')
        _removeAnnouncementButtons.forEach((button: InterfaceElement) => {
            button.addEventListener('click', (): void => {
                let announcementId: string = button.dataset.announcementid
                deleteEntity('Announcement', announcementId)
                    .then(res => {
                        setTimeout((): void => {
                            this.render()
                        }, 100)
                    })
            })
        });
    }

    private close(): void {
        const closeButton: InterfaceElement = document.getElementById('close')
        const editor: InterfaceElement = document.getElementById('entity-editor-container')

        closeButton.addEventListener('click', () => {
            new CloseDialog().x(editor)
        }, false)
    }
}
