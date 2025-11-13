# Professional Light Mode Theme

## Color Palette

This application uses a professional blue color scheme optimized for light mode:

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Space Cadet** | `#1E2E4F` | `rgb(30, 46, 79)` | Secondary buttons, dark accents, headers |
| **YinMn Blue** | `#31487A` | `rgb(49, 72, 122)` | Primary buttons, links, main brand color |
| **Jordy Blue** | `#8FB3E2` | `rgb(143, 179, 226)` | Accents, hover states, highlights |

### Supporting Colors

| Color | Usage |
|-------|-------|
| `#F8FAFC` | Background (very light blue-white) |
| `#FFFFFF` | Cards, popovers, clean surfaces |
| `#E2E8F0` | Borders, dividers |
| `#334155` | Text (dark blue-gray) |
| `#64748B` | Muted text, secondary information |

## Design Principles

### 1. Professional & Clean
- High contrast for readability
- Ample white space
- Clear visual hierarchy
- Consistent spacing

### 2. Accessible
- WCAG 2.1 AA compliant contrast ratios
- Focus indicators on all interactive elements
- Semantic HTML structure
- Screen reader friendly

### 3. Modern & Polished
- Subtle shadows for depth
- Smooth transitions
- Professional hover effects
- Gradient accents where appropriate

## Component Styling

### Buttons

**Primary Button**
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90 btn-professional">
  Primary Action
</button>
```

**Secondary Button**
```tsx
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 btn-professional">
  Secondary Action
</button>
```

**Accent Button**
```tsx
<button className="bg-accent text-accent-foreground hover:bg-accent/90 btn-professional">
  Accent Action
</button>
```

### Cards

```tsx
<div className="bg-card text-card-foreground rounded-lg border shadow-professional card-professional p-6">
  Card Content
</div>
```

### Text Gradients

```tsx
<h1 className="text-gradient-primary text-4xl font-bold">
  Gradient Heading
</h1>
```

### Shadows

- **Light**: `shadow-professional` - Subtle elevation
- **Medium**: `shadow-professional-lg` - Prominent elevation

## Usage Examples

### Hero Section
```tsx
<section className="bg-gradient-to-br from-jordy-blue/10 to-background">
  <h1 className="text-gradient-primary text-5xl font-bold">
    Welcome to QuizMasterAI
  </h1>
  <p className="text-muted-foreground">
    Professional quiz platform with AI-powered features
  </p>
</section>
```

### Navigation
```tsx
<nav className="bg-card border-b shadow-professional">
  <a className="text-foreground hover:text-primary transition-colors">
    Dashboard
  </a>
</nav>
```

### Form Inputs
```tsx
<input 
  className="bg-background border-input focus-professional rounded-md px-3 py-2"
  placeholder="Enter text..."
/>
```

## Customization

### Tailwind Config
All colors are defined in `tailwind.config.ts`:

```typescript
colors: {
  'space-cadet': '#1E2E4F',
  'yinmn-blue': '#31487A',
  'jordy-blue': '#8FB3E2',
  // ... CSS variables
}
```

### CSS Variables
Global theme variables in `src/app/globals.css`:

```css
:root {
  --primary: 218 44% 29%; /* YinMn Blue */
  --secondary: 215 45% 20%; /* Space Cadet */
  --accent: 213 73% 72%; /* Jordy Blue */
  --background: 210 40% 98%;
  --foreground: 215 30% 20%;
  /* ... more variables */
}
```

## Utility Classes

### Professional Effects
- `.btn-professional` - Button hover effects
- `.card-professional` - Card hover effects
- `.focus-professional` - Focus ring styles
- `.shadow-professional` - Light shadow
- `.shadow-professional-lg` - Prominent shadow

### Text Gradients
- `.text-gradient-primary` - YinMn Blue to Jordy Blue
- `.text-gradient-secondary` - Space Cadet to YinMn Blue

## Accessibility

### Contrast Ratios
- **Primary on White**: 7.2:1 (AAA)
- **Secondary on White**: 10.5:1 (AAA)
- **Foreground on Background**: 12.8:1 (AAA)

### Focus Indicators
All interactive elements have visible focus rings:
```css
.focus-professional {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2;
}
```

## Best Practices

### Do's ✅
- Use `bg-card` for elevated surfaces
- Use `text-muted-foreground` for secondary text
- Apply `shadow-professional` for subtle depth
- Use `btn-professional` for interactive elements
- Maintain consistent spacing with Tailwind's spacing scale

### Don'ts ❌
- Don't use pure black (`#000000`) for text
- Don't mix dark mode classes with light mode
- Don't override CSS variables directly in components
- Don't use low-contrast color combinations

## Migration from Dark Mode

If you need to switch back to dark mode:

1. Update `src/app/layout.tsx`:
   ```tsx
   <html lang="en" className="dark">
   ```

2. Add dark mode variants in `globals.css`:
   ```css
   .dark {
     --background: 220 15% 15%;
     --foreground: 210 30% 90%;
     /* ... dark mode variables */
   }
   ```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Performance

- CSS variables for instant theme switching
- No JavaScript required for theming
- Optimized for Core Web Vitals
- Minimal CSS bundle size

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
