import { addUserService } from "@/app/services/users_service";
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