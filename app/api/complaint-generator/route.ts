import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { text } = await req.json();

	if (!text) {
		return NextResponse.json({ error: "No text provided" }, { status: 400 });
	}

	const response = await fetch("https://api.openai.com/v1/audio/speech", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure this is set in .env
		},
		body: JSON.stringify({
			model: "tts-1",
			input: text,
			voice: "alloy", // Choose OpenAI voice, e.g., alloy, echo, fable, onyx, nova
		}),
	});

	const audioBuffer = await response.arrayBuffer();

	return new Response(audioBuffer, {
		headers: {
			"Content-Type": "audio/mpeg",
		},
	});
}
