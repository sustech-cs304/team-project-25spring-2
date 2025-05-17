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
        "编译原理"
    ]
    course_numbers = [
        "CS101", "CS102", "CS201", "CS202", "CS301", "CS302",
        "CS401", "CS402", "CS501", "CS502"
    ]
    
    return {
        "course_id": course_id,
        "name": random.choice(course_names),
        "description": f"这是一门关于{random.choice(['计算机科学', '软件工程', '人工智能', '数据科学'])}的课程",
        "number": random.choice(course_numbers),
        "teacher_id": [str(uuid.uuid4()) for _ in range(random.randint(1, 3))],
        "sections": [],
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
        "第七章 总结与展望"
    ]
    schedules = [
        "2025-01-01",
        "2025-01-02",
        "2025-01-03",
        "2025-01-04",
        "2025-01-05",
    ]
    # select 3 random schedules
    selected_schedules = random.sample(schedules, 3)
    return {
        "section_id": section_id,
        "course_id": course_id,
        "name": random.choice(section_names),
        "schedules": selected_schedules
    }


def generate_random_user_data(is_teacher=False):
    """Generate random user data for testing"""
    user_id = f"1221" + str(random.randint(1000, 9999))
    name = f"Test User {generate_random_string(4)}"
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
        "视频讲解"
    ]
    
    # Process a pdf as base64
    with open(path, "rb") as pdf_file:
        content = base64.b64encode(pdf_file.read()).decode("utf-8")
    
    return material_id, {
        "material_name": random.choice(material_names),
        "section_id": section_id,
        "data": content,
        "comments": []
    }

Student_id_list = []
Teacher_id_list = []
Course_id_list = []
Section_id_list = []

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
        json={"name": user_data["user_id"], "password": user_data["password"]}
    )
    assert login_response.status_code == 200
    
    token = login_response.json()["token"]
    if user_data["is_teacher"]:
        Teacher_id_list.append({"user_id": user_data["user_id"], "token": token})
    else:
        Student_id_list.append({"user_id": user_data["user_id"], "token": token})

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
            "student_id": Student_id_list[0]["user_id"]
        }
        response = client.post("/api/add", data=add_student_data, headers=headers)

    # Login as student
    student_token = Student_id_list[0]["token"]
    headers = {"Authorization": f"Bearer {student_token}"}

    # List courses
    response = client.get("/api/courses", headers=headers)
    assert response.status_code == 200
    courses = response.json().get("courses", [])
    assert len(courses) >= len(created_courses)

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

    path =[os.path.join(os.path.dirname(__file__), "./南科大2025校历.pdf"), os.path.join(os.path.dirname(__file__), "./2503.21708v2.pdf")]
    for _ in range(2):
        material_id, material_data = generate_random_material(Section_id_list[0], path=path[_])
        response = client.post("/api/material/" + material_id, data=material_data, headers=headers)
        assert response.status_code == 200 or response.status_code == 201
        print(f"Successfully created material: {material_data['material_name']}")
    

