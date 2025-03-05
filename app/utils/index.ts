// Function to fetch and play TTS from the API
const availableVoices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash"]; // 🎙️ Available voices for random selection

export const playTextToSpeech = async (text: string, randomizeVoice = false) => {
    try {
        const selectedVoice = randomizeVoice
            ? availableVoices[Math.floor(Math.random() * availableVoices.length)] // ✅ Pick a random voice if required
            : "coral"; // Default voice for non-randomized speech

        const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice: selectedVoice }), // ✅ Send selected voice
        });

        if (!response.ok) throw new Error("TTS API failed");

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    } catch (error) {
        console.error("Error playing TTS:", error);
    }
};
