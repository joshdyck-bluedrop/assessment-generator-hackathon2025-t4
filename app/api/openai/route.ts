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
            You are an AI quiz generator. Your task is to generate quiz questions in **strict JSON format**. Do not include any explanations.
            
            ### Input Details:
            - **Title**: ${quizTitle}
            - **Audience**: ${quizAudience}
            - **Difficulty**: ${quizDifficulty}
            - **Answer Type**: ${multipleOrSingleAnswers === "multiple" ? "Multiple-choice (1-4 correct answers)" : "Single correct answer"}
            
            ### Instructions:
            1. Generate exactly the requested number of questions per section.
            2. Each question should:
            - Match the difficulty level: "${quizDifficulty}".
            - Have a relevant question title.
            - If **multiple answers**, include **1-4 correct answers**.
            - If **single answer**, ensure only **one correct answer**.
            3. **Return the result as valid JSON without extra text.**
            4. **DO NOT** include markdown formatting (such as \\ \`\\ \`\\ \`json \\ \`\\ \`\\ \`).
            5. **DO NOT** include explanations or extra words.
            
            ### Example JSON Output Format:
            {
            "quizTitle": "${quizTitle}",
            "courseSections": [
                {
                "sectionTitle": "Section Title Here",
                "sectionQuestions": [
                    {
                    "questionTitle": "Generated Question Here",
                    "answers": [
                        { "isCorrect": true, "answerText": "Correct Answer" },
                        { "isCorrect": false, "answerText": "Incorrect Answer" }
                    ]
                    }
                ]
                }
            ]
            }
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
