# Crypto Tracker Frontend

A cryptocurrency tracking application built with Next.js 15, React 19, and shadcn/ui components. Features real-time price tracking, portfolio management, price alerts, and AI-powered chatbot.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:3001`

### Installation and Running

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_URL if needed

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Scripts

```bash
npm run dev          # Development with Turbopack
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/), a collection of reusable components built on Radix UI and Tailwind CSS.

### Available Components

- **Button**, **Input**, **Label**, **Form** - Form elements with validation
- **Dialog**, **AlertDialog**, **Sheet** - Modal and slide-out panels
- **Table**, **Select**, **Combobox** - Data display and selection
- **Card**, **Skeleton** - Content containers and loading states
- **ScrollArea** - Styled scrollbars
- **Switch**, **Separator**, **Badge** - UI elements
- **Tooltip**, **HoverCard** - Hover information
- **Pagination** - Page navigation
- **Command Palette** - Quick navigation (Cmd+K / Ctrl+K)
- **Sonner** - Toast notifications

## Command Palette

The Command Palette provides quick access to navigation and actions throughout the application.

### Opening the Command Palette

- **macOS**: `Cmd + K`
- **Windows/Linux**: `Ctrl + K`

### Available Commands

**Navigation:**
- Dashboard
- Portfolio
- Compare Coins
- Price Alerts
- Settings

**Actions:**
- Add Coin to Portfolio
- Create Price Alert
- Open Chat Assistant

### Usage Example

```typescript
import { CommandPalette } from '@/components/CommandPalette'

// Add to your layout or main component
<CommandPalette />
```

The Command Palette automatically registers the keyboard shortcut and provides fuzzy search across all commands.

## Combobox Usage

The Combobox component combines a searchable input with a dropdown list, perfect for selecting from large datasets like cryptocurrency lists.

### Basic Usage

```typescript
import { CoinCombobox } from '@/components/CoinCombobox'

function MyComponent() {
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  
  return (
    <CoinCombobox
      coins={availableCoins}
      value={selectedCoin?.id || ''}
      onChange={(coin) => setSelectedCoin(coin)}
      placeholder="Search for a coin..."
    />
  )
}
```

### Features

- **Search Filtering**: Type to filter coins by name or symbol
- **Keyboard Navigation**: Use arrow keys to navigate, Enter to select, Escape to close
- **Accessibility**: Full keyboard support and screen reader compatible
- **Performance**: Efficiently handles large lists with virtualization

### Keyboard Shortcuts

- `↓` / `↑` - Navigate through options
- `Enter` - Select highlighted option
- `Escape` - Close dropdown
- `Tab` - Move to next form field

## Sonner Toast Notifications

We use [Sonner](https://sonner.emilkowal.ski/) for toast notifications throughout the application.

### Usage

```typescript
import { toast } from 'sonner'

// Success notification
toast.success('Portfolio updated successfully!')

// Error notification
toast.error('Failed to fetch data')

// Loading notification
toast.loading('Processing...')

// Promise-based notification
toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  }
)

// Custom notification with action
toast('Event created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
})
```

### Configuration

The Toaster component is configured in the root layout (`app/layout.tsx`):

```typescript
import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### Best Practices

1. Use `toast.promise()` for async operations
2. Keep messages concise and actionable
3. Use appropriate toast types (success, error, info)
4. Avoid excessive toast notifications
5. Provide actions when relevant (e.g., "Undo" button)

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Test Coverage

The project includes comprehensive testing:
- **Unit Tests**: Component behavior and logic
- **Property-Based Tests**: Universal properties using fast-check
- **Integration Tests**: End-to-end user flows
- **Accessibility Tests**: Keyboard navigation and screen reader support

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities and API
│   ├── test/            # Test files
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json
```

## ✨ Key Features

- **Real-time Crypto Tracking**: Live cryptocurrency price updates
- **Portfolio Management**: Track holdings and portfolio performance
- **Price Alerts**: Set price alerts with email notifications
- **AI Chat Assistant**: AI chatbot with crypto information powered by RAG
- **Command Palette**: Quick navigation with Cmd+K / Ctrl+K
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Accessibility**: Full keyboard navigation and screen reader support
- **Modern UI**: shadcn/ui components with Tailwind CSS 4
- **Toast Notifications**: Beautiful notifications with Sonner
- **Property-Based Testing**: Comprehensive testing with fast-check

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with App Router and Turbopack
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Notifications:** Sonner
- **Icons:** Lucide React, React Icons
- **Authentication:** Auth0 SPA JS
- **HTTP Client:** Axios
- **Testing:** Vitest, Testing Library, fast-check

## 📖 Learn More

### Technologies
- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [shadcn/ui Documentation](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- [Vitest](https://vitest.dev/) - Testing framework
- [fast-check](https://fast-check.dev/) - Property-based testing

### Deployment
Deploy to [Vercel Platform](https://vercel.com/new) - the easiest way to deploy a Next.js app.

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🤝 Contributing

Contributions are welcome! Please read the [Contributing Guide](../README.md#contributing) in the root README.

## 📄 License

MIT License

---
