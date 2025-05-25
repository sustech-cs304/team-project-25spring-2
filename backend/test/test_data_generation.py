import uuid
import random
import string
from fastapi.testclient import TestClient
from app.main import app
import base64
import os

client = TestClient(app)


def generate_random_string(length=8):
    """Generate a random string of specified length"""
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def generate_random_course():
    """Generate random course data for testing"""
    course_id = str(uuid.uuid4())
    course_names = [
        "计算机科学导论",
        "数据结构与算法",
        "操作系统",
        "计算机网络",
        "数据库系统",
        "软件工程",
        "人工智能",
        "机器学习",
        "计算机图形学",
        "编译原理",
    ]
    course_numbers = [
        "CS101",
        "CS102",
        "CS201",
        "CS202",
        "CS301",
        "CS302",
        "CS401",
        "CS402",
        "CS501",
        "CS502",
    ]
    # require_group = random.choice([True, False])
    require_group = True
    group_num = random.randint(1, 3) if require_group else 0
    people_per_group = random.randint(2, 5) if require_group else 0
    group_deadline = random.choice(
        [
            "2025-06-01",
            "2025-06-02",
        ]
    )

    return {
        "course_id": course_id,
        "name": random.choice(course_names),
        "description": f"这是一门关于{random.choice(['计算机科学', '软件工程', '人工智能', '数据科学'])}的课程",
        "number": random.choice(course_numbers),
        "require_group": require_group,
        "group_num": group_num,
        "people_per_group": people_per_group,
        "group_deadline": group_deadline,
    }


def generate_random_section(course_id):
    """Generate a random section for a specified course"""
    section_id = str(uuid.uuid4())
    section_names = [
        "第一章 绪论",
        "第二章 基础概念",
        "第三章 核心原理",
        "第四章 实践应用",
        "第五章 案例分析",
        "第六章 项目实践",
        "第七章 总结与展望",
    ]
    schedules = [
        "2025-06-01 10:00:00",
        "2025-06-02 10:00:00",
        "2025-06-03 10:00:00",
        "2025-06-04 10:00:00",
        "2025-06-05 10:00:00",
    ]
    # select 3 random schedules
    selected_schedules = random.sample(schedules, 3)
    return {
        "section_id": section_id,
        "course_id": course_id,
        "name": random.choice(section_names),
        "schedules": selected_schedules,
    }


def generate_random_note(material_id):
    """Generate random note data for testing"""
    note_id = str(uuid.uuid4())
    note_content = f"这是一条关于{random.choice(['计算机科学', '软件工程', '人工智能', '数据科学'])}的笔记"
    return note_id, {
        "note_id": note_id,
        "material_id": material_id,
        "content": note_content,
    }


def generate_random_code_snippet():
    """Generate random code snippet data for testing"""
    code_snippet_id = str(uuid.uuid4())
    code_snippet_content = f"这是一段关于{random.choice(['计算机科学', '软件工程', '人工智能', '数据科学'])}的代码"
    lang = random.choice(
        [
            "python",
            "java",
            "c",
            "c++",
            "javascript",
            "go",
            "rust",
            "kotlin",
            "swift",
            "typescript",
        ]
    )
    page = random.randint(1, 100)
    position_x = random.randint(1, 100)
    position_y = random.randint(1, 100)
    return (
        code_snippet_id,
        page,
        {
            "snippet_id": code_snippet_id,
            "lang": lang,
            "content": code_snippet_content,
            "position_x": position_x,
            "position_y": position_y,
        },
    )


def generate_random_user_data(is_teacher=False):
    """Generate random user data for testing"""
    if is_teacher:
        user_id = "30001221"
        name = "Teacher"
        password = f"password"
        email = f"testTeacher@gmail.com"
    else:
        user_id = "12211414"
        name = f"Student {generate_random_string(4)}"
        password = f"password"
        email = f"test{generate_random_string(4)}@gmail.com"
    return {
        "user_id": user_id,
        "name": name,
        "password": password,
        "is_teacher": is_teacher,
        "email": email,
    }


