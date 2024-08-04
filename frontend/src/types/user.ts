export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    authToken?: string;
}

export interface ContextUser {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    authToken?: string;
}

export type UserSignUpRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    receiveEmails?: boolean;
}

export type UserSignInRequest = {
    email: string;
    password: string;
}