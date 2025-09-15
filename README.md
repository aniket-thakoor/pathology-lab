# 🧪 Clinical-Grade Pathology Lab App 
### *"From patient intake to audit-safe PDF — all in one offline-first PWA."*

## 🚀 Live Demo
Try the app here: **[Pathology Lab on GitHub Pages](https://aniket-thakoor.github.io/pathology-lab/)**  
Works on desktop & mobile — installable as a PWA for offline use.


<img width="426" height="930" alt="Screenshot 2025-09-15 110953" src="https://github.com/user-attachments/assets/183d88ab-5512-4080-b136-cef465ded024" />
<img width="426" height="930" alt="Screenshot 2025-09-15 110549" src="https://github.com/user-attachments/assets/321e2311-3af0-44f4-b4ea-0d167470ac51" />
<img width="417" height="925" alt="Screenshot 2025-09-15 111048" src="https://github.com/user-attachments/assets/77fd6b02-c8ce-4bd9-8c87-36fa462a6822" />
<img width="422" height="925" alt="Screenshot 2025-09-15 112451" src="https://github.com/user-attachments/assets/b8dcd9f4-1b23-417a-83cf-c8635bd6b052" />
<img width="681" height="963" alt="Screenshot 2025-09-15 111339" src="https://github.com/user-attachments/assets/3b6e7d34-229e-4861-a94b-494d2e68bb58" />

## 📚 Table of Contents
- [Overview](#-overview)
- [Key Highlights](#key-highlights)
- [Tech Stack](#-tech-stack)
- [Core Capabilities](#-core-capabilities)
- [Test Workflow](#-test-workflow)
- [Summary & Reporting](#-summary--reporting)
- [Data Persistence & Recovery](#-data-persistence--recovery)
- [UI/UX Architecture](#-uiux-architecture)
- [Developer Notes](#-developer-notes)
- [Author](#-author)
- [License](#-license)
- [Contact](#-contact)
- [Getting Started](#-getting-started)


## 🔍 Overview
A modular, offline-capable installable Progressive Web App (PWA) designed for pathology labs to manage patient records, assign and record test results, and generate semantically precise PDF reports. Built with React, Vite, Chakra UI, and IndexedDB, it offers a seamless experience across devices — even offline — all with clinical-grade precision.


## 💡Key Highlights
| Feature Area           | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| 🧑‍⚕️ Patient Management | Add, search, resume, and update patient records                              |
| 🧪 Test Workflow        | Assign test groups, enter results, configure master data                    |
| 📊 Reporting            | View summary, generate PDF, download/share                                  |
| 💾 Data Persistence     | IndexedDB + Dexie for offline-first storage and backup/restore              |
| 🎨 UI/UX Architecture   | Chakra UI, modular layout, semantic spacing, signature widget               |


## 🛠 Tech Stack
![React](https://img.shields.io/badge/React-2023-blue)
![Vite](https://img.shields.io/badge/Vite-Fast-purple)
![ChakraUI](https://img.shields.io/badge/ChakraUI-Accessible-green)
![pdfMake](https://img.shields.io/badge/pdfMake-Semantic-orange)
![Dexie](https://img.shields.io/badge/Dexie-IndexedDB-yellow)
- ⚛️ **React** – Component-based UI
- ⚡ **Vite** – Lightning-fast dev server
- 🎨 **Chakra UI** – Accessible, responsive design
- 🧾 **pdfMake** – Semantic PDF generation
- 🗃️ **Dexie.js** – IndexedDB wrapper for offline storage
- 🧱 **Modular PWA** – Installable, offline-capable architecture


## 🧠 Core Capabilities
👤 Patient Lifecycle Management
PatientEntry.jsx: Add new patients with demographic and visit details
RecentPatients.jsx: Search, resume, or update patient records — even if previously incomplete
Resume workflows for test selection, result entry, or report generation


## 🧪 Test Workflow
SelectTestGroups.jsx: Assign test groups to patients
TestResultsEntry.jsx: Enter and validate test results with semantic clarity
TestMaster.jsx: Configure test groups, subgroups, parameters, units, and reference ranges


## 📊 Summary & Reporting
SummaryReport.jsx: View consolidated test results with classification and grouping
PDF generation via pdfExport.js using pdfMake — includes headers, footers, semantic markers, and signature
Download or share reports directly from the app


## 💾 Data Persistence & Recovery
IndexedDB via Dexie for offline-first storage
dbService.js: Abstracted access layer for CRUD operations
BackupRestore.jsx: Export/import full database for backup or migration
FirstTimeSetupGuard: Ensures clean onboarding and setup


## 🎨 UI/UX Architecture
Modular & Semantic: Reusable components with layout tuned for clinical clarity
Workflow-Aware Navigation: Pages guide users through patient lifecycle seamlessly
Offline-First UX: Dexie-backed flows support resume, edit, and report — even offline
Responsive & Accessible: Chakra UI ensures mobile readiness and ARIA compliance
Audit-Safe Rendering: Signature widget and semantic spacing mirror lab standards


## 🧑‍💻 Developer Notes
This app reflects a deep commitment to maintainability, semantic correctness, and clinical usability. It’s designed to be extensible for future modules like billing, analytics.


## 👨‍💻 Author
**Aniket Thakoor**  
Clinical UI/UX Architect | FullStack Technical Lead and Developer  
This repository showcases my approach to solving real-world pathological lab challenges with elegance, precision, and maintainability.


## 📄 License
This project is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

# 📬 Contact
For hiring, collaboration, or licensing inquiries: 📧 aniket.thakoor10@gmail.com 🔗 https://www.linkedin.com/in/aniket-thakoor-531803161/


## 🚀 Getting Started

```bash
npm install
npm run build
npm run preview

