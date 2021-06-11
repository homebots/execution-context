# @homebots/execution-context

Used to evaluate Javascript expressions.

## Usage

```typescript
const context = new ExecutionContext();

const object = { a: 40, b: 2 };
const alpha = context.set({ a: 1, b: 2 }).execute('a + b');
const beta = context.execute('a + b', { a: 7, b: 3 });
const charlie = new ExecutionContext(object).execute('this.a + this.b');

expect(alpha).toBe(3);
expect(beta).toBe(10);
expect(charlie).toBe(42);
```

## Why?

Because sometimes we need to execute little bits of Javascript using different values for the same variables, based on the context where that expression is executed.

This is a common scenario in front-end applications where expressions are used in event handlers, like attributes of a template syntax.

For example:

```html
<input type="inputType" /> <button title="this.title" on-click="this.doSomething()">ok</button>
```

## API

### `ExecutionContext`

```typescript
const targetThis = { number: 1 };

// give a value for `this` in `this.xyz`
const context = new ExecutionContext(targetThis);

// set variables
context.set({ variable: 10 });

// execute an expression
context.execute('this.number + variable');
```

### `TreeExecutionContext`

```typescript
const targetThis = { text: 'Hello, ' };
const context = new TreeExecutionContext(targetThis);

// fork the context
const alice = context.fork();
const sandy = context.fork();

// execute expressions
alice.execute('this.text + name', { name: 'Alice' });
sandy.execute('this.text + name', { name: 'Sandy' });
```
