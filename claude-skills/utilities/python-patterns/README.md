# /python-patterns

**Python language fundamentals, package management, async patterns, and best practices.**

Use this skill when working with Python, writing async code, designing packages, or solving Python-specific problems.

---

## What This Skill Does

Teaches **Python thinking and patterns**. Covers:
- 🐍 Python language fundamentals and idioms
- 📦 Package and module management
- ⚡ Async/await and concurrency patterns
- 🧪 Testing strategies (unittest, pytest)
- 🔌 Virtual environments and dependencies
- 📚 Common libraries (requests, sqlalchemy, flask)
- ⚙️ Performance optimization techniques
- 🛠️ Debugging and profiling

---

## When to Use

✅ Writing Python applications
✅ Working with async code
✅ Designing Python packages
✅ Optimizing performance
✅ Testing strategies

❌ Specific library tutorials (use library docs)
❌ Data science workflows (use data science guides)

---

## Python Language Fundamentals

### Variables and Types

```python
# Dynamic typing
name = "John"
age = 30
height = 5.9
is_active = True

# Type hints (optional but recommended)
def greet(name: str) -> str:
    return f"Hello, {name}"

# Duck typing
def quack(duck):
    duck.quack()  # Works for anything with quack() method
```

### Collections

```python
# Lists (ordered, mutable)
numbers = [1, 2, 3, 4, 5]
numbers.append(6)
numbers[0]  # 1

# Tuples (ordered, immutable)
coordinates = (10, 20)
x, y = coordinates

# Dictionaries (key-value)
user = {"name": "John", "age": 30}
user["name"]  # "John"
user.get("email", "N/A")  # Safe access

# Sets (unique, unordered)
unique_ids = {1, 2, 3, 2, 1}  # {1, 2, 3}
unique_ids.add(4)

# List comprehension
squares = [x**2 for x in range(5)]  # [0, 1, 4, 9, 16]
```

### String Operations

```python
# String formatting
name = "John"
age = 30

# f-strings (Python 3.6+)
greeting = f"Hello, {name}! You are {age} years old."

# String methods
text = "Hello World"
text.lower()  # "hello world"
text.split(" ")  # ["Hello", "World"]
text.replace("World", "Python")  # "Hello Python"

# Multi-line strings
description = """
This is a multi-line
string that preserves
line breaks.
"""
```

---

## Functions and Scope

### Function Definition

```python
# Basic function
def add(a: int, b: int) -> int:
    return a + b

# Default arguments
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}"

# Variable arguments
def sum_all(*args) -> int:
    return sum(args)

sum_all(1, 2, 3, 4, 5)  # 15

# Keyword arguments
def create_user(**kwargs):
    return kwargs

create_user(name="John", email="john@example.com")
# {"name": "John", "email": "john@example.com"}

# Lambda (anonymous functions)
square = lambda x: x**2
numbers = [1, 2, 3]
squared = list(map(square, numbers))  # [1, 4, 9]
```

### Closures and Decorators

```python
# Closure
def outer(x):
    def inner(y):
        return x + y
    return inner

add_5 = outer(5)
add_5(3)  # 8

# Decorator
def timing_decorator(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Took {time.time() - start}s")
        return result
    return wrapper

@timing_decorator
def slow_function():
    time.sleep(1)

slow_function()  # Took ~1.0s
```

---

## Object-Oriented Programming

### Classes and Objects

```python
class User:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

    def __str__(self) -> str:
        return f"User({self.name})"

    def get_domain(self) -> str:
        return self.email.split("@")[1]

# Usage
user = User("John", "john@example.com")
user.name  # "John"
str(user)  # "User(John)"
```

### Inheritance and Polymorphism

```python
class Animal:
    def make_sound(self):
        raise NotImplementedError()

class Dog(Animal):
    def make_sound(self) -> str:
        return "Woof!"

class Cat(Animal):
    def make_sound(self) -> str:
        return "Meow!"

# Polymorphism
animals: list[Animal] = [Dog(), Cat()]
for animal in animals:
    print(animal.make_sound())  # Woof!, Meow!
```

