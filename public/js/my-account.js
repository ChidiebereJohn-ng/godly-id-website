// public/js/my-account.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { generateAndDownloadCertificate } from './certificate-generator.js';

// Initialize Firebase from the global config
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Elements
const enrolledCoursesContainer = document.getElementById('enrolled-courses-container');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const welcomeMessage = document.getElementById('welcome-message');

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in.
        window.currentUser = user; // Make user info available for certificate generation
        welcomeMessage.textContent = `Welcome back, ${user.displayName || user.email}!`;
        fetchEnrolledCourses(user.uid);
    } else {
        // User is signed out.
        window.location.href = 'login.html';
    }
});

async function fetchEnrolledCourses(userId) {
    try {
        const enrolledCoursesRef = collection(db, "users", userId, "enrolledCourses");
        const q = query(enrolledCoursesRef, orderBy("enrolledAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            loadingState.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        let coursesHTML = '';
        querySnapshot.forEach(doc => {
            const course = doc.data();
            const progress = course.progress || 0;
            const isCompleted = course.status === 'completed' || progress === 100;

            // Use single quotes for JS strings and double quotes for HTML attributes
            const safeTitle = course.courseTitle.replace(/'/g, "\\'");
            const date = new Date().toLocaleDateString();

            coursesHTML += `
                <div class="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                    <div class="p-6">
                        <h3 class="text-xl font-bold font-serif text-gray-800 mb-2">${course.courseTitle}</h3>
                        <p class="text-sm text-gray-500 mb-4">Enrolled on: ${new Date(course.enrolledAt.seconds * 1000).toLocaleDateString()}</p>
                        
                        <div class="mb-2">
                            <div class="flex justify-between mb-1">
                                <span class="text-xs font-medium text-gray-500">Progress</span>
                                <span class="text-xs font-medium text-gray-500">${progress}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
                            </div>
                        </div>
                        
                        ${isCompleted 
                            ? `<button onclick="window.downloadCert('${safeTitle}', '${date}')" class="inline-block mt-4 bg-green-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                                Download Certificate
                               </button>`
                            : `<a href="lms.html?courseId=${course.courseId}" class="inline-block mt-4 bg-blue-600 text-white font-bold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Go to Course
                               </a>`
                        }
                    </div>
                </div>
            `;
        });

        enrolledCoursesContainer.innerHTML = coursesHTML;
        loadingState.classList.add('hidden');
        enrolledCoursesContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        loadingState.textContent = 'Error loading your courses. Please try again.';
    }
}

// Make the download function available globally
window.downloadCert = (courseTitle, date) => {
    const user = window.currentUser;
    if (user) {
        generateAndDownloadCertificate(user.displayName, courseTitle, date);
    } else {
        alert('You must be logged in to download a certificate.');
    }
};
