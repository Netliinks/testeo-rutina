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
        <div class="entity_editor_body padding_t_8_important">
            <div class="sidebar_section margin_b_24">
                <h5 class="section_title text_left">Estructura</h5>
                <div class="form_group">
                    <div class="v_inputs">
                        <button class="btn_image btn_image-active"><img src="./public/src/assets/pictures/announcement-image-and-text-type.png"></button>
                    </div>

                    <div class="v_inputs">
                        <button class="btn_image"><img src="./public/src/assets/pictures/announcement-image-type.png"></button>
                    </div>
                </div>
            </div>


            <!-- ANNOUNCEMENT TITLE -->
            <div class="material_input">
                <input type="text" id="announcement-title" autocomplete="none">
                <label for="announcement-title">
                    <i class="fa-solid fa-heading"></i>
                    Título
                </label>
            </div>

            <!-- BOOKMARK: PICTURE IMPORT -->
            <input type="file" class="input_file margin_t_8 margin_b_16" accept="image/png, image/jpeg">

            <!-- ANNOUNCEMENT CONTENT -->
            <div class="form_input">
                <label for="announcement-content" class="form_label"><i class="fa-solid fa-paragraph"></i> Contenido del anuncio:</label>
                <textarea id="announcement-content" name="announcement-content" row="30" class="input_textarea"></textarea>
            </div>

            <div class="form_input">
                <button class="btn btn_widder btn_placeholder_type">Agregar botón <i class="margin_l_8 fa-solid fa-plus"></i></button>
            </div>

            <div class="sidebar_section">
                <h5 class="section_title text_center">Duración</h5>
            </div>

            <div class="form_group">
                <div class="v_inputs">
                    <div class="form_input">
                        <label class="form_label" for="from-in-date">Desde: </label>
                        <input type="date" class="input_clear input_widder input_centertext">
                    </div>

                    <div class="form_input">
                        <input type="time" class="input_clear input_widder input_centertext margin_t_16">
                    </div>
                </div>

                <div class="v_inputs">
                    <div class="form_input">
                        <label class="form_label" for="from-in-date">Hasta: </label>
                        <input type="date" class="input_clear input_widder input_centertext">
                    </div>

                    <div class="form_input">
                        <input type="time" class="input_clear input_widder input_centertext margin_t_16">
                    </div>
                </div>
            </div>
        </div>

        <!-- EDITOR FOOTER -->
        <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="post-announcement">Publicar</button>
        </div>
    </div>
`