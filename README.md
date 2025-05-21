# ContactNexus - Unified Contact Management

This is a Next.js starter project developed in Firebase Studio, evolving into a comprehensive contact management application called ContactNexus.

## Description

ContactNexus aims to be a modern, AI-enhanced solution for managing contacts efficiently. It provides features for detailed contact information storage, hierarchical group management, data import/export, and intelligent suggestions, all wrapped in a clean, responsive user interface.

## Features

*   **Contact Management:**
    *   Create, Read, Update, Delete (CRUD) contacts.
    *   Store rich contact details: multiple phone numbers, emails, multiple labeled addresses (Home, Work, etc.), notes, and avatars.
    *   Support for display names in multiple languages (English, Gujarati, Hindi).
    *   Track contact sources (Gmail, SIM, WhatsApp, CSV, Other).
*   **Group Management:**
    *   Create, edit, and delete groups.
    *   Hierarchical (nested) group structures (e.g., Family > Immediate Family > Cousins).
    *   Assign contacts to multiple groups.
    *   View total member counts for groups (including members of all nested subgroups).
    *   Search and filter groups by name or description.
*   **Data Import/Export:**
    *   Import contacts from CSV files.
    *   Export all contacts to CSV or TXT files.
*   **User Interface & Experience:**
    *   Responsive design for desktop and mobile use.
    *   Sidebar navigation for easy access to different sections.
    *   Comprehensive filtering (by group, source) and sorting (by name) for contacts.
    *   Global search functionality for contacts (by name, phone, email, address, notes, group name).
    *   Interactive contact cards with quick actions (call, email, WhatsApp, SMS, share).
    *   Toast notifications for user feedback on actions.
    *   Basic light and dark theme support (via CSS variables).
*   **AI-Powered Features (Genkit):**
    *   Smart group suggestions: AI suggests whether a new contact might belong to a family or friend group based on name similarity and existing contact/group names.
*   **Sharing:**
    *   Share contact details or group information as text using the Web Share API (if supported by the browser/OS).

## Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit (using Google AI models)
*   **Form Handling:** React Hook Form with Zod for validation

## Getting Started / Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

3.  **Run Genkit development server (for AI features, in a separate terminal):**
    ```bash
    npm run genkit:dev
    ```
    Or for watching changes:
    ```bash
    npm run genkit:watch
    ```

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server (after building):

```bash
npm start
```

## Running with Docker

This project includes a `Dockerfile` for containerization.

1.  **Build the Docker image:**
    ```bash
    docker build -t contactnexus .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 3000:3000 contactnexus
    ```
    The application will be available at `http://localhost:3000`.

## Deployment

The application is designed to be deployable on platforms like Render, Vercel, or any service that supports Node.js/Next.js applications or Docker containers. The Dockerfile uses a multi-stage build for an optimized production image and respects the `PORT` environment variable set by hosting providers.
