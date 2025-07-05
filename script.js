const huntPoints = [
    { lat: 37.7749, lng: -122.4194, clue: "Near the Golden Gate Park", pokemon: "pikachu", description: "The iconic mascot of Pokémon!" },
    { lat: 37.7849, lng: -122.4094, clue: "Close to the waterfront", pokemon: "squirtle", description: "A water-type turtle Pokémon." },
    { lat: 37.7649, lng: -122.4294, clue: "By the city hall", pokemon: "bulbasaur", description: "A grass/poison-type with a plant bulb." },
    { lat: 37.7689, lng: -122.4144, clue: "At the Ferry Building", pokemon: "charmander", description: "A fire-type lizard Pokémon." },
    { lat: 37.7793, lng: -122.4192, clue: "Union Square surprise!", pokemon: "eevee", description: "A cute Pokémon with many evolutions." },
    { lat: 37.8000, lng: -122.4376, clue: "By the Palace of Fine Arts", pokemon: "jigglypuff", description: "A singing balloon Pokémon." }
];

const pokemonImages = {};
let mapInitialized = false;

const fallbackImages = {
    pikachu: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    squirtle: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    bulbasaur: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    charmander: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    eevee: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png',
    jigglypuff: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png'
};

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

function getHtmlRoot() {
    return document.documentElement;
}

window.addEventListener('DOMContentLoaded', function() {
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.onclick = function() {
            getHtmlRoot().classList.toggle('dark');
            localStorage.setItem('theme', getHtmlRoot().classList.contains('dark') ? 'dark' : 'light');
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.classList.add('animate-spin');
                setTimeout(()=>icon.classList.remove('animate-spin'), 500);
            }
        };
    }
    if(localStorage.getItem('theme') === 'dark') getHtmlRoot().classList.add('dark');
    else getHtmlRoot().classList.remove('dark');
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.onclick = function() {
            document.getElementById('pokemonModal').classList.add('hidden');
        };
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('pokemonModal').classList.add('hidden');
        }
    });
    document.getElementById('startHunt').onclick = function() {
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('mapContainer').classList.remove('hidden');
        setTimeout(() => {
            if (!mapInitialized) {
                initMap();
                mapInitialized = true;
            }
            if (window._leafletMap) {
                setTimeout(() => window._leafletMap.invalidateSize(), 200);
            }
            document.getElementById('map').scrollIntoView({behavior: 'auto', block: 'start'});
        }, 100);
    };
    updateProgress();
});

function initMap() {
    const map = L.map('map');
    window._leafletMap = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);
            L.circle([latitude, longitude], {radius: 80, color: '#007bff', fillOpacity: 0.2}).addTo(map);
        },
        () => {
            map.setView([37.7749, -122.4194], 13);
        }
    );
    huntPoints.forEach(point => {
        const icon = L.icon({
            iconUrl: fallbackImages[point.pokemon] || fallbackImages['pikachu'],
            iconSize: [56,56], iconAnchor: [28,56], popupAnchor: [0,-56],
            className: 'poke-marker-icon'
        });
        const marker = L.marker([point.lat, point.lng], {icon, riseOnHover:true}).addTo(map);
        marker.bindTooltip(`<b>${point.pokemon.charAt(0).toUpperCase() + point.pokemon.slice(1)}</b>`, {permanent: false, direction: 'top', className: 'poke-tooltip'});
        marker.on('click', () => showPokemon(point, marker));
    });
    setTimeout(() => map.invalidateSize(), 300);
}

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

function updateProgress() {
    const bar = document.getElementById('progressBar');
    const label = document.getElementById('progressLabel');
    bar.style.width = `${(foundCount/huntPoints.length)*100}%`;
    label.textContent = `${foundCount}/${huntPoints.length} Pokémon found`;
}

function showPokemon(point, marker) {
    const clueEl = document.getElementById('clue');
    if (clueEl) typeClue(point.clue, clueEl);
    const imgEl = document.getElementById('pokemonImage');
    if (imgEl) {
        imgEl.src = fallbackImages[point.pokemon] || fallbackImages['pikachu'];
        imgEl.classList.remove('hidden');
    }
    const nameEl = document.getElementById('pokemonName');
    if (nameEl) nameEl.textContent = point.pokemon.charAt(0).toUpperCase() + point.pokemon.slice(1);
    const typeIconEl = document.getElementById('typeIcon');
    if (typeIconEl) typeIconEl.textContent = typeIcons[point.pokemon] || '';
    const congratsEl = document.getElementById('congrats');
    if (congratsEl) congratsEl.textContent = `Congratulations! You found ${point.pokemon.charAt(0).toUpperCase() + point.pokemon.slice(1)}!`;
    const errorMsgEl = document.getElementById('errorMsg');
    if (errorMsgEl) errorMsgEl.textContent = '';
    const descEl = document.getElementById('pokemonDesc');
    if (descEl) descEl.textContent = point.description;
    const badge = document.getElementById('caughtBadge');
    if (!found[point.pokemon]) {
        found[point.pokemon] = true;
        foundCount = Object.keys(found).length;
        if (badge) badge.classList.remove('hidden');
        launchConfetti();
        playCatchSound();
    } else {
        if (badge) badge.classList.add('hidden');
    }
    updateProgress();
    const modal = document.getElementById('pokemonModal');
    if (modal) modal.classList.remove('hidden');
    if (marker && marker._icon) {
        marker._icon.classList.add('bounce');
        setTimeout(() => marker._icon.classList.remove('bounce'), 400);
    }
}
