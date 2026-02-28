# React Best Practices

## Memo Usage

- Use `memo()` for components that receive stable props and render often
- Prefer memo for leaf components and list items
- Do not over-memo; profile before optimizing

## Stable Keys

- Use stable, unique keys in lists (e.g. `id`, not `index`)
- Keys must be consistent across renders
- Avoid random or generated keys in render

## No Inline Object Props

- Avoid passing inline objects/arrays as props: `style={{ color: 'red' }}`, `items={[]}`
- Define objects/arrays outside render or with `useMemo` when passed to memoized children
- Inline objects cause unnecessary re-renders

## Avoid Unnecessary Re-renders

- Keep state as close to consumers as possible
- Lift state only when necessary
- Use `useCallback` for handlers passed to memoized children
- Use `useMemo` for computed values passed to memoized children

## React Hooks Rules

- Follow rules-of-hooks: only call at top level
- Include all dependencies in useEffect/useMemo/useCallback
- No unstable nested components; define components outside render
