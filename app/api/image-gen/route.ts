import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY!, // Ensure this is set in your environment variables
});

// Function to safely trim the prompt while preserving meaningful content
const trimText = (text: string, maxLength: number) => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trim() + "..."; // Cut off and add "..." if too long
};

export async function POST(req: Request) {
	try {
		const { userInput } = await req.json();

		if (!userInput || typeof userInput !== "string") {
			return NextResponse.json({ error: "Missing or invalid input for image generation" }, { status: 400 });
		}

		// Ensure the total prompt length is ≤ 1000 characters
		const basePrompt = "Generate a thematic image based on and describing the following: ";
		const maxUserInputLength = 900 - basePrompt.length; // 1000 - 56 = 944

		const trimmedUserInput = trimText(userInput, maxUserInputLength);

		// Construct the final prompt
		const prompt = `${basePrompt}${trimmedUserInput}`;

		// Call OpenAI's image generation API
		const response = await openai.images.generate({
			prompt,
			n: 1, // Generate one image
			size: "1024x1024",
		});

		// Extract image URL
		const imageUrl = response.data[0]?.url;

		if (!imageUrl) {
			throw new Error("No image URL returned from OpenAI");
		}

		return NextResponse.json({ imageUrl });
	} catch (error: any) {
		console.error("Image generation error:", error);
		return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
	}
}
