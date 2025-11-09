# Firebase Rules Deployment Guide

## Important: Deploy Firestore Security Rules

The Firestore security rules have been updated to fix permission errors. **You must deploy these rules to your Firebase project** for them to take effect.

## Steps to Deploy

### Option 1: Using Firebase CLI

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Choose `firestore.rules` as your rules file

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Verify Deployment

After deploying, test the rules using the **Rules Playground** in Firebase Console:

1. Go to Firestore Database → Rules → **Rules Playground**
2. Set:
   - **Location**: `/databases/(default)/documents/quiz_attempts`
   - **Operation**: `list`
   - **Authentication**: Authenticated (use your user UID)
3. Click **Run** - should show "Allowed"

## Current Rules Summary

- ✅ Authenticated users can **list** quiz_attempts
- ✅ Users can **read** attempts where they are the quiz author (`authorId == user.uid`)
- ✅ Users can **read** their own attempts (`userId == user.uid`)
- ✅ Anyone can **create** attempts (with required fields)
- ❌ No one can **update** or **delete** attempts (data integrity)

## Troubleshooting

If you still see permission errors after deploying:

1. **Check that rules are deployed**: Look at the "Last published" timestamp in Firebase Console
2. **Verify user authentication**: Ensure the user is properly authenticated
3. **Check query structure**: The query should use `where("authorId", "==", user.uid)`
4. **Review Firestore indexes**: You may need a composite index for `authorId` + `completedAt`

## Creating Required Indexes

If you see an index error, Firebase will provide a link to create it automatically. Or create manually:

1. Go to Firestore Database → **Indexes**
2. Click **Create Index**
3. Collection: `quiz_attempts`
4. Fields:
   - `authorId` (Ascending)
   - `completedAt` (Descending)
5. Click **Create**

