document.addEventListener('DOMContentLoaded', () => {
	const toggleInput = document.querySelector('.toggle input');
	const rootElement = document.documentElement;

	const applyTheme = (isDark) => {
		if (isDark) {
			rootElement.classList.add('dark');
		} else {
			rootElement.classList.remove('dark');
		}
	};

	const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	toggleInput.checked = prefersDark;
	applyTheme(prefersDark);

	toggleInput.addEventListener('input', (event) => {
		const isDark = toggleInput.checked;

		let x = window.innerWidth / 2;
		let y = window.innerHeight / 2;
		
		const toggleElement = document.querySelector('.toggle');
		
		if (toggleElement) {
			const rect = toggleElement.getBoundingClientRect();
			x = rect.left + rect.width / 2;
			y = rect.top + rect.height / 2;
		}

		if (!document.startViewTransition) {
			console.warn("View Transition API not supported. Falling back.");
			applyTheme(isDark);
			return;
		}

		const transition = document.startViewTransition(() => {
			applyTheme(isDark);
		});

		transition.ready.then(() => {
			rootElement.style.setProperty('--x', `${x}px`);
			rootElement.style.setProperty('--y', `${y}px`);
		}).catch(error => {
			console.error("Error during View Transition setup:", error);
		});

		transition.finished.then(() => {
			console.log("Transition finished."); // Debug log
		}).catch(error => {
			console.error("Error during View Transition finish:", error);
		});

	});

});