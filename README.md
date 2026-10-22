# Seaiters Commercial Maritime Fleet Services

> **High-Fidelity AI-First Commercial Maritime Platform**  
> Integrated Vessel Chartering, S&P Asset Broking, Live Global AIS Radar Tracking, and Procedural 3D WebGL Miniature Fleet Simulation.

### 📞 Primary Commercial Desk Contacts
- **Primary Mobile & Direct Telephone**: **+91 9381477267**
- **24/7 WhatsApp Commercial Desk**: [wa.me/919381477267](https://wa.me/919381477267)
- **Primary Operations Email**: **`operations@seaiters.com`**

---

## 1. Overview & Capabilities

Seaiters is an international commercial vessel brokerage and port logistics web platform built in compliance with BIMCO and FONASBA standards.

### Core Modules
1. **Live Global AIS Vessel Tracking System**:
   - Interactive high-performance Leaflet.js radar map.
   - Real-time Class-A satellite & terrestrial AIS transponder tracking (VHF Ch. 87B/88B).
   - Real-time speed over ground (SOG), true course (COG), summer draught, cargo manifest, and destination ETA telemetry.
   - Critical chokepoint telemetry & fast camera jump buttons: Singapore Strait, Suez Canal / Red Sea, Strait of Hormuz, Panama Canal, English Channel / Dover TSS, Strait of Gibraltar, and Houston Ship Channel.
   - Interactive Transponder Dossier: Click any vessel to inspect live specs or trigger the **"Request Commercial Fixture on this Tonnage"** one-click chartering workflow.
   - AISStream.io satellite WebSocket and custom REST API configuration dialog.

2. **Expanded Procedural 3D Miniature Maritime Fleet (Three.js)**:
   - 8 architectural-scale WebGL 3D vessel and coastal models:
     - 🚢 **Ultra Large Container Vessel (ULCV)** (20,000 TEU, multi-tier cargo stacks, radar scanner)
     - 🚢 **Capesize Bulk Carrier** (208,000 DWT, 4 working gantry cranes, cargo hatches)
     - 🚢 **Moss-Type LNG Carrier** (174,000 CBM, spherical insulated tanks, cryogenic manifold)
     - 🚢 **VLCC Supertanker** (319,000 DWT, longitudinal piping rack, hose cranes, aft helipad)
     - 🚤 **High-Speed Offshore Pilot Launch** (Deep-V wave-piercing hull, safety orange cabin, twin rooster wakes)
     - 🚜 **Harbor Escort Tugboat** (80T BP, heavy rubber bow fender, wheelhouse)
     - 🗼 **Coastal Shoal Lighthouse** (Granite reef outcrop, striped masonry tower, 360° sweeping volumetric beam light)
     - 🟢 **Channel Navigation Buoys** (Bobbing cadence and flashing beacon lights)
   - **Floating 3D Fleet Inspector HUD**: Smoothly animates camera focus to any selected vessel with live engineering telemetry readouts.

3. **Commercial Operations & Inquiry Gateway**:
   - Dual-tab submission desk: **Cargo Chartering** vs. **Tonnage Offer & S&P Mandate**.
   - Automatic REST API dispatch to `/api/inquiry` routing directly to **`operations@seaiters.com`**.
   - Real-time fallback to secure client-side queue (`localStorage`) with offline capability.
   - **Direct Maritime Email Draft (`mailto:`)**: Pre-populates formal BIMCO fixture details addressed directly to `operations@seaiters.com`.
   - **Print / PDF Slip Generator**: One-click official receipt slip generation.
   - Persistent operational transaction ledger (`inquiries.json`) archiving all forwarded inquiries.

4. **Interactive Voyage & Laytime Estimator**:
   - Algorithmic calculation of transit duration, fuel burn (MT), Carbon Intensity Indicator (CII Grade), freight rate per MT, and total gross freight based on nautical distance, speed, and vessel deadweight.

---

## 2. Quickstart & How to Run

### Option A: Node.js Operations Server (Recommended)
Runs the complete full-stack platform with REST API endpoints, live AIS simulation, and inquiries archiving:

```powershell
# Navigate to the repository
cd "C:\Users\deepak reddy\Seaiters-website"

# Start the zero-dependency server
node server.js
```
Open **[http://localhost:3005](http://localhost:3005)** in your browser.

- **Frontend App**: `http://localhost:3005/`
- **Live AIS Feed API**: `GET http://localhost:3005/api/ais/vessels`
- **Submit Fixture API**: `POST http://localhost:3005/api/inquiry`
- **Archived Inquiries**: `GET http://localhost:3005/api/inquiries`

### Option B: Standalone Static Preview
Simply open [`index.html`](index.html) in Google Chrome, Microsoft Edge, or any modern web browser. All 3D graphics, Leaflet AIS tracking, and client-side calculations execute without external server dependencies.

---

## 3. Project Architecture

```
Seaiters-website/
├── index.html          # Core single-page application (HTML5, Tailwind, Three.js, Leaflet)
├── server.js           # Zero-dependency Node.js HTTP & REST API server
├── server.py           # Alternative Python 3 HTTP server
├── inquiries.json      # Persistent commercial fixture ledger
├── AGENTS.md           # Engineering & agent workflow policy
└── README.md           # Complete technical documentation
```

---

## 4. Institutional Compliance
- **BIMCO Standard Charter Parties**: GENCON, NYPE, BPTIME, SHELLTIME compatible.
- **FONASBA Quality Standard Verified**.
- **Sanctions & Security Screening**: OFAC / UK HMT / EU consolidated screening protocol.
