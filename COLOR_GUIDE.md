# Color Usage Guide

## Quick Reference

### 🎨 Your Three Blue Colors

```
┌─────────────────────────────────────────────────────────┐
│  #1E2E4F - Space Cadet (Dark Blue)                      │
│  Use for: Headers, Dark Accents, Secondary Buttons      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  #31487A - YinMn Blue (Medium Blue)                     │
│  Use for: Primary Buttons, Links, Main Brand Color      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  #8FB3E2 - Jordy Blue (Light Blue)                      │
│  Use for: Accents, Hover States, Highlights             │
└─────────────────────────────────────────────────────────┘
```

## Component Examples

### Navigation Bar
```tsx
<nav className="bg-white border-b border-border shadow-professional">
  <div className="flex items-center gap-4">
    <h1 className="text-gradient-primary font-bold text-2xl">
      QuizMasterAI
    </h1>
    <a className="text-foreground hover:text-primary transition-colors">
      Dashboard
    </a>
  </div>
</nav>
```

### Hero Section
```tsx
<section className="bg-gradient-to-br from-jordy-blue/10 via-background to-background py-20">
  <h1 className="text-gradient-primary text-6xl font-bold mb-4">
    AI-Powered Quiz Platform
  </h1>
  <p className="text-muted-foreground text-xl mb-8">
    Create, manage, and analyze quizzes with advanced anti-cheat features
  </p>
  <button className="bg-primary text-white px-8 py-3 rounded-lg btn-professional">
    Get Started
  </button>
</section>
```

### Dashboard Cards
```tsx
<div className="grid grid-cols-3 gap-6">
  {/* Primary Card */}
  <div className="bg-card border rounded-lg p-6 shadow-professional card-professional">
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="text-primary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Total Quizzes</h3>
    <p className="text-3xl font-bold text-primary">24</p>
  </div>
  
  {/* Secondary Card */}
  <div className="bg-card border rounded-lg p-6 shadow-professional card-professional">
    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="text-secondary" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Active Students</h3>
    <p className="text-3xl font-bold text-secondary">156</p>
  </div>
  
  {/* Accent Card */}
  <div className="bg-card border rounded-lg p-6 shadow-professional card-professional">
    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="text-accent" />
    </div>
    <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
    <p className="text-3xl font-bold text-accent">94%</p>
  </div>
</div>
```

### Buttons
```tsx
{/* Primary Action */}
<button className="bg-primary text-white px-6 py-2 rounded-lg btn-professional hover:bg-primary/90">
  Create Quiz
</button>

{/* Secondary Action */}
<button className="bg-secondary text-white px-6 py-2 rounded-lg btn-professional hover:bg-secondary/90">
  View Results
</button>

{/* Accent/Tertiary Action */}
<button className="bg-accent text-accent-foreground px-6 py-2 rounded-lg btn-professional hover:bg-accent/90">
  Export Data
</button>

{/* Outline Button */}
<button className="border-2 border-primary text-primary px-6 py-2 rounded-lg btn-professional hover:bg-primary hover:text-white">
  Learn More
</button>
```

### Forms
```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      Quiz Title
    </label>
    <input
      type="text"
      className="w-full bg-background border-input rounded-lg px-4 py-2 focus-professional"
      placeholder="Enter quiz title..."
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">
      Description
    </label>
    <textarea
      className="w-full bg-background border-input rounded-lg px-4 py-2 focus-professional"
      rows={4}
      placeholder="Enter description..."
    />
  </div>
  
  <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg btn-professional">
    Save Quiz
  </button>
</form>
```

### Alerts & Notifications
```tsx
{/* Success */}
<div className="bg-accent/10 border border-accent rounded-lg p-4">
  <p className="text-accent font-medium">Quiz created successfully!</p>
</div>

{/* Info */}
<div className="bg-primary/10 border border-primary rounded-lg p-4">
  <p className="text-primary font-medium">New features available</p>
</div>

{/* Warning */}
<div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
  <p className="text-yellow-800 font-medium">Please review your settings</p>
</div>

{/* Error */}
<div className="bg-destructive/10 border border-destructive rounded-lg p-4">
  <p className="text-destructive font-medium">Failed to save changes</p>
</div>
```

### Tables
```tsx
<div className="bg-card rounded-lg border shadow-professional overflow-hidden">
  <table className="w-full">
    <thead className="bg-muted">
      <tr>
        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
          Student Name
        </th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
          Score
        </th>
        <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-muted/50 transition-colors">
        <td className="px-6 py-4 text-sm text-foreground">John Doe</td>
        <td className="px-6 py-4 text-sm text-primary font-semibold">95%</td>
        <td className="px-6 py-4">
          <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
            Completed
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges & Tags
```tsx
{/* Primary Badge */}
<span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
  Active
</span>

{/* Secondary Badge */}
<span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
  Premium
</span>

{/* Accent Badge */}
<span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
  New
</span>
```

### Progress Bars
```tsx
{/* Primary Progress */}
<div className="w-full bg-muted rounded-full h-2">
  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
</div>

{/* Accent Progress */}
<div className="w-full bg-muted rounded-full h-2">
  <div className="bg-accent h-2 rounded-full" style={{ width: '60%' }}></div>
</div>
```

## Color Combinations

### High Contrast (Best for Text)
- `text-foreground` on `bg-background`
- `text-primary-foreground` on `bg-primary`
- `text-secondary-foreground` on `bg-secondary`

### Medium Contrast (Good for Secondary Text)
- `text-muted-foreground` on `bg-background`
- `text-muted-foreground` on `bg-card`

### Low Contrast (Subtle Elements)
- `text-muted-foreground` on `bg-muted`
- `border-border` for dividers

## Gradients

### Background Gradients
```tsx
{/* Light to lighter */}
<div className="bg-gradient-to-br from-jordy-blue/10 to-background">

{/* Primary gradient */}
<div className="bg-gradient-to-r from-yinmn-blue to-jordy-blue">

{/* Subtle overlay */}
<div className="bg-gradient-to-b from-transparent to-background/50">
```

### Text Gradients
```tsx
<h1 className="text-gradient-primary">Primary Gradient Text</h1>
<h2 className="text-gradient-secondary">Secondary Gradient Text</h2>
```

## Spacing & Layout

### Container Widths
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Card Spacing
```tsx
<div className="p-6">        {/* Standard padding */}
<div className="p-8">        {/* Large padding */}
<div className="px-6 py-4">  {/* Compact padding */}
```

### Grid Layouts
```tsx
{/* 3 columns on desktop, 1 on mobile */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* 4 columns on desktop */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

## Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Example
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>

<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>
```

## Quick Tips

1. **Always use semantic color names** (`bg-primary` not `bg-yinmn-blue`)
2. **Add hover states** to interactive elements
3. **Use shadows sparingly** for depth
4. **Maintain consistent spacing** with Tailwind's scale
5. **Test contrast** for accessibility
6. **Use gradients** for visual interest
7. **Keep it clean** - white space is your friend
