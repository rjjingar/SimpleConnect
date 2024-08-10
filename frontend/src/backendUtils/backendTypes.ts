/** Imported from backend */

import { Email } from "@mui/icons-material";
import { User, UserSignInRequest, UserSignInResponse, UserSignUpRequest, UserSignUpResponse } from "../types/user";


/** Success codes */
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const SUCCESS = 'SUCCESS';


/** Auth related failure codes */
export const TOKEN_MISSING = 'TOKEN_MISSING';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const INVALID_TOKEN = 'INVALID_TOKEN';
export const INVALID_PASSWORD = 'INVALID_PASSWORD';
export const EXPIRED_TOKEN = 'EXPIRED_TOKEN';

export const MALFORMED_REQUEST = 'MALFORMED_REQUEST';
export const CONFLICT_USER = 'CONFLICT_USER';

/** Default status in case of uncategorized error */
export const INTERNAL_ERROR = 'INTERNAL_ERROR';


export type UserModel = {
    email: string,
    firstName: string,
    lastName: string,
    createdAt?: Date,
    updatedAt?: Date
}

export type UpdateEmailRequest = {
    oldEmail: string,
    newEmail: string
}

export type UpdatePasswordRequest = {
    email: string,
    oldPassword: string,
    newPassword: string
}

export type UserAuthRequest = {
    email: string,
    password: string
}

export type UserAccountCreateRequest = {
    userProfile: UserModel,
    password: string
}

export type TokenPayload = {
    email: string,
    signInTime: number
}

export type AuthResponse = {
    status: boolean,
    statusCode: string,
    token?: string,
    message?: string,
    user?: UserModel
}

export function convertSignUpRequest(req: UserSignUpRequest): UserAccountCreateRequest {
    const userProfile: UserModel = {
        email: req.email,
        firstName: req.firstName,
        lastName: req.lastName
    }
    const backEndReq: UserAccountCreateRequest = {
        userProfile: userProfile,
        password: req.password
    }
    return backEndReq;
}

export function convertAuthResponseToSignInResponse(req: UserSignInRequest, resp: AuthResponse): UserSignInResponse {
    let user: User = {id: req.email, email: req.email, authToken: resp.token};
    if (resp.status && resp.user) {
        user = {
            id: resp.user.email,
            email: resp.user.email,
            firstName: resp.user.firstName,
            lastName: resp.user.lastName
        }
    }
    
    const signInResp: UserSignInResponse = {
        status: resp.status,
        statusCode: resp.statusCode,
        message: resp.message,
        user: user
    }
    return signInResp;
}

export function convertAuthResponseToSignUpResponse(resp: AuthResponse): UserSignUpResponse {
    let user: User | undefined = undefined;
    if (resp.status && resp.user) {
        user = {
            id: resp.user.email,
            email: resp.user.email,
            firstName: resp.user.firstName,
            lastName: resp.user.lastName
        }
    }
    
    const signUpResp: UserSignUpResponse = {
        status: resp.status,
        statusCode: resp.statusCode,
        message: resp.message,
        user: user
    }
    return signUpResp;
}