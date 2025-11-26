// public/js/admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  doc, 
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

// Initialize Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// DOM Elements
const adminContent = document.getElementById('admin-content');
const accessDenied = document.getElementById('access-denied');
const loadingScreen = document.getElementById('loading-screen');
const courseForm = document.getElementById('course-form');
const logoutBtn = document.getElementById('admin-logout');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('btn-submit-course');
const cancelEditBtn = document.getElementById('btn-cancel-edit');
const courseIdInput = document.getElementById('course-id');

// Tabs & Views
const tabCreate = document.getElementById('tab-create');
const tabManage = document.getElementById('tab-manage');
const viewCreate = document.getElementById('view-create');
const viewManage = document.getElementById('view-manage');
const coursesList = document.getElementById('courses-list');

// Quill Editors Storage
let quillInstances = [];

// --- Check Admin Status ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === 'admin') {
        loadingScreen.classList.add('hidden');
        adminContent.classList.remove('hidden');
        // Initial setup
        addLessonField(); 
      } else {
        loadingScreen.classList.add('hidden');
        accessDenied.classList.remove('hidden');
      }
    } catch (error) {
      console.error("Error verifying admin:", error);
      alert("Error verifying permissions.");
    }
  } else {
    window.location.href = 'login.html';
  }
});

// --- Tab Switching Logic ---
tabCreate.addEventListener('click', () => {
    switchTab('create');
});

tabManage.addEventListener('click', () => {
    switchTab('manage');
    loadCoursesList();
});

function switchTab(tab) {
    if (tab === 'create') {
        viewCreate.classList.remove('hidden');
        viewManage.classList.add('hidden');
        tabCreate.classList.add('border-b-2', 'border-brand-yellow', 'bg-white');
        tabCreate.classList.remove('text-gray-500');
        tabManage.classList.remove('border-b-2', 'border-brand-yellow', 'bg-white');
        tabManage.classList.add('text-gray-500');
    } else {
        viewCreate.classList.add('hidden');
        viewManage.classList.remove('hidden');
        tabManage.classList.add('border-b-2', 'border-brand-yellow', 'bg-white');
        tabManage.classList.remove('text-gray-500');
        tabCreate.classList.remove('border-b-2', 'border-brand-yellow', 'bg-white');
        tabCreate.classList.add('text-gray-500');
    }
}

// --- Form Handling (Create & Update) ---
if (courseForm) {
  courseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
      const id = courseIdInput.value;
      const title = document.getElementById('course-title').value;
      const description = document.getElementById('course-desc').value;
      const category = document.getElementById('course-category').value;
      const price = parseFloat(document.getElementById('course-price').value);
      const thumbnailFile = document.getElementById('course-thumbnail').files[0];
      const existingThumbnail = document.getElementById('existing-thumbnail').value;

      // Collect Lessons
      const lessonElements = document.querySelectorAll('.lesson-entry');
      const lessons = [];
      
      lessonElements.forEach((el, index) => {
        const lessonTitle = el.querySelector('.lesson-title').value;
        const lessonUrl = el.querySelector('.lesson-url').value;
        // Get content from Quill editor
        const quill = quillInstances[index]; 
        const lessonText = quill.root.innerHTML;

        if(lessonTitle && lessonUrl) {
            lessons.push({
                order: index + 1,
                title: lessonTitle,
                videoUrl: lessonUrl,
                textContent: lessonText || ""
            });
        }
      });

      // Handle Image Upload
      let thumbnailUrl = existingThumbnail;
      if (thumbnailFile) {
        const storageRef = ref(storage, `course_thumbnails/${Date.now()}_${thumbnailFile.name}`);
        const snapshot = await uploadBytes(storageRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(snapshot.ref);
      }

      const courseData = {
        title,
        description,
        category,
        price,
        thumbnailUrl,
        lessons,
        published: true,
        updatedAt: serverTimestamp()
      };

      if (!id) {
         // Create New
         courseData.createdAt = serverTimestamp();
         await addDoc(collection(db, "courses"), courseData);
         alert("Course created successfully!");
      } else {
         // Update Existing
         await setDoc(doc(db, "courses", id), courseData, { merge: true });
         alert("Course updated successfully!");
      }

      resetForm();

    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save: " + error.message);
    } finally {
      submitBtn.innerText = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

// --- Dynamic Lesson Fields with Quill ---
const addLessonBtn = document.getElementById('add-lesson-btn');
const lessonsContainer = document.getElementById('lessons-container');

function addLessonField(data = null) {
  const lessonCount = lessonsContainer.children.length + 1;
  const div = document.createElement('div');
  div.className = "lesson-entry bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4";
  
  const titleVal = data ? data.title : "";
  const urlVal = data ? data.videoUrl : "";
  const textVal = data ? data.textContent : "";

  div.innerHTML = `
    <div class="flex justify-between items-center mb-2">
        <span class="font-bold text-gray-500 text-sm">Lesson ${lessonCount}</span>
        <button type="button" class="text-red-500 text-xs hover:underline remove-lesson">Remove</button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">Lesson Title</label>
            <input type="text" class="lesson-title w-full px-3 py-2 border rounded" value="${titleVal}" required>
        </div>
        <div>
            <label class="block text-xs font-bold text-gray-700 mb-1">YouTube URL</label>
            <input type="url" class="lesson-url w-full px-3 py-2 border rounded" value="${urlVal}" required>
        </div>
    </div>
    <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">Lesson Content</label>
        <!-- Container for Quill -->
        <div class="bg-white">
            <div class="quill-editor" style="height: 150px;">${textVal}</div>
        </div>
    </div>
  `;
  
  lessonsContainer.appendChild(div);

  // Initialize Quill for this specific instance
  const editorEl = div.querySelector('.quill-editor');
  const quill = new Quill(editorEl, {
    theme: 'snow',
    modules: {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'clean']
        ]
    }
  });
  quillInstances.push(quill);

  // Remove Handler
  div.querySelector('.remove-lesson').addEventListener('click', function() {
      // Find index to remove from quillInstances array
      const idx = Array.from(lessonsContainer.children).indexOf(div);
      if (idx > -1) {
          quillInstances.splice(idx, 1);
      }
      div.remove();
      updateLessonNumbers();
  });
}

