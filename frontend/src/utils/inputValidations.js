export const validateEmail = (text) => {
    var result = {isValid: true, isBlank: false, message: ""}
    if ("" === text) {
        result.isBlank = true;
        result.isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(text)) {
        result.isValid = false;
        result.message = "Please enter a valid email"
    }
    return result;
}

export const validatePassword = (text) => {
    var result = {isValid: true, isBlank: false, message: ""}
    if ("" === text) {
        result.isBlank = true;
        result.isValid = false;
    } else if (text.length < 8) {
        result.isValid = false;
        result.message = "Password must be atleast 8 characters long"
    }
    return result;
}

