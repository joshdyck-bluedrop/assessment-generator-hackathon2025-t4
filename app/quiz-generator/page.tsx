"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CourseSection {
	sectionTitle: string;
	numberOfQuestionsInSection: number;
	sectionContent: string;
}

export default function QuizGeneratorPage() {
	const router = useRouter();
	const [quiz, setQuiz] = useState({
		quizTitle: "",
		quizAudience: "",
		quizDifficulty: "balanced mix of simple and challenging",
		multipleOrSingleAnswers: "single",
		courseSections: [{ sectionTitle: "", numberOfQuestionsInSection: 5, sectionContent: "" }],
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("Generating your quiz...");

	// List of rotating loading messages
	const loadingPhrases = [
		"Determining the specs...",
		"Running the numbers...",
		"Doing hard things...",
		"Summoning the quiz spirits...",
		"Consulting the AI overlords...",
		"Shuffling the question deck...",
		"Optimizing brain puzzles...",
		"Thinking really hard...",
	];

	// Cycle through loading messages every 2 seconds
	useEffect(() => {
		if (!isSubmitting) return;

		let index = 0;
		const interval = setInterval(() => {
			setLoadingMessage(loadingPhrases[index]);
			index = (index + 1) % loadingPhrases.length;
		}, 2000);

		return () => clearInterval(interval);
	}, [isSubmitting]);

	// Function to handle input changes
	const handleInputChange = (field: string, value: string | number) => {
		setQuiz((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	// Function to handle section input changes
	const handleSectionChange = (index: number, field: keyof CourseSection, value: string | number) => {
		const updatedSections = [...quiz.courseSections];
		updatedSections[index][field] = value as any;
		setQuiz((prev) => ({
			...prev,
			courseSections: updatedSections,
		}));
	};

	// Function to add a new section
	const addNewSection = () => {
		setQuiz((prev) => ({
			...prev,
			courseSections: [...prev.courseSections, { sectionTitle: "", numberOfQuestionsInSection: 5, sectionContent: "" }],
		}));
	};

	// Remove a section (but not the first one)
	const removeSection = (index: number) => {
		if (index === 0) return; // Prevent removing the first section
		setQuiz((prev) => ({
			...prev,
			courseSections: prev.courseSections.filter((_, i) => i !== index),
		}));
	};

	// Function to submit the quiz to OpenAI API
	const handleSubmit = async () => {
		setIsSubmitting(true); // Show overlay and disable interactions
		try {
			const res = await fetch("/api/openai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(quiz),
			});
			const generatedQuiz = await res.json();

			// Save quiz data in localStorage
			localStorage.setItem("quizData", JSON.stringify(generatedQuiz));

			// Navigate to the quiz page
			router.push("/quiz");
		} finally {
			setIsSubmitting(false); // Hide overlay after request completion
		}
	};

	return (
		<div className="p-6 max-w-2xl mx-auto relative">
			<h1 className="text-2xl font-bold">Generate a New Quiz</h1>

			{/* Quiz Title */}
			<label className="block text-gray-300 mt-2">
				Quiz Title
				<input
					type="text"
					placeholder="Quiz Title"
					value={quiz.quizTitle}
					onChange={(e) => handleInputChange("quizTitle", e.target.value)}
					className="block mt-2 p-2 border rounded w-full"
				/>
			</label>

			{/* Quiz Audience */}
			<label className="block text-gray-300 mt-2">
				Target Audience Description
				<input
					type="text"
					placeholder="Target Audience"
					value={quiz.quizAudience}
					onChange={(e) => handleInputChange("quizAudience", e.target.value)}
					className="block mt-2 p-2 border rounded w-full"
				/>
			</label>

			{/* Quiz Difficulty */}
			<label className="block text-gray-300 mt-2">
				Quiz Difficulty
				<select
					value={quiz.quizDifficulty}
					onChange={(e) => handleInputChange("quizDifficulty", e.target.value)}
					className="block mt-2 p-2 border rounded w-full"
				>
					<option value="simple">Simple</option>
					<option value="challenging">Challenging</option>
					<option value="balanced mix of simple and challenging">Balanced Mix</option>
				</select>
			</label>

			{/* Answer Type */}
			<label className="block text-gray-300 mt-2">
				Number of Answers
				<select
					value={quiz.multipleOrSingleAnswers}
					onChange={(e) => handleInputChange("multipleOrSingleAnswers", e.target.value)}
					className="block mt-2 p-2 border rounded w-full"
				>
					<option value="single">Single Answer</option>
					<option value="multiple">Multiple Answers</option>
				</select>
			</label>

			{/* Sections */}
			<div className="mt-4">
				<h2 className="text-xl font-semibold">Sections</h2>
				{quiz.courseSections.map((section, index) => (
					<div key={index} className="mt-4 p-4 border-2 border-white rounded-lg bg-black text-white">
						<h3 className="text-lg font-medium">Section {index + 1}</h3>

						{/* Section Title */}
						<label className="block text-gray-300 mt-2">
							Section Title
							<input
								type="text"
								placeholder="Section Title"
								value={section.sectionTitle}
								onChange={(e) => handleSectionChange(index, "sectionTitle", e.target.value)}
								className="block mt-1 p-2 border rounded w-full bg-gray-800 text-white"
							/>
						</label>

						{/* Number of Questions */}
						<label className="block text-gray-300 mt-2">
							Number of Questions
							<input
								type="number"
								min="1"
								placeholder="Number of Questions"
								value={section.numberOfQuestionsInSection}
								onChange={(e) => handleSectionChange(index, "numberOfQuestionsInSection", Number(e.target.value))}
								className="block mt-1 p-2 border rounded w-full bg-gray-800 text-white"
							/>
						</label>

						{/* Section Content */}
						<label className="block text-gray-300 mt-2">
							Section Content
							<textarea
								placeholder="Section Content"
								value={section.sectionContent}
								onChange={(e) => handleSectionChange(index, "sectionContent", e.target.value)}
								className="block mt-1 p-2 border rounded w-full h-24 bg-gray-800 text-white"
							/>
						</label>

						{/* Remove Section Button (Only for Additional Sections) */}
						{index > 0 && (
							<button
								onClick={() => removeSection(index)}
								className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
							>
								Remove Section
							</button>
						)}
					</div>
				))}

				{/* Add New Section Button */}
				<button onClick={addNewSection} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
					Add New Section
				</button>
			</div>

			{/* Generate Quiz Button */}
			<button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
				Generate Quiz
			</button>

			{/* Overlay with Spinner and Text (Shown During Submission) */}
			{isSubmitting && (
				<div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
					<div className="border-4 border-gray-200 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
					<p className="mt-4 text-white text-lg font-semibold">{loadingMessage}</p>
				</div>
			)}
		</div>
	);
}
