// public/js/lms.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { generateAndDownloadCertificate } from './certificate-generator.js';

// Initialize Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// State
let currentCourseId = null;
let currentCourseData = null;
let currentEnrollmentData = null;
let activeLessonIndex = 0;
let currentUser = null;

// UI Elements
const courseTitleHeader = document.getElementById('course-title-header');
const lessonsList = document.getElementById('lessons-list');
const videoPlayer = document.getElementById('video-player');
const videoPlaceholder = document.getElementById('video-placeholder');
const lessonTitle = document.getElementById('lesson-title');
const lessonContent = document.getElementById('lesson-content');
const markCompleteBtn = document.getElementById('mark-complete-btn');
const btnIcon = document.getElementById('btn-icon');
const btnText = document.getElementById('btn-text');
const prevBtn = document.getElementById('prev-lesson');
const nextBtn = document.getElementById('next-lesson');
const progressText = document.getElementById('progress-text');
const sidebar = document.getElementById('sidebar');

// Helper: Extract Video ID from YouTube URL
function getYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 1. Auth & Initialization
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Get Course ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        currentCourseId = urlParams.get('courseId');

        if (!currentCourseId) {
            alert("No course specified.");
            window.location.href = 'my-account.html';
            return;
        }

        await loadCourseData(user.uid, currentCourseId);
    } else {
        window.location.href = 'index.html';
    }
});

// 2. Load Data
async function loadCourseData(uid, courseId) {
    try {
        // A. Fetch Course Content (Lessons)
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        
        if (!courseSnap.exists()) {
            alert("Course not found.");
            window.location.href = 'my-account.html';
            return;
        }
        currentCourseData = courseSnap.data();

        // B. Fetch User Progress
        const enrollmentRef = doc(db, "users", uid, "enrolledCourses", courseId);
        const enrollmentSnap = await getDoc(enrollmentRef);

        if (!enrollmentSnap.exists()) {
            alert("You are not enrolled in this course.");
            window.location.href = 'courses.html';
            return;
        }
        currentEnrollmentData = enrollmentSnap.data();

        // C. Initialize UI
        renderSidebar();

        // AUTO-RESUME LOGIC
        // 1. Check if there's a specifically saved 'lastWatchedLesson'
        if (currentEnrollmentData.lastWatchedLesson !== undefined) {
             activeLessonIndex = currentEnrollmentData.lastWatchedLesson;
        } 
        // 2. Else, find the first incomplete lesson
        else if (currentEnrollmentData.completedLessons && currentEnrollmentData.completedLessons.length > 0) {
            const totalLessons = currentCourseData.lessons.length;
            const completedSet = new Set(currentEnrollmentData.completedLessons);
            
            // Loop to find first index NOT in completedSet
            let firstIncomplete = 0;
            for(let i=0; i < totalLessons; i++) {
                if(!completedSet.has(i.toString())) {
                    firstIncomplete = i;
                    break;
                }
            }
            // If all are complete, stay at 0 or go to last
            activeLessonIndex = firstIncomplete;
        }

        loadLesson(activeLessonIndex);
        updateProgressUI();

    } catch (error) {
        console.error("Error loading LMS:", error);
    }
}

// 3. Render Sidebar
function renderSidebar() {
    courseTitleHeader.textContent = currentCourseData.title;
    lessonsList.innerHTML = '';

    const completedSet = new Set(currentEnrollmentData.completedLessons || []);

    currentCourseData.lessons.forEach((lesson, index) => {
        const isCompleted = completedSet.has(index.toString()); // Use index as ID for simplicity
        
        const div = document.createElement('div');
        div.className = `p-3 rounded cursor-pointer flex items-center gap-3 transition hover:bg-gray-100 ${index === activeLessonIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`;
        div.onclick = () => {
             loadLesson(index);
             saveLastWatched(index); // Save position on manual click
        };

        div.innerHTML = `
            <div class="flex-shrink-0">
                ${isCompleted 
                    ? `<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`
                    : `<div class="w-5 h-5 border-2 border-gray-300 rounded-full"></div>`
                }
            </div>
            <div class="text-sm font-medium ${index === activeLessonIndex ? 'text-blue-700' : 'text-gray-700'}">
                ${lesson.title}
            </div>
        `;
        lessonsList.appendChild(div);
    });
}

// 4. Load Lesson
function loadLesson(index) {
    activeLessonIndex = index;
    const lesson = currentCourseData.lessons[index];

    // Update Video
    const videoId = getYoutubeId(lesson.videoUrl);
    if (videoId) {
        videoPlayer.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
        videoPlayer.classList.remove('hidden');
        videoPlaceholder.classList.add('hidden');
    } else {
        videoPlayer.classList.add('hidden');
        videoPlaceholder.classList.remove('hidden');
    }

    // Update Text
    lessonTitle.textContent = lesson.title;
    lessonContent.innerHTML = lesson.textContent || "<p class='text-gray-500 italic'>No notes available for this lesson.</p>";

    // Update Navigation Buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === currentCourseData.lessons.length - 1;

    // Sidebar Highlight Update
    renderSidebar(); 

    // Completion Button State
    const completedSet = new Set(currentEnrollmentData.completedLessons || []);
    const isCompleted = completedSet.has(index.toString());
    
    if (isCompleted) {
        markCompleteBtn.classList.add('bg-green-100', 'text-green-700');
        markCompleteBtn.classList.remove('bg-gray-200', 'text-gray-500');
        btnIcon.className = "w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white";
        btnIcon.innerHTML = `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`;
        btnText.textContent = "Completed";
    } else {
        markCompleteBtn.classList.remove('bg-green-100', 'text-green-700');
        markCompleteBtn.classList.add('bg-gray-200', 'text-gray-500');
        btnIcon.className = "w-5 h-5 border-2 border-gray-400 rounded-full";
        btnIcon.innerHTML = "";
        btnText.textContent = "Mark Complete";
    }

    // Mobile: Close sidebar on selection
    if(window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
    }
}

