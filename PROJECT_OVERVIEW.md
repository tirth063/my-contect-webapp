# Project Overview: ContactNexus

## 1. Introduction

**ContactNexus** is a modern, AI-enhanced contact management application designed to simplify how users organize and interact with their personal and professional contacts. The primary goal is to provide a feature-rich, intuitive, and responsive platform that leverages the power of modern web technologies and artificial intelligence to offer a superior contact management experience.

The application is built with a focus on:
*   **Comprehensive Contact Details:** Allowing users to store more than just names and numbers.
*   **Flexible Grouping:** Supporting complex, hierarchical relationships between contacts and groups.
*   **Ease of Use:** Providing a clean user interface with powerful search, sort, and filter capabilities.
*   **Data Portability:** Enabling users to import existing contacts and export their data.
*   **Intelligent Features:** Utilizing AI to offer smart suggestions and streamline organization.

## 2. Core Features

### 2.1. Contact Management
*   **CRUD Operations:** Full capabilities to Create, Read, Update, and Delete contacts.
*   **Detailed Information:**
    *   Primary phone number and multiple alternative numbers.
    *   Email address.
    *   Multiple physical addresses, each with a label (e.g., "Home," "Work"), street, city, state, ZIP code, and country.
    *   Avatar/profile picture upload for contacts.
    *   Notes section for additional information.
    *   Display names in multiple languages (currently supporting English, Gujarati, and Hindi).
*   **Contact Sources:** Track the origin of contacts (e.g., Gmail, SIM, WhatsApp, CSV import, Other).

### 2.2. Group Management
*   **CRUD Operations:** Create, edit, and delete contact groups.
*   **Hierarchical Groups:** Support for nested groups, allowing users to create complex structures (e.g., Society > Family > Immediate Family > Siblings). A group can have a parent group.
*   **Multiple Group Membership:** Contacts can be assigned to one or more groups simultaneously.
*   **Member Count:** Groups display the total number of unique contacts belonging to them, including all contacts in their nested subgroups.
*   **Group Navigation:** Easily view contacts within a specific group (including its subgroups) by clicking on the group.

### 2.3. Data Import & Export
*   **CSV Import:** Users can import contacts in bulk from a CSV file. The system provides a template/guidelines for the CSV structure, including mapping to existing group names.
*   **Data Export:** All contacts in the application can be exported into:
    *   **CSV format:** Suitable for spreadsheets or importing into other systems.
    *   **TXT format:** A human-readable plain text file.

### 2.4. User Interface & Experience
*   **Responsive Design:** The UI adapts seamlessly to various screen sizes, from desktops to mobile devices.
*   **Sidebar Navigation:** A persistent sidebar (collapsible on desktop, off-canvas on mobile) for easy access to main sections like "All Contacts," "Family Groups," "Add Contact," "Import," and "Export."
*   **Advanced Filtering & Sorting:**
    *   Contacts can be filtered by the group(s) they belong to.
    *   Contacts can be filtered by their source(s).
    *   Contacts can be sorted by name (A-Z, Z-A).
*   **Comprehensive Search:**
    *   Search contacts by name, phone number, email, notes, any part of their addresses, and names of groups they belong to.
    *   Search groups by their name or description.
*   **Interactive Contact Cards:**
    *   Clear display of key contact information.
    *   Quick action buttons:
        *   Initiate a phone call (`tel:` link).
        *   Open WhatsApp chat (`https://wa.me/` link with WhatsApp icon).
        *   Open default messaging app (`sms:` link).
        *   Compose an email (`mailto:` link).
        *   Share contact details (using Web Share API, falls back to copy-to-clipboard).
    *   Long-press actions on mobile for copying name/number or opening the edit/delete menu.
*   **Visual Feedback:** Toast notifications for actions like creating, updating, deleting contacts/groups, and successful import/export.
*   **Theme Support:** Basic light and dark theme support via CSS variables, reflecting system preference.

### 2.5. AI-Powered Features (Genkit)
*   **Smart Group Suggestions:** When adding a new contact, the system uses Genkit and an AI model (Google Gemini) to analyze the new contact's name in relation to existing contact names and group names. It then suggests whether the contact might fit into a "family" or "friend" type group, along with a confidence score. This helps users organize new contacts more quickly.

### 2.6. Sharing
*   **Contact Sharing:** Individual contacts can be shared as text using the Web Share API (if available on the device), falling back to copying details to the clipboard.
*   **Group Sharing:** Entire groups (including member details) can be shared as text using the Web Share API, with a clipboard fallback.

