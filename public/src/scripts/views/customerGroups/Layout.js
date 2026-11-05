//
//  Layout.js - Customer Groups View Layout
//
export const tableLayoutGroups = `
  <div class="datatable" id="datatable">
    <div class="datatable_header">
      <div class="datatable_title" id="datatable-title"><h1>Grupos de Clientes</h1></div>
      <div class="datatable_tools" id="datatable-tools">
        <select class="input_select" id="filter-active" style="padding: 6px 12px; margin-right: 8px;">
          <option value="">Todos los Estados</option>
          <option value="true" selected>Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <input type="search"
          class="search_input"
          placeholder="Buscar por grupo o controlador"
          id="search">
        <button
            class="datatable_button add_user"
            id="btnSearch">
            <i class="fa-solid fa-search"></i>
        </button>
        <button
          class="datatable_button add_user"
          id="new-group"
          title="Crear Nuevo Grupo">
          <i class="fa-solid fa-add"></i>
        </button>
      </div>
    </div>

    <table class="datatable_content">
      <thead><tr>
        <th><span>Nombre del Grupo <i class="fa-regular fa-filter"></i></span></th>
        <th><span>Solicitante</span></th>
        <th><span>Empresa Controladora</span></th>
        <th><span>N° Miembros Activos</span></th>
        <th><span>Estado</span></th>
        <th class="header_filled">Acciones</th>
      </tr></thead>
      <tbody id="datatable-body" class="datatable_body">
      </tbody>
    </table>
  </div>

  <div class="datatable_footer">
    <div class="datatable_pagination" id="pagination-container"></div>
  </div>`;

export const tableLayoutGroupMembers = `
  <div class="datatable" id="datatable">
    <div class="datatable_header">
      <div class="datatable_title" id="datatable-title">
        <h1 id="group-title-header">Integrantes del Grupo</h1>
      </div>
      <div class="datatable_tools" id="datatable-tools">
        <button class="datatable_button" id="btn-back-groups" style="background-color: #6c757d; color: white; padding: 6px 12px; border-radius: 4px; margin-right: 8px;">
          <i class="fa-solid fa-arrow-left"></i> Volver a Grupos
        </button>
        <button class="datatable_button" id="btn-change-controller" style="background-color: #0d6efd; color: white; padding: 6px 12px; border-radius: 4px; margin-right: 8px;">
          <i class="fa-solid fa-crown"></i> Cambiar Controladora
        </button>
        <input type="search" class="search_input" placeholder="Buscar integrante por nombre o RUC" id="search-member">
        <button class="datatable_button add_user" id="btnSearchMember">
          <i class="fa-solid fa-search"></i>
        </button>
        <button class="datatable_button add_user" id="new-member" title="Agregar Integrante">
          <i class="fa-solid fa-add"></i>
        </button>
      </div>
    </div>

    <div id="group-info-banner" style="background: #f8f9fa; padding: 12px 20px; border-bottom: 1px solid #e9ecef; font-size: 0.95em; display: flex; gap: 20px;">
      <div><strong>Grupo:</strong> <span id="banner-group-name">...</span></div>
      <div><strong>Solicitante:</strong> <span id="banner-applicant">...</span></div>
      <div><strong>Controladora:</strong> <span id="banner-controller">...</span></div>
    </div>

    <table class="datatable_content">
      <thead><tr>
        <th><span>Empresa Integrante</span></th>
        <th><span>RUC</span></th>
        <th><span>Estado</span></th>
        <th class="header_filled">Acciones</th>
      </tr></thead>
      <tbody id="datatable-body" class="datatable_body">
      </tbody>
    </table>
  </div>

  <div class="datatable_footer">
    <div class="datatable_pagination" id="pagination-container"></div>
  </div>`;
