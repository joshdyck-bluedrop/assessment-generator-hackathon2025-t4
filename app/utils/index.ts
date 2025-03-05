const availableVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash"]; // 🎙️ Available voices for random selection

export const playTextToSpeech = async (text: string, randomizeVoice = false, audience: string) => {
    try {
        // Step 1: Modify Text using OpenAI Completion API
        const completionResponse = await fetch("/api/modify-text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, audience }),
        });

        if (!completionResponse.ok) throw new Error("Failed to modify text");

        const { modifiedText } = await completionResponse.json(); // Get the modified text

        // Step 2: Generate Speech from the Modified Text
        const selectedVoice = randomizeVoice
            ? availableVoices[Math.floor(Math.random() * availableVoices.length)] // ✅ Pick a random voice if required
            : "coral"; // Default voice for non-randomized speech

        const ttsResponse = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: modifiedText, voice: selectedVoice }), // ✅ Send modified text
        });

        if (!ttsResponse.ok) throw new Error("TTS API failed");

        const audioBlob = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error("Error playing TTS:", error);
    }
};
