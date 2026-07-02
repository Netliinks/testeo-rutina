import { getAllGuardPhotos, getFaceFile, deleteGuardPhotoById, getFilterEntityData } from "../../../endpoints.js";

const PAGE_SIZE = 12;
const POLL_INTERVAL = 5000;

export class Photos {
    constructor() {
        this.datatableContainer = document.getElementById('datatable-container');
        this.currentPage = 0;
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
            if (!document.getElementById('photos-grid')) return;
            await this.loadPhotos(this.currentPage);
        }, POLL_INTERVAL);
    }

    async render() {
        this._stopPolling();
        this.datatableContainer.innerHTML = `
            <div class="datatable" id="datatable">
                <div class="datatable_header">
                    <div class="datatable_title"><h1>Reconocimiento Facial / Fotos</h1></div>
                </div>

                <div id="photos-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;min-height:100px;padding:16px 0;"></div>
            </div>

            <div class="datatable_footer margin_t_8">
                <div class="datatable_pagination" id="pagination-container"></div>
            </div>
        `;

        await this.loadPhotos(this.currentPage);
    }

    async _fetchGuardsByIds(guardIds) {
        if (!guardIds.length) return {};
        const raw = JSON.stringify({
            filter: {
                conditions: [
                    {
                        property: 'id',
                        operator: 'in',
                        value: guardIds
                    }
                ]
            },
            limit: guardIds.length,
            offset: 0,
            fetchPlan: 'full'
        });
        const result = await getFilterEntityData('User', raw);
        const guards = Array.isArray(result) ? result : (result?.content ?? []);
        const guardsById = {};
        guards.forEach((guard) => {
            guardsById[guard.id] = guard;
        });
        return guardsById;
    }

    async loadPhotos(page) {
        const grid = document.getElementById('photos-grid');
        const pagination = document.getElementById('pagination-container');
        if (!grid) { this._stopPolling(); return; }

        grid.innerHTML = '<div style="grid-column:1/-1;display:flex;justify-content:center;align-items:center;min-height:100px;"><span style="display:inline-block;width:28px;height:28px;border:3px solid #e0e0e0;border-top-color:#6F7ADD;border-radius:50%;animation:spin .7s linear infinite;"></span></div>';

        const result = await getAllGuardPhotos(page, PAGE_SIZE);
        const photos = Array.isArray(result) ? result : (result?.content ?? []);
        const totalPages = result?.totalPages ?? 1;

        if (!photos.length) {
            grid.innerHTML = '<p style="color:#808080;font-size:12px;grid-column:1/-1;text-align:center;margin:16px 0;">Sin fotos</p>';
            pagination.innerHTML = '';
            this._stopPolling();
            return;
        }

        const guardIds = [...new Set(photos.map((photo) => photo.guardId).filter(Boolean))];
        const guardsById = await this._fetchGuardsByIds(guardIds);

        grid.innerHTML = '';
        for (const photo of photos) {
            const photoId = photo.id;
            const fileInfo = photo.photo;
            const guard = guardsById[photo.guardId];
            const guardName = guard ? `${guard.firstName ?? ''} ${guard.lastName ?? ''}`.trim() : photo.guardId;
            const cell = document.createElement('div');
            cell.style.cssText = 'position:relative;background:#f0f0f0;border-radius:4px;height:100px;display:flex;align-items:center;justify-content:center;';
            cell.innerHTML = '<span style="display:inline-block;width:18px;height:18px;border:2px solid #ccc;border-top-color:#6F7ADD;border-radius:50%;animation:spin .7s linear infinite;"></span>';
            grid.appendChild(cell);
            const url = await getFaceFile(fileInfo.path, fileInfo.storageName);
            cell.innerHTML = '';
            cell.style.cssText = 'position:relative;display:flex;flex-direction:column;background:#f0f0f0;border-radius:4px;overflow:hidden;';

            const xBtn = document.createElement('button');
            xBtn.textContent = '×';
            xBtn.style.cssText = 'position:absolute;top:3px;right:3px;width:18px;height:18px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;font-size:12px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:1;padding:0;';
            xBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                xBtn.disabled = true;
                xBtn.innerHTML = '<span style="display:inline-block;width:10px;height:10px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;"></span>';
                await deleteGuardPhotoById(photoId);
                this.loadPhotos(this.currentPage);
            });

            const img = document.createElement('img');
            img.src = url;
            img.style.cssText = 'width:100%;height:90px;object-fit:cover;cursor:pointer;display:block;';

            const caption = document.createElement('div');
            caption.textContent = guardName || '-';
            caption.title = guardName || '';
            caption.style.cssText = 'font-size:11px;color:#555;padding:4px 6px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

            const statusBadge = document.createElement('span');
            statusBadge.style.cssText = 'position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;z-index:1;';
            if (photo.encodingState === 'OK') {
                statusBadge.style.background = '#43a047';
                statusBadge.innerHTML = '<i class="fa-solid fa-check" style="color:#fff;font-size:9px;"></i>';
                statusBadge.title = 'Reconocimiento facial procesado';
            } else if (photo.encodingState === 'ERROR') {
                statusBadge.style.background = '#e53935';
                statusBadge.innerHTML = '<i class="fa-solid fa-xmark" style="color:#fff;font-size:9px;"></i>';
                statusBadge.title = 'Error al procesar el reconocimiento facial';
            } else if (!photo.encodingState) {
                statusBadge.style.background = 'rgba(0,0,0,0.5)';
                statusBadge.innerHTML = '<span style="display:inline-block;width:9px;height:9px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin .7s linear infinite;"></span>';
                statusBadge.title = 'Procesando reconocimiento facial...';
            } else {
                statusBadge.style.background = 'rgba(0,0,0,0.5)';
                statusBadge.innerHTML = '<i class="fa-solid fa-question" style="color:#fff;font-size:9px;"></i>';
                statusBadge.title = 'Estado de reconocimiento facial desconocido';
            }

            img.addEventListener('click', () => {
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
                const full = document.createElement('img');
                full.src = url;
                full.style.cssText = 'max-width:90vw;max-height:80vh;object-fit:contain;border-radius:6px;';
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Eliminar foto';
                deleteBtn.style.cssText = 'margin-top:16px;padding:8px 24px;background:#e53935;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;';
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    deleteBtn.disabled = true;
                    deleteBtn.textContent = 'Eliminando...';
                    await deleteGuardPhotoById(photoId);
                    overlay.remove();
                    this.loadPhotos(this.currentPage);
                });
                overlay.appendChild(full);
                if (photo.encodingState !== 'OK') {
                    const detail = document.createElement('div');
                    detail.textContent = statusBadge.title;
                    detail.style.cssText = 'margin-top:12px;padding:6px 16px;background:rgba(255,255,255,0.15);color:#fff;border-radius:6px;font-size:13px;text-align:center;max-width:90vw;';
                    overlay.appendChild(detail);
                    if (photo.detail) {
                        const detailMessage = document.createElement('div');
                        detailMessage.textContent = photo.detail;
                        detailMessage.style.cssText = 'margin-top:8px;padding:6px 16px;color:#ccc;font-size:12px;text-align:center;max-width:90vw;';
                        overlay.appendChild(detailMessage);
                    }
                }
                overlay.appendChild(deleteBtn);
                overlay.addEventListener('click', () => overlay.remove());
                document.addEventListener('keydown', function onEsc(e) {
                    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc); }
                });
                document.body.appendChild(overlay);
            });

            cell.appendChild(img);
            cell.appendChild(caption);
            cell.appendChild(xBtn);
            cell.appendChild(statusBadge);
        }

        pagination.innerHTML = `
            <button class="datatable_button${page === 0 ? ' disabled' : ''}" id="photos-prev" ${page === 0 ? 'disabled' : ''}>&#8249;</button>
            <span style="padding:0 12px;font-size:13px;">${page + 1} / ${totalPages}</span>
            <button class="datatable_button${page >= totalPages - 1 ? ' disabled' : ''}" id="photos-next" ${page >= totalPages - 1 ? 'disabled' : ''}>&#8250;</button>
        `;

        document.getElementById('photos-prev')?.addEventListener('click', () => {
            if (this.currentPage > 0) this.loadPhotos(--this.currentPage);
        });
        document.getElementById('photos-next')?.addEventListener('click', () => {
            if (this.currentPage < totalPages - 1) this.loadPhotos(++this.currentPage);
        });

        const hasPendingEncoding = photos.some((photo) => !photo.encodingState);
        if (hasPendingEncoding) {
            this._schedulePolling();
        } else {
            this._stopPolling();
        }
    }
}
