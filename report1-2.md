# Requirement Analysis

## Feature Requirements

### 1. Create, manage, and collaborate in your code spaces

Set up independent IDE environments, let teachers define project/quiz/assignment configurations and upload initial code files, enable students to complete their work in dedicated code spaces with the ability to upload files, support real-time collaborative coding, and facilitate resource sharing among students.

### 2. Find your resources and execute code snippets on the fly

Access a file management system for each course, allow teachers to embed code snippets into specific parts of lecture slides, and let students run these code snippets to see the output directly within the slides.

### 3. Take notes and chat with your classmates over the slides

Utilize built-in comment sections in slides that support Markdown for note-taking, enable teachers to answer questions in the comments, and encourage students to share insights.

### 4. Organize and track your learning progress

Monitor course progress, give teachers the ability to manage their courses, and provide students with visibility into course schedules and deadlines.

### 5. Empower your study with an AI assistant

Leverage an AI assistant to summarize course content, highlight key points, convert content into Mermaid flowcharts, and generate quizzes based on the course material.

## Non-functional Requirements

### Usability: User Interface

- An intuitive user interface to ensure that both instructors and students can easily adapt to the collaborative programming environment.
- Built-in Markdown support for convenient note-taking and commenting.
- Clear visualization of course progress and deadlines.

### Safety & Security: Isolation

- Secure isolation of code execution environments to ensure the safe running of embedded code snippets.
- A user permission management system to differentiate access rights between instructors and students.
- Data backup and recovery mechanisms to protect user code and notes.

### Performance

- Low-latency response during real-time collaborative coding.
- Fast execution of code snippets and immediate display of results.
- Timely responses from AI-assisted features to ensure efficiency in summarization and quiz generation.

### Reliability

- Guaranteed system stability, especially during multi-user collaboration.
- Reliability of the file management system to ensure stable access to course resources.
- Accuracy of AI functionalities to ensure the quality of generated content.

## Data Requirements

- Course-related Data:
    - Including: PPTs, Syllabus, Code Snippets and Assignments.
    - Fetched from historical class repositories on GitHub or provided by teachers.
- Personal Information:
    - Student IDs of students to help teachers to create classes.
    - All Student IDs for choosing are fetched from SUSTech WeWork and are then chose by teachers to set up classes.

## Technical Requirements

### Front-end Technology

Framework: React + Next.js + Shadcn UI

Referenced Open Repository: [Monaco Editor](https://github.com/microsoft/monaco-editor), [CodeX](https://github.com/dulapahv/CodeX), [Golden Layout](https://github.com/golden-layout/golden-layout)

### Back-end Technology

Framework: Python, K8s (for container manager)

Referenced Open Repository: [Piston](https://github.com/engineer-man/piston), [Pyston](https://github.com/shhivv/pyston)