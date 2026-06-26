"""
Tests for the reports API — happy path + error cases.
External APIs (INFOBRAS, MEF, OEFA, Celery, Cloudinary) are mocked.
"""
from unittest.mock import patch, MagicMock


VALID_PAYLOAD = {
    "type": "denuncia",
    "category": "obra",
    "title": "Obra abandonada en Jr. Los Pinos",
    "description": "La obra lleva 4 meses paralizada sin ningún avance visible.",
    "latitude": -12.0464,
    "longitude": -77.0428,
    "photo_url": "https://res.cloudinary.com/test/image/upload/test.jpg",
}


@patch("services.report_service.process_report_async")
def test_create_report_happy_path(mock_task, client):
    mock_task.delay = MagicMock()
    response = client.post("/api/reports", json=VALID_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "denuncia"
    assert data["category"] == "obra"
    assert data["status"] == "pending"
    assert data["support_count"] == 0
    assert data["collective_request_sent"] is False
    assert "id" in data


@patch("services.report_service.process_report_async")
def test_create_report_invalid_latitude(mock_task, client):
    mock_task.delay = MagicMock()
    payload = {**VALID_PAYLOAD, "latitude": 10.0}  # Outside Peru
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 422


@patch("services.report_service.process_report_async")
def test_create_report_invalid_type(mock_task, client):
    mock_task.delay = MagicMock()
    payload = {**VALID_PAYLOAD, "type": "queja"}
    response = client.post("/api/reports", json=payload)
    assert response.status_code == 422


@patch("services.report_service.process_report_async")
def test_get_report(mock_task, client):
    mock_task.delay = MagicMock()
    create_resp = client.post("/api/reports", json=VALID_PAYLOAD)
    report_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/reports/{report_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == report_id


def test_get_report_not_found(client):
    import uuid
    response = client.get(f"/api/reports/{uuid.uuid4()}")
    assert response.status_code == 404


@patch("services.report_service.process_report_async")
def test_list_reports_empty(mock_task, client):
    mock_task.delay = MagicMock()
    response = client.get("/api/reports", params={"lat": -12.0464, "lng": -77.0428})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["reports"] == []


@patch("services.report_service.process_report_async")
def test_list_reports_returns_created(mock_task, client):
    mock_task.delay = MagicMock()
    client.post("/api/reports", json=VALID_PAYLOAD)
    response = client.get("/api/reports", params={"lat": -12.0464, "lng": -77.0428, "radius": 1})
    assert response.status_code == 200
    assert response.json()["total"] == 1


@patch("services.report_service.process_report_async")
def test_support_report(mock_task, client):
    mock_task.delay = MagicMock()
    report = client.post("/api/reports", json=VALID_PAYLOAD).json()

    support_resp = client.post(
        f"/api/reports/{report['id']}/support",
        json={"citizen_name": "María García"},
    )
    assert support_resp.status_code == 200
    data = support_resp.json()
    assert data["support_count"] == 1
    assert data["collective_request_sent"] is False


@patch("services.report_service.process_report_async")
def test_support_report_not_found(mock_task, client):
    import uuid
    mock_task.delay = MagicMock()
    response = client.post(
        f"/api/reports/{uuid.uuid4()}/support",
        json={"citizen_name": "Pedro López"},
    )
    assert response.status_code == 404


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert "status" in response.json()
