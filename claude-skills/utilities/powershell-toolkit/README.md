# /powershell-toolkit

**PowerShell scripting, Windows administration, and shell programming fundamentals.**

Use this skill when writing PowerShell scripts, automating Windows tasks, or working with Windows systems.

---

## What This Skill Does

Teaches **PowerShell thinking and patterns**. Covers:
- 🔷 PowerShell language fundamentals
- 📝 Cmdlet usage and discovery
- 🔄 Pipeline operations
- 📊 Object handling and formatting
- 🔧 Functions and modules
- ⚡ Process management
- 🗂️ File and directory operations
- 🔐 Execution policies and security

---

## When to Use

✅ Windows system administration
✅ Automating Windows tasks
✅ Active Directory management
✅ Server configuration
✅ PowerShell scripting

❌ Cross-platform scripting (use Bash)
❌ Complex data processing (use Python)

---

## PowerShell Basics

### Running Scripts

```powershell
# Execute script
.\script.ps1

# Execute with parameters
.\script.ps1 -Name "John" -Age 30

# Execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Variables

```powershell
# Define variable
$name = "John"
$age = 30
$isActive = $true

# Arrays
$numbers = 1, 2, 3, 4, 5
$numbers = @(1, 2, 3, 4, 5)

# Hash tables
$user = @{
    Name = "John"
    Email = "john@example.com"
    Age = 30
}

# Access properties
$user.Name          # "John"
$user["Email"]      # "john@example.com"

# String interpolation
Write-Output "Hello, $name"  # "Hello, John"
```

### Data Types

```powershell
# Numbers
$int = 42
$float = 3.14

# Strings
$str = "Hello"
$str = 'Literal string'  # No interpolation

# Booleans
$true
$false

# Arrays
$arr = 1, 2, 3

# Type casting
[int]"123"          # Convert to int
[string]123         # Convert to string
```

---

## Cmdlets and Discovery

### Common Cmdlets

| Category | Cmdlets |
|----------|---------|
| **Files** | Get-ChildItem, Copy-Item, Remove-Item, New-Item |
| **Process** | Get-Process, Start-Process, Stop-Process |
| **Service** | Get-Service, Start-Service, Stop-Service |
| **Users** | Get-LocalUser, New-LocalUser, Remove-LocalUser |
| **Network** | Get-NetIPAddress, Test-NetConnection, Get-NetAdapter |

### Getting Help

```powershell
# Help for cmdlet
Get-Help Get-ChildItem
Get-Help Get-ChildItem -Full      # Detailed help
Get-Help Get-ChildItem -Examples  # Examples only

# Search for cmdlets
Get-Command -Name "*file*"
Get-Command -Verb Get -Noun Item

# Get syntax
Get-Command Get-ChildItem -Syntax
```

### Verb-Noun Convention

PowerShell cmdlets follow Verb-Noun pattern:
```powershell
Get-ChildItem    # Get = Verb, ChildItem = Noun
Set-Variable     # Set = Verb, Variable = Noun
Remove-Item      # Remove = Verb, Item = Noun
```

**Common verbs:**
- Get, Set, New, Remove, Add, Update, Start, Stop, Invoke, Write

---

## Pipeline Operations

### Basic Pipeline

```powershell
# Pipe output to next cmdlet
Get-Process | Where-Object { $_.CPU -gt 100 }

# Multiple pipes
Get-Process |
  Where-Object { $_.CPU -gt 100 } |
  Select-Object Name, CPU, Memory |
  Sort-Object CPU -Descending |
  Format-Table

# Count objects
Get-Process | Measure-Object
```

### Common Pipeline Cmdlets

```powershell
# Select properties
Get-Process | Select-Object Name, CPU, Memory

# Filter objects
Get-Process | Where-Object { $_.CPU -gt 100 }

# Sort objects
Get-Process | Sort-Object CPU -Descending

# Format output
Get-Process | Format-Table
Get-Process | Format-List
Get-Process | Format-Wide

# Group objects
Get-Process | Group-Object ProcessName

# Count
Get-ChildItem | Measure-Object -Sum

# Unique objects
Get-Process | Select-Object Name -Unique
```

---

## File and Directory Operations

### Listing Files

```powershell
# List files in current directory
Get-ChildItem

# List with details
Get-ChildItem -Force    # Include hidden files
Get-ChildItem -Recurse  # Subdirectories

# Filter files
Get-ChildItem -Filter "*.txt"
Get-ChildItem -Include "*.txt", "*.md"

