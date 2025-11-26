// public/js/admin-analysis.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  doc,
  getDoc,
  collectionGroup 
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(window.firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const accessDenied = document.getElementById('access-denied');
const dashboardContent = document.getElementById('dashboard-content');
const loadingScreen = document.getElementById('loading-screen');
const logoutBtn = document.getElementById('admin-logout');

// Metric Elements
const totalUsersEl = document.getElementById('total-users');
const totalEnrollmentsEl = document.getElementById('total-enrollments');
const totalRevenueEl = document.getElementById('total-revenue');
const usersTableBody = document.getElementById('users-table-body');
const enrollmentsTableBody = document.getElementById('enrollments-table-body');

// 1. Auth Check
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().role === 'admin') {
        loadingScreen.classList.add('hidden');
        dashboardContent.classList.remove('hidden');
        loadAnalytics();
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

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => window.location.href = 'index.html');
    });
}

// 2. Load Analytics Logic
async function loadAnalytics() {
    try {
        // A. Fetch Users (All)
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(query(usersRef, orderBy("createdAt", "desc")));
        const totalUsers = usersSnap.size;
        
        totalUsersEl.textContent = totalUsers;

        // Populate Recent Users Table
        let userTableHTML = "";
        let count = 0;
        usersSnap.forEach(doc => {
            if (count < 5) { // Show top 5 recent
                const u = doc.data();
                const date = u.createdAt ? new Date(u.createdAt.toDate()).toLocaleDateString() : "N/A";
                userTableHTML += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${u.displayName || 'No Name'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${u.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${date}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${u.role || 'student'}</td>
                    </tr>
                `;
                count++;
            }
        });
        usersTableBody.innerHTML = userTableHTML;


        // B. Fetch Enrollments (Using Collection Group Query)
        // Note: Requires a Firestore index on "enrolledCourses" collection group for "enrolledAt" if we order by it.
        // For simplicity/robustness without explicit index creation step in prompt, we fetch all and sort client side if small.
        const enrollmentsRef = collectionGroup(db, "enrolledCourses");
        const enrollmentsSnap = await getDocs(enrollmentsRef);
        
        const totalEnrollments = enrollmentsSnap.size;
        totalEnrollmentsEl.textContent = totalEnrollments;

        // Mock Revenue Calculation (Assuming average $30 per course for demo purposes)
        // In real app, you'd sum up actual transaction logs or store price in enrollment doc
        const revenue = totalEnrollments * 29.99; 
        totalRevenueEl.textContent = `$${revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Populate Enrollments Table (Student Progress)
        let enrollTableHTML = "";
        let encount = 0;
        
        // Map enrollments to an array to sort/slice
        const enrollmentList = [];
        enrollmentsSnap.forEach(doc => {
            // We need parent user data to show WHO enrolled. 
            // doc.ref.parent.parent.id gives the UID.
            // Getting user details for every row is expensive (N+1 reads).
            // For Phase 7 MVP, we'll display User ID or fetch just a few.
            
            const data = doc.data();
            enrollmentList.push({
                uid: doc.ref.parent.parent.id,
                ...data
            });
        });

        // Limit to recent 10 for display
        const recentEnrollments = enrollmentList.slice(0, 10); // Just taking first 10 for MVP

        for (const enr of recentEnrollments) {
            // Optional: Fetch user name (can be slow if many rows)
            // const userDoc = await getDoc(doc(db, "users", enr.uid));
            // const userName = userDoc.exists() ? userDoc.data().displayName : "Unknown";
            const userName = enr.uid.substring(0, 8) + "..."; // Truncate UID for speed

            const statusColor = enr.progress === 100 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";
            
            enrollTableHTML += `
                 <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${userName}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${enr.courseTitle}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div class="flex items-center">
                            <span class="mr-2">${enr.progress}%</span>
                            <div class="w-24 bg-gray-200 rounded-full h-2">
                                <div class="bg-brand-yellow h-2 rounded-full" style="width: ${enr.progress}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                            ${enr.progress === 100 ? 'Completed' : 'In Progress'}
                        </span>
                    </td>
                </tr>
            `;
        }

        if(recentEnrollments.length === 0) {
             enrollTableHTML = `<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">No enrollments found.</td></tr>`;
        }

        enrollmentsTableBody.innerHTML = enrollTableHTML;

    } catch (error) {
        console.error("Analytics Error:", error);
    }
}
