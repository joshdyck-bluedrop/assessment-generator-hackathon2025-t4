import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ✅ Initialize OpenAI with API key
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: NextRequest) {
	try {
		const { userText } = await req.json();
		if (!userText) {
			return NextResponse.json({ error: "Missing required text input." }, { status: 400 });
		}

		// 🌟 Step 1: Extract Theme using Chat Completions API
		const chatCompletion = await openai.chat.completions.create({
			model: "gpt-4-turbo",
			messages: [
				{ role: "system", content: "You are an AI that extracts key themes from text." },
				{ role: "user", content: `Extract a **single clear theme** from the following text:\n\n${userText}` },
			],
			temperature: 0.7,
			max_tokens: 50,
		});

		const extractedTheme = chatCompletion.choices[0]?.message?.content?.trim();
		if (!extractedTheme) throw new Error("Failed to extract a valid theme.");

		// 🖼 Step 2: Generate Image using DALL·E 3
		const imageResponse = await openai.images.generate({
			// model: "dall-e-3",
			prompt: `
				Generate a **high-resolution, professional photograph** based on the theme: **"${extractedTheme}"**.
				- The image must be **realistic and natural**, like a photo captured with a professional DSLR camera.
				- Clear details, accurate lighting, natural shadows, and depth of field.
				- Taken with a **Canon EOS 5D Mark IV, f/1.8 aperture, HDR mode enabled**.
				- The subject should be **instantly recognizable and directly related to the theme**.
				- The image should look like a **stock photo from Getty Images or Unsplash**.
			`.trim(),
			n: 1,
			size: "1024x1024",
			quality: "hd",
		});

		const imageUrl = imageResponse.data[0]?.url;
		if (!imageUrl) throw new Error("Failed to generate an image.");

		// ✅ Return JSON response with extracted theme & generated image
		return NextResponse.json({ theme: extractedTheme, imageUrl }, { status: 200 });

	} catch (error: any) {
		console.error("Error in route:", error.message);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