# Full path
Get-ChildItem | Select-Object FullName
```

### File Operations

```powershell
# Create directory
New-Item -ItemType Directory -Path "C:\NewFolder"

# Create file
New-Item -ItemType File -Path "C:\file.txt"

# Copy file
Copy-Item -Path "C:\source.txt" -Destination "C:\dest.txt"

# Move/rename
Move-Item -Path "C:\old.txt" -Destination "C:\new.txt"

# Delete
Remove-Item -Path "C:\file.txt"
Remove-Item -Path "C:\folder" -Recurse  # Delete folder

# Check if exists
Test-Path "C:\file.txt"
```

### Reading/Writing Files

```powershell
# Read entire file
$content = Get-Content "C:\file.txt"

# Read line by line
Get-Content "C:\file.txt" | ForEach-Object { Write-Output $_ }

# Write content
"Hello World" | Out-File "C:\file.txt"
Add-Content "C:\file.txt" "New line"

# JSON operations
$json = Get-Content "config.json" | ConvertFrom-Json
$json.property
```

---

## Conditional Logic

### If Statements

```powershell
# Simple if
if ($age -gt 18) {
    Write-Output "Adult"
}

# If-else
if ($score -ge 90) {
    Write-Output "A"
} elseif ($score -ge 80) {
    Write-Output "B"
} else {
    Write-Output "C"
}

# Comparison operators
-eq  # Equal
-ne  # Not equal
-lt  # Less than
-gt  # Greater than
-le  # Less or equal
-ge  # Greater or equal
-like    # Pattern matching
-match   # Regex matching
-in      # Contains in array
```

### Switch Statement

```powershell
$day = "Monday"

switch ($day) {
    "Monday"    { Write-Output "Start of week" }
    "Friday"    { Write-Output "End of week" }
    "Saturday"  { Write-Output "Weekend" }
    default     { Write-Output "Middle of week" }
}
```

---

## Loops

### For Loop

```powershell
# Traditional for
for ($i = 0; $i -lt 5; $i++) {
    Write-Output $i
}

# For-each loop
$numbers = 1, 2, 3, 4, 5
foreach ($num in $numbers) {
    Write-Output $num
}

# Foreach-Object (pipeline)
1..10 | ForEach-Object {
    Write-Output $_  # $_ is current item
}
```

### While Loop

```powershell
$count = 0
while ($count -lt 5) {
    Write-Output $count
    $count++
}

# Do-while (runs at least once)
do {
    Write-Output $count
    $count++
} while ($count -lt 5)
```

---

## Functions

### Function Definition

```powershell
# Simple function
function Greet {
    Write-Output "Hello, World!"
}

# With parameters
function Greet($name) {
    Write-Output "Hello, $name"
}

# With return value
function Add($a, $b) {
    return $a + $b
}

# Call function
Greet "John"
Add 5 3
```

### Function Parameters

```powershell
# Named parameters
function CreateUser {
    param(
        [string]$Name,
        [string]$Email,
        [int]$Age
    )

    Write-Output "User: $Name, Email: $Email, Age: $Age"
}

CreateUser -Name "John" -Email "john@example.com" -Age 30

# Optional parameters with defaults
param(
    [string]$Name = "Guest",
    [int]$Age = 18
)

# Mandatory parameters
param(
    [Parameter(Mandatory=$true)]
    [string]$Name
)
```

### Return Values

```powershell
function GetUser {
    return @{
        Name = "John"
        Email = "john@example.com"
    }
}

$user = GetUser
$user.Name  # "John"
```

---

## String Manipulation

### String Methods

```powershell
$text = "Hello World"

# Case conversion
$text.ToUpper()       # "HELLO WORLD"
$text.ToLower()       # "hello world"

# Substring
$text.Substring(0, 5) # "Hello"
$text.Length          # 11

# Replace
$text.Replace("World", "PowerShell")  # "Hello PowerShell"

# Split
$text.Split(" ")      # @("Hello", "World")

# Contains
$text.Contains("World")  # True

# Trim
"  text  ".Trim()     # "text"
```

### String Interpolation

```powershell
# Double quotes (interpolated)
$name = "John"
"Hello, $name"  # "Hello, John"

# Single quotes (literal)
'Hello, $name'  # "Hello, $name"

# Expression interpolation
"Age: $($age + 1)"  # "Age: 31"

