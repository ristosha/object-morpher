// deno-lint-ignore-file
export type Schema<T extends object = any> = {
  [P in keyof T]?: SchemaEntry<T[P]>
} & {
  __composite?: CompositeEntry<T>
};

export type SchemaEntry<T> = T extends any[]
  ? { _aliases?: string[], _compute?: (value: any) => any, _values?: Record<string, any> }
  : T extends object
    ? { [P in keyof T]?: SchemaEntry<T[P]> } & {
    _aliases?: string[],
    _compute?: (value: any) => any,
    _values?: Record<string, any>
  }
    : { _aliases?: string[], _compute?: (value: any) => any, _values?: Record<string, any> };

export type CompositeEntry<T extends object> = {
  [K: string]: CompositeEntryItem<T>
};

export type CompositeEntryItem<T> = {
  _aliases?: string[],
  _compute?: (value: any) => Partial<T>
} & Partial<T>;

/**
 * Generates a map of aliases to their corresponding paths within a schema object.
 *
 * @param schema The schema object to generate aliases from.
 * @return A Map where each key is an alias and the value is an array of strings representing the path.
 * @example
 * // Assuming schema is { user: { _aliases: ['person'], name: { _aliases: ['fullName'], first: 'John' } } }
 * // generateAliasMap(schema) returns a Map with 'person' -> ['user'] and 'fullName' -> ['user', 'name']
 */
export function generateAliasMap<T extends object> (schema: Schema<T>): Map<string, string[]> {
  const map = new Map<string, string[]>()

  function traverseSchema (obj: any, path: string[] = []): void {
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]) => {
        if (key.startsWith('__')) return

        path.push(key)

        const aliases = (value as any)._aliases
        if (Array.isArray(aliases)) {
          aliases.forEach((alias: string) => {
            map.set(alias, [...path])
          })
        }

        traverseSchema(value, path)
        path.pop() // back to initial state
      })
    }
  }

  traverseSchema(schema)
  return map
}

/**
 * Retrieves the value at the specified path within a schema object.
 * If the path does not exist, returns undefined.
 *
 * @param schema The schema object to search within.
 * @param path An array of strings representing the path to the desired value.
 * @return The value at the specified path or undefined if not found.
 * @example
 * // Assuming schema is { user: { id: 1, name: 'John Doe' } }
 * // getEntryByPath(schema, ['user', 'name']) returns 'John Doe'
 */
export function getEntryByPath (schema: any, path: string[]): SchemaEntry<any> | undefined {
  return path.reduce((acc, key) => acc?.[key], schema)
}

/**
 * Sets a value at a specified path within an object, creating nested objects if necessary.
 * @param {Object} obj - The object to modify.
 * @param {string|string[]} path - The path at which to set the value.
 * @param {any} value - The value to set.
 * @returns {Object} The updated object.
 * @example
 * // returns { a: { b: { c: 1 } } }
 * set({}, 'a.b.c', 1);
 */
export function set<T extends Record<string, any>> (obj: T, path: string | string[], value: any): T {
  const keys = typeof path === 'string' ? path.split('.') : [...path]
  let current: Record<string, any> = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!current[key]) current[key] = {}
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
  return obj
}

function getAliasFromValues(values: Record<any, string[]>, value: any): string | number {
  for (const key in values) {
    for (const keyValue of values[key]) {
      if (String(value) === String(keyValue)) {
        return key
      }
    }
  }
  return value;
}


/**
 * Transforms an object based on a given schema and alias map, handling composite entries.
 * @param obj The source object to transform.
 * @param schema The schema defining the structure and computations for the transformation.
 * @param aliasMap A map of aliases to their corresponding paths in the schema.
 * @returns The transformed object.
 */
export function transformObject<T extends object> (obj: Record<string, any>, schema: Schema<T>, aliasMap?: Map<string, string[]>): T {
  const result: T = {} as T
  if (!aliasMap) {
    aliasMap = generateAliasMap(schema)
  }

  const composite = schema.__composite || {}
  for (const compositeKey in composite) {
    if (Object.hasOwn(obj, compositeKey)) {
      const compositeValue = composite[compositeKey]
      if (typeof compositeValue._compute === 'function') {
        const computedValue = compositeValue._compute(obj[compositeKey])
        Object.assign(result, computedValue)
      } else {
        const { _aliases, ...compositeStructure } = compositeValue
        Object.assign(result, compositeStructure)
      }
      delete obj[compositeKey]
    }
  }

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      const path = aliasMap.get(key) || [key]
      const schemaEntry = getEntryByPath(schema, path)
      const value = obj[key]
      let computedValue: any

      if (schemaEntry && typeof schemaEntry._compute === 'function') {
        computedValue = schemaEntry._compute(value)
      } else if (schemaEntry && schemaEntry._values) {
        computedValue = getAliasFromValues(schemaEntry._values, value) || value
      } else {
        computedValue = value
      }


      set(result, path, computedValue)
    }
  }

  return result
}

