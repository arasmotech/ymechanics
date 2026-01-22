import { PrismaClient } from '../../../generated/prisma';
// import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addUser = async (userData) => {
    const newUser = await prisma.users.create({
        data: userData
    });
    return newUser;
};

export const getUserByUsername = async (username) => {
    const user = await prisma.users.findUnique({
        where: { username }
    });
    return user;
};