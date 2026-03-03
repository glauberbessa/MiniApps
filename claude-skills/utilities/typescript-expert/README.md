# /typescript-expert

**TypeScript type system, advanced types, and type-level programming.**

Use this skill when working with TypeScript, designing type systems, or solving typing problems.

---

## What This Skill Does

Teaches **TypeScript type thinking**. Covers:
- 🔷 Type fundamentals and primitives
- 🔀 Advanced types (unions, intersections, generics)
- 📐 Type inference and assertion
- 🛠️ Utility types (Partial, Pick, Record, etc.)
- 🔧 Generic patterns and constraints
- 📝 Declaration files (.d.ts)
- ⚙️ tsconfig.json configuration
- 🎯 Common typing patterns

---

## Basic Types

```typescript
// Primitives
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let any_val: any = "anything"; // avoid!
let unknown_val: unknown = "safe";

// Collections
let arr: string[] = ["a", "b"];
let tuple: [string, number] = ["hello", 42];
let obj: { name: string; age: number } = { name: "John", age: 30 };

// Union types (multiple types)
let id: string | number = 123;
if (typeof id === "string") {
  console.log(id.toUpperCase());
}

// Literal types (specific values)
let status: "active" | "inactive" = "active";

// Functions
function add(a: number, b: number): number {
  return a + b;
}

const greet = (name: string): string => `Hello, ${name}`;
```

---

## Generic Types

### Basic Generics

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello");
identity<number>(42);
identity("inferred"); // type inferred

// Generic interface
interface Container<T> {
  value: T;
  getValue(): T;
}

const numContainer: Container<number> = {
  value: 42,
  getValue() { return this.value; }
};

// Generic class
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }
}
```

### Generic Constraints

```typescript
// Constraint: T must have 'length' property
function getLength<T extends { length: number }>(obj: T): number {
  return obj.length;
}

getLength("hello"); // works
getLength([1, 2, 3]); // works
getLength(123); // error

// Constraint: T extends class
interface HasId {
  id: number;
}

function printId<T extends HasId>(obj: T): void {
  console.log(obj.id);
}

// Default type
type Result<T = string> = { data: T; error: null } | { data: null; error: string };
```

---

## Union and Intersection Types

### Union Types

```typescript
// Union: one OR the other
type Status = "success" | "error" | "loading";
type Id = string | number;

function processId(id: Id): void {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

// Discriminated union
type Result =
  | { status: "success"; data: unknown }
  | { status: "error"; error: string };

function handle(result: Result) {
  if (result.status === "success") {
    console.log(result.data);
  } else {
    console.log(result.error);
  }
}
```

### Intersection Types

```typescript
// Intersection: both properties
interface A { a: string }
interface B { b: number }

type AB = A & B;
const obj: AB = { a: "hello", b: 42 };

// Merge types
type Combined = { name: string } & { age: number };
const person: Combined = { name: "John", age: 30 };
```

---

## Utility Types

| Type | Purpose | Example |
|------|---------|---------|
| `Partial<T>` | All fields optional | `Partial<User>` |
| `Required<T>` | All fields required | `Required<User>` |
| `Readonly<T>` | All fields readonly | `Readonly<User>` |
| `Pick<T, K>` | Select fields | `Pick<User, "name" | "email">` |
| `Omit<T, K>` | Exclude fields | `Omit<User, "password">` |
| `Record<K, T>` | Key-value map | `Record<Status, string>` |
| `Exclude<T, U>` | Remove types | `Exclude<"a" | "b", "a">` |
| `Extract<T, U>` | Keep types | `Extract<"a" | "b", "a">` |

### Examples

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial: all optional
type PartialUser = Partial<User>;
const update: PartialUser = { name: "John" }; // ok

// Pick: only specific fields
type UserPreview = Pick<User, "id" | "name">;
const preview: UserPreview = { id: 1, name: "John" };

// Omit: exclude fields
type PublicUser = Omit<User, "password">;
const pub: PublicUser = { id: 1, name: "John", email: "..." };

// Record: key-value
type Status = "active" | "inactive" | "pending";
type StatusCount = Record<Status, number>;
const counts: StatusCount = {
  active: 5,
  inactive: 2,
  pending: 3
};
```

---

## Advanced Patterns

### Conditional Types

```typescript
// If T extends U, then X, else Y
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<number>;   // false

// Practical: extract array element type
type Flatten<T> = T extends Array<infer U> ? U : T;

type Str = Flatten<string[]>; // string
type Num = Flatten<number>;   // number
```

### Template Literal Types

```typescript
type Prefix<T> = `prefix_${T & string}`;

type Result = Prefix<"user">;  // "prefix_user"

// Build event names
type Event = "click" | "focus" | "blur";
type EventHandler = `on${Capitalize<Event>}`;
// "onClick" | "onFocus" | "onBlur"
```

### Mapped Types

```typescript
// Create new type from existing
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

// Create getters
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserGetters = Getters<User>;
// { getId: () => number; getName: () => string; ... }
```

---

## Type Guards

### Type Guard Functions

```typescript
// Function to narrow type
function isString(val: unknown): val is string {
  return typeof val === "string";
}

function process(val: string | number) {
  if (isString(val)) {
    console.log(val.toUpperCase());
  } else {
    console.log(val.toFixed(2));
  }
}

// Custom guard
interface User { name: string }

function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "name" in obj;
}
```

---

## Declaration Files (.d.ts)

### Creating Type Definitions

```typescript
// types.d.ts
export interface Config {
  apiUrl: string;
  timeout: number;
}

export type Status = "success" | "error";

export function getConfig(): Config;
declare const API_VERSION: string;
```

### Using External Types

```typescript
// Augment existing types
declare global {
  interface Window {
    myCustomAPI: {
      doSomething(): void;
    };
  }
}

// Module augmentation
declare module "express" {
  interface Request {
    userId?: number;
  }
}
```

---

## tsconfig.json Essentials

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Key Options

| Option | Purpose |
|--------|---------|
| `strict` | Enable all strict checks |
| `noImplicitAny` | Error on implicit `any` |
| `noUnusedLocals` | Error on unused variables |
| `noUnusedParameters` | Error on unused parameters |
| `noImplicitReturns` | Error on missing returns |
| `strictNullChecks` | Stricter null/undefined checks |

---

## Common Typing Patterns

### Async/Promise Types

```typescript
// Generic promise
function fetchUser(id: number): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// Async function
async function getUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

### Function Overloading

```typescript
// Multiple signatures
function format(value: string): string;
function format(value: number): string;
function format(value: boolean): string;

// Implementation
function format(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toFixed(2);
  return String(value);
}
```

---

## Type Checking Checklist

- [ ] **Strict mode enabled** - `"strict": true`
- [ ] **No implicit any** - `"noImplicitAny": true`
- [ ] **Null checks** - `"strictNullChecks": true`
- [ ] **Generic constraints** - Properly bounded generics
- [ ] **Type guards** - Proper narrowing
- [ ] **Utility types** - Used appropriately
- [ ] **Declaration files** - For external libraries

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Use `any` everywhere
- Ignore TypeScript errors
- Over-engineer types
- Use `as` for type casting carelessly
- Ignore compiler warnings

✅ **DO:**
- Use strict mode
- Leverage type inference
- Use utility types
- Create reusable generic patterns
- Gradually migrate to stricter checks

---

## Related Skills

- `/react-expert` - TypeScript with React
- `/nextjs-builder` - TypeScript in Next.js
- `/backend-expert` - TypeScript on backend