function updateLessonNumbers() {
    const lessons = lessonsContainer.querySelectorAll('.lesson-entry');
    lessons.forEach((el, index) => {
        el.querySelector('span').innerText = `Lesson ${index + 1}`;
    });
}

if(addLessonBtn) {
    addLessonBtn.addEventListener('click', () => addLessonField());
}

// --- Manage Courses Logic ---
async function loadCoursesList() {
    coursesList.innerHTML = '<p class="text-gray-500">Loading...</p>';
    try {
        const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            coursesList.innerHTML = '<p class="text-gray-500">No courses found.</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const c = doc.data();
            html += `
                <div class="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition">
                    <div class="flex items-center gap-4">
                        <img src="${c.thumbnailUrl || 'https://placehold.co/100x60'}" class="w-16 h-10 object-cover rounded" />
                        <div>
                            <h3 class="font-bold text-brand-dark">${c.title}</h3>
                            <p class="text-xs text-gray-500">${c.category} • $${c.price}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200" onclick="window.editCourse('${doc.id}')">Edit</button>
                        <button class="bg-red-100 text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-red-200" onclick="window.deleteCourse('${doc.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        coursesList.innerHTML = html;

    } catch (error) {
        console.error("Error loading courses:", error);
        coursesList.innerHTML = '<p class="text-red-500">Error loading courses.</p>';
    }
}

// Expose Edit/Delete to Window for onclick access
window.editCourse = async (id) => {
    try {
        const docRef = doc(db, "courses", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Switch to Create Tab
            switchTab('create');
            
            // Fill Form
            formTitle.innerText = "Edit Course";
            submitBtn.innerText = "Update Course";
            cancelEditBtn.classList.remove('hidden');
            courseIdInput.value = id;
            
            document.getElementById('course-title').value = data.title;
            document.getElementById('course-desc').value = data.description;
            document.getElementById('course-category').value = data.category;
            document.getElementById('course-price').value = data.price;
            document.getElementById('existing-thumbnail').value = data.thumbnailUrl;
            
            // Show current thumbnail
            const thumbDisplay = document.getElementById('current-thumbnail-display');
            thumbDisplay.classList.remove('hidden');
            thumbDisplay.querySelector('img').src = data.thumbnailUrl;

            // Clear existing lessons and load saved ones
            lessonsContainer.innerHTML = '';
            quillInstances = []; // Reset Quill instances
            
            if (data.lessons && data.lessons.length > 0) {
                data.lessons.forEach(lesson => {
                    addLessonField(lesson);
                });
            } else {
                addLessonField();
            }

        }
    } catch (error) {
        console.error("Error fetching course:", error);
        alert("Could not load course for editing.");
    }
};

window.deleteCourse = async (id) => {
    if(confirm("Are you sure you want to delete this course? This cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "courses", id));
            loadCoursesList(); // Refresh list
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course.");
        }
    }
};

cancelEditBtn.addEventListener('click', () => {
    resetForm();
});

function resetForm() {
    courseForm.reset();
    courseIdInput.value = "";
    document.getElementById('existing-thumbnail').value = "";
    document.getElementById('current-thumbnail-display').classList.add('hidden');
    
    formTitle.innerText = "Upload New Course";
    submitBtn.innerText = "Publish Course";
    cancelEditBtn.classList.add('hidden');
    
    lessonsContainer.innerHTML = '';
    quillInstances = [];
    addLessonField();
}

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => window.location.href = 'index.html');
    });
}
