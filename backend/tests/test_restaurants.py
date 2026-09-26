def test_restaurant_search(client):
    res = client.get("/api/v1/restaurants/search?q=Green")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)

def test_restaurant_menu(client):
    res = client.get("/api/v1/restaurants/r1/menu")
    assert res.status_code == 200
    data = res.json()
    assert "restaurant" in data
    assert "items" in data

def test_analyze_restaurant_menu(client):
    res = client.post("/api/v1/restaurants/r1/analyze-menu")
    assert res.status_code == 200
    data = res.json()
    assert "best_matches" in data
    assert "review" in data
    assert "high_attention" in data
    assert "unknown" in data
