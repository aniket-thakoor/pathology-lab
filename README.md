🧪 Clinical-Grade Pathology Lab App
Tagline: “From patient intake to audit-safe PDF — all in one offline-first PWA.”

🔍 Overview
A modular, offline-capable installable Progressive Web App (PWA) designed for pathology labs to manage patient records, assign and record test results, and generate semantically precise PDF reports. Built with React, Vite, Chakra UI, and IndexedDB, it offers a seamless experience across devices — even offline — all with clinical-grade precision.

💡Key Highlights
| Feature Area           | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| 🧑‍⚕️ Patient Management | Add, search, resume, and update patient records                              |
| 🧪 Test Workflow        | Assign test groups, enter results, configure master data                    |
| 📊 Reporting            | View summary, generate PDF, download/share                                  |
| 💾 Data Persistence     | IndexedDB + Dexie for offline-first storage and backup/restore              |
| 🎨 UI/UX Architecture   | Chakra UI, modular layout, semantic spacing, signature widget               |


🧠 Core Capabilities
👤 Patient Lifecycle Management
PatientEntry.jsx: Add new patients with demographic and visit details

RecentPatients.jsx: Search, resume, or update patient records — even if previously incomplete
Resume workflows for test selection, result entry, or report generation

🧪 Test Workflow
SelectTestGroups.jsx: Assign test groups to patients

TestResultsEntry.jsx: Enter and validate test results with semantic clarity

TestMaster.jsx: Configure test groups, subgroups, parameters, units, and reference ranges

📊 Summary & Reporting
SummaryReport.jsx: View consolidated test results with classification and grouping

PDF generation via pdfExport.js using pdfMake — includes headers, footers, semantic markers, and signature

Download or share reports directly from the app

💾 Data Persistence & Recovery
IndexedDB via Dexie for offline-first storage

dbService.js: Abstracted access layer for CRUD operations

BackupRestore.jsx: Export/import full database for backup or migration

FirstTimeSetupGuard: Ensures clean onboarding and setup

🎨 UI/UX Architecture
Chakra UI for responsive, accessible design

Page-aware navigation with PageHeader and consistent footers

Signature widget for authenticated reports

Modular layout with semantic spacing and audit-safe rendering

🧑‍💻 Developer Notes
This app reflects a deep commitment to maintainability, semantic correctness, and clinical usability. It’s designed to be extensible for future modules like billing, analytics, or HL7/FHIR integration.

👨‍💻 Author
Aniket Thakoor Clinical UI/UX Architect | PDF Layout Strategist | Modular Design Advocate This repository showcases my approach to solving real-world reporting challenges with elegance, precision, and maintainability.

📄 License
This project is licensed under the Apache License 2.0.

⚠️ Commercial usage rights are exclusively granted to [Lab Name], the original intended beneficiary of this software. For collaboration or licensing inquiries, please contact me directly.

🚀 Getting Started
To run locally:

bash
npm install
npm run dev

📬 Contact
For hiring, collaboration, or licensing inquiries: 📧 aniket.thakoor10@gmail.com 🔗 https://www.linkedin.com/in/aniket-thakoor-531803161/
