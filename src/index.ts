type Fn = Function;
const expressionCache = new Map<string, Fn>();

export type Variables = Record<string, any>;

export interface Context {
  set(locals: Variables): Context;
  reset(): Context;
  execute<T>(expression: string, newValues?: Variables): T;
}

export abstract class AbstractContext implements Context {
  protected thisValue: object;
  protected variables: Variables = {};

  abstract set(locals: Variables): Context;
  abstract reset(): Context;
  abstract execute<T>(expression: string, newValues?: Variables): T;

  constructor(thisValue: object = null) {
    this.thisValue = thisValue;
    this.reset();
  }

  protected compile(expression: string, variables?: Variables) {
    const mergedVariables = this.mergeVariables(variables);
    const variableNames = Object.keys(mergedVariables);
    const values = variableNames.map((key) => mergedVariables[key]);
    const cacheKey = expression + variableNames.join('');

    if (!expressionCache.has(cacheKey)) {
      expressionCache.set(cacheKey, Function(...variableNames, `return ${expression}`));
    }

    return expressionCache.get(cacheKey).bind(this.thisValue, ...values);
  }

  protected mergeVariables(additionalVariables?: Variables) {
    return Object.assign({}, this.variables, additionalVariables);
  }
}

export class ExecutionContext extends AbstractContext implements Context {
  constructor(thisValue: object = null) {
    super(thisValue);
  }

  set(locals: Variables) {
    Object.assign(this.variables, locals);
    return this;
  }

  reset() {
    this.variables = {};
    return this;
  }

  execute(expression: string, newValues?: Variables) {
    const fn = this.compile(expression, newValues);
    return fn();
  }
}

export class TreeExecutionContext extends ExecutionContext {
  constructor(thisValue: object = null, protected parent?: ExecutionContext) {
    super(thisValue);
    this.reset();
  }

  fork(newContext?: object) {
    return new TreeExecutionContext(newContext || this.thisValue, this);
  }

  protected mergeVariables(additionalVariables?: Variables) {
    return Object.assign(
      {},
      (this.parent && (this.parent as TreeExecutionContext).mergeVariables()) || {},
      super.mergeVariables(additionalVariables),
    );
  }
}

export const NullContext = new ExecutionContext();
