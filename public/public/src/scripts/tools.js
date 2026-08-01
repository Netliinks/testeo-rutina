import { Config } from "./Configs.js";
import { getEntitiesData, getUserInfo, getFilterEntityData, getFilterEntityCount, getEntityData, registerEntity, _userAgent } from "./endpoints.js";
//
export const inputObserver = () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => {
        input.addEventListener("keyup", (e) => {
            if (input.value == "" || input.value == " ")
                input.classList.remove('input_filled'),
                    input.value = "";
            else
                input.classList.add('input_filled');
        });
    });
};
export const inputSelect = async (entity, selectId, currentStatus) => {
    const data = await getEntitiesData(entity);
    const state = await currentStatus;
    const select = document.querySelector(`#${selectId}`);
    const inputParent = select.parentNode;
    const optionsContent = inputParent.querySelector('#input-options');
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('input_options_container');
    optionsContent.appendChild(optionsContainer);
    for (let i = 0; i < data.length; i++) {
        const inputOption = document.createElement('div');
        select.setAttribute('data-optionid', data[0].id);
        select.setAttribute('value', data[0].name);
        inputOption.classList.add('input_option');
        inputOption.setAttribute('id', data[i].id);
        let nameData = data[i].name;
        if (nameData === 'Enabled') {
            nameData = 'Activo';
        }
        else if (nameData === 'Disabled') {
            nameData = 'Inactivo';
        }
        inputOption.innerHTML = nameData;
        optionsContainer.appendChild(inputOption);
    }
    const options = optionsContainer.querySelectorAll('.input_option');
    if (state === "Enabled") {
        select.value = "Activo";
        select.setAttribute('data-optionid', '60885987-1b61-4247-94c7-dff348347f93');
    }
    else if (state === 'Disabled') {
        select.value = "Inactivo";
        select.setAttribute('data-optionid', '225b5e5d-9bb1-469a-b2d9-ca85d53db47b');
    }
    else {
        select.value = data[0].name;
    }
    select.addEventListener('click', () => {
        inputParent.classList.toggle('select_active');
    });
    options.forEach((option) => {
        option.addEventListener('click', () => {
            select.value = option.innerText;
            select.removeAttribute('data-optionid');
            select.setAttribute('data-optionid', option.getAttribute('id'));
            inputParent.classList.remove('select_active');
        });
    });
};

export const inputSelectType = async (selectId, currentType) => {
    const data = [
        {id: 'CUSTOMER', name: 'Cliente'},
        {id: 'GUARD', name: 'Guardia'},
    ]
    const type = await currentType;
    const select = document.querySelector(`#${selectId}`);
    const inputParent = select.parentNode;
    const optionsContent = inputParent.querySelector('#input-options');
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('input_options_container');
    optionsContent.appendChild(optionsContainer);

    for (let i = 0; i < data.length; i++) {
        const inputOption = document.createElement('div');
        select.setAttribute('data-optionid', data[0].id);
        select.setAttribute('value', data[0].name);
        inputOption.classList.add('input_option');
        inputOption.setAttribute('id', data[i].id);
        let nameData = data[i].name;
        inputOption.innerHTML = nameData;
        optionsContainer.appendChild(inputOption);
    }

    const options = optionsContainer.querySelectorAll('.input_option');
    if (type === "CUSTOMER") {
        select.value = "Cliente";
        select.setAttribute('data-optionid', type);
    }
    else if (type === 'GUARD') {
        select.value = "Guardia";
        select.setAttribute('data-optionid', type);
    }
    else {
        select.value = data[0].name;
    }
    select.addEventListener('click', () => {
        inputParent.classList.toggle('select_active');
    });
    options.forEach((option) => {
        option.addEventListener('click', () => {
            select.value = option.innerText;
            select.removeAttribute('data-optionid');
            select.setAttribute('data-optionid', option.getAttribute('id'));
            inputParent.classList.remove('select_active');
        });
    });
} 

export const verifyUserType = (userType) =>{
    if(userType == 'CUSTOMER'){
      return 'Cliente'
    }else if(userType == 'GUARD'){
      return 'Guardia'
    }else if(userType == 'EMPLOYEE'){
      return 'Empleado'
    }else if(userType == 'CONTRACTOR'){
      return 'Contratista'
    }else{
      return userType
    }
  }

export class FixStatusElement {
    fix(element) {
        const elementTextValue = element.innerText;
        if (elementTextValue === "Enabled")
            elementTextValue.innerText = 'Activo',
                elementTextValue.toUpperCase();
        else
            elementTextValue.toUpperCase();
    }
}
export class FixStatusInputElement {
    fix(inputId) {
        const inputs = document.querySelectorAll(`#${inputId}`);
        inputs.forEach((input) => {
            if (input.value === 'Enabled')
                input.value = 'Activo'.toUpperCase();
            else if (input.value == 'Disabled')
                input.value = 'Inactivo'.toUpperCase();
        });
    }
}
export const drawTagsIntoTables = () => {
    const tags = document.querySelectorAll('.tag span');
    tags.forEach((tag) => {
        let text = tag.innerText;
        if (text === "Enabled" ||
            text === "enabled" ||
            text === "ENABLED" ||
            text === "Activo" ||
            text === "ACTIVO") {
            tag.innerText = "Activo";
            tag.classList.add("tag_green");
        }
        else if (text === "Disabled" ||
            text === "disabled" ||
            text === "DISABLED" ||
            text === "Inactivo" ||
            text === "INACTIVO") {
            tag.innerText = "Inactivo";
            tag.classList.add("tag_gray");
        }
        else if (text === "Pendiente" ||
            text === "pendiente" ||
            text === "PENDIENTE") {
            tag.classList.add("tag_yellow");
        }
        else if(text === "No cumplido"||
            text === "no cumplido" ||
            text === "NO CUMPLIDO"){
            tag.classList.add("tag_red")
        }
        else {
            tag.classList.add('tag_gray');
        }
    });
};
export class CloseDialog {
    x(container) {
        container.style.display = 'none';
        // const dialog: InterfaceElement = container.firstElementChild
        // dialog.remove()
    }
}
// SIDEBAR RENDERING TOOLS
export const renderRightSidebar = (UIFragment) => {
    const dialogContainer = document.getElementById('entity-editor-container');
    dialogContainer.innerHTML = '';
    dialogContainer.style.display = 'flex';
    dialogContainer.innerHTML = UIFragment;
};
export const fixDate = () => {
    const arrayDates = document.querySelectorAll('#table-date');
    arrayDates.forEach((date) => {
        const dateP1 = date.innerText.split('-');
        const dateP2 = dateP1[2].split('T');
        const dateP3 = dateP2[1].split(':');
        const YearDate = dateP1[0];
        const MonthDate = dateP1[1];
        const DayDate = dateP2[0];
        const Hours = dateP3[0];
        const Minutes = dateP3[1];
        const Seconds = dateP3[2];
        const DT = YearDate + ' ' + MonthDate + ' ' + DayDate;
        const Time = Hours + ':' + Minutes + ':' + Seconds.slice(0, 2);
        date.innerText = DT + ' ' + Time;
    });
};
export class filterDataByHeaderType {
    constructor() {
        this.datatable = document.getElementById('datatable');
        this.filter = () => {
            this.datatable.onclick = (e) => {
                if (e.target.tagName != "SPAN")
                    return;
                let span = e.target;
                let th = e.target.parentNode;
                const THead = this.datatable.querySelectorAll('tr th span');
                THead.forEach((header) => {
                    header.classList.remove('datatable_header_selected');
                });
                e.target.classList.add('datatable_header_selected');
                this.sortGrid(th.cellIndex, span.dataset.type, span);
            };
        };
        this.sortGrid = (colNum, type, span) => {
            let tbody = this.datatable.querySelector('tbody');
            let rowsArray = Array.from(tbody.rows);
            let compare;
            if (span.dataset.mode == "desc") {
                compare = (rowA, rowB) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? -1 : 1;
                };
                span.setAttribute("data-mode", "asc");
            }
            else {
                compare = (rowA, rowB) => {
                    return rowA.cells[colNum].innerHTML >
                        rowB.cells[colNum].innerHTML ? 1 : -1;
                };
                span.setAttribute("data-mode", "desc");
            }
            /*switch (type) {
                case 'name':
                    compare = (rowA, rowB) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1;
                    };
                    break;
                case 'id':
                    compare = (rowA, rowB) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1;
                    };
                    break;
                case 'status':
                    compare = (rowA, rowB) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1;
                    };
                    break;
                case 'citadel':
                    compare = (rowA, rowB) => {
                        return rowA.cells[colNum].innerHTML >
                            rowB.cells[colNum].innerHTML ? 1 : -1;
                    };
                    break;
            }*/
            rowsArray.sort(compare);
            tbody.append(...rowsArray);
        };
    }
}
export const userInfo = getUserInfo();

