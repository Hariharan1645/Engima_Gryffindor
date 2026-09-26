def test_generate_meal_plan(client):
    payload = {
        "days": 7,
        "meals_per_day": 3,
        "preferences": ["vegetarian", "indian"]
    }
    res = client.post("/api/v1/meal-plans/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "plan_id" in data
    assert "days" in data
    assert len(data["days"]) == 7
    assert len(data["days"][0]["meals"]) == 3
