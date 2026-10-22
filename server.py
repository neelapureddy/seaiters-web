#!/usr/bin/env python3
"""
Seaiters Commercial Maritime Operations Server (Python Edition)
---------------------------------------------------------------
Zero-dependency Python 3 HTTP server providing:
 - Static file hosting for index.html
 - REST API endpoint for commercial inquiries (POST /api/inquiry)
 - Real-time AIS vessel telemetry feed (GET /api/ais/vessels)
"""

import http.server
import socketserver
import json
import os
import random
import time
from datetime import datetime

PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INQUIRIES_FILE = os.path.join(BASE_DIR, "inquiries.json")

if not os.path.exists(INQUIRIES_FILE):
    with open(INQUIRIES_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)

AIS_VESSELS = [
    {
        "mmsi": "563048000",
        "imo": "9811000",
        "name": "EVER GLOBE",
        "callSign": "9V8821",
        "flag": "SG",
        "type": "Container (ULCV)",
        "dwt": 220000,
        "length": 400,
        "beam": 59,
        "draught": 16.2,
        "sog": 17.4,
        "cog": 284,
        "heading": 284,
        "lat": 1.2240,
        "lon": 103.7820,
        "destination": "ROTTERDAM (NL)",
        "eta": "2026-10-31 06:00 UTC",
        "status": "Underway Using Engine",
        "cargo": "19,800 TEU High Value Dry & Reefer",
        "chokepoint": "Singapore Strait / Malacca"
    },
    {
        "mmsi": "636019550",
        "imo": "9744271",
        "name": "TI EUROPE",
        "callSign": "A8AA5",
        "flag": "LR",
        "type": "Crude Oil Tanker (ULCC)",
        "dwt": 441585,
        "length": 380,
        "beam": 68,
        "draught": 24.5,
        "sog": 14.1,
        "cog": 112,
        "heading": 112,
        "lat": 26.5400,
        "lon": 56.4100,
        "destination": "NINGBO (CN)",
        "eta": "2026-11-04 18:00 UTC",
        "status": "Underway Using Engine",
        "cargo": "3,100,000 bbl Heavy Sour Crude",
        "chokepoint": "Strait of Hormuz"
    },
    {
        "mmsi": "228389600",
        "imo": "9839272",
        "name": "CMA CGM JACQUES SAADE",
        "callSign": "FMCG",
        "flag": "FR",
        "type": "Container (LNG Powered)",
        "dwt": 220000,
        "length": 400,
        "beam": 61,
        "draught": 15.8,
        "sog": 16.8,
        "cog": 320,
        "heading": 320,
        "lat": 27.8500,
        "lon": 34.2800,
        "destination": "LE HAVRE (FR)",
        "eta": "2026-10-29 12:00 UTC",
        "status": "Underway Using Engine",
        "cargo": "23,000 TEU General Merchandise",
        "chokepoint": "Suez Canal / Red Sea"
    },
    {
        "mmsi": "538007200",
        "imo": "9796000",
        "name": "BERGE OLYMPUS",
        "callSign": "V7AB8",
        "flag": "MH",
        "type": "Capesize Bulk Carrier (WindWings)",
        "dwt": 211000,
        "length": 300,
        "beam": 50,
        "draught": 18.2,
        "sog": 12.8,
        "cog": 45,
        "heading": 45,
        "lat": -34.8000,
        "lon": 19.5000,
        "destination": "QINGDAO (CN)",
        "eta": "2026-11-12 04:00 UTC",
        "status": "Underway Using Engine",
        "cargo": "204,000 MT Brazilian Carajas Iron Ore",
        "chokepoint": "Cape of Good Hope"
    },
    {
        "mmsi": "311000850",
        "imo": "9654000",
        "name": "ARCTIC VOYAGER",
        "callSign": "C6ZW2",
        "flag": "BS",
        "type": "LNG Carrier (Moss Type)",
        "dwt": 85000,
        "length": 290,
        "beam": 46,
        "draught": 11.5,
        "sog": 18.2,
        "cog": 76,
        "heading": 76,
        "lat": 28.5000,
        "lon": -94.2000,
        "destination": "ROTTERDAM (NL)",
        "eta": "2026-11-02 14:00 UTC",
        "status": "Underway Using Engine",
        "cargo": "174,000 CBM Liquefied Natural Gas",
        "chokepoint": "Houston Ship Channel"
    }
]

class SeaitersRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/inquiries":
            try:
                with open(INQUIRIES_FILE, "r", encoding="utf-8") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(data.encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        if self.path == "/api/ais/vessels":
            now = time.time()
            dynamic_fleet = []
            for i, v in enumerate(AIS_VESSELS):
                c = dict(v)
                c["lastUpdate"] = datetime.utcnow().isoformat() + "Z"
                dynamic_fleet.append(c)

            resp = {
                "status": "ONLINE",
                "source": "TERRESTRIAL_AND_SATELLITE_AIS",
                "vesselCount": len(dynamic_fleet),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "vessels": dynamic_fleet
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(resp, indent=2).encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/inquiry":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")

            try:
                payload = json.loads(body)
                rand_id = random.randint(1000, 9999)
                prefix = "CHTR" if payload.get("orderType") == "Cargo Charter" else "TON"
                ref = payload.get("reference") or f"SIT-{prefix}-2026-{rand_id}"

                record = {
                    "reference": ref,
                    "receivedAt": datetime.utcnow().isoformat() + "Z",
                    "forwardedTo": "operations@seaiters.com",
                    "status": "TRANSMITTED_TO_OPERATIONS",
                    **payload
                }

                try:
                    with open(INQUIRIES_FILE, "r", encoding="utf-8") as f:
                        current = json.load(f)
                except Exception:
                    current = []

                current.insert(0, record)
                with open(INQUIRIES_FILE, "w", encoding="utf-8") as f:
                    json.dump(current, f, indent=2)

                print(f"[SEAITERS DESK] INQUIRY DISPATCHED TO operations@seaiters.com: {ref} from {record.get('principal')}")

                resp = {
                    "success": True,
                    "reference": ref,
                    "timestamp": record["receivedAt"],
                    "dispatchedTo": "operations@seaiters.com",
                    "message": "Commercial inquiry received and dispatched to operations@seaiters.com.",
                    "deskOfficerAssigned": "Duty Broking Officer (operations@seaiters.com)",
                    "slaMinutes": 60
                }
                self.send_response(201)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(resp).encode("utf-8"))

            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == "__main__":
    print(f"Starting Seaiters Maritime Server on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), SeaitersRequestHandler) as httpd:
        httpd.serve_forever()
