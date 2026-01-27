import { addUser, getUserByUsername, getAllUsers, getUserById, updateUserDal } from "../dal/users_dal";
import { NextResponse } from "next/server";
const bcrypt = require('bcryptjs');

export const addUserService = async (userData) => {
    try {
        const user = await getUserByUsername(userData.username);
        console.log("Existing user:", user);
        if (user) {
            return { message: "Username already exists", statusCode: "202" };
        }
        if (userData.role !== 'ADMIN') {
            return { message: "Only ADMIN role can be assigned", statusCode: "203" };
        }
        const { password } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        userData.password = hashedPassword;

        const newUser = await addUser(userData);
        return { message: "User added successfully", statusCode: "201", data: newUser };
    } catch (error) {
        return { message: error.message, statusCode: "500" };
    }
};

export const getUsersService = async (skip, take) => {
    try {
        const users = await getAllUsers(skip ? skip : 0, take ? take : 10);
        return { message: "Users fetched successfully", statusCode: "200", data: users };
    } catch (error) {
        return { message: error.message, statusCode: "500" };
    }
};

export const updateUserService = async (userId, userData) => {
    try {
        const user = await getUserById(userId);
        if (!user) {
            return { message: "User not found", statusCode: "404" };
        }
        const updatedUser = await updateUserDal(userId, userData);
        return { message: "User updated successfully", statusCode: "200", data: updatedUser };
    } catch (error) {
        return { message: error.message, statusCode: "500" };
    }
}