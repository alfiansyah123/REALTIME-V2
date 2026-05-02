/**
 * Guaranteed Google Voice utility.
 * Uses a direct Google TTS endpoint for the exact "Google Cewek" sound.
 */

export const speakMessage = (message) => {
    try {
        // Encode message for the URL
        const encodedMsg = encodeURIComponent(message);

        // Use the Google Translate TTS endpoint (client=tw-ob is the trick for consistent access)
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedMsg}&tl=id&client=tw-ob`;

        const audio = new Audio(ttsUrl);

        console.log('%c[Voice] Playing Google Voice API...', 'color: #10b981; font-weight: bold');

        audio.play().catch(e => {
            console.error('[Voice] Google TTS failed, falling back to browser speech:', e);
            // Fallback to browser SpeechSynthesis if the URL fails or is blocked
            fallbackSpeech(message);
        });
    } catch (err) {
        console.error('[Voice] Error creating Audio:', err);
        fallbackSpeech(message);
    }
};

const fallbackSpeech = (message) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'id-ID';
    utterance.pitch = 1.2;
    window.speechSynthesis.speak(utterance);
};