def generate_random_material(section_id=None, path=None):
    """Generate random material data for testing"""
    material_id = str(uuid.uuid4())
    material_names = [
        "课程讲义",
        "实验指导",
        "补充资料",
        "练习题",
        "参考文献",
        "课后作业",
        "项目案例",
        "视频讲解",
    ]
    material_name = random.choice(material_names)
    return material_id, material_name, section_id, path


def generate_random_bookmarklist(material_id, user_id):
    """Generate random bookmarklist data for testing"""
    list_id = str(uuid.uuid4())
    bookmarklist_data = {
        "list_id": list_id,
        "material_id": material_id,
        "user_id": user_id,
        "page": random.randint(1, 100),
        "bookmark_list": [],
    }
    return list_id, bookmarklist_data


Student_id_list = []
Teacher_id_list = []
Course_id_list = []
Section_id_list = []
Material_id_list = []
Note_id_list = []
Code_snippet_id_list = []
Bookmarklist_id_list = []
File_id_list = []
Assignment_id_list = []
Envrionment_id_list = []

def get_token(user_id):
    return Student_id_list[user_id]


def setup_test_user(is_teacher=False):
    """Set up a test user and return authentication token"""
    user_data = generate_random_user_data(is_teacher)

    # Register user
    register_response = client.post("/api/register", json=user_data)
    assert register_response.status_code == 201 or register_response.status_code == 200

    # Login to get token
    login_response = client.post(
        "/api/login",
        json={"name": user_data["user_id"], "password": user_data["password"]},
    )
    assert login_response.status_code == 200

    token = login_response.json()["token"]
    if user_data["is_teacher"]:
        Teacher_id_list.append(
            {"user_id": user_data["user_id"], "token": token, "name": user_data["name"]}
        )
    else:
        Student_id_list.append(
            {"user_id": user_data["user_id"], "token": token, "name": user_data["name"]}
        )

    return token, user_data


def test_create_courses():
    token, user_data = setup_test_user(is_teacher=True)
    setup_test_user(is_teacher=False)
    headers = {"Authorization": f"Bearer {token}"}

    created_courses = []
    for _ in range(2):
        course_data = generate_random_course()
        response = client.post("/api/course_info", data=course_data, headers=headers)
        assert response.status_code == 200 or response.status_code == 201
        Course_id_list.append(course_data["course_id"])
        created_courses.append(course_data)
        print(f"Successfully created course: {course_data['name']}")

    for course_data in created_courses:
        add_student_data = {
            "course_id": course_data["course_id"],
            "user_id": Student_id_list[0]["user_id"],
        }
        response = client.post("/api/enroll", data=add_student_data, headers=headers)

    # Login as student
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    # List courses
    response = client.get("/api/courses", headers=headers)
    assert response.status_code == 200
    courses = response.json().get("courses", [])
    assert len(courses) >= 2

    response = client.get("/api/fetch_member/" + Course_id_list[0], headers=headers)
    assert response.status_code == 200
    members = response.json().get("users", [])
    assert len(members) >= 2


def test_course_listing():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    response = client.get("/api/courses", headers=headers)
    assert response.status_code == 200

    courses = response.json().get("courses", [])
    assert isinstance(courses, list)

    if courses:
        course = courses[0]
        assert "course_id" in course
        assert "name" in course
        assert "number" in course


def test_create_sections():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}
    for _ in range(2):
        section_data = generate_random_section(Course_id_list[0])
        response = client.post("/api/section", data=section_data, headers=headers)
        assert response.status_code == 200 or response.status_code == 201
        Section_id_list.append(section_data["section_id"])
        print(f"Successfully created section: {section_data['name']}")

    response = client.get("/api/sections/" + Course_id_list[0], headers=headers)
    assert response.status_code == 200
    sections = response.json().get("sections", [])
    assert len(sections) >= 2


