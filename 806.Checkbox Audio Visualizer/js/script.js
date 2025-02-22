document.addEventListener("DOMContentLoaded", () => {
	const pane = new Tweakpane.Pane({
		title: "Controls",
		container: document.getElementById("tweakpane-container")
	});

	const params = {
		play: true,
		sensitivity: 255,
		frequencyMode: "full",
		bass: 0,
		treble: 0,
		rows: 16,
		theme: "light",
		volume: 1.0,
		upload: () => document.getElementById("audioFile").click()
	};

	let checkboxes = [];
	let audioContext,
		analyser,
		dataArray,
		source,
		audio,
		gainNode,
		bassFilter,
		trebleFilter;
	const container = document.getElementById("checkboxContainer");
	const defaultAudioSrc =
		document.querySelector('link[rel="preload"][as="audio"]')?.href ||
		"https://assets.codepen.io/573855/Free_Test_Data_500KB_MP3.mp3";

	// Calculate columns based on viewport width
	const calculateColumns = () => {
		const viewportWidth = window.innerWidth;
		return Math.round(
			Math.max(
				8,
				Math.min(64, ((viewportWidth - 320) / (1200 - 320)) * (64 - 8) + 8)
			)
		);
	};

	const createCheckboxGrid = () => {
		const columns = calculateColumns();
		container.innerHTML = "";
		container.style.display = "grid";
		container.style.gridTemplateColumns = `repeat(${columns}, 16px)`;
		container.style.gridTemplateRows = `repeat(${params.rows}, 16px)`;

		checkboxes = Array.from({ length: params.rows }, () =>
			Array.from({ length: columns }, () => {
				const checkbox = document.createElement("input");
				checkbox.type = "checkbox";
				container.appendChild(checkbox);
				return checkbox;
			})
		);

		applyTheme();
	};

	const initializeAudio = (fileURL) => {
		if (audio) audio.pause();

		audio = new Audio(fileURL);
		audio.crossOrigin = "anonymous";
		audio.loop = true;

		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}

		if (source) source.disconnect();
		source = audioContext.createMediaElementSource(audio);

		if (!analyser) {
			analyser = audioContext.createAnalyser();
		}

		if (!gainNode) {
			gainNode = audioContext.createGain();
		}

		// 🔥 BASS FILTER (LOW SHELF)
		if (!bassFilter) {
			bassFilter = audioContext.createBiquadFilter();
			bassFilter.type = "lowshelf";
			bassFilter.frequency.setValueAtTime(200, audioContext.currentTime); // Frequencies below 200Hz
			bassFilter.gain.value = 0; // Default no boost
		}

		// 🔥 TREBLE FILTER (HIGH SHELF)
		if (!trebleFilter) {
			trebleFilter = audioContext.createBiquadFilter();
			trebleFilter.type = "highshelf";
			trebleFilter.frequency.setValueAtTime(3000, audioContext.currentTime); // Frequencies above 3kHz
			trebleFilter.gain.value = 0; // Default no boost
		}

		gainNode.gain.value = params.volume;

		// Connect filters in sequence
		source.connect(bassFilter);
		bassFilter.connect(trebleFilter);
		trebleFilter.connect(gainNode);
		gainNode.connect(analyser);
		analyser.connect(audioContext.destination);

		params.play = true;
		pane.refresh();

		// Handle autoplay restrictions
		audio
			.play()
			.then(() => {
				console.log("Autoplay succeeded.");
			})
			.catch(() => {
				console.log("Autoplay blocked. Showing custom alert.");
				params.play = false;
				pane.refresh();
				showCustomAlert();
			});

		visualize();
	};

	const showCustomAlert = () => {
		if (document.getElementById("custom-alert")) return;

		const alertBox = document.createElement("div");
		alertBox.id = "custom-alert";
		alertBox.innerHTML = `
    <p>🔊 Autoplay was blocked by your browser.<br>Click OK to start the audio.</p>
    <button class="button" id="custom-alert-btn"><span class="text">OK</span></button>`;

		document.body.appendChild(alertBox);

		document.getElementById("custom-alert-btn").addEventListener("click", () => {
			document.body.removeChild(alertBox);
			// Resume the Audio Context (Required in Chrome)
			if (audioContext.state === "suspended") {
				audioContext.resume().then(() => {
					console.log("AudioContext resumed.");
				});
			}

			params.play = true;
			pane.refresh();
			audio.play();
		});
	};

	document.getElementById("audioFile").addEventListener("change", (event) => {
		const file = event.target.files[0];
		if (!file) return;
		initializeAudio(URL.createObjectURL(file));
	});

	const togglePlayPause = () => {
		if (!audio) return;
		params.play ? audio.play() : audio.pause();
	};

	// Update FFT size based on columns
	const updateFFTSize = (dummyData = false) => {
		if (!audioContext) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}
		if (!analyser) analyser = audioContext.createAnalyser();

		const columns = calculateColumns();

		// Dynamically calculate fftSize based on columns
		const baseFFTSize = Math.pow(2, Math.ceil(Math.log2(columns * 2)));
		analyser.fftSize = Math.min(Math.max(baseFFTSize, 32), 2048); // Clamp between 32 and 2048

		dataArray = new Uint8Array(analyser.frequencyBinCount);

		if (dummyData) {
			for (let i = 0, len = dataArray.length; i < len; i++) {
				dataArray[i] = Math.random() * 255;
			}
		}

		createCheckboxGrid();
	};

	const visualizeOld = () => {
		requestAnimationFrame(visualize);
		if (!analyser) return;

		analyser.getByteFrequencyData(dataArray);

		const columns = checkboxes[0]?.length || 0;
		let freqIndex, value, filledRows;

		for (let col = 0; col < columns; col++) {
			freqIndex = Math.floor((col * dataArray.length) / columns);
			value = dataArray[freqIndex] || 0;
			filledRows = Math.floor((value / params.sensitivity) * params.rows);

			for (let row = 0; row < params.rows; row++) {
				checkboxes[params.rows - row - 1][col].checked = row < filledRows;
			}
		}
	};

	const visualize = () => {
		requestAnimationFrame(visualize);
		if (!analyser) return;

		analyser.getByteFrequencyData(dataArray);

		const columns = checkboxes[0]?.length || 0;
		let freqIndex, value, filledRows;

		// Frequency ranges
		let startFreq = 0,
			endFreq = dataArray.length;
		if (params.frequencyMode === "bass") {
			startFreq = 0;
			endFreq = Math.floor(dataArray.length * 0.2); // 0-20% Low frequencies
		} else if (params.frequencyMode === "mid") {
			startFreq = Math.floor(dataArray.length * 0.2);
			endFreq = Math.floor(dataArray.length * 0.7); // 20-70% Mid frequencies
		} else if (params.frequencyMode === "treble") {
			startFreq = Math.floor(dataArray.length * 0.7);
			endFreq = dataArray.length; // 70-100% High frequencies
		}

		for (let col = 0; col < columns; col++) {
			freqIndex = Math.floor(startFreq + ((endFreq - startFreq) * col) / columns);
			value = dataArray[freqIndex] || 0;
			filledRows = Math.floor((value / params.sensitivity) * params.rows);

			for (let row = 0; row < params.rows; row++) {
				checkboxes[params.rows - row - 1][col].checked = row < filledRows;
			}
		}
	};

	const applyTheme = () => {
		const themeStyles = {
			light: {
				background: "#ffffff",
				checkboxColor: "#000000",
				accent: "#007bff"
			},
			dark: { background: "#222222", checkboxColor: "#ffffff", accent: "#ff5733" },
			acid: {
				background: "#ff007f",
				checkboxColor: "#00e6ff",
				accent: "#ffea00"
			},
			cyber: { background: "#001f3f", checkboxColor: "#00ffff", accent: "#ff00ff" }
		};

		const theme = themeStyles[params.theme];
		document.body.style.background = theme.background;
		document.body.style.color = theme.checkboxColor;

		const checkboxesFlat = checkboxes.flat();

		if (params.theme === "cyber") {
			document.body.style.backgroundImage = `
            radial-gradient(circle, rgba(0, 255, 255, 0.2) 10%, transparent 40%),
            repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.1) 0px, rgba(0, 255, 255, 0.1) 2px, transparent 2px, transparent 20px),
            repeating-linear-gradient(90deg, rgba(0, 255, 255, 0.1) 0px, rgba(0, 255, 255, 0.1) 2px, transparent 2px, transparent 20px)
        `;
			document.body.style.backgroundSize = "100px 100px";
		} else {
			document.body.style.backgroundImage = "";
		}

		for (let i = 0, len = checkboxesFlat.length; i < len; i++) {
			checkboxesFlat[i].style.accentColor = theme.accent;
		}
	};

	// folders
	const audioFolder = pane.addFolder({ title: "🎵 Audio Controls" });
	const visualizationFolder = pane.addFolder({
		title: "📊 Visualization Settings"
	});
	const displayFolder = pane.addFolder({ title: "🎨 Display & Theme" });

	// AUDIO CONTROLS
	audioFolder
		.addButton({ title: "Upload Audio" })
		.on("click", () => params.upload());
	audioFolder
		.addInput(params, "play", { label: "Play/Pause" })
		.on("change", () => togglePlayPause());
	audioFolder
		.addInput(params, "volume", { min: 0, max: 1, step: 0.01, label: "Volume" })
		.on("change", () => {
			if (gainNode) {
				gainNode.gain.setTargetAtTime(
					params.volume,
					audioContext.currentTime,
					0.05
				);
			}
		});
	audioFolder
		.addInput(params, "bass", { min: -20, max: 20, step: 1, label: "Bass Boost" })
		.on("change", () => {
			if (bassFilter)
				bassFilter.gain.setTargetAtTime(
					params.bass,
					audioContext.currentTime,
					0.05
				);
		});
	audioFolder
		.addInput(params, "treble", {
			min: -20,
			max: 20,
			step: 1,
			label: "Treble Boost"
		})
		.on("change", () => {
			if (trebleFilter)
				trebleFilter.gain.setTargetAtTime(
					params.treble,
					audioContext.currentTime,
					0.05
				);
		});

	// VISUALIZATION SETTINGS
	visualizationFolder.addInput(params, "sensitivity", {
		min: 0,
		max: 255,
		step: 1,
		label: "Sensitivity"
	});
	visualizationFolder
		.addInput(params, "frequencyMode", {
			label: "Visualization Range",
			options: { Full: "full", Bass: "bass", Mid: "mid", Treble: "treble" }
		})
		.on("change", () => updateFFTSize());
	visualizationFolder
		.addInput(params, "rows", { min: 4, max: 24, step: 1, label: "Row Count" })
		.on("change", () => createCheckboxGrid());

	// DISPLAY & THEME
	displayFolder
		.addInput(params, "theme", {
			label: "Theme",
			options: { Light: "light", Dark: "dark", Acid: "acid", Cyber: "cyber" }
		})
		.on("change", () => applyTheme());

	let resizeTimeout;
	window.addEventListener("resize", () => {
		if (resizeTimeout) cancelAnimationFrame(resizeTimeout);
		resizeTimeout = requestAnimationFrame(() => {
			createCheckboxGrid();
			updateFFTSize(true);
		});
	});

	updateFFTSize(true);
	initializeAudio(defaultAudioSrc);

	const isCodePen = document.referrer.includes("codepen.io");
	const hostDomains = isCodePen ? ["codepen.io"] : [];
	hostDomains.push(window.location.hostname);

	const links = document.getElementsByTagName("a");
	LR.utils.urlUtils.validateLinks(links, hostDomains);
});