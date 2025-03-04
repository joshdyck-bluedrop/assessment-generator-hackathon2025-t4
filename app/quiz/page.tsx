"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
	const router = useRouter();
	const [quizData, setQuizData] = useState<any | null>(null);
	const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
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
		if (submitted) return; // Prevent changes after submission

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
		setSubmitted(true);
	};

	if (!quizData) return <p>Loading...</p>;

	return (
		<div className="p-6 max-w-2xl mx-auto text-white">
			<h1 className="text-2xl font-bold">{quizData.quizTitle}</h1>
			{quizData.courseSections.map((section: any, secIndex: number) => (
				<div key={secIndex} className="mt-4">
					<h2 className="text-xl font-semibold">{section.sectionTitle}</h2>
					{section.sectionQuestions.map((question: any, qIndex: number) => {
						const correctAnswers = question.answers.filter((a: any) => a.isCorrect).map((a: any) => a.answerText);
						const isMultiSelect = correctAnswers.length > 1;
						const userSelected = userAnswers[question.questionTitle] || [];

						return (
							<div key={qIndex} className="p-4 mt-2 rounded bg-gray-900">
								<p className="font-medium">{question.questionTitle}</p>
								<div className="mt-2">
									{question.answers.map((answer: any, aIndex: number) => {
										const isSelected = userSelected.includes(answer.answerText);
										const isCorrect = correctAnswers.includes(answer.answerText);
										const isIncorrect = isSelected && !isCorrect;

										return (
											<label
												key={aIndex}
												className={`block p-2 mt-1 rounded cursor-pointer ${
													submitted
														? isCorrect
															? "bg-green-600 text-white"
															: isIncorrect
															? "bg-red-600 text-white"
															: "bg-gray-700 text-gray-300"
														: "bg-gray-800 text-white"
												}`}
											>
												<input
													type={isMultiSelect ? "checkbox" : "radio"}
													name={question.questionTitle}
													value={answer.answerText}
													checked={isSelected}
													readOnly // Ensures input is disabled and view-only after submission
													className="mr-2"
												/>
												{answer.answerText}
											</label>
										);
									})}
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
