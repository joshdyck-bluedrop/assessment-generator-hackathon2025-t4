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

import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
	try {
		const inputData = await req.json();
		const { quizTitle, quizAudience, quizDifficulty, multipleOrSingleAnswers, courseSections } = inputData;

		if (!quizTitle || !quizAudience || !quizDifficulty || !multipleOrSingleAnswers || !courseSections) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}
    const sanitizedSections = courseSections.map((section: any) => ({
      sectionTitle: section.sectionTitle,
      sectionContent: section.sectionContent.replace(/"/g, '\\"'), // Escape quotes
      numberOfQuestionsInSection: section.numberOfQuestionsInSection,
    }));
    
    const prompt = `
    You are an AI quiz generator. Your task is to generate quiz questions **strictly based on the provided section content**. Do not use any external knowledge or assumptions.
    
    ### Input Details:
    - **Title**: ${quizTitle}
    - **Audience Style**: ${quizAudience} (Use their speech pattern and tone)
    - **Difficulty**: ${quizDifficulty}
    - **Answer Type**: ${multipleOrSingleAnswers === "multiple" ? "Multiple-choice (1-4 correct answers)" : "Single correct answer"}
    - **Sections Provided**: ${courseSections.length} sections
    
    ### **Instructions**
    1. **DO NOT** generate your own section titles. Use the exact sections provided.
    2. **DO NOT** add or remove sections. Use exactly the number of sections provided.
    3. **DO NOT** generate questions from external knowledge. Use only the content from each section.
    4. **DO NOT** alter the number of questions per section. Each section must have exactly the requested number of questions.
    5. **DO NOT** include explanations or additional text. **Return ONLY VALID JSON**.
    6. **DO NOT** include markdown formatting (such as \`\`\`json).
    7. **DO NOT** allow duplicate questions.
    8. All questions should be **written in the dialect, tone, and vocabulary of the audience**. However, slang should **not break JSON structure or readability**. DO NOT change the question, just modify the linguistic style.
    9. **Ensure that all answers are strictly derived from the section content**.
    10. **For "challenging" difficulty**, make answers inferential rather than explicitly stated.
    11. **For "simple" difficulty**, use facts explicitly present in sectionContent.
    12. **For "balanced mix" difficulty**, include both types of questions evenly.
    13. **Randomly shuffle the correct answer(s) in the list** but **ensure correct JSON formatting**.
    14. **Ensure incorrect answer options are of similar complexity to the correct answer**.
    15. **Ensure "multiple answers" type includes at least one question with more than one correct answer**.
    16. **Ensure "single answer" type only has one correct answer**.
    17. **DO NOT insert excessive or unrealistic slang that breaks structure. Keep the speech pattern natural and readable.**
    18. **Return ONLY a valid JSON object** with NO extra text, headers, or explanations.
    19. **Ensure JSON format correctness. If invalid JSON is generated, retry and self-correct.**
    
    ### **Course Sections & Questions**
    ${JSON.stringify(sanitizedSections, null, 2)}
    
    ### **Expected JSON Output Format:**
    ${JSON.stringify(
      {
        quizTitle,
        courseSections: sanitizedSections.map((section: any) => ({
          sectionTitle: section.sectionTitle,
          sectionQuestions: Array(section.numberOfQuestionsInSection)
            .fill(null)
            .map(() => ({
              questionTitle: "Generated question based ONLY on the section content",
              answers: [
                { isCorrect: true, answerText: "Correct Answer" },
                { isCorrect: false, answerText: "Incorrect Answer 1" },
                { isCorrect: false, answerText: "Incorrect Answer 2" },
                { isCorrect: false, answerText: "Incorrect Answer 3" },
              ],
            })),
        })),
      },
      null,
      2
    )}
    `;

		const response = await openai.chat.completions.create({
			model: "gpt-4-turbo",
			messages: [{ role: "system", content: "You are an expert AI that generates high-quality quiz questions." }, { role: "user", content: prompt }],
			temperature: 0.7,
			max_tokens: 8000,
		});

		const aiResponse = response.choices[0].message?.content?.trim();
		if (!aiResponse) {
			return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
		}

    console.log(`\x1b[93maiResponse: ${aiResponse}\x1b[0m`);

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
