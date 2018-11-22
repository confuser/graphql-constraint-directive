import { Entity } from "typeorm";

const identity = value => value;

import { mapper, decorators } from "graphql-constraint-directive";

import * as classDecorators from "class-validator/build/decorators";

const decorators = {
  ...decorators,
  ...classDecorators
};

export const decorate = (entityClazz, propertyMap, name) => {
  const decoratorMap = mapper.mapToClassValidators(
    propertyMap.directives.constraints
  );
  const entityField = entityClazz[name];
  const decoratorKeys = Object.keys(decoratorMap);
  const propKeys = Object.keys(propertyMap);
  propKeys.map(propKey => {
    decoratorKeys.map(decKey => {
      const decorateArgs = decoratorMap[decKey];
      const decorate = decorators[decKey];
      decorate(...decorateArgs)(entityField, propKey);
    });
  });
};

export function buildEntityClasses(
  connection,
  entityStore = {},
  decorate = identity
) {
  const entityMetaDatas = connection.entityMetaDatas.reduce((acc, data) => {
    return {
      ...acc,
      ...data
    };
  }, {});

  const { propertiesMap } = entityMetaDatas;
  const entityNames = Object.keys(propertiesMap);

  return entityNames.reduce((acc, name) => {
    // create blank @Entity decorated class
    const entityClazz = Entity(class {});
    const propertyMap = propertiesMap[name];
    // decorate entity class further and add class to map
    acc[name] = decorate(entityClazz, propertyMap, name);
    return acc;
  }, entityStore);
}
