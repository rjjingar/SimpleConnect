import { Sign } from "crypto";
import { Login, CreateUserAccount, ValidateUserToken } from "../backendUtils/userAuthBackend";
import { ContextUser, User, UserSignInRequest, UserSignUpRequest } from "../types/user";

const LC_ST_USER_KEY = 'simple-connect-user';


export async function fetchContextUser(): Promise<User> {
    // Fetch the user email and token from local storage
    const user = JSON.parse(localStorage.getItem(LC_ST_USER_KEY));

    if (user && user.authToken) {
        const isAuthenticated = await ValidateUserToken(user.authToken);    
        if (isAuthenticated === true) {
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
    const email = signinRequest.email;
    const password = signinRequest.password;

    let signedInUser: User = {id: email, email: email, authToken: ''};

    let resp = await Login(email, password);
    console.log('User API response for login ' + JSON.stringify(resp));
    if (resp.success) {
        signedInUser.authToken = resp.token;
    } else {
        throw Error(resp.message);
    }

    return signedInUser;
}

export async function logoutUser(): Promise<void> {
    localStorage.removeItem(LC_ST_USER_KEY);
}

export async function createUser(signupRequest: UserSignUpRequest): Promise<User> {
    const signedUpUser: User = {
        id: signupRequest.email, 
        email: signupRequest.email,
        authToken: ''
    }

    let resp = await CreateUserAccount(signupRequest);
    if (resp.success) {
        signedUpUser.authToken = resp.token;
    } else {
        throw Error(resp.message);
    }
    return signedUpUser;
}