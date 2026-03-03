# /bash-toolkit

**Bash scripting, Linux/Unix commands, and shell programming fundamentals.**

Use this skill when writing shell scripts, automating tasks, or working with Linux/Unix systems.

---

## What This Skill Does

Teaches **bash thinking and patterns**. Covers:
- 🔷 Essential bash commands and utilities
- 📝 Shell scripting fundamentals
- 🔄 Text processing and pipelines
- 📂 File and directory operations
- 🔀 Conditional logic and loops
- 🔧 Functions and modules
- ⚡ Process management
- 🛡️ Security best practices

---

## When to Use

✅ Writing shell scripts
✅ Automating tasks
✅ Text processing
✅ System administration
✅ CI/CD scripting
✅ Deployment automation

❌ Building GUI applications
❌ Complex data structures (use proper programming language)

---

## Essential Bash Commands

### File Operations

| Command | Purpose | Example |
|---------|---------|---------|
| `ls` | List files | `ls -la` (all files, detailed) |
| `cd` | Change directory | `cd /path/to/dir` |
| `pwd` | Current directory | `pwd` (print working directory) |
| `mkdir` | Create directory | `mkdir -p dir/subdir` |
| `rm` | Remove files | `rm file.txt` (delete file) |
| `rm -rf` | Remove recursively | `rm -rf dir/` (delete directory) |
| `cp` | Copy files | `cp source.txt dest.txt` |
| `mv` | Move/rename | `mv old.txt new.txt` |
| `touch` | Create empty file | `touch newfile.txt` |
| `find` | Find files | `find . -name "*.js"` |

### Text Processing

| Command | Purpose | Example |
|---------|---------|---------|
| `cat` | Print file contents | `cat file.txt` |
| `grep` | Search text | `grep "pattern" file.txt` |
| `sed` | Stream editor | `sed 's/old/new/g' file.txt` |
| `awk` | Text processor | `awk '{print $1}' file.txt` |
| `cut` | Extract columns | `cut -d: -f1 /etc/passwd` |
| `sort` | Sort lines | `sort -n numbers.txt` |
| `uniq` | Remove duplicates | `uniq -c file.txt` |
| `wc` | Word/line count | `wc -l file.txt` |
| `head` | First N lines | `head -5 file.txt` |
| `tail` | Last N lines | `tail -10 file.txt` |

### Pipes and Redirection

```bash
# Pipe (|): send output to next command
cat file.txt | grep "pattern" | sort

# Redirect output (>): overwrite
echo "text" > file.txt

# Append output (>>): append
echo "more" >> file.txt

# Input (<): use file as input
sort < input.txt

# Combine: chain operations
cat data.txt | grep "error" | wc -l
```

---

## Shell Scripting Basics

### Script Structure

```bash
#!/bin/bash
# Script header (shebang)

# Variables
NAME="John"
COUNT=0

# Functions
greet() {
  echo "Hello, $NAME"
}

# Main execution
greet
echo "Count: $COUNT"
```

### Variables and Types

```bash
# String
NAME="value"
GREETING="Hello, $NAME"

# Number
COUNT=0
RESULT=$((COUNT + 1))

# Array
ARRAY=("one" "two" "three")
echo "${ARRAY[0]}"  # "one"

# Read from user input
read -p "Enter name: " USER_NAME

# Read from command
DATE=$(date)
LINES=$(wc -l < file.txt)
```

### String Manipulation

```bash
# Length
LENGTH=${#STRING}

# Substring
SUBSTRING=${STRING:0:5}  # first 5 chars

# Replace
NEW_STRING=${STRING/old/new}  # replace first
NEW_STRING=${STRING//old/new}  # replace all

# Uppercase/Lowercase
UPPER=${STRING^^}
LOWER=${STRING,,}
```

---

## Control Flow

### Conditional Logic

```bash
# If statement
if [ $COUNT -eq 0 ]; then
  echo "Count is zero"
elif [ $COUNT -gt 0 ]; then
  echo "Count is positive"
else
  echo "Count is negative"
fi

# Comparison operators
[ $a -eq $b ]   # equal
[ $a -ne $b ]   # not equal
[ $a -lt $b ]   # less than
[ $a -gt $b ]   # greater than
[ $a -le $b ]   # less or equal
[ $a -ge $b ]   # greater or equal

# String comparison
[ "$STR" = "value" ]   # equal
[ "$STR" != "value" ]  # not equal
[ -z "$STR" ]  # empty string
[ -n "$STR" ]  # non-empty string

# File checks
[ -f "$FILE" ]  # file exists
[ -d "$DIR" ]   # directory exists
[ -r "$FILE" ]  # readable
[ -w "$FILE" ]  # writable
[ -x "$FILE" ]  # executable
```

### Loops

```bash
# For loop
for i in {1..5}; do
  echo "Number: $i"
done

# For loop with array
for item in "${ARRAY[@]}"; do
  echo "$item"
done

# While loop
while [ $COUNT -lt 10 ]; do
  echo $COUNT
  COUNT=$((COUNT + 1))
done

# Until loop (runs until true)
until [ $COUNT -eq 10 ]; do
  COUNT=$((COUNT + 1))
done

# Break and continue
for i in {1..10}; do
  if [ $i -eq 5 ]; then
    break  # exit loop
  fi
  if [ $i -eq 3 ]; then
    continue  # skip to next iteration
  fi
  echo $i
done
```

