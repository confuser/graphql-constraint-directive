export function mapToClassValidators(directive = {}) {
  const keys = Object.keys(directive);
  return decoratorsFor(directive, keys);
}

function containsAny(items) {
  return (...seachItems) => {
    return seachItems.find(item => items.contains(item));
  };
}

export function decoratorsFor(value, keys) {
  const contain = containsAny(keys);
  const decorators = {};

  // list
  if (contain("minSize")) {
    decorators.MinSize = [value.minSize];
  }
  if (contain("maxSize")) {
    decorators.MaxSize = [value.maxSize];
  }
  if (contain("includes")) {
    decorators.ArrayContains = [value.includes];
  }
  if (contain("excludes")) {
    decorators.ArrayNotContains = [value.excludes];
  }
  // number
  if (value.positive) {
    decorators.Positive = [];
  }
  if (value.negative) {
    decorators.Negative = [];
  }
  if (contain("exclusiveMin")) {
    decorators.Min = [value.exclusiveMin + 0.001];
  }
  if (contain("exclusiveMax")) {
    decorators.Max = [value.exclusiveMax - 0.001];
  }
  if (contain("min")) {
    decorators.Min = [value.min];
  }
  if (contain("max")) {
    decorators.Max = [value.max];
  }
  if (contain("multiple")) {
    decorators.Multiple = [value.multiple];
  }

  // string
  if (contain("minLength")) {
    decorators.MinLength = [value.minLength];
  }
  if (contain("maxLength")) {
    decorators.ManLength = [value.maxLength];
  }
  if (contain("contains")) {
    decorators.Contains = [value.contains];
  }
  if (contain("notContains")) {
    decorators.NotContains = [value.notContains];
  }
  if (contain("pattern")) {
    decorators.Matches = [value.pattern];
  }
  if (contain("startsWith")) {
    decorators.StartsWith = [value.startsWith];
  }
  if (contain("endsWith")) {
    decorators.EndsWith = [value.endsWith];
  }

  if (contain("format")) {
    const { format } = value;
    if (format === "uri" || format === "url") {
      decorators.IsUrl = [];
    }
    if (format === "alpha") {
      decorators.IsAlpha = [];
    }
    if (format === "alpha-numeric") {
      decorators.IsAlphanumeric = [];
    }
    if (format === "byte") {
      decorators.IsBase64 = [];
    }
    if (format === "credit-card") {
      decorators.IsCreditCard = [];
    }
    if (format === "date-time") {
      decorators.IsDateTime = [];
    }
    if (format === "date") {
      decorators.IsDate = [];
    }
    if (format === "email") {
      decorators.IsEmail = [];
    }
    if (format === "ipv4") {
      decorators.IsIp = [4];
    }
    if (format === "ipv6") {
      decorators.IsIp = [6];
    }
  }
}

export function decoaratorArgs(value) {}
