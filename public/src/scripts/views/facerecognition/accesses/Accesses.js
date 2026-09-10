import { getAllAccesses, getAllAccessesBetweenDates, getFaceFile } from "../../../endpoints.js";
import { pageNumbers, fillBtnPagination, inputObserver, CloseDialog, generateFileSimpleXls, sleep } from "../../../tools.js";
import { Config } from "../../../Configs.js";

const DEFAULT_PAGE_SIZE = 12;
const POLL_INTERVAL = 5000;

export class Accesses {
    constructor() {
        this.datatableContainer = document.getElementById('datatable-container');
        this.dialogContainer = document.getElementById('app-dialogs');
        this.currentPage = 0;
        this.pageSize = DEFAULT_PAGE_SIZE;
        this._pollTimer = null;
    }

    _stopPolling() {
        if (this._pollTimer) {
            clearTimeout(this._pollTimer);
            this._pollTimer = null;
        }
    }

    _schedulePolling() {
        this._stopPolling();
        this._pollTimer = setTimeout(async () => {
            if (!document.getElementById('accesses-container')) return;
            await this.loadAccesses(this.currentPage);
        }, POLL_INTERVAL);
    }

    async render() {
        this._stopPolling();
        this.datatableContainer.innerHTML = `
            <div class="datatable" id="datatable">
                <div class="datatable_header">
                    <div class="datatable_title"><h1>Reconocimiento Facial / Accesos</h1></div>
                    <div class="datatable_tools" id="datatable-tools">
                        <button class="datatable_button import_user" id="export-accesses">Exportar</button>
                    </div>
                </div>

                <div id="accesses-container" style="display:flex;flex-direction:column;gap:20px;min-height:100px;padding:16px 0;"></div>
            </div>

            <div class="datatable_footer margin_t_8">
                <div class="datatable_pagination" id="pagination-container"></div>
            </div>
        `;

        this.export();
        await this.loadAccesses(this.currentPage);
    }

