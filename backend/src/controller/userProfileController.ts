import { User, UserProfile, NotificationPreferences, Prisma, PrismaClient } from "@prisma/client";
import { NotifPrefsModel, UserModel, UserProfileModel } from "../types/userType";
import { fetchErrorCause } from "./dbCommons";

const prismaClient = new PrismaClient();

export async function upsertUserProfile(userId: number, reqProfile: UserProfileModel, dbProfile: UserProfile | null): Promise<{status: boolean, msg?: string}> {
    const date = new Date();
    let res = {status: true};
    if (!dbProfile) {
        // create new DB user profile
        res = await createUserProfile(userId, reqProfile);
    } else {
        // check any diff 
        if (reqProfile.firstName) {
            dbProfile.firstName = reqProfile.firstName;
        }
        if (reqProfile.lastName) {
            dbProfile.lastName = reqProfile.lastName;
        }
        res = await updateUserProfile(dbProfile);
    }
    return res;
}

async function createUserProfile(userId: number, profile: UserProfileModel): Promise<{status: boolean, msg?: string}> {
    const date = new Date();
    try {
        const createdProfile: UserProfile = await prismaClient.userProfile.create({
            data: {
                userId: userId,
                firstName: profile.firstName,
                lastName: profile.lastName,
                createdAt: date,
                updatedAt: date,
            }
        });
        console.log('createProfile result ' + JSON.stringify(createdProfile));
        return {status: true};
    } catch (err) {
        const msg = `DB Error while creating user profile userId ${userId} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return {status: false, msg: msg};
    }
}

async function updateUserProfile(profile: UserProfile): Promise<{status: boolean, msg?: string}> {
    const date = new Date();
    try {
        const createdProfile: UserProfile = await prismaClient.userProfile.update({
            where: {id: profile.id},
            data: {
                firstName: profile.firstName,
                lastName: profile.lastName,
                updatedAt: date,
            }
        });
        console.log('updatedProfile result ' + JSON.stringify(createdProfile));
        return {status: true};
    } catch (err) {
        const msg = `DB Error while updating user profile userId ${profile.userId} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return {status: false, msg: msg};
    }
}


export async function upsertUserNotifs(userId: number, reqNotifs: NotifPrefsModel, dbNotifs: NotificationPreferences | null): Promise<{status: boolean, msg?: string}> {
    const date = new Date();
    let res = {status: true};
    if (!dbNotifs) {
        // create new DB user profile
        res = await createUserNotifs(userId, reqNotifs);
    } else {
        // check any diff 
        if (reqNotifs.transactional !== undefined) {
            dbNotifs.transactional = reqNotifs.transactional;
        }
        if (reqNotifs.newsletter !== undefined) {
            dbNotifs.newsletter = reqNotifs.newsletter;
        }
        res = await updateUserNotifs(dbNotifs);
    }
    return res;
}

async function createUserNotifs(userId: number, notifs: NotifPrefsModel): Promise<{status: boolean, msg?: string}> {
    const date = new Date();
    try {
        const createdNotifs: NotificationPreferences = await prismaClient.notificationPreferences.create({
            data: {
                userId: userId,
                newsletter: notifs.newsletter,
                transactional: notifs.transactional,
                createdAt: date,
                updatedAt: date,
            }
        });
        console.log('createUserNotifs result ' + JSON.stringify(createdNotifs));
        return {status: true};
    } catch (err) {
        const msg = `DB Error while createUserNotifs for userId ${userId} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return {status: false, msg: msg};
    }
}

async function updateUserNotifs(notifs: NotificationPreferences): Promise<{status: boolean, msg?: string}> {
    const date = new Date();
    try {
        const updatedNotifs: NotificationPreferences = await prismaClient.notificationPreferences.update({
            where: {id: notifs.id},
            data: {
                newsletter: notifs.newsletter,
                transactional: notifs.transactional,
                updatedAt: date,
            }
        });
        console.log('updateUserNotifs result ' + JSON.stringify(updatedNotifs));
        return {status: true};
    } catch (err) {
        const msg = `DB Error while updateUserNotifs for userId ${notifs.userId} : ${fetchErrorCause(err)}`;
        console.error(msg);
        return {status: false, msg: msg};
    }
}