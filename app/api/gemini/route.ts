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
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const inputData = await req.json();
    const {
      quizTitle,
      quizAudience,
      quizDifficulty,
      multipleOrSingleAnswers,
      courseSections,
    } = inputData;

    if (
      !quizTitle ||
      !quizAudience ||
      !quizDifficulty ||
      !multipleOrSingleAnswers ||
      !courseSections
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `
        You are an AI quiz generator. Your task is to generate quiz questions **strictly based on the provided section content**. Do not use any external knowledge or assumptions. 
        
        ### Input Details:
        - **Title**: ${quizTitle}
        - **Audience**: ${quizAudience}
        - **Difficulty**: ${quizDifficulty}
        - **Answer Type**: ${
          multipleOrSingleAnswers === "multiple"
            ? "Multiple-choice (1-4 correct answers)"
            : "Single correct answer"
        }
        - **Sections Provided**: ${courseSections.length} sections
        
        ### Instructions:
        1. **DO NOT** generate your own section titles. Use the exact sections provided.
        2. **DO NOT** add or remove sections. Use exactly the number of sections provided.
        3. **DO NOT** generate questions from external knowledge. Use only the content from each section.
        4. **DO NOT** alter the number of questions per section. Each section must have exactly the requested number of questions.
        5. **DO NOT** include any explanations or additional text in the output.
        6. **DO NOT** include markdown formatting (such as \`\`\`json).
        7. **Return the result as a valid JSON object** without any extra text.
        8. **DO NOT** use triple backticks.
        
        ### Course Sections & Questions:
        ${courseSections
          .map(
            (section: any, index: any) => `
        - **Section ${index + 1}: ${section.sectionTitle}**
          - Content: "${section.sectionContent}"
          - Number of Questions: ${section.numberOfQuestionsInSection}
        `
          )
          .join("\n")}
        
        ### **Expected JSON Output Format:**
        {
          "quizTitle": "${quizTitle}",
          "courseSections": [
            {
              "sectionTitle": "EXACT section title from input",
              "sectionQuestions": [
                {
                  "questionTitle": "Generated question based ONLY on the section content",
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(prompt);

    const aiResponse = response.response.text();

    if (!aiResponse) {
      return NextResponse.json(
        { error: "No response from Gemini AI" },
        { status: 500 }
      );
    }

    // Try parsing response as JSON
    try {
      const cleanedResponse = aiResponse.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(cleanedResponse);
      console.log("response", parsedData);

      return NextResponse.json(parsedData);
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      return NextResponse.json(
        { error: "Invalid response format from Gemini" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
