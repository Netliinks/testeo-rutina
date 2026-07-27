// @filename: locations.ts
import { deleteEntity, getEntitiesData, registerEntity, updateEntity, getEntityData, getFilterEntityData, getFilterEntityCount, getUserInfo } from "../../../endpoints.js";
import { inputObserver, inputSelect, CloseDialog, filterDataByHeaderType, pageNumbers, fillBtnPagination, currentDateTime, getDetails, equivalentTime } from "../../../tools.js";
import { Config } from "../../../Configs.js";
import { tableLayout } from "./Layout.js";
import { tableLayoutTemplate } from "./Template.js";
const tableRows = Config.tableRows;
const currentPage = Config.currentPage;
const customerId = localStorage.getItem('customer_id');
let infoPage = {
  count: 0,
  offset: Config.offset,
  currentPage: currentPage,
  search: ""
};
let dataPage;
const getLocations = async () => {
    //nombre de la entidad
    /*const location = await getEntitiesData('Location');
    const FCustomer = location.filter((data) => `${data.customer?.id}` === `${customerId}`);
    return FCustomer;*/
    let raw = JSON.stringify({
      "filter": {
          "conditions": [
              {
                  "property": "customer.id",
                  "operator": "=",
                  "value": `${customerId}`
              },
          ],
      },
      sort: "-createdDate",
      limit: Config.tableRows,
      offset: infoPage.offset,
      //fetchPlan: 'full',
  });
  if (infoPage.search != "") {
      raw = JSON.stringify({
          "filter": {
              "conditions": [
                  {
                      "group": "OR",
                      "conditions": [
                          {
                              "property": "name",
                              "operator": "contains",
                              "value": `${infoPage.search.toLowerCase()}`
                          }
                      ]
                  },
                  {
                      "property": "customer.id",
                      "operator": "=",
                      "value": `${customerId}`
                  }
              ]
          },
          sort: "-createdDate",
          limit: Config.tableRows,
          offset: infoPage.offset,
          //fetchPlan: 'full',
      });
  }
  infoPage.count = await getFilterEntityCount("QRPoint", raw);
  dataPage = await getFilterEntityData("QRPoint", raw);
  return dataPage;
};
export class Locations {
    constructor() {
        this.dialogContainer = document.getElementById('app-dialogs');
        this.entityDialogContainer = document.getElementById('entity-editor-container');
        this.content = document.getElementById('datatable-container');
        this.searchEntity = async (tableBody /*, data*/) => {
            const search = document.getElementById('search');
            const btnSearch = document.getElementById('btnSearch');
            search.value = infoPage.search;
            await search.addEventListener('keyup', () => {
                /*const arrayData = data.filter((user) => `${user.name}`
                    .toLowerCase()
                    .includes(search.value.toLowerCase()));
                let filteredResult = arrayData.length;
                let result = arrayData;
                if (filteredResult >= tableRows)
                    filteredResult = tableRows;
                this.load(tableBody, currentPage, result);
                this.pagination(result, tableRows, currentPage);*/
            });
            btnSearch.addEventListener('click', async () => {
              new Locations().render(Config.offset, Config.currentPage, search.value.toLowerCase().trim());
            });
        };
    }

    async render(offset, actualPage, search) {
        infoPage.offset = offset;
        infoPage.currentPage = actualPage;
        infoPage.search = search;
        this.content.innerHTML = '';
        this.content.innerHTML = tableLayout;
        const tableBody = document.getElementById('datatable-body');
        tableBody.innerHTML = '.Cargando...';
        let data = await getLocations();
        tableBody.innerHTML = tableLayoutTemplate.repeat(tableRows);
        this.load(tableBody, currentPage, data);
        this.searchEntity(tableBody /*, data*/);
        new filterDataByHeaderType().filter();
        this.pagination(data, tableRows, infoPage.currentPage);
    }

