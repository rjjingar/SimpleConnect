import express, {Request, Response} from 'express';
import { UserModel, UserAuthRequest, UpdatePasswordRequest, UserAccountCreateRequest, TokenPayload } from './types/userType';
import {StatusCodes} from 'http-status-codes';
import {JWT_SECRET_KEY} from './appVariables';

import * as userController from './controller/userController';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken'

export const authRouter = express.Router(); 


authRouter.post('/auth', async (req: Request, res: Response) => {
    try {
        const authReq: UserAuthRequest = req.body;
        console.log(`Request to auth all user : ${JSON.stringify(authReq)}`);

        const dbPasswordHash: string | undefined = await userController.getUserPasswordHash(authReq.email);
        if (!dbPasswordHash) {
            const errMsg = `User not found for email ${authReq.email}`;
            console.error(errMsg);
            return res.status(StatusCodes.BAD_REQUEST).json({message: errMsg});
        }

        bcrypt.compare(authReq.password, dbPasswordHash, function (_err, result) {
            if (!result) {
                console.log('Invalid password');
                return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Invalid password" });
            } else {
                const token = createToken(authReq.email);
                console.log('Successful login');
                return res.status(200).json({ message: "success", token });
            }
        });
    } catch (err) {
        console.error('Error while fetching all users ' + JSON.stringify(err));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
})

authRouter.post('/create-account', async (req: Request, res: Response) => {
    try {
        const createReq: UserAccountCreateRequest = req.body;
        console.log(`Request to create account : ${JSON.stringify(createReq)}`);
        const {valid, msg} = validateCreateAccountRequest(createReq);
        if (!valid) {
            return res.status(StatusCodes.BAD_REQUEST).json({message: msg});
        }
        
        const email: string = createReq.userProfile.email;
        const existingUser: UserModel | undefined = await userController.getUserByEmail(email);
        if (existingUser) {
            const errMsg = `Another user with same email already exists for ${email}`;
            console.error(errMsg);
            return res.status(StatusCodes.CONFLICT).json({message: errMsg});
        }
        const password: string = createReq.password;

        bcrypt.hash(password, 10, async function (_err, hash) {
            const created = await userController.createUser(createReq.userProfile, createReq.password);
            if (created && created.status) {
                const token = createToken(email);
                return res.status(StatusCodes.OK).json({ message: "success", token });
            } else {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: created.msg});
            }
        });
    } catch (err) {
        console.error(`Error while creating account: ${JSON.stringify(err)}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
})

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

function createToken(email: string): string {
    let payload: TokenPayload = {
        email: email, 
        signInTime: Date.now()
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
}