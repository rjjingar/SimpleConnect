import express, {Request, Response} from 'express';
import { UserModel, UpdateEmailRequest } from '../types/userType';
import {StatusCodes} from 'http-status-codes';
import { getAllUser, getUserByEmail, updateUser, updateEmail } from '../controller/userController';
import {validateUserToken} from '../middleware/userTokenAuth';

export const userRouter = express.Router();

userRouter.get('/test', async (req: Request, res: Response) => {
    console.log('Test call');
    return res.status(StatusCodes.OK).json({'status': 'success'});
})

userRouter.get('/users', async (req: Request, res: Response) => {
    try {
        console.log('Request to fetch all users');
        const allUsers: UserModel[] = await getAllUser();
        console.log('Response for all users ' + JSON.stringify(allUsers));
        return res.status(StatusCodes.OK).json({total_user : allUsers.length, allUsers});
    } catch (err) {
        console.error('Error while fetching all users ' + JSON.stringify(err));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
})

userRouter.get("/user/:email", validateUserToken, async (req : Request, res : Response) => {
    try {
        const email = req.params.email;
        console.log('Request to fetch user with email ' + email);
        const user: UserModel | undefined = await getUserByEmail(email);
        console.log('Response for user with email: {email} ' + JSON.stringify(user));
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({error : `User not found!`})
        }
        return res.status(StatusCodes.OK).json({user})
    } catch (err) {
        console.error('Error while fetching user with email: {email} ' + JSON.stringify(err));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({err})
    }
})

userRouter.post("/user", validateUserToken, async (req: Request, res: Response) => {
    try {
        const userReq: UserModel = req.body;
        console.log(`Request to upsert user with email ${userReq.email} body: ${JSON.stringify(userReq)}`);
        const updatedUser = await updateUser(userReq);
        console.log(`Response for upsert user with email: ${userReq.email} ` + JSON.stringify(updatedUser));
        if (updatedUser.status) {
            return res.status(StatusCodes.OK).json(updatedUser);
        }
        return res.status(StatusCodes.BAD_REQUEST).json(updatedUser);
    } catch (err) {
        console.error('Error while upserting user ' + JSON.stringify(err));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
})

userRouter.post("/user/updateEmail", validateUserToken, async (req: Request, res: Response) => {
    try {
        const userReq: UpdateEmailRequest = req.body;
        console.log(`Request to updateEmail ${JSON.stringify(userReq)}`);
        const updatedUser = await updateEmail(userReq.oldEmail, userReq.newEmail);
        console.log(`Response for updateEmail : JSON.stringify(updatedUser)`);
        return res.status(StatusCodes.OK).json(updatedUser);
    } catch (err) {
        console.error('Error while upserting user ' + JSON.stringify(err));
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(err);
    }
})