import { assertEquals } from 'https://deno.land/std@0.220.1/assert/assert_equals.ts'
import { generateAliasMap, type Schema, transformObject } from '../src/mod.ts'

Deno.test('inline composite transformation', () => {
  const obj = { name: 'John', age: 30 }

  const schema: Schema<typeof obj> = {
    name: { _compute: (val: string) => val.toUpperCase() },
    age: { _compute: (val: number) => val + 1 }
  }

  const expected = { name: 'JOHN', age: 31 }
  assertEquals(transformObject(obj, schema), expected)
})

Deno.test('alias transformation', () => {
  const obj = { firstName: 'Jane', age: 28 }
  const schema: Schema = { name: { _aliases: ['firstName'] }, age: { _compute: (val: number) => val + 2 } }
  const expected = { name: 'Jane', age: 30 }
  assertEquals(transformObject(obj, schema), expected)
})

Deno.test('composite keys', () => {
  const obj = { fullName: 'Alice Wonderland' }
  const schema: Schema = {
    __composite: {
      fullName: {
        _compute: (val: string) => {
          const [firstName, lastName] = val.split(' ')
          return { firstName, lastName }
        }
      }
    }
  }
  const expected = { firstName: 'Alice', lastName: 'Wonderland' }
  assertEquals(transformObject(obj, schema), expected)
})

interface UserProfile {
  age: string;
  name: string;
  interests: string[];
}

interface UserStyle {
  background: string;
  text: string;
}

interface User {
  id: string;
  profile: UserProfile;
  style: UserStyle;
}

Deno.test('difficult user case', () => {
  const user = {
    id: 'user-123',
    profileAge: 'old',
    profileInterestedIn: ['CODING', 'MUSIC', 'ART'],
    fullName: 'JOHN DOE',
    darkTheme: true
  }

  const schema: Schema<User> = {
    id: { _aliases: ['user-123'] },
    profile: {
      name: {
        _compute: (val: string) => val.toUpperCase(),
        _aliases: ['fullName']
      },
      age: {
        _aliases: ['profileAge'],
        _values: {
          "60": ['old'],
          "20": ['young']
        }
      },
      interests: {
        _compute: (interests: string[]) => interests.map(interest => interest.toUpperCase()),
        _aliases: ['profileInterestedIn']
      }
    },
    __composite: {
      darkTheme: {
        _aliases: ['darkTheme'],
        style: {
          background: 'dark',
          text: 'white'
        }
      }
    }
  }

  const expected = {
    id: 'user-123',
    profile: {
      age: "60",
      name: 'JOHN DOE',
      interests: ['CODING', 'MUSIC', 'ART']
    },
    style: {
      background: 'dark',
      text: 'white'
    }
  }

  const alias = generateAliasMap(schema)
  console.log(alias)

  assertEquals(transformObject(user, schema), expected)
})