### Properties and Class Methods

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9/5 + 32

    @classmethod
    def from_fahrenheit(cls, fahrenheit: float):
        return cls((fahrenheit - 32) * 5/9)

    @staticmethod
    def is_freezing(celsius: float) -> bool:
        return celsius <= 0

# Usage
temp = Temperature(0)
temp.fahrenheit  # 32.0
Temperature.is_freezing(0)  # True
```

---

## Async and Concurrency

### Async/Await Pattern

```python
import asyncio

async def fetch_data(url: str) -> str:
    # Simulate async operation
    await asyncio.sleep(1)
    return f"Data from {url}"

async def main():
    # Run async functions concurrently
    results = await asyncio.gather(
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3")
    )
    return results

# Run
asyncio.run(main())
```

### Threading for I/O Operations

```python
from concurrent.futures import ThreadPoolExecutor
import requests

def fetch_url(url: str) -> str:
    response = requests.get(url)
    return response.text

# Use thread pool for I/O operations
with ThreadPoolExecutor(max_workers=5) as executor:
    urls = ["url1", "url2", "url3"]
    results = list(executor.map(fetch_url, urls))
```

### Process Pool for CPU Operations

```python
from concurrent.futures import ProcessPoolExecutor

def cpu_intensive(n: int) -> int:
    return sum(i**2 for i in range(n))

# Use process pool for CPU-bound operations
with ProcessPoolExecutor(max_workers=4) as executor:
    results = list(executor.map(cpu_intensive, [1000, 2000, 3000]))
```

---

## Package Management

### Virtual Environments

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install packages
pip install requests django

# Create requirements file
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt

# Deactivate
deactivate
```

### Project Structure

```
project/
├── venv/                 # Virtual environment (gitignored)
├── src/
│   ├── __init__.py
│   ├── main.py
│   └── utils.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── pyproject.toml        # Project metadata
├── requirements.txt      # Dependencies
└── README.md
```

### Using pyproject.toml

```toml
[project]
name = "my-package"
version = "0.1.0"
description = "My Python package"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.28.0",
    "sqlalchemy>=2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "pytest-cov>=4.0",
    "black>=23.0",
]
```

---

## Testing

### Pytest Patterns

```python
# test_example.py
import pytest

def add(a: int, b: int) -> int:
    return a + b

# Basic test
def test_add():
    assert add(2, 3) == 5

# Parameterized test
@pytest.mark.parametrize("a,b,expected", [
    (2, 3, 5),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add_multiple(a, b, expected):
    assert add(a, b) == expected

# Fixtures (reusable test setup)
@pytest.fixture
def sample_user():
    return {"name": "John", "email": "john@example.com"}

def test_user_name(sample_user):
    assert sample_user["name"] == "John"

# Exception testing
def test_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        1 / 0
```

### Mocking

```python
from unittest.mock import Mock, patch

# Mock object
mock_db = Mock()
mock_db.query.return_value = {"id": 1, "name": "John"}

result = mock_db.query("users", 1)
assert result["name"] == "John"
mock_db.query.assert_called_with("users", 1)

# Patching
@patch('requests.get')
def test_fetch_user(mock_get):
    mock_get.return_value.json.return_value = {"id": 1}

    # Your code using requests.get
```

---

## Common Libraries

### Requests (HTTP Client)

```python
import requests

# GET request
response = requests.get("https://api.example.com/users")
data = response.json()
status = response.status_code

# POST request
payload = {"name": "John", "email": "john@example.com"}
response = requests.post("https://api.example.com/users", json=payload)

# With headers and parameters
headers = {"Authorization": "Bearer token"}
params = {"page": 1, "limit": 10}
response = requests.get("https://api.example.com/users", headers=headers, params=params)

# Session for multiple requests
with requests.Session() as session:
    session.headers.update({"Authorization": "Bearer token"})
    response1 = session.get("url1")
    response2 = session.get("url2")
```

### SQLAlchemy (ORM)

```python
from sqlalchemy import create_engine, Column, String, Integer
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)

# Create engine and session
engine = create_engine("sqlite:///database.db")
Base.metadata.create_all(engine)

with Session(engine) as session:
    # Create
    user = User(name="John", email="john@example.com")
    session.add(user)
    session.commit()

    # Read
    users = session.query(User).filter_by(name="John").all()

    # Update
    user.email = "john.new@example.com"
    session.commit()

    # Delete
    session.delete(user)
    session.commit()
```

