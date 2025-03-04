"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
	const router = useRouter();
	const [quizData, setQuizData] = useState<any | null>(null);
	const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
	const [results, setResults] = useState<any | null>(null);
	const [submitted, setSubmitted] = useState(false);

	// Load quiz data from localStorage on mount
	useEffect(() => {
		const storedQuiz = localStorage.getItem("quizData");
		if (storedQuiz) {
			setQuizData(JSON.parse(storedQuiz));
		}
	}, []);

	// Handle answer selection
	const handleAnswerChange = (questionTitle: string, answerText: string, isMultiSelect: boolean) => {
		setUserAnswers((prev) => {
			const currentAnswers = prev[questionTitle] || [];
			if (isMultiSelect) {
				// Toggle multi-select answer
				const newAnswers = currentAnswers.includes(answerText)
					? currentAnswers.filter((a) => a !== answerText)
					: [...currentAnswers, answerText];
				return { ...prev, [questionTitle]: newAnswers };
			} else {
				// Single select (radio buttons)
				return { ...prev, [questionTitle]: [answerText] };
			}
		});
	};

	// Submit answers and calculate results
	const handleSubmit = () => {
		let correctCount = 0;
		const processedResults = quizData.courseSections.flatMap((section: any) =>
			section.sectionQuestions.map((question: any) => {
				const userSelected = userAnswers[question.questionTitle] || [];
				const correctAnswers = question.answers.filter((a: any) => a.isCorrect).map((a: any) => a.answerText);

				// Check if all correct answers are selected and no incorrect answers are selected
				const isCorrect = correctAnswers.length === userSelected.length && userSelected.every((ans) => correctAnswers.includes(ans));

				if (isCorrect) correctCount += 1;

				return {
					questionTitle: question.questionTitle,
					answers: question.answers,
				};
			})
		);

		const score = Math.round((correctCount / processedResults.length) * 100);
		setResults({ score, sectionQuestions: processedResults });
		setSubmitted(true);
	};

	if (!quizData) return <p>Loading...</p>;

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold">{quizData.quizTitle}</h1>
			{quizData.courseSections.map((section: any, secIndex: number) => (
				<div key={secIndex} className="mt-4">
					<h2 className="text-xl font-semibold">{section.sectionTitle}</h2>
					{section.sectionQuestions.map((question: any, qIndex: number) => {
						const correctAnswers = question.answers.filter((a: any) => a.isCorrect).map((a: any) => a.answerText);
						const isMultiSelect = correctAnswers.length > 1;
						const userSelected = userAnswers[question.questionTitle] || [];

						const isUserCorrect =
							submitted &&
							correctAnswers.length === userSelected.length &&
							userSelected.every((ans) => correctAnswers.includes(ans));

						return (
							<div
								key={qIndex}
								className={`p-4 mt-2 rounded ${submitted ? (isUserCorrect ? "bg-green-200" : "bg-red-200") : "bg-gray-100"}`}
							>
								<p className="font-medium">{question.questionTitle}</p>
								<div className="ml-4">
									{question.answers.map((answer: any, aIndex: number) => (
										<label key={aIndex} className="block">
											<input
												type={isMultiSelect ? "checkbox" : "radio"}
												name={question.questionTitle}
												value={answer.answerText}
												checked={userSelected.includes(answer.answerText)}
												onChange={() => handleAnswerChange(question.questionTitle, answer.answerText, isMultiSelect)}
												disabled={submitted}
												className="mr-2"
											/>
											{answer.answerText}
										</label>
									))}
								</div>
							</div>
						);
					})}
				</div>
			))}

			{!submitted && (
				<button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
					Submit Answers
				</button>
			)}

			{submitted && (
				<button onClick={() => router.push("/quiz-generator")} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
					Generate New Quiz
				</button>
			)}
		</div>
	);
}
