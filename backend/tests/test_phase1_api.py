import unittest

from fastapi.testclient import TestClient

from main import app


class Phase1ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.client.post("/api/session/stop")

    def tearDown(self):
        self.client.post("/api/session/stop")

    def test_status_endpoint_returns_backend_state(self):
        response = self.client.get("/api/status")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["backend"], "running")
        self.assertIn("version", body)
        self.assertIn("radar_connected", body)
        self.assertIn("session_active", body)
        self.assertIn("current_session_id", body)

    def test_rest_session_lifecycle_and_detail(self):
        start = self.client.post(
            "/api/session/start",
            json={"hr_bpm": 72, "rr_bpm": 16, "noise_level": 0.05},
        )

        self.assertEqual(start.status_code, 200)
        start_body = start.json()
        self.assertEqual(start_body["adapter"], "simulator")
        self.assertIsInstance(start_body["session_id"], str)
        self.assertIsNotNone(start_body["started_at"])

        detail = self.client.get(f"/api/session/{start_body['session_id']}")
        self.assertEqual(detail.status_code, 200)
        detail_body = detail.json()
        self.assertEqual(detail_body["session_id"], start_body["session_id"])
        self.assertEqual(detail_body["adapter"], "simulator")
        self.assertIn("duration_s", detail_body)
        self.assertIn("frame_count", detail_body)
        self.assertEqual(detail_body["config"]["hr_bpm"], 72.0)

        stop = self.client.post("/api/session/stop")
        self.assertEqual(stop.status_code, 200)
        stop_body = stop.json()
        self.assertEqual(stop_body["session_id"], start_body["session_id"])
        self.assertGreaterEqual(stop_body["duration_s"], 0)
        self.assertGreaterEqual(stop_body["frame_count"], 0)
        self.assertIsNotNone(stop_body["stopped_at"])

    def test_noise_level_accepts_fraction_and_percentage_style_values(self):
        fraction = self.client.post(
            "/api/session/start",
            json={"hr_bpm": 72, "rr_bpm": 16, "noise_level": 0.05},
        )
        fraction_id = fraction.json()["session_id"]
        fraction_detail = self.client.get(f"/api/session/{fraction_id}").json()
        self.assertEqual(fraction_detail["config"]["noise_level"], 0.05)
        self.client.post("/api/session/stop")

        percentage = self.client.post(
            "/api/session/start",
            json={"hr_bpm": 72, "rr_bpm": 16, "noise_level": 5},
        )
        percentage_id = percentage.json()["session_id"]
        percentage_detail = self.client.get(f"/api/session/{percentage_id}").json()
        self.assertEqual(percentage_detail["config"]["noise_level"], 0.05)

    def test_invalid_rest_session_input_returns_validation_error(self):
        response = self.client.post(
            "/api/session/start",
            json={"hr_bpm": 20, "rr_bpm": 16, "noise_level": 0.05},
        )

        self.assertEqual(response.status_code, 422)

    def test_unknown_session_returns_404(self):
        response = self.client.get("/api/session/not-found")

        self.assertEqual(response.status_code, 404)

    def test_websocket_start_frame_and_stop(self):
        with self.client.websocket_connect("/ws") as ws:
            ws.send_json({"type": "start_session", "hr_bpm": 80, "rr_bpm": 18, "noise_level": 5})

            started = ws.receive_json()
            self.assertEqual(started["type"], "status")
            self.assertEqual(started["payload"]["msg"], "started")
            self.assertIsInstance(started["payload"]["session_id"], str)

            frame = ws.receive_json()
            self.assertEqual(frame["type"], "frame")
            self.assertEqual(frame["payload"]["frame_id"], 0)
            self.assertIsInstance(frame["payload"]["signal"], float)
            self.assertIsInstance(frame["payload"]["range_profile"], list)
            self.assertEqual(frame["payload"]["ground_truth"]["hr_bpm"], 80.0)
            self.assertEqual(frame["payload"]["ground_truth"]["rr_bpm"], 18.0)

            ws.send_json({"type": "stop_session"})
            stopped = ws.receive_json()
            self.assertEqual(stopped["type"], "status")
            self.assertEqual(stopped["payload"]["msg"], "stopped_ok")
            self.assertGreaterEqual(stopped["payload"]["frame_count"], 1)
            self.assertGreaterEqual(stopped["payload"]["duration_s"], 0)

    def test_websocket_invalid_json_returns_error(self):
        with self.client.websocket_connect("/ws") as ws:
            ws.send_text("{invalid-json")
            error = ws.receive_json()

        self.assertEqual(error["type"], "error")
        self.assertEqual(error["payload"]["code"], "INVALID_JSON")

    def test_websocket_unsupported_message_returns_error(self):
        with self.client.websocket_connect("/ws") as ws:
            ws.send_json({"type": "unsupported"})
            error = ws.receive_json()

        self.assertEqual(error["type"], "error")
        self.assertEqual(error["payload"]["code"], "UNSUPPORTED_MESSAGE_TYPE")

    def test_websocket_disconnect_cleans_up_active_session(self):
        with self.client.websocket_connect("/ws") as ws:
            ws.send_json({"type": "start_session", "hr_bpm": 72, "rr_bpm": 16, "noise_level": 0.05})
            started = ws.receive_json()
            self.assertEqual(started["payload"]["msg"], "started")
            self.assertEqual(self.client.get("/api/status").json()["session_active"], True)

        status = self.client.get("/api/status")
        self.assertEqual(status.status_code, 200)
        self.assertEqual(status.json()["session_active"], False)


if __name__ == "__main__":
    unittest.main()
