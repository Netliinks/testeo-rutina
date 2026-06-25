import { getModels, requestModelTrain } from "../../../endpoints.js";
import { drawTagsIntoTables } from "../../../tools.js";
import { Config } from "../../../Configs.js";

const PAGE_SIZE = 10;

export class Models {
    constructor() {
        this.datatableContainer = document.getElementById('datatable-container');
        this.currentPage = 0;
    }

    async render() {
        this.datatableContainer.innerHTML = `
            <div class="datatable" id="datatable">
                <div class="datatable_header">
                    <div class="datatable_title"><h1>Reconocimiento Facial / Modelos</h1></div>
                    <div class="datatable_tools">
                        <button class="datatable_button import_user" id="btn-train-model">Entrenar modelo</button>
                    </div>
                </div>

                <table class="datatable_content">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th class="thead_centered">Estado</th>
                            <th>Mensaje</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                        </tr>
                    </thead>
                    <tbody id="datatable-body" class="datatable_body"></tbody>
                </table>
            </div>

            <div class="datatable_footer margin_t_8">
                <div class="datatable_pagination" id="pagination-container"></div>
            </div>
        `;

        document.getElementById('btn-train-model').addEventListener('click', async () => {
            const btn = document.getElementById('btn-train-model');
            btn.disabled = true;
            btn.textContent = 'Entrenando...';
            try {
                await requestModelTrain();
                btn.textContent = 'Solicitud enviada';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'Entrenar modelo';
                    this.loadModels(this.currentPage);
                }, 2000);
            } catch (err) {
                console.error('requestModelTrain error:', err);
                btn.disabled = false;
                btn.textContent = 'Entrenar modelo';
            }
        });

        await this.loadModels(this.currentPage);
    }

    async loadModels(page) {
        const tbody = document.getElementById('datatable-body');
        const pagination = document.getElementById('pagination-container');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#808080;">Cargando...</td></tr>`;

        const result = await getModels(page, PAGE_SIZE);
        const models = Array.isArray(result) ? result : (result?.content ?? []);
        const totalPages = result?.totalPages ?? 1;

        if (!models.length) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#808080;">Sin modelos</td></tr>`;
            pagination.innerHTML = '';
            return;
        }

        tbody.innerHTML = models.map(m => `
            <tr>
                <td>${m.id ?? '-'}</td>
                <td class="tag"><span>${m.modelState ?? '-'}</span></td>
                <td>${m.message ?? '-'}</td>
                <td>${m.startedAt ? new Date(m.startedAt).toLocaleString() : '-'}</td>
                <td>${m.stoppedAt ? new Date(m.stoppedAt).toLocaleString() : '-'}</td>
            </tr>
        `).join('');

        drawTagsIntoTables();

        pagination.innerHTML = `
            <button class="datatable_button${page === 0 ? ' disabled' : ''}" id="models-prev" ${page === 0 ? 'disabled' : ''}>&#8249;</button>
            <span style="padding:0 12px;font-size:13px;">${page + 1} / ${totalPages}</span>
            <button class="datatable_button${page >= totalPages - 1 ? ' disabled' : ''}" id="models-next" ${page >= totalPages - 1 ? 'disabled' : ''}>&#8250;</button>
        `;

        document.getElementById('models-prev')?.addEventListener('click', () => {
            if (this.currentPage > 0) this.loadModels(--this.currentPage);
        });
        document.getElementById('models-next')?.addEventListener('click', () => {
            if (this.currentPage < totalPages - 1) this.loadModels(++this.currentPage);
        });
    }
}
