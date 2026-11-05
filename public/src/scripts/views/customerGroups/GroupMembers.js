// @filename: GroupMembers.js
import {
    getGroupMembersForManagement,
    getAvailableCustomersForGroup,
    addMemberToGroupApi,
    deleteControllerEntity,
    updateGroupControllerApi,
    listCustomerGroups
} from "../../endpoints.js";
import { CloseDialog, renderRightSidebar, fillBtnPagination, pageNumbers } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayoutGroupMembers } from "./Layout.js";
import { CustomerGroups } from "./CustomerGroups.js";

const tableRows = Config.tableRows;
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: Config.currentPage,
    search: ""
};

export class GroupMembers {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
    }

    async render(groupId, groupInfo, offset = Config.offset, actualPage = Config.currentPage, search = "") {
        this.groupId = groupId;
        this.groupInfo = groupInfo || {};
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;

        this.content.innerHTML = '';
        this.content.innerHTML = tableLayoutGroupMembers;

        // Populate Banner
        const nameSpan = document.getElementById('banner-group-name');
        const applicantSpan = document.getElementById('banner-applicant');
        const controllerSpan = document.getElementById('banner-controller');

        if (nameSpan) nameSpan.innerText = this.groupInfo.groupName || 'Sin Nombre';
        if (applicantSpan) applicantSpan.innerText = this.groupInfo.applicant || 'Sin definir';
        if (controllerSpan) {
            controllerSpan.innerText = this.groupInfo.controllerCustomerName ? `${this.groupInfo.controllerCustomerName}` : 'Sin Asignar';
        }

        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = 'Cargando miembros...';

        const dataResponse = await getGroupMembersForManagement(this.groupId, infoPage.search, infoPage.offset, tableRows);
        infoPage.count = dataResponse?.totalElements ?? 0;
        const members = dataResponse?.content ?? [];

        this.load(tableBody, members);
        this.setupSearch();
        this.setupBannerActions(members);
        this.pagination(members, tableRows, infoPage.currentPage);
    }

    load(table, members) {
        table.innerHTML = '';
        if (!members || members.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>No existen integrantes registrados en este grupo</td>
                <td></td>
                <td></td>
                <td></td>
            `;
            table.appendChild(row);
            return;
        }

        for (let i = 0; i < members.length; i++) {
            let m = members[i];
            let isControllerBadge = m.isController ? ' <span class="tag" style="background-color:#4CAF50;color:white;padding:2px 8px;border-radius:4px;font-size:0.8em;margin-left:6px;">Controlador</span>' : '';
            let stateBadge = m.customerState === 'Enabled' ? '<span class="tag" style="background-color:#28a745;color:white;padding:2px 6px;border-radius:4px;">Activo</span>' : `<span class="tag" style="background-color:#dc3545;color:white;padding:2px 6px;border-radius:4px;">${m.customerState || 'Inactivo'}</span>`;

            let row = document.createElement('tr');
            row.innerHTML = `
                <td style="white-space: nowrap;"><strong>${m.customerName || ''}</strong>${isControllerBadge}</td>
                <td>${m.customerRuc || ''}</td>
                <td>${stateBadge}</td>
                <td class="entity_options">
                    ${!m.isController ? `<button class="btn btn_edit" id="set-controller-btn" data-customerid="${m.customerId}" data-customername="${m.customerName}" title="Designar como Empresa Controladora"><i class="fa-solid fa-crown"></i></button>` : ''}
                    <button class="button" id="remove-member-btn" data-memberid="${m.memberId}" data-customername="${m.customerName}" title="Remover del grupo">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        }

        this.setupRowActions();
    }

    setupSearch() {
        const searchInput = document.getElementById('search-member');
        const btnSearch = document.getElementById('btnSearchMember');

        if (searchInput) searchInput.value = infoPage.search;
        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                const val = searchInput ? searchInput.value.trim() : "";
                new GroupMembers().render(this.groupId, this.groupInfo, Config.offset, Config.currentPage, val);
            });
        }
    }

    setupBannerActions(currentMembers) {
        // Back to groups
        const btnBack = document.getElementById('btn-back-groups');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                new CustomerGroups().render(Config.offset, Config.currentPage, "");
            });
        }

        // Add Member
        const btnAdd = document.getElementById('new-member');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openAddMemberModal());
        }

        // Change Controller
        const btnChangeController = document.getElementById('btn-change-controller');
        if (btnChangeController) {
            btnChangeController.addEventListener('click', () => this.openChangeControllerModal(currentMembers));
        }
    }

    setupRowActions() {
        // Set controller from row
        const setCtrlBtns = document.querySelectorAll('#set-controller-btn');
        setCtrlBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const customerId = btn.dataset.customerid;
                const customerName = btn.dataset.customername;
                if (confirm(`¿Desea designar a "${customerName}" como la empresa controladora del grupo?`)) {
                    try {
                        await updateGroupControllerApi(this.groupId, customerId);
                        this.groupInfo.controllerCustomerName = customerName;
                        this.groupInfo.controllerCustomerId = customerId;
                        alert(`Empresa controladora actualizada a: ${customerName}`);
                        new GroupMembers().render(this.groupId, this.groupInfo, infoPage.offset, infoPage.currentPage, infoPage.search);
                    } catch (err) {
                        alert(`Error actualizando controladora: ${err.message}`);
                    }
                }
            });
        });

        // Remove member from row
        const removeBtns = document.querySelectorAll('#remove-member-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const memberId = btn.dataset.memberid;
                const customerName = btn.dataset.customername;
                if (confirm(`¿Desea remover a "${customerName}" de este grupo?`)) {
                    try {
                        await deleteControllerEntity(memberId, 'customer-groups/members');
                        alert(`Se removió a "${customerName}" del grupo.`);
                        new GroupMembers().render(this.groupId, this.groupInfo, infoPage.offset, infoPage.currentPage, infoPage.search);
                    } catch (err) {
                        alert(`Error al remover integrante: ${err.message}`);
                    }
                }
            });
        });
    }

    async openAddMemberModal() {
        let availOffset = 0;
        let availPage = 1;
        let availSearch = "";

        const loadAvailPage = async () => {
            const listContainer = document.getElementById('avail-customers-container');
            if (listContainer) listContainer.innerHTML = 'Cargando empresas disponibles...';

            const availableData = await getAvailableCustomersForGroup(availSearch, availOffset, tableRows);
            const totalAvail = availableData?.totalElements ?? 0;
            const customers = availableData?.content ?? [];

            let customersListHtml = '';
            if (customers.length === 0) {
                customersListHtml = '<p style="padding: 12px; color: #6c757d;">No hay empresas clientes disponibles para agregar.</p>';
            } else {
                customersListHtml = customers.map(c => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                        <div>
                            <strong>${c.name}</strong><br>
                            <small style="color: #6c757d;">RUC: ${c.ruc || 'N/A'}</small>
                        </div>
                        <button class="btn btn_save" id="btn-add-customer-row" data-customerid="${c.id}" data-customername="${c.name}" style="padding: 4px 12px; font-size: 0.85em;">
                            <i class="fa-solid fa-plus"></i> Agregar
                        </button>
                    </div>
                `).join('');
            }

            if (listContainer) listContainer.innerHTML = customersListHtml;

            const totalAvailPages = Math.ceil(totalAvail / tableRows);
            const pgnInfo = document.getElementById('avail-pgn-info');
            const btnPrevPgn = document.getElementById('avail-prev-page');
            const btnNextPgn = document.getElementById('avail-next-page');

            if (pgnInfo) pgnInfo.innerText = `Página ${availPage} de ${totalAvailPages || 1} (${totalAvail} disponibles)`;
            if (btnPrevPgn) btnPrevPgn.disabled = availPage <= 1;
            if (btnNextPgn) btnNextPgn.disabled = availPage >= totalAvailPages || totalAvailPages === 0;

            const addRowBtns = document.querySelectorAll('#btn-add-customer-row');
            addRowBtns.forEach(b => {
                b.addEventListener('click', async () => {
                    const cid = b.dataset.customerid;
                    const cname = b.dataset.customername;
                    try {
                        await addMemberToGroupApi(this.groupId, cid);
                        alert(`"${cname}" agregada exitosamente al grupo.`);
                        closeSidebar();
                        new GroupMembers().render(this.groupId, this.groupInfo, infoPage.offset, infoPage.currentPage, infoPage.search);
                    } catch (err) {
                        alert(`Error agregando integrante: ${err.message}`);
                    }
                });
            });
        };

        renderRightSidebar(`
            <div class="entity_editor" id="entity-editor" style="width: 480px;">
                <div class="entity_editor_header">
                    <div class="user_info">
                        <div class="avatar"><i class="fa-solid fa-user-plus"></i></div>
                        <h1 class="entity_editor_title">Agregar <br><small>Empresa Integrante</small></h1>
                    </div>
                    <button class="btn btn_close_editor" id="close-modal"><i class="fa-regular fa-x"></i></button>
                </div>

                <div class="entity_editor_body" style="display: flex; flex-direction: column; max-height: 480px; overflow: hidden;">
                    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-shrink: 0;">
                        <input type="text" id="search-avail-input" class="search_input" placeholder="Buscar por nombre o RUC" style="flex: 1; box-sizing: border-box;">
                        <button class="btn btn_save" id="btn-search-avail-modal" style="padding: 6px 12px;"><i class="fa-solid fa-search"></i></button>
                    </div>

                    <div id="avail-customers-container" style="flex: 1; min-height: 200px; max-height: 300px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 4px; padding: 4px;">
                        Cargando...
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px; font-size: 0.85em; border-top: 1px solid #ddd; padding-top: 10px; background: #fff; flex-shrink: 0;">
                        <button class="btn btn_cancel" id="avail-prev-page" style="padding: 4px 8px;"><i class="fa-solid fa-chevron-left"></i> Anterior</button>
                        <span id="avail-pgn-info">Página 1</span>
                        <button class="btn btn_cancel" id="avail-next-page" style="padding: 4px 8px;">Siguiente <i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>

                <div class="entity_editor_footer" style="padding: 16px; text-align: right;">
                    <button class="btn btn_cancel" id="cancel-modal">Cerrar</button>
                </div>
            </div>
        `);

        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-modal');
        const searchInput = document.getElementById('search-avail-input');
        const btnSearchModal = document.getElementById('btn-search-avail-modal');

        const closeSidebar = () => new CloseDialog().x(this.entityDialogContainer);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (cancelBtn) cancelBtn.addEventListener('click', closeSidebar);

        await loadAvailPage();

        const doSearchModal = () => {
            availSearch = searchInput ? searchInput.value.trim() : "";
            availOffset = 0;
            availPage = 1;
            loadAvailPage();
        };

        if (btnSearchModal) btnSearchModal.addEventListener('click', doSearchModal);
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') doSearchModal();
            });
        }

        document.getElementById('avail-prev-page')?.addEventListener('click', () => {
            if (availPage > 1) {
                availPage--;
                availOffset = (availPage - 1) * tableRows;
                loadAvailPage();
            }
        });

        document.getElementById('avail-next-page')?.addEventListener('click', () => {
            availPage++;
            availOffset = (availPage - 1) * tableRows;
            loadAvailPage();
        });
    }

    openChangeControllerModal(members) {
        let optionsHtml = `
            <label style="display: block; margin-bottom: 10px; cursor: pointer; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="radio" name="rd-ctrl-select" value="" ${!this.groupInfo.controllerCustomerId ? 'checked' : ''}>
                <em>Sin empresa controladora (remover)</em>
            </label>
        `;

        if (members && members.length > 0) {
            optionsHtml += members.map(m => `
                <label style="display: block; margin-bottom: 8px; cursor: pointer; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <input type="radio" name="rd-ctrl-select" value="${m.customerId}" ${this.groupInfo.controllerCustomerId === m.customerId ? 'checked' : ''}>
                    <strong>${m.customerName}</strong> (RUC: ${m.customerRuc || 'N/A'})
                </label>
            `).join('');
        }

        renderRightSidebar(`
            <div class="entity_editor" id="entity-editor" style="width: 450px;">
                <div class="entity_editor_header">
                    <div class="user_info">
                        <div class="avatar"><i class="fa-solid fa-crown"></i></div>
                        <h1 class="entity_editor_title">Designar <br><small>Empresa Controladora</small></h1>
                    </div>
                    <button class="btn btn_close_editor" id="close-modal"><i class="fa-regular fa-x"></i></button>
                </div>

                <div class="entity_editor_body" style="max-height: 400px; overflow-y: auto;">
                    <p style="margin-bottom: 12px; font-size: 0.9em; color: #555;">Seleccione cuál de las empresas integrantes asumirá el rol de controladora del grupo:</p>
                    ${optionsHtml}
                </div>

                <div class="entity_editor_footer" style="padding: 16px 24px; text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                    <button class="ng-btn ng-btn-secondary" id="cancel-modal">Cancelar</button>
                    <button class="ng-btn ng-btn-primary" id="save-ctrl-modal"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
                </div>
            </div>
        `);

        const closeBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-modal');
        const saveBtn = document.getElementById('save-ctrl-modal');
        const closeSidebar = () => new CloseDialog().x(this.entityDialogContainer);

        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (cancelBtn) cancelBtn.addEventListener('click', closeSidebar);

        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const selectedRadio = document.querySelector('input[name="rd-ctrl-select"]:checked');
                const selectedCustomerId = selectedRadio ? selectedRadio.value : '';

                try {
                    await updateGroupControllerApi(this.groupId, selectedCustomerId);
                    alert("Empresa controladora actualizada exitosamente.");
                    closeSidebar();

                    // Reload group details
                    const groupsResponse = await listCustomerGroups("", "", 0, 100);
                    const updatedGroup = groupsResponse?.content?.find(g => g.groupId === this.groupId);
                    if (updatedGroup) {
                        this.groupInfo = updatedGroup;
                    } else {
                        this.groupInfo.controllerCustomerId = selectedCustomerId;
                    }

                    new GroupMembers().render(this.groupId, this.groupInfo, infoPage.offset, infoPage.currentPage, infoPage.search);
                } catch (err) {
                    alert(`Error actualizando controladora: ${err.message}`);
                }
            });
        }
    }

    pagination(items, limitRows, currentPage) {
        const paginationWrapper = document.getElementById('pagination-container');
        if (!paginationWrapper) return;
        paginationWrapper.innerHTML = '';

        let pageCount = Math.ceil(infoPage.count / limitRows);
        if (pageCount <= 1) return;

        let button;
        if (pageCount <= Config.maxLimitPage) {
            for (let i = 1; i <= pageCount; i++) {
                button = setupButtons(i);
                paginationWrapper.appendChild(button);
            }
            fillBtnPagination(currentPage, Config.colorPagination);
        } else {
            pagesOptions(items, currentPage);
        }

        const self = this;
        function setupButtons(page) {
            const btn = document.createElement('button');
            btn.classList.add('pagination_button');
            btn.setAttribute("name", "pagination-button");
            btn.setAttribute("id", "btnPag" + page);
            btn.innerText = page;
            btn.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (page - 1);
                currentPage = page;
                self.render(self.groupId, self.groupInfo, infoPage.offset, currentPage, infoPage.search);
            });
            return btn;
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

            prevButton.addEventListener('click', () => {
                self.render(self.groupId, self.groupInfo, Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                self.render(self.groupId, self.groupInfo, infoPage.offset, pageCount, infoPage.search);
            });
        }
    }
}
