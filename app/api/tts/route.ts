import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "tts-1", // Adjust based on available models
                voice: "coral", // Change voice model if needed
                input: text,
            }),
        });

        if (!response.ok) throw new Error("Failed to fetch TTS from OpenAI");

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "no-cache",
            },
        });
    } catch (error: any) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