def test_create_materials():
    """Test creating materials"""
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    path = [
        os.path.join(os.path.dirname(__file__), "./南科大2025校历.pdf"),
        os.path.join(os.path.dirname(__file__), "./2503.21708v2.pdf"),
    ]
    for _ in range(2):
        material_id, material_name, section_id, file_path = generate_random_material(
            Section_id_list[0], path=path[_]
        )
        Material_id_list.append(material_id)
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, "application/pdf")}
            data = {
                "material_name": material_name,
                "section_id": section_id,
            }
            response = client.post(
                "/api/material/" + material_id, data=data, files=files, headers=headers
            )
        assert response.status_code == 200 or response.status_code == 201
        print(f"Successfully created material: {material_name}")


def test_create_notes():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    note_id, note_data = generate_random_note(material_id=Material_id_list[0])
    response = client.post("/api/note/" + note_id, data=note_data, headers=headers)
    assert response.status_code == 200 or response.status_code == 201
    Note_id_list.append(note_id)
    print(f"Successfully created note: {note_data['content']}")

    response = client.get("/api/note/" + Material_id_list[0], headers=headers)
    assert response.status_code == 200
    # check if node_id is right
    assert response.json().get("note_id") == note_id


def test_create_code_snippet():
    teacher_token = Teacher_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {teacher_token}"}

    code_snippet_id, page, code_snippet_data = generate_random_code_snippet()
    response = client.post(
        "/api/snippet/" + Material_id_list[0] + "/page/" + str(page),
        data=code_snippet_data,
        headers=headers,
    )
    assert response.status_code == 200 or response.status_code == 201
    Code_snippet_id_list.append(code_snippet_id)
    print(f"Successfully created code snippet: {code_snippet_data['content']}")

    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}
    _, _, code_snippet_data = generate_random_code_snippet()
    code_snippet_data["snippet_id"] = code_snippet_id
    response = client.post(
        "/api/snippet/" + Material_id_list[0] + "/page/" + str(page),
        data=code_snippet_data,
        headers=headers,
    )
    assert response.status_code == 200 or response.status_code == 201
    Code_snippet_id_list.append(code_snippet_id)
    print(f"Successfully created code snippet: {code_snippet_data['content']}")

    response = client.get("/api/snippet/" + Material_id_list[0], headers=headers)
    print("#" * 200)
    print(response.json())
    print("#" * 200)
    assert response.status_code == 200
    # check if code_snippet_id is right
    assert response.json().get("code_snippets")[0].get("snippet_id") == code_snippet_id
    assert (
        response.json().get("code_snippets")[0].get("user_id")
        == Student_id_list[0]["user_id"]
    )


def test_user_search():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}
    response = client.get(
        "/api/search_user/" + Student_id_list[0]["name"], headers=headers
    )
    assert response.status_code == 200
    assert (
        response.json().get("user")[0].get("user_id") == Student_id_list[0]["user_id"]
    )
    response = client.get("/api/instructors/" + Course_id_list[0], headers=headers)
    print("*" * 200)
    print(response.json())
    print("*" * 200)
    assert response.status_code == 200
    assert response.json().get("teachers")[0].get("name") == Teacher_id_list[0]["name"]


def test_create_bookmarklist():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    list_id, bookmarklist_data = generate_random_bookmarklist(
        Material_id_list[0], Student_id_list[0]["user_id"]
    )
    Bookmarklist_id_list.append(list_id)
    response = client.post(
        "/api/marklist/" + list_id + "/page/" + str(bookmarklist_data["page"]),
        data=bookmarklist_data,
        headers=headers,
    )
    assert response.status_code == 200 or response.status_code == 201

    response = client.get("/api/marklist/" + Material_id_list[0], headers=headers)
    assert response.status_code == 200
    assert response.json().get("marklists")[0].get("list_id") == Bookmarklist_id_list[0]


