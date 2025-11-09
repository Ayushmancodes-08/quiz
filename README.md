# QuizMasterAI

A modern quiz application built with Next.js, Firebase, and Google AI (Genkit) for generating and sharing quizzes.

## Features

- 🤖 **AI-Powered Quiz Generation**: Generate quizzes on any topic using Google's Gemini AI
- 🔗 **Public Quiz Sharing**: Share quizzes with anyone via public links (no login required)
- 📊 **Results Dashboard**: View quiz attempts, scores, and analytics
- 🛡️ **Anti-Cheat Protection**: Built-in violation detection and flagging
- 🔐 **User Authentication**: Email/password and Google Sign-In support
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase project
- Google AI API key (for quiz generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory. See [SETUP.md](./SETUP.md) for detailed instructions.

   Required variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `GOOGLE_GENAI_API_KEY`
   - (See SETUP.md for complete list)

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:9002`

## Documentation

- [Local Setup Guide](./SETUP.md) - Detailed instructions for local environment setup
- [Deploy Firestore Rules](./DEPLOY_RULES.md) - Step-by-step guide for deploying security rules
- [Quick Deploy Reference](./FIREBASE_RULES_QUICK_DEPLOY.md) - Quick reference for deploying rules
- [Firebase Configuration](./docs/backend.json) - Backend structure documentation

## Project Structure

```
quiz-main/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/      # React components
│   ├── firebase/        # Firebase configuration
│   ├── ai/              # Genkit AI flows
│   └── lib/             # Utilities and types
├── firestore.rules      # Firestore security rules
└── .env.local           # Environment variables (create this)
```

## Available Scripts

- `npm run dev` - Start development server (port 9002)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Key Features

### Public Quiz Sharing

- Quizzes are stored in both user collections and a public `/quizzes` collection
- Anyone with the link can view and take quizzes (no authentication required)
- Quiz creators can manage their quizzes from the dashboard

### Security

- Firestore security rules enforce proper access control
- Public quizzes are readable by anyone, but only creators can modify
- User data is protected and private

### AI Integration

- Uses Google's Gemini 2.5 Flash model via Genkit
- Generates unique quiz questions based on topic, difficulty, and question count
- Includes AI-powered cheat detection and result summarization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Add your license here]

## Troubleshooting

### Quiz Sharing Not Working

If quiz links don't work or show permission errors:

1. **Deploy Firestore Rules**
   ```bash
   npm run deploy:rules
   ```
   See [DEPLOY_RULES.md](./DEPLOY_RULES.md) for detailed instructions.

2. **Check Rules Are Deployed**
   - Go to Firebase Console > Firestore Database > Rules
   - Verify rules include public quiz access

3. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Try incognito/private window

### Quiz Creation Fails

If you see "Permission Denied" when creating quizzes:

1. Ensure you're logged in
2. Deploy Firestore rules: `npm run deploy:rules`
3. Check error message for specific guidance

### Student Information Not Saving

- Ensure Firestore rules allow anonymous attempt creation
- Verify `studentName` and `registrationNumber` are provided
- Check browser console for errors

### Results Dashboard Empty

- Verify you're viewing attempts for quizzes you created
- Check that `authorId` matches your user ID
- Ensure Firestore rules allow admin access

## Support

For issues and questions, please open an issue on GitHub.
