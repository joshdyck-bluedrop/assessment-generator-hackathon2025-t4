"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import {playTextToSpeech} from "../utils";

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
		apiModel: "openai",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("Generating your quiz...");
	const [isGenerating, setIsGenerating] = useState(false);

	// List of rotating loading messages
	const loadingPhrases = [
		"Determining the specs...",
		"Running the numbers...",
		"Doing hard things...",
		"Consulting the AI overlords...",
		"Shuffling the question deck...",
		"Optimizing brain puzzles...",
		"Thinking really hard...",
		"Configuring quantum brainwaves...",
		"Asking the internet for help...",
		"Compiling quiz wisdom...",
		"Rearranging the electrons...",
		"Double-checking our math...",
		"Debugging reality...",
		"Spinning up the brain engines...",
		"Generating answers in 4D space...",
		"Bribing the AI with extra RAM...",
		"Fetching facts from the void...",
		"Untangling knowledge spaghetti...",
		"Pouring a fresh batch of questions...",
		"Letting the AI sip some coffee...",
		"Loading, but stylishly...",
		"Unlocking the secrets of the universe...",
		"Consulting the book of wisdom...",
		"Checking for rogue electrons...",
		"Refactoring the laws of physics...",
		"Quantum entangling your quiz...",
		"Training the AI on deep trivia...",
		"Booting up the neural pathways...",
		"Filtering out useless knowledge...",
		"Preparing for intellectual greatness...",
		"Sharpening virtual pencils...",
		"Translating brainwaves into questions...",
		"Assembling question molecules...",
		"Harmonizing quiz energy fields...",
		"Adjusting quiz difficulty sliders...",
		"Generating ultra-hard bonus rounds...",
		"Defying entropy to produce a quiz...",
		"Building the ultimate test of wisdom...",
		"Deciphering the meaning of knowledge...",
		"Infusing questions with just the right challenge...",
		"Reversing entropy to optimize results...",
		"Aligning quiz particles for perfect clarity...",
		"Summoning all the smart neurons...",
		"Giving the AI a pep talk...",
		"Extracting knowledge from the aether...",
		"Scanning the universe for quiz material...",
		"Testing quiz gravity resistance...",
		"Simulating 1000 possible quiz outcomes...",
		"Consulting the algorithmic sages...",
		"Infusing questions with extra wit...",
		"Constructing knowledge wormholes...",
		"Converting caffeine into quiz power...",
		"Spinning up the learning gyroscope...",
		"Pulling questions from a black hole...",
		"Debugging human curiosity...",
		"Making sure no question is too easy...",
		"Tuning the quiz-o-matic machine...",
		"Waiting for the AI to finish thinking...",
		"Compressing brainpower into a quiz...",
		"Passing the Turing Test... hopefully...",
		"Computing the optimal level of confusion...",
		"Syncing with the collective wisdom of humanity...",
		"Mapping out the perfect curve of difficulty...",
		"Scouring the multiverse for the best questions...",
		"Letting the AI flex its trivia muscles...",
		"Injecting just the right amount of challenge...",
		"Consulting the great quiz archives...",
		"Making sure no question is *too* impossible...",
		"Upgrading to Ultra Quiz Mode...",
		"Simulating thousands of potential quiz takers...",
		"Doing some last-minute calculations...",
		"Ensuring this is the ultimate quiz experience...",
		"Asking the AI to double-check its answers...",
		"Crunching some extra data for good measure...",
		"Balancing the difficulty curve...",
		"Conjuring up the best possible quiz...",
		"Refining the quiz to perfection...",
		"Giving the AI a moment to think...",
		"Running a quick IQ calibration...",
		"Running stress tests on the quiz difficulty...",
		"Ensuring peak question quality...",
		"Downloading quiz knowledge from the cloud...",
		"Finding the sweet spot between fun and frustration...",
		"Bringing the quiz to life...",
		"Mixing intelligence with creativity...",
		"Simulating 10,000 quiz runs...",
		"Setting up a digital quiz duel...",
		"Generating a quiz fit for the ages...",
		"Leveling up the AI's trivia skills...",
		"Making sure no answers are *too* obvious...",
		"Finalizing the last tweaks...",
		"Putting the finishing touches on your quiz...",
		"Finalizing calculations...",
		"Running final sanity checks...",
		"Just a little more quiz magic...",
	];

	// Cycle through loading messages every 2 seconds
	useEffect(() => {
		if (!isSubmitting) return;

		const interval = setInterval(() => {
			const randomIndex = Math.floor(Math.random() * loadingPhrases.length);
			setLoadingMessage(loadingPhrases[randomIndex]);
		}, 2000);

		return () => clearInterval(interval);
	}, [isSubmitting]);

	// Function to handle input changes
	const handleInputChange = (field: string, value: string | number) => {
		setQuiz((prev) => ({
			...prev,
			[field]: value,
		}));

		// Save quizAudience to localStorage when it changes
		if (field === "quizAudience") {
			localStorage.setItem("quizAudience", value as string);
		}
	};

	const handleSectionBlur = (index: number, content: string) => {
		// Ensure sectionContent is not empty before sending request
		if (!content.trim()) return;
	
		// Store section content in state
		handleSectionChange(index, "sectionContent", content);
	
		fetch("/api/image-gen", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userInput: content }),
		})
			.then((response) => {
				if (!response.ok) throw new Error("Failed to generate image");
				return response.json();
			})
			.then(({ imageUrl }) => {
				if (imageUrl) {
					// Save the image URL in localStorage for persistence
					localStorage.setItem(`quiz_section_${index}_image`, imageUrl);
				}
			})
			.catch((error) => console.error("Error generating image:", error));
	};

	// Function to handle section input changes
	const handleSectionChange = (index: number, field: keyof CourseSection, value: string | number) => {
		const updatedSections: any = [...quiz.courseSections];
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

	// Start playing a witty complaint if loading takes longer than 5 seconds
	useEffect(() => {
		if (!isSubmitting) return;

		const randomNumber = Math.floor(Math.random() * (12000 - 8000 + 1)) + 8000;
		const roundedNumber = Math.round(randomNumber / 1000) * 1000;
		// List of witty slow-loading messages
		const wittyLoadingPhrases = [
			"Wow, that’s sure taking a month of Tuesdays to load...",
			"I could've baked a cake by now. And eaten it too.",
			"Is it just me, or did I age a little waiting for this?",
			"I think the AI went on a coffee break... without me.",
			"I’ve seen glaciers move faster than this.",
			"Did we accidentally ask it to solve world peace too?",
			"Pretty sure my internet is fine, so what’s the holdup?",
			"At this rate, I might actually have time to learn the subject myself.",
			"Did we just time-travel back to dial-up speeds?",
			"Wow, I didn’t realize generating a quiz required a quantum computer.",
			"Let me guess—it's buffering my patience away.",
			"Should I be worried? Did the AI ghost us?",
			"Maybe if I stare at it harder, it’ll go faster.",
			"Alright, who unplugged the AI’s brain?",
			"I swear I saw a snail overtake this loading bar.",
			"Just tell me straight, do I need to refresh?",
			"Don’t mind me, just watching paint dry while I wait.",
			`If I had a dollar for every second this took, I’d... have ${roundedNumber/1000} dollars. Worth it? Nah.`,
			"Did the AI just fall asleep mid-calculation?",
			"This better be the best quiz of all time for the wait.",
			"At this rate, I could go write the questions myself.",
			"Oh cool, an infinite loading screen—my favorite.",
			"This is taking so long, I might start questioning reality.",
			"Are we generating a quiz or launching a spaceship? T minus eternity and counting...",
			"Time flies when you’re having fun. So clearly, time has stopped.",
		];

		const timeout = setTimeout(async () => {

			const randomPhrase =
				wittyLoadingPhrases[Math.floor(Math.random() * wittyLoadingPhrases.length)];

			const audience = localStorage.getItem("quizAudience") || "default";
			playTextToSpeech(randomPhrase, true, audience);
		}, randomNumber); // randomized delay before complaint fires

		return () => clearTimeout(timeout);
	}, [isSubmitting]);

	// ** CSV UPLOAD HANDLER **
	const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Read the file
		const reader = new FileReader();
		reader.onload = (e) => {
			if (!e.target?.result) return;
			const csvText = e.target.result.toString();

			// Parse CSV using PapaParse
			Papa.parse(csvText, {
				header: false,
				skipEmptyLines: true,
				complete: (results: any) => {
					const data: string[][] = results.data as string[][];

					if (data.length < 5) {
						alert("Invalid CSV format: The first five rows must contain quiz metadata.");
						return;
					}

					const quizTitle = data[0][0] || "";
					const quizAudience = data[1][0] || "";
					const quizDifficulty = data[2][0] || "";
					const multipleOrSingleAnswers = data[3][0] || "";
					const apiModel = data[4][0] || "openai";

					// Parse sections (starting from the 6th row)
					const parsedSections = data.slice(5).map(([sectionTitle, sectionContent, questionCount]) => {
						if (isNaN(Number(questionCount))) {
							alert(`Invalid number of questions: "${questionCount}" is not a number.`);
							return null;
						}

						return {
							sectionTitle,
							numberOfQuestionsInSection: Number(questionCount),
							sectionContent,
						};
					}).filter(Boolean) as CourseSection[];
					
					localStorage.setItem("quizAudience", quizAudience as string);

					// Update state
					setQuiz({
						quizTitle,
						quizAudience,
						quizDifficulty,
						multipleOrSingleAnswers,
						apiModel,
						courseSections: parsedSections,
					});
				},
			});
		};

		reader.readAsText(file);
	};

	// **Handles Image Generation for Each Section (Staggered Requests)**
	const generateImagesForSections = () => {
		quiz.courseSections.forEach((section, index) => {
			setTimeout(() => {
				fetch("/api/image-gen", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ userInput: section.sectionContent }),
				})
					.then((response) => {
						if (!response.ok) throw new Error("Failed to generate image");
						return response.json();
					})
					.then(({ imageUrl }) => {
						if (imageUrl) {
							localStorage.setItem(`quiz_section_${index}_image`, imageUrl);
						}
					})
					.catch((error) => console.error(`Error generating image for section ${index}:`, error));
			}, index * 500); // Stagger requests by 500ms per section
		});
	};

	// **Handles Quiz Submission**
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true); // Show overlay and disable interactions

		// Start generating images in parallel (won't block quiz submission)
		generateImagesForSections();

		try {
			const res = await fetch(`/api/${quiz.apiModel}`, {
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
	
		// 🧠 **Fetch AI-Generated Quiz Content (Fill the form, but don't submit)**
		const generateQuizContent = async () => {
			setIsGenerating(true);
			try {
				const response = await fetch("/api/generate-quiz-content", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(quiz), // Send existing quiz details
				});

				if (!response.ok) throw new Error("Failed to generate quiz content");

				const jsonresponse = await response.json();

				const parsedData = JSON.parse(jsonresponse);

				localStorage.setItem("quizAudience", parsedData.quizAudience as string);

				// 📝 Fill in the form with AI-generated content
				setQuiz((prev) => ({
					...prev,
					quizTitle: parsedData.quizTitle || prev.quizTitle,
					quizAudience: parsedData.quizAudience || prev.quizAudience,
					courseSections: parsedData.courseSections || prev.courseSections,
				}));
			} catch (error) {
				console.error("Error generating quiz:", error);
			} finally {
				setIsGenerating(false);
			}
		};
		

	return (
		<form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto relative">
			<h1 className="text-2xl font-bold">Generate a New Quiz</h1>
			<br />

			<button 
				type="button"
				className="mt-4 bg-blue-500 mb-10 text-white px-4 py-2 rounded hover:bg-blue-600 w-full text-2xl"
				disabled={isGenerating}
				onClick={generateQuizContent}
			>
				{isGenerating ? "Generating Quiz Content..." : "🧠 Use AI to Generate Quiz Content"}
			</button>

			{/* CSV Upload with Floating Example */}
			<div className="relative group inline-block">
				<label className="block mb-4">
					<span className="text-white font-semibold">Upload CSV:</span>
					<input
						type="file"
						accept=".csv"
						onChange={handleCSVUpload}
						className="block mt-2 p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"
					/>
				</label>

				{/* Floating Dialog with Example CSV & Dark Drop Shadow */}
				<div className="absolute left-0 top-full mt-2 w-[600px] bg-gray-900 text-white border border-white rounded-lg shadow-lg shadow-black p-4 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50">
					<h2 className="text-xl font-semibold mb-2">Expected CSV Format:</h2>
					<table className="w-full border border-gray-600 text-left">
						<thead>
							<tr className="bg-gray-800">
								<th className="border border-gray-600 p-2">Row</th>
								<th className="border border-gray-600 p-2">Purpose</th>
								<th className="border border-gray-600 p-2">Example</th>
							</tr>
						</thead>
						<tbody>
							<tr className="bg-gray-900">
								<td className="border border-gray-600 p-2">1</td>
								<td className="border border-gray-600 p-2">Quiz Title</td>
								<td className="border border-gray-600 p-2">"The Ultimate Trivia Challenge"</td>
							</tr>
							<tr className="bg-gray-800">
								<td className="border border-gray-600 p-2">2</td>
								<td className="border border-gray-600 p-2">Target Audience</td>
								<td className="border border-gray-600 p-2">"Aussie Bloke"</td>
							</tr>
							<tr className="bg-gray-900">
								<td className="border border-gray-600 p-2">3</td>
								<td className="border border-gray-600 p-2">Quiz Difficulty</td>
								<td className="border border-gray-600 p-2">"Challenging"</td>
							</tr>
							<tr className="bg-gray-800">
								<td className="border border-gray-600 p-2">4</td>
								<td className="border border-gray-600 p-2">Number of Answers</td>
								<td className="border border-gray-600 p-2">"Single"</td>
							</tr>
							<tr className="bg-gray-900">
								<td className="border border-gray-600 p-2">5</td>
								<td className="border border-gray-600 p-2">AI Model</td>
								<td className="border border-gray-600 p-2">"openai"</td>
							</tr>
							<tr className="bg-gray-800">
								<td className="border border-gray-600 p-2">6+</td>
								<td className="border border-gray-600 p-2">Quiz Section Titles Go in This Column</td>
								<td className="border border-gray-600 p-2">"Space Exploration, How astronauts train, 5"</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div className="flex justify-between">
				<h2 className="text-xl font-semibold">Quiz Options</h2>
				<div className="flex items-center gap-2">
					<p className="font-bold">Select&nbsp;AI:</p>
					<select
						value={quiz.apiModel}
						onChange={(e) => handleInputChange("apiModel", e.target.value)}
						className="block p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"
					>
						<option value="openai">Open AI</option>
						<option value="gemini">Gemini</option>
						<option value="claude">Claude</option>
					</select>
				</div>
			</div>

			<div className="bg-gray-900 p-4 border border-gray-500 rounded-lg mt-4">
				{/* Quiz Title */}
				<label className="block text-gray-300 mt-2">
					Quiz Title
					<input
						required
						type="text"
						placeholder="Quiz Title"
						value={quiz.quizTitle}
						onChange={(e) => handleInputChange("quizTitle", e.target.value)}
						className="block mt-2 p-2 border border-gray-500 rounded w-full"
					/>
				</label>

				{/* Quiz Audience */}
				<label className="block text-gray-300 mt-2">
					Target Audience Description
					<select
						required
						value={quiz.quizAudience}
						onChange={(e) => handleInputChange("quizAudience", e.target.value)}
						className="block mt-2 p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"
					>
						<option value="" disabled>Select an audience</option>
						<option value="Toddler">Toddler</option>
						<option value="Aussie Bloke">Aussie Bloke</option>
						<option value="Newfoundlander Bayman">Newfoundlander Bayman</option>
						<option value="Surfer Dude">Surfer Dude</option>
						<option value="French Aristocrat">French Aristocrat</option>
						<option value="Astro-Physicist">Astro-Physicist</option>
					</select>
				</label>
				{/* Quiz Difficulty */}
				<label className="block text-gray-300 mt-2">
					Quiz Difficulty
					<select
						value={quiz.quizDifficulty}
						onChange={(e) => handleInputChange("quizDifficulty", e.target.value)}
						className="block mt-2 p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"
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
						className="block mt-2 p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"					>
						<option value="single">Single Answers Only</option>
						<option value="multiple">Allow Multiple Answers</option>
					</select>
				</label>
			</div>

			{/* Sections */}
			<div className="mt-4">
				<h2 className="text-xl font-semibold">Sections</h2>
				{quiz.courseSections.map((section, index) => (
					<div key={index} className="mt-4 p-4 border border-gray-500 bg-gray-900 rounded-lg text-white">
						<h3 className="text-lg font-medium">Section {index + 1}</h3>

						{/* Section Title */}
						<label className="block text-gray-300 mt-2">
							Section Title
							<input
								required
								type="text"
								placeholder="Section Title"
								value={section.sectionTitle}
								onChange={(e) => handleSectionChange(index, "sectionTitle", e.target.value)}
								className="block mt-1 p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"
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
								className="block mt-1 p-2 border border-gray-500 rounded w-full bg-gray-800 text-white"
							/>
						</label>

						{/* Section Content */}
						<label className="block text-gray-300 mt-2">
							Section Content
							<textarea
								required
								placeholder="Section Content"
								value={section.sectionContent}
								onChange={(e) => handleSectionChange(index, "sectionContent", e.target.value)}
								onBlur={(e) => handleSectionBlur(index, e.target.value)}
								className="block mt-1 p-2 border border-gray-500 rounded w-full h-24 bg-gray-800 text-white"
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
					＋ Add Section
				</button>
			</div>

			<br />
			<br />

			{/* Generate Quiz Button */}
			<button type="submit" className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
				Generate Quiz
			</button>

			{/* Overlay with Spinner and Text (Shown During Submission) */}
			{(isSubmitting || isGenerating) && (
				<div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
					<div className="border-4 border-gray-200 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
					<p className="mt-4 text-white text-lg font-semibold">{loadingMessage}</p>
				</div>
			)}
		</form>
	);
}
