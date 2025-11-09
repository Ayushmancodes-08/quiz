# Quick Reference: Deploy Firestore Rules

## One-Time Setup

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login
```

## Deploy Rules

```bash
# Using npm script (recommended)
npm run deploy:rules

# Or manually
firebase deploy --only firestore:rules
```

## Verify

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Firestore Database > Rules
3. Confirm rules are deployed

## Common Issues

**Permission Denied?**
- Run `firebase login` again
- Check project ID in `.firebaserc`

**Rules Not Working?**
- Wait 1 minute for propagation
- Clear browser cache
- Check rules syntax in `firestore.rules`

## What Gets Deployed

- Public quiz access (`/quizzes/{quizId}`)
- Anonymous attempt creation
- Admin access to results
- User data protection

See [DEPLOY_RULES.md](./DEPLOY_RULES.md) for detailed guide.

