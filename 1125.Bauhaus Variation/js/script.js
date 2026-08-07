(function() {
    const COLORS = ['#ffce3d', '#f2464c', '#0071e3', '#f578a2', '#24263a', '#265953', '#e67e22'];
    const animClasses = {
        'g-b': 'anim-b',
        'g-a1': 'anim-a1',
        'g-u1': 'anim-u1',
        'g-h': 'anim-h',
        'g-a2': 'anim-a2',
        'g-u2': 'anim-u2',
        'g-s': 'anim-s'
    };
    const letterIds = ['b', 'a1', 'u1', 'h', 'a2', 'u2', 's'];
    const groupIds = ['g-b', 'g-a1', 'g-u1', 'g-h', 'g-a2', 'g-u2', 'g-s'];
    let currentColors = {};

    function shuffleColors() {
        const shuffled = [...COLORS];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    function startWave() {
        groupIds.forEach(id => {
            const group = document.getElementById(id);
            if (group) {
                group.classList.add('steady')
            }
        });
        void document.body.offsetHeight;
        const shuffled = shuffleColors();
        letterIds.forEach((id, index) => {
            const path = document.getElementById(id);
            if (path) {
                const oldColor = currentColors[id] || '#000000';
                const newColor = shuffled[index % shuffled.length];
                currentColors[id] = newColor;
                path.style.setProperty('--color-start', oldColor);
                path.style.setProperty('--color-end', newColor);
                path.style.setProperty('--color-current', oldColor)
            }
        });
        groupIds.forEach((id) => {
            const group = document.getElementById(id);
            if (group) {
                group.classList.remove('steady');
                setTimeout(() => {
                    group.classList.add(animClasses[id])
                }, 10)
            }
        });
        setTimeout(() => {
            groupIds.forEach(id => {
                const group = document.getElementById(id);
                if (group) {
                    group.classList.remove('anim-b', 'anim-a1', 'anim-u1', 'anim-h', 'anim-a2', 'anim-u2', 'anim-s');
                    group.classList.add('steady')
                }
            });
            letterIds.forEach((id) => {
                const path = document.getElementById(id);
                if (path) {
                    const newColor = currentColors[id] || '#000000';
                    path.style.setProperty('--color-current', newColor);
                    path.style.setProperty('--color-start', newColor);
                    path.style.setProperty('--color-end', newColor)
                }
            })
        }, 3000)
    }
    const initColors = shuffleColors();
    letterIds.forEach((id, index) => {
        const path = document.getElementById(id);
        if (path) {
            const color = initColors[index % initColors.length];
            currentColors[id] = color;
            path.style.setProperty('--color-current', color);
            path.style.setProperty('--color-start', color);
            path.style.setProperty('--color-end', color)
        }
    });
    setTimeout(startWave, 2000);
    setInterval(startWave, 5000);
    
})()