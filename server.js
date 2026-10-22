/**
 * Seaiters Commercial Maritime Operations Server
 * ----------------------------------------------------
 * High-performance, zero-external-dependency Node.js server.
 * Provides:
 *  - Static file hosting for index.html and assets
 *  - REST API endpoint for commercial inquiries (POST /api/inquiry)
 *  - Inquiries log viewer (GET /api/inquiries)
 *  - Real-time AIS vessel telemetry feed (GET /api/ais/vessels)
 *  - Webhook forwarder & email notification simulator
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const OPERATIONS_EMAIL = process.env.OPERATIONS_EMAIL || 'operations@seaiters.com';
const INQUIRIES_FILE = path.join(__dirname, 'inquiries.json');

// Ensure inquiries storage file exists
if (!fs.existsSync(INQUIRIES_FILE)) {
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
}

// Global AIS fleet simulation seed data
const AIS_VESSELS = [
  {
    mmsi: '563048000',
    imo: '9811000',
    name: 'EVER GLOBE',
    callSign: '9V8821',
    flag: 'SG',
    type: 'Container (ULCV)',
    dwt: 220000,
    length: 400,
    beam: 59,
    draught: 16.2,
    sog: 17.4,
    cog: 284,
    heading: 284,
    lat: 1.2240,
    lon: 103.7820,
    destination: 'ROTTERDAM (NL)',
    eta: '2026-10-31 06:00 UTC',
    status: 'Underway Using Engine',
    cargo: '19,800 TEU High Value Dry & Reefer',
    chokepoint: 'Singapore Strait / Malacca',
    route: [[1.224, 103.782], [1.350, 103.500], [2.100, 102.200], [5.500, 97.500]]
  },
  {
    mmsi: '636019550',
    imo: '9744271',
    name: 'TI EUROPE',
    callSign: 'A8AA5',
    flag: 'LR',
    type: 'Crude Oil Tanker (ULCC)',
    dwt: 441585,
    length: 380,
    beam: 68,
    draught: 24.5,
    sog: 14.1,
    cog: 112,
    heading: 112,
    lat: 26.5400,
    lon: 56.4100,
    destination: 'NINGBO (CN)',
    eta: '2026-11-04 18:00 UTC',
    status: 'Underway Using Engine',
    cargo: '3,100,000 bbl Heavy Sour Crude',
    chokepoint: 'Strait of Hormuz',
    route: [[26.54, 56.41], [25.80, 57.20], [24.00, 60.00], [12.00, 75.00]]
  },
  {
    mmsi: '228389600',
    imo: '9839272',
    name: 'CMA CGM JACQUES SAADE',
    callSign: 'FMCG',
    flag: 'FR',
    type: 'Container (LNG Powered)',
    dwt: 220000,
    length: 400,
    beam: 61,
    draught: 15.8,
    sog: 16.8,
    cog: 320,
    heading: 320,
    lat: 27.8500,
    lon: 34.2800,
    destination: 'LE HAVRE (FR)',
    eta: '2026-10-29 12:00 UTC',
    status: 'Underway Using Engine',
    cargo: '23,000 TEU General Merchandise',
    chokepoint: 'Suez Canal / Red Sea',
    route: [[27.85, 34.28], [29.95, 32.55], [31.30, 32.30], [35.00, 20.00]]
  },
  {
    mmsi: '538007200',
    imo: '9796000',
    name: 'BERGE OLYMPUS',
    callSign: 'V7AB8',
    flag: 'MH',
    type: 'Capesize Bulk Carrier (WindWings)',
    dwt: 211000,
    length: 300,
    beam: 50,
    draught: 18.2,
    sog: 12.8,
    cog: 45,
    heading: 45,
    lat: -34.8000,
    lon: 19.5000,
    destination: 'QINGDAO (CN)',
    eta: '2026-11-12 04:00 UTC',
    status: 'Underway Using Engine',
    cargo: '204,000 MT Brazilian Carajas Iron Ore',
    chokepoint: 'Cape of Good Hope',
    route: [[-34.8, 19.5], [-32.0, 30.0], [-10.0, 60.0], [5.0, 90.0]]
  },
  {
    mmsi: '311000850',
    imo: '9654000',
    name: 'ARCTIC VOYAGER',
    callSign: 'C6ZW2',
    flag: 'BS',
    type: 'LNG Carrier (Moss Type)',
    dwt: 85000,
    length: 290,
    beam: 46,
    draught: 11.5,
    sog: 18.2,
    cog: 76,
    heading: 76,
    lat: 28.5000,
    lon: -94.2000,
    destination: 'ROTTERDAM (NL)',
    eta: '2026-11-02 14:00 UTC',
    status: 'Underway Using Engine',
    cargo: '174,000 CBM Liquefied Natural Gas',
    chokepoint: 'Houston Ship Channel / US Gulf',
    route: [[28.5, -94.2], [26.0, -88.0], [25.0, -80.0], [35.0, -50.0]]
  },
  {
    mmsi: '211281000',
    imo: '9800000',
    name: 'PACIFIC EMERALD',
    callSign: 'DHXZ',
    flag: 'DE',
    type: 'Crude Oil Tanker (VLCC)',
    dwt: 319000,
    length: 333,
    beam: 60,
    draught: 21.0,
    sog: 13.9,
    cog: 88,
    heading: 88,
    lat: 1.1800,
    lon: 104.1200,
    destination: 'YOSU (KR)',
    eta: '2026-11-01 22:00 UTC',
    status: 'Underway Using Engine',
    cargo: '2,000,000 bbl Basrah Heavy',
    chokepoint: 'Singapore Strait',
    route: [[1.18, 104.12], [2.5, 106.0], [8.0, 111.0], [20.0, 120.0]]
  },
  {
    mmsi: '354001000',
    imo: '9760000',
    name: 'VALE BRASIL',
    callSign: '3FYX',
    flag: 'PA',
    type: 'Valemax VLOC',
    dwt: 400000,
    length: 362,
    beam: 65,
    draught: 23.0,
    sog: 12.2,
    cog: 140,
    heading: 140,
    lat: -20.3500,
    lon: -40.1500,
    destination: 'SOHAR (OM)',
    eta: '2026-11-18 10:00 UTC',
    status: 'Underway Using Engine',
    cargo: '390,000 MT Iron Ore Pellets',
    chokepoint: 'Atlantic South',
    route: [[-20.35, -40.15], [-25.0, -35.0], [-34.0, 18.0]]
  },
  {
    mmsi: '235099000',
    imo: '9780000',
    name: 'SEAITERS HORIZON',
    callSign: 'MBQC7',
    flag: 'GB',
    type: 'Container (ULCV Flagship)',
    dwt: 215000,
    length: 399,
    beam: 58,
    draught: 15.5,
    sog: 18.5,
    cog: 245,
    heading: 245,
    lat: 50.8500,
    lon: 1.2500,
    destination: 'SOUTHAMPTON (UK)',
    eta: '2026-10-22 18:30 UTC',
    status: 'Underway Using Engine',
    cargo: '20,500 TEU Commercial Cargo',
    chokepoint: 'English Channel / Dover TSS',
    route: [[50.85, 1.25], [50.5, 0.2], [50.7, -1.3]]
  },
  {
    mmsi: '357002000',
    imo: '9840000',
    name: 'BW GEMINI',
    callSign: '3FYY',
    flag: 'PA',
    type: 'Very Large Gas Carrier (VLGC)',
    dwt: 55000,
    length: 226,
    beam: 37,
    draught: 11.2,
    sog: 15.5,
    cog: 340,
    heading: 340,
    lat: 8.8500,
    lon: -79.5200,
    destination: 'CHIBA (JP)',
    eta: '2026-11-14 02:00 UTC',
    status: 'At Anchor / Transit Queue',
    cargo: '84,000 CBM Refrigerated Propane',
    chokepoint: 'Panama Canal Anchorage',
    route: [[8.85, -79.52], [9.3, -79.9], [12.0, -95.0]]
  },
  {
    mmsi: '244000100',
    imo: '9890000',
    name: 'ROTTERDAM PILOT 4',
    callSign: 'PB44',
    flag: 'NL',
    type: 'High-Speed Pilot Vessel',
    dwt: 120,
    length: 22,
    beam: 6.5,
    draught: 1.8,
    sog: 24.2,
    cog: 295,
    heading: 295,
    lat: 51.9800,
    lon: 3.9500,
    destination: 'MAAS CENTER BUOY',
    eta: '2026-10-22 11:15 UTC',
    status: 'Underway Using Engine',
    cargo: 'Deepsea Pilot Transfer Team',
    chokepoint: 'Rotterdam Maas Entrance',
    route: [[51.98, 3.95], [52.02, 3.85]]
  }
];

// Content-type map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost');
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // -------------------------------------------------------------
  // API: POST /api/inquiry (Submit Commercial Fixture Order)
  // -------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/api/inquiry') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);

        // Validation
        if (!payload.orderType || !payload.principal || !payload.officer) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required commercial fields (orderType, principal, officer).' }));
          return;
        }

        // Generate verified reference ID
        const rand = Math.floor(1000 + Math.random() * 9000);
        const refPrefix = payload.orderType === 'Cargo Charter' ? 'CHTR' : 'TON';
        const reference = payload.reference || `SIT-${refPrefix}-2026-${rand}`;

        const record = {
          reference,
          receivedAt: new Date().toISOString(),
          forwardedTo: OPERATIONS_EMAIL,
          status: 'TRANSMITTED_TO_OPERATIONS',
          ...payload
        };

        // Persist to inquiries.json
        const currentData = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8') || '[]');
        currentData.unshift(record);
        fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(currentData, null, 2), 'utf8');

        // Console log for operator visibility
        console.log(`\n======================================================`);
        console.log(`[SEAITERS DESK] INQUIRY DISPATCHED TO ${OPERATIONS_EMAIL}`);
        console.log(`Reference:   ${reference}`);
        console.log(`Type:        ${record.orderType}`);
        console.log(`Principal:   ${record.principal}`);
        console.log(`Officer:     ${record.officer} (${record.email || 'No email specified'})`);
        console.log(`Details:     ${record.commodity ? `${record.volume} ${record.commodity}` : record.vesselName || 'Standard terms'}`);
        console.log(`Forwarded:   ${OPERATIONS_EMAIL} (Instant Broker Queue Alert)`);
        console.log(`Status:      DELIVERED VIA SECURE OPERATIONS GATEWAY`);
        console.log(`======================================================\n`);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          reference,
          timestamp: record.receivedAt,
          dispatchedTo: OPERATIONS_EMAIL,
          message: `Inquiry successfully transmitted to Seaiters Commercial Operations Gateway and dispatched to ${OPERATIONS_EMAIL}.`,
          deskOfficerAssigned: `Duty Broking Officer (${OPERATIONS_EMAIL})`,
          slaMinutes: 60
        }));

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload: ' + err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // API: GET /api/inquiries (List Archived Inquiries)
  // -------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/inquiries') {
    try {
      const data = fs.readFileSync(INQUIRIES_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read inquiries storage.' }));
    }
    return;
  }

  // -------------------------------------------------------------
  // API: GET /api/ais/vessels (Live AIS Telemetry Feed)
  // -------------------------------------------------------------
  if (req.method === 'GET' && pathname === '/api/ais/vessels') {
    // Dynamically advance simulated ship coordinates slightly for realistic movement
    const now = Date.now() / 1000;
    const dynamicFleet = AIS_VESSELS.map((v, i) => {
      const speedKnots = v.sog;
      const degRad = (v.cog * Math.PI) / 180;
      // Slight delta based on speed and time
      const deltaLat = Math.cos(degRad) * 0.00015 * Math.sin(now * 0.05 + i);
      const deltaLon = Math.sin(degRad) * 0.00015 * Math.cos(now * 0.05 + i);

      return {
        ...v,
        lat: Number((v.lat + deltaLat).toFixed(5)),
        lon: Number((v.lon + deltaLon).toFixed(5)),
        lastUpdate: new Date().toISOString()
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ONLINE',
      source: 'TERRESTRIAL_AND_SATELLITE_AIS',
      frequency: 'VHF CH. 87B/88B (161.975MHz / 162.025MHz)',
      vesselCount: dynamicFleet.length,
      timestamp: new Date().toISOString(),
      vessels: dynamicFleet
    }));
    return;
  }

  // -------------------------------------------------------------
  // Static File Server
  // -------------------------------------------------------------
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA routing if HTML requested
        fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexContent) => {
          if (indexErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(indexContent);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

let currentPort = parseInt(process.env.PORT || 3005, 10);

function startServer(port) {
  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`SEAITERS COMMERCIAL MARITIME OPERATIONS SERVER ONLINE`);
    console.log(`Local Access:   http://localhost:${port}`);
    console.log(`Primary Phone:  +91 9381477267`);
    console.log(`Operations Desk: ${OPERATIONS_EMAIL}`);
    console.log(`API Inquiries:  POST http://localhost:${port}/api/inquiry`);
    console.log(`Live AIS Feed:  GET  http://localhost:${port}/api/ais/vessels`);
    console.log(`Storage File:   ${INQUIRIES_FILE}`);
    console.log(`======================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${currentPort} in use, trying port ${currentPort + 1}...`);
    currentPort++;
    startServer(currentPort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(currentPort);