### Case Statement

```bash
case "$1" in
  start)
    echo "Starting service..."
    ;;
  stop)
    echo "Stopping service..."
    ;;
  restart)
    echo "Restarting service..."
    ;;
  *)
    echo "Unknown command"
    ;;
esac
```

---

## Functions

### Function Definition

```bash
# Simple function
greet() {
  echo "Hello, $1"  # $1 = first argument
}

greet "Alice"  # Output: Hello, Alice

# Function with return value
add() {
  local result=$((1 + $2))  # local variable
  return $result
}

add 5 3
echo $?  # $? = last exit code
```

### Function Arguments

```bash
#!/bin/bash

my_function() {
  echo "Script: $0"      # script name
  echo "First arg: $1"   # first argument
  echo "Second arg: $2"  # second argument
  echo "All args: $@"    # all arguments as separate
  echo "All args: $*"    # all arguments as one string
  echo "Arg count: $#"   # number of arguments
}

my_function "arg1" "arg2" "arg3"
```

---

## Process Management

### Running Commands

```bash
# Run in foreground
command arg1 arg2

# Run in background
command &

# Run silently
command > /dev/null 2>&1

# Get exit status
command
if [ $? -eq 0 ]; then
  echo "Success"
else
  echo "Failed"
fi

# || and && operators
command1 || command2  # run command2 if command1 fails
command1 && command2  # run command2 if command1 succeeds
```

### Job Control

```bash
# List jobs
jobs

# Suspend current job
Ctrl+Z

# Resume in background
bg

# Bring to foreground
fg %1  # job number 1

# Kill job
kill %1
kill -9 %1  # force kill
```

---

## Error Handling

### Exit Codes

```bash
#!/bin/bash
set -e  # exit on first error
set -u  # error on undefined variables
set -o pipefail  # error if pipe fails

command
if [ $? -ne 0 ]; then
  echo "Error occurred"
  exit 1  # exit with code 1
fi

exit 0  # exit with code 0 (success)
```

### Error Messages

```bash
# Output to stderr
echo "Error: something failed" >&2

# Check before running
if ! command; then
  echo "Command failed" >&2
  exit 1
fi

# Try-catch pattern
{
  command1 || { echo "command1 failed"; exit 1; }
  command2 || { echo "command2 failed"; exit 1; }
} || exit 1
```

---

## Useful One-Liners

```bash
# Count lines in file
wc -l file.txt

# Find and replace in multiple files
find . -name "*.js" -exec sed -i 's/old/new/g' {} \;

# Remove empty lines
grep -v '^$' file.txt

# Sort and count occurrences
sort file.txt | uniq -c | sort -rn

# Print specific column
awk '{print $1}' file.txt

# Combine lines
paste file1.txt file2.txt

# Extract tar file
tar -xzf archive.tar.gz

# Compress directory
tar -czf archive.tar.gz directory/

# Secure copy to remote
scp file.txt user@host:/path/to/

# SSH command execution
ssh user@host "command to run"
```

---

## Script Security

### Safe Scripting Practices

✅ **DO:**
- Quote variables: `"$VAR"` not `$VAR`
- Use `set -e` to exit on errors
- Validate user input
- Use `local` for function variables
- Escape special characters
- Check file existence before using

❌ **DON'T:**
- Use `eval` with user input (code injection)
- Hardcode passwords/secrets
- Use `rm -rf` carelessly
- Trust user input
- Ignore error codes

### Sanitizing Input

```bash
#!/bin/bash

# Validate filename
if [[ ! "$FILENAME" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo "Invalid filename"
  exit 1
fi

# Validate number
if ! [[ "$NUM" =~ ^[0-9]+$ ]]; then
  echo "Invalid number"
  exit 1
fi

# Quote variables
rm -f "$FILE"  # safe
rm -f $FILE    # dangerous if $FILE contains spaces
```

---

## Bash Checklist

- [ ] **Shebang included** - `#!/bin/bash` at top
- [ ] **Variables quoted** - All `"$VAR"` uses quoted
- [ ] **Error handling** - `set -e` or explicit checks
- [ ] **Input validation** - Check for empty/invalid input
- [ ] **Comments** - Complex logic documented
- [ ] **Exit codes** - Script exits with proper codes
- [ ] **Portable** - Works on different systems
- [ ] **Permissions** - Script is executable (`chmod +x`)

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Use `eval` with variables
- Hardcode paths (use `dirname $0`)
- Assume command availability
- Ignore errors silently
- Over-use pipes
- Mix shell languages

✅ **DO:**
- Validate input
- Use functions for reusability
- Check dependencies upfront
- Handle errors explicitly
- Keep logic simple and readable
- Stick to POSIX when possible

---

## Next Steps

1. **Write simple script** - Hello world script
2. **Add variables** - Use command arguments
3. **Add conditionals** - If/else logic
4. **Add functions** - Reusable blocks
5. **Add error handling** - Check exit codes
6. **Test thoroughly** - Edge cases and failures

---

## Related Skills

- `/git-workflows` - Bash for Git automation
- `/devops-pipeline` - Shell scripts for CI/CD
- `/debugging-techniques` - Debugging bash scripts
- `/python-patterns` - When to use Python instead
