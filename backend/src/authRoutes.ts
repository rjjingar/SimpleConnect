import express, {Request, Response} from 'express';
import { UserModel, UserAuthRequest, UserAccountCreateRequest, AuthResponse } from './types/userType';
import {StatusCodes} from 'http-status-codes';

import * as userController from './controller/userController';
import * as bcrypt from 'bcrypt';
import { createToken, validateTokenFromHeader } from './middleware/userTokenAuth';
import * as responseCodes from './types/apiResponseCodes';

export const authRouter = express.Router(); 


authRouter.post('/auth', async (req: Request, res: Response) => {
    let resBody: AuthResponse = {status: true, statusCode: responseCodes.SUCCESS};
    try {
        const authReq: UserAuthRequest = req.body;
        console.log(`Request to auth user : ${JSON.stringify(authReq)}`);
    
        const dbPasswordHash: string | undefined = await userController.getUserPasswordHash(authReq.email);
        if (!dbPasswordHash) {
            const errMsg = `User not found for email ${authReq.email}`;
            console.error(errMsg);
            updateWithFailure(resBody, responseCodes.USER_NOT_FOUND, errMsg);
            return res.status(StatusCodes.BAD_REQUEST).json(resBody);
        }

        bcrypt.compare(authReq.password, dbPasswordHash, function (_err, result) {
            if (!result) {
                console.log('Invalid password');
                updateWithFailure(resBody, responseCodes.INVALID_PASSWORD, 'Invalid password');
                return res.status(StatusCodes.UNAUTHORIZED).json(resBody);
            } else {
                const token = createToken(authReq.email);
                console.log('Successful login');
                resBody.token = token;
                resBody.message = 'success';
                return res.status(StatusCodes.OK).json(resBody);
            }
        });
    } catch (err) {
        const errMsg = 'Error while authenticating user ' + JSON.stringify(err);
        console.error(errMsg);
        updateWithFailure(resBody, responseCodes.INTERNAL_ERROR, errMsg);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(resBody);
    }
})

authRouter.post('/verify', async (req: Request, res: Response) => {
    let respBody: AuthResponse = {status: true, statusCode: responseCodes.SUCCESS};
    try {
        
        respBody = await validateTokenFromHeader(req);
        if (!respBody.status) {
            return res.status(StatusCodes.UNAUTHORIZED).json(respBody);
        }
        return res.status(StatusCodes.OK).json(respBody);
    } catch (err) { 
        const errMsg = `Internal error while validating user token : ${JSON.stringify(err)}`;
        console.error(errMsg);
        updateWithFailure(respBody, responseCodes.INTERNAL_ERROR, errMsg);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(respBody);
    }
})

authRouter.post('/check-account', async (req: Request, res: Response) => {
    let resBody: AuthResponse = {status: true, statusCode: responseCodes.SUCCESS};
    try {
        const { email } = req.body;
        const dbPasswordHash: string | undefined = await userController.getUserPasswordHash(email);
        if (!dbPasswordHash) {
            const errMsg = `User not found for email ${email}`;
            console.error(errMsg);
            updateWithFailure(resBody, responseCodes.USER_NOT_FOUND, errMsg);
            return res.status(StatusCodes.NOT_FOUND).json(resBody);
        }
        return res.status(StatusCodes.OK).json(resBody);
    } catch (err) { 
        const errMsg = `Internal error while validating user ${req.body} : ${JSON.stringify(err)}`;
        console.error(errMsg);
        updateWithFailure(resBody, responseCodes.INTERNAL_ERROR, errMsg);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(resBody);
    }
})


authRouter.post('/create-account', async (req: Request, res: Response) => {
    let respBody: AuthResponse = {status: true, statusCode: responseCodes.SUCCESS};
    try {
        const createReq: UserAccountCreateRequest = req.body;
        console.log(`Request to create account : ${JSON.stringify(createReq)}`);
        const {valid, msg} = validateCreateAccountRequest(createReq);
        if (!valid) {
            updateWithFailure(respBody, responseCodes.MALFORMED_REQUEST, msg);
            return res.status(StatusCodes.BAD_REQUEST).json(respBody);
        }
        
        const email: string = createReq.userProfile.email;
        const existingUser: UserModel | undefined = await userController.getUserByEmail(email);
        if (existingUser) {
            const errMsg = `Another user with same email already exists for ${email}`;
            console.error(errMsg);
            updateWithFailure(respBody, responseCodes.CONFLICT_USER, errMsg);
            return res.status(StatusCodes.CONFLICT).json(respBody);
        }
        const password: string = createReq.password;

        bcrypt.hash(password, 10, async function (_err, hash) {
            const created = await userController.createUser(createReq.userProfile, hash);
            if (created && created.status) {
                const token = createToken(email);
                respBody.token = token;
                return res.status(StatusCodes.OK).json(respBody);
            } else {
                updateWithFailure(respBody, responseCodes.INTERNAL_ERROR, created.msg);
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(respBody);
            }
        });
    } catch (err) {
        const errMsg = `Error while creating account: ${JSON.stringify(err)}`;
        updateWithFailure(respBody, responseCodes.INTERNAL_ERROR, errMsg);
        console.error(errMsg);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(respBody);
    }
})

authRouter.delete('/delete-account/:email', async (req: Request, res: Response) => {
    let respBody: AuthResponse = {status: true, statusCode: responseCodes.SUCCESS};
    try {
        const email = req.params.email;
        console.log(`Request to delete account ${email}`);
        const deleted = await userController.deleteUser(email);
        return res.status(StatusCodes.OK).json(respBody);
    } catch (err) {
        const errMsg = `Error while deleting account: ${JSON.stringify(err)}`;
        updateWithFailure(respBody, responseCodes.INTERNAL_ERROR, errMsg);
        console.error(errMsg);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(respBody);
    }
})

function updateWithFailure(authResp: AuthResponse, statusCode: string, message: string) {
    authResp.status = false;
    authResp.statusCode = statusCode;
    authResp.message = message;
}

function validateCreateAccountRequest(req: UserAccountCreateRequest): {valid: boolean, msg: string} {
    if (!req || !req.userProfile || !req.password) {
        return {valid: false, msg: 'request not in correct format'};
    }
    const profile = req.userProfile;
    if (!profile.email || !profile.firstName || !profile.lastName) {
        return {valid: false, msg: 'Required fields missing'};
    }
    return {valid: true, msg: ''};
}

