import { getModels, requestModelTrain } from "../../../endpoints.js";
import { Config } from "../../../Configs.js";

const PAGE_SIZE = 10;

export class Models {
    constructor() {
        this.datatableContainer = document.getElementById('datatable-container');
        this.currentPage = 0;
    }

    async render() {
        this.datatableContainer.innerHTML = `
            <div class="datatable_container">
                <div class="datatable_header">
                    <h2 class="datatable_title">Reconocimiento Facial / Modelos</h2>
                    <button class="btn btn_primary" id="btn-train-model">Entrenar modelo</button>
                </div>
                <div class="datatable" id="models-table">
                    <div class="datatable_body">
                        <table>
                            <thead>
                                <tr class="datatable_head">
                                    <th>Estado</th>
                                    <th>Mensaje</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                </tr>
                            </thead>
                            <tbody id="models-body">
                                <tr><td colspan="3" style="text-align:center;padding:24px;color:#808080;">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;">
                        <button class="btn" id="models-prev">&#8249; Anterior</button>
                        <span id="models-page-info" style="font-size:13px;color:#808080;"></span>
                        <button class="btn" id="models-next">Siguiente &#8250;</button>
                    </div>
                </div>
            </div>
        `;

        const trainBtn = document.getElementById('btn-train-model');
        trainBtn.addEventListener('click', async () => {
            trainBtn.disabled = true;
            trainBtn.textContent = 'Entrenando...';
            try {
                await requestModelTrain();
                trainBtn.textContent = 'Solicitud enviada';
                setTimeout(() => {
                    trainBtn.disabled = false;
                    trainBtn.textContent = 'Entrenar modelo';
                    this.loadModels(this.currentPage);
                }, 2000);
            } catch (err) {
                console.error('requestModelTrain error:', err);
                trainBtn.disabled = false;
                trainBtn.textContent = 'Entrenar modelo';
            }
        });

        document.getElementById('models-prev').addEventListener('click', () => {
            if (this.currentPage > 0) this.loadModels(--this.currentPage);
        });
        document.getElementById('models-next').addEventListener('click', () => {
            this.loadModels(++this.currentPage);
        });

        await this.loadModels(this.currentPage);
    }

    async loadModels(page) {
        const tbody = document.getElementById('models-body');
        const pageInfo = document.getElementById('models-page-info');
        const prevBtn = document.getElementById('models-prev');
        const nextBtn = document.getElementById('models-next');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#808080;">Cargando...</td></tr>`;

        const result = await getModels(page, PAGE_SIZE);
        const models = Array.isArray(result) ? result : (result?.content ?? []);
        const totalPages = result?.totalPages ?? 1;

        if (!models.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#808080;">Sin modelos</td></tr>`;
        } else {
            tbody.innerHTML = models.map(m => `
                <tr class="datatable_row">
                    <td>${m.modelState ?? '-'}</td>
                    <td>${m.message ?? '-'}</td>
                    <td>${m.startedAt ? new Date(m.startedAt).toLocaleString() : '-'}</td>
                    <td>${m.stoppedAt ? new Date(m.stoppedAt).toLocaleString() : '-'}</td>
                </tr>
            `).join('');
        }

        pageInfo.textContent = `Página ${page + 1} / ${totalPages}`;
        prevBtn.disabled = page === 0;
        nextBtn.disabled = page >= totalPages - 1;
    }
}
