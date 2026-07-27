import { getAllAccesses, getFaceFile } from "../../../endpoints.js";
import { pageNumbers, fillBtnPagination } from "../../../tools.js";
import { Config } from "../../../Configs.js";

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;
const POLL_INTERVAL = 5000;

export class Accesses {
    constructor() {
        this.datatableContainer = document.getElementById('datatable-container');
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
                </div>

                <div id="accesses-container" style="display:flex;flex-direction:column;gap:20px;min-height:100px;padding:16px 0;"></div>
            </div>

            <div class="datatable_footer margin_t_8">
                <div class="datatable_pagination" id="pagination-container"></div>
            </div>
        `;

        await this.loadAccesses(this.currentPage);
    }

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

        const sizeWrapper = document.createElement('div');
        sizeWrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#555;margin-bottom:10px;';
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Mostrar';
        sizeLabel.setAttribute('for', 'accesses-page-size');
        const sizeSelect = document.createElement('select');
        sizeSelect.id = 'accesses-page-size';
        sizeSelect.style.cssText = 'font-size:12px;padding:2px 6px;border-radius:4px;border:1px solid #ccc;';
        PAGE_SIZE_OPTIONS.forEach((size) => {
            const opt = document.createElement('option');
            opt.value = String(size);
            opt.textContent = String(size);
            if (size === this.pageSize) opt.selected = true;
            sizeSelect.appendChild(opt);
        });
        sizeSelect.addEventListener('change', () => {
            this.pageSize = Number(sizeSelect.value);
            this.loadAccesses(this.currentPage = 0);
        });
        sizeWrapper.appendChild(sizeLabel);
        sizeWrapper.appendChild(sizeSelect);
        pagination.appendChild(sizeWrapper);

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
                    <th><span>Reconocido</span></th>
                    <th class="thead_centered"><span>Estado</span></th>
                    <th><span>Confianza</span></th>
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
                const requesterName = access.requesterUser?.fullName ?? '-';
                const confidencePct = typeof access.confidence === 'number' ? `${(access.confidence * 100).toFixed(1)}%` : '-';
                const recognizedAt = access.recognizedAt ? new Date(access.recognizedAt).toLocaleString() : '-';
                const coords = (access.latitude != null && access.longitude != null) ? `${access.latitude}, ${access.longitude}` : '-';

                const row = document.createElement('tr');

                const photoCell = document.createElement('td');
                photoCell.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid #ccc;border-top-color:#6F7ADD;border-radius:50%;animation:spin .7s linear infinite;"></span>';
                row.appendChild(photoCell);

                const requesterCell = document.createElement('td');
                requesterCell.textContent = requesterName;
                row.appendChild(requesterCell);

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

                const confidenceCell = document.createElement('td');
                confidenceCell.textContent = confidencePct;
                row.appendChild(confidenceCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = recognizedAt;
                row.appendChild(dateCell);

                const coordsCell = document.createElement('td');
                coordsCell.textContent = coords;
                row.appendChild(coordsCell);

                tbody.appendChild(row);

                if (!fileInfo) {
                    photoCell.innerHTML = '<i class="fa-solid fa-image" style="color:#ccc;font-size:20px;" title="Sin foto"></i>';
                    continue;
                }

                getFaceFile(fileInfo.path, fileInfo.storageName)
                    .then((url) => {
                        photoCell.innerHTML = '';

                        const img = document.createElement('img');
                        img.src = url ?? '';
                        img.style.cssText = 'width:56px;height:48px;object-fit:cover;border-radius:4px;cursor:pointer;display:block;background:#ddd;';
                        img.addEventListener('click', () => {
                            const overlay = document.createElement('div');
                            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
                            const full = document.createElement('img');
                            full.src = url ?? '';
                            full.style.cssText = 'max-width:90vw;max-height:80vh;object-fit:contain;border-radius:6px;';
                            overlay.appendChild(full);

                            overlay.addEventListener('click', () => overlay.remove());
                            document.addEventListener('keydown', function onEsc(e) {
                                if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); }
                            });
                            document.body.appendChild(overlay);
                        });
                        photoCell.appendChild(img);
                    })
                    .catch(() => {
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
