def test_analyze_text_paneer(client):
    payload = {
        "input_type": "text",
        "text": "Paneer tikka with green chutney",
        "context": "restaurant food"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert data["food"]["name"] is not None
    assert isinstance(data["risks"], list)
    assert isinstance(data["unknowns"], list)
    assert data["overall_status"] in ["potential_concern", "high_attention", "no_detected_concern", "insufficient_information"]

def test_image_analysis_does_not_return_text_fallback(client, monkeypatch):
    from app.services.llm_service import llm_service

    monkeypatch.setattr(llm_service, "client", None)
    response = client.post(
        "/api/v1/analyze",
        data={"input_type": "image", "text": "Is this safe for my diet?"},
        files={"image": ("dish.png", b"fake png content", "image/png")},
    )

    assert response.status_code == 503
    assert "Image analysis is unavailable" in response.json()["detail"]

def test_peanut_allergy_hidden_relationship_detection(client):
    payload = {
        "input_type": "text",
        "text": "Dosa with groundnut chutney"
    }
    response = client.post("/api/v1/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    # User profile has 'peanut' allergy; 'groundnut' maps to 'peanut'
    # Deterministic engine should flag allergy risk or high attention
    allergy_risks = [r for r in data["risks"] if r.get("type") == "allergy"]
    assert len(allergy_risks) > 0 or data["overall_status"] in ["high_attention", "potential_concern"]