# Here strings
$text = @"
Line 1
Line 2
Line 3
"@
```

---

## Process Management

### Running Commands

```powershell
# Run process
Start-Process "notepad.exe"

# Run with arguments
Start-Process "cmd.exe" -ArgumentList "/c dir"

# Wait for process to complete
Start-Process "powershell.exe" -Wait

# Redirect output
Start-Process "cmd.exe" -RedirectStandardOutput "output.txt"

# Run as administrator
Start-Process "powershell.exe" -Verb RunAs
```

### Process Information

```powershell
# Get running processes
Get-Process

# Get specific process
Get-Process | Where-Object { $_.Name -eq "explorer" }

# Get process details
$process = Get-Process "chrome"
$process.CPU
$process.Memory

# Stop process
Stop-Process -Name "notepad" -Force
```

---

## Modules and Imports

### Using Modules

```powershell
# List installed modules
Get-Module -ListAvailable

# Import module
Import-Module ActiveDirectory

# Get module commands
Get-Command -Module ActiveDirectory

# Module location
$profile  # Profile script location
```

### Creating Simple Module

```powershell
# Save as Utilities.psm1
function Get-Greeting {
    param([string]$Name)
    return "Hello, $Name"
}

function Get-CurrentTime {
    return Get-Date
}

# Import in script
Import-Module ./Utilities.psm1
Get-Greeting "John"
```

---

## Error Handling

### Try-Catch

```powershell
try {
    $file = Get-Content "nonexistent.txt"
} catch {
    Write-Error "File not found: $_"
}

# Catching specific errors
try {
    [int]$num = "not a number"
} catch [System.FormatException] {
    Write-Error "Invalid format"
} catch {
    Write-Error "Unknown error: $_"
}
```

### Error Action

```powershell
# Stop on error
Get-ChildItem -ErrorAction Stop

# Continue (default)
Get-ChildItem -ErrorAction Continue

# Silently ignore
Get-ChildItem -ErrorAction SilentlyContinue

# Ask user
Get-ChildItem -ErrorAction Inquire
```

---

## PowerShell Scripting Best Practices

### Script Template

```powershell
<#
.SYNOPSIS
    Brief description

.DESCRIPTION
    Detailed description

.PARAMETER Name
    Parameter description

.EXAMPLE
    PS> ./script.ps1 -Name "John"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Name
)

# Error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Main logic
function Main {
    Write-Output "Processing $Name"
}

# Execute
Main
```

### Common Patterns

```powershell
# Check if file exists before processing
if (Test-Path $filePath) {
    $content = Get-Content $filePath
}

# Loop with error handling
Get-Process | ForEach-Object {
    try {
        # Process item
    } catch {
        Write-Warning "Error processing $_: $_"
    }
}

# Validate parameters
if ($null -eq $Name -or $Name -eq "") {
    throw "Name parameter is required"
}
```

---

## Common Admin Tasks

### User Management

```powershell
# List users
Get-LocalUser

# Create user
New-LocalUser -Name "jdoe" -Password (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force)

# Delete user
Remove-LocalUser -Name "jdoe"

# Change password
$password = ConvertTo-SecureString "NewPassword123" -AsPlainText -Force
Set-LocalUser -Name "jdoe" -Password $password
```

### Service Management

```powershell
# List services
Get-Service

# Start service
Start-Service -Name "ServiceName"

# Stop service
Stop-Service -Name "ServiceName"

# Check service status
Get-Service -Name "ServiceName" | Select-Object Name, Status
```

---

## PowerShell Scripting Checklist

- [ ] **Shebang equivalent** - Set-ExecutionPolicy if needed
- [ ] **Parameters documented** - Comment-based help
- [ ] **Error handling** - Try-catch or -ErrorAction
- [ ] **Validation** - Check parameters/paths exist
- [ ] **Comments** - Explain complex logic
- [ ] **Readable** - Use clear variable names
- [ ] **Tested** - Test on target system
- [ ] **Safe** - No hardcoded credentials

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Hardcode credentials
- Ignore errors
- Use deprecated cmdlets
- Skip parameter validation
- Overly complex one-liners
- Leave scripts without documentation

✅ **DO:**
- Use secure strings for passwords
- Handle errors gracefully
- Use current cmdlets
- Validate all input
- Keep code readable
- Document your scripts

---

## Related Skills

- `/bash-toolkit` - Cross-platform shell scripting
- `/git-workflows` - Version controlling scripts
- `/debugging-techniques` - PowerShell debugging
- `/devops-pipeline` - Infrastructure automation

