// @filename: endpoints.ts
// Imports
import { SignIn } from "./login.js";
// GENERAL URL
// ===================================================
export const NetliinkBase = (window.APP_CONFIG?.baseUrl ?? 'https://backend.netliinks.com:443/');
const NetliinksUrl = `${NetliinkBase}rest/entities/`;
// ===================================================
// TOOLS
// ===================================================
export let token = localStorage.getItem('access_token');
export const _userAgent = navigator.userAgent;
export const clientId = window.APP_CONFIG?.clientId ?? '';
export const clientSecret = window.APP_CONFIG?.clientSecret ?? '';
export const basicAuth = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
// ===================================================
// HEADERS
// ===================================================
let headers = new Headers();
headers.append('Authorization', `Bearer ${token}`);
headers.append('Content-Type', "application/json");
headers.append('Cookie', "JSESSIONID=CDD208A868EAABD1F523BB6F3C8946AF");
// ===================================================
// GET TOKEN
// ===================================================
/**
 *
 * @param mail is the username
 * @param password
 * @returns token
 */
export const getToken = async (mail, password) => {
    const URL = `${NetliinkBase}oauth/token`;
    const ReqOptions = {
        method: 'POST',
        body: `grant_type=password&username=${mail}&password=${password}`,
        headers: {
            Accept: 'application/json',
            "User-agent": `${_userAgent}`,
            Authorization: basicAuth,
            "Content-Type": 'application/x-www-form-urlencoded',
            Cookie: "JSESSIONID=CDD208A868EAABD1F523BB6F3C8946AF",
        }
    };
    const res = await fetch(URL, ReqOptions);
    return res.json();
};
// ===================================================
// GET USER INFORMATION
// ===================================================
/**
 *
 * @returns user information, type, business,
 * customers, guards and more
 */
export const getUserInfo = async () => {
    const userInfo = {
        url: `${NetliinkBase}rest/userInfo?fetchPlan=full`,
        method: 'GET'
    };
    const options = {
        method: userInfo.method,
        headers: headers,
        redirect: 'follow'
    };
    let userData = await fetch(userInfo.url, options)
    .then((req) => req.json());
    return userData;
};
// ===================================================
/**
 *
 * @param url
 *
 * @returns a specific data from url
 */
export const getData = async (url) => {
    let ReqOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };
    const res = await fetch(url, ReqOptions);
    return await res.json()
        .catch(err => new SignIn().signOut());
};

export const getEntitiesData = async (entities) => {
    const URL = `${NetliinksUrl}${entities}?fetchPlan=full&sort=-createdDate`;
    return await getData(URL);
};

export const getEntityData = async (entities, entity) => {
    const URL = `${NetliinksUrl}${entities}/${entity}?fetchPlan=full&sort=-createdDate`;
    return getData(URL);
};

