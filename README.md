# SSC CGL Mock Analyzer

This project is a mock test analyzer for the SSC CGL examination. It provides an interface for users to take mock tests, analyze their performance, and upload/manage tests.

## Features
- **Dashboard:** Overview of test history, overall subject performance, and an interactive **Topic Progress Tracker** to plot your accuracy across specific topics over time.
- **Test Interface:** A seamless interface for taking SSC CGL mock tests or topic-wise quizzes with a responsive question palette.
- **Analysis:** Detailed post-test analysis with solutions and Question IDs for easy tracking.
- **Manage Questions:** A dedicated admin interface to view, search, edit, and delete questions from the question bank.
- **Settings:** Admin tools to clear mock test history without deleting the core question bank.
- **Upload:** Admin interface for uploading new questions via CSV or Excel (`.xlsx`) files.

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Node.js, Express, MongoDB

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB

### Installation

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

### Running the App

Start both the frontend and backend servers to run the app.
