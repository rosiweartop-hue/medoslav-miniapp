document.addEventListener("DOMContentLoaded", () => {

    const soundButton = document.createElement("button");
    soundButton.id = "sound-toggle";

    Object.assign(soundButton.style, {
        position: "fixed",
        top: "18px",
        right: "18px",
        width: "58px",
        height: "58px",
        border: "3px solid rgba(255,255,255,0.8)",
        borderRadius: "50%",
        background: "#5d8f28",
        fontSize: "28px",
        cursor: "pointer",
        zIndex: "9999",
        boxShadow: "0 4px 12px rgba(0,0,0,0.30)",
        padding: "0",
        margin: "0"
    });

    const storedSound =
        String(localStorage.getItem("medoslavSound")).toLowerCase();

    let soundOn = ![
        "off",
        "false",
        "0",
        "muted"
    ].includes(storedSound);

    const pagePath = location.pathname.toLowerCase();

    const isColoringPage =
        /\/coloring\/[^/]+_(simple|detailed)\.html$/.test(pagePath);

    const musicSource = isColoringPage
        ? "/test/sounds/mixkit-close-your-eyes-now-1022.mp3"
        : "/test/sounds/mixkit-my-little-star-1037.mp3";

    const musicTimeKey = isColoringPage
        ? "medoslavColoringMusicTime"
        : "medoslavMainMusicTime";

    const backgroundMusic = new Audio(musicSource);

    backgroundMusic.loop = true;
    backgroundMusic.preload = "auto";

    backgroundMusic.volume =
        isColoringPage ? 0.16 : 0.11;

    let welcomeWaiting =
        !!document.getElementById("welcomeGate") &&
        sessionStorage.getItem("medoslavWelcomeShown") !== "yes";

    function updateButton() {
        soundButton.textContent =
            soundOn ? "🔊" : "🔇";

        soundButton.title =
            soundOn
                ? "Выключить звук"
                : "Включить звук";
    }

    function playTone(frequency = 520) {
        if (!soundOn) return;

        try {
            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            const audioCtx =
                new AudioContext();

            const oscillator =
                audioCtx.createOscillator();

            const gain =
                audioCtx.createGain();

            oscillator.connect(gain);
            gain.connect(audioCtx.destination);

            oscillator.frequency.value =
                frequency;

            oscillator.type = "sine";

            gain.gain.setValueAtTime(
                0.08,
                audioCtx.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioCtx.currentTime + 0.25
            );

            oscillator.start();

            oscillator.stop(
                audioCtx.currentTime + 0.25
            );

        } catch (e) {}
    }

    function saveMusicTime() {

        if (
            !Number.isFinite(backgroundMusic.currentTime)
        ) return;

        sessionStorage.setItem(
            musicTimeKey,
            String(backgroundMusic.currentTime)
        );
    }

    backgroundMusic.addEventListener(
        "loadedmetadata",
        () => {

            const saved =
                Number(
                    sessionStorage.getItem(
                        musicTimeKey
                    )
                );

            if (
                Number.isFinite(saved) &&
                saved > 0 &&
                saved < backgroundMusic.duration
            ) {
                backgroundMusic.currentTime =
                    saved;
            }
        }
    );

    function startMusic() {

        if (!soundOn) return;
        if (welcomeWaiting) return;

        if (!backgroundMusic.paused)
            return;

        backgroundMusic
            .play()
            .catch(() => {});
    }

    function stopMusic() {

        saveMusicTime();

        try {
            backgroundMusic.pause();
        } catch (e) {}
    }

    soundButton.addEventListener(
        "click",
        () => {

            soundOn = !soundOn;

            localStorage.setItem(
                "medoslavSound",
                soundOn ? "on" : "off"
            );

            updateButton();

            if (soundOn) {

                playTone(620);
                startMusic();

            } else {

                stopMusic();
            }
        }
    );

    /*
       После приветствия Медослава
       запускаем основную музыку.
    */
    window.addEventListener(
        "medoslavWelcomeFinished",
        () => {

            welcomeWaiting = false;
            startMusic();
        }
    );

    /*
       На мобильных браузер может
       потребовать первое касание.
    */
    document.addEventListener(
        "pointerdown",
        () => {
            startMusic();
        },
        {passive:true}
    );

    document.addEventListener(
        "keydown",
        () => {
            startMusic();
        }
    );

    window.addEventListener(
        "pagehide",
        saveMusicTime
    );

    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {
                saveMusicTime();
            }
        }
    );

    document.body.appendChild(
        soundButton
    );

    window.medoSoundOn =
        () => soundOn;

    window.medoPlayTone =
        playTone;

    window.medoBackgroundMusic =
        backgroundMusic;

    updateButton();

    /*
       Пытаемся продолжить музыку
       сразу при переходе между страницами.
    */
    setTimeout(
        startMusic,
        250
    );
});
