# Object-Morpher

Object-Morpher is a TypeScript library designed to transform objects based on a predefined schema. It allows for powerful transformations using compute functions or value mappings, making it ideal for shaping data to fit your application's needs.

## Features

- **Compute Functions**: Apply custom functions to properties to compute new values.
- **Value Mappings**: Define possible values and their aliases to quickly standardize data.
- **Alias Support**: Use aliases to refer to properties in a more readable or domain-specific way.
- **TypeScript Support**: Fully typed to enable IntelliSense in your favorite IDE.

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

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

Object-Morpher is MIT licensed.
