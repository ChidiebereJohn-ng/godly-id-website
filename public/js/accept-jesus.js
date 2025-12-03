// public/js/accept-jesus.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const app = initializeApp(window.firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const decideBtn = document.getElementById('i-have-decided-btn');
    const modal = document.getElementById('commitment-modal');
    const form = document.getElementById('commitment-form');
    const formView = document.getElementById('form-view');
    const successView = document.getElementById('success-view');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    decideBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            await addDoc(collection(db, "commitments"), {
                name: nameInput.value,
                email: emailInput.value || '',
                committedAt: serverTimestamp()
            });

            formView.classList.add('hidden');
            successView.classList.remove('hidden');

        } catch (error) {
            console.error("Error writing document: ", error);
            alert('There was an error saving your commitment. Please try again.');
        }
    });
});
