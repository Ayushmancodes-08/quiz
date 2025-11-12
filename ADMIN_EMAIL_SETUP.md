# 📧 Admin Email Configuration

## Quick Setup

### 1. Update Environment Variables

Edit your `.env.local` file and add your admin email:

```env
# Admin Contact Configuration
NEXT_PUBLIC_ADMIN_EMAIL=your-admin@yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

### 2. Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

That's it! The email will now appear in:
- Security violation page
- Contact support button
- Email links

---

## Where Admin Email Appears

### 1. Security Violation Page (`/security-violation`)

**Contact Support Button:**
- Clicking opens email client with pre-filled template
- Subject: "Security Violation Report"
- Body includes: Session ID, Timestamp

**Footer Text:**
```
If you believe this is an error, please contact support at 
admin@example.com with your session ID.
```

### 2. Email Template

When users click "Contact Support", their email client opens with:

```
To: your-admin@yourdomain.com
Subject: Security Violation Report

Hello,

I received a security violation notice and would like to report this.

Session ID: abc123-xyz789
Timestamp: 2024-11-13T10:30:00.000Z

Please review this incident.

Thank you.
```

---

## Configuration Options

### Using Environment Variables (Recommended)

**File:** `.env.local`

```env
# Primary admin email (for security violations)
NEXT_PUBLIC_ADMIN_EMAIL=admin@yourdomain.com

# Support email (for general support)
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com
```

### Using Config File

**File:** `src/lib/config.ts`

```typescript
export const config = {
  admin: {
    email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@example.com',
  },
  // ... other config
};
```

---

## Customization

### Change Email Subject

Edit `src/app/security-violation/page.tsx`:

```typescript
const supportSubject = 'Your Custom Subject Here';
```

### Change Email Body Template

Edit `src/app/security-violation/page.tsx`:

```typescript
const supportBody = `
Your custom email template here.

Session ID: ${sessionId}
Timestamp: ${new Date().toISOString()}

Add any additional information you want.
`;
```

### Add CC or BCC

```typescript
const mailtoLink = `mailto:${adminEmail}?subject=${encodeURIComponent(supportSubject)}&cc=manager@example.com&body=${encodeURIComponent(supportBody)}`;
```

---

## Examples

### Example 1: Single Admin Email

```env
NEXT_PUBLIC_ADMIN_EMAIL=security@mycompany.com
```

Result:
- Contact button opens: `security@mycompany.com`
- Footer shows: "contact support at security@mycompany.com"

### Example 2: Separate Support Email

```env
NEXT_PUBLIC_ADMIN_EMAIL=admin@mycompany.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@mycompany.com
```

You can then use different emails for different purposes in your code.

### Example 3: Multiple Recipients

Edit the page to add multiple recipients:

```typescript
const adminEmail = `${config.admin.email},${config.admin.supportEmail}`;
```

Result: Email sent to both addresses

---

## Testing

### 1. Check Email Display

1. Trigger 3 security violations
2. Get redirected to `/security-violation`
3. Check footer text shows your email
4. Verify email is clickable

### 2. Test Email Link

1. Click "Contact Support" button
2. Email client should open
3. Verify:
   - To: Your admin email
   - Subject: "Security Violation Report"
   - Body: Contains session ID and timestamp

### 3. Test Different Emails

```env
# Test with different emails
NEXT_PUBLIC_ADMIN_EMAIL=test1@example.com
```

Restart server and verify new email appears.

---

## Troubleshooting

### Email Not Showing

**Problem:** Still shows `admin@example.com`

**Solution:**
1. Check `.env.local` has correct email
2. Restart development server
3. Clear browser cache
4. Check `src/lib/config.ts` is importing correctly

### Email Link Not Working

**Problem:** Clicking doesn't open email client

**Solution:**
1. Check default email client is set in OS
2. Try different browser
3. Check mailto link format is correct
4. Verify email address has no spaces

### Session ID Shows "N/A"

**Problem:** Email body shows Session ID: N/A

**Solution:**
- This is normal on first load
- Session ID is generated when security system initializes
- Trigger a violation first, then check

---

## Production Deployment

### Environment Variables

Make sure to set in your hosting platform:

**Vercel:**
```bash
vercel env add NEXT_PUBLIC_ADMIN_EMAIL
# Enter: your-admin@yourdomain.com
```

**Netlify:**
```bash
netlify env:set NEXT_PUBLIC_ADMIN_EMAIL "your-admin@yourdomain.com"
```

**Other Platforms:**
Add to environment variables in dashboard:
- Key: `NEXT_PUBLIC_ADMIN_EMAIL`
- Value: `your-admin@yourdomain.com`

---

## Security Considerations

### Email Privacy

✅ **Safe to use NEXT_PUBLIC_:**
- Admin email is meant to be public
- Users need to contact you
- No security risk

❌ **Don't use NEXT_PUBLIC_ for:**
- Email passwords
- API keys
- Private credentials

### Spam Protection

Consider:
1. Using a dedicated support email
2. Setting up email filters
3. Using a ticketing system
4. Adding CAPTCHA to contact forms

---

## Advanced: Custom Contact Form

Instead of mailto links, you can create a contact form:

```typescript
// src/app/api/contact/route.ts
export async function POST(request: Request) {
  const { sessionId, message } = await request.json();
  
  // Send email via service (SendGrid, Resend, etc.)
  await sendEmail({
    to: config.admin.email,
    subject: 'Security Violation Report',
    body: `Session: ${sessionId}\nMessage: ${message}`
  });
  
  return Response.json({ success: true });
}
```

---

## Quick Reference

### Default Values
- Admin Email: `admin@example.com`
- Support Email: `support@example.com`

### Files to Edit
- `.env.local` - Set your email
- `src/lib/config.ts` - Config defaults
- `src/app/security-violation/page.tsx` - Email template

### Environment Variables
- `NEXT_PUBLIC_ADMIN_EMAIL` - Primary admin email
- `NEXT_PUBLIC_SUPPORT_EMAIL` - Support email (optional)

---

## Summary

✅ **Setup Steps:**
1. Add `NEXT_PUBLIC_ADMIN_EMAIL` to `.env.local`
2. Set your email address
3. Restart development server
4. Test on `/security-violation` page

✅ **What You Get:**
- Clickable email in footer
- Pre-filled email template
- Session ID included
- Professional appearance

✅ **Customizable:**
- Email address
- Subject line
- Email body template
- Multiple recipients

**Status:** ✅ Ready to use!
