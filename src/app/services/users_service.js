import { addUser, getUserByUsername } from "../dal/users_dal";
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