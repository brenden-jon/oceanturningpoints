"""Ocean observing platforms: where they are, what they are, and which country runs them.

Source: OceanOPS, the WMO-IOC centre that tracks the Global Ocean Observing System, public API
(https://www.ocean-ops.org/api/data, POST /oceanjson/platforms/search). Terms: free for educational and
non-commercial use with acknowledgement of OceanOPS as the source; no warranty of accuracy.

We keep each platform's last reported position, its type (grouped for the map), its network and the country
responsible. Status filters follow OceanOPS definitions: operational platforms, plus recently active
tide gauges and OceanSITES moorings, whose records are reported with a delay.

The Atlantic overturning and boundary arrays are drawn as indicative lines through published mooring
positions (OceanSITES, PANGAEA, cruise reports): RAPID-MOCHA-WBTS 26.5°N (2004), OSNAP West and East (2014),
NOAC 47°N (2006), MOVE 16°N (2000), TRACOS 11°S (2000 west, 2013 east) and SAMBA 34.5°S (2009). Interior
segments between verified moorings are approximate.

Output: public/data/monitoring/platforms.geojson, public/data/monitoring/summary.json
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import datetime, timezone

from common import OUT

API = "https://www.ocean-ops.org/api/data"
# GLOSS core tide gauges: OceanOPS carries no positions for them, so they come from the PSMSL list,
# active if any data stream is newer than the cutoff PSMSL sets for it (Holgate et al. 2013, PSMSL 2026).
GLOSS = "https://psmsl.org/products/gloss/data/glossCoreNetwork.xml"
FIELDS = ["country", "lastLocLat", "lastLocLon"]
# network code -> (status filter, map type)
NETWORKS = {
    "argo": ("6", "argo"), "gda": ("6", "drifter"), "moored-buoys": ("6", "mooring"), "oceansites": ("6,4", "mooring"),
    "tsunami-buoy": ("6", "mooring"), "vos": ("6", "ship"), "asap": ("6", "ship"),
    "xbt-soop": ("6", "ship"), "fvon": ("6", "ship"), "hf-radars": ("6", "radar"), "oceangliders": ("6", "other"),
    "anibos": ("6", "other"),
}
TYPES = {
    "argo": "Argo floats", "argo-bgc": "Biogeochemical Argo floats", "argo-deep": "Deep Argo floats",
    "drifter": "Drifting buoys", "mooring": "Moored buoys and observatories", "tide": "Tide gauges",
    "ship": "Ships reporting observations", "radar": "Coastal radars", "other": "Gliders and tagged animals",
}
ARRAYS = [
    {"name": "RAPID-MOCHA-WBTS, 26.5°N", "since": 2004, "coords": [[-76.87, 26.53], [-76.82, 26.5], [-76.74, 26.52], [-76.63, 26.48], [-49.5, 24.5], [-41.2, 24.5], [-24.17, 23.75], [-15.42, 27.22], [-13.4, 27.6]]},
    {"name": "OSNAP West", "since": 2014, "coords": [[-55.8, 52.4], [-51.08, 53.04], [-50.26, 53.38], [-49.74, 53.59], [-47.07, 59.21], [-48.3, 60.6]]},
    {"name": "OSNAP East", "since": 2014, "coords": [[-43.0, 60.1], [-41.11, 59.9], [-40.69, 59.86], [-40.28, 59.81], [-38.57, 59.65], [-35.0, 59.2], [-31.5, 58.9], [-28.0, 58.3], [-22.0, 58.0], [-17.0, 58.0], [-13.5, 57.6], [-9.6, 57.1], [-6.0, 56.8]]},
    {"name": "NOAC, 47°N", "since": 2006, "coords": [[-47.38, 46.52], [-43.23, 47.1], [-42.28, 47.1], [-42.0, 47.1], [-40.88, 47.1], [-39.5, 47.16], [-38.52, 47.21], [-37.36, 47.29], [-31.15, 47.67], [-23.42, 48.11], [-19.53, 48.31], [-15.0, 48.52], [-13.43, 48.83], [-12.62, 49.0]]},
    {"name": "MOVE, 16°N", "since": 2000, "coords": [[-60.61, 16.36], [-60.49, 16.35], [-51.52, 15.46]]},
    {"name": "TRACOS, 11°S (Brazil)", "since": 2000, "coords": [[-35.86, -10.26], [-35.67, -10.36], [-35.38, -10.59], [-35.03, -10.93]]},
    {"name": "TRACOS, 11°S (Angola)", "since": 2013, "coords": [[12.99, -10.67], [13.72, -10.84]]},
    {"name": "SAMBA, 34.5°S", "since": 2009, "coords": [[-51.5, -34.5], [17.0, -34.5]]},
]


def post(body: dict, tries: int = 5) -> dict:
    for t in range(tries):
        try:
            req = urllib.request.Request(API + "/oceanjson/platforms/search", data=json.dumps(body).encode(),
                                         headers={"Content-Type": "application/json", "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except Exception as e:  # noqa: BLE001 - the API is occasionally slow; retry then give up
            print(f"  retry {t + 1}: {e}")
            time.sleep(15)
    raise RuntimeError("OceanOPS API unavailable")


def networks() -> dict[str, int]:
    with urllib.request.urlopen(API + "/vocab/goos-observing-networks", timeout=60) as r:
        return {n["code"]: n["id"] for n in json.load(r)["items"]}


def gloss() -> list[dict]:
    with urllib.request.urlopen(GLOSS, timeout=120) as r:  # fresh each run: activity changes
        root = ET.fromstring(r.read())
    cut = {c.tag: c.text for c in root.find("activeDefinition")}
    out = []
    for st in root.find("glossStations"):
        latest = {c.tag[len("latest"):][0].lower() + c.tag[len("latest") + 1:]: c.text for c in st if c.tag.startswith("latest")}
        if not any(k in cut and v and v >= cut[k] for k, v in latest.items()):
            continue
        out.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [round(float(st.findtext("longitude")), 2), round(float(st.findtext("latitude")), 2)]},
                    "properties": {"t": "tide", "c": (st.findtext("country") or "Unknown").title()}})
    return out


def subnetwork(name: str) -> set[int]:
    """Ids of operational floats in an Argo sub-network (ARGO_BIO, ARGO_DEEP), via the OceanOPS v1 API."""
    exp = "[\"ptfStatus.name='OPERATIONAL' and networkPtfs.network.nameShort='%s'\"]" % name
    url = "https://www.ocean-ops.org/api/1/data/platform?" + urllib.parse.urlencode({"exp": exp, "include": '["id"]', "limit": 5000})
    for t in range(5):
        try:
            with urllib.request.urlopen(url, timeout=180) as r:
                return {x["id"] for x in json.load(r)["data"]}
        except Exception as e:  # noqa: BLE001
            print(f"  retry {t + 1}: {e}")
            time.sleep(15)
    return set()


def main() -> None:
    ids = networks()
    deep, bio = subnetwork("ARGO_DEEP"), subnetwork("ARGO_BIO")
    print(f"  Argo sub-networks: {len(bio)} biogeochemical, {len(deep)} deep")
    feats, seen = [], set()
    for code, (status, kind) in NETWORKS.items():
        off = 0
        while True:
            d = post({"filters": {"status": status, "masterNetworks": str(ids[code])}, "fields": FIELDS + ["id"],
                      "limit": 1000, "offset": off, "view": "flat"})
            items = d.get("items", [])
            for it in items:
                lat, lon = it.get("lastLocLat"), it.get("lastLocLon")
                if lat is None or lon is None or it.get("id") in seen:
                    continue
                seen.add(it.get("id"))
                pid = it.get("id")
                t = ("argo-deep" if pid in deep else "argo-bgc" if pid in bio else "argo") if kind == "argo" else kind
                feats.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": [round(lon, 2), round(lat, 2)]},
                              "properties": {"t": t, "c": it.get("country") or "Unknown"}})
            off += 1000
            if off >= d.get("total", 0) or not items:
                break
        print(f"  {code}: {sum(1 for f in feats if f['properties']['t'].startswith(kind[:4]))} so far")
    feats += gloss()
    print(f"  tide gauges (GLOSS core, active): {sum(1 for f in feats if f['properties']['t'] == 'tide')}")
    for a in ARRAYS:
        feats.append({"type": "Feature", "geometry": {"type": "LineString", "coordinates": a["coords"]},
                      "properties": {"t": "amoc", "name": a["name"], "since": a["since"]}})
    pts = [f for f in feats if f["properties"]["t"] != "amoc"]
    by_type = Counter(f["properties"]["t"] for f in pts)
    # Tide gauges are listed by location, which is not always the operator (Guam, Réunion), so they are
    # left out of the country ranking.
    by_country = Counter(f["properties"]["c"] for f in pts if f["properties"]["t"] != "tide")
    out = OUT / "monitoring"
    out.mkdir(parents=True, exist_ok=True)
    (out / "platforms.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": feats}, separators=(",", ":")))
    (out / "summary.json").write_text(json.dumps({
        "source": "OceanOPS (WMO-IOC), https://www.ocean-ops.org", "harvested": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "total": len(pts), "types": {k: {"label": TYPES[k], "n": by_type.get(k, 0)} for k in TYPES},
        "countries": by_country.most_common(15),
        "countriesTotal": len([c for c in by_country if c not in ("European Union", "Unknown")]),
        "arrays": [{"name": a["name"], "since": a["since"]} for a in ARRAYS]}, indent=1))
    print(f"  {len(pts)} platforms with positions in {len(by_country)} countries; top: {by_country.most_common(5)}")


if __name__ == "__main__":
    main()
