def test_get_profile(client):
    response = client.get("/api/v1/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["id"] == "123"
    assert data["user"]["name"] == "Karthik"
    assert isinstance(data["conditions"], list)
    assert isinstance(data["allergies"], list)

def test_put_profile(client):
    payload = {
        "conditions": ["diabetes", "hypertension"],
        "allergies": ["peanut"],
        "diet": ["vegetarian"],
        "preferences": ["low_oil"]
    }
    response = client.put("/api/v1/profile", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "diabetes" in data["conditions"]
    assert "peanut" in data["allergies"]
    assert "vegetarian" in data["diet"]
    assert "low_oil" in data["preferences"]
