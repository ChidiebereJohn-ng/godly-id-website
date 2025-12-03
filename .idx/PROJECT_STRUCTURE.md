# Godly.id - Cloudflare + Firebase Project Structure

This document outlines the hybrid file structure for the Godly.id project.

**Hosting:** Cloudflare Pages (Static Frontend)
**Backend:** Firebase (Firestore, Auth, Functions, Storage)

godly-id-project/
├── firebase-functions/            # Firebase Cloud Functions (Backend Logic)
│   ├── index.js                   # Main functions file (e.g., setAdminClaim)
│   ├── package.json               # Node.js dependencies for functions
│   └── .gitignore                 # Ignores node_modules for functions
│
├── public/                        # Static site hosted on Cloudflare
│   ├── index.html                 # Homepage
│   ├── accept-jesus.html          # Accept Jesus Page
│   ├── courses.html               # All Courses Page
│   ├── resources.html             # Resources Page
│   ├── prayer-wall.html           # Community Prayer Wall
│   ├── contact.html               # Contact Page
│   │
│   ├── login.html                 # Login/Signup Page
│   ├── my-account.html            # Student Dashboard (Shows enrolled courses)
│   ├── lms.html                   # The Course Player
│   ├── admin.html                 # Admin CMS for course management
│   ├── admin-analysis.html        # Admin Analytics
│   │
│   ├── js/
│   │   ├── firebase-config.js     # Firebase API Keys
│   │   ├── auth.js                # Global Login/Logout/Auth State Logic
│   │   ├── my-account.js          # Logic for the student dashboard
│   │   ├── admin.js               # Admin course upload logic
│   │   ├── admin-analysis.js      # Student tracking logic for admin
│   │   ├── lms.js                 # Course player logic
│   │   └── certificate-generator.js # Logic to create course certificates
│   │
│   └── assets/
│       └── LOGO.jpg               # Main site logo
│
├── firebase.json                  # Main Firebase project configuration
├── firestore.rules                # Firestore database security rules
├── storage.rules                  # Firebase Storage security rules
└── .gitignore                     # Main project gitignore
