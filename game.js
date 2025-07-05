const typeIcons = {
    pikachu: '⚡',
    squirtle: '💧',
    bulbasaur: '🌱',
    charmander: '🔥',
    eevee: '⭐',
    jigglypuff: '🎤'
};

let found = {};
let foundCount = 0;

function typeClue(text, el) {
    el.textContent = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, 30);
        }
    }
    type();
}

function launchConfetti() {
    if (window.confetti) {
        window.confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 }
        });
    }
}

function playCatchSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = 880;
        o.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.15);
    } catch {}
}

window.toggleTheme = function() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
};
window.addEventListener('DOMContentLoaded', function() {
    if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
});

function updateProgress() {
    const bar = document.getElementById('progressBar');
    const label = document.getElementById('progressLabel');
    bar.style.width = `${(foundCount/huntPoints.length)*100}%`;
    label.textContent = `${foundCount}/${huntPoints.length} Pokémon found`;
}

function showPokemon(point, marker) {
    typeClue(point.clue, document.getElementById('clue'));
    document.getElementById('typeIcon').textContent = typeIcons[point.pokemon] || '';
    const badge = document.getElementById('caughtBadge');
    if (!found[point.pokemon]) {
        found[point.pokemon] = true;
        foundCount++;
        badge.style.display = 'inline-block';
        launchConfetti();
        playCatchSound();
        updateProgress();
    } else {
        badge.style.display = 'none';
    }
}
