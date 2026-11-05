// @filename: CustomerGroups.js
import {
    listCustomerGroups,
    getAvailableCustomersForGroup,
    createCustomerGroupApi,
    updateCustomerGroupApi,
    addMemberToGroupApi,
    deleteControllerEntity
} from "../../endpoints.js";
import { CloseDialog, renderRightSidebar, fillBtnPagination, pageNumbers } from "../../tools.js";
import { Config } from "../../Configs.js";
import { tableLayoutGroups } from "./Layout.js";
import { GroupMembers } from "./GroupMembers.js";

const tableRows = Config.tableRows;
let infoPage = {
    count: 0,
    offset: Config.offset,
    currentPage: Config.currentPage,
    search: "",
    activeFilter: "" // Muestra tanto activos como inactivos por defecto
};

export class CustomerGroups {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
    }

    async render(offset = Config.offset, actualPage = Config.currentPage, search = "") {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;

        this.content.innerHTML = '';
        this.content.innerHTML = tableLayoutGroups;

        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = 'Cargando grupos...';

        const filterActiveSelect = document.getElementById('filter-active');
        if (filterActiveSelect) {
            filterActiveSelect.value = infoPage.activeFilter;
        }

        const dataResponse = await listCustomerGroups(infoPage.activeFilter, infoPage.search, infoPage.offset, tableRows);
        infoPage.count = dataResponse?.totalElements ?? 0;
        const groups = dataResponse?.content ?? [];

        this.load(tableBody, groups);
        this.setupFilters();
        this.setupCreateGroupButton();
        this.pagination(groups, tableRows, infoPage.currentPage);
    }

    load(table, groups) {
        table.innerHTML = '';
        if (!groups || groups.length === 0) {
            let row = document.createElement('tr');
            row.innerHTML = `
                <td>No existen grupos registrados</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
            `;
            table.appendChild(row);
            return;
        }

        for (let i = 0; i < groups.length; i++) {
            let g = groups[i];
            let activeBadge = g.groupActive
                ? '<span class="tag" style="background-color:#28a745;color:white;padding:2px 8px;border-radius:4px;">Activo</span>'
                : '<span class="tag" style="background-color:#dc3545;color:white;padding:2px 8px;border-radius:4px;">Inactivo</span>';

            let row = document.createElement('tr');
            row.innerHTML = `
                <td style="white-space: nowrap;"><strong>${g.groupName || 'Sin Nombre'}</strong></td>
                <td>${g.applicant || 'N/A'}</td>
                <td>${g.controllerCustomerName ? `<i class="fa-solid fa-crown" style="color:#ffc107;"></i> ${g.controllerCustomerName}` : '<em style="color:#6c757d;">Sin asignar</em>'}</td>
                <td style="text-align: center;"><strong>${g.activeMembersCount || 0}</strong></td>
                <td>${activeBadge}</td>
                <td class="entity_options">
                    <button class="btn btn_edit" id="view-members" data-groupid="${g.groupId}" title="Ver Integrantes del Grupo">
                        <i class="fa-solid fa-users"></i>
                    </button>
                    <button class="btn btn_edit" id="edit-group" data-groupid="${g.groupId}" title="Editar Grupo">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="button" id="remove-group" data-groupid="${g.groupId}" data-groupname="${g.groupName}" title="Eliminar Grupo">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            table.appendChild(row);
        }

        this.setupRowActions(groups);
    }

    setupFilters() {
        const searchInput = document.getElementById('search');
        const btnSearch = document.getElementById('btnSearch');
        const filterActiveSelect = document.getElementById('filter-active');

        if (searchInput) searchInput.value = infoPage.search;

        if (btnSearch) {
            btnSearch.addEventListener('click', () => {
                const searchVal = searchInput ? searchInput.value.trim() : "";
                new CustomerGroups().render(Config.offset, Config.currentPage, searchVal);
            });
        }

        if (filterActiveSelect) {
            filterActiveSelect.addEventListener('change', () => {
                infoPage.activeFilter = filterActiveSelect.value;
                new CustomerGroups().render(Config.offset, Config.currentPage, infoPage.search);
            });
        }
    }

    setupRowActions(groups) {
        // View members
        const viewBtns = document.querySelectorAll('#view-members');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const groupId = btn.dataset.groupid;
                const groupObj = groups.find(g => g.groupId === groupId);
                new GroupMembers().render(groupId, groupObj);
            });
        });

        // Edit group
        const editBtns = document.querySelectorAll('#edit-group');
        editBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const groupId = btn.dataset.groupid;
                const groupObj = groups.find(g => g.groupId === groupId);
                if (groupObj) this.openEditGroupModal(groupObj);
            });
        });

        // Remove group
        const removeBtns = document.querySelectorAll('#remove-group');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const groupId = btn.dataset.groupid;
                const groupName = btn.dataset.groupname;
                if (confirm(`¿Está seguro de eliminar el grupo "${groupName}"? Todos sus miembros quedarán desasignados.`)) {
                    try {
                        await deleteControllerEntity(groupId, 'customer-groups');
                        alert(`Grupo "${groupName}" eliminado correctamente.`);
                        new CustomerGroups().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                    } catch (err) {
                        alert(`Error eliminando el grupo: ${err.message}`);
                    }
                }
            });
        });
    }

    setupCreateGroupButton() {
        const btnNewGroup = document.getElementById('new-group');
        if (btnNewGroup) {
            btnNewGroup.addEventListener('click', () => this.renderWizard());
        }
    }

    openCreateWizardModal() {
        this.renderWizard();
    }

    // =======================================================
    // WIZARD CREADOR DE GRUPO EN 4 PASOS (ESTILO ROUTINES)
    // =======================================================
    async renderWizard() {
        let currentStep = 1;
        let wizardData = {
            name: '',
            applicant: '',
            selectedCustomers: [], // [{ id, name, ruc }]
            controllerCustomerId: ''
        };

        let wzAvailOffset = 0;
        let wzAvailPage = 1;
        let wzAvailSearch = "";

        const drawWizardStep = async () => {
            let stepContent = '';

            if (currentStep === 1) {
                stepContent = `
                    <div class="ng-card">
                        <div class="ng-card-header">
                            <h3 class="ng-card-title"><i class="fa-solid fa-file-signature" style="color:var(--ng-accent);"></i> Paso 1: Datos Principales del Grupo</h3>
                        </div>

                        <div class="ng-form-group">
                            <label class="ng-label" for="wizard-name">Nombre del Grupo *</label>
                            <input type="text" class="ng-input" id="wizard-name" value="${wizardData.name}" placeholder="Ej: GRUPO CORPORATIVO ALFA" autocomplete="off">
                        </div>

                        <div class="ng-form-group" style="margin-bottom:0;">
                            <label class="ng-label" for="wizard-applicant">Solicitante / Referencia</label>
                            <input type="text" class="ng-input" id="wizard-applicant" value="${wizardData.applicant}" placeholder="Ej: JUAN PEREZ - GERENCIA GENERAL" autocomplete="off">
                        </div>
                    </div>
                `;
            } else if (currentStep === 2) {
                let selectedBadgesHtml = wizardData.selectedCustomers.length === 0
                    ? `<p style="color:var(--ng-text-muted); font-size:13px; margin:0;">No ha seleccionado ninguna empresa aún.</p>`
                    : wizardData.selectedCustomers.map((sc, idx) => `
                        <span class="ng-badge ng-badge-info" style="display:inline-flex; align-items:center; gap:6px; margin:2px 4px; padding:6px 10px; font-size:12px;">
                            <i class="fa-solid fa-building"></i> <strong>${sc.name}</strong>
                            <button class="remove-selected-cust" data-idx="${idx}" title="Quitar" style="border:none; background:transparent; color:#dc2626; cursor:pointer; font-size:12px; padding:0 2px;">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </span>
                    `).join('');

                stepContent = `
                    <div class="ng-card">
                        <div class="ng-card-header" style="flex-wrap:wrap; gap:10px;">
                            <h3 class="ng-card-title"><i class="fa-solid fa-building-user" style="color:var(--ng-accent);"></i> Paso 2: Seleccionar Empresas Integrantes</h3>
                            <span class="ng-badge ng-badge-ok">
                                <i class="fa-solid fa-check-double"></i> ${wizardData.selectedCustomers.length} Seleccionada(s)
                            </span>
                        </div>

                        <!-- BUSCADOR DE EMPRESAS -->
                        <div style="display:flex; gap:8px; margin-bottom:14px;">
                            <input type="text" id="wz-search-cust" class="ng-input" value="${wzAvailSearch}" placeholder="Buscar empresa disponible por nombre o RUC..." style="flex:1;">
                            <button class="ng-btn ng-btn-primary" id="wz-btn-search-cust"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
                        </div>

                        <!-- LISTA DE EMPRESAS DISPONIBLES -->
                        <div id="wz-avail-customers-list" style="border:1px solid var(--ng-border); border-radius:8px; padding:8px; max-height:260px; overflow-y:auto; margin-bottom:12px; background:#fff;">
                            <div style="padding:12px; text-align:center; color:var(--ng-text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Cargando empresas disponibles...</div>
                        </div>

                        <!-- PAGINACIÓN DE EMPRESAS -->
                        <div style="display:flex; align-items:center; justify-content:space-between; padding-top:8px; border-top:1px solid var(--ng-border); font-size:13px; margin-bottom:16px;">
                            <button class="ng-btn ng-btn-secondary" id="wz-avail-prev-page" style="padding:4px 10px;"><i class="fa-solid fa-chevron-left"></i> Anterior</button>
                            <span id="wz-avail-pgn-info" style="font-weight:600; color:var(--ng-text-muted);">Cargando...</span>
                            <button class="ng-btn ng-btn-secondary" id="wz-avail-next-page" style="padding:4px 10px;">Siguiente <i class="fa-solid fa-chevron-right"></i></button>
                        </div>

                        <!-- SELECCIONADOS ACTUALES -->
                        <div style="background:var(--ng-surface-2); padding:12px; border-radius:8px; border:1px solid var(--ng-border);">
                            <label class="ng-label" style="margin-bottom:8px;">Empresas Integrantes Seleccionadas (${wizardData.selectedCustomers.length}):</label>
                            <div id="selected-customers-container" style="display:flex; flex-wrap:wrap; gap:4px;">
                                ${selectedBadgesHtml}
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentStep === 3) {
                let radioOptionsHtml = `
                    <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--ng-border); border-radius:8px; margin-bottom:10px; cursor:pointer; background:${!wizardData.controllerCustomerId ? 'var(--ng-surface-2)' : '#fff'};">
                        <input type="radio" name="wz-ctrl-radio" value="" ${!wizardData.controllerCustomerId ? 'checked' : ''}>
                        <div>
                            <strong>Sin empresa controladora</strong>
                            <div style="font-size:12px; color:var(--ng-text-muted);">El grupo no tendrá una empresa principal designada.</div>
                        </div>
                    </label>
                `;

                radioOptionsHtml += wizardData.selectedCustomers.map(c => `
                    <label style="display:flex; align-items:center; gap:10px; padding:12px; border:1px solid var(--ng-border); border-radius:8px; margin-bottom:8px; cursor:pointer; background:${wizardData.controllerCustomerId === c.id ? 'var(--ng-surface-2)' : '#fff'};">
                        <input type="radio" name="wz-ctrl-radio" value="${c.id}" ${wizardData.controllerCustomerId === c.id ? 'checked' : ''}>
                        <div style="flex:1;">
                            <strong style="color:var(--ng-primary);"><i class="fa-solid fa-building"></i> ${c.name}</strong>
                            <div style="font-size:12px; color:var(--ng-text-muted);">RUC: ${c.ruc || 'N/A'}</div>
                        </div>
                        ${wizardData.controllerCustomerId === c.id ? '<span class="ng-badge ng-badge-ok"><i class="fa-solid fa-crown" style="color:#ffc107;"></i> Controladora</span>' : ''}
                    </label>
                `).join('');

                stepContent = `
                    <div class="ng-card">
                        <div class="ng-card-header">
                            <h3 class="ng-card-title"><i class="fa-solid fa-crown" style="color:var(--ng-accent);"></i> Paso 3: Designar Empresa Controladora</h3>
                        </div>

                        <p style="color:var(--ng-text-muted); font-size:13.5px; margin-bottom:14px;">
                            Seleccione cuál de las empresas integrantes asumirá el rol de controladora del grupo:
                        </p>

                        <div style="max-height:340px; overflow-y:auto;">
                            ${radioOptionsHtml}
                        </div>
                    </div>
                `;
            } else if (currentStep === 4) {
                const controllerObj = wizardData.selectedCustomers.find(c => c.id === wizardData.controllerCustomerId);
                const controllerText = controllerObj
                    ? `<span class="ng-badge ng-badge-ok"><i class="fa-solid fa-crown" style="color:#ffc107;"></i> ${controllerObj.name}</span>`
                    : `<span class="ng-badge ng-badge-neu">Sin asignar</span>`;

                let membersListHtml = wizardData.selectedCustomers.map(c => `
                    <div style="padding:6px 10px; border-bottom:1px solid var(--ng-border); display:flex; justify-content:space-between; align-items:center; font-size:13px;">
                        <span><i class="fa-solid fa-building" style="color:var(--ng-primary); margin-right:6px;"></i> <strong>${c.name}</strong></span>
                        <span style="color:var(--ng-text-muted); font-size:12px;">RUC: ${c.ruc || 'N/A'}</span>
                    </div>
                `).join('');

                stepContent = `
                    <div class="ng-card">
                        <div class="ng-card-header">
                            <h3 class="ng-card-title"><i class="fa-solid fa-clipboard-check" style="color:var(--ng-accent);"></i> Paso 4: Resumen y Confirmación</h3>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
                            <div style="background:var(--ng-surface-2); padding:16px; border-radius:10px; border:1px solid var(--ng-border);">
                                <h4 style="margin:0 0 12px 0; font-size:14px; color:var(--ng-primary);"><i class="fa-solid fa-circle-info"></i> Información del Grupo</h4>
                                <p style="margin-bottom:8px; font-size:13px;"><strong>Nombre del Grupo:</strong> ${wizardData.name}</p>
                                <p style="margin-bottom:8px; font-size:13px;"><strong>Solicitante:</strong> ${wizardData.applicant || '<em style="color:var(--ng-text-muted);">Sin asignar</em>'}</p>
                                <p style="margin:0; font-size:13px;"><strong>Empresa Controladora:</strong> ${controllerText}</p>
                            </div>

                            <div style="background:var(--ng-surface-2); padding:16px; border-radius:10px; border:1px solid var(--ng-border); display:flex; flex-direction:column;">
                                <h4 style="margin:0 0 8px 0; font-size:14px; color:var(--ng-primary);"><i class="fa-solid fa-users"></i> Empresas Integrantes (${wizardData.selectedCustomers.length})</h4>
                                <div style="flex:1; max-height:140px; overflow-y:auto; background:#fff; border:1px solid var(--ng-border); border-radius:6px;">
                                    ${membersListHtml}
                                </div>
                            </div>
                        </div>

                        <p style="color:var(--ng-text-muted); font-size:13px; margin:0;">
                            Al hacer clic en <strong>"Guardar Grupo Completo"</strong>, el sistema registrará el nuevo grupo y vinculará automáticamente sus empresas integrantes y la controladora seleccionada.
                        </p>
                    </div>
                `;
            }

            this.content.innerHTML = `
                <div class="ng-container" style="max-width:900px; margin:0 auto; padding: 20px 0;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h1 style="font-size:1.4rem; font-weight:800; color:var(--ng-primary); margin:0;">
                            Creación de Grupo de Clientes
                        </h1>
                        <button class="ng-btn ng-btn-secondary" id="wizard-cancel-btn">Cancelar</button>
                    </div>

                    <!-- STEPS BAR -->
                    <div class="ng-wizard-steps">
                        <div class="ng-wizard-step ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}">
                            <div class="ng-wizard-step-num">1</div>
                            <span>Datos</span>
                        </div>
                        <div class="ng-wizard-step ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">
                            <div class="ng-wizard-step-num">2</div>
                            <span>Miembros</span>
                        </div>
                        <div class="ng-wizard-step ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">
                            <div class="ng-wizard-step-num">3</div>
                            <span>Controladora</span>
                        </div>
                        <div class="ng-wizard-step ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : ''}">
                            <div class="ng-wizard-step-num">4</div>
                            <span>Confirmación</span>
                        </div>
                    </div>

                    <!-- STEP CONTENT -->
                    ${stepContent}

                    <!-- WIZARD FOOTER CONTROLS -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
                        <button class="ng-btn ng-btn-secondary" id="wizard-prev-btn" ${currentStep === 1 ? 'disabled style="opacity:0.5;"' : ''}>
                            <i class="fa-solid fa-arrow-left"></i> Anterior
                        </button>

                        ${currentStep < 4
                            ? `<button class="ng-btn ng-btn-primary" id="wizard-next-btn">Siguiente <i class="fa-solid fa-arrow-right"></i></button>`
                            : `<button class="ng-btn ng-btn-primary" id="wizard-save-btn"><i class="fa-solid fa-floppy-disk"></i> Guardar Grupo Completo</button>`
                        }
                    </div>
                </div>
            `;

            // Bind Cancel
            document.getElementById('wizard-cancel-btn')?.addEventListener('click', () => {
                this.render(infoPage.offset, infoPage.currentPage, infoPage.search);
            });

            // Bind Prev
            document.getElementById('wizard-prev-btn')?.addEventListener('click', () => {
                if (currentStep > 1) {
                    saveStepState();
                    currentStep--;
                    drawWizardStep();
                }
            });

            // Bind Next
            document.getElementById('wizard-next-btn')?.addEventListener('click', () => {
                if (currentStep === 1) {
                    const nameInput = document.getElementById('wizard-name');
                    if (!nameInput || !nameInput.value.trim()) {
                        alert("Por favor ingrese el nombre del grupo.");
                        return;
                    }
                } else if (currentStep === 2) {
                    if (wizardData.selectedCustomers.length === 0) {
                        alert("Debe seleccionar al menos una empresa integrante para el grupo.");
                        return;
                    }
                }
                saveStepState();
                currentStep++;
                drawWizardStep();
            });

            // Bind Save (Step 4)
            document.getElementById('wizard-save-btn')?.addEventListener('click', async (e) => {
                const btn = e.currentTarget;
                if (btn.disabled) return;
                btn.setAttribute('disabled', 'true');
                btn.classList.add('ng-btn-disabled');
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

                try {
                    // 1. Create Group
                    const createdGroup = await createCustomerGroupApi(
                        wizardData.name,
                        wizardData.controllerCustomerId,
                        wizardData.applicant
                    );

                    const groupId = createdGroup?.groupId;
                    if (!groupId) throw new Error("No se pudo obtener el ID del grupo creado.");

                    // 2. Add Selected Members
                    for (const memberObj of wizardData.selectedCustomers) {
                        await addMemberToGroupApi(groupId, memberObj.id);
                    }

                    alert(`¡Grupo "${wizardData.name}" creado e integrado exitosamente!`);
                    this.render(Config.offset, Config.currentPage, "");
                } catch (err) {
                    alert(`Error creando el grupo: ${err.message}`);
                    btn.removeAttribute('disabled');
                    btn.classList.remove('ng-btn-disabled');
                    btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Grupo Completo`;
                }
            });

            // Step 2 specific events (Async load of available companies)
            if (currentStep === 2) {
                const loadAvailPage = async () => {
                    const listContainer = document.getElementById('wz-avail-customers-list');
                    if (listContainer) listContainer.innerHTML = '<div style="padding:12px; text-align:center; color:var(--ng-text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Cargando empresas disponibles...</div>';

                    const availableData = await getAvailableCustomersForGroup(wzAvailSearch, wzAvailOffset, tableRows);
                    const totalAvail = availableData?.totalElements ?? 0;
                    const availCustomers = availableData?.content ?? [];

                    let customersListHtml = '';
                    if (availCustomers.length === 0) {
                        customersListHtml = '<p style="color:var(--ng-text-muted); padding:12px; text-align:center; margin:0;">No se encontraron empresas disponibles para agregar.</p>';
                    } else {
                        customersListHtml = availCustomers.map(c => {
                            const isChecked = wizardData.selectedCustomers.some(sc => sc.id === c.id);
                            return `
                                <label style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; border-bottom:1px solid var(--ng-border); cursor:pointer; transition:background 0.15s;">
                                    <div style="display:flex; align-items:center; gap:10px;">
                                        <input type="checkbox" class="wz-cust-chk" data-id="${c.id}" data-name="${c.name}" data-ruc="${c.ruc || ''}" ${isChecked ? 'checked' : ''}>
                                        <strong style="color:var(--ng-primary);">${c.name}</strong>
                                    </div>
                                    <small style="color:var(--ng-text-muted); font-size:12px;">RUC: ${c.ruc || 'N/A'}</small>
                                </label>
                            `;
                        }).join('');
                    }

                    if (listContainer) listContainer.innerHTML = customersListHtml;

                    const totalAvailPages = Math.ceil(totalAvail / tableRows);
                    const pgnInfo = document.getElementById('wz-avail-pgn-info');
                    const btnPrevPgn = document.getElementById('wz-avail-prev-page');
                    const btnNextPgn = document.getElementById('wz-avail-next-page');

                    if (pgnInfo) pgnInfo.innerText = `Página ${wzAvailPage} de ${totalAvailPages || 1} (${totalAvail} disponibles)`;
                    if (btnPrevPgn) btnPrevPgn.disabled = wzAvailPage <= 1;
                    if (btnNextPgn) btnNextPgn.disabled = wzAvailPage >= totalAvailPages || totalAvailPages === 0;

                    const checkboxes = document.querySelectorAll('.wz-cust-chk');
                    checkboxes.forEach(chk => {
                        chk.addEventListener('change', () => {
                            const cid = chk.dataset.id;
                            if (chk.checked) {
                                if (!wizardData.selectedCustomers.some(sc => sc.id === cid)) {
                                    wizardData.selectedCustomers.push({
                                        id: cid,
                                        name: chk.dataset.name,
                                        ruc: chk.dataset.ruc
                                    });
                                }
                            } else {
                                wizardData.selectedCustomers = wizardData.selectedCustomers.filter(sc => sc.id !== cid);
                            }
                            drawWizardStep();
                        });
                    });
                };

                await loadAvailPage();

                const searchInput = document.getElementById('wz-search-cust');
                const btnSearchAvail = document.getElementById('wz-btn-search-cust');

                const doSearch = () => {
                    wzAvailSearch = searchInput ? searchInput.value.trim() : "";
                    wzAvailOffset = 0;
                    wzAvailPage = 1;
                    loadAvailPage();
                };

                if (btnSearchAvail) btnSearchAvail.addEventListener('click', doSearch);
                if (searchInput) {
                    searchInput.addEventListener('keyup', (e) => {
                        if (e.key === 'Enter') doSearch();
                    });
                }

                document.getElementById('wz-avail-prev-page')?.addEventListener('click', () => {
                    if (wzAvailPage > 1) {
                        wzAvailPage--;
                        wzAvailOffset = (wzAvailPage - 1) * tableRows;
                        loadAvailPage();
                    }
                });

                document.getElementById('wz-avail-next-page')?.addEventListener('click', () => {
                    wzAvailPage++;
                    wzAvailOffset = (wzAvailPage - 1) * tableRows;
                    loadAvailPage();
                });

                // Remove selected customer from badges
                document.querySelectorAll('.remove-selected-cust').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const idx = parseInt(btn.dataset.idx);
                        wizardData.selectedCustomers.splice(idx, 1);
                        drawWizardStep();
                    });
                });
            }

            // Step 3 events
            if (currentStep === 3) {
                document.querySelectorAll('input[name="wz-ctrl-radio"]').forEach(radio => {
                    radio.addEventListener('change', (e) => {
                        wizardData.controllerCustomerId = e.target.value;
                        drawWizardStep();
                    });
                });
            }
        };

        const saveStepState = () => {
            if (currentStep === 1) {
                const nameInput = document.getElementById('wizard-name');
                const applicantInput = document.getElementById('wizard-applicant');
                if (nameInput) wizardData.name = nameInput.value.trim().toUpperCase();
                if (applicantInput) wizardData.applicant = applicantInput.value.trim();
            } else if (currentStep === 3) {
                const selectedRadio = document.querySelector('input[name="wz-ctrl-radio"]:checked');
                if (selectedRadio) wizardData.controllerCustomerId = selectedRadio.value;
            }
        };

        drawWizardStep();
    }

    // =======================================================
    // MODAL PARA EDITAR DATOS DEL GRUPO (ESTILO ROUTINES)
    // =======================================================
    openEditGroupModal(groupObj) {
        const closeSidebar = () => new CloseDialog().x(this.entityDialogContainer);

        renderRightSidebar(`
            <div class="entity_editor" id="entity-editor" style="width: 480px;">
                <div class="entity_editor_header">
                    <div class="user_info">
                        <div class="avatar"><i class="fa-solid fa-pen-to-square"></i></div>
                        <h1 class="entity_editor_title">Editar <br><small>Grupo de Clientes</small></h1>
                    </div>
                    <button class="btn btn_close_editor" id="close-edit"><i class="fa-regular fa-x"></i></button>
                </div>

                <div class="entity_editor_body" style="padding: 24px;">
                    <div class="ng-form-group">
                        <label class="ng-label" for="edit-group-name">Nombre del Grupo *</label>
                        <input type="text" id="edit-group-name" class="ng-input" value="${groupObj.groupName || ''}" placeholder="Ej: GRUPO CORPORATIVO ALFA" autocomplete="off">
                    </div>

                    <div class="ng-form-group">
                        <label class="ng-label" for="edit-group-applicant">Solicitante / Referencia</label>
                        <input type="text" id="edit-group-applicant" class="ng-input" value="${groupObj.applicant || ''}" placeholder="Ej: JUAN PEREZ - GERENCIA GENERAL" autocomplete="off">
                    </div>

                    <div class="ng-form-group" style="margin-bottom: 0;">
                        <label class="ng-toggle">
                            <input type="checkbox" id="edit-group-active" ${groupObj.groupActive ? 'checked' : ''}>
                            <span>Estado Activo</span>
                        </label>
                    </div>
                </div>

                <div class="entity_editor_footer" style="padding: 16px 24px; text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
                    <button class="ng-btn ng-btn-secondary" id="cancel-edit">Cancelar</button>
                    <button class="ng-btn ng-btn-primary" id="save-edit-btn"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
                </div>
            </div>
        `);

        document.getElementById('close-edit')?.addEventListener('click', closeSidebar);
        document.getElementById('cancel-edit')?.addEventListener('click', closeSidebar);

        document.getElementById('save-edit-btn')?.addEventListener('click', async (e) => {
            const nameInput = document.getElementById('edit-group-name');
            const applicantInput = document.getElementById('edit-group-applicant');
            const activeChk = document.getElementById('edit-group-active');

            if (!nameInput || !nameInput.value.trim()) {
                alert("Ingrese el nombre del grupo.");
                return;
            }

            const btn = e.currentTarget;
            if (btn.disabled) return;
            btn.setAttribute('disabled', 'true');
            btn.classList.add('ng-btn-disabled');
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

            const payload = {
                name: nameInput.value.trim().toUpperCase(),
                applicant: applicantInput ? applicantInput.value.trim() : '',
                active: activeChk ? activeChk.checked : true
            };

            try {
                await updateCustomerGroupApi(groupObj.groupId, payload);
                alert("Grupo actualizado exitosamente.");
                closeSidebar();
                new CustomerGroups().render(infoPage.offset, infoPage.currentPage, infoPage.search);
            } catch (err) {
                alert(`Error al actualizar el grupo: ${err.message}`);
                btn.removeAttribute('disabled');
                btn.classList.remove('ng-btn-disabled');
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios`;
            }
        });
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
                self.render(infoPage.offset, currentPage, infoPage.search);
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
                self.render(Config.offset, Config.currentPage, infoPage.search);
            });
            nextButton.addEventListener('click', () => {
                infoPage.offset = Config.tableRows * (pageCount - 1);
                self.render(infoPage.offset, pageCount, infoPage.search);
            });
        }
    }
}
