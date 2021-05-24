import { ExecutionContext, SealedExecutionContext } from '../src/index';

describe('ExecutionContext', () => {
  it('should run an expression with provided variables', () => {
    const context = new ExecutionContext();
    context.set({ number: 123, string: 'alice' });

    const output = context.execute('string + number');

    expect(output).toBe('alice123');
  });

  it('should run the same expression multiple times', () => {
    const context = new ExecutionContext(null);
    context.set({ number: 123 });

    context.execute('number + 1');
    context.execute('number + 1');
    const output = context.execute('number + 1');

    expect(output).toBe(124);
  });

  it('should run an expression using values from a parent context', () => {
    const parentContext = new ExecutionContext({ prefix: 'the value is ' });
    parentContext.set({ number: 123 });

    const output = parentContext.fork().set({ number: 456 }).execute('this.prefix + number');

    expect(output).toBe('the value is 456');
  });

  it('should merge the variables from current context, parent and additional ones', () => {
    const parentContext = new ExecutionContext();

    parentContext.set({ number: 123 });

    const secondContext = parentContext.fork();
    secondContext.set({ string: 'alice' });

    const thirdContext = secondContext.fork();

    const output = thirdContext.execute('number + string + foo', { foo: 'foo' });

    expect(output).toBe('123alicefoo');
  });

  it('allows to reset local values', () => {
    const context = new ExecutionContext(null);

    context.set({ number: 123 });
    context.reset();

    expect(() => context.execute('number + 1')).toThrow(new ReferenceError('number is not defined'));
  });
});

describe('SealedExecutionContext', () => {
  it('should prevent context modifications', () => {
    const context = new ExecutionContext(null);
    context.set({ number: 123 });

    const sealedContext = new SealedExecutionContext(context);
    sealedContext.reset();
    sealedContext.set({ local: true });

    expect(() => sealedContext.execute('local')).toThrow(new ReferenceError('local is not defined'));
    expect(sealedContext.execute('number')).toBe(123);
  });
});

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