export const getFilterEntityCount = async (entities, raw) => {
    const req = {
        url: `${NetliinksUrl}${entities}/search/count`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    const res = await fetch(req.url, requestOptions);
    return await res.json()
        .catch(err => new SignIn().signOut());
};

export const getFilterEntityData = async (entities, raw) => {
    const req = {
        url: `${NetliinksUrl}${entities}/search`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    const res = await fetch(req.url, requestOptions);
    return await res.json()
        .catch(err => new SignIn().signOut());
};

export const updateEntity = async (entities, entity, raw) => {
    const URL = `${NetliinksUrl}${entities}/${entity}`;
    const ReqOptions = {
        method: 'PUT',
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    return await fetch(URL, ReqOptions)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .catch(err => {
            console.error('Error: ', err);
            throw err;
        });
};

export const deleteEntity = async (entities, entity) => {
    const URL = `${NetliinksUrl}${entities}/${entity}?fetchPlan=full`;
    const ReqOptions = {
        method: 'DELETE',
        headers: headers,
        redirect: 'follow'
    };
    await fetch(URL, ReqOptions)
        .then(res => res.json())
        .catch(err => console.error('Error:' + err));
};

export const registerEntity = async (raw, type) => {
    const req = {
        url: `${NetliinkBase}rest/entities/`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    return await fetch(req.url + type, requestOptions)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .catch(err => {
            console.error('Error:' + err);
            throw err;
        });
};

export const filterEntities = async (user) => { };

export const setPassword = async (raw) => {
    const req = {
        url: `${NetliinkBase}rest/services/UserServiceBean/updatePassword`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    fetch(req.url, requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
};

export const setUserRole = async (raw) => {
    const req = {
        url: `${NetliinkBase}rest/services/UserServiceBean/assignRol`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };
    fetch(req.url, requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
};

export const sendMail = async (raw) => {
    const req = {
        url: `${NetliinkBase}rest/services/UserServiceBean/sendByEmailInfo`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };

    fetch(req.url, requestOptions)
        .then(response => response.json())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
};

export const sendMail2 = async (raw) => {
    const req = {
        url: `${NetliinkBase}rest/services/UserServiceBean/sendByEmailInfoWithAtt`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: raw,
        redirect: 'follow'
    };

    try {
        const response = await fetch(req.url, requestOptions);

        if (!response.ok) {
            console.error(`Error en sendMail2: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.error(`Detalle del error: ${errorText}`);
            const error = new Error(`No se pudo enviar el correo (${response.status})`);
            error.status = response.status;
            throw error;
        }

        const text = await response.text();
        const results = text ? JSON.parse(text) : [];

        const failed = results.filter(r => !r.success);
        const succeeded = results.filter(r => r.success);

        if (failed.length > 0) {
            console.warn('Correos que no se pudieron enviar:', failed);
        }

        return {
            allSucceeded: failed.length === 0,
            succeeded,
            failed,
            raw: results
        };

    } catch (err) {
        console.error('Error enviando correo con adjunto:', err);
        throw err;
    }
};

export const getFaceFile = async (path, storageName) => {
    const params = new URLSearchParams({ path, fileName: 'temp.png', storageName });
    const requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };
    const blob = await fetch(`${NetliinkBase}rest/files/download?${params}`, requestOptions)
        .then(res => res.blob());
    return window.URL.createObjectURL(blob);
};

export const getFile = async (fileUrl) => {
    const url = `${NetliinkBase}rest/files?fileRef=`;
    const requestOptions = {
        method: 'GET',
        headers: headers,
        redirect: 'follow'
    };
    const file = await fetch(url + fileUrl, requestOptions)
        .then((res) => res.blob())
        .then(blob => {
            let file = window.URL.createObjectURL(blob);
            return file;
        });
    return file;
};

export const setFile = async (file) => {
    const url = `${NetliinkBase}rest/files?name=${file.name}`;
    const requestOptions = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            "Cookie": "JSESSIONID=CDD208A868EAABD1F523BB6F3C8946AF",
            "Content-Disposition": 'form-data; name="file"; filename="cat.jpg"',
            'Content-Type': 'image/jpeg',
        },
        body: file
    };
    const res = await fetch(url, requestOptions)
        .then(response => response.json())
        .catch(err => alert(`Error subiendo archivo ${err}`));
    return res;
};

export const postNotificationPush = async (data) => {
    const req = {
        url: `${NetliinkBase}rest/services/UserServiceBean/sendNotificationPush`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: data,
        redirect: 'follow'
    };

    fetch(req.url, requestOptions)
        .then(response => {
            if (!response.ok) console.error('Network response was not ok');
            return response.text().then(text => text ? JSON.parse(text) : {});
        })
        .catch(error => console.error('Fetch error:', error));
};

export const getGuardPhotos = async (guardId, page, size) => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ guardId, page, size }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/getGuardPhotos`, requestOptions);
    return res.json().catch(err => console.error('getGuardPhotos error:', err));
};

export const getAllGuardFailedPhotos = async (page, size) => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ page, size }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/getAllGuardFailedPhotos`, requestOptions);
    return res.json().catch(err => console.error('getAllGuardFailedPhotos error:', err));
};

export const getModels = async (page, size) => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ page, size }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/getModels`, requestOptions);
    return res.json().catch(err => console.error('getModels error:', err));
};

export const requestModelTrain = async () => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({}),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/requestModelTrain`, requestOptions);
    return res.json().catch(err => console.error('requestModelTrain error:', err));
};

export const getAllAccesses = async (page, size) => {
    const customerId = localStorage.getItem('customer_id');
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ page, size, customerId }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/getAllAccesses`, requestOptions);
    return res.json().catch(err => console.error('getAllAccesses error:', err));
};

export const getAllAccessesBetweenDates = async (initialDate, finalDate, page, size) => {
    const customerId = localStorage.getItem('customer_id');
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ customerId, initialDate, finalDate, page, size }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/getAllAccessesBetweenDates`, requestOptions);
    return res.json().catch(err => console.error('getAllAccessesBetweenDates error:', err));
};

export const getAllAccessesFromGuardByExternalId = async (externalGuardId, page, size) => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ externalGuardId, page, size }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/getAllAccessesFromGuardByExternalId`, requestOptions);
    return res.json().catch(err => console.error('getAllAccessesFromGuardByExternalId error:', err));
};

export const deleteGuardPhotoById = async (photoId) => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ photoId }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/deleteGuardPhotoById`, requestOptions);
    return res.json().catch(err => console.error('deleteGuardPhotoById error:', err));
};

export const createGuardPhoto = async (guardId, fileRef) => {
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ guardId, fileRef }),
        redirect: 'follow'
    };
    const res = await fetch(`${NetliinkBase}rest/services/FaceRecognitionBean/createGuardPhoto`, requestOptions);
    return res.json().catch(err => console.error('createGuardPhoto error:', err));
};

export const generateRoutineTimes = async (scheduleId) => {
    const req = {
        url: `${NetliinkBase}rest/services/app_RoutineTimeService/generateOrUpdateRoutineTimes`,
        method: 'POST'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        body: JSON.stringify({ scheduleId }),
        redirect: 'follow'
    };
    const res = await fetch(req.url, requestOptions);
    return res.text();
};

export const deleteControllerEntity = async (id, path) => {
    const req = {
        url: `${NetliinkBase}rest/${path}/${id}`,
        method: 'DELETE'
    };
    const requestOptions = {
        method: req.method,
        headers: headers,
        redirect: 'follow'
    };
    const res = await fetch(req.url, requestOptions);
    if (!res.ok)
        throw new Error(`HTTP error! status: ${res.status}`);
    return res;
};

// ===================================================
// CUSTOMER GROUPS API
// ===================================================
export const listCustomerGroups = async (active, search, offset, limit) => {
    const params = new URLSearchParams();
    if (active !== null && active !== undefined && active !== '') params.append('active', active);
    if (search) params.append('search', search);
    params.append('offset', (offset || 0).toString());
    params.append('limit', (limit || 50).toString());

    const url = `${NetliinkBase}rest/customer-groups?${params.toString()}`;
    return await getData(url);
};

export const getGroupMembersForManagement = async (groupId, search, offset, limit) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('offset', (offset || 0).toString());
    params.append('limit', (limit || 50).toString());

    const url = `${NetliinkBase}rest/customer-groups/${groupId}/members?${params.toString()}`;
    return await getData(url);
};

export const getAvailableCustomersForGroup = async (search, offset, limit) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('offset', (offset || 0).toString());
    params.append('limit', (limit || 50).toString());

    const url = `${NetliinkBase}rest/customer-groups/available-customers?${params.toString()}`;
    return await getData(url);
};

export const createCustomerGroupApi = async (name, controllerCustomerId, applicant) => {
    const params = new URLSearchParams();
    params.append('name', name);
    if (controllerCustomerId) params.append('controllerCustomerId', controllerCustomerId);
    if (applicant) params.append('applicant', applicant);

    const url = `${NetliinkBase}rest/customer-groups?${params.toString()}`;
    const requestOptions = {
        method: 'POST',
        headers: headers,
        redirect: 'follow'
    };
    const res = await fetch(url, requestOptions);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${res.status}`);
    }
    return await res.json();
};

export const updateCustomerGroupApi = async (groupId, raw) => {
    const url = `${NetliinkBase}rest/customer-groups/${groupId}`;
    const requestOptions = {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(raw),
        redirect: 'follow'
    };
    const res = await fetch(url, requestOptions);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${res.status}`);
    }
    return await res.json();
};

export const updateGroupControllerApi = async (groupId, controllerCustomerId) => {
    const params = new URLSearchParams();
    if (controllerCustomerId) params.append('controllerCustomerId', controllerCustomerId);

    const url = `${NetliinkBase}rest/customer-groups/${groupId}/controller?${params.toString()}`;
    const requestOptions = {
        method: 'PUT',
        headers: headers,
        redirect: 'follow'
    };
    const res = await fetch(url, requestOptions);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${res.status}`);
    }
    return await res.json();
};

export const addMemberToGroupApi = async (groupId, customerId) => {
    const url = `${NetliinkBase}rest/customer-groups/${groupId}/members/${customerId}`;
    const requestOptions = {
        method: 'POST',
        headers: headers,
        redirect: 'follow'
    };
    const res = await fetch(url, requestOptions);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error HTTP ${res.status}`);
    }
    return await res.json();
};