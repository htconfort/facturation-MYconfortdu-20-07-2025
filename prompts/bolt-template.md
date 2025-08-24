# Template Bolt.new - Facturation MyComfort

## Prompt optimisé pour Bolt.new

Create a modern React TypeScript application component for MyComfort invoicing system.

### 🎯 PROJECT REQUIREMENTS
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (mobile-first)
- **Target**: iPad-optimized for field technicians
- **Performance**: Fast loading, smooth interactions

### 📱 UX GUIDELINES
- Touch-friendly interface (minimum 44px touch targets)
- Clear visual hierarchy with good contrast
- Loading states and error handling
- Responsive design (mobile → tablet → desktop)
- Intuitive navigation patterns

### 🔧 TECHNICAL SPECS
- Functional components with hooks
- TypeScript with practical typing
- Modern ES2022+ syntax (async/await, destructuring)
- Proper error boundaries
- Performance optimizations (React.memo, useMemo, useCallback)

### 🎨 STYLING REQUIREMENTS
- Tailwind utility classes
- Custom color scheme: myconfort-cream, myconfort-dark
- Smooth animations (transition-all duration-200)
- Consistent spacing using Tailwind scale
- Dark mode consideration

### 📋 COMPONENT STRUCTURE
```typescript
interface ComponentProps {
  // Define clear, typed props
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);
  
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX structure */}
    </div>
  );
};

export default Component;
```

### 🚀 FEATURES TO IMPLEMENT
- Form validation with proper error states
- Loading spinners and skeleton screens
- Optimistic updates for better UX
- Keyboard navigation support
- Touch gestures for mobile

### 🔌 INTEGRATION POINTS
- Supabase for data persistence
- PDF generation for invoices
- File upload to Google Drive
- Payment processing with Alma
- N8N webhook integration

**When creating components:**
1. Start with the basic structure and props
2. Add state management and handlers
3. Implement the UI with Tailwind
4. Add loading and error states
5. Include accessibility features
6. Optimize for performance

---

**CREATE THIS COMPONENT:**
[YOUR SPECIFIC COMPONENT REQUEST HERE]
