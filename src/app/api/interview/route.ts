import { NextRequest, NextResponse } from "next/server";
import { runInterviewAgent } from "./../../lib/interviewAgent";

export async function POST(request: NextRequest) {

    try {

        const body = await request.json();

        if (!body.topic || !body.answer) {
            return NextResponse.json(
                {
                    error: "Topic and answer are required",
                },
                {
                    status: 400,
                }
            );
        }

        const result = await runInterviewAgent({
            topic: body.topic,
            answer: body.answer,
            question: body.question,
        });

        return NextResponse.json(result);

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                error: "AI agent failed",
            },
            {
                status: 500,
            }
        );
    }
}