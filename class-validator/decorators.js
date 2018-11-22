import { registerDecorator } from "class-validator";

export function StartsWith(property, validationOptions) {
  return function(object, propertyName) {
    registerDecorator({
      name: "startsWith",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args) {
          const [testName] = args.constraints;
          const testValue = args.object[testName];
          return (
            typeof value === "string" &&
            typeof testValue === "string" &&
            value.startsWith(testValue)
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        }
      }
    });
  };
}

export function EndsWith(property, validationOptions) {
  return function(object, propertyName) {
    registerDecorator({
      name: "endsWith",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args) {
          const [testName] = args.constraints;
          const testValue = args.object[testName];
          return (
            typeof value === "string" &&
            typeof testValue === "string" &&
            value.endsWith(testValue)
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        }
      }
    });
  };
}

export function MultipleOf(property, validationOptions) {
  return function(object, propertyName) {
    registerDecorator({
      name: "multipleOf",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args) {
          const [testName] = args.constraints;
          const multiple = args.object[testName];
          return (
            typeof value === "number" &&
            typeof multiple === "number" &&
            value % multiple !== 0
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        }
      }
    });
  };
}
