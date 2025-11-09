# Local Environment Setup Guide

This guide will help you set up the QuizMasterAI project in your local environment.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project access
- Google AI API key (for quiz generation features)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Firebase Configuration

Get these values from your Firebase project settings:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `studio-2319423145-218b4`
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the configuration values

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-2319423145-218b4
NEXT_PUBLIC_FIREBASE_APP_ID=1:165593041898:web:62e30c00e9ef8e51580093
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-2319423145-218b4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=165593041898
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-2319423145-218b4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Google AI (Genkit) Configuration

Required for AI quiz generation features:

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create or copy your API key
3. Add it to `.env.local`:

```env
# Google AI (Genkit) Configuration
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
```

### Complete `.env.local` Template

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-2319423145-218b4
NEXT_PUBLIC_FIREBASE_APP_ID=1:165593041898:web:62e30c00e9ef8e51580093
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-2319423145-218b4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=165593041898
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-2319423145-218b4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Google AI (Genkit) Configuration
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here

# Node Environment
NODE_ENV=development
```

## Step 3: Deploy Firestore Security Rules

The Firestore security rules are in `firestore.rules`. If you're using Firebase CLI:

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only firestore:rules
```

**Note:** If you're using Firebase Studio/App Hosting, the rules are automatically deployed. For local development, you can use the Firebase Emulator Suite.

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:9002` (port 9002 as configured in package.json).

## Step 5: Run Genkit Development Server (Optional)

If you want to test AI features locally, run the Genkit dev server in a separate terminal:

```bash
npm run genkit:dev
```

## Troubleshooting

### Firebase Connection Issues

- Verify your Firebase project ID matches in `.env.local` and `.firebaserc`
- Check that your Firebase API key is correct and not restricted
- Ensure Firestore is enabled in your Firebase project

### AI Generation Not Working

- Verify `GOOGLE_GENAI_API_KEY` is set in `.env.local`
- Check that the API key has proper permissions
- Restart the development server after adding environment variables

### Authentication Issues

- Ensure Firebase Authentication is enabled in your Firebase project
- Check that Google Sign-In is enabled in Authentication > Sign-in method
- Verify the authorized domains include `localhost:9002`

### Port Already in Use

If port 9002 is already in use, you can change it in `package.json`:

```json
"dev": "next dev --turbopack -p 3000"
```

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/firebase/` - Firebase configuration and utilities
- `src/ai/` - Genkit AI flows for quiz generation
- `src/lib/` - Shared utilities and types
- `firestore.rules` - Firestore security rules

## Important Notes

1. **Environment Variables**: Never commit `.env.local` to version control (it's in `.gitignore`)
2. **Firebase Config**: The app will use environment variables if available, otherwise fall back to hardcoded values
3. **Public Quizzes**: Quizzes are stored in both user collections and a public `/quizzes` collection for sharing
4. **Security Rules**: Make sure to deploy updated security rules when making changes

## Next Steps

1. Create your first quiz using the dashboard
2. Test quiz sharing by copying the quiz link
3. Try taking a quiz in an incognito window to test public access

