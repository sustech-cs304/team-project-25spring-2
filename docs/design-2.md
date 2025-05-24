# CS304 PeachIDE Sprint 1
**_An Intelligent Course-Aware IDE_**  
**Authors**: Ben Chen, Mingzhi Chen, Tianrun Qiu, Zhuo Wang, Yicheng Xiao

---

## Architecture Diagram

### Architecture Overview
1. **Core Component**: The database is positioned at the top of the architecture, serving as the central hub for all data storage. It ensures secure and efficient management of course content, code snippets, user information, and other data.
2. **Functional Modules**:
   - **Course View**: Provides an overview and navigation of courses, helping users understand and select course content.
   - **Code Space**: A dedicated area for writing and running code, forming the core of the programming learning experience.
   - **AI Integration**: Enhances the platform's intelligent capabilities through a third-party AI provider. This includes features like automatic code completion and smart question-answering.
   - **Material Reader**: Supports study document reading, e.g. PDF formats, enabling users to access learning materials and add notes & manipulate code snippets conveniently. It also includes a *Comments View*, that facilitates interaction and discussion among users, enhancing the collaborative learning experience.

3. **Editing Tools**:
   - **Code Editor** and **Code Snippet Editor**: These tools allow users to write full-length code and smaller code snippets, respectively, catering to different use cases.
   - **Markdown Editor**: Enables note-taking and documentation using Markdown syntax, making it easy to organize and share knowledge.

![Architecture Diagram](docs/images/architecture-diagram.png)

---

## UI Design

### Feature 1
**Create, manage, and collaborate in your code spaces**  
- Use `Monaco-Editor` to provide IDE editing functionality
- Use `yjs` to enable real-time collaborative editing
- View PDF files
- Provide a terminal (CLI) connected to the backend

![Coding Environment](docs/images/coding_env.png)

---

### Feature 2
**Find your resources and execute code snippets on the fly**  
- Use `react-pdf` to display PDFs
- Provide a comment section for each page of the PDF
- Insert code snippets into the PDF
- Use a rich text editor to take notes

![PDF & Comments](docs/images/slide_env.png)

---

### Feature 3
**Organize and track your learning progress**  
- Course information center integrating slides, assignments, and group info
- Use a calendar to track learning progress

| <img src="docs/images/class_info.png" alt="Class Info" width="300"/> | <img src="docs/images/calendar.png" alt="Calendar" width="300"/> |
| --- | --- |
| _Class Info_ | _Calendar_ |

- View published slides and assignments
- Form study groups with classmates in the "Group Plaza"

| <img src="docs/images/class_lecture.png" alt="Class Lecture" width="300"/> | <img src="docs/images/class_group.png" alt="Class Group" width="300"/> |
| --- | --- |
| _Class Lecture_ | _Class Group_ |

---

### Feature 4
**Empower your study with an AI assistant**  
- Help summarize slide content
- Automatically generate quizzes based on slide content
- Assist with problem-solving in the IDE environment

![AI Assistant](docs/images/ai.png)

---

## UI Implementation

![](docs/images/1.jpg)
![](docs/images/2.jpg)
![](docs/images/3.jpg)
![](docs/images/4.jpg)