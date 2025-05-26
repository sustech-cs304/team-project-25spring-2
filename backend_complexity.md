# Backend Complexity

```
(base) ➜  team-project-25spring-2 git:(main) radon cc backend -a
backend/app/db.py
    F 17:0 get_db - A
backend/app/main.py
    F 24:0 lifespan - A
    F 68:0 root - A
backend/app/auth/__init__.py
    F 59:0 login - A
    F 32:0 register - A
    F 106:0 get_user_by_id_endpoint - A
    F 90:0 logout - A
    F 101:0 get_user_me - A
backend/app/auth/utils.py
    F 34:0 validate_session - A
    F 45:0 decode_access_token - A
    F 18:0 verify_password - A
    F 22:0 get_password_hash - A
    F 26:0 get_user_by_id - A
    F 30:0 get_session_by_id - A
    F 39:0 create_access_token - A
backend/app/auth/middleware.py
    F 16:0 get_current_user - A
backend/app/models/user.py
    C 10:0 User - A
    C 27:0 Sessions - A
    C 37:0 TokenSchema - A
    C 43:0 TokenData - A
    C 47:0 UserCreate - A
    C 55:0 UserLogin - A
    C 60:0 UserResponse - A
backend/app/models/material.py
    C 7:0 Material - A
backend/app/models/code_snippet.py
    C 13:0 CodeSnippet - A
backend/app/models/comment.py
    C 7:0 Comment - A
backend/app/models/course.py
    C 7:0 Course - A
backend/app/models/bookmarklist.py
    C 7:0 BookmarkList - A
backend/app/models/section.py
    C 7:0 Section - A
backend/app/models/file.py
    C 8:0 FileDB - A
backend/app/models/chat.py
    C 7:0 Chat - A
backend/app/models/environment.py
    C 8:0 Environment - A
backend/app/models/group.py
    C 7:0 Group - A
backend/app/models/assignment.py
    C 7:0 Assignment - A
backend/app/models/note.py
    C 7:0 Note - A
backend/app/slides/user.py
    F 65:0 modify_user - A
    F 21:0 get_instructors - A
    F 44:0 search_user - A
backend/app/slides/material.py
    F 70:0 update_material - C
    F 142:0 delete_material - B
    F 34:0 get_material - A
    F 16:0 get_materials - A
backend/app/slides/code_snippet.py
    F 16:0 get_code_snippet - B
    F 64:0 create_code_snippet - B
    F 135:0 delete_code_snippet - A
    F 156:0 execute_code_snippet - A
backend/app/slides/comment.py
    F 13:0 get_comment - A
    F 68:0 reply_to_comment - A
    F 100:0 delete_comment - A
    F 47:0 create_comment - A
backend/app/slides/course.py
    F 89:0 create_course - C
    F 18:0 get_courses - B
    F 200:0 get_calendar - B
    F 171:0 enroll_to_course - B
    F 230:0 fetch_member - B
    F 61:0 get_course_info - A
backend/app/slides/bookmarklist.py
    F 54:0 create_marklist - B
    F 44:0 convert_string_to_int_list - A
    F 108:0 delete_marklist - A
    F 21:0 get_marklist - A
backend/app/slides/section.py
    F 49:0 create_section - C
    F 20:0 get_sections - A
    F 99:0 delete_section - A
backend/app/slides/file.py
    F 60:0 update_file - B
    F 41:0 delete_file - A
    F 12:0 create_file - A
backend/app/slides/group.py
    F 50:0 delete_group - B
    F 21:0 get_group - A
    F 72:0 add_user_to_group - A
backend/app/slides/assignment.py
    F 22:0 get_assignments - A
    F 55:0 create_assignment - A
backend/app/slides/note.py
    F 30:0 create_note - B
    F 15:0 get_note - A
    F 76:0 delete_note - A
backend/app/ai/__init__.py
    F 132:0 send_message - C
    F 85:0 update_chat_name - A
    F 28:0 chat - A
    F 46:0 get_chat - A
    F 116:0 delete_chat - A
    F 65:0 create_chat - A
backend/app/coding/__init__.py
    F 345:0 get_environment - C
    F 271:0 update_environment_directory - B
    F 30:0 websocket_endpoint - A
    F 88:0 terminal_endpoint - A
    F 303:0 delete_environment_directory - A
    F 201:0 update_environment_file - A
    F 228:0 delete_environment_file - A
    F 144:0 build_file_structure - A
    F 164:0 get_environment_files - A
    F 251:0 create_environment_directory - A
    F 185:0 create_environment_file - A
    F 329:0 get_pdf_file - A
    F 412:0 check_environment - A
backend/app/coding/api.py
    F 9:0 create_pod - A
backend/test/test_auth.py
    F 40:0 test_user_registration_and_login_flow - C
    F 102:0 test_invalid_login_attempts - A
    F 85:0 test_duplicate_registration - A
    F 130:0 test_protected_endpoint_access - A
    F 13:0 run_around_tests - A
    F 20:0 generate_random_string - A
    F 25:0 generate_random_user_data - A
backend/test/test_data_generation.py
    F 236:0 test_create_courses - B
    F 427:0 test_add_people_to_group - B
    F 273:0 test_course_listing - B
    F 453:0 test_create_file - B
    F 349:0 test_create_code_snippet - B
    F 290:0 test_create_sections - A
    F 389:0 test_user_search - A
    F 483:0 test_update_file - A
    F 208:0 setup_test_user - A
    F 333:0 test_create_notes - A
    F 407:0 test_create_bookmarklist - A
    F 509:0 test_create_assignment - A
    F 527:0 test_get_assignments - A
    F 17:0 generate_random_course - A
    F 306:0 test_create_materials - A
    F 499:0 test_delete_file - A
    F 141:0 generate_random_user_data - A
    F 12:0 generate_random_string - A
    F 67:0 generate_random_section - A
    F 96:0 generate_random_note - A
    F 107:0 generate_random_code_snippet - A
    F 162:0 generate_random_material - A
    F 179:0 generate_random_bookmarklist - A
    F 204:0 get_token - A
backend/test/test_environment/hello_world.py
    F 1:0 hello_world - A

126 blocks (classes, functions, methods) analyzed.
Average complexity: A (3.4444444444444446)
```