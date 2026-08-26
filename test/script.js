document.addEventListener("DOMContentLoaded", () => {

    const soundButton = document.createElement("button");
    soundButton.id = "sound-toggle";

    let soundOn = localStorage.getItem("medoslavSound") !== "off";

    function updateButton() {
        soundButton.textContent = soundOn ? "🔊" : "🔇";
        soundButton.title = soundOn
            ? "Выключить звук"
            : "Включить звук";
    }

    function playTone(frequency = 520) {
        if (!soundOn) return;

        try {
            const AudioContext =
                window.AudioContext || window.webkitAudioContext;

            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();

            oscillator.connect(gain);
            gain.connect(ctx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = "sine";

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                ctx.currentTime + 0.25
            );

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.25);
        } catch (e) {}
    }

    soundButton.addEventListener("click", () => {
        soundOn = !soundOn;

        localStorage.setItem(
            "medoslavSound",
            soundOn ? "on" : "off"
        );

        updateButton();

        if (soundOn) {
            playTone(620);
        }
    });

    document.body.appendChild(soundButton);

    window.medoSoundOn = () => soundOn;
    window.medoPlayTone = playTone;

    updateButton();
});