    export = () => {
        const exportButton = document.getElementById('export-accesses');
        exportButton.addEventListener('click', () => {
            this.dialogContainer.style.display = 'block';
            this.dialogContainer.innerHTML = `
                <div class="dialog_content" id="dialog-content">
                    <div class="dialog">
                        <div class="dialog_container padding_8">
                            <div class="dialog_header">
                                <h2>Antes de exportar</h2>
                            </div>

                            <div class="dialog_message padding_8">
                                <div class="form_group">
                                    <div class="form_input">
                                        <label class="form_label" for="export-start-date">Fecha inicial</label>
                                        <input type="date" class="input_date input_date-start" id="export-start-date" name="export-start-date">
                                    </div>

                                    <div class="form_input">
                                        <label class="form_label" for="export-end-date">Fecha final</label>
                                        <input type="date" class="input_date input_date-end" id="export-end-date" name="export-end-date">
                                    </div>
                                </div>
                            </div>

                            <div class="dialog_footer">
                                <button class="btn btn_primary" id="cancel">Cancelar</button>
                                <button class="btn btn_danger" id="export-data">Exportar</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            inputObserver();
            const _dialog = document.getElementById('dialog-content');
            const _closeButton = document.getElementById('cancel');
            const exportDataButton = document.getElementById('export-data');
            const startDateInput = document.getElementById('export-start-date');
            const endDateInput = document.getElementById('export-end-date');
            let onPressed = false;

            exportDataButton.addEventListener('click', async () => {
                if (onPressed) return;
                if (!startDateInput.value || !endDateInput.value) {
                    alert('Debe seleccionar la fecha inicial y la fecha final.');
                    return;
                }
                const initialDate = new Date(`${startDateInput.value}T00:00:00`).toISOString();
                const finalDate = new Date(`${endDateInput.value}T23:59:59`).toISOString();
                if (new Date(initialDate) > new Date(finalDate)) {
                    alert('La fecha inicial debe ser anterior o igual a la fecha final.');
                    return;
                }

                onPressed = true;
                this.dialogContainer.innerHTML = `
                    <div class="dialog_content" id="dialog-content">
                        <div class="dialog">
                            <div class="dialog_container padding_8">
                                <div class="dialog_header">
                                    <h2>Exportando...</h2>
                                </div>

                                <div class="dialog_message padding_8">
                                    <div class="material_input">
                                        <input type="text" id="export-total" class="input_filled" value="..." readonly>
                                        <label for="export-total"><i class="fa-solid fa-cloud-arrow-down"></i>Obteniendo datos</label>
                                    </div>
                                </div>

                                <div class="dialog_footer">
                                    <button class="btn btn_primary" id="cancel">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                inputObserver();
                const progressLabel = document.getElementById('export-total');
                const cancelExportButton = document.getElementById('cancel');
                cancelExportButton.onclick = () => {
                    onPressed = false;
                    const dialog = document.getElementById('dialog-content');
                    new CloseDialog().x(dialog);
                };

                const pageSize = Config.limitExport;
                const rows = [];
                const appendRows = (content) => {
                    for (const access of (content ?? [])) {
                        rows.push({
                            'Solicitante': access.requesterUser?.fullName ?? '-',
                            'Empresa': access.customerName ?? '-',
                            'Reconocido': access.user?.fullName ?? 'No reconocido',
                            'Estado': access.correct === true ? 'Correcto' : access.correct === false ? 'Incorrecto' : 'Procesando',
                            'Fecha': access.recognizedAt ? new Date(access.recognizedAt).toLocaleString() : '-',
                            'Coordenadas': (access.latitude != null && access.longitude != null) ? `${access.latitude}, ${access.longitude}` : '-',
                        });
                    }
                };

                const firstPage = await getAllAccessesBetweenDates(initialDate, finalDate, 0, pageSize);
                const totalElements = firstPage?.totalElements ?? 0;
                const totalPages = firstPage?.totalPages ?? 0;

                if (!totalElements) {
                    onPressed = false;
                    const dialog = document.getElementById('dialog-content');
                    new CloseDialog().x(dialog);
                    alert('No hay ningún registro en el rango seleccionado');
                    return;
                }

                appendRows(firstPage.content);
                progressLabel.value = `${rows.length} / ${totalElements}`;

                for (let page = 1; page < totalPages; page++) {
                    if (!onPressed) break;
                    await sleep(Config.timeOutExport);
                    const result = await getAllAccessesBetweenDates(initialDate, finalDate, page, pageSize);
                    appendRows(result?.content);
                    progressLabel.value = `${rows.length} / ${totalElements}`;
                }

                if (onPressed) {
                    generateFileSimpleXls(rows, 'Accesos', 'csv');
                }
                const dialog = document.getElementById('dialog-content');
                new CloseDialog().x(dialog);
                onPressed = false;
            });

            _closeButton.onclick = () => {
                new CloseDialog().x(_dialog);
            };
        });
    };

    _groupByDate(accesses) {
        const groups = new Map();
        for (const access of accesses) {
            const dateKey = access.recognizedAt ? new Date(access.recognizedAt).toLocaleDateString() : 'Sin fecha';
            if (!groups.has(dateKey)) groups.set(dateKey, []);
            groups.get(dateKey).push(access);
        }
        return groups;
    }

    _renderPagination(page, totalPages) {
        const pagination = document.getElementById('pagination-container');
        pagination.innerHTML = '';

        const buttonsWrapper = document.createElement('div');
        buttonsWrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;';

        const currentPage = page + 1;

        const setupButton = (p) => {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute('name', 'pagination-button');
            button.setAttribute('id', 'btnPag' + p);
            button.innerText = String(p);
            button.addEventListener('click', () => {
                if (p !== currentPage) this.loadAccesses(this.currentPage = p - 1);
            });
            return button;
        };

        if (totalPages <= Config.maxLimitPage) {
            for (let p = 1; p <= totalPages; p++) {
                buttonsWrapper.appendChild(setupButton(p));
            }
        } else {
            const prevButton = document.createElement('button');
            prevButton.classList.add('pagination_button');
            prevButton.innerText = '<<';
            prevButton.addEventListener('click', () => {
                if (this.currentPage > 0) this.loadAccesses(--this.currentPage);
            });
            buttonsWrapper.appendChild(prevButton);

            const pages = pageNumbers(totalPages, Config.maxLimitPage, currentPage);
            for (const p of pages) {
                if (p > 0 && p <= totalPages) buttonsWrapper.appendChild(setupButton(p));
            }

            const nextButton = document.createElement('button');
            nextButton.classList.add('pagination_button');
            nextButton.innerText = '>>';
            nextButton.addEventListener('click', () => {
                if (this.currentPage < totalPages - 1) this.loadAccesses(++this.currentPage);
            });
            buttonsWrapper.appendChild(nextButton);
        }

        pagination.appendChild(buttonsWrapper);
        fillBtnPagination(currentPage, Config.colorPagination);
    }

    async loadAccesses(page) {
        const container = document.getElementById('accesses-container');
        const pagination = document.getElementById('pagination-container');
        if (!container) { this._stopPolling(); return; }

        container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:100px;"><span style="display:inline-block;width:28px;height:28px;border:3px solid #e0e0e0;border-top-color:#6F7ADD;border-radius:50%;animation:spin .7s linear infinite;"></span></div>';

        const result = await getAllAccesses(page, this.pageSize);
        const accesses = Array.isArray(result) ? result : (result?.content ?? []);
        const totalPages = result?.totalPages ?? 1;

        if (!accesses.length) {
            container.innerHTML = '<p style="color:#808080;font-size:12px;text-align:center;margin:16px 0;">Sin accesos</p>';
            pagination.innerHTML = '';
            this._stopPolling();
            return;
        }

        container.innerHTML = '';

        const groups = this._groupByDate(accesses);
        for (const [dateKey, dayAccesses] of groups) {
            const section = document.createElement('div');

            const heading = document.createElement('h3');
            heading.textContent = dateKey;
            heading.style.cssText = 'font-size:14px;color:#333;margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid #e0e0e0;';
            section.appendChild(heading);

            const table = document.createElement('table');
            table.className = 'datatable_content';
            table.innerHTML = `
                <thead><tr>
                    <th><span>Foto</span></th>
                    <th><span>Solicitante</span></th>
                    <th><span>Empresa</span></th>
                    <th><span>Reconocido</span></th>
                    <th class="thead_centered"><span>Estado</span></th>
                    <th><span>Fecha</span></th>
                    <th><span>Coordenadas</span></th>
                </tr></thead>
                <tbody></tbody>
            `;
            const tbody = table.querySelector('tbody');
            section.appendChild(table);

            container.appendChild(section);

            for (const access of dayAccesses) {
                const fileInfo = access.photo;
                const recognizedName = access.user?.fullName ?? 'No reconocido';
                const requesterName = access.requesterUser?.fullName || '-';
                const requesterCustomerName = access.customerName ?? '-';
                const userPresent = access.userPresent || '-';
                const confidencePct = typeof access.confidence === 'number' ? `${(access.confidence * 100).toFixed(1)}%` : '-';
                const recognizedAt = access.recognizedAt ? new Date(access.recognizedAt).toLocaleString() : '-';
                const coords = (access.latitude != null && access.longitude != null) ? `${access.latitude}, ${access.longitude}` : '-';

                let photoUrl = null;
                let photoFailed = false;

                const row = document.createElement('tr');
                row.style.cursor = 'pointer';

                const photoCell = document.createElement('td');
                photoCell.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid #ccc;border-top-color:#6F7ADD;border-radius:50%;animation:spin .7s linear infinite;"></span>';
                row.appendChild(photoCell);

                const requesterCell = document.createElement('td');
                requesterCell.textContent = requesterName;
                row.appendChild(requesterCell);

                const requesterCustomerCell = document.createElement('td');
                requesterCustomerCell.textContent = requesterCustomerName;
                row.appendChild(requesterCustomerCell);

                const recognizedCell = document.createElement('td');
                recognizedCell.textContent = recognizedName;
                row.appendChild(recognizedCell);

                const statusCell = document.createElement('td');
                statusCell.className = 'tag';
                const statusTag = document.createElement('span');
                if (access.correct === true) {
                    statusTag.classList.add('tag_green');
                    statusTag.textContent = 'Correcto';
                } else if (access.correct === false) {
                    statusTag.classList.add('tag_red');
                    statusTag.textContent = 'Incorrecto';
                    statusTag.title = access.reason ?? '';
                } else {
                    statusTag.classList.add('tag_yellow');
                    statusTag.textContent = 'Procesando';
                }
                statusCell.appendChild(statusTag);
                row.appendChild(statusCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = recognizedAt;
                row.appendChild(dateCell);

                const coordsCell = document.createElement('td');
                coordsCell.textContent = coords;
                row.appendChild(coordsCell);

                row.addEventListener('click', () => {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;overflow:auto;padding:24px;';

                    if (photoUrl) {
                        const full = document.createElement('img');
                        full.src = photoUrl;
                        full.style.cssText = 'max-width:90vw;max-height:60vh;object-fit:contain;border-radius:6px;';
                        overlay.appendChild(full);
                    } else {
                        const noPhoto = document.createElement('div');
                        noPhoto.textContent = photoFailed ? 'Error al cargar la foto' : 'Sin foto';
                        noPhoto.style.cssText = 'color:#ccc;font-size:14px;';
                        overlay.appendChild(noPhoto);
                    }

                    const details = document.createElement('div');
                    details.style.cssText = 'margin-top:12px;padding:10px 20px;background:rgba(255,255,255,0.1);color:#fff;border-radius:6px;font-size:13px;text-align:left;max-width:90vw;line-height:1.6;';
                    details.innerHTML = `
                        <div><strong>Solicitante:</strong> ${requesterName}</div>
                        <div><strong>Empresa:</strong> ${requesterCustomerName}</div>
                        <div><strong>Puesto:</strong> ${userPresent}</div>
                        <div><strong>Reconocido:</strong> ${recognizedName}</div>
                        <div><strong>Estado:</strong> ${statusTag.textContent}</div>
                        <div><strong>Confianza:</strong> ${confidencePct}</div>
                        <div><strong>Fecha:</strong> ${recognizedAt}</div>
                        <div><strong>Coordenadas:</strong> ${coords}</div>
                    `;
                    overlay.appendChild(details);

                    if (access.latitude != null && access.longitude != null) {
                        const mapButton = document.createElement('button');
                        mapButton.className = 'btn btn_primary';
                        mapButton.style.cssText = 'margin-top:12px;';
                        mapButton.textContent = 'Abrir en mapa';
                        mapButton.addEventListener('click', (e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/search/?api=1&query=${access.latitude},${access.longitude}`, '_blank', 'noopener');
                        });
                        overlay.appendChild(mapButton);
                    }

                    overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) overlay.remove();
                    });
                    document.addEventListener('keydown', function onEsc(e) {
                        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); }
                    });
                    document.body.appendChild(overlay);
                });

                tbody.appendChild(row);

                if (!fileInfo) {
                    photoCell.innerHTML = '<i class="fa-solid fa-image" style="color:#ccc;font-size:20px;" title="Sin foto"></i>';
                    continue;
                }

                getFaceFile(fileInfo.path, fileInfo.storageName)
                    .then((url) => {
                        photoUrl = url ?? null;
                        photoCell.innerHTML = '';

                        const img = document.createElement('img');
                        img.src = url ?? '';
                        img.style.cssText = 'width:56px;height:48px;object-fit:cover;border-radius:4px;display:block;background:#ddd;';
                        photoCell.appendChild(img);
                    })
                    .catch(() => {
                        photoFailed = true;
                        photoCell.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:#e53935;font-size:20px;" title="Error al cargar la foto"></i>';
                    });
            }
        }

        this._renderPagination(page, totalPages);

        const hasPending = accesses.some((access) => access.correct === null || access.correct === undefined);
        if (hasPending) {
            this._schedulePolling();
        } else {
            this._stopPolling();
        }
    }
}
