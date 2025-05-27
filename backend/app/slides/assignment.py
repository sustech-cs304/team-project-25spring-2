from fastapi import APIRouter, Depends, Form, HTTPException
from sqlalchemy.orm import Session
from app.models.assignment import Assignment
from app.models.user import User
from app.models.course import Course
from app.auth.middleware import get_current_user
from app.db import get_db
from typing import List


router = APIRouter()


@router.get("/assignments/{course_id}")
async def get_assignments(
    course_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    assignments = (
        db.query(Assignment)
        .filter(Assignment.assignment_id.in_(course.assignments))
        .all()
    )
    if not assignments:
        raise HTTPException(
            status_code=404, detail="No assignments found for this course."
        )
    return {
        "message": "Assignments found.",
        "assignments": [
            {
                "assignment_id": assignment.assignment_id,
                "is_group_assign": assignment.is_group_assign,
                "name": assignment.name,
                "course_id": assignment.course_id,
                "teacher_id": assignment.teacher_id,
                "deadline": assignment.deadline,
                "is_over": assignment.is_over,
                "description": assignment.description,
            }
            for assignment in assignments
        ],
    }


@router.post("/assignment")
async def create_assignment(
    name: str = Form(None),
    description: str = Form(None),
    is_group_assign: bool = Form(None),
    course_id: str = Form(None),
    deadline: str = Form(None),
    files: List[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")

    # Create new assignment
    new_assignment = Assignment(
        name=name,
        course_id=course_id,
        teacher_id=current_user.user_id,
        deadline=deadline,
        description=description,
        is_over=False,
        is_group_assign=is_group_assign,
        files=files,
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    # Update course's assignments list
    if new_assignment.assignment_id not in course.assignments:
        course.assignments = course.assignments + [new_assignment.assignment_id]
    course.assignments = list(set(course.assignments))

    db.commit()
    return {
        "message": "Assignment created successfully.",
        "assignment_id": new_assignment.assignment_id,
    }


@router.post("/assignment/{assignment_id}")
async def edit_assignment(
    assignment_id: str,
    name: str = Form(None),
    description: str = Form(None),
    deadline: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(Assignment).filter(Assignment.assignment_id == assignment_id).first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    # Only allow the teacher who created the assignment to edit it
    if assignment.teacher_id != current_user.user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to edit this assignment."
        )

    if name is not None and name != "":
        assignment.name = name
    if description is not None and description != "":
        assignment.description = description
    if deadline is not None and deadline != "":
        assignment.deadline = deadline

    db.commit()
    db.refresh(assignment)
    return {"message": "Assignment updated successfully."}


@router.delete("/assignment/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assignment = (
        db.query(Assignment).filter(Assignment.assignment_id == assignment_id).first()
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")

    # Only allow the teacher who created the assignment to delete it
    if assignment.teacher_id != current_user.user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this assignment."
        )

    # Remove assignment from course's assignments list
    course = db.query(Course).filter(Course.course_id == assignment.course_id).first()
    if course and assignment.assignment_id in course.assignments:
        course.assignments = [
            aid for aid in course.assignments if aid != assignment.assignment_id
        ]
        db.commit()

    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted successfully."}
