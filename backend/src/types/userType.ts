export type UserModel = {
    email: string,
    profile?: UserProfileModel,
    notifs?: NotifPrefsModel,
    createdAt?: Date,
    updatedAt?: Date,
    password?: string
}

export type UserProfileModel = {
    firstName: string,
    lastName: string,
    createdAt?: Date,
    updatedAt?: Date,
}

export type NotifPrefsModel = {
    newsletter: boolean,
    transactional: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}

export type UpdateEmailRequest = {
    oldEmail: string,
    newEmail: string
}

export type UpdatePasswordRequest = {
    email: string,
    oldPassword: string,
    newPassword: string
}

export type UserAuthRequest = {
    email: string,
    password: string
}

export type UserAccountCreateRequest = {
    user: UserModel,
    password: string
}

export type TokenPayload = {
    email: string,
    signInTime: number
}

export type AuthResponse = {
    status: boolean,
    statusCode: string,
    token?: string,
    message?: string,
    user?: UserModel
}