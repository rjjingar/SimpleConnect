import { json } from "react-router-dom";
import { 
    BACKEND_ENDPOINT, 
    API_TOKEN_HEADER, 
    CONTENT_TYPE_HEADER_KEY, 
    CONTENT_TYPE_VALUE_JSON } from "./backendConstants";

export async function ValidateUserToken(token) {
    const api = BACKEND_ENDPOINT + '/verify';
    var apiHeaders = {};
    apiHeaders[API_TOKEN_HEADER] = token;
    var isValid = false;
    try {
        const resp = await fetch(api, {method: 'POST', headers: apiHeaders});
        const jsonResp = await resp.json();
        console.log('API response ValidateUserToken ' + JSON.stringify(jsonResp));
        if ('success' === jsonResp.message) {
            isValid = true;
        }
        return isValid;
    } catch (err) {
        console.log('Error while verifying user token ' + err);
        return isValid
    }
}

export async function Login(email, password) {
    const api = BACKEND_ENDPOINT + '/auth';
    var apiHeaders = {};
    apiHeaders[CONTENT_TYPE_HEADER_KEY] = CONTENT_TYPE_VALUE_JSON;
    const requestBody = JSON.stringify({email, password});
    var result = {success: false, message: "", token: ""};
    console.log('Login requested for email ' + email);
    try {
        let resp = await fetch(api, {method: 'POST', headers: apiHeaders, body: requestBody});
        const jsonResp = await resp.json();
        console.log('API response Login ' + JSON.stringify(jsonResp));
        if (resp.status === 200) {
            result.success = true;
            result.message = jsonResp.message;
            result.token = jsonResp.token;
        } else {
            result.message = jsonResp.message;
        }
        return result;
    } catch (err) {
        console.log('Error while verifying user token ' + err);
        result.message = 'Error while verifying user token ' + err;
        return result
    }
}

export async function CreateUserAccount(userProfile) {
    const email = userProfile.email;
    const password = userProfile.password;
    const firstName = userProfile.firstName;
    const lastName = userProfile.lastName;

    const api = BACKEND_ENDPOINT + '/create-account';
    var apiHeaders = {};
    apiHeaders[CONTENT_TYPE_HEADER_KEY] = CONTENT_TYPE_VALUE_JSON;
    const requestBody = JSON.stringify({email, password, firstName, lastName});
    var result = {success: false, created: false, message: '', token: ''};
    try {
        let resp = await fetch(api, {method: 'POST', headers: apiHeaders, body: requestBody});
        let jsonResp = await resp.json();
        console.log('API response CreateUserAccount ' + JSON.stringify(jsonResp));        
        if (resp.status !== 200) {
            result.message = jsonResp.message;
        } else {
            result.success = true;
            result.created = true;
            result.token = jsonResp.token;
        }
        return result;
    } catch (err) {
        console.log('Error while creating user ' + err);
        result.message = 'Error while creating user ' + err;
        return result;
    }
}

export async function CheckAccountExists(email) {
    const api = BACKEND_ENDPOINT + '/check-account';
    var apiHeaders = {};
    apiHeaders[CONTENT_TYPE_HEADER_KEY] = CONTENT_TYPE_VALUE_JSON;
    const requestBody = JSON.stringify({email});

    var exists = false;

    try {
        const resp = await fetch(api, {method: 'POST', headers: apiHeaders, body: requestBody})
        const jsonResp = await resp.json();
        console.log('API response CheckAccountExists ' + JSON.stringify(resp));
        exists = jsonResp?.userExists;
        return exists;
    } catch (err) {
        console.log('Error while verifying user email exists ' + err);
        return exists
    }
}