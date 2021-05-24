type Fn = Function;

export type Variables = Record<string, any>;

const expressionCache = new Map<string, Fn>();

export class ExecutionContext {
  private variables: Variables;

  constructor(private thisValue: object = null, private parent?: ExecutionContext) {
    this.reset();
  }

  set(locals: Variables) {
    Object.assign(this.variables, locals);
    return this;
  }

  reset() {
    this.variables = {};
    return this;
  }

  fork(newContext?: object) {
    return new ExecutionContext(newContext || this.thisValue, this);
  }

  execute(expression: string, newValues?: Variables) {
    const fn = this.compile(expression, newValues);
    return fn();
  }

  private compile(expression: string, variables?: Variables) {
    const mergedVariables = this.mergeVariables(variables);
    const variableNames = Object.keys(mergedVariables);
    const values = variableNames.map((key) => mergedVariables[key]);
    const cacheKey = expression + variableNames.join('');

    if (!expressionCache.has(cacheKey)) {
      expressionCache.set(cacheKey, Function(...variableNames, `return ${expression}`));
    }

    return expressionCache.get(cacheKey).bind(this.thisValue, ...values);
  }

  private mergeVariables(additionalVariables?: Variables) {
    const variables = {};

    if (this.parent) {
      Object.assign(variables, this.parent.mergeVariables());
    }

    if (this.variables) {
      Object.assign(variables, this.variables);
    }

    if (additionalVariables) {
      Object.assign(variables, additionalVariables);
    }

    return variables;
  }
}

export class SealedExecutionContext extends ExecutionContext {
  constructor(parent?: ExecutionContext) {
    super(null, parent);
  }

  set(_: Variables) {
    return this;
  }
  reset() {
    return this;
  }
}

export const NullContext = new SealedExecutionContext();
