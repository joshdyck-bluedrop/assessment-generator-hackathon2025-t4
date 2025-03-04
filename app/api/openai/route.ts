// Example payload
// {
//     "quizTitle": "Physics Quiz",
//     "quizAudience": "High school students",
//     "quizDifficulty": "balanced mix of simple and challenging",
//     "multipleOrSingleAnswers": "multiple",
//     "courseSections": [
//       {
//         "sectionTitle": "Newton's Laws",
//         "numberOfQuestionsInSection": 3,
//         "sectionContent": "Newton's laws explain the motion of objects."
//       },
//       {
//         "sectionTitle": "Thermodynamics",
//         "numberOfQuestionsInSection": 4,
//         "sectionContent": "Thermodynamics covers heat transfer and energy conservation."
//       }
//     ]
//   }

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
	try {
		const inputData = await req.json();
		const { quizTitle, quizAudience, quizDifficulty, multipleOrSingleAnswers, courseSections } = inputData;

		if (!quizTitle || !quizAudience || !quizDifficulty || !multipleOrSingleAnswers || !courseSections) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}

		const prompt = `
			You are an AI quiz generator. Your task is to generate quiz questions based on provided course sections.
			
			### Quiz Details:
			- **Title**: ${quizTitle}
			- **Audience**: ${quizAudience}
			- **Difficulty**: ${quizDifficulty}
			- **Answer Type**: ${multipleOrSingleAnswers === "multiple" ? "Multiple-choice (1-4 correct answers)" : "Single correct answer"}

			### Instructions:
			For each section, generate exactly the requested number of questions. Each question should:
			- Match the specified difficulty: "${quizDifficulty}"
			- Have a title that fits the section content.
			- If **multiple answers** are allowed, randomly generate between 1 to 4 correct answers.
			- If **single answer** is chosen, ensure only one correct answer.
			- Answers should be relevant and well-thought-out.

			### Course Sections:
			${courseSections.map((section: any, index: any) => `
			**Section ${index + 1}: ${section.sectionTitle}**
			- Content: ${section.sectionContent}
			- Number of Questions: ${section.numberOfQuestionsInSection}
			`).join("\n\n")}
			
			Return the completed JSON object with each section containing generated questions.
		`;

		const response = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [{ role: "system", content: "You are an expert AI that generates high-quality quiz questions." }, { role: "user", content: prompt }],
			temperature: 0.7,
			max_tokens: 2000,
		});

		const aiResponse = response.choices[0].message?.content?.trim();
		if (!aiResponse) {
			return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
		}

		// Try parsing response as JSON
		try {
			const parsedData = JSON.parse(aiResponse);
			return NextResponse.json(parsedData);
		} catch (error) {
			console.error("Failed to parse OpenAI response:", error);
			return NextResponse.json({ error: "Invalid response format from OpenAI" }, { status: 500 });
		}
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}
