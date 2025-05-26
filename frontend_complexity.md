# PeachIDE Frontend Cyclomatic Complexity Analysis Report

## 📊 Overall Statistics

- **Total Files**: 76
- **Successfully Analyzed**: 76 (100%)
- **Total Functions**: 849
- **Total Cyclomatic Complexity**: 2,647
- **Average Complexity per File**: 34.83
- **Average Complexity per Function**: 3.12

## 📈 Complexity Distribution

| Complexity Level | Range | Number of Functions | Percentage |
|-----------------|-------|---------------------|------------|
| 🟢 Low Complexity | 1-5 | 748 | 88.1% |
| 🟡 Medium Complexity | 6-10 | 56 | 6.6% |
| 🔴 High Complexity | 11-20 | 29 | 3.4% |
| 🚨 Very High Complexity | >20 | 16 | 1.9% |

## 🔴 Top 10 Most Complex Functions

| Rank | Function Name | File | Line | Complexity |
|------|--------------|------|------|------------|
| 1 | AIChatButton | components/ai/AIChatButton.tsx | 38 | 54 |
| 2 | Home | app/page.tsx | 29 | 51 |
| 3 | Assignment | app/classes/Assignment.tsx | 42 | 49 |
| 4 | <anonymous> | app/manage/ManageRightBar.tsx | 1719 | 49 |
| 5 | <anonymous> | components/coding/EditorLayout.tsx | 20 | 45 |
| 6 | FileSystemBar | components/coding/FileSystemBar.tsx | 19 | 37 |
| 7 | CalendarModal | app/classes/CalendarModal.tsx | 46 | 34 |
| 8 | <anonymous> | app/manage/ManageRightBar.tsx | 2334 | 29 |
| 9 | AIQuizButton | components/ai/AIQuiz.tsx | 20 | 28 |
| 10 | CodeSnippetEditor | app/slides/[id]/page.tsx | 169 | 25 |

## 🔴 Top 10 Most Complex Files

| Rank | File | Total Complexity | Function Count |
|------|------|------------------|----------------|
| 1 | app/manage/ManageRightBar.tsx | 505 | 175 |
| 2 | components/ai/AIChatButton.tsx | 142 | 44 |
| 3 | lib/y-monaco.js | 136 | 26 |
| 4 | app/slides/[id]/page.tsx | 123 | 29 |
| 5 | components/coding/EditorLayout.tsx | 116 | 18 |
| 6 | app/classes/Assignment.tsx | 108 | 25 |
| 7 | app/page.tsx | 100 | 18 |
| 8 | components/coding/FileSystemBar.tsx | 91 | 19 |
| 9 | app/classes/CalendarModal.tsx | 84 | 22 |
| 10 | components/ai/AIQuiz.tsx | 73 | 24 |

## ⚠️ Functions Requiring Refactoring (Complexity > 10)

A total of **45 functions** have complexity exceeding 10, suggesting refactoring to improve code maintainability:

### Very High Complexity (>20)
- **AIChatButton** (54) - components/ai/AIChatButton.tsx:38
- **Home** (51) - app/page.tsx:29
- **Assignment** (49) - app/classes/Assignment.tsx:42
- **<anonymous>** (49) - app/manage/ManageRightBar.tsx:1719
- **<anonymous>** (45) - components/coding/EditorLayout.tsx:20
- **FileSystemBar** (37) - components/coding/FileSystemBar.tsx:19
- **CalendarModal** (34) - app/classes/CalendarModal.tsx:46
- **<anonymous>** (29) - app/manage/ManageRightBar.tsx:2334
- **AIQuizButton** (28) - components/ai/AIQuiz.tsx:20
- **CodeSnippetEditor** (25) - app/slides/[id]/page.tsx:169
- **<anonymous>** (24) - app/manage/ManageRightBar.tsx:805
- **constructor** (24) - lib/y-monaco.js:62
- **<anonymous>** (21) - app/manage/ManageRightBar.tsx:1512
- **<anonymous>** (21) - app/manage/ManageRightBar.tsx:2580
- **<anonymous>** (21) - app/page.tsx:118

