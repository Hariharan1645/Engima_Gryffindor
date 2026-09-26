def test_counterfactual_modify_analysis(client):
    # Create analysis session
    create_res = client.post("/api/v1/analyze", json={
        "input_type": "text",
        "text": "Paneer tikka with butter glaze"
    })
    analysis_id = create_res.json()["analysis_id"]

    # Post modification request
    mod_res = client.post(f"/api/v1/analysis/{analysis_id}/modify", json={
        "changes": [
            {"type": "portion", "value": "small"},
            {"type": "ingredient", "ingredient": "butter", "action": "reduce"},
            {"type": "drink", "value": "unsweetened"}
        ]
    })
    assert mod_res.status_code == 200
    data = mod_res.json()
    assert "before" in data
    assert "after" in data
    assert "changes" in data
    assert len(data["changes"]) == 3
