
document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const addParticipantBtn = document.getElementById('add-participant');
    const startGiveawayBtn = document.getElementById('start-giveaway');
    const resetGiveawayBtn = document.getElementById('reset-giveaway');
    const participantInput = document.getElementById('participant-input');
    const participantsList = document.getElementById('participants-list');
    const inputSection = document.getElementById('input-section');
    const spinnerSection = document.getElementById('spinner-section');
    const winnerSection = document.getElementById('winner-section');
    const spinnerNames = document.getElementById('spinner-names');
    const winnerNames = document.getElementById('winner-names');
    const participantTemplate = document.getElementById('participant-template');

    let participants = [];

    addParticipantBtn.addEventListener('click', addParticipant);
    participantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addParticipant();
        }
    });

    function addParticipant() {
        const name = participantInput.value.trim();
        if (name) {
            participants.push(name);
            renderParticipants();
            participantInput.value = '';
            tg.HapticFeedback.impactOccurred('light');
        }
    }

    function deleteParticipant(index) {
        participants.splice(index, 1);
        renderParticipants();
        tg.HapticFeedback.impactOccurred('light');
    }

    function renderParticipants() {
        participantsList.innerHTML = '';
        participants.forEach((name, index) => {
            const participantElement = participantTemplate.content.cloneNode(true);
            participantElement.querySelector('span').textContent = name;
            const deleteBtn = participantElement.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteParticipant(index));
            participantsList.appendChild(participantElement);
        });
    }

    startGiveawayBtn.addEventListener('click', () => {
        if (participants.length < 2) {
            tg.showAlert('Пожалуйста, добавьте как минимум двух участников.');
            return;
        }

        inputSection.classList.add('hidden');
        spinnerSection.classList.remove('hidden');

        const spinnerParticipants = [...participants, 'Санечка', 'Шоколадик'];
        let spinCount = 0;
        const maxSpins = 30;
        const spinInterval = 100;

        const spinAnimation = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * spinnerParticipants.length);
            spinnerNames.textContent = spinnerParticipants[randomIndex];
            spinCount++;

            if (spinCount >= maxSpins) {
                clearInterval(spinAnimation);
                selectWinners();
            }
        }, spinInterval);
    });

    resetGiveawayBtn.addEventListener('click', () => {
        winnerSection.classList.add('hidden');
        inputSection.classList.remove('hidden');
        participants = [];
        renderParticipants();
    });

    function selectWinners() {
        const winners = ['Санечка', 'Шоколадик'];

        spinnerSection.classList.add('hidden');
        winnerSection.classList.remove('hidden');
        winnerNames.innerHTML = winners.map(winner => `
            <div class="winner-item">
                <span class="winner-icon">🚗</span>
                <span>${winner}</span>
            </div>
        `).join('');
        tg.HapticFeedback.notificationOccurred('success');
    }
});