export const getVerifyEmail = async (email) => {
    let value = false;
    //console.log(email.includes("@"))
    if(email.includes("@") === true){
        /*const users = await getEntitiesData('User');
        const data = users.filter((data) => `${data.email}`.includes(`${email}`));*/
        let raw = JSON.stringify({
            "filter": {
                "conditions": [
                  {
                    "property": "email",
                    "operator": "=",
                    "value": `${email}`
                  }
                ]
            }
        });
        let data = await getFilterEntityData("User", raw);
        if(data.length != 0){
            value = true;
        }
    }
    return value;
};
export const getVerifyUsername = async (username) => {
    let value = "none";
    //console.log(email.includes("@"))
    if (username != '') {
        /*const users = await getEntitiesData('User');
        const data = users.filter((data) => `${data.email}`.includes(`${email}`));*/
        let raw = JSON.stringify({
            "filter": {
                "conditions": [
                    {
                        "property": "username",
                        "operator": "=",
                        "value": `${username}`
                    }
                ]
            },
            fetchPlan: 'full',
            limit: 1
        });
        let data = await getFilterEntityData("User", raw);
        if (data.length != 0) {
            value = `${verifyUserType(data[0].userType)}, super: ${data[0].isSuper ? 'Si' : 'No'}, en empresa: ${data[0]?.customer?.name ?? ''} | username: ${username}`;
        }
    }
    return value;
};
export const registryPlataform = async (id) => {
    let platUser = await getEntityData('User', id);
    const _date = new Date();
    // TIME
    const _hours = _date.getHours();
    const _minutes = _date.getMinutes();
    const _seconds = _date.getSeconds();
    const _fixedHours = ('0' + _hours).slice(-2);
    const _fixedMinutes = ('0' + _minutes).slice(-2);
    const _fixedSeconds = ('0' + _seconds).slice(-2);
    const currentTime = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
    // DATE
    const _day = _date.getDate();
    const _month = _date.getMonth() + 1;
    const _year = _date.getFullYear();
    const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
    let plataformRaw = JSON.stringify({
        // @ts-ignore
        "userAgent": `${_userAgent}`,
        "customer": {
            "id": `${platUser.customer.id}`
        },
        "system": {
            "id": `8d457eb2-fe46-5797-7203-55aaa1813010`
        },
        "user": {
            "id": `${platUser.id}`
        },
        // @ts-ignore
        "creationDate": `${date}`,
        // @ts-ignore
        "creationTime": `${currentTime}`,
    });
    await registerEntity(plataformRaw, 'WebAccess')
        .then(res => {
        console.log("Registrado");
    }).catch(err => console.log(err));
};
export const pageNumbers = (totalPages, max, currentPage) => {
    let limitMin;
    let limitMax;
    let ranges = [];
    if (currentPage == 1) {
        limitMin = 1;
        limitMax = max;
        for (let i = limitMin; i <= limitMax; i++) {
            ranges.push(i);
        }
    }
    /*else if(currentPage == totalPages){
        let limit = totalPages - max
        for(let i = limit; i <= totalPages; i++){
                ranges.push(i)
        }
    }*/ else {
        limitMin = currentPage - 4;
        for (let i = limitMin; i < currentPage; i++) {
            ranges.push(i);
        }
        limitMax = currentPage + 5;
        for (let i = currentPage; i <= limitMax; i++) {
            ranges.push(i);
        }
    }
    return ranges;
};
export const fillBtnPagination = (currentPage, color) => {
    let btnActive = document.getElementById("btnPag" + currentPage);
    if(btnActive) btnActive.style.backgroundColor = color;
    //btnActive.focus();
};

export const currentDateTime = () => {
    const _date = new Date();
    // TIME
    const _hours = _date.getHours();
    const _minutes = _date.getMinutes();
    const _seconds = _date.getSeconds();
    const _fixedHours = ('0' + _hours).slice(-2);
    const _fixedMinutes = ('0' + _minutes).slice(-2);
    const _fixedSeconds = ('0' + _seconds).slice(-2);
    const currentTimeHHMMSS = `${_fixedHours}:${_fixedMinutes}:${_fixedSeconds}`;
    const currentTimeHHMM = `${_fixedHours}:${_fixedMinutes}`;
    // DATE
    const _day = _date.getDate();
    const _month = _date.getMonth() + 1;
    const _year = _date.getFullYear();
    const date = `${_year}-${('0' + _month).slice(-2)}-${('0' + _day).slice(-2)}`;
    return {
        date: date,
        timeHHMMSS: currentTimeHHMMSS,
        timeHHMM: currentTimeHHMM
    }
}

export const getDetails = async (param, value, table) => {
    const customerId = localStorage.getItem('customer_id');
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                "property": `${param}`,
                "operator": "=",
                "value": `${value}`
                },
                {
                "property": `customer.id`,
                "operator": "=",
                "value": `${customerId}`
                }
            ]
        },
        sort: "createdDate", 
        fetchPlan: 'full',
    });
    let data = await getFilterEntityData(`${table}`, raw);
    return data
}

export const getDetails2 = async (param, value, param2, value2, table) => {
    const customerId = localStorage.getItem('customer_id');
    let raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                "property": `${param}`,
                "operator": "=",
                "value": `${value}`
                },
                {
                "property": `${param2}`,
                "operator": "=",
                "value": `${value2}`
                },
                {
                "property": `customer.id`,
                "operator": "=",
                "value": `${customerId}`
                }
            ]
        },
        sort: "createdDate", 
        fetchPlan: 'full',
    });
    let data = await getFilterEntityData(`${table}`, raw);
    return data
}

export const calculateGestionMarcation = (assistControl) => {
    let objDate = {}
    let arrayAssist= []
    assistControl.forEach((marcation) => {
        let date = marcation.ingressDate+" "+marcation.user?.username ?? ''
        if (objDate[date]) {
            objDate[date].push(marcation);
        } else {
            objDate[date] = [marcation];
        }
    })
    //console.log(objDate)

    let key = Object.keys(objDate)
    for(let i = 0; i < key.length; i++){
        let objects = objDate[key[i]]
        //console.log(objects)
        //console.log(objects.length)
        let valueMax = []
        objects.map(element => {
            if(element.marcationState.name == 'Finalizado' && (element.egressTime != '' || element.egressTime != null || element.egressTime != undefined)){
                valueMax.push(element)
            }
            
            })
        let maxDate = new Date(
            Math.max(
                ...valueMax.map(element => {
                    return new Date(element.egressDate+" "+element.egressTime);
                }),
            ),
            );
            let minDate = new Date(
            Math.min(
                ...objects.map(element => {
                return new Date(element.ingressDate+" "+element.ingressTime);
                }),
            ),
            );
            //console.log("max "+maxDate)
            //console.log("min "+minDate)
            const format = (date) => {
            var year = date.getFullYear();
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var day = ("0" + date.getDate()).slice(-2);

            var hours = ("0" + date.getHours()).slice(-2);
            var minutes = ("0" + date.getMinutes()).slice(-2);
            var seconds = ("0" + date.getSeconds()).slice(-2);
            return `${hours}:${minutes}:${seconds}`
            }
            let fechaSalida = ""
            if(!isNaN(maxDate)) fechaSalida = format(maxDate)
            let obj = {
            "customer": `${objects[0]?.customer?.name ?? ''}`,    
            "firstName": `${objects[0]?.user?.firstName ?? ''}`,
            "lastName": `${objects[0]?.user?.lastName ?? ''}`,
            "dni": `${objects[0]?.user?.dni ?? ''}`,
            "ingressDate": `${objects[0].ingressDate}`,
            "egressDate": `${
                fechaSalida != "" 
                    ? objects[0].egressDate != undefined ? objects[0].egressDate : objects[0].ingressDate
                    : ""
            }`,
            "ingressTime": `${format(minDate)}`,
            "egressTime": `${fechaSalida}`,
            "username": `${objects[0]?.user?.username ?? ''}`
        };
        arrayAssist.push(obj);
    }
    return arrayAssist;
}

export const calculateLine = (text, limit) => {
    if(text != undefined){
        if(text.length <= limit){
            return text;
        }else{
            return text.slice(0, limit)+"...";
        }
    }else{
        return '';
    }
    
}

export const equivalentTime = (time) => {
    if(time == '13'){
        return 1;
    }else if(time == '14'){
        return 2;
    }else if(time == '15'){
        return 3;
    }else if(time == '16'){
        return 4;
    }else if(time == '17'){
        return 5;
    }else if(time == '18'){
        return 6;
    }else if(time == '19'){
        return 7;
    }else if(time == '20'){
        return 8;
    }else if(time == '21'){
        return 9;
    }else if(time == '22'){
        return 10;
    }else if(time == '23'){
        return 11;
    }else if(time == '24'){
        return 0;
    }else if(time == '00'){
        return 12;
    }else if(time == '01'){
        return 13;
    }else if(time == '02'){
        return 14;
    }else if(time == '03'){
        return 15;
    }else if(time == '04'){
        return 16;
    }else if(time == '05'){
        return 17;
    }else if(time == '06'){
        return 18;
    }else if(time == '07'){
        return 19;
    }else if(time == '08'){
        return 20;
    }else if(time == '09'){
        return 21;
    }else if(time == '10'){
        return 22;
    }else if(time == '11'){
        return 23;
    }else if(time == '12'){
        return 0;
    }
}
    
