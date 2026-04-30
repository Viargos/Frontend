#!/bin/bash

# Create new module script
# Usage: ./scripts/create-module.sh module-name

set -e  # Exit on error

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
  echo "❌ Error: Module name required"
  echo "Usage: ./scripts/create-module.sh module-name"
  exit 1
fi

# Validate module name (lowercase, hyphens only)
if ! [[ "$MODULE_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "❌ Error: Module name must be lowercase with hyphens only"
  echo "Examples: user-profile, api-client, shopping-cart"
  exit 1
fi

MODULE_DIR="src/modules/$MODULE_NAME"

# Check if module already exists
if [ -d "$MODULE_DIR" ]; then
  echo "❌ Error: Module '$MODULE_NAME' already exists at $MODULE_DIR"
  exit 1
fi

echo "🚀 Creating module: $MODULE_NAME"
echo ""

# Create directory structure
mkdir -p "$MODULE_DIR/components"
mkdir -p "$MODULE_DIR/services"
mkdir -p "$MODULE_DIR/types"
mkdir -p "$MODULE_DIR/validations"

# Create barrel exports
cat > "$MODULE_DIR/components/index.ts" << 'EOF'
// Export your components here
// Example: export * from './MyComponent';
EOF

cat > "$MODULE_DIR/services/index.ts" << 'EOF'
// Export your services here
// Example: export * from './MyService';
EOF

cat > "$MODULE_DIR/types/index.ts" << 'EOF'
// Export your types here
// Example: export * from './my.types';
EOF

cat > "$MODULE_DIR/validations/index.ts" << 'EOF'
// Export your validations here
// Example: export * from './MyValidation';
EOF

# Create main module index
cat > "$MODULE_DIR/index.ts" << 'EOF'
export * from './components';
export * from './services';
export * from './types';
export * from './validations';
EOF

# Convert module name to PascalCase for names
# Example: user-profile -> UserProfile
MODULE_PASCAL=$(echo "$MODULE_NAME" | sed -r 's/(^|-)([a-z])/\U\2/g')

# Create README
cat > "$MODULE_DIR/README.md" << EOF
# $MODULE_PASCAL Module

## Purpose

[Describe what this module does and its responsibilities]

## Dependencies

- \`@/modules/common\` - [Describe why this dependency exists]

## Public API

### Components

- \`<ComponentName />\` - [Description]

### Services

- \`ServiceName\` - [Description]

### Types

- \`TypeName\` - [Description]

## Usage Example

\`\`\`typescript
import { ComponentName } from '@/modules/$MODULE_NAME';

export default function Page() {
  return <ComponentName />;
}
\`\`\`

## Internal Structure

\`\`\`
$MODULE_NAME/
├── components/     # UI components
├── services/       # API calls and business logic
├── types/          # TypeScript type definitions
├── validations/    # Zod schemas for runtime validation
└── index.ts        # Barrel export of public API
\`\`\`

## Guidelines

- **Components:** React components specific to this module
- **Services:** Business logic and API integration
- **Types:** TypeScript types and interfaces
- **Validations:** Zod schemas for forms and API responses

Always export through barrel exports (\`index.ts\`) to maintain clean import paths.
EOF

# Create example component
cat > "$MODULE_DIR/components/${MODULE_PASCAL}Widget.tsx" << EOF
/**
 * Example component for $MODULE_PASCAL module.
 * Replace this with your actual component.
 */
export const ${MODULE_PASCAL}Widget = (props: {
  title: string;
}) => {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>$MODULE_PASCAL module component</p>
    </div>
  );
};
EOF

# Update component index to export example
cat > "$MODULE_DIR/components/index.ts" << EOF
export * from './${MODULE_PASCAL}Widget';
EOF

echo "✅ Module structure created at $MODULE_DIR"
echo ""
echo "📁 Created files:"
echo "  - $MODULE_DIR/components/${MODULE_PASCAL}Widget.tsx"
echo "  - $MODULE_DIR/components/index.ts"
echo "  - $MODULE_DIR/services/index.ts"
echo "  - $MODULE_DIR/types/index.ts"
echo "  - $MODULE_DIR/validations/index.ts"
echo "  - $MODULE_DIR/index.ts"
echo "  - $MODULE_DIR/README.md"
echo ""
echo "🎯 Next steps:"
echo "  1. Update $MODULE_DIR/README.md with module details"
echo "  2. Create your components in $MODULE_DIR/components/"
echo "  3. Export them from $MODULE_DIR/components/index.ts"
echo "  4. Create services in $MODULE_DIR/services/ if needed"
echo "  5. Define types in $MODULE_DIR/types/ if needed"
echo "  6. Add validations in $MODULE_DIR/validations/ if needed"
echo ""
echo "📚 Usage in pages:"
echo "  import { ${MODULE_PASCAL}Widget } from '@/modules/$MODULE_NAME';"
echo ""
echo "Happy coding! 🚀"
