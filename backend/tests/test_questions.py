def test_followup_questions_and_answers(client):
    # 1. Create an analysis session first
    create_res = client.post("/api/v1/analyze", json={
        "input_type": "text",
        "text": "Paneer Butter Masala"
    })
    analysis_id = create_res.json()["analysis_id"]

    # 2. Get questions
    q_res = client.get(f"/api/v1/analysis/{analysis_id}/questions")
    assert q_res.status_code == 200
    q_data = q_res.json()
    assert "questions" in q_data
    assert len(q_data["questions"]) > 0
    question_id = q_data["questions"][0]["id"]

    # 3. Post answers
    a_res = client.post(f"/api/v1/analysis/{analysis_id}/answers", json={
        "answers": [
            {"question_id": question_id, "answer": "restaurant prep with extra butter"},
            {"question_id": "q2", "answer": "yes, contains soy"}
        ]
    })
    assert a_res.status_code == 200
    updated = a_res.json()
    assert updated["analysis_id"] == analysis_id
    assert "overall_status" in updated