    load(table, currentPage, data) {
        table.innerHTML = '';
        currentPage--;
        let start = tableRows * currentPage;
        let end = start + tableRows;
        let paginatedItems = data.slice(start, end);
        if (data.length === 0) {
            let mensaje = 'No existen datos';
            if(customerId == null){mensaje = 'Seleccione una empresa';}
            let row = document.createElement('tr');
            row.innerHTML = `
        <td>${mensaje}</td>
        <td></td>
        <td></td>
      `;
            table.appendChild(row);
        }
        else {
            for (let i = 0; i < paginatedItems.length; i++) {
                let location = paginatedItems[i];
                let row = document.createElement('tr');
                row.innerHTML += `
          <td>${location.name}</td>
          <td>${location.latitude}</td>
          <td>${location.longitude}</td>
          <td>${location?.distance ?? 0}</td>
          <td class="entity_options">
          <button class="button" id="edit-entity" data-entityId="${location.id}">
            <i class="fa-solid fa-pen"></i>
          </button>
            <button class="button" id="remove-entity" data-entityId="${location.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        `;
                table.appendChild(row);
            }
        }
        this.register();
        this.edit(this.entityDialogContainer, data);
        this.remove();

    }
    pagination(items, limitRows, currentPage) {
      const tableBody = document.getElementById('datatable-body');
      const paginationWrapper = document.getElementById('pagination-container');
      paginationWrapper.innerHTML = '';
      let pageCount;
      pageCount = Math.ceil(infoPage.count / limitRows);
      let button;
      if (pageCount <= Config.maxLimitPage) {
        for (let i = 1; i < pageCount + 1; i++) {
            button = setupButtons(i /*, items, currentPage, tableBody, limitRows*/);
            paginationWrapper.appendChild(button);
        }
        fillBtnPagination(currentPage, Config.colorPagination);
        }
      else {
          pagesOptions(items, currentPage);
      }
        function setupButtons(page /*, items, currentPage, tableBody, limitRows*/) {
            const button = document.createElement('button');
            button.classList.add('pagination_button');
            button.setAttribute("name", "pagination-button");
            button.setAttribute("id", "btnPag" + page);
            button.innerText = page;
            button.addEventListener('click', () => {
                currentPage = page;
                new Locations().render(infoPage.offset, currentPage, infoPage.search);
            });
            return button;
        }
        function pagesOptions(items, currentPage) {
          paginationWrapper.innerHTML = '';
          let pages = pageNumbers(items, Config.maxLimitPage, currentPage);
          const prevButton = document.createElement('button');
          prevButton.classList.add('pagination_button');
          prevButton.innerText = "<<";
          paginationWrapper.appendChild(prevButton);
          const nextButton = document.createElement('button');
          nextButton.classList.add('pagination_button');
          nextButton.innerText = ">>";
          for (let i = 0; i < pages.length; i++) {
              if (pages[i] > 0 && pages[i] <= pageCount) {
                  button = setupButtons(pages[i]);
                  paginationWrapper.appendChild(button);
              }
          }
          paginationWrapper.appendChild(nextButton);
          fillBtnPagination(currentPage, Config.colorPagination);
          setupButtonsEvents(prevButton, nextButton);
      }
      function setupButtonsEvents(prevButton, nextButton) {
          prevButton.addEventListener('click', () => {
              new Locations().render(Config.offset, Config.currentPage, infoPage.search);
          });
          nextButton.addEventListener('click', () => {
              infoPage.offset = Config.tableRows * (pageCount - 1);
              new Locations().render(infoPage.offset, pageCount, infoPage.search);
          });
      }
    }
    register() {
        // register entity
        const openEditor = document.getElementById('new-entity');
        openEditor.addEventListener('click', () => {
            renderInterface();
        });
        const renderInterface = async () => {
            let lat = -2.186790330550842;
            let long = -79.8948977850493;
            let zoom = 13
            if(infoPage.count != 0){
              lat = parseFloat(dataPage[0].latitude);
              //console.log(lat)
              long = parseFloat(dataPage[0].longitude);
              //console.log(long)
              zoom = 20;
            }
            let fecha = new Date(); //Fecha actual
            let mes = fecha.getMonth()+1; //obteniendo mes
            let dia = fecha.getDate(); //obteniendo dia
            let anio = fecha.getFullYear(); //obteniendo año
            let _hours = fecha.getHours();
            let _minutes = fecha.getMinutes();
            let _fixedHours = ('0' + _hours).slice(-2);
            let _fixedMinutes = ('0' + _minutes).slice(-2);
            if(dia<10)
                dia='0'+dia; //agrega cero si el menor de 10
            if(mes<10)
                mes='0'+mes //agrega cero si el menor de 10
            this.entityDialogContainer.innerHTML = '';
            this.entityDialogContainer.style.display = 'flex';
            //<div class="entity_editor" id="entity-editor" style="max-width:80%"></div>
            this.entityDialogContainer.innerHTML = `
            
        <div class="entity_editor" id="entity-editor">
          <div class="entity_editor_header">
            <div class="user_info">
              <div class="avatar"><i class="fa-solid fa-location-crosshairs"></i></div>
              <h1 class="entity_editor_title">Registrar <br><small>Ubicación</small></h1>
            </div>
            <button class="btn btn_close_editor" id="close"><i class="fa-regular fa-x"></i></button>
          </div>
          <!-- EDITOR BODY -->
          <div class="entity_editor_body">
            <div class="material_input">
              <input type="text" id="entity-name" autocomplete="none">
              <label for="entity-name">Nombre Ubicación</label>
            </div>
            <div class="material_input">
              <input type="text" id="entity-latitude" autocomplete="none" value="${lat}">
              <label for="entity-latitude">Latitud</label>
            </div>
            <div class="material_input">
              <input type="text" id="entity-longitude" autocomplete="none" value="${long}">
              <label for="entity-longitude">Longitud</label>
            </div>
            <div class="material_input">
              <label class="form_label" for="entity-distance">Distancia (metros)</label>
              <br><br>
              <select class="input_time input_time-start" id="entity-distance" style="width: 100%;">
                  <option value="5" selected>5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="40">40</option>
                  <option value="50">50</option>
                  <option value="60">60</option>
              </select>
            </div>
          </div>
          <!-- END EDITOR BODY -->
          <div class="entity_editor_footer">
            <button class="btn btn_primary btn_widder" id="register-entity">Guardar</button>
          </div>
        </div>
      `;
            // @ts-ignore
            inputObserver();
            //initAutocomplete(lat, long, zoom);
            this.close();
            const registerButton = document.getElementById('register-entity');
            registerButton.addEventListener('click', async () => {
                const inputsCollection = {
                    name: document.getElementById('entity-name'),
                    latitude: document.getElementById('entity-latitude'),
                    longitude: document.getElementById('entity-longitude'),
                    distance: document.getElementById('entity-distance'),
                };

                const raw = JSON.stringify({
                    "name": `${inputsCollection.name.value.trim().toUpperCase()}`,
                    'latitude' : `${inputsCollection.latitude.value.trim()}`,
                    'longitude' : `${inputsCollection.longitude.value.trim()}`,
                    "distance": `${inputsCollection.distance.value}`,
                    "business": {
                        "id": `${Config.currentUser.business.id}`
                    },
                    "customer": {
                        "id": `${customerId}`
                    },
                    'creationDate': `${currentDateTime().date}`,
                    'creationTime': `${currentDateTime().timeHHMMSS}`,
                });
                if(inputsCollection.name.value.trim() == "" || inputsCollection.name.value == undefined){
                    alert("Nombre de Ubicación vacía");
                }else if(inputsCollection.latitude.value.trim() == "" || inputsCollection.longitude.value.trim() == ""){
                    alert("Latitud o Longitud vacía");
                }else{
                    registerEntity(raw, 'QRPoint');
                    setTimeout(() => {
                        const container = document.getElementById('entity-editor-container');
                        new CloseDialog().x(container);
                        new Locations().render(Config.offset, Config.currentPage, infoPage.search);
                    }, 1000);
                }
            });
            /*const btnObtCords = document.getElementById('obtCords');
            btnObtCords.addEventListener('click', () => {
                var geocoder = new google.maps.Geocoder();
                var direccion = document.getElementById('pac-input').value; // Obtén la dirección ingresada por el usuario desde un campo de entrada de texto
            
                geocoder.geocode({ 'address': direccion }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var latitud = results[0].geometry.location.lat();
                    var longitud = results[0].geometry.location.lng();
                    //console.log('Latitud: ' + latitud);
                    //console.log('Longitud: ' + longitud);
                    initAutocomplete(latitud, longitud, 20);
                } else {
                    //console.log('Geocodificación fallida: ' + status);
                    alert("No encontrado "+status);
                }
                });
            });*/
             
            
        };
        /*async function initAutocomplete(lat, lng, zoom) {
          //var map = new google.maps.Map(document.getElementById('map'), {
          var marker1;
          const { Map } = await google.maps.importLibrary("maps");
          const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")
    
          var map = new Map(document.getElementById("map"), {
            center: {
              lat: lat,
              lng: lng
            },
            zoom: zoom,
            mapId: Config.mapIdGM,
            mapTypeId: 'hybrid'
          });
    
           // Create the search box and link it to the UI element.
          var input = document.getElementById('pac-input');
          //console.log(input);
          var searchBox = new google.maps.places.SearchBox(input);       
          //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    
            // Bias the SearchBox results towards current map's viewport.
            map.addListener('bounds_changed', function() {
                searchBox.setBounds(map.getBounds());
            });
            map.addListener('click', function(event) {
                let location = event.latLng;
                //console.log(location)
                if (marker1) {
                    //marker1.setPosition(location);
                    marker1.map = null;
                    marker1 = new AdvancedMarkerElement({
                        position: location,
                        map: map,
                        title: 'Mi marcador'
                    });
                  } else {
                    //marker1 = new google.maps.Marker({
                    marker1 = new AdvancedMarkerElement({
                        position: location,
                        map: map,
                        title: 'Mi marcador'
                    });
                  }
                  const cords = document.getElementById('entity-cords');
                  cords.classList.add('input_filled');
                  cords.value = `${location.lat()}, ${location.lng()}`;
                  //var latitud = location.lat();
                  //var longitud = location.lng();
                  //console.log('Latitud2: ' + latitud);
                  //console.log('Longitud2: ' + longitud)
        
            });
          } */
        

    }
    edit(container, data) {

      const edit = document.querySelectorAll('#edit-entity');
      edit.forEach((edit) => {
          const entityId = edit.dataset.entityid;
          edit.addEventListener('click', () => {
              RInterface('QRPoint', entityId);
          });
      });
      const RInterface = async (entities, entityID) => {
          const data = await getEntityData(entities, entityID);
          this.entityDialogContainer.innerHTML = '';
          this.entityDialogContainer.style.display = 'flex';
          //<div class="entity_editor" id="entity-editor" style="max-width:80%"></div>
          this.entityDialogContainer.innerHTML = `
      <div class="entity_editor" id="entity-editor">
        <div class="entity_editor_header">
          <div class="user_info">
            <div class="avatar"><i class="fa-regular fa-location-crosshairs"></i></div>
            <h1 class="entity_editor_title">Editar <br><small>${data.name}</small></h1>
          </div>
          <button class="btn btn_close_editor" id="close"><i class="fa-solid fa-x"></i></button>
        </div>
        <!-- EDITOR BODY -->
        <div class="entity_editor_body">
              <div class="material_input">
                <input type="text"
                  id="entity-name"
                  class="input_filled"
                  value="${data?.name ?? ''}">
                <label for="entity-name">Nombre Ubicación</label>
              </div>
              <div class="material_input">
                <input type="text"
                  id="entity-latitude"
                  class="input_filled"
                  value="${data?.latitude ?? ''}">
                <label for="entity-latitude">Latitud</label>
              </div>
              <div class="material_input">
                <input type="text"
                  id="entity-longitude"
                  class="input_filled"
                  value="${data?.longitude ?? ''}">
                <label for="entity-longitude">Longitud</label>
              </div>
              <div class="material_input">
                <label class="form_label" for="entity-distance">Distancia (metros)</label>
                <br><br>
                <select class="input_time input_time-start" id="entity-distance" style="width: 100%;">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                    <option value="60">60</option>
                </select>
              </div>
              <div style="display:flex;justify-content:center">
                    <img alt="Código QR ${data?.name.trim() ?? ''}" id="qrcode">
                    <br>
                    <button id="btnDescargar">Descargar</button>
              </div>
        </div>
        <!-- END EDITOR BODY -->
        <div class="entity_editor_footer">
          <button class="btn btn_primary btn_widder" id="update-changes">Guardar</button>
        </div>
      </div>
    `;

          inputObserver();
          if (data?.distance) {
            document.getElementById("entity-distance").value = data.distance;
          }
          this.close();
          const qr = document.getElementById("qrcode");
            // @ts-ignore
            new QRious({
                element: qr,
                value: data.id,
                size: 250,
                backgroundAlpha: 1,
                foreground: "#1D4C82FF",
                level: "H", // Puede ser L,M,Q y H (L es el de menor nivel, H el mayor)
            });
            download(qr, data);
          UUpdate(entityID, data);
      };
      const download = (qr, data) => {
        const btnDescargar = document.getElementById('btnDescargar');
        btnDescargar.addEventListener('click', () => {
            const enlace = document.createElement("a");
            enlace.href = qr.src;
            enlace.download = `Código QR ${data?.name.trim() ?? ''}.png`;
            enlace.click();
        });
    };
      const UUpdate = async (entityId, data) => {
          const updateButton = document.getElementById('update-changes');
          const $value = {
            // @ts-ignore
            name: document.getElementById('entity-name'),
            latitude: document.getElementById('entity-latitude'),
            longitude: document.getElementById('entity-longitude'),
            distance: document.getElementById('entity-distance'),
          };
          updateButton.addEventListener('click', () => {
              let raw = JSON.stringify({
                  "name": `${$value.name.value.trim().toUpperCase()}`,
                  "latitude": `${$value.latitude.value.trim()}`,
                  "longitude": `${$value.longitude.value.trim()}`,
                  "distance": `${$value.distance.value}`,
              });
              if($value.name.value.trim() == "" || $value.name.value == undefined){
                alert("Nombre de Ubicación vacía");
              }else if($value.latitude.value.trim() == "" || $value.longitude.value.trim() == ""){
                alert("Latitud o Longitud vacía");
              }else{
                update(raw);
              }
          });
          /*const btnObtCords = document.getElementById('obtCords');
            btnObtCords.addEventListener('click', () => {
                var geocoder = new google.maps.Geocoder();
                var direccion = document.getElementById('pac-input').value; // Obtén la dirección ingresada por el usuario desde un campo de entrada de texto
            
                geocoder.geocode({ 'address': direccion }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    var latitud = results[0].geometry.location.lat();
                    var longitud = results[0].geometry.location.lng();
                    //console.log('Latitud: ' + latitud);
                    //console.log('Longitud: ' + longitud);
                    initAutocomplete(latitud, longitud, 20, data);
                } else {
                    //console.log('Geocodificación fallida: ' + status);
                    alert("No encontrado "+status);
                }
                });
            });*/
          const update = (raw) => {
            updateEntity('QRPoint', entityId, raw)
                .then((res) => {
                setTimeout(async () => {
                    let tableBody;
                    let container;
                    new CloseDialog()
                        .x(container =
                        document.getElementById('entity-editor-container'));
                    new Locations().render(infoPage.offset, infoPage.currentPage, infoPage.search);
                }, 100);
            });
        };
      };
      /*async function initAutocomplete(lat, lng, zoom, data) {
        //var map = new google.maps.Map(document.getElementById('map'), {
        var marker1;
        var marker2;
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")
        var map = new Map(document.getElementById("map"), {
          center: {
            lat: lat,
            lng: lng
          },
          zoom: zoom,
          mapId: Config.mapIdGM,
          mapTypeId: 'hybrid'
        });
  
         // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        //console.log(input);
        var searchBox = new google.maps.places.SearchBox(input);       
        //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  
          // Bias the SearchBox results towards current map's viewport.
          map.addListener('bounds_changed', function() {
              searchBox.setBounds(map.getBounds());
          });
          map.addListener('click', function(event) {
              let location = event.latLng;
              //console.log(location)
              if (marker1) {
                  //marker1.setPosition(location);
                  marker1.map = null;
                  marker1 = new AdvancedMarkerElement({
                      position: location,
                      map: map,
                      title: 'Mi marcador'
                  });
                } else {
                  //marker1 = new google.maps.Marker({
                  marker1 = new AdvancedMarkerElement({
                      position: location,
                      map: map,
                      title: 'Mi marcador'
                  });
                }
                const cords = document.getElementById('entity-cords');
                cords.classList.add('input_filled');
                cords.value = `${location.lat()}, ${location.lng()}`;
                if(marker2 != undefined)
                  marker2.map = null;
                  //marker2.setMap(null);
                //var latitud = location.lat();
                //var longitud = location.lng();
                //console.log('Latitud2: ' + latitud);
                //console.log('Longitud2: ' + longitud)
      
          });
          if(lat != "" || lng != ""){
            let myLatLng = { lat: lat, lng: lng };
            const latitude = parseFloat(data.latitude);
            const longitude = parseFloat(data.longitude);
            if(lat != latitude && lng != longitude){
              myLatLng = { lat: latitude, lng: longitude };
            }
            //marker2 =  new google.maps.Marker({
            marker2 = new AdvancedMarkerElement({
              position: myLatLng,
              map,
              title: "Posición Actual",
              });
              //marker2.setMap(map);
            }
        } */
  }
    remove() {
        const remove = document.querySelectorAll('#remove-entity');
        remove.forEach((remove) => {
            const entityId = remove.dataset.entityid;
            remove.addEventListener('click', async () => {
                const checkRaw = JSON.stringify({
                    "filter": {
                        "conditions": [
                            {
                                "property": "qrPoint.id",
                                "operator": "=",
                                "value": `${entityId}`
                            }
                        ]
                    }
                });
                const count = await getFilterEntityCount("RoutineRelation", checkRaw);
                if (count > 0) {
                    alert("No se puede eliminar la ubicación porque está asignada en una planificación de rutina.");
                    return;
                }
                this.dialogContainer.style.display = 'flex';
                this.dialogContainer.innerHTML = `
          <div class="dialog_content" id="dialog-content">
            <div class="dialog dialog_danger">
              <div class="dialog_container">
                <div class="dialog_header">
                  <h2>¿Deseas eliminar esta Ubicación?</h2>
                </div>
                <div class="dialog_message">
                  <p>Esta acción no se puede revertir</p>
                </div>
                <div class="dialog_footer">
                  <button class="btn btn_primary" id="cancel">Cancelar</button>
                  <button class="btn btn_danger" id="delete">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        `;
                // delete button
                // cancel button
                // dialog content
                const deleteButton = document.getElementById('delete');
                const cancelButton = document.getElementById('cancel');
                const dialogContent = document.getElementById('dialog-content');
                deleteButton.onclick = async () => {
                    deleteEntity('QRPoint', entityId)
                        .then(res => new Locations().render(infoPage.offset, infoPage.currentPage, infoPage.search));
                    new CloseDialog().x(dialogContent);
                };
                cancelButton.onclick = () => {
                    new CloseDialog().x(dialogContent);
                };
            });
        });
    }
    close() {
        const closeButton = document.getElementById('close');
        const editor = document.getElementById('entity-editor-container');
        closeButton.addEventListener('click', () => {
            console.log('close');
            new CloseDialog().x(editor);
        });
    }
    