### High Complexity (11-20)
- **Group** (20) - app/classes/Group.tsx:20
- **AuthPage** (19) - app/auth/page.tsx:16
- **<anonymous>** (19) - app/manage/ManageLeftBar.tsx:31
- **<anonymous>** (19) - components/coding/Terminal.tsx:25
- **<anonymous>** (18) - app/manage/ManageRightBar.tsx:1276
- **<anonymous>** (17) - app/manage/ManageRightBar.tsx:141
- **<anonymous>** (17) - components/pdf/PDFEnvProvider.tsx:56
- **<anonymous>** (16) - app/UserEnvProvider.tsx:83
- **PDFSection** (16) - app/slides/[id]/page.tsx:25
- **Slides** (16) - app/slides/[id]/page.tsx:373
- **<anonymous>** (16) - components/coding/EditorLayout.tsx:153
- **<anonymous>** (15) - app/classes/Assignment.tsx:357
- **<anonymous>** (15) - app/classes/CalendarModal.tsx:328
- **<anonymous>** (15) - app/manage/ManageRightBar.tsx:1884
- **<anonymous>** (14) - app/classes/CalendarModal.tsx:341
- **<anonymous>** (14) - app/manage/ManageRightBar.tsx:1056
- **<anonymous>** (14) - components/auth-guard.tsx:13
- **<anonymous>** (14) - components/coding/EditorLayout.tsx:84
- **<anonymous>** (14) - components/pdf/PDFPart.tsx:103
- **<anonymous>** (13) - app/manage/ManageRightBar.tsx:505
- **<anonymous>** (13) - app/slides/[id]/page.tsx:50
- **<anonymous>** (13) - lib/y-monaco.js:87
- **<anonymous>** (13) - lib/y-monaco.js:88
- **Lecture** (12) - app/classes/Lecture.tsx:41
- **<anonymous>** (12) - components/coding/FileSystemBar.tsx:115
- **<anonymous>** (12) - components/coding/Terminal.tsx:59
- **<anonymous>** (11) - components/ai/AIQuiz.tsx:58
- **<anonymous>** (11) - components/coding/CollaboratedEditor.tsx:32
- **<anonymous>** (11) - components/coding/FileStructure.tsx:98

## 📋 Refactoring Recommendations

### 1. Highest Priority (Complexity > 30)
These functions are overly complex and should be refactored immediately:
- `AIChatButton` (54)
- `Home` (51) 
- `Assignment` (49)
- `<anonymous>` in ManageRightBar (49)
- `<anonymous>` in EditorLayout (45)
- `FileSystemBar` (37)
- `CalendarModal` (34)

### 2. High Priority (Complexity 20-30)
Recommended for near-term refactoring:
- `<anonymous>` in ManageRightBar (29)
- `AIQuizButton` (28)
- `CodeSnippetEditor` (25)
- Other functions with complexity between 20-30

### 3. Medium Priority (Complexity 11-19)
Consider refactoring to improve maintainability

## 💡 Refactoring Strategy Suggestions

1. **Extract Sub-functions**: Break down large functions into smaller ones
2. **Use Strategy Pattern**: For complex conditional logic
3. **Extract Components**: Break down complex UI logic into smaller components
4. **Use Custom Hooks**: Extract complex state logic
5. **Simplify Conditional Expressions**: Use early returns and guard clauses

## 📊 Code Quality Assessment

- **Overall Quality**: Good (88.1% of functions have complexity below 5)
- **Areas of Concern**: 1.9% of functions have very high complexity (>20)
- **Recommendation**: Focus on refactoring the top 15 most complex functions as a priority

---

*Report Generated: January 26, 2025*
*Analysis Tool: Custom TypeScript/JavaScript Cyclomatic Complexity Analyzer* 