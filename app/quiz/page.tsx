"use client";

import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {playTextToSpeech} from "../utils";

const launchConfetti = () => {
	confetti({
		particleCount: 500, // More confetti particles
		spread: 160, // Wider spread
		startVelocity: 40, // Initial velocity
		scalar: 1.2, // Slightly larger confetti pieces
		origin: { x: 0.5, y: 0 }, // Start from the top center
		gravity: 0.8, // Makes it float longer
		ticks: 200, // Makes it last longer
		colors: ["#ff0", "#0ff", "#f00", "#0f0", "#00f", "#fff"],
	});

	// Trigger multiple bursts for a full effect
	setTimeout(() => {
		confetti({
			particleCount: 500,
			spread: 160,
			startVelocity: 100,
			origin: { x: 0.3, y: 0 }, // Left side
			gravity: 0.9,
			ticks: 250,
		});
	}, 300);

	setTimeout(() => {
		confetti({
			particleCount: 500,
			spread: 160,
			startVelocity: 90,
			origin: { x: 0.7, y: 0 }, // Right side
			gravity: 0.9,
			ticks: 250,
		});
	}, 600);
};

export default function QuizPage() {
	const router = useRouter();
	const [quizData, setQuizData] = useState<any | null>(null);
	const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
	const [submitted, setSubmitted] = useState(false);
	const [score, setScore] = useState<number | null>(null);
	const [results, setResults] = useState<any | null>(null);
	const [showConfetti, setShowConfetti] = useState(false);
	const [encouragementInterval, setEncouragementInterval] = useState<NodeJS.Timeout | null>(null);
	const [sectionImages, setSectionImages] = useState<string[]>([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [imageLoaded, setImageLoaded] = useState(false); // Prevents content from showing before images load

	// 🎙️ List of encouragement phrases
	const encouragementPhrases = [
		"You're doing great! Keep it up!",
		"Stay focused, you're almost there!",
		"You got this! Let's rock this puppy!",
		"You're a quiz master in the making!",
		"Keep pushing! Every question counts!",
		"Nice work! Let's keep going!",
		"You're crushing it! Don't stop now!",
		"Great job! Keep up the momentum!",
		"You're unstoppable! Keep going strong!",
		"Amazing effort! You're on fire!"
	];

	const finalAffirmations = [
		"You are awesome!",
		"Great job, you did amazing!",
		"You are a quiz master!",
		"That was fantastic!",
		"You're smarter than a supercomputer!",
		"I'm speechless, I mean... wow!",
		"You're a genius!",
	];

	// Wait until the first image is fully loaded before showing content
	useEffect(() => {
		if (sectionImages.length > 0) {
			const img = new Image();
			img.src = sectionImages[0];
			img.onload = () => setImageLoaded(true);
		}
	}, [sectionImages]);

	// 🎉 Load images for each section from localStorage
	useEffect(() => {
		const loadedImages = quizData?.courseSections?.map((_: any, index: any) =>
			localStorage.getItem(`quiz_section_${index}_image`)
		).filter(Boolean); // Remove null values

		if (loadedImages?.length > 0) {
			setSectionImages(loadedImages);
		}
	}, [quizData]);

	// 🔄 Cycle through images every 3 seconds
	useEffect(() => {
		if (sectionImages.length < 2) return; // No need to cycle if only one image

		const interval = setInterval(() => {
			setCurrentImageIndex((prevIndex) => (prevIndex + 1) % sectionImages.length);
		}, 3000); // 3 seconds per image

		return () => clearInterval(interval);
	}, [sectionImages]);

	const answerSelectionPhrases = [
		"Good choice!",
		"Interesting selection!",
		"Let's see how that works out!",
		"Hmm, that's an answer!",
		"Bold move!",
		"I see what you're thinking!",
		"Let's go with that one!",
		"That's one way to look at it!",
		"Nice pick!",
		"Let's lock that in!",
		"Are you sure about that?",
	];

	// Play a random encouragement phrase every 10-20 seconds while the quiz is ongoing
	useEffect(() => {
		if (submitted) {
			if (encouragementInterval) clearInterval(encouragementInterval);
			return;
		}

		const playEncouragement = () => {
			const randomPhrase = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
			playTextToSpeech(randomPhrase, true);
		};

		// Random interval between 10 and 20 seconds
		const interval = setInterval(() => {
			playEncouragement();
		}, Math.floor(Math.random() * (60000 - 20000) + 10000));

		setEncouragementInterval(interval);

		return () => clearInterval(interval);
	}, [submitted]);

	// Load quiz data from localStorage on mount
	useEffect(() => {
		const storedQuiz = localStorage.getItem("quizData");
		if (storedQuiz) {
			setQuizData(JSON.parse(storedQuiz));
		}
	}, []);

	// Handle answer selection
	const [lastSpokenTrigger, setLastSpokenTrigger] = useState<number>(0); // Used to trigger TTS without duplicates

	const handleAnswerChange = (questionTitle: string, answerText: string, isMultiSelect: boolean) => {
		if (submitted) return; // Prevent changes after submission

		setUserAnswers((prev) => {
			const currentAnswers = prev[questionTitle] || [];
			let newAnswers = [];

			if (isMultiSelect) {
				// Toggle multi-select answer
				newAnswers = currentAnswers.includes(answerText)
					? currentAnswers.filter((a) => a !== answerText)
					: [...currentAnswers, answerText];
			} else {
				// Single select (radio buttons)
				newAnswers = [answerText];
			}
			return { ...prev, [questionTitle]: newAnswers };
		});
		// Increment trigger to activate useEffect
		setLastSpokenTrigger((prev) => prev + 1);
	};

	// 🔊 Play random phrases
	useEffect(() => {
		if (lastSpokenTrigger === 0) return;

		const getRandomPhrase = () => {
			if (submitted) {
				return finalAffirmations[Math.floor(Math.random() * finalAffirmations.length)];
			} else {
				return answerSelectionPhrases[Math.floor(Math.random() * answerSelectionPhrases.length)];
			}
		};

		const randomPhrase = getRandomPhrase();
		playTextToSpeech(randomPhrase, true);
	}, [lastSpokenTrigger]); // Runs every time a new answer is selected

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

			// Trigger confetti animation
			launchConfetti();

			setTimeout(() => setShowConfetti(false), 10000); // Hide confetti after 5 seconds
		}

		// 🗣 Play final affirmation
		const finalPhrase = finalAffirmations[Math.floor(Math.random() * finalAffirmations.length)];
		playTextToSpeech(finalPhrase, true);
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

	if (!quizData || !quizData.courseSections || !imageLoaded) {
		return (
			<div className="flex items-center justify-center h-screen w-full">
				<p className="text-white text-xl pulse-opacity">Loading...</p>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-2xl mx-auto text-white relative z-10">
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
												className={`flex p-2 mt-1 rounded cursor-pointer ${
													submitted
														? isCorrect
															? "bg-green-600 text-white"
															: isIncorrect
															? "bg-red-600 text-white"
															: "bg-gray-700 text-gray-300"
														: "bg-gray-800 text-white hover:bg-gray-700"
												}`}
											>
												{submitted && isIncorrect && <svg width="25" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CancelIcon" style={{fill: "#fff", paddingRight: 4}}><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2m5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"></path></svg>}
												{submitted && isCorrect && <svg width="25" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="CheckCircleIcon" style={{fill: "#fff", paddingRight: 4}}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"></path></svg>}
												{!submitted && (
													<input
														type={isMultiSelect ? "checkbox" : "radio"}
														name={isMultiSelect ? `${question.questionTitle}-${aIndex}` : `question-${secIndex}-${qIndex}`}
														value={answer.answerText}
														checked={isSelected}
														onChange={() => handleAnswerChange(question.questionTitle, answer.answerText, isMultiSelect)}
														disabled={submitted} // Disable after submission
														className="mr-2"
													/>
												)}
												{answer.answerText} {submitted && isSelected && '(Your Answer)'}
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
						⬇ Download JSON
					</button>

					<button onClick={() => router.push("/quiz-generator")} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full">
						🔄 Generate New Quiz
					</button>
				</div>
			)}

			{/* 📸 Background Slideshow (Moved Below the Content) */}
			{sectionImages.length > 0 && (
				<div className="fixed inset-0 -z-10">
					{/* 📸 Full-Screen Background Slideshow */}
					{sectionImages.map((image, index) => (
						<img
							key={index}
							src={image}
							alt="Background"
							className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
								index === currentImageIndex ? "opacity-100" : "opacity-0"
							}`}
						/>
					))}

					{/* 🔥 Full-Screen Dark Overlay */}
					<div className="absolute inset-0 bg-black/85"></div> {/* Ensures true opacity */}
					<div className="absolute inset-0 backdrop-blur-md"></div> {/* Applies blur separately */}
				</div>
			)}
		</div>
	);
}
