import { Entity } from "typeorm";
const deepmerge = require("deepmerge");

const identity = value => value;

import { mapper, decorators } from "graphql-constraint-directive";

import * as classDecorators from "class-validator/build/decorators";

// class decorator to add validate() method to a class
export const Validator = target => {
  target.prototype.validate = async function() {
    return await validate(this);
  };
  //we add it to the prototype, so every instance has access to the `bam` property
};

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
  const classDecorators = opts.classDecorators || [Entity, Validator];

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

  const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

  return entityNames.reduce((acc, entityName) => {
    const metaData = entityMetaDatas[entityName];
    const { propertiesMap } = metaData;
    // create blank @Entity decorated class
    // todo: use composition using list of class decorators
    const entityClazz = class {};
    const decoratedEntityClass = pipe(...classDecorators)(entityClazz);
    // decorate entity class further and add class to map
    acc[entityName] = decorate(decoratedEntityClass, propertiesMap, entityName);
    return acc;
  }, entityStore);
};
