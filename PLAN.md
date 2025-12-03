# Godly.id Project Plan

This document outlines the development plan for the Godly.id project, a hybrid Cloudflare (frontend) and Firebase (backend) application.

---

### Phase 1: Foundational Setup & Admin CMS (Complete)

- [x] **Frontend:** Develop initial static pages (`index`, `courses`, `admin`, etc.).
- [x] **Backend:** Set up Firebase project (Auth, Firestore, Storage).
- [x] **Admin:** Implement a basic CMS on `admin.html` to upload course content.
- [x] **Security:** Secure Firestore so only admins can write to the `courses` collection.

---

### Phase 2: Core User Functionality (Complete)

- [x] **Backend:** Implement a Cloud Function with custom claims to grant admin roles for storage access.
- [x] **Security:** Update Storage Rules to allow only admins to upload thumbnails.
- [x] **Frontend:** Fix the `courses.html` page to correctly fetch and display published courses from Firestore.
- [x] **Frontend:** Implement the course enrollment logic on the `courses.html` page.
- [x] **Frontend:** Create a functional `my-account.html` page to display a user's enrolled courses.
- [x] **Frontend:** Add a "Download Certificate" button on `my-account.html` for completed courses.
- [x] **UX:** Unify the header and navigation across all pages for a consistent auth state.

---

### Phase 3: Ministry & Engagement Features (Complete)

- [x] **Homepage:** Enhance `index.html` with a full navigation bar, new content sections, and a comprehensive footer.
- [x] **Feature:** Implement the "I Have Decided" commitment form on `accept-jesus.html`.
- [x] **Backend:** Create a new `commitments` collection in Firestore to store user decisions for Christ.

---

### Phase 4: Next Steps & Refinements

- [ ] **Feature:** Build an admin view to see the list of `commitments`.
- [ ] **Resources:** Make the "Download our free Bible App" and "Download Tracts" buttons on `resources.html` functional.
- [ ] **Deployment:** Replace the Tailwind CSS CDN with a production-ready PostCSS build step for better performance.
