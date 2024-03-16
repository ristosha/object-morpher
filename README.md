# Object-Morpher

Object-Morpher is an advanced transformation utility designed to work with single-level object structures, such as command-line arguments. It serves as an extension and rewrite of the previous library, alias-mapper, with enhanced capabilities to handle complex data transformations while maintaining a focus on single-level initial objects.

## Features

1. **Extended Functionality**: Building upon the foundation of my previous library ([alias-mapper](https://github.com/ristosha/alias-mapper)), Object-Morpher introduces additional features like dynamic compute functions and value mappings, offering more power and flexibility in data shaping.

2. **Single-Level Object Focus**: Despite its advanced features, Object-Morpher remains targeted at processing **single-level** initial objects, ensuring simplicity and ease of use where complex nested structures are not required.

3. **Value Parsing**: It is recommended to use a parsing library such as [**zod**](https://github.com/colinhacks/zod) for handling value parsing and type safety, which complements Object-Morpher's transformation capabilities.

4. **TypeScript Support**: Fully typed to enable IntelliSense in your favorite IDE.

By leveraging Object-Morpher, developers can easily manipulate data structures to fit their application's needs, streamlining the process of data handling and transformation.

It's primarily used with Bun, so use:
```shell
bun add github:ristosha/object-morpher
```

or just npm:
```shell
npm install object-morpher
```
## Usage

First, import the library:

```typescript
import { transformObject } from 'object-morpher';
```

Define your schema:

```typescript
const schema = {
  age: {
    _compute: (val: number) => val + 1,
    _aliases: ['profileAge'],
    _values: {
      "60": "old",
      "30": "middle",
      "12": "young"
    }
  },
  // ... other schema definitions
};
```

Transform your object:

```typescript
const user = {
  profileAge: "young",
  // ... other user properties
};

const transformedUser = transformObject(user, schema);
```

Other examples you can find in tests.

## ⚠️ Caution   

For frequent use cases, it is highly recommended to pre-generate the alias map using `generateAliasMap(schema)`. This practice improves performance by avoiding the overhead of recalculating the map for each transformation, especially when dealing with large schemas or processing numerous objects.

## API Reference

### `transformObject(obj, schema, aliasMap?)`

Transforms an object based on the provided schema and optional alias map.

- `obj`: The object to transform.
- `schema`: The schema definition for the transformation.
- `aliasMap`: Optional map of aliases to property paths.

### Schema Definition

A schema is defined as an object where each key corresponds to a property in the source object. Each key's value is an object that can have the following properties:

- `_compute`: A function that takes the property's value and returns a new value.
- `_values`: An object mapping possible values to their aliases. (don't work with `_compute`)
- `_aliases`: An array of strings representing aliases for the property.

## License

Object-Morpher is MIT licensed.