    /*placeMarker(location) {
        if (marker1) {
        marker1.setPosition(location);
        } else {
        marker1 = new google.maps.Marker({
            position: location,
            map: map,
            title: 'Mi marcador'
        });
        
        
        }
        
        var latitud = location.lat();
        var longitud = location.lng();
        const myLatLng = { lat: latitud, lng: longitud };
        /*marker2 =  new google.maps.Marker({
        position: myLatLng,
        map,
        title: "Hello World!",
        });
        marker2.setMap(map);
        console.log('Latitud2: ' + latitud);
        console.log('Longitud2: ' + longitud);
    }*/
        

}
/*export const setNewPassword = async () => {
    const users = await getEntitiesData('User');
    const FNewUsers = users.filter((data) => data.isSuper === false);
    FNewUsers.forEach((newUser) => {
    });
    console.group('Nuevos usuarios');
    console.log(FNewUsers);
    console.time(FNewUsers);
    console.groupEnd();
};*/

/*if(timeIni[0] > timeEnd[0]){
  console.log("caso 1");
  let schedules = calculoTimes(ubications, timeIni, timeEnd);
  console.log(schedules);
}else if(timeIni[0] < timeEnd[0]){
  console.log("caso 2");
  let schedules = calculoTimes(ubications, timeIni, timeEnd);
  console.log(schedules);
}else if(timeIni[0] == timeEnd[0]){
  console.log("caso 3");
  let schedules = calculoTimes(ubications, timeIni, timeEnd);
  console.log(schedules);
}*/
const agregarCero = (valor) => {
  valor < 10 ? valor = "0"+valor : valor;
  return valor;
}