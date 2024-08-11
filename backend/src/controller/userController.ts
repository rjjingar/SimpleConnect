import { NotificationPreferences, Prisma, PrismaClient, UserProfile } from "@prisma/client";
import { User } from '@prisma/client';
import { NotifPrefsModel, UserModel, UserProfileModel } from "../types/userType";
import { fetchErrorCause, prismaClient } from './dbCommons';
import { convertFromDB, UserFull } from "./modelConverter";
import { upsertUserNotifs, upsertUserProfile } from "./userProfileController";


/**
 * Fetches all users from DB
 * @returns Array of all users as UserModel[] or empty array if no users found. 
 */
export async function getAllUser(): Promise<UserModel[]> { 
    const users: UserFull[] = await prismaClient.user.findMany({
        include: {
            userProfile: true,
            notificationPrefs: true
        }
    });
    let userModels: UserModel[] = [];
    if (users && users.length > 0) {
        userModels = users.map(u => convertFromDB(u));
    }
    console.log('getAllUser ' + JSON.stringify(userModels));
    return userModels;
}

export async function getUserByEmail(email: string, includeProfile?: boolean, includeNotifPrefs?: boolean): Promise<UserModel | undefined> {
    console.log(`DB request to find user by email ${email}`);
    const dbUser: UserFull | null = await fetchDBUser(email, includeProfile || false, includeNotifPrefs || false);
    let userModel: UserModel | undefined = undefined;
    if (dbUser) {
        userModel = convertFromDB(dbUser)
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

async function fetchDBUser(email: string, includeProfile: boolean | false, includeNotifs: boolean | false): Promise<UserFull | null> {
    try {
        const dbUser: UserFull | null = await prismaClient.user.findUnique({
            where: {email: email},
            include: {
                userProfile: includeProfile,
                notificationPrefs: includeNotifs
            }
        });
        return dbUser;
    } catch (err) {
        const msg = `DB Error while finding user for email ${email} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return null;
    }
}


export async function updateUser(user: UserModel): Promise<{status: boolean, msg?: string}> {
    try {
        const dbUser: UserFull | null = await fetchDBUser(user.email, true, true);
        let profileUpdated = false;
        let notifsUpdated = false;
        if (dbUser) {
            if (user.profile) {
                const res = await upsertUserProfile(dbUser.id, user.profile, dbUser.userProfile);
                profileUpdated = res.status;
            }
            if (user.notifs) {
                const res = await upsertUserNotifs(dbUser.id, user.notifs, dbUser.notificationPrefs);
                notifsUpdated = res.status;
            }
        }
        console.log(`updateUser result profileUpdated: ${profileUpdated} notifsUpdated: ${notifsUpdated}`);
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
        const createdUser: User = await prismaClient.user.create({
            data: {
                email: user.email,
                passwordHash: passwordHash,
                createdAt: date,
                updatedAt: date
            }
        });
        console.log('createUser result ' + JSON.stringify(createdUser));
        const userId = createdUser.id;
        if (user.profile) {
            const createdProfile = await upsertUserProfile(userId, user.profile, null);
        }
        if (user.notifs) {
            const createdNotifs = await upsertUserNotifs(userId, user.notifs, null);
        }
        return {status: true, msg: ''};
    } catch (err) {
        const errMsg = `Error while creating user ${JSON.stringify(err)}`
        console.error(errMsg, err);
        return {status: false, msg: errMsg};
    }
}

export async function deleteUser(email: string): Promise<{status: boolean, msg?: string}> {
    try {
        const dbUser = await fetchDBUser(email, false, false);
        if (dbUser) {
            const userId = dbUser.id;
            console.log(`DB User found for email ${email} with userId ${userId}`);
            await prismaClient.userProfile.deleteMany({where: {userId: userId}});
            await prismaClient.notificationPreferences.deleteMany({where: {userId: userId}});
            await prismaClient.user.delete({where: {id: userId}});
        }
        
        return {status: true};
    } catch (err) {
        const msg = `DB Error while deleting user for email ${email} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return {status: false, msg: msg};
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

