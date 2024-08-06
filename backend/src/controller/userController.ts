import { Prisma, PrismaClient } from "@prisma/client";
import { User } from '@prisma/client';
import { UserModel } from "../types/userType";

const prismaClient = new PrismaClient();
const PRISMA_ERROR_CODES = {
    "P1000": "Authentication Error"
}

function convertFromDB(user: User): UserModel {
    const userModel: UserModel = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }
    return userModel;
}

/**
 * Fetches all users from DB
 * @returns Array of all users as UserModel[] or empty array if no users found. 
 */
export async function getAllUser(): Promise<UserModel[]> { 
    const users: User[] = await prismaClient.user.findMany();
    let userModels: UserModel[] = [];
    if (users && users.length > 0) {
        userModels = users.map(u => convertFromDB(u));
    }
    console.log('getAllUser ' + JSON.stringify(userModels));
    return userModels;

}

export async function getUserByEmail(email: string): Promise<UserModel | undefined> {
    console.log(`DB request to find user by email ${email}`);
    const user: User | null = await prismaClient.user.findUnique({
            where: {email: email}
        });
    let userModel: UserModel | undefined = undefined;
    if (user) {
        userModel = convertFromDB(user)
    }
    console.log(`getUserByEmail for email ${email} : ${JSON.stringify(userModel)}`);
    return userModel;
}

export async function getUserPasswordHash(email: string): Promise<string | undefined> {
    const user: User | null = await prismaClient.user.findUnique({where: {email: email}});
    if (user) {
        return user.passwordHash;
    }
    return undefined;
}

export async function updateUser(user: UserModel): Promise<{status: boolean, msg?: string}> {
    try {
        const date: Date = new Date();
        const res = await prismaClient.user.update({
            where: {email: user.email},
            data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                updatedAt: date
            }
        });
        console.log('updateUser result ' + JSON.stringify(res));
        return {status: true};
    } catch (err) {
        const msg = `DB Error while updating user for email ${user.email} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return {status: false, msg: msg};
    }
}

export async function createUser(user: UserModel, passwordHash: string): Promise<{status: boolean, msg: string}> {
    const date = new Date();
    try {
        console.log(`DB createUser request: ${JSON.stringify(user)} | password: ${passwordHash}`);
        const res = await prismaClient.user.create({
            data: {
                email: user.email,
                passwordHash: passwordHash,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: date,
                updatedAt: date
            }
        });
        console.log('createUser result ' + JSON.stringify(res));
        return {status: true, msg: ''};
    } catch (err) {
        const errMsg = `Error while creating user ${JSON.stringify(err)}`
        console.error(errMsg, err);
        return {status: false, msg: errMsg};
    }
}

export async function updatePassword(email: string, passwordHash: string) {
    const date: Date = new Date();
    const res = await prismaClient.user.update({
        where: {email: email},
        data: {passwordHash: passwordHash}
    });
    console.log('updatePassword result ' + JSON.stringify(res));
}

export async function updateEmail(oldEmail: string, newEmail: string) {
    const oldEmailUser: User | null = await prismaClient.user.findUnique({where: {email: oldEmail}});
    if (!oldEmailUser) {
        const errMsg = `No user found for old email ${oldEmail}`; 
        console.error(errMsg)
        throw new Error(errMsg);
    }
    const newEmailUser: User | null = await prismaClient.user.findUnique({where: {email: newEmail}});

    if (newEmailUser) {
        const errMsg = `Existing user found for new email ${newEmail}`; 
        console.error(errMsg)
        throw new Error(errMsg);
    }

    const res = await prismaClient.user.update({
        where: {email: oldEmail},
        data: {email: newEmail}
    });
    console.log('updateEmail result ' + JSON.stringify(res));
}

// TODO : Add error handling
function handleError(err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const errorCode = err.code;
        PRISMA_ERROR_CODES

    }
}
function fetchErrorCause(err: any): string {
    let cause = '';
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.meta && err.meta.cause) {
            cause = err.meta?.cause as string;
        }
    }
    if (!cause) {
        cause = JSON.stringify(err);
    }
    return cause;
}