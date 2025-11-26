Godly.id - Firebase Project Plan (LMS + Analytics + Certificates)

This is the master plan for upgrading the static website to a dynamic platform with a full LMS, Student Analytics, and Auto-Certificates.

Phase 1: Project Setup & Configuration

[ ] Initialize Firebase (firebase init).

[ ] Enable Authentication & Firestore.

[ ] Enable Storage (for holding the generated certificates).

[ ] Create public/js/firebase-config.js.

Phase 2: Authentication (User Logins)

[ ] Create public/js/auth.js (Sign Up, Login, Sign Out).

[ ] Create public/my-account.html (Student Dashboard).

Phase 3: The Admin Panel (Course Creator CMS)

[ ] Create public/admin.html.

[ ] Security: Lock to Admin ID only.

[ ] Course Form: Add Course & Lesson upload logic.

Phase 4: Public Pages (Read-Only Data)

[ ] Connect courses.html, resources.html, and prayer-wall.html to Firestore.

Phase 5: Stripe Payments

[ ] Cloud Functions: createStripeCheckout and stripeWebhook.

[ ] Logic: Payment success -> Write to purchased_courses.

Phase 6: The LMS (Course Player)

[ ] Create public/lms.html.

[ ] Logic: Sidebar navigation, Video player.

[ ] Progress:

[ ] Add "Mark Complete" button.

[ ] Logic: When all lessons are complete -> Set courseStatus: "completed" in Firestore.

[ ] Trigger the "Generate Certificate" function.

Phase 7: Admin Analysis (Student Tracking)

[ ] Create public/admin-analysis.html.

[ ] Display student progress and completion stats.

Phase 8: Auto-Certificates (The Delight Feature) [NEW]

[ ] Template: Upload a designed certificate-bg.png to public/assets/.

[ ] Cloud Function: Create generateCertificate in functions/index.js.

[ ] Trigger: When courseStatus becomes "completed".

[ ] Logic: Use a library like pdf-lib or canvas to draw the User's Name and Course Name onto the template.

[ ] Save: Upload the generated PDF to Firebase Storage.

[ ] Update: Write the PDF URL to the user's certificates collection.

[ ] Frontend: Update my-account.html to show a "Download Certificate" button for completed courses.

Phase 9: Final Deployment

[ ] Backend: firebase deploy.

[ ] Frontend: Push public/ folder to GitHub.