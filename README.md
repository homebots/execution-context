# @homebots/execution-context

Used to evaluate Javascript expressions.

## Usage

```typescript
const context = new ExecutionContext();

const object = { a: 40, b: 2 };
const alpha = context.set({ a:1, b: 2 }).execute('a + b');
const beta = context.execute('a + b', { a: 7, b: 3 });
const charlie = new ExecutionContext(object).execute('this.a + this.b');

expect(alpha).toBe(3);
expect(beta).toBe(10);
expect(charlie).toBe(42);
```