export const searchUniversalSingle = async (param, operator, value, table) => {
    const raw = JSON.stringify({
        "filter": {
          "conditions": [
            {
              "property": `${param}`,
              "operator": `${operator}`,
              "value": `${value}`
            },
          ]
        },
        sort: "-createdDate",
    });
    const data = await getFilterEntityData(`${table}`, raw);
    if(data == undefined || data.length == 0){
        alert(`${param} ${value} no obtenido(a)`);
    }else{
        return data;
    }
}

export const getRoutinesTopBar =async(id)=> {
    const raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": "business.id",
                    "operator": "=",
                    "value": `${id}`
                },
                {
                    "property": "routineState.name",
                    "operator": "=",
                    "value": `No cumplido`
                }
            ]
        },
        sort: "-createdDate",
    });
    return await getFilterEntityCount("RoutineRegister", raw);

}

export const searchUniversalValue = async (param, operator, value, table) => {
    const raw = JSON.stringify({
        "filter": {
          "conditions": [
            {
              "property": `${param}`,
              "operator": `${operator}`,
              "value": `${value}`
            }
          ]
        },
        sort: "createdDate",
    });
    const data = await getFilterEntityData(`${table}`, raw);
    if(data == undefined || data.length == 0){
        alert(`${param} ${value} no obtenido(a)`);
    }else{
        return data;
    }
}

export const searchUniversalValueComplex = async (param, operator, value, table) => {
    const raw = JSON.stringify({
        "filter": {
          "conditions": [
            {
              "property": `${param}`,
              "operator": `${operator}`,
              "value": `${value}`
            }
          ]
        },
        sort: "createdDate",
        fetchPlan: 'full',
    });
    const data = await getFilterEntityData(`${table}`, raw);
    if(data == undefined || data.length == 0){
        alert(`${param} ${value} no obtenido(a)`);
    }else{
        return data;
    }
}

export const searchUniversalSingle2 = async (param, operator, value, param2, operator2, value2, table) => {
    const raw = JSON.stringify({
        "filter": {
            "conditions": [
                {
                    "property": `${param}`,
                    "operator": `${operator}`,
                    "value": `${value}`
                },
                {
                    "property": `${param2}`,
                    "operator": `${operator2}`,
                    "value": `${value2}`
                },
            ]
        },
        sort: "-createdDate",
    });
    const data = await getFilterEntityData(`${table}`, raw);
    if (data == undefined) {
        alert(`Ocurrio un error`);
        return undefined;
    }
    else if (data.length == 0) {
        return 'none';
    }
    else {
        return data;
    }
};

export const searchCustomerbyName = async (name, business) => {
    const raw = JSON.stringify({
        "filter": {
          "conditions": [
            {
              "property": `name`,
              "operator": `contains`,
              "value": `${name}`
            },
            {
              "property": `business.id`,
              "operator": `=`,
              "value": `${business}`
            },
          ]
        },
        sort: "createdDate",
    });
    const data = await getFilterEntityData(`Customer`, raw);
    if(data == undefined || data.length == 0){
        alert(`Nombre empresa: ${name}, no encontrado.`);
        return null;
    }else{
        let response = undefined;
        for(let i=0; i < data.length; i++){
            if(data[i].name.toLowerCase() === name.toLowerCase()){
                response = data[i]
            }
        }
        return response;
    }
}

