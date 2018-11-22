import { Entity } from "typeorm";
const deepmerge = require("deepmerge");

const identity = value => value;

import { mapper, decorators } from "graphql-constraint-directive";

import * as classDecorators from "class-validator/build/decorators";

const decorators = {
  ...decorators,
  ...classDecorators
};

export const decorate = (entityClazz, propertiesMap, entityName) => {
  const entityField = entityClazz[name];
  const propNames = Object.keys(propertiesMap);
  propNames.map(propName => {
    const propertyMap = propertiesMap[propName];
    const decoratorMap = mapper.mapToClassValidators(
      propertyMap.directives.constraints
    );
    const decoratorKeys = Object.keys(decoratorMap);
    decoratorKeys.map(decName => {
      const decorateArgs = decoratorMap[decName];
      const decorator = decorators[decName];
      const decorate = decorator(...decorateArgs);
      decorate(entityField, propName);
    });
  });
};

export const buildEntityClasses = (
  connection,
  entityStore = {},
  decorate = identity,
  opts = {}
) => {
  const merge = opts.merge || deepmerge;

  const entityMetaDatas = connection.entityMetaDatas.reduce((acc, metaData) => {
    const { targetName } = metaData;
    // targetName is the entity (class) name
    // merge metadata for entity
    acc[targetName] = merge({
      ...(acc[targetName] || {}),
      ...metaData
    });
  }, {});

  const entityNames = Object.keys(entityMetaDatas);

  return entityNames.reduce((acc, entityName) => {
    const metaData = entityMetaDatas[entityName];
    const { propertiesMap } = metaData;
    // create blank @Entity decorated class
    const entityClazz = Entity(class {});
    // decorate entity class further and add class to map
    acc[entityName] = decorate(entityClazz, propertiesMap, entityName);
    return acc;
  }, entityStore);
};
