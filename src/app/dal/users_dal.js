import { PrismaClient } from '../../../generated/prisma';
// import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addUser = async (userData) => {
    const newUser = await prisma.users.create({
        data: userData
    });
    return newUser;
};

export const getAllUsers = async (skip, take) => {
    const users = await prisma.users.findMany({
        skip,
        take
    });
    return users;
};

export const getUserByUsername = async (username) => {
    const user = await prisma.users.findUnique({
        where: { username }
    });
    return user;
};

export const getUserById = async (id) => {
    const user = await prisma.users.findUnique({
        where: { id }
    });
    return user;
};

export const updateUserDal = async (userId, userData) => {
    const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: {
            name: userData.name,
            is_active: userData.is_active
        }
    });
    return updatedUser;
}