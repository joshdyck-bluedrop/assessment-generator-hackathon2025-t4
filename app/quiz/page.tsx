"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizPage() {
	const router = useRouter();
	const [quizData, setQuizData] = useState<any | null>(null);
	const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
	const [submitted, setSubmitted] = useState(false);
	const [score, setScore] = useState<number | null>(null);
	const [results, setResults] = useState<any | null>(null);
	const [showConfetti, setShowConfetti] = useState(false);

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
		let correctCount = 0;
		const processedResults = quizData.courseSections.flatMap((section: any) =>
			section.sectionQuestions.map((question: any) => {
				const userSelected = userAnswers[question.questionTitle] || [];
				const correctAnswers = question.answers.filter((a: any) => a.isCorrect).map((a: any) => a.answerText);

				// Check if all correct answers are selected and no incorrect ones
				const isCorrect = correctAnswers.length === userSelected.length && userSelected.every((ans) => correctAnswers.includes(ans));

				if (isCorrect) correctCount += 1;

				return {
					questionTitle: question.questionTitle,
					answers: question.answers.map((answer: any) => ({
						answerText: answer.answerText,
						isCorrect: answer.isCorrect,
						isSelected: userSelected.includes(answer.answerText),
					})),
				};
			})
		);

		const totalQuestions = processedResults.length;
		const calculatedScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

		setScore(calculatedScore);
		setResults({ score: calculatedScore, sectionQuestions: processedResults });
		setSubmitted(true);

		// 🎉 Show confetti if score is 100%
		if (calculatedScore === 100) {
			setShowConfetti(true);
			setTimeout(() => setShowConfetti(false), 5000); // Hide confetti after 5 seconds
		}
	};

	// ✅ Function to Download JSON Results
	const downloadResultsAsJSON = () => {
		if (!results) return;
		const jsonData = JSON.stringify(results, null, 2);
		const blob = new Blob([jsonData], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		// Format file name with current date
		const currentDate = new Date().toISOString().split("T")[0];
		const fileName = `quiz-results-${currentDate}.json`;

		// Create a link and trigger the download
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	if (!quizData || !quizData.courseSections) <p>Loading...</p>;

	return (
		<div className="p-6 max-w-2xl mx-auto text-white relative">
			{/* 🎉 Confetti Animation Overlay */}
			{showConfetti && <div className="confetti-container"></div>}

			<h1 className="text-2xl font-bold">{quizData.quizTitle}</h1>

			{/* Quiz Content */}
			{quizData?.courseSections?.map((section: any, secIndex: number) => (
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
														: "bg-gray-800 text-white hover:bg-gray-700"
												}`}
											>
												<input
													type={isMultiSelect ? "checkbox" : "radio"}
													name={isMultiSelect ? `${question.questionTitle}-${aIndex}` : question.questionTitle} // Unique names for checkboxes
													value={answer.answerText}
													checked={isSelected}
													onChange={() => handleAnswerChange(question.questionTitle, answer.answerText, isMultiSelect)}
													disabled={submitted} // Disable after submission
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

			{/* Submit & Results */}
			{!submitted && (
				<button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
					Submit Answers
				</button>
			)}

			{submitted && (
				<div className="mt-8">
					{/* Large SCORE Display */}
					<h1 className="text-6xl font-bold text-center">SCORE: {score}%</h1>

					{/* Results in Preformatted JSON Format */}
					{/* <div className="mt-4 p-4 bg-gray-800 rounded">
						<h2 className="text-lg font-semibold">Results</h2>
						<pre className="text-xs overflow-x-auto">{JSON.stringify(results, null, 2)}</pre>
					</div> */}

					{/* ✅ Download JSON Button */}
					<button
						onClick={downloadResultsAsJSON}
						className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
					>
						Download JSON
					</button>

					<button onClick={() => router.push("/quiz-generator")} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full">
						Generate New Quiz
					</button>
				</div>
			)}
		</div>
	);
}