### Flask (Web Framework)

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/users", methods=["GET"])
def get_users():
    return jsonify({"users": []})

@app.route("/users", methods=["POST"])
def create_user():
    data = request.json
    return jsonify({"id": 1, **data}), 201

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    return jsonify({"id": user_id, "name": "John"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
```

---

## Performance Optimization

### Profiling

```python
import cProfile
import pstats

def slow_function():
    total = 0
    for i in range(10**6):
        total += i
    return total

# Profile function
profiler = cProfile.Profile()
profiler.enable()
slow_function()
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)
```

### Generators for Memory Efficiency

```python
# List comprehension (memory inefficient)
numbers = [x**2 for x in range(10**6)]  # All in memory

# Generator (memory efficient)
def square_generator():
    for x in range(10**6):
        yield x**2

for square in square_generator():
    print(square)  # One at a time

# Generator expression
squares = (x**2 for x in range(10**6))
```

### Caching

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# First call: computed
fibonacci(30)  # Takes time

# Second call: cached
fibonacci(30)  # Instant
```

---

## Python Idioms ("Pythonic" Code)

### List and Dict Operations

```python
# Pythonic iteration
numbers = [1, 2, 3, 4, 5]
for i, num in enumerate(numbers):
    print(f"{i}: {num}")

# Unpacking
a, b, *rest = [1, 2, 3, 4, 5]
# a=1, b=2, rest=[3, 4, 5]

# Dict comprehension
user_ids = {user["id"]: user["name"] for user in users}

# Using dict.get() with default
email = user.get("email", "no-email@example.com")

# Membership testing
if "admin" in user_roles:
    # Do something
```

### Context Managers

```python
# File handling
with open("file.txt") as f:
    content = f.read()  # Auto-closes

# Database transaction
with database.transaction():
    user = create_user(...)
    create_profile(...)
    # Auto-commit or rollback

# Custom context manager
class Database:
    def __enter__(self):
        self.connection = self.connect()
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.connection.close()

with Database() as db:
    # Use db
```

---

## Common Mistakes to Avoid

### Anti-Patterns

❌ **Mutable default arguments:**
```python
def append_to_list(item, lst=[]):  # WRONG!
    lst.append(item)
    return lst

append_to_list(1)  # [1]
append_to_list(2)  # [1, 2] - shares same list!
```

✅ **Correct:**
```python
def append_to_list(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst
```

❌ **Not closing resources:**
```python
f = open("file.txt")
content = f.read()
# File never closes if error occurs!
```

✅ **Correct:**
```python
with open("file.txt") as f:
    content = f.read()  # Auto-closes
```

❌ **Catching too broad exceptions:**
```python
try:
    result = risky_operation()
except:
    print("Error")
```

✅ **Correct:**
```python
try:
    result = risky_operation()
except ValueError as e:
    print(f"Invalid value: {e}")
```

---

## Python Best Practices Checklist

- [ ] **Type hints** - Add type annotations to functions
- [ ] **Docstrings** - Document classes and functions
- [ ] **Virtual environment** - Use venv or poetry
- [ ] **Requirements file** - Track dependencies
- [ ] **Tests** - Write pytest tests
- [ ] **Linting** - Use flake8 or ruff
- [ ] **Formatting** - Use black or autopep8
- [ ] **Error handling** - Specific exception handling
- [ ] **Context managers** - Use with statements
- [ ] **Performance** - Profile before optimizing

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Use global variables
- Catch all exceptions with bare except
- Have mutable default arguments
- Ignore type hints
- Leave resources open
- Write overly complex comprehensions

✅ **DO:**
- Use type hints
- Handle specific exceptions
- Use immutable defaults (None)
- Document with docstrings
- Use context managers
- Keep code readable and simple

---

## Related Skills

- `/bash-toolkit` - Running Python scripts from shell
- `/git-workflows` - Version controlling Python projects
- `/debugging-techniques` - Debugging Python code
- `/test-engineer` - Testing strategies
- `/performance-profiler` - Profiling Python performance

