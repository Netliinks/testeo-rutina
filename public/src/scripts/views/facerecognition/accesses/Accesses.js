import { getAllAccesses, getFaceFile } from "../../../endpoints.js";

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;
const PAGE_WINDOW = 1;
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
        pagination.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;';
        pagination.innerHTML = '';

        const sizeWrapper = document.createElement('div');
        sizeWrapper.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;color:#555;';
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

        const nav = document.createElement('div');
        nav.style.cssText = 'display:flex;align-items:center;gap:4px;';

        const prevBtn = document.createElement('button');
        prevBtn.className = `datatable_button${page === 0 ? ' disabled' : ''}`;
        prevBtn.disabled = page === 0;
        prevBtn.innerHTML = '&#8249;';
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 0) this.loadAccesses(--this.currentPage);
        });
        nav.appendChild(prevBtn);

        const pageButton = (p) => {
            const btn = document.createElement('button');
            btn.className = `datatable_button${p === page ? ' isActive' : ''}`;
            btn.style.cssText = p === page ? 'font-weight:bold;background:#6F7ADD;color:#fff;' : '';
            btn.textContent = String(p + 1);
            btn.addEventListener('click', () => {
                if (p !== this.currentPage) this.loadAccesses(this.currentPage = p);
            });
            return btn;
        };

        const ellipsis = () => {
            const span = document.createElement('span');
            span.textContent = '…';
            span.style.cssText = 'padding:0 4px;color:#808080;font-size:13px;';
            return span;
        };

        const pagesToShow = new Set([0, totalPages - 1]);
        for (let p = page - PAGE_WINDOW; p <= page + PAGE_WINDOW; p++) {
            if (p >= 0 && p < totalPages) pagesToShow.add(p);
        }
        const sortedPages = [...pagesToShow].sort((a, b) => a - b);

        let lastRendered = -1;
        for (const p of sortedPages) {
            if (lastRendered !== -1 && p - lastRendered > 1) nav.appendChild(ellipsis());
            nav.appendChild(pageButton(p));
            lastRendered = p;
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = `datatable_button${page >= totalPages - 1 ? ' disabled' : ''}`;
        nextBtn.disabled = page >= totalPages - 1;
        nextBtn.innerHTML = '&#8250;';
        nextBtn.addEventListener('click', () => {
            if (this.currentPage < totalPages - 1) this.loadAccesses(++this.currentPage);
        });
        nav.appendChild(nextBtn);

        pagination.appendChild(nav);
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

            const dayGrid = document.createElement('div');
            dayGrid.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:12px;';
            section.appendChild(dayGrid);

            container.appendChild(section);

            for (const access of dayAccesses) {
                const fileInfo = access.photo;
                const recognizedName = access.user?.fullName ?? 'No reconocido';
                const requesterName = access.requesterUser?.fullName ?? '-';
                const cell = document.createElement('div');
                cell.style.cssText = 'position:relative;background:#f0f0f0;border-radius:4px;height:100px;display:flex;align-items:center;justify-content:center;';
                cell.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid #ccc;border-top-color:#6F7ADD;border-radius:50%;animation:spin .7s linear infinite;"></span>';
                dayGrid.appendChild(cell);

                const url = fileInfo ? await getFaceFile(fileInfo.path, fileInfo.storageName) : null;
                cell.innerHTML = '';
                cell.style.cssText = 'position:relative;display:flex;flex-direction:column;background:#f0f0f0;border-radius:4px;overflow:hidden;';

                const img = document.createElement('img');
                img.src = url ?? '';
                img.style.cssText = 'width:100%;height:90px;object-fit:cover;cursor:pointer;display:block;background:#ddd;';

                const caption = document.createElement('div');
                caption.textContent = recognizedName;
                caption.title = recognizedName;
                caption.style.cssText = 'font-size:11px;color:#555;padding:4px 6px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

                const statusBadge = document.createElement('span');
                statusBadge.style.cssText = 'position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:1;';
                if (access.correct === true) {
                    statusBadge.style.background = '#43a047';
                    statusBadge.innerHTML = '<i class="fa-solid fa-check" style="color:#fff;font-size:9px;"></i>';
                    statusBadge.title = 'Acceso correcto';
                } else if (access.correct === false) {
                    statusBadge.style.background = '#e53935';
                    statusBadge.innerHTML = '<i class="fa-solid fa-xmark" style="color:#fff;font-size:9px;"></i>';
                    statusBadge.title = access.reason ? `Acceso incorrecto: ${access.reason}` : 'Acceso incorrecto';
                } else {
                    statusBadge.style.background = 'rgba(0,0,0,0.5)';
                    statusBadge.innerHTML = '<span style="display:inline-block;width:9px;height:9px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;"></span>';
                    statusBadge.title = 'Procesando reconocimiento facial...';
                }

                img.addEventListener('click', () => {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
                    const full = document.createElement('img');
                    full.src = url ?? '';
                    full.style.cssText = 'max-width:90vw;max-height:70vh;object-fit:contain;border-radius:6px;';
                    overlay.appendChild(full);

                    const details = document.createElement('div');
                    details.style.cssText = 'margin-top:12px;padding:10px 20px;background:rgba(255,255,255,0.1);color:#fff;border-radius:6px;font-size:13px;text-align:left;max-width:90vw;line-height:1.6;';
                    const confidencePct = typeof access.confidence === 'number' ? `${(access.confidence * 100).toFixed(1)}%` : '-';
                    const recognizedAt = access.recognizedAt ? new Date(access.recognizedAt).toLocaleString() : '-';
                    const coords = (access.latitude != null && access.longitude != null) ? `${access.latitude}, ${access.longitude}` : '-';
                    details.innerHTML = `
                        <div><strong>Solicitante:</strong> ${requesterName}</div>
                        <div><strong>Reconocido:</strong> ${recognizedName}</div>
                        <div><strong>Estado:</strong> ${statusBadge.title}</div>
                        <div><strong>Confianza:</strong> ${confidencePct}</div>
                        <div><strong>Fecha:</strong> ${recognizedAt}</div>
                        <div><strong>Coordenadas:</strong> ${coords}</div>
                    `;
                    overlay.appendChild(details);

                    overlay.addEventListener('click', () => overlay.remove());
                    document.addEventListener('keydown', function onEsc(e) {
                        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); }
                    });
                    document.body.appendChild(overlay);
                });

                cell.appendChild(img);
                cell.appendChild(caption);
                cell.appendChild(statusBadge);
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
