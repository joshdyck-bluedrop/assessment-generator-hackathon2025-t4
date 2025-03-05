import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text, audience } = await req.json();

        const completionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4-turbo", // Or "gpt-4"
                messages: [
                    {
                        role: "system",
                        content: `You are an AI that rewrites text to match the dialect, style, and language of the specified audience.`,
                    },
                    {
                        role: "user",
                        content: `Rewrite the following text to sound like it is spoken by a ${audience}: "${text}"`,
                    }
                ],
                temperature: 0.7,
            }),
        });

        if (!completionResponse.ok) throw new Error("Failed to fetch completion");

        const completionData = await completionResponse.json();
        const modifiedText = completionData.choices[0]?.message?.content || text; // Fallback to original text

        return NextResponse.json({ modifiedText });
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
