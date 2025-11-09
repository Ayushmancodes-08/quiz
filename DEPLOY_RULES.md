# Deploying Firestore Security Rules

This guide explains how to deploy Firestore security rules to your Firebase project.

## Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged into Firebase**
   ```bash
   firebase login
   ```

3. **Firebase project initialized**
   - Your project should have a `.firebaserc` file with the project ID
   - If not, run: `firebase init firestore`

## Quick Deploy

Use the npm script:

```bash
npm run deploy:rules
```

Or deploy manually:

```bash
firebase deploy --only firestore:rules
```

## Step-by-Step Guide

### 1. Verify Your Project

Check that your `.firebaserc` file has the correct project:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 2. Review Rules

The rules file is located at `firestore.rules`. Review it to ensure it matches your requirements:

- Public quiz access: `allow get: if true;` for `/quizzes/{quizId}`
- Anonymous attempt creation: Allows unauthenticated users to create attempts with student info
- Admin access: Quiz creators can list attempts for their quizzes

### 3. Deploy Rules

Run the deploy command:

```bash
npm run deploy:rules
```

You should see output like:

```
=== Deploying to 'your-project-id'...

i  deploying firestore
i  firestore: checking firestore.rules for compilation errors...
✔  firestore: rules file compiled successfully
i  firestore: uploading rules...
✔  firestore: released rules firestore.rules to cloud.firestore

✔  Deploy complete!
```

### 4. Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** > **Rules**
4. Verify the rules match your `firestore.rules` file

## Troubleshooting

### Error: "Permission denied"

- Ensure you're logged in: `firebase login`
- Check that you have the correct permissions for the project
- Verify the project ID in `.firebaserc` matches your Firebase project

### Error: "Rules file not found"

- Ensure `firestore.rules` exists in the project root
- Check that `firebase.json` has the correct path:
  ```json
  {
    "firestore": {
      "rules": "firestore.rules"
    }
  }
  ```

### Error: "Rules compilation failed"

- Check the rules syntax in `firestore.rules`
- Look for typos or missing brackets
- Test rules locally using the Firestore emulator

### Rules Not Taking Effect

- Wait a few seconds after deployment (rules can take up to 1 minute to propagate)
- Clear browser cache and refresh
- Check that you're testing with the correct user permissions

## Testing Rules Locally

You can test rules locally using the Firestore emulator:

```bash
# Start the emulator
firebase emulators:start --only firestore

# In another terminal, test your rules
# Rules are automatically loaded from firestore.rules
```

## Important Notes

1. **Rules are deployed immediately** - Changes take effect within 1 minute
2. **No rollback** - Keep a backup of working rules
3. **Test thoroughly** - Test with different user roles before deploying
4. **Version control** - Commit your rules file to track changes

## What the Rules Enable

After deployment, your rules will:

✅ Allow anyone to read quizzes by ID (for sharing)  
✅ Allow authenticated users to create/update/delete their quizzes  
✅ Allow anonymous users to create quiz attempts (with student info)  
✅ Allow quiz creators (admins) to view attempts for their quizzes  
✅ Prevent unauthorized access to user data  

## Next Steps

After deploying rules:

1. Test quiz creation
2. Test quiz sharing (open link in incognito)
3. Test anonymous quiz attempts
4. Verify admin can see results dashboard

If you encounter permission errors, check the troubleshooting section above.

