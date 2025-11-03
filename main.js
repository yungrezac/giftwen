
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

    const floatingImagesContainer = document.getElementById('floating-images-container');

    // --- State ---
    let participants = [];
    let winners = [];

    // --- NEW FLOATING IMAGES LOGIC ---
    function createFloatingImages() {
        const imageUrl = 'https://ltdfoto.ru/images/2025/11/04/10738.png';
        const imageCount = 15; // Number of floating images

        for (let i = 0; i < imageCount; i++) {
            const img = document.createElement('div');
            img.className = 'floating-image';
            img.style.backgroundImage = `url(${imageUrl})`;

            const size = Math.random() * 150 + 50; // Random size between 50px and 200px
            img.style.width = `${size}px`;
            img.style.height = `${size}px`;

            // Random initial position
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight;
            img.style.left = `${startX}px`;
            img.style.top = `${startY}px`;

            // Random end position for the animation
            const endX = (Math.random() - 0.5) * 2 * window.innerWidth;
            const endY = (Math.random() - 0.5) * 2 * window.innerHeight;
            img.style.setProperty('--end-x', endX);
            img.style.setProperty('--end-y', endY);

            // Random animation duration and delay
            const duration = Math.random() * 20 + 15; // 15s to 35s
            const delay = Math.random() * -35; // Start at different points in the animation cycle
            img.style.animationDuration = `${duration}s`;
            img.style.animationDelay = `${delay}s`;

            floatingImagesContainer.appendChild(img);
        }
    }

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

        runGiveawayRound(1, [...participants], 'Санечка');
    }

    function runGiveawayRound(roundNumber, currentParticipants, predeterminedWinner) {
        spinnerTitle.textContent = `Выбираем победителя #${roundNumber}`;

        runSlotMachine(currentParticipants, predeterminedWinner, (winner) => {
            winners.push(winner);
            const remainingParticipants = currentParticipants.filter(p => p !== winner);

            if (roundNumber === 1) {
                setTimeout(() => {
                    runGiveawayRound(2, remainingParticipants, 'Шоколадик');
                }, 1000);
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

        resetGiveawayBtn.classList.add('hidden');

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
        resetGiveawayBtn.classList.remove('hidden');
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
    createFloatingImages(); // Initialize the new background effect
});
