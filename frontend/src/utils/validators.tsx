
type InputValidateResponse = {
    isValid: boolean;
    isBlank: boolean;
    message: string;
}

export function validateEmail(email: string): InputValidateResponse {
    let result: InputValidateResponse = {isValid: true, isBlank: false, message: ""}
    if ("" === email) {
        result.isBlank = true;
        result.isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        result.isValid = false;
        result.message = "Please enter a valid email"
    }
    return result;
}

export function validatePassword(password: string): InputValidateResponse {
    let result: InputValidateResponse = {isValid: true, isBlank: false, message: ""}
    if ("" === password) {
        result.isBlank = true;
        result.isValid = false;
    } else if (password.length < 8) {
        result.isValid = false;
        result.message = "Password must be atleast 8 characters long"
    }
    return result;
}
