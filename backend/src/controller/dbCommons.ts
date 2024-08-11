import { Prisma, PrismaClient } from "@prisma/client";


export const prismaClient = new PrismaClient();

const PRISMA_ERROR_CODES = {
    "P1000": "Authentication Error"
}

// TODO : Add error handling
function handleError(err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const errorCode = err.code;
        PRISMA_ERROR_CODES

    }
}

export function fetchErrorCause(err: any): string {
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