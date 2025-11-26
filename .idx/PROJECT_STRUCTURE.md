Godly.id - Cloudflare + Firebase Project Structure

This document outlines the hybrid file structure for the Godly.id project.

Hosting: Cloudflare Pages (Static HTML - already set up via GitHub)

Backend: Firebase (Firestore, Auth, Functions)

godly-id-project/
├── public/                    # CURRENTLY HOSTED ON CLOUDFLARE
│   ├── index.html             # Homepage
│   ├── accept-jesus.html      # Accept Jesus Page
│   ├── courses.html           # Courses Page
│   ├── resources.html         # Resources Page
│   ├── prayer-wall.html       # Community Prayer Wall
│   ├── contact.html           # Contact Page
│   │
│   ├── my-account.html        # Student Dashboard (Download Certs here)
│   ├── lms.html               # The Course Player
│   ├── admin.html             # Admin CMS
│   ├── admin-analysis.html    # Admin Analytics
│   │
│   ├── js/
│   │   ├── firebase-config.js # Firebase API Keys
│   │   ├── auth.js            # Login/Logout Logic
│   │   ├── app.js             # Main App Logic
│   │   ├── admin.js           # Course Upload Logic
│   │   ├── admin-analysis.js  # Student Tracking Logic
│   │   └── lms.js             # Course Player Logic
│   │
│   └── assets/
│       ├── LOGO.jpg           # Main site logo
│       └── certificate-bg.png # NEW: Blank certificate background image
│
├── functions/                 # FIREBASE CLOUD FUNCTIONS
│   ├── index.js               # Main Backend Logic
│   ├── utils/
│   │   └── generateCertificate.js # NEW: Logic to draw name on PDF
│   ├── package.json
│   └── node_modules/
│
├── firestore.rules            # Database Security Rules
└── firebase.json              # Firebase Configuration
