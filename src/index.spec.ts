import { ExecutionContext, TreeExecutionContext } from '../src/index';

describe('ExecutionContext', () => {
  it('should run an expression with stored variables', () => {
    const context = new ExecutionContext();
    context.set({ number: 123, string: 'alice' });

    const output = context.execute('string + number');

    expect(output).toBe('alice123');
  });

  it('should run an expression with provided variables', () => {
    const context = new ExecutionContext();
    context.set({ number: 123, string: 'alice' });

    const output = context.execute('string + number', { number: 42, string: 'bob' });

    expect(output).toBe('bob42');
  });

  it('should reset stored variables', () => {
    const context = new ExecutionContext(null);

    context.set({ number: 123 });
    context.reset();

    expect(() => context.execute('number + 1')).toThrow(new ReferenceError('number is not defined'));
  });
});

describe('TreeExecutionContext', () => {
  it('should run an expression using values from parent context', () => {
    const rootContext = new TreeExecutionContext({ text: 'the answer is ' });
    const middleContext = rootContext.fork();
    const finalContext = middleContext.fork();
    
    rootContext.set({ number: 1 });
    middleContext.set({ number: 42 });

    const output = finalContext.execute('this.text + number');

    expect(output).toBe('the answer is 42');
  });
})

describe('docs', () => {
  it('should run samples from documentation', () => {
    const context = new ExecutionContext();

    const object = { a: 40, b: 2 };
    const alpha = context.set({ a:1, b: 2 }).execute('a + b');
    const beta = context.execute('a + b', { a: 7, b: 3 });
    const charlie = new ExecutionContext(object).execute('this.a + this.b');

    expect(alpha).toBe(3);
    expect(beta).toBe(10);
    expect(charlie).toBe(42);
  });
});
