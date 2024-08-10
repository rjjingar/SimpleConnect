import { json } from "react-router-dom";
import { 
    BACKEND_ENDPOINT, 
    API_TOKEN_HEADER, 
    CONTENT_TYPE_HEADER_KEY, 
    CONTENT_TYPE_VALUE_JSON } from "./backendConstants";
import * as backendTypes from './backendTypes';
import { UserSignInRequest, UserSignInResponse, UserSignUpRequest, UserSignUpResponse } from "../types/user";

export async function ValidateUserToken(token: string): Promise<backendTypes.AuthResponse> {
    const api = BACKEND_ENDPOINT + '/verify';
    var apiHeaders = {};
    apiHeaders[API_TOKEN_HEADER] = token;
    var isValid = false;
    try {
        const resp = await fetch(api, {method: 'POST', headers: apiHeaders});
        const respBody = await resp.json() as backendTypes.AuthResponse;
        console.log('API response ValidateUserToken ' + JSON.stringify(respBody));
        return respBody;
    } catch (err) {
        const errMsg = 'Error while verifying user token ' + err.message
        console.log(errMsg);
        const failedResp: backendTypes.AuthResponse = {
            status: false,
            statusCode: backendTypes.INTERNAL_ERROR,
            message: errMsg
        }
        return failedResp;
    }
}

export async function UserLogin(req: UserSignInRequest): Promise<UserSignInResponse> {
    const api = BACKEND_ENDPOINT + '/auth';
    var apiHeaders = {};
    apiHeaders[CONTENT_TYPE_HEADER_KEY] = CONTENT_TYPE_VALUE_JSON;
    const requestBody = JSON.stringify(req);
    
    console.log('Login requested for email ' + req.email);
    try {
        let resp = await fetch(api, {method: 'POST', headers: apiHeaders, body: requestBody});
        const respBody = await resp.json() as backendTypes.AuthResponse;
        console.log('API response Login ' + JSON.stringify(respBody));
        return backendTypes.convertAuthResponseToSignInResponse(req, respBody);
    } catch (err) {
        const errMsg = 'Error while verifying user token ' + err;
        console.log(errMsg);
        const failedResp: UserSignInResponse = {
            status: false,
            statusCode: backendTypes.INTERNAL_ERROR,
            message: errMsg
        }
        return failedResp;
    }
}

export async function UserSignUp(req: UserSignUpRequest): Promise<UserSignUpResponse> {
    
    const api = BACKEND_ENDPOINT + '/create-account';
    var apiHeaders = {};
    apiHeaders[CONTENT_TYPE_HEADER_KEY] = CONTENT_TYPE_VALUE_JSON;
    var result = {success: false, created: false, message: '', token: ''};

    const backEndReq = backendTypes.convertSignUpRequest(req);

    try {
        let resp = await fetch(api, {method: 'POST', headers: apiHeaders, body: JSON.stringify(backEndReq)});
        let respBody = await resp.json() as backendTypes.AuthResponse;
        console.log('API response CreateUserAccount ' + JSON.stringify(respBody));        
        return backendTypes.convertAuthResponseToSignUpResponse(respBody);
    } catch (err) {
        const errMsg = 'Error while creating user ' + err;
        console.log(errMsg);
        const failedResp: UserSignUpResponse = {
            status: false,
            statusCode: backendTypes.INTERNAL_ERROR,
            message: errMsg
        }
        return failedResp;
    }
}


export async function CheckAccountExists(email: string): Promise<boolean> {
    const api = BACKEND_ENDPOINT + '/check-account';
    var apiHeaders = {};
    apiHeaders[CONTENT_TYPE_HEADER_KEY] = CONTENT_TYPE_VALUE_JSON;
    const requestBody = JSON.stringify({email});

    var exists = false;

    try {
        const resp = await fetch(api, {method: 'POST', headers: apiHeaders, body: requestBody})
        const jsonResp = await resp.json() as backendTypes.AuthResponse;
        console.log('API response CheckAccountExists ' + JSON.stringify(resp));
        exists = jsonResp.status;
        return exists;
    } catch (err) {
        console.log('Error while verifying user email exists ' + err);
        return exists
    }
}