import { addUserService, getUsersService, updateUserService } from "@/app/services/users_service";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        const userData = await request.json();
        const response = await addUserService(userData);
        if (response.statusCode !== "201") {
            return NextResponse.json({ statusCode: response.statusCode.toString(), message: response.message }, { status: 400 });
        }
        const newUser = response.data;
        return NextResponse.json({ statusCode: "201", message: "User created successfully", data: newUser }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ statusCode: "500", message: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const skip = url.searchParams.get('skip');
        const take = url.searchParams.get('take');
        const usersResponse = await getUsersService(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10);
        return NextResponse.json({ statusCode: "200", message: "Users fetched successfully", data: usersResponse.data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ statusCode: "500", message: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('id');
        const userData = await request.json();
        const response = await updateUserService(userId, userData);
        if (response.statusCode !== "200") {
            return NextResponse.json({ statusCode: response.statusCode.toString(), message: response.message }, { status: 400 });
        }
        return NextResponse.json({ statusCode: "200", message: "User updated successfully", data: response.data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ statusCode: "500", message: error.message }, { status: 500 });
    }
}