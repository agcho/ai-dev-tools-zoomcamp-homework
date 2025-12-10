from fastapi.testclient import TestClient
import json

from backend.app.main import app


def test_health_and_websocket_broadcast():
    client = TestClient(app)

    # health
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

    # websocket broadcast: two clients in same room should receive each other's messages
    room = "testroom"

    with client.websocket_connect(f"/ws/{room}") as ws1:
        with client.websocket_connect(f"/ws/{room}") as ws2:
            # send message from ws1
            payload = json.dumps({"type": "edit", "content": "print(1)", "sender": "a"})
            ws1.send_text(payload)

            # ws2 should receive the message
            msg = ws2.receive_text()
            assert msg == payload