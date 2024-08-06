import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as jwt from 'jsonwebtoken'
import { TokenPayload, UserModel } from "../types/userType";
import { JWT_SECRET_KEY } from "../appVariables";
import * as userController from '../controller/userController';

const USER_TOKEN_HEADER = 'USER_TOKEN';

const MISSING_TOKEN_ERR = 'Missing auth token in request headers. Please include token in request header USER_TOKEN';
const INVALID_TOKEN = 'Invalid token';
const USER_NOT_FOUND = 'User not found for token';
const INTERNAL_ERROR = 'Internal error while validating user token';

export async function validateUserToken(req: Request, res: Response, next: NextFunction) {
    try {
        const requestToken = req.get(USER_TOKEN_HEADER);
        if (!requestToken) {
            console.error(MISSING_TOKEN_ERR);
            return res.status(StatusCodes.UNAUTHORIZED).json({message: MISSING_TOKEN_ERR});
        }
        let decodedPayload: TokenPayload | undefined = undefined;
        try {
            decodedPayload = jwt.verify(requestToken, JWT_SECRET_KEY) as TokenPayload;
        } catch (err) {
            console.error(INVALID_TOKEN);
            return res.status(StatusCodes.UNAUTHORIZED).json({message: INVALID_TOKEN});
        }
        if (!decodedPayload || !decodedPayload.email) {
            console.error(INVALID_TOKEN);
            return res.status(StatusCodes.UNAUTHORIZED).json({message: INVALID_TOKEN});
        }
        const email = decodedPayload.email;

        const user: UserModel | undefined = await userController.getUserByEmail(email);
        if (!user || user.email !== email) {
            console.error(USER_NOT_FOUND);
            res.status(StatusCodes.UNAUTHORIZED).json({message: USER_NOT_FOUND});
        }
        next();
    } catch (err) { 
        const errMsg = `${INTERNAL_ERROR} : ${JSON.stringify(err)}`
        console.error(errMsg);
        res.status(StatusCodes.UNAUTHORIZED).json({message: errMsg});
    } 

}