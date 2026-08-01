// @filename AnnouncementsCreatorControllers.ts
export const announcementCreatorController = `
    <div class="entity_editor" id="entity-editor">
        <div class="entity_editor_header">
            <div class="user_info">
                <div class="avatar"><i class="fa-solid fa-rectangle-ad"></i></div>
                <h1 class="entity_editor_title">
                    Nuevo <br>
                    <small>Anuncio</small>
                </h1>
            </div>

            <button class="btn btn_close_editor" id="close">
                <i class="fa-regular fa-x"></i>
            </button>
        </div>

        <!-- EDITOR BODY --->
        <div class="entity_editor_body">
            <!-- ANNOUNCEMENT TITLE -->
            <div class="material_input">
                <input type="text" id="announcement-title" autocomplete="none">
                <label for="announcement-title">
                    <i class="fa-solid fa-heading"></i>
                    Título
                </label>
            </div>

            <!-- ANNOUNCEMENT CONTENT -->
            <div class="form_input">
                <label for="announcement-content" class="form_label"><i class="fa-solid fa-heading"></i> Contenido del anuncio:</label>

                <textarea id="announcement-content" name="announcement-content" row="30" class="input_textarea"></textarea>
            </div>
        </div>

        <!-- EDITOR FOOTER -->
        <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="post-announcement">Publicar</button>
        </div>
    </div>
`;
