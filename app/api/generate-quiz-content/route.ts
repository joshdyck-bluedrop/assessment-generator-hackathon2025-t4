import { NextRequest, NextResponse } from "next/server";

interface QuizRequestBody {
	quizTitle: string;
	quizAudience: string;
	quizDifficulty: string;
	multipleOrSingleAnswers: string;
	apiModel: "claude" | "gemini" | "openai";
}

export async function POST(req: NextRequest) {
	try {
		const { apiModel }: QuizRequestBody =
			await req.json();

		// 🎲 Randomize Sections (2-4) & Questions per Section (3-6)
		const numSections = Math.floor(Math.random() * 3) + 2;
		const numQuestions = Math.floor(Math.random() * 4) + 3;

		// 📝 AI Prompt (Force JSON Output)
		const quizPrompt = `Generate a structured quiz with the following details:
        - Title: Can be any topic
        - Audience: Can be one of "Toddler", "Aussie Bloke", "French Aristocrat", "Newfoundlander Bayman", "Surfer Dude", or "Astro-Physicist"
        - Difficulty: Can be one of "simple", "challenging" or "balanced mix of simple and challenging"
        - Answer Type: Can be one of "single" or "multiple"
        - Format: ${numSections} sections with ${numQuestions} or ${numQuestions - 1} questions in each section.
        - Each section should have a title, a short section content description, and a specified number of questions.
        - **Return only valid JSON in the following structure:**
        
        {
            "quizTitle": string;
            "quizAudience": "Toddler" | "Aussie Bloke" | "French Aristocrat" | "Newfoundlander Bayman" | "Surfer Dude" | "Astro-Physicist";
            "quizDifficulty": simple" | "challenging" | "balanced mix of simple and challenging";
            "multipleOrSingleAnswers": "single" | "multiple";
            "apiModel": "claude" | "openai" | "gemini",
            "courseSections": [
                // Use ${numSections} sections with ${numQuestions} or ${numQuestions - 1} numberOfQuestionsInSection. Each section can have different numbers of questions. Here is an example:
                {
                    "sectionTitle": "Example Section 1",
                    "numberOfQuestionsInSection": ${numQuestions},
                    "sectionContent": "Brief description of the section."
                },
            ]
        }
        
        - **Do NOT include extra text, markdown formatting, or explanations. Return ONLY JSON.**`;

		let apiUrl = "";
		let requestBody: Record<string, any> = {};
		let headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		// 🔹 API Selection Logic
		if (apiModel === "claude") {
			apiUrl = "https://api.anthropic.com/v1/messages";
			headers = {
				...headers,
				"x-api-key": process.env.CLAUDE_API_KEY || "",
				"anthropic-version": "2023-06-01",
			};
			requestBody = {
				model: "claude-2.1",
				messages: [{ role: "user", content: quizPrompt }],
				max_tokens: 1000,
			};
		} else if (apiModel === "gemini") {
			apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
			headers = {
				...headers,
				Authorization: `Bearer ${process.env.GEMINI_API_KEY || ""}`,
			};
			requestBody = {
				contents: [{ role: "user", parts: [{ text: quizPrompt }] }],
				max_output_tokens: 1000,
			};
		} else {
			apiUrl = "https://api.openai.com/v1/chat/completions";
			headers = {
				...headers,
				Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
			};
			requestBody = {
				model: "gpt-4-turbo",
				messages: [
					{ role: "system", content: "You are an AI that generates structured quiz JSON without explanations." },
					{ role: "user", content: quizPrompt },
				],
				temperature: 1.2, // Increase creativity
				max_tokens: 1000,
			};
		}

		// 📨 Fetch AI Response
		const completionResponse = await fetch(apiUrl, {
			method: "POST",
			headers,
			body: JSON.stringify(requestBody),
		});

		if (!completionResponse.ok) {
			const errorText = await completionResponse.text();
			throw new Error(`Failed to fetch quiz content from ${apiModel}: ${errorText}`);
		}

		const completionData = await completionResponse.json();

		// 🔄 Extract AI Response & Ensure Proper JSON
		let generatedContent = "";
		if (apiModel === "claude") {
			generatedContent = completionData.completion ?? "";
		} else if (apiModel === "gemini") {
			generatedContent = completionData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
		} else {
			generatedContent = completionData.choices?.[0]?.message?.content ?? "";
		}

		// 🛠️ Clean AI Response (Remove Markdown & Extra Text)
		generatedContent = generatedContent.trim();
		generatedContent = generatedContent.replace(/^```json/, "").replace(/```$/, "").trim();

		// ✅ Ensure JSON is Valid
		let parsedQuiz;
		try {
			parsedQuiz = generatedContent;
		} catch (jsonError) {
			console.error("❌ AI returned invalid JSON:", generatedContent);
			throw new Error("AI did not return a valid JSON format.");
		}

		// ✅ Return JSON Response in Expected Format
		return NextResponse.json(parsedQuiz, { status: 200 });

	} catch (error: any) {
		console.error("Error generating quiz:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
