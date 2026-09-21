import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./../../lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { email, name } = body;

        if (!email) {
            return NextResponse.json(
                {
                    error: "Email is required",
                },
                {
                    status: 400,
                }
            );
        }

        const user = await prisma.user.create({
            data: {
                email,
                name,
            },
        });

        return NextResponse.json(
            {
                user,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Unable to create user",
            },
            {
                status: 500,
            }
        );
    }
}