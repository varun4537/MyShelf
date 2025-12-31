# MyShelf - Digital Bookshelf

MyShelf is a camera-first web application designed to help users build a digital replica of their physical book collection. By utilizing the device's camera to scan ISBN barcodes, the app instantly fetches book metadata using Google's Gemini API and stores the collection locally on the device.

## 🌟 Features

*   **Barcode Scanning**: Real-time ISBN-13 detection using the native `BarcodeDetector` API.
*   **AI-Powered Metadata**: Uses Google's **Gemini 2.5 Flash** model to intelligently retrieve book details (Title, Author, Cover, Description, Genre, Page Count) based on the ISBN.
*   **Local Persistence**: Your library is stored in the browser's `localStorage`, ensuring data privacy and offline access to your list.
*   **Library Management**:
    *   **Grid & List Views**: Toggle between visual grid layouts and detailed lists.
    *   **Search & Sort**: Filter by title/author and sort by date added, title, or author.
    *   **Edit & Delete**: Manually correct AI-generated data or remove books.
*   **Data Export**: Export your entire collection to **JSON** or **CSV** for backup or use in spreadsheet software.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Tailwind CSS.
*   **AI Integration**: Google GenAI SDK (`@google/genai`).
*   **Browser APIs**:
    *   `MediaDevices` (Camera access).
    *   `BarcodeDetector` (Shape detection).
    *   `LocalStorage` (Persistence).
    *   `Canvas API` (Visual overlays).

## 🚀 How It Works

1.  **Splash Screen**: The entry point inviting the user to start.
2.  **Scanner View**:
    *   Accesses the rear camera.
    *   Analyzes the video feed for EAN-13 barcodes.
    *   Validates the check digit of the ISBN.
    *   Queries the Gemini API with a structured prompt to get JSON data.
3.  **Library View**:
    *   Displays the scanned books.
    *   Allows management and exporting of data.

## 📋 Requirements

*   A modern browser with support for the `BarcodeDetector` interface (Chrome/Edge/Android Webview).
*   A valid Google GenAI API Key configured in the environment.
*   HTTPS context (required for Camera access).