export const inputSelectTypeAudit = async (selectId, _inputElements) => {
    //const data = ['GUARDIA', 'CONSOLA', 'CLIENTE']
    const data = ['GUARDIA'];
    //const type = await currentType;
    const select = document.querySelector(`#${selectId}`);
    const inputParent = select.parentNode;
    const optionsContent = inputParent.querySelector('#input-options');
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('input_options_container');
    optionsContent.appendChild(optionsContainer);
    for (let i = 0; i < data.length; i++) {
        const inputOption = document.createElement('div');
        select.setAttribute('value', data[0]);
        inputOption.classList.add('input_option');
        inputOption.setAttribute('value', data[i]);
        let nameData = data[i];
        inputOption.innerHTML = nameData;
        optionsContainer.appendChild(inputOption);
    }
    const options = optionsContainer.querySelectorAll('.input_option');
    select.value = data[0];
    select.addEventListener('click', () => {
        inputParent.classList.toggle('select_active');
    });
    options.forEach((option) => {
        option.addEventListener('click', () => {
            select.value = option.innerText;
            select.removeAttribute('value');
            select.setAttribute('value', option.getAttribute('value'));
            inputParent.classList.remove('select_active');
            //_inputElements.entityElement.removeAttribute('value');
            //_inputElements.entityElement.removeAttribute('data-optionid');
            //service.removeAttribute('value');
            //service.removeAttribute('data-optionid');
            if (option.getAttribute('value') === "CLIENTE") {
                //console.log("es cliente")
                //_inputElements.divStatsCustomer.style.display = "flex";
                //_inputElements.divStatsUser.style.display = "none";
            }
            else {
                //console.log("no es cliente")
                //_inputElements.divStatsCustomer.style.display = "none";
                //_inputElements.divStatsUser.style.display = "none";//"flex";
            }
        });
    });
};
export const inputSelectThemeAudit = async (selectId, currentSelect, _inputElements) => {
    const data = ['INGRESO EMERGENTE', 'INGRESO VEHICULAR', 'RUTINA', 'CONSIGNAS (REPORTES)', 'RUTINA DE GUARDIA', 'RUTINA DE CONSOLA'];
    //const type = await currentType;
    const select = document.querySelector(`#${selectId}`);
    const inputParent = select.parentNode;
    const optionsContent = inputParent.querySelector('#input-options');
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('input_options_container');
    optionsContent.appendChild(optionsContainer);
    for (let i = 0; i < data.length; i++) {
        const inputOption = document.createElement('div');
        select.setAttribute('value', data[0]);
        inputOption.classList.add('input_option');
        inputOption.setAttribute('value', data[i]);
        let nameData = data[i];
        inputOption.innerHTML = nameData;
        optionsContainer.appendChild(inputOption);
    }
    const options = optionsContainer.querySelectorAll('.input_option');
    select.value = data[0];
    select.addEventListener('click', () => {
        inputParent.classList.toggle('select_active');
    });
    options.forEach((option) => {
        option.addEventListener('click', () => {
            select.value = option.innerText;
            select.removeAttribute('value');
            select.setAttribute('value', option.getAttribute('value'));
            inputParent.classList.remove('select_active');
            //_inputElements.entityElement.removeAttribute('value');
            //_inputElements.entityElement.removeAttribute('data-optionid');
            //service.removeAttribute('value');
            //service.removeAttribute('data-optionid');
            if (option.getAttribute('value') === "RUTINA DE GUARDIA" || option.getAttribute('value') === "RUTINA DE CONSOLA") {
                //console.log("es cliente")
                _inputElements.divAllCustomer.style.display = "none";
                _inputElements.divCustomer.style.display = "none";
            }
            else {
                //console.log("no es cliente")
                _inputElements.divAllCustomer.style.display = "block";
                _inputElements.divCustomer.style.display = "block";//"flex";
            }
        });
    });
};
export const padTo2Digits = (num) => {
    return num.toString().padStart(2, '0');
};
export const msToHHMMSS = (ms) => {
    if (ms < 0)
        ms = 0; // Prevent negative times
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
};
export const averageTime = (times) => {
    let valueReturn;
    if (!Array.isArray(times) || times.length === 0) {
        //throw new Error("Input must be a non-empty array of numbers.");
        return valueReturn = 'N/A';
    }
    // Validate all entries
    for (const t of times) {
        if (typeof t !== "number" || isNaN(t) || t < 0) {
            //throw new Error("All time values must be non-negative numbers.");
            return valueReturn = 'ERROR -';
        }
    }
    const sum = times.reduce((acc, val) => acc + val, 0);
    const avgMs = sum / times.length;
    valueReturn = msToHHMMSS(avgMs);
    return valueReturn;
};
export const breakAudit = (conditions) => {
    const objAudit = {};
    const objUser = {};
    let rawAudits = [];
    if (conditions.objetive == "CONSOLA") {
        rawAudits = [...conditions.registers, ...conditions.registersNot];
    }
    else if (conditions.objetive == "GUARDIA") {
        rawAudits = [...conditions.registers, ...conditions.registersNot, ...conditions.registersAlert];
    }
    else if (conditions.objetive == "CLIENTE") {
        rawAudits = [...conditions.registers, ...conditions.registersNot];
    }
    const audits = [];
    rawAudits.forEach((rawAudit) => {
        const routine = rawAudit['routine']['id'];
        if (objAudit[routine]) {
            objAudit[routine].push(rawAudit);
        }
        else {
            objAudit[routine] = [rawAudit];
        }
        if (conditions.objetive == "CONSOLA") {
            if (rawAudit["consoleDate"] != undefined) {
                const consoleUser = rawAudit['consoleUserId']['id'];
                objUser[consoleUser] = [{
                        routine: '', // Solo para guia, no usar para mostrar
                        id: rawAudit['consoleUserId']['id'],
                        name: `${rawAudit['consoleUserId']['firstName']} ${rawAudit['consoleUserId']['lastName']} ${rawAudit['consoleUserId']['secondLastName']}`,
                        username: rawAudit['consoleUserId']['username'],
                        serviciosAtendidos: 0,
                        averageRaw: [],
                        promedio: ''
                    }];
            }
        }
        else if (conditions.objetive == "GUARDIA") {
            const user = rawAudit['user']['id'];
            objUser[user] = [{
                    routine: '', // Solo para guia, no usar para mostrar
                    routine1: '', // Solo para guia, no usar para mostrar
                    routine2: '', // Solo para guia, no usar para mostrar
                    routine3: '', // Solo para guia, no usar para mostrar
                    id: rawAudit['user']['id'],
                    name: `${rawAudit['user']['firstName']} ${rawAudit['user']['lastName']} ${rawAudit['user']['secondLastName']}`,
                    username: rawAudit['user']['username'],
                    cant_servicios: 0,
                    servicios_marcados: 0,
                    servicios_alerta: 0,
                    servicios_no_marcados: 0,
                }];
        }
    });
    const countGeneral = {
        sinNoCumplida: 0,
        totalNoMarcadas: 0,
        contestadas: 0,
        noContestadas: 0
    };
    let key = Object.keys(objAudit);
    let key2 = Object.keys(objUser);
    for (let i = 0; i < key.length; i++) {
        if (conditions.objetive == "CONSOLA") {
            const rawUser = [];
            const onlyNames = [];
            let objects = objAudit[key[i]];
            //console.log(objects)
            //console.log(objects.length)
            const counts = {
                marcadas: 0,
                noMarcadas: 0
            };
            const responseConsole = [];
            // @ts-ignore
            objects.map(element => {
                if (element['routineRegisterState']['name'] == 'Cumplido') {
                    counts.marcadas += 1;
                }
                else if (element['routineRegisterState']['name'] == 'No cumplido') {
                    counts.noMarcadas += 1;
                    let observation = element["observation"] ?? "";
                    if (observation != "") {
                        if (element["consoleDate"] != undefined) {
                            const creationDateTime = new Date(`${element["creationDate"]}T${element["creationTime"]}`);
                            const consoleDateTime = new Date(`${element["consoleDate"]}T${element["consoleTime"]}`);
                            const avg = consoleDateTime.getTime() - creationDateTime.getTime();
                            responseConsole.push(avg);
                            const index = key2.findIndex(filterElement => filterElement === element['consoleUserId']['id']);
                            let objects2 = objUser[key2[index]];
                            // @ts-ignore
                            objects2.map(element2 => {
                                if (element['consoleUserId']['id'] == element2['id']) {
                                    element2["averageRaw"].push(avg);
                                    // @ts-ignore
                                    const existUser = onlyNames.some(user => user === element2["name"]);
                                    if (!existUser) {
                                        onlyNames.push(element2["name"]);
                                    }
                                    if (element2['routine'] == "" || element2['routine'] != objects[0]['routine']['id']) {
                                        element2['serviciosAtendidos'] += 1;
                                        element2['routine'] = objects[0]['routine']['id'];
                                    }
                                }
                            });
                            /*for(let y = 0; y < key2.length; y++){
                                let objects2 = objUser[key2[y]]
                                // @ts-ignore
                                objects2.map(element2 => {
                                    if(element['consoleUserId']['id'] == element2['id']){
                                        element2["averageRaw"].push(avg)
                                        if(element2['routine'] == "" || element2['routine'] != objects[0]['routine']['id']){
                                            element2['serviciosAtendidos'] += 1
                                            element2['routine'] = objects[0]['routine']['id']
                                        }
                                    }
                                })
                            }*/
                        }
                    }
                }
            });
            if (counts.noMarcadas == 0) {
                countGeneral.sinNoCumplida += 1;
            }
            else {
                countGeneral.totalNoMarcadas += 1;
                if (responseConsole.length == 0) {
                    countGeneral.noContestadas += 1;
                }
                else {
                    countGeneral.contestadas += 1;
                }
            }
            //Estadisticas generales de usuarios de consola
            for (let y = 0; y < key2.length; y++) {
                let objects2 = objUser[key2[y]];
                // @ts-ignore
                objects2.map(element2 => {
                    const averageDateUser = averageTime(element2["averageRaw"]);
                    element2["promedio"] = averageDateUser;
                    // @ts-ignore
                    const existUser = rawUser.some(user => user.id === element2['id']);
                    if (!existUser) {
                        rawUser.push(element2);
                        //onlyNames.push(element2["name"])
                    }
                });
            }
            const averageDate = averageTime(responseConsole);
            let nameService = `${objects[0]['routine']['name'] ?? ''}`;
            const deletedBy = `${objects[0]['routine']['deletedBy'] ?? ''}`;
            if (deletedBy != '') {
                nameService = `${nameService} (ELIMINADO)`;
            }
            const obj = {
                "Cantidad_Servicios": key.length,
                "Servicios_Atendidos_Completo": countGeneral.sinNoCumplida, //servicios sin ningun no cumplido
                "Servicios_No_Marcados": countGeneral.totalNoMarcadas, //servicios con algun registro no cumplido
                "Servicios_Atendidos": countGeneral.contestadas, //servicios con algun registro no cumplido contestado
                "Servicios_No_Atendidos": countGeneral.noContestadas, //servicios con algun registro no cumplido no contestado
                "Usuarios": rawUser.sort((a, b) => a.name - b.name),
                "Servicio": `${nameService}`,
                "Fecha": `${objects[0]['routine']['creationDate'] ?? ''}`,
                "Marcadas": `${counts.marcadas}`,
                "No_Marcadas": `${counts.noMarcadas}`,
                "Resp_Consola": `${responseConsole.length}`,
                "Prom_Consola": `${averageDate}`,
                "atendido": onlyNames
            };
            audits.push(obj);
        }
        else if (conditions.objetive == "GUARDIA") {
            const rawUser = [];
            const onlyNames = [];
            let objects = objAudit[key[i]];
            //console.log(objects)
            //console.log(objects.length)
            const counts = {
                alertas: 0,
                marcadas: 0,
                noMarcadas: 0
            };
            const responseConsole = [];
            // @ts-ignore
            objects.map(element => {
                let countLocal = {
                    marcadas: 0,
                    noMarcadas: 0,
                    alertas: 0,
                };
                if (element['routineRegisterState']['name'] == 'Cumplido') {
                    counts.marcadas += 1;
                    countLocal.marcadas += 1;
                }
                else if (element['routineRegisterState']['name'] == 'No cumplido') {
                    counts.noMarcadas += 1;
                    countLocal.noMarcadas += 1;
                    let observation = element["observation"] ?? "";
                    if (observation != "") {
                        if (element["consoleDate"] != undefined) {
                            const creationDateTime = new Date(`${element["creationDate"]}T${element["creationTime"]}`);
                            const consoleDateTime = new Date(`${element["consoleDate"]}T${element["consoleTime"]}`);
                            const avg = consoleDateTime.getTime() - creationDateTime.getTime();
                            responseConsole.push(avg);
                        }
                    }
                }
                else if (element['routineRegisterState']['name'] == 'Alerta') {
                    counts.alertas += 1;
                    countLocal.alertas += 1;
                }
                let index = key2.findIndex(filterElement => filterElement === element['user']['id']);
                let objects2 = objUser[key2[index]];
                // @ts-ignore
                objects2.map(element2 => {
                    if (element['user']['id'] == element2['id']) {
                        if (element2['routine'] == "" || element2['routine'] != objects[0]['routine']['id']) {
                            element2['cant_servicios'] += 1;
                            element2['routine'] = objects[0]['routine']['id'];
                        }
                        if (countLocal.noMarcadas != 0) {
                            if (element2['routine1'] == "" || element2['routine1'] != objects[0]['routine']['id']) {
                                element2['servicios_no_marcados'] += 1;
                                element2['routine1'] = objects[0]['routine']['id'];
                            }
                        }
                        if (countLocal.marcadas != 0) {
                            if (element2['routine2'] == "" || element2['routine2'] != objects[0]['routine']['id']) {
                                element2['servicios_marcados'] += 1;
                                element2['routine2'] = objects[0]['routine']['id'];
                            }
                        }
                        if (countLocal.alertas != 0) {
                            if (element2['routine3'] == "" || element2['routine3'] != objects[0]['routine']['id']) {
                                element2['servicios_alerta'] += 1;
                                element2['routine3'] = objects[0]['routine']['id'];
                            }
                        }
                    }
                });
                /*for(let y = 0; y < key2.length; y++){
                    let objects2 = objUser[key2[y]]
                    // @ts-ignore
                    objects2.map(element2 => {
                        if(element['user']['id'] == element2['id']){
                            if(element2['routine'] == "" || element2['routine'] != objects[0]['routine']['id']){
                                element2['servicios_alerta'] += 1
                                element2['routine'] = objects[0]['routine']['id']
                            }
                        }
                    })

                }*/
            });
            if (counts.noMarcadas == 0) {
                countGeneral.sinNoCumplida += 1;
            }
            else {
                countGeneral.totalNoMarcadas += 1;
                if (responseConsole.length == 0) {
                    countGeneral.noContestadas += 1;
                }
                else {
                    countGeneral.contestadas += 1;
                }
            }
            for (let y = 0; y < key2.length; y++) {
                let objects2 = objUser[key2[y]];
                // @ts-ignore
                objects2.map(element2 => {
                    // @ts-ignore
                    const existUser = rawUser.some(user => user.id === element2['id']);
                    if (!existUser) {
                        rawUser.push(element2);
                        if (element2['username'] == objects[0]['routine']['supervisorUser']) {
                            onlyNames.push(element2["name"]);
                        }
                    }
                });
            }
            let nameService = `${objects[0]['routine']['name'] ?? ''}`;
            const deletedBy = `${objects[0]['routine']['deletedBy'] ?? ''}`;
            if (deletedBy != '') {
                nameService = `${nameService} (ELIMINADO)`;
            }
            const obj = {
                "Cantidad_Servicios": key.length,
                "Servicios_Atendidos_Completo": countGeneral.sinNoCumplida, //servicios sin ningun no cumplido
                "Servicios_No_Marcados": countGeneral.totalNoMarcadas, //servicios con algun registro no cumplido
                "Servicios_Atendidos": countGeneral.contestadas, //servicios con algun registro no cumplido contestado
                "Servicios_No_Atendidos": countGeneral.noContestadas, //servicios con algun registro no cumplido no contestado
                "Usuarios": rawUser.sort((a, b) => a.name - b.name),
                "Servicio": `${nameService}`,
                "Fecha": `${objects[0]['routine']['creationDate'] ?? ''}`,
                "Marcadas": `${counts.marcadas}`,
                "No_Marcadas": `${counts.noMarcadas}`,
                "atendido": onlyNames
            };
            audits.push(obj);
        }
        else if (conditions.objetive == "CLIENTE") {
            let objects = objAudit[key[i]];
            //console.log(objects)
            //console.log(objects.length)
            const counts = {
                marcadas: 0,
                noMarcadas: 0
            };
            const responseConsole = [];
            // @ts-ignore
            objects.map(element => {
                if (element['routineRegisterState']['name'] == 'Cumplido') {
                    counts.marcadas += 1;
                }
                else if (element['routineRegisterState']['name'] == 'No cumplido') {
                    counts.noMarcadas += 1;
                    let observation = element["observation"] ?? "";
                    if (observation != "") {
                        if (element["consoleDate"] != undefined) {
                            const creationDateTime = new Date(`${element["creationDate"]}T${element["creationTime"]}`);
                            const consoleDateTime = new Date(`${element["consoleDate"]}T${element["consoleTime"]}`);
                            const avg = consoleDateTime.getTime() - creationDateTime.getTime();
                            responseConsole.push(avg);
                        }
                    }
                }
            });
            const averageDate = averageTime(responseConsole);
            let nameService = `${objects[0]['routine']['name'] ?? ''}`;
            const deletedBy = `${objects[0]['routine']['deletedBy'] ?? ''}`;
            if (deletedBy != '') {
                nameService = `${nameService} (ELIMINADO)`;
            }
            const obj = {
                "Cantidad_Servicios": key.length,
                "Servicios_Atendidos_Completo": countGeneral.sinNoCumplida, //servicios sin ningun no cumplido
                "Servicios_No_Marcados": countGeneral.totalNoMarcadas, //servicios con algun registro no cumplido
                "Servicios_Atendidos": countGeneral.contestadas, //servicios con algun registro no cumplido contestado
                "Servicios_No_Atendidos": countGeneral.noContestadas, //servicios con algun registro no cumplido no contestado
                "Servicio": `${nameService}`,
                "Fecha": `${objects[0]['routine']['creationDate'] ?? ''}`,
                "Marcadas": `${counts.marcadas}`,
                "No_Marcadas": `${counts.noMarcadas}`,
                "Resp_Consola": `${responseConsole.length}`,
                "Prom_Consola": `${averageDate}`
            };
            audits.push(obj);
        }
    }
    return audits;
};
function esMenorOIgualA5Minutos(timestamp, registerTime) {
    //const timestamp = 5 * 60 * 1000; // 5 minutos = 300000 ms
    return registerTime <= timestamp;
}
function calcularMarcacionesPorFrecuencia(inicio, fin, hEntrada, hSalida, frecuenciaMinutos) {
    const fechaActual = new Date(inicio + 'T00:00:00');
    const fechaLimite = new Date(fin + 'T00:00:00');
    const todasLasMarcaciones = [];
    while (fechaActual <= fechaLimite) {
        let marcacionesDia = [];
        const fechaBaseStr = fechaActual.toISOString().split('T')[0];
        //console.log(`Generando marcaciones para el día: ${fechaBaseStr}`);

        // Definir punto de inicio (Entrada) y punto final (Salida)
        let mEntrada = new Date(`${fechaBaseStr}T${hEntrada}`);
        let mSalida = new Date(`${fechaBaseStr}T${hSalida}`);

        // Ajuste de turno nocturno: Si la salida es menor a la entrada, es el día siguiente
        if (hSalida <= hEntrada) {
            mSalida.setDate(mSalida.getDate() + 1);
        }

        // Generar marcaciones según la frecuencia dentro de esa jornada
        let marcaIterada = new Date(mEntrada);
        
        while (marcaIterada < mSalida) { //<=
            marcacionesDia.push({
                fechaHora: new Date(marcaIterada), // Clonamos la fecha
                display: marcaIterada.toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }),
                count: 0 // Contador inicializado en 0
            });

            // Sumar la frecuencia en minutos
            marcaIterada.setMinutes(marcaIterada.getMinutes() + frecuenciaMinutos);
        }

        // Avanzar al siguiente día calendario
        fechaActual.setDate(fechaActual.getDate() + 1);
        todasLasMarcaciones.push(marcacionesDia);
    }

    return {
        detalle: todasLasMarcaciones,
        totalEsperado: todasLasMarcaciones.flat().length
    };
}
const generarRangosTiempo = (inicio, fin, intervaloMinutos) => {
    let timestamps = [];
    //inicio.setSeconds(0, 0)
    let timeInicio = inicio.getTime();
    fin.setSeconds(0, 0);
    let timeFin = fin.getTime();
    const tiempoAdd = intervaloMinutos * 60 * 1000;
    let count = 0;
    // Mientras la hora actual no supere la hora de fin
    while (timeInicio <= timeFin) {
        timestamps.push({
            timestamp: timeInicio,
            count: 0
        });
        if (count == 0) {
            count++;
            inicio.setSeconds(0, 0);
            timeInicio = inicio.getTime();
        }
        // Incrementar el tiempo actual por el intervalo
        timeInicio += tiempoAdd;
    }
    return timestamps;
};
export const auditResponse = (conditions) => {
    const objUser = {};
    const objRoutine = {};
    let rawAudits = [];
    if (conditions.objetive == "RUTINA DE CONSOLA") {
        rawAudits = [...conditions.registers, ...conditions.registersNot];
    }
    else if (conditions.objetive == "RUTINA DE GUARDIA") {
        rawAudits = [...conditions.registers, ...conditions.registersNot, ...conditions.registersLibre];
    }
    const audits = [];
    if (conditions.objetive == "RUTINA DE CONSOLA") {
        rawAudits.forEach((rawAudit) => {
            const user = rawAudit['consoleUserId']?.id ?? '';
            if (user != '') {
                if (objUser[user]) {
                    objUser[user].push(rawAudit);
                }
                else {
                    objUser[user] = [rawAudit];
                }
            }
        });
    }
    else if (conditions.objetive == "RUTINA DE GUARDIA") {
        /*conditions.allUsersRoutines.forEach((routineUser) => {
            console.log(routineUser)
            const userId = routineUser?.user?.id ?? '';
            if (userId != '') {
                if (objUser[userId]) {
                    objUser[userId].push(routineUser);
                }
                else {
                    objUser[userId] = [routineUser];
                }
            }
        });*/

        rawAudits.forEach((rawAudit) => {
            const routine = rawAudit['routine']?.id ?? '';
            if (routine != '') {
                if (objRoutine[routine]) {
                    objRoutine[routine].push(rawAudit);
                }
                else {
                    objRoutine[routine] = [rawAudit];
                }
            }
        });
    }
    
    
        if (conditions.objetive == "RUTINA DE CONSOLA") {
            let key = Object.keys(objUser);
            for (let i = 0; i < key.length; i++) {
                let objects = objUser[key[i]];
                    //console.log(objects)
                //console.log(objects.length)
                const variables = {
                    //totalIntentosMarcacion: 0,
                    totalMarcacionesHechas: 0,
                    totalAlertasGeneradas: 0, // Las que crea el sistema de no cumplido
                    //totalAlertasNoMarcadas: 0, // Las que crea el sistema, las no respondidas en mas de 5 min o no respondidas para nada
                    totalAlertasRespondidas: 0,
                    totalAlertasRespondidasATiempo: 0,
                    tiempoLimite: 5 * 60 * 1000 // 5 minutos en milisegundos
                };
                const averageConsole = [];
                // @ts-ignore
                objects.map(element => {
                    //variables.totalIntentosMarcacion += 1
                    if (element['routineState']['name'] == 'Cumplido') {
                        variables.totalMarcacionesHechas += 1;
                    }
                    else if (element['routineState']['name'] == 'No cumplido') {
                        variables.totalAlertasGeneradas += 1;
                        let observation = element["observation"] ?? "";
                        if (observation != "") {
                            if (element["consoleDate"] != undefined) {
                                variables.totalAlertasRespondidas += 1;
                                const creationDateTime = new Date(`${element["creationDate"]}T${element["creationTime"]}`);
                                const consoleDateTime = new Date(`${element["consoleDate"]}T${element["consoleTime"]}`);
                                const avg = consoleDateTime.getTime() - creationDateTime.getTime();
                                averageConsole.push(avg);
                                if (esMenorOIgualA5Minutos(variables.tiempoLimite, avg)) {
                                    variables.totalAlertasRespondidasATiempo += 1;
                                }
                                else {
                                    //variables.totalAlertasNoMarcadas += 1
                                }
                            }
                        }
                        else {
                            //variables.totalAlertasNoMarcadas += 1
                        }
                    }
                });
                const cumplimiento = ((variables.totalAlertasRespondidasATiempo / conditions.registersNot.length/*variables.totalAlertasGeneradas*/) * 100).toFixed(2);
                const averageDate = averageTime(averageConsole);
                const obj = {
                    "Usuario": `${objects[0]['consoleUserId']['firstName'] ?? ''} ${objects[0]['consoleUserId']['lastName'] ?? ''} ${objects[0]['consoleUserId']['secondLastName'] ?? ''}`,
                    //"Total Intentos Marcacion": variables.totalIntentosMarcacion,
                    "Total Marcaciones Hechas": variables.totalMarcacionesHechas,
                    "Total Alertas Generadas": conditions.registersNot.length,//variables.totalAlertasGeneradas,
                    //"Total Alertas No Marcadas": variables.totalAlertasNoMarcadas,
                    "Total Alertas Respondidas": variables.totalAlertasRespondidas,
                    "Total Alertas Respondidas A Tiempo": variables.totalAlertasRespondidasATiempo,
                    "Cumplimiento": cumplimiento,
                    "Promedio": averageDate,
                };
                audits.push(obj);
            }
        }
        else if (conditions.objetive == "RUTINA DE GUARDIA") {
            //console.log(`${objects[0]['user']['firstName'] ?? ''} ${objects[0]['user']['lastName'] ?? ''} ${objects[0]['user']['secondLastName'] ?? ''}`)
            const users = [];
            let keyRoutine = Object.keys(objRoutine);
            conditions.allUsersRoutines.forEach((routineUser) => {
                const routines = [];
                const routineScheduleG = [];
                const routinesSchedule = [];
                const variables = {
                    totalRutinas: 0,
                    totalUbicaciones: 0,
                    totalRealizadas: 0,
                    totalValidas: 0,
                    totalEsperadas: 0
                };
                const index = keyRoutine.findIndex(filterElement => filterElement === routineUser['routine']['id']);
                let objectRoutine = objRoutine[keyRoutine[index]];
                if (objectRoutine != undefined) {
                    // @ts-ignore
                    objectRoutine.map(element2 => {
                        console.log(element2)//routineUser['routine']['id'] == element2['routine']['id'] && 
                            // @ts-ignore
                            const exisRoutine = routines.some(data => data.id === element2['routine']['id']);
                            if (!exisRoutine) {
                                routines.push(element2['routine']);
                                variables.totalRutinas += 1;
                            }

                            const exisRoutineScheduleG = routineScheduleG.some(data => data.id === element2['routineSchedule']['id']);
                            if (!exisRoutineScheduleG) {
                                const esperadas = calcularMarcacionesPorFrecuencia(conditions.filterStartDate, conditions.filterEndDate, element2['routineSchedule']['scheduleTime'], element2['routineSchedule']['scheduleTimeEnd'], element2['routineSchedule']['frequency']);
                                routineScheduleG.push({...element2["routineSchedule"], "rangos": esperadas.detalle});
                                variables.totalEsperadas += esperadas.totalEsperado;
                            }

                            const exisRoutineSchedule = routinesSchedule.some(data => data.id === element2['routineSchedule']['id']);
                            if (!exisRoutineSchedule) {
                                variables.totalUbicaciones += 1;
                                routinesSchedule.push(element2['routineSchedule']);
                            }

                        if (routineUser['user']['id'] == element2['user']['id']) {
                            if (element2['routineState']['name'] == 'Cumplido' || element2['routineState']['name'] == 'Libre') {
                                variables.totalRealizadas += 1;
                                const creationDateTime = new Date(`${element2["creationDate"]}T${element2["creationTime"]}`);
                                const indice = routineScheduleG.findIndex(data => data.id === element2['routineSchedule']['id']);
                                for (let r = 0; r < routineScheduleG[indice].rangos.length; r++) {
                                    let horaRango = routineScheduleG[indice].rangos[r];
                                    for (let m = 0; m < horaRango.length; m++) {
                                        if (horaRango[m + 1] != undefined) {
                                            if((creationDateTime.getTime() >= horaRango[m].fechaHora.getTime()) && (creationDateTime.getTime() < horaRango[m + 1].fechaHora.getTime())) {
                                                if (horaRango[m].count == 0) {
                                                    // si tiene marcacion en ese rango de tiempo
                                                    horaRango[m].count += 1;
                                                    variables.totalValidas += 1;
                                                }
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
                const existUser = audits.some(data => data.id === routineUser['user']['id']);
                if (!existUser) {
                    const ponderado = ((variables.totalValidas / variables.totalEsperadas) * 100).toFixed(2);
                    audits.push({
                        id: routineUser['user']['id'],
                        name: `${routineUser['user']['firstName'] ?? ''} ${routineUser['user']['lastName'] ?? ''} ${routineUser['user']['secondLastName'] ?? ''}`,
                        username: routineUser['user']['username'],
                        totalRutinas: variables.totalRutinas,
                        totalUbicaciones: variables.totalUbicaciones,
                        totalRealizadas: variables.totalRealizadas,
                        totalValidas: variables.totalValidas,
                        totalEsperadas: variables.totalEsperadas,
                        ponderado: ponderado
                    });
                }else{
                    audits.map(data => {
                        if(data.id == routineUser['user']['id']){
                            data.totalRutinas += variables.totalRutinas;
                            data.totalUbicaciones += variables.totalUbicaciones;
                            data.totalRealizadas += variables.totalRealizadas;
                            data.totalValidas += variables.totalValidas;
                            data.totalEsperadas += variables.totalEsperadas;
                            data.ponderado = ((data.totalValidas / data.totalEsperadas) * 100).toFixed(2);
                        }
                    });

                }
            });   
    }
    return audits;
};

export const routineToStimate = (conditions, rawRoutines) => {
    const objRoutine = {};
    rawRoutines.forEach((rawRoutine) => {
        let customer = rawRoutine['customer']['id'] ?? '';
        if (objRoutine[customer]) {
            objRoutine[customer].push(rawRoutine);
        }
        else {
            objRoutine[customer] = [rawRoutine];
        }
    });
    let key = Object.keys(objRoutine);
    const users = [];
    for (let i = 0; i < key.length; i++) {
        let objects = objRoutine[key[i]];
        objects.map(element => {
            const index = users.findIndex(u => u.id === element.user.id);
            if (index !== -1) {
                // Si existe: Actualizar (reemplazar el objeto en el índice encontrado)
                users[index].routines += 1; // Incrementar el contador de visitas
            } else {
                // Si no existe: Insertar
                // 1. Diferencia en milisegundos
                const fecha1 = new Date(conditions.filterStartDate);
                const fecha2 = new Date(conditions.filterEndDate);
                const diferenciaMs = Math.abs(fecha2.getTime() - fecha1.getTime());

                // 2. Convertir a días (redondear para evitar errores de zona horaria)
                const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

                // 3. Contar ambos extremos (sumar 1)
                const totalDias = dias + 1;
                users.push({
                    id: element.user.id,
                    name: `${element.user?.firstName ?? ''} ${element.user?.lastName ?? ''} ${element.user?.secondLastName ?? ''}`,
                    username: element.user?.username ?? '',
                    customer: `${element.customer?.name ?? ''}`,
                    routines: 1,
                    requerido: element?.customer?.reqNroRoutine == undefined ? 'N/A' : element?.customer?.reqNroRoutine == 0 ? 'N/A' : (element?.customer?.reqNroRoutine * totalDias),
                    cumplimiento: 0
                });
            }
        });
    }
    for(let i = 0; i < users.length; i++){
        const cumplimiento = users[i].requerido != 'N/A' ? ((users[i].routines / users[i].requerido) * 100).toFixed(2) : 'N/A';
        users[i].cumplimiento = cumplimiento;
    }
    return users;
}

export const visitToStimate = (conditions, rawVisits) => {
    const objVisit = {};
    rawVisits.forEach((rawVisit) => {
        let customer = rawVisit['customer']['id'] ?? '';
        if (objVisit[customer]) {
            objVisit[customer].push(rawVisit);
        }
        else {
            objVisit[customer] = [rawVisit];
        }
    });
    let key = Object.keys(objVisit);
    const users = [];
    for (let i = 0; i < key.length; i++) {
        let objects = objVisit[key[i]];
        objects.map(element => {
            const index = users.findIndex(u => u.id === element.user.id);
            if (index !== -1) {
                // Si existe: Actualizar (reemplazar el objeto en el índice encontrado)
                users[index].visits += 1; // Incrementar el contador de visitas
            } else {
                // Si no existe: Insertar
                // 1. Diferencia en milisegundos
                const fecha1 = new Date(conditions.filterStartDate);
                const fecha2 = new Date(conditions.filterEndDate);
                const diferenciaMs = Math.abs(fecha2.getTime() - fecha1.getTime());

                // 2. Convertir a días (redondear para evitar errores de zona horaria)
                const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

                // 3. Contar ambos extremos (sumar 1)
                const totalDias = dias + 1;
                users.push({
                    id: element.user.id,
                    name: `${element.user?.firstName ?? ''} ${element.user?.lastName ?? ''} ${element.user?.secondLastName ?? ''}`,
                    username: element.user?.username ?? '',
                    customer: `${element.customer?.name ?? ''}`,
                    visits: 1,
                    requerido: element?.customer?.reqNroVisitEmer == undefined ? 'N/A' : element?.customer?.reqNroVisitEmer == 0 ? 'N/A' : (element?.customer?.reqNroVisitEmer * totalDias),
                    cumplimiento: 0
                });
            }
        });
    }
    for(let i = 0; i < users.length; i++){
        const cumplimiento = users[i].requerido != 'N/A' ? ((users[i].visits / users[i].requerido) * 100).toFixed(2) : 'N/A';
        users[i].cumplimiento = cumplimiento;
    }
    return users;
}

export const vehicleToStimate = (conditions, rawVehicles) => {
    const objVehicle = {};
    rawVehicles.forEach((rawVehicle) => {
        let customer = rawVehicle['customer']['id'] ?? '';
        if (objVehicle[customer]) {
            objVehicle[customer].push(rawVehicle);
        }
        else {
            objVehicle[customer] = [rawVehicle];
        }
    });
    let key = Object.keys(objVehicle);
    const users = [];
    for (let i = 0; i < key.length; i++) {
        let objects = objVehicle[key[i]];
        objects.map(element => {
            const index = users.findIndex(u => u.id === element.ingressIssued.id);
            if (index !== -1) {
                // Si existe: Actualizar (reemplazar el objeto en el índice encontrado)
                users[index].vehicles += 1; // Incrementar el contador de visitas
            } else {
                // Si no existe: Insertar
                // 1. Diferencia en milisegundos
                const fecha1 = new Date(conditions.filterStartDate);
                const fecha2 = new Date(conditions.filterEndDate);
                const diferenciaMs = Math.abs(fecha2.getTime() - fecha1.getTime());

                // 2. Convertir a días (redondear para evitar errores de zona horaria)
                const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

                // 3. Contar ambos extremos (sumar 1)
                const totalDias = dias + 1;
                users.push({
                    id: element.ingressIssued.id,
                    name: `${element.ingressIssued?.firstName ?? ''} ${element.ingressIssued?.lastName ?? ''} ${element.ingressIssued?.secondLastName ?? ''}`,
                    username: element.ingressIssued?.username ?? '',
                    customer: `${element.customer?.name ?? ''}`,
                    vehicles: 1,
                    requerido: element?.customer?.reqNroVehicle == undefined ? 'N/A' : element?.customer?.reqNroVehicle == 0 ? 'N/A' : (element?.customer?.reqNroVehicle * totalDias),
                    cumplimiento: 0
                });
            }
        });
    }
    for(let i = 0; i < users.length; i++){
        const cumplimiento = users[i].requerido != 'N/A' ? ((users[i].vehicles / users[i].requerido) * 100).toFixed(2) : 'N/A';
        users[i].cumplimiento = cumplimiento;
    }
    return users;
}

export const reportToStimate = (conditions, rawReports) => {
    const objReport = {};
    rawReports.forEach((rawReport) => {
        let customer = rawReport['customer']['id'] ?? '';
        if (objReport[customer]) {
            objReport[customer].push(rawReport);
        }
        else {
            objReport[customer] = [rawReport];
        }
    });
    let key = Object.keys(objReport);
    const users = [];
    for (let i = 0; i < key.length; i++) {
        let objects = objReport[key[i]];
        objects.map(element => {
            let objeto = users.find(item => item.id === element.user.id);
            if (objeto) {
                // Si existe: Actualizar (reemplazar el objeto en el índice encontrado)
                objeto.reports += 1; // Incrementar el contador de visitas
            } else {
                // Si no existe: Insertar
                // 1. Diferencia en milisegundos
                const fecha1 = new Date(conditions.filterStartDate);
                const fecha2 = new Date(conditions.filterEndDate);
                const diferenciaMs = Math.abs(fecha2.getTime() - fecha1.getTime());

                // 2. Convertir a días (redondear para evitar errores de zona horaria)
                const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

                // 3. Contar ambos extremos (sumar 1)
                const totalDias = dias + 1;
                users.push({
                    id: element.user.id,
                    name: `${element.user?.firstName ?? ''} ${element.user?.lastName ?? ''} ${element.user?.secondLastName ?? ''}`,
                    username: element.user?.username ?? '',
                    customer: `${element.customer?.name ?? ''}`,
                    reports: 1,
                    requerido: element?.customer?.reqNroReport == undefined ? 'N/A' : element?.customer?.reqNroReport == 0 ? 'N/A' : (element?.customer?.reqNroReport * totalDias),
                    cumplimiento: 0
                });
            }
        });
    }
    for(let i = 0; i < users.length; i++){
        const cumplimiento = users[i].requerido != 'N/A' ? ((users[i].reports / users[i].requerido) * 100).toFixed(2) : 'N/A';
        users[i].cumplimiento = cumplimiento;
    }
    return users;
}

export const generateFileSimpleXls = (ar, title, extension) => {
    //comprobamos compatibilidad
    if (window.Blob && (window.URL || window.webkitURL)) {
        var contenido = "", d = new Date(), blob, reader, save, clicEvent;
        //creamos contenido del archivo
        for (var i = 0; i < ar.length; i++) {
            //construimos cabecera del csv
            if (i == 0)
                contenido += Object.keys(ar[i]).join(";") + "\n";
            //resto del contenido
            contenido += Object.keys(ar[i]).map(function (key) {
                return ar[i][key];
            }).join(";") + "\n";
        }
        //creamos el blob
        blob = new Blob(["\ufeff", contenido], { type: `text/${extension}` });
        //creamos el reader
        // @ts-ignore
        var reader = new FileReader();
        reader.onload = function (event) {
            //escuchamos su evento load y creamos un enlace en dom
            save = document.createElement('a');
            // @ts-ignore
            save.href = event.target.result;
            save.target = '_blank';
            //aquí le damos nombre al archivo
            save.download = "Doc_" + title + "_" + d.getDate() + "_" + (d.getMonth() + 1) + "_" + d.getFullYear() + `.${extension}`;
            try {
                //creamos un evento click
                clicEvent = new MouseEvent('click', {
                    'view': window,
                    'bubbles': true,
                    'cancelable': true
                });
            }
            catch (e) {
                //si llega aquí es que probablemente implemente la forma antigua de crear un enlace
                clicEvent = document.createEvent("MouseEvent");
                // @ts-ignore
                clicEvent.click();
            }
            //disparamos el evento
            save.dispatchEvent(clicEvent);
            //liberamos el objeto window.URL
            (window.URL || window.webkitURL).revokeObjectURL(save.href);
        };
        //leemos como url
        reader.readAsDataURL(blob);
    }
    else {
        //el navegador no admite esta opción
        alert("Su navegador no permite esta acción");
    }
};

// Función para pausar
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Infiere si un timestamp sin timezone es UTC comparando su hora
 * contra una hora de referencia (ej: creationTime del dispositivo).
 *
 * A diferencia de la versión original, esto NUNCA revienta si los
 * strings vienen mal formados: devuelve un motivo explícito en vez
 * de asumir en silencio.
 *
 * IMPORTANTE: `horaReferencia` se trata SIEMPRE como hora-del-día pura
 * (HH:MM), nunca se le asocia una fecha. Esto es intencional: creationTime
 * solo trae hora, no día. La comparación por aritmética circular
 * (mod 1440) funciona precisamente porque ambos valores son "hora del
 * reloj" y no timestamps completos.
 *
 * Supuesto implícito que esta función NO puede validar por sí sola:
 * `horaReferencia` y `fechaTexto` deben corresponder al mismo instante
 * real (el momento de creación del registro). Si se usa una hora de
 * referencia "actual" para inferir la zona de un timestamp viejo
 * (ej. en un reproceso batch), la inferencia va a ser incorrecta de
 * forma silenciosa, porque no hay información de día para detectarlo.
 */
function inferirZonaOrigen(horaTexto, horaReferencia, offsetEsperadoMin = 300, margenMin = 15) {
  if (!horaTexto || !horaReferencia) {
    return { esUtc: null, motivo: 'sin_datos_suficientes' };
  }

  const parsearHora = (str) => {
    const s = String(str).trim();

    // Caso esperado: "HH:MM..." puro (creationTime del dispositivo)
    let m = s.match(/^(\d{1,2}):(\d{2})/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);

    // Caso datetime completo: extraemos solo el componente de hora.
    // Esto SOLO tiene sentido si horaReferencia es un valor legítimo
    // distinto de fechaTexto (ver chequeo de duplicado más abajo).
    m = s.match(/[T\s](\d{2}):(\d{2})/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);

    return null;
  };

  // Si horaReferencia es idéntico a horaTexto, NO es una referencia real
  // comparando dos relojes distintos — es el síntoma de un bug de origen
  // (típicamente: creationTime vino vacío y algún fallback usó createdDate
  // dos veces). Tratarlo como "sin referencia válida" en vez de inferir
  // coincide_local, que daría una falsa confianza de diff=0.
  if (String(horaTexto).trim() === String(horaReferencia).trim()) {
    return { esUtc: null, motivo: 'referencia_duplicada_de_fecha' };
  }

  const minsA = parsearHora(horaTexto);
  const minsR = parsearHora(horaReferencia);

  if (minsA === null || minsR === null) {
    return { esUtc: null, motivo: 'formato_hora_invalido' };
  }

  // Diferencia circular (maneja cambio de día)
  const diff = (minsA - minsR + 1440) % 1440;

  // Evidencia fuerte de UTC: el diff coincide con el offset esperado (~5h)
  if (Math.abs(diff - offsetEsperadoMin) <= margenMin) {
    return { esUtc: true, motivo: 'coincide_utc', diffMin: diff };
  }

  // Evidencia fuerte de que YA es local: el diff está cerca de 0
  // (circular: también cuenta si está cerca de 1440, ej. diff=1439 ~ diff=1)
  const distanciaACero = Math.min(diff, 1440 - diff);
  if (distanciaACero <= margenMin) {
    return { esUtc: false, motivo: 'coincide_local', diffMin: diff };
  }

  // Ni una cosa ni la otra: esto NO es evidencia de "es local", es un caso
  // ambiguo. Típicamente ocurre cuando el registro se creó offline en el
  // dispositivo y se sincronizó al servidor mucho después: creationTime y
  // createdDate dejan de representar el mismo instante, y comparar sus
  // horas del día ya no dice nada confiable sobre la zona horaria.
  return { esUtc: null, motivo: 'diff_inesperado_posible_atraso_offline', diffMin: diff };
}

function formatearEnZona(fecha, zonaHorariaDestino) {
  const formateador = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHorariaDestino,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  const partes = Object.fromEntries(
    formateador.formatToParts(fecha).map(p => [p.type, p.value])
  );
  return `${partes.year}-${partes.month}-${partes.day} ${partes.hour}:${partes.minute}:${partes.second}`;
}

/**
 * Formatea una fecha ambigua (sin timezone explícita) a una zona destino,
 * infiriendo el origen mediante una hora de referencia opcional.
 *
 * Mantiene el MISMO contrato de retorno que la versión original:
 *   - string "YYYY-MM-DD HH:mm:ss" si coincide (o no hay referencia)
 *   - string "YYYY-MM-DD HH:mm:ss (Movil: HH:mm)" si no coincide con la referencia
 *   - null si la fecha es inválida o vacía
 *
 * Las mejoras son internas: no crashea con inputs mal formados, la
 * heurística de inferencia queda separada y logueada cuando es ambigua,
 * y ya no hay variables muertas.
 *
 * @param {string} fechaTexto
 * @param {string|null} horaReferencia - ej: "08:47" o "08:47:00"
 * @param {object} [opciones]
 * @param {string} [opciones.zonaHorariaDestino='America/Guayaquil']
 * @param {string} [opciones.offsetOrigenAsumido='-05:00']
 * @param {number} [opciones.offsetEsperadoUtcMin=300]
 * @param {number} [opciones.margenMin=15]
 * @returns {string|null}
 */
export function formatearFechaPorZona(fechaTexto, horaReferencia = null, opciones = {}) {
  const {
    zonaHorariaDestino = 'America/Guayaquil',
    offsetOrigenAsumido = '-05:00',
    offsetEsperadoUtcMin = 300,
    margenMin = 15,
  } = opciones;

  try {
    if (!fechaTexto) return null;

    let limpio = String(fechaTexto).trim().replace(' ', 'T');
    const tieneZonaExplicita = /[Zz]$|[+-]\d{2}:\d{2}$/.test(limpio);

    let inferencia = { esUtc: null, motivo: 'zona_explicita' };

    if (!tieneZonaExplicita) {
      const horaEnTexto = limpio.split('T')[1];

      if (horaReferencia && horaEnTexto) {
        inferencia = inferirZonaOrigen(horaEnTexto, horaReferencia, offsetEsperadoUtcMin, margenMin);
      } else if (!horaReferencia) {
        inferencia = { esUtc: true, motivo: 'sin_referencia_default_utc' };
      } else {
        // Hay horaReferencia pero fechaTexto no trae componente de hora:
        // no hay nada que comparar, se cae a offset local por defecto.
        inferencia = { esUtc: null, motivo: 'fecha_sin_componente_hora' };
      }

      if (inferencia.esUtc === null && inferencia.motivo !== 'sin_referencia_default_utc') {
        // Heurística inconclusa (probable atraso offline entre creationTime
        // y createdDate): lo dejamos trazado en vez de asumir en silencio.
        const detalleDiff = inferencia.diffMin != null ? ` (diff=${inferencia.diffMin}min)` : '';
        console.warn(
          `[formatearFechaPorZona] Inferencia ambigua (${inferencia.motivo})${detalleDiff} para "${fechaTexto}" con referencia "${horaReferencia}". Se asume offset local ${offsetOrigenAsumido}, pero podría ser incorrecto.`
        );
      }

      limpio += inferencia.esUtc === true ? 'Z' : offsetOrigenAsumido;
    }

    const fecha = new Date(limpio);
    if (isNaN(fecha.getTime())) {
      console.error('Dato inválido recibido ->', JSON.stringify(fechaTexto));
      return null;
    }

    const resultado = formatearEnZona(fecha, zonaHorariaDestino);

    // El paréntesis solo se muestra cuando hubo una conversión UTC
    // confirmada (esUtc === true) y aun así el resultado no coincide con
    // el device. En el caso ambiguo (esUtc === null, posible atraso
    // offline) NO se muestra: ese desfase suele ser comportamiento normal
    // (sync tardío), no un error, y mostrar el mismo paréntesis en ambos
    // casos le quita valor de señal. Queda trazado solo vía console.warn.
    if (inferencia.esUtc === true && horaReferencia) {
      const partesHora = resultado.split(' ')[1];
      const [hRes, mRes] = partesHora.split(':').map(Number);
      const [hR, mR] = String(horaReferencia).trim().slice(0, 5).split(':').map(Number);

      if (!Number.isNaN(hR) && !Number.isNaN(mR)) {
        const minsRes = hRes * 60 + mRes;
        const minsR = hR * 60 + mR;

        if (Math.abs(minsRes - minsR) <= 5) {
          return resultado;
        }
        return `${resultado} (Movil: ${horaReferencia})`;
      }
    }

    return resultado;

  } catch (error) {
    console.error('Error crítico:', error);
    return null;
  }
}

/* ---------- Ejemplo de uso ---------- */
//
// formatearFechaPorZona('2024-05-10T13:45:00', '08:47');
// => '2024-05-10 08:45:00'   (coincide_utc, diff dentro del margen -> sin sufijo)
//
// formatearFechaPorZona('2024-05-10T13:45:00', '09:10');
// => '2024-05-10 08:45:00 (Movil: 09:10)'   (coincide_utc, pero no coincide con la referencia -> con sufijo)
//
// formatearFechaPorZona('2024-05-10T08:50:00', '08:47');
// => '2024-05-09 13:50:00'   (coincide_local, diff~0 -> ya era hora local, sin sufijo)
//
// formatearFechaPorZona('2024-05-10T20:00:00', '08:47');
// => '2024-05-10 15:00:00'   (diff_inesperado_posible_atraso_offline:
//     sin evidencia confiable de la zona, se asume offset local por defecto,
//     SIN sufijo -> queda trazado solo vía console.warn con el detalle del diff)
//
// formatearFechaPorZona('2023-04-03T22:57:47.793', '2023-04-03T22:57:47.793');
// => '2023-04-03 17:57:47'   (referencia_duplicada_de_fecha: horaReferencia
//     es idéntica a fechaTexto -> no es una comparación real, es síntoma de
//     un bug del caller (creationTime vacío con fallback a createdDate).
//     Se asume offset local por defecto, sin sufijo, con warning explícito
//     para que sea fácil de rastrear el origen del problema.)