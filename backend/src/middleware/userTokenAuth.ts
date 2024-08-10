import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as jwt from 'jsonwebtoken'
import { AuthResponse, TokenPayload, UserModel } from "../types/userType";
import { JWT_SECRET_KEY } from "../appVariables";
import * as userController from '../controller/userController';
import * as responseCodes from "../types/apiResponseCodes";

const USER_TOKEN_HEADER = 'USER_TOKEN';

const SUCCESSFUL_AUTH_MSG = 'User Auth successful';
const MISSING_TOKEN_ERR = 'Missing auth token in request headers. Please include token in request header USER_TOKEN';
const INVALID_TOKEN_ERR = 'Invalid token';
const TOKEN_EXPIRED_ERR = 'Token is expired. Need to reauthenticate';
const USER_NOT_FOUND_ERR = 'User not found for token';
const INTERNAL_ERROR_MSG = 'Internal error while validating user token';

export async function validateUserToken(req: Request, res: Response, next: NextFunction) {
    let authResp: AuthResponse = {status: false, statusCode: responseCodes.INTERNAL_ERROR};
    try {
        authResp = await validateTokenFromHeader(req);
        if (!authResp.status) {
            return res.status(StatusCodes.UNAUTHORIZED).json(authResp);
        }
        next();
    } catch (err) { 
        const errMsg = `${INTERNAL_ERROR_MSG} : ${JSON.stringify(err)}`
        console.error(errMsg);
        authResp.message = errMsg;
        res.status(StatusCodes.UNAUTHORIZED).json(authResp);
    } 
}

export async function validateTokenFromHeader(req: Request): Promise<AuthResponse> {
    const requestToken = req.get(USER_TOKEN_HEADER);
    return validateToken(requestToken);
}

export async function validateToken(token: string | undefined): Promise<AuthResponse> {
    let authResp: AuthResponse = {status: false, statusCode: responseCodes.INTERNAL_ERROR};
    if (!token) {
        console.error(MISSING_TOKEN_ERR);
        authResp.statusCode = responseCodes.TOKEN_MISSING;
        authResp.message = MISSING_TOKEN_ERR;
        return authResp;
    }
    let decodedPayload: TokenPayload | undefined = undefined;
    try {
        decodedPayload = jwt.verify(token, JWT_SECRET_KEY) as TokenPayload;
    } catch (err) {
        console.error(`${INVALID_TOKEN_ERR} : ${JSON.stringify(err)}`);
        authResp.statusCode = responseCodes.INVALID_TOKEN;
        if (err instanceof Error) {
            if (err.name === 'TokenExpiredError') {
                authResp.statusCode = responseCodes.EXPIRED_TOKEN;
                authResp.message = TOKEN_EXPIRED_ERR;
            } else {
                authResp.message = `${INVALID_TOKEN_ERR} : ${err.message}`;
            }
        } else {    
            authResp.message = INVALID_TOKEN_ERR;
        }
        return authResp;
    }

    if (!decodedPayload || !decodedPayload.email) {
        console.error(INVALID_TOKEN_ERR);
        authResp.statusCode = responseCodes.INVALID_TOKEN;
        authResp.message = INVALID_TOKEN_ERR;
        return authResp;
    }
    const email = decodedPayload.email;

    const user: UserModel | undefined = await userController.getUserByEmail(email);
    if (!user || user.email !== email) {
        console.error(USER_NOT_FOUND_ERR);
        authResp.statusCode = responseCodes.USER_NOT_FOUND;
        authResp.message = USER_NOT_FOUND_ERR;
        return authResp;
    }
    authResp.status = true;
    authResp.statusCode = responseCodes.SUCCESS;
    authResp.message = SUCCESSFUL_AUTH_MSG;
    authResp.token = token;
    return authResp;
}

export function createToken(email: string): string {
    let payload: TokenPayload = {
        email: email, 
        signInTime: Date.now()
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
}