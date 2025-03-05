"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface CourseSection {
	sectionTitle: string;
	numberOfQuestionsInSection: number;
	sectionContent: string;
}

const defaultValues = {
		quizTitle: "Title",
		quizAudience: "Children",
		quizDifficulty: "balanced mix of simple and challenging",
		multipleOrSingleAnswers: "single",
		courseSections: [
			{
				sectionTitle: "Moon",
				numberOfQuestionsInSection: 5,
				sectionContent:
					"The Moon is Earth's only natural satellite, orbiting at an average distance of 384399 km (238,854 mi; about 30 times Earth's diameter). It faces Earth always with the same side. This is a result of Earth's gravitational pull having synchronized the Moon's rotation period (lunar day) with its orbital period (lunar month) of 29.5 Earth days. The Moon's pull on Earth is the main driver of Earth's tides.",
			},
		],
		apiModel: 'openai',
}

export default function QuizGeneratorPage() {
	const router = useRouter();
	const [quiz, setQuiz] = useState(defaultValues || {
		quizTitle: "",
		quizAudience: "",
		quizDifficulty: "balanced mix of simple and challenging",
		multipleOrSingleAnswers: "single",
		courseSections: [{ sectionTitle: "", numberOfQuestionsInSection: 5, sectionContent: "" }],
		apiModel: 'openai',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("Generating your quiz...");

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


	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

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
		"If I had a dollar for every second this took, I’d be rich.",
		"Did the AI just fall asleep mid-calculation?",
		"This better be the best quiz of all time for the wait.",
		"At this rate, I could go write the questions myself.",
		"Oh cool, an infinite loading screen—my favorite.",
		"This is taking so long, I might start questioning reality.",
		"Are we generating a quiz or launching a spaceship?",
		"Time flies when you’re having fun. So clearly, time has stopped.",
	];

		// Start playing a witty complaint if loading takes longer than 5 seconds
		useEffect(() => {
			if (!isSubmitting) return;
	
			const timeout = setTimeout(async () => {
				const randomPhrase =
					wittyLoadingPhrases[Math.floor(Math.random() * wittyLoadingPhrases.length)];
	
				try {
					const res = await fetch("/api/complaint-generator", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ text: randomPhrase }),
					});
	
					if (!res.ok) throw new Error("Failed to fetch audio");
	
					const audioUrl = URL.createObjectURL(await res.blob());
					const newAudio = new Audio(audioUrl);
					setAudio(newAudio);
					newAudio.play();
				} catch (error) {
					console.error("TTS Error:", error);
				}
			}, 8000); // 5 seconds delay before triggering TTS
	
			return () => clearTimeout(timeout);
		}, [isSubmitting]);

	// Function to submit the quiz to OpenAI API
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true); // Show overlay and disable interactions
		try {
			console.log('here', quiz.apiModel);
			
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

			// Stop any playing TTS audio when submission completes
			if (audio) {
				audio.pause();
				audio.currentTime = 0;
			}			
		}
	};

	return (
		<form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto relative">
			<h1 className="text-2xl font-bold">Generate a New Quiz</h1>
			<br />
			<div className="flex justify-between">
				<h2 className="text-xl font-semibold">Quiz Options</h2>
				<div className="flex items-center gap-2">
					<p className="font-bold">Select AI:</p>
					<select
						value={quiz.apiModel}
						onChange={(e) => handleInputChange("apiModel", e.target.value)}
					>
						<option value="openai">Open AI</option>
						<option value="gemini">Gemini</option>
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
					<input
						required
						type="text"
						placeholder="Target Audience"
						value={quiz.quizAudience}
						onChange={(e) => handleInputChange("quizAudience", e.target.value)}
						className="block mt-2 p-2 border border-gray-500 rounded w-full"
					/>
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
						<option value="single">Single Answer</option>
						<option value="multiple">Multiple Answers</option>
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
								placeholder="Section Content"
								value={section.sectionContent}
								onChange={(e) => handleSectionChange(index, "sectionContent", e.target.value)}
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
			{isSubmitting && (
				<div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 z-50">
					<div className="border-4 border-gray-200 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
					<p className="mt-4 text-white text-lg font-semibold">{loadingMessage}</p>
				</div>
			)}
		</form>
	);
}
