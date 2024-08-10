import { ValidateUserToken, CheckAccountExists, UserSignUp, UserLogin } from "../backendUtils/userAuthBackend";

const LC_ST_USER_KEY = 'user';

export async function FetchAuthInfo() {
    var userAuthInfo = {isLoggedIn: false, id: '', token: ''};
    // Fetch the user email and token from local storage
    const user = JSON.parse(localStorage.getItem(LC_ST_USER_KEY));

    if (!user || !user.token) {
        return userAuthInfo;
    }

    const isAuthenticated = await ValidateUserToken(user.token);

    if (isAuthenticated === true) {
        userAuthInfo.isLoggedIn = true;
        userAuthInfo.id = user.email;
        userAuthInfo.token = user.token;
    }
    return userAuthInfo;
}

export function AccountExists(email, callback) {
    CheckAccountExists(email).then(exists => callback(exists));
}

export function CreateAccount(userProfile, callback) {
    UserSignUp(userProfile).then(result => callback(result));
}

export function LoginUser(email, password, callback) {
    UserLogin(email, password).then(result => {
        if (result.success) {
            localStorage.setItem(LC_ST_USER_KEY, JSON.stringify({email, token: result.token}))
        }
        callback(result);
    });
}