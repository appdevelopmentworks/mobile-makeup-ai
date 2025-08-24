# UI Components

This directory contains shadcn/ui compatible components for the MakeupAI application.

## Components

### Button (`button.tsx`)
A flexible button component with multiple variants and sizes.

**Variants:**
- `default` - Primary button style
- `destructive` - For dangerous actions
- `outline` - Outlined button
- `secondary` - Secondary style
- `ghost` - Minimal style with hover effect
- `link` - Link-styled button

**Sizes:**
- `default` - Standard size (h-10)
- `sm` - Small size (h-9)
- `lg` - Large size (h-11)
- `icon` - Icon-only square button (h-10 w-10)

**Props:**
- `asChild` - Renders as child component (using Radix Slot)
- `variant` - Button style variant
- `size` - Button size
- Standard HTMLButtonElement props

### Card Components (`card.tsx`)
A collection of card components for building card layouts.

**Components:**
- `Card` - Main container with rounded borders and shadow
- `CardHeader` - Header section with padding
- `CardTitle` - Title heading (h3)
- `CardDescription` - Description text with muted color
- `CardContent` - Main content area
- `CardFooter` - Footer section for actions

## Usage

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Button examples
<Button>Default Button</Button>
<Button variant="outline" size="lg">Large Outline Button</Button>
<Button variant="ghost" asChild>
  <Link href="/page">Link as Button</Link>
</Button>

// Card example
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
</Card>
```

## Dependencies

These components rely on:
- `@radix-ui/react-slot` - For asChild functionality
- `class-variance-authority` - For variant management
- `clsx` and `tailwind-merge` - For className merging (via cn utility)
- Tailwind CSS - For styling
- CSS custom properties defined in `app/globals.css`

## Styling

Components use CSS custom properties for theming:
- `--primary`, `--secondary` - Color schemes
- `--border`, `--ring` - Border and focus styles
- `--radius` - Border radius
- `--foreground`, `--background` - Text and background colors

The `cn` utility function from `@/lib/utils` combines Tailwind classes properly.