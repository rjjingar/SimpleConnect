import { NotificationPreferences, Prisma, UserProfile } from "@prisma/client";
import { NotifPrefsModel, UserModel, UserProfileModel } from "../types/userType";

export type UserFull = Prisma.UserGetPayload<{include: {userProfile: true, notificationPrefs: true}}>;

export function convertFromDB(user: UserFull): UserModel {
    const userModel: UserModel = {
        email: user.email,
        password: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: convertProfileFromDB(user.userProfile),
        notifs: convertNotifPrefFromDB(user.notificationPrefs)
    }
    return userModel;
}

export function convertProfileFromDB(profile: UserProfile | null): UserProfileModel | undefined {
    if (!profile) return undefined;
    const profileModel: UserProfileModel = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
    }
    return profileModel;
}

export function convertNotifPrefFromDB(dbNotifs: NotificationPreferences | null): NotifPrefsModel | undefined {
    if (!dbNotifs) return undefined;
    const notifs: NotifPrefsModel = {
        newsletter: dbNotifs.newsletter,
        transactional: dbNotifs.transactional,
        createdAt: dbNotifs.createdAt,
        updatedAt: dbNotifs.updatedAt
    }
    return notifs;
}