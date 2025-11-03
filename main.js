
document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.expand();

    // --- DOM Elements ---
    const participantInput = document.getElementById('participant-input');
    const addParticipantBtn = document.getElementById('add-participant');
    const participantsList = document.getElementById('participants-list');
    const startGiveawayBtn = document.getElementById('start-giveaway');
    const resetGiveawayBtn = document.getElementById('reset-giveaway');

    const inputSection = document.getElementById('input-section');
    const spinnerSection = document.getElementById('spinner-section');
    const winnerSection = document.getElementById('winner-section');

    const spinnerTitle = document.getElementById('spinner-title');
    const spinnerNames = document.getElementById('spinner-names');
    const winnerName1Elem = document.getElementById('winner-name-1');
    const winnerName2Elem = document.getElementById('winner-name-2');

    // --- State ---
    let participants = [];
    let winners = [];

    // --- Three.js Setup ---
    let scene, camera, renderer, model;

    function init3D() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg-canvas'), alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x00aaff, 1, 100);
        pointLight.position.set(0, 3, 5);
        scene.add(pointLight);

        const geometry = new THREE.TorusKnotGeometry(1.5, 0.3, 100, 16);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x00aaff, 
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x00aaff,
            emissiveIntensity: 0.2
        });
        model = new THREE.Mesh(geometry, material);
        scene.add(model);
        
        animate();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (model) {
            model.rotation.y += 0.005;
            model.rotation.x += 0.001;
        }
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Application Logic ---

    function addParticipant() {
        const name = participantInput.value.trim();
        if (name && !participants.includes(name)) {
            participants.push(name);
            renderParticipants();
            participantInput.value = '';
            participantInput.focus();
        }
    }

    function renderParticipants() {
        participantsList.innerHTML = '';
        participants.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${p}</span><button class="delete-btn">&times;</button>`;
            li.querySelector('.delete-btn').addEventListener('click', () => removeParticipant(p));
            participantsList.appendChild(li);
        });
    }

    function removeParticipant(name) {
        participants = participants.filter(p => p !== name);
        renderParticipants();
    }

    function startFullGiveaway() {
        // --- PREDETERMINED WINNERS LOGIC ---
        // Secretly add winners to the pool if they aren't there for the animation
        if (!participants.includes('Санечка')) {
            participants.push('Санечка');
        }
        if (!participants.includes('Шоколадик')) {
            participants.push('Шоколадик');
        }
        if (participants.length < 2) {
             alert("Недостаточно участников для розыгрыша!");
             return;
        }

        winners = [];
        inputSection.classList.add('hidden');
        winnerSection.classList.add('hidden');
        spinnerSection.classList.remove('hidden');

        // Start round 1 with the first predetermined winner
        runGiveawayRound(1, [...participants], 'Санечка');
    }

    function runGiveawayRound(roundNumber, currentParticipants, predeterminedWinner) {
        spinnerTitle.textContent = `Выбираем победителя #${roundNumber}`;

        runSlotMachine(currentParticipants, predeterminedWinner, (winner) => {
            winners.push(winner);
            const remainingParticipants = currentParticipants.filter(p => p !== winner);

            if (roundNumber === 1) {
                setTimeout(() => {
                    // Start round 2 with the second predetermined winner
                    runGiveawayRound(2, remainingParticipants, 'Шоколадик');
                }, 1000); // Pause between rounds
            } else {
                setTimeout(() => {
                    showFinalWinners();
                }, 1000);
            }
        });
    }

    function runSlotMachine(currentParticipants, winner, callback) {
        const ITEM_HEIGHT = 60;
        const REEL_TURNS = 5;

        spinnerNames.style.transition = 'none';
        spinnerNames.style.transform = 'translateY(0)';
        spinnerNames.innerHTML = '';

        let reel = [];
        for(let i = 0; i < REEL_TURNS; i++) {
            reel = reel.concat(shuffleArray([...currentParticipants]));
        }
        
        let winnerIndex = reel.lastIndexOf(winner);

        // Fallback in case the winner isn't in the list for some reason
        if (winnerIndex === -1) {
            reel.push(winner);
            winnerIndex = reel.length -1;
        }

        const bufferItemCount = 2;
        const bufferItemsStart = reel.slice(reel.length - bufferItemCount).reverse();
        const bufferItemsEnd = reel.slice(0, bufferItemCount);
        const finalReel = [...bufferItemsStart, ...reel, ...bufferItemsEnd];
        winnerIndex += bufferItemCount;

        finalReel.forEach(name => {
            const div = document.createElement('div');
            div.className = 'spinner-name-item';
            div.textContent = name;
            spinnerNames.appendChild(div);
        });

        const containerHeight = spinnerNames.parentElement.clientHeight;
        const finalPosition = (winnerIndex * ITEM_HEIGHT) - (containerHeight / 2) + (ITEM_HEIGHT / 2);
        const randomOffset = (Math.random() - 0.5) * (ITEM_HEIGHT * 0.4);
        const targetY = -(finalPosition + randomOffset);

        setTimeout(() => {
            spinnerNames.style.transition = 'transform 5s cubic-bezier(0.1, 0.5, 0.2, 1)';
            spinnerNames.style.transform = `translateY(${targetY}px)`;
        }, 100);

        setTimeout(() => {
            callback(winner);
        }, 5500);
    }
    
    function showFinalWinners() {
        spinnerSection.classList.add('hidden');
        winnerSection.classList.remove('hidden');
        winnerName1Elem.textContent = winners[0] || '-';
        winnerName2Elem.textContent = winners[1] || '-';

        // --- HIDE THE RESET BUTTON ---
        resetGiveawayBtn.classList.add('hidden');

        // Confetti time!
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    function resetGiveaway() {
        winnerSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        resetGiveawayBtn.classList.remove('hidden'); // Make sure it shows up again if we ever reset
        participants = [];
        winners = [];
        renderParticipants();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // --- Event Listeners ---
    addParticipantBtn.addEventListener('click', addParticipant);
    participantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addParticipant();
    });
    startGiveawayBtn.addEventListener('click', startFullGiveaway);
    resetGiveawayBtn.addEventListener('click', resetGiveaway);

    // --- Init ---
    init3D();
});
