import { getModels, requestModelTrain } from "../../../endpoints.js";
import { Config } from "../../../Configs.js";

export class Models {
    constructor() {
        this.datatableContainer = document.getElementById('datatable-container');
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
                                    <th>Nombre</th>
                                    <th>Estado</th>
                                    <th>Creado</th>
                                </tr>
                            </thead>
                            <tbody id="models-body">
                                <tr><td colspan="3" style="text-align:center;padding:24px;color:#808080;">Cargando...</td></tr>
                            </tbody>
                        </table>
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
                    this.loadModels();
                }, 2000);
            } catch (err) {
                console.error('requestModelTrain error:', err);
                trainBtn.disabled = false;
                trainBtn.textContent = 'Entrenar modelo';
            }
        });

        await this.loadModels();
    }

    async loadModels() {
        const tbody = document.getElementById('models-body');
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#808080;">Cargando...</td></tr>`;
        const result = await getModels();
        const models = Array.isArray(result) ? result : (result?.content ?? []);

        if (!models.length) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:24px;color:#808080;">Sin modelos</td></tr>`;
            return;
        }

        tbody.innerHTML = models.map(m => `
            <tr class="datatable_row">
                <td>${m.name ?? m.modelName ?? m.id ?? '-'}</td>
                <td>${m.status ?? m.state ?? '-'}</td>
                <td>${m.createdDate ?? m.creationDate ?? '-'}</td>
            </tr>
        `).join('');
    }
}