// New: Save Last Watched Lesson
async function saveLastWatched(index) {
    try {
        const user = auth.currentUser;
        if(!user || !currentCourseId) return;

        const enrollmentRef = doc(db, "users", user.uid, "enrolledCourses", currentCourseId);
        await updateDoc(enrollmentRef, {
            lastWatchedLesson: index,
            lastAccessed: serverTimestamp()
        });
        
        // Update local state so if we reload, we know where we are
        currentEnrollmentData.lastWatchedLesson = index;
    } catch (e) {
        console.log("Error saving position", e);
    }
}

// 5. Mark Complete Logic
markCompleteBtn.addEventListener('click', async () => {
    const completedSet = new Set(currentEnrollmentData.completedLessons || []);
    const lessonId = activeLessonIndex.toString();

    if (completedSet.has(lessonId)) return; // Already done

    // Optimistic UI Update
    markCompleteBtn.classList.add('bg-green-100', 'text-green-700');
    btnText.textContent = "Completed";
    
    try {
        const user = auth.currentUser;
        const enrollmentRef = doc(db, "users", user.uid, "enrolledCourses", currentCourseId);

        // Update Firestore
        await updateDoc(enrollmentRef, {
            completedLessons: arrayUnion(lessonId),
            lastAccessed: serverTimestamp()
        });

        // Update Local State
        if (!currentEnrollmentData.completedLessons) currentEnrollmentData.completedLessons = [];
        currentEnrollmentData.completedLessons.push(lessonId);
        
        renderSidebar(); // Update checkmarks
        updateProgressUI(); // Update percentage

        // Check for Course Completion
        if (currentEnrollmentData.completedLessons.length === currentCourseData.lessons.length) {
            handleCourseCompletion();
        } else {
            // Auto-advance logic (optional)
             if (activeLessonIndex < currentCourseData.lessons.length - 1) {
                 // Maybe show a toast "Lesson Completed! Next lesson unlocking..."
             }
        }

    } catch (error) {
        console.error("Error marking complete:", error);
        alert("Failed to update progress.");
    }
});

// 6. Navigation Handlers
prevBtn.addEventListener('click', () => {
    if (activeLessonIndex > 0) {
        const newIndex = activeLessonIndex - 1;
        loadLesson(newIndex);
        saveLastWatched(newIndex);
    }
});

nextBtn.addEventListener('click', () => {
    if (activeLessonIndex < currentCourseData.lessons.length - 1) {
        const newIndex = activeLessonIndex + 1;
        loadLesson(newIndex);
        saveLastWatched(newIndex);
    }
});

// 7. Progress UI
function updateProgressUI() {
    const total = currentCourseData.lessons.length;
    const completed = (currentEnrollmentData.completedLessons || []).length;
    const percent = Math.round((completed / total) * 100);

    progressText.textContent = `${percent}% Completed`;
    // Update SVG Ring (Stroke Dashoffset)
    // C = 2 * pi * r = 100 approx for dasharray 100
    // Offset = 100 - percent
    // Note: My SVG setup in HTML uses simple dasharray logic. 
    // stroke-dasharray="percent, 100" works for simple circular progress
    
    document.getElementById('progress-ring').setAttribute("stroke-dasharray", `${percent}, 100`);
}

// 8. Course Completion
async function handleCourseCompletion() {
    // 1. Update status in Firestore
    const user = auth.currentUser;
    const enrollmentRef = doc(db, "users", user.uid, "enrolledCourses", currentCourseId);
    
    await updateDoc(enrollmentRef, {
        progress: 100,
        status: 'completed',
        completedAt: serverTimestamp()
    });

    // 2. Show Modal
    document.getElementById('cert-course-name').textContent = currentCourseData.title;
    document.getElementById('cert-modal').classList.remove('hidden');

    // 3. Setup client-side download button in modal
    // We add a button dynamically or update existing one
    const modalContent = document.getElementById('cert-modal').querySelector('.bg-white');
    
    // Check if we already added a download button
    if (!document.getElementById('btn-download-now')) {
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'btn-download-now';
        downloadBtn.className = "w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-green-700 transition mb-3";
        downloadBtn.innerText = "Download Certificate Now";
        downloadBtn.onclick = () => {
            const name = currentUser.displayName || "Student";
            const title = currentCourseData.title;
            const date = new Date().toLocaleDateString();
            generateAndDownloadCertificate(name, title, date);
        };
        
        // Insert before "Go to Dashboard"
        const dashboardBtn = modalContent.querySelector('button[onclick*="my-account"]');
        dashboardBtn.parentNode.insertBefore(downloadBtn, dashboardBtn);
    }
}


// Mobile Sidebar Toggles
document.getElementById('open-sidebar').addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
});
document.getElementById('close-sidebar').addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
});
