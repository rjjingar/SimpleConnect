import { Sign } from "crypto";
import { UserLogin, UserSignUp, ValidateUserToken } from "../backendUtils/userAuthBackend";
import { ContextUser, User, UserSignInRequest, UserSignUpRequest, UserSignUpResponse } from "../types/user";
import { UserAccountCreateRequest } from "../backendUtils/backendTypes";

const LC_ST_USER_KEY = 'simple-connect-user';


export async function fetchContextUser(): Promise<User> {
    // Fetch the user email and token from local storage
    const user = JSON.parse(localStorage.getItem(LC_ST_USER_KEY));

    if (user && user.authToken) {
        const authResp = await ValidateUserToken(user.authToken);    
        if (authResp.status) {
            return user;
        }
    }
    localStorage.removeItem(LC_ST_USER_KEY);
    return null;
}

export function setContextUser(user: User): void {
    const jsonVal: string = JSON.stringify(user);
    localStorage.setItem(LC_ST_USER_KEY, jsonVal);
}

export async function loginUser(signinRequest: UserSignInRequest): Promise<User> {
    let resp = await UserLogin(signinRequest);
    console.log('User API response for login ' + JSON.stringify(resp));
    if (resp.status) {
        return resp.user;
    } else {
        throw Error(resp.message);
    }
}

export async function logoutUser(): Promise<void> {
    localStorage.removeItem(LC_ST_USER_KEY);
}

export async function createUser(req: UserSignUpRequest): Promise<User> {
    let resp = await UserSignUp(req);
    if (resp.status) {
        return resp.user;
    } else {
        throw Error(resp.message);
    }
}