def test_add_people_to_group():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    response = client.get("/api/group/" + Course_id_list[0], headers=headers)
    assert response.status_code == 200
    groups = response.json().get("groups", [])
    assert len(groups) >= 1
    group_id = groups[0].get("group_id")
    response = client.post(
        "/api/group/" + group_id + "/user/" + Student_id_list[0]["user_id"],
        headers=headers,
    )
    assert response.status_code == 200 or response.status_code == 201
    response = client.get("/api/group/" + Course_id_list[0], headers=headers)
    assert response.status_code == 200
    groups = response.json().get("groups", [])
    for group in groups:
        if group.get("group_id") == group_id:
            assert len(group.get("users")) == 1

    response = client.delete(
        "/api/group/" + group_id + "/user/" + Student_id_list[0]["user_id"],
        headers=headers,
    )

def test_create_file():
    teacher_token = Teacher_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {teacher_token}"}
    files_path = [
        os.path.join(os.path.dirname(__file__), "./test_environment/test_files/lecture1-introduction.pdf"),
        os.path.join(os.path.dirname(__file__), "./test_environment/test_files/lecture2-process.pdf"),
        os.path.join(os.path.dirname(__file__), "./test_environment/test_files/lecture3-requirements.pdf"),
        os.path.join(os.path.dirname(__file__), "./test_environment/hello_world.py"),
    ]
    for file_path in files_path:
        assert os.path.exists(file_path), "Sample PDF file does not exist."
        with open(file_path, "rb") as f:
            files = {"file": (os.path.basename(file_path), f, "application/pdf")}
            data = {
                "file_name": os.path.basename(file_path),
                "file_path": "/test_files" if file_path.endswith(".pdf") else "/",
            }
            response = client.post(
                "/api/file",
                headers=headers,
                data=data,
                files=files,
            )
            print(response.json())
        assert response.status_code == 200 or response.status_code == 201
        data = response.json()
        assert "file_id" in data
        File_id_list.append(data["file_id"])
        assert data["message"] == "File created successfully"

def test_update_file():
    headers = {"Authorization": f"Bearer {Teacher_id_list[0]['token']}"}
    update_resp = client.put(
        f"/api/file/{File_id_list[3]}",
        headers=headers,
        data={
            "file_name": "hello_world.py",
            "file_path": "/test_code_files",
        },
    )
    updated_file = update_resp.json()
    assert update_resp.status_code == 200
    assert updated_file["file_id"] == File_id_list[3]
    assert updated_file["file_name"] == "hello_world.py"
    assert updated_file["file_path"] == "/test_code_files"

def test_delete_file():
    headers = {"Authorization": f"Bearer {Teacher_id_list[0]['token']}"}
    delete_resp = client.delete(
        f"/api/file/{File_id_list[2]}",
        headers=headers,
    )
    assert delete_resp.status_code == 200
    deleted = delete_resp.json()
    assert deleted["is_deleted"] is True
    
def test_create_assignment():
    teacher_token = Teacher_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {teacher_token}"}
    assignment_data = {
        "course_id": Course_id_list[0],
        "name": "Homework 1",
        "description": "This is the first homework assignment.",
        "deadline": "2025-06-01 23:59:59",
        "is_group_assign": False,
        "files": File_id_list,
    }
    response = client.post("/api/assignment", data=assignment_data, headers=headers)
    assert response.status_code == 200 or response.status_code == 201
    data = response.json()
    assert "assignment_id" in data
    Assignment_id_list.append(data["assignment_id"])
    assert data["message"] == "Assignment created successfully."
    
def test_get_assignments():
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}
    response = client.get(f"/api/assignments/{Course_id_list[0]}", headers=headers)
    assert response.status_code == 200
    assignments = response.json().get("assignments", [])
    assert len(assignments) > 0
    assert assignments[0].get("assignment_id") == Assignment_id_list[0]
