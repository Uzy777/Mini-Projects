# Task Tracker
Task tracker is a project used to track and manage your tasks. In this task, you will build a simple command line interface (CLI) to track what you need to do, what you have done, and what you are currently working on. This project will help you practice your programming skills, including working with the filesystem, handling user inputs, and building a simple CLI application.

https://roadmap.sh/projects/task-tracker

## Requirements:
The application should run from the command line, accept user actions and inputs as arguments, and store the tasks in a JSON file. 
### The user should be able to:

- [] Add, Update, and Delete tasks
- [] Mark a task as in progress or done
- [] List all tasks
- [] List all tasks that are done
- [] List all tasks that are not done
- [] List all tasks that are in progress

### Here are some constraints to guide the implementation:

- [] You can use any programming language to build this project.
- [] Use positional arguments in command line to accept user inputs.
- [] Use a JSON file to store the tasks in the current directory.
- [x] The JSON file should be created if it does not exist.
- [] Use the native file system module of your programming language to interact with the JSON file.
- [] Do not use any external libraries or frameworks to build this project.
- [] Ensure to handle errors and edge cases gracefully.

## Example:
### The list of commands and their usage is given below:
```bash
# Adding a new task
task-cli add "Buy groceries"
# Output: Task added successfully (ID: 1)

# Updating and deleting tasks
task-cli update 1 "Buy groceries and cook dinner"
task-cli delete 1

# Marking a task as in progress or done
task-cli mark-in-progress 1
task-cli mark-done 1

# Listing all tasks
task-cli list

# Listing tasks by status
task-cli list done
task-cli list todo
task-cli list in-progress
```

## Task Properties:
### Each task should have the following properties:
- `id`: A unique identifier for the task
- `description`: A short description of the task
- `status`: The status of the task (todo, in-progress, done)
- `createdAt`: The date and time when the task was created
- `updatedAt`: The date and time when the task was last updated

Make sure to add these properties to the JSON file when adding a new task and update them when updating a task.


## How to use:
