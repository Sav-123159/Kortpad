# Kortpad

Kortpad is 'n webtoepassing wat studente help om oop, beskikbare lokale op kampus te vind en dit vir toekomstige datums en tye te bespreek. Dit sluit ook 'n interaktiewe kampuskaart in wat die kortste looproete tussen lokale bereken.

Gebou as 'n groepprojek vir [kursusnaam/kode] by [universiteit se naam].

## Kenmerke

- **Lokaalsoektog** — soek vir oop lokale volgens kampus, gebou, kapasiteit en beskikbaarheid
- **Bespreking** — bespreek 'n lokaal vir 'n spesifieke datum en tyd
- **Roosters** — lokale word teen bestaande klasroosters getoets sodat studente slegs werklik oop tydgleuwe bespreek
- **Interaktiewe kampuskaart** — bekyk geboue en lokale op 'n Leaflet-kaart, met kortste-roete-berekening (Dijkstra se algoritme) tussen twee punte
- **Toerustingopsoek** — sien watter toerusting (projektors, witborde, ens.) in 'n lokaal beskikbaar is
- **Student- en Admin-aansigte** — studente soek en bespreek lokale; admins bestuur lokale, geboue, roosters en besprekings
- **Aanmelding/Verifikasie** — gebruikersrekeninge met geënkripteerde wagwoorde en admin-regte

## Tegnologie-stapel

**Frontend**
- React 19 + Vite
- React Leaflet / Leaflet (interaktiewe kaarte)
- Motion (animasies)

**Backend**
- FastAPI (Python)
- SQLite
- bcrypt (wagwoordenkripsie)
- Uvicorn (ASGI-bediener)

**Infrastruktuur**
- Docker & Docker Compose

## Projekstruktuur

```
ngpro262_projek/
├── backend/
│   ├── main.py           # FastAPI-app & alle API-roetes
│   ├── database.py       # Databasis-koppelinghulpfunksies
│   ├── models.py         # Pydantic-modelle
│   ├── graph.py           # Kampusgrafiek se laai/cache
│   ├── dijkstra.py        # Kortste-roete-berekening
│   ├── scripts/           # Databasis seed/reset/snapshot-nutsprogramme
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # React-komponente (Student- & Admin-aansigte, kaart, vorms, ens.)
│   │   ├── css/
│   │   └── data/
│   └── package.json
├── data/                  # SQLite-databasislêer & kampus-nodus-redigeerder
└── docker-compose.yml
```

## Aan die gang kom

### Voorvereistes
- [Docker](https://www.docker.com/) en Docker Compose
- Alternatiewelik, om dienste afsonderlik te laat loop: Node.js 20+ en Python 3.12+

### Loop met Docker (aanbeveel)

```bash
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)

### Loop met die hand

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Toetsdata inlaai (seed)

```bash
python backend/scripts/seed_test_data.py
```

Ander nuttige skripte in `backend/scripts/`: `reset_db.py` (stel die databasis terug) en `snapshot_db.py` (neem 'n momentopname van die huidige databasistoestand).

## API-oorsig

Die backend bied 'n REST API wat die volgende dek:

| Hulpbron | Beskrywing |
|---|---|
| `/user`, `/users`, `/user/login` | Gebruikersrekeninge & aanmelding |
| `/campus`, `/campuses` | Kampusse |
| `/building`, `/buildings` | Geboue |
| `/venue`, `/venues` | Lokale |
| `/timetable`, `/timetables` | Klasroosters per lokaal |
| `/booking`, `/bookings` | Lokaalbesprekings |
| `/equipment/by-venue_id/{venue_id}` | Toerusting in 'n lokaal |
| `/route/{campus_id}-{start_venue}-{destination_venue}` | Kortste looproete tussen twee lokale |

Volledige interaktiewe API-dokumentasie is beskikbaar by `http://localhost:8000/docs` sodra die backend loop (FastAPI se ingeboude Swagger UI).

## Span

- Martin Pretorius — 2024020161
- Erika Cronjé — [studente nommer]
- Savannah [Van] — [studente nommer]
- Vaughan van Emmenis — [studente nommer]

## Lisensie

[Voeg 'n lisensie by, of noem dat dit 'n universiteitsprojek is wat nie vir hergebruik/verspreiding bedoel is nie.]