## 3. Technical Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Library:** React 18
*   **Component Library:** ShadCN UI (built on Radix UI and Tailwind CSS)
*   **Styling:** Tailwind CSS
*   **AI Integration:** Genkit framework with Google AI provider (e.g., Gemini models)
*   **Form Management:** React Hook Form
*   **Schema Validation:** Zod
*   **Dummy Data:** Currently uses in-memory TypeScript arrays for contacts and groups (`src/lib/dummy-data.ts`) for prototyping.

## 4. Key Components & Functionality Walkthrough

*   **`app/page.tsx` (All Contacts Page):** The main dashboard. Displays a grid of `ContactCard` components. Implements search, sorting by name, filtering by group (hierarchical) and source. Manages modals for creating new groups (top-level), importing contacts, and exporting contacts.
*   **`app/contacts/add/page.tsx` & `app/contacts/edit/[id]/page.tsx`:** Pages for creating new contacts and editing existing ones, respectively. Both utilize the `ContactForm` component.
*   **`app/groups/page.tsx` (Family & Friend Groups Page):** Displays a hierarchical list of all groups. Allows users to create, edit (including changing parent), and delete groups. Shows member counts (including subgroups) and sub-group counts. Users can click a group to navigate to the All Contacts page, filtered by that group.
*   **`components/app-shell-client.tsx`:** Defines the main application layout, including the responsive sidebar and the header with a user avatar dropdown.
*   **`components/contact-card.tsx`:** Renders an individual contact's information with interactive elements (call, email, WhatsApp, SMS links, share, edit/delete menu). Supports long-press actions on mobile.
*   **`components/contact-form.tsx`:** A comprehensive form for adding/editing contacts. Includes fields for name, primary/alternative phone numbers, email, avatar upload (with preview), notes, multi-select for group assignment, and a dynamic field array for managing multiple labeled addresses. Integrates with the AI smart suggestion modal.
*   **`components/smart-suggestion-modal.tsx`:** A dialog that appears during contact creation/editing, using Genkit to call an AI flow for group suggestions.
*   **`components/import-contacts-modal.tsx`:** Handles CSV file uploads, provides format guidance, and parses the CSV data.
*   **`components/export-contacts-modal.tsx`:** Allows users to choose the export format (CSV or TXT) for all contacts.
*   **`ai/flows/smart-group-suggestions.ts`:** A Genkit flow that defines the prompt and logic for the AI-powered group suggestion feature.
*   **`lib/dummy-data.ts`:** Contains the initial set of contacts and groups used by the application during development.
*   **`types/index.ts`:** Defines the core TypeScript types for `Contact`, `FamilyGroup`, `LabeledAddress`, etc.

## 5. Deployment

*   **Docker:** The project includes a `Dockerfile` that creates an optimized, production-ready image using a multi-stage build and Next.js's standalone output feature.
*   **Platform Compatibility:** Designed to be deployable on various modern hosting platforms like Render, Vercel, etc. The Docker container respects the `PORT` environment variable.
*   **Stateless (Current):** As it currently uses dummy data, the application itself is stateless between restarts unless deployed with a volume for persistent dummy data (not typical for production). For real persistence, a database backend would be needed.

## 6. Future Considerations & Potential Enhancements

*   **Persistent Data Storage:** Replace dummy data with a proper database (e.g., PostgreSQL, MongoDB, Firebase Firestore) to store user data persistently.
*   **User Authentication:** Implement user accounts and authentication to allow multiple users to manage their own contacts securely.
*   **Advanced AI Features:**
    *   Automatic duplicate contact detection and merging suggestions.
    *   AI-powered data enrichment for contacts.
    *   Natural language search queries.
*   **vCard (VCF) Import/Export:** Support for the standard vCard format for better interoperability with other contact applications.
*   **Full Internationalization (i18n):** Translate all UI labels and messages into multiple languages based on user preference or browser settings.
*   **Enhanced Theme Customization:** Allow users to choose themes or customize colors beyond the basic light/dark mode.
*   **Native Mobile App Features (if evolving beyond web):** Direct SIM contact import, deeper OS integrations if the project were to expand to native mobile platforms.
*   **Calendar Integration:** Link contacts to events or set reminders.
*   **Relationship Mapping:** Visually map relationships between contacts beyond simple grouping.
