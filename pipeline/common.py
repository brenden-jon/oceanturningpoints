"""Shared helpers for the Ocean Turning Points data pipeline.

Every published layer is written as a compact quantised grid:

    an 8-bit greyscale PNG on a regular 0.5-degree latitude-longitude grid,
    where pixel 0 means "no data" and 1..255 map linearly onto [vmin, vmax].

The browser decodes the PNG, recovers physical values for hover read-outs,
and applies the colour scale itself. 254 levels across the field's own range
gives a read-out precision far finer than the underlying models resolve, so
nothing is lost that the science could support.

Raw downloads are cached under pipeline/.cache and are never committed.
"""
from __future__ import annotations

import hashlib
import json
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
CACHE = HERE / ".cache"
OUT = HERE.parent / "public" / "data"

# Output grid. 0.5 degrees is still finer than any model used here (~1-2.5 degrees).
LAT = np.round(np.arange(-90, 90.0001, 0.5), 4)
LON = np.round(np.arange(-180, 180.0001, 0.5), 4)
GRID = {"lat0": -90, "lat1": 90, "lon0": -180, "lon1": 180, "res": 0.5,
        "h": int(LAT.size), "w": int(LON.size), "rowOrder": "north-to-south"}


def fetch(url: str, dest: Path, md5: str | None = None) -> Path:
    """Download once into the cache, optionally verifying an md5 checksum."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists() or dest.stat().st_size == 0:
        print(f"  downloading {dest.name}")
        req = urllib.request.Request(url, headers={"User-Agent": "OceanTurningPoints-pipeline"})
        with urllib.request.urlopen(req, timeout=3600) as r, open(dest, "wb") as f:
            while chunk := r.read(1 << 20):
                f.write(chunk)
    if md5:
        h = hashlib.md5()
        with open(dest, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        if h.hexdigest() != md5:
            raise RuntimeError(f"checksum mismatch for {dest.name}")
    return dest


def encode_grid(values: np.ndarray, path: Path) -> dict:
    """Quantise a (lat, lon) south-to-north field into an 8-bit PNG.

    Returns the decoding metadata. Rows are written north-to-south so the
    PNG reads the right way up in any image viewer.
    """
    v = np.asarray(values, dtype=np.float64)
    ok = np.isfinite(v)
    if not ok.any():
        raise ValueError(f"{path.name}: field is entirely missing")
    vmin, vmax = float(v[ok].min()), float(v[ok].max())
    if vmax - vmin < 1e-9:
        vmax = vmin + 1e-9
    q = np.zeros(v.shape, dtype=np.uint8)
    q[ok] = np.clip(np.rint((v[ok] - vmin) / (vmax - vmin) * 254) + 1, 1, 255).astype(np.uint8)
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(q[::-1]).save(path, optimize=True)
    return {"file": path.name, "vmin": round(vmin, 4), "vmax": round(vmax, 4),
            "step": round((vmax - vmin) / 254, 5), "bytes": path.stat().st_size}


def sample(field: np.ndarray, lat: float, lon: float) -> float | None:
    """Nearest-grid-point value from a field on the standard output grid."""
    i = int(np.argmin(np.abs(LAT - lat)))
    j = int(np.argmin(np.abs(LON - lon)))
    x = field[i, j]
    return None if not np.isfinite(x) else round(float(x), 2)


def write_json(obj, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=1, ensure_ascii=False))


# Places used for read-outs. Deliberately weighted toward the regions where
# the consequences of AMOC change fall on developing economies, not only
# toward the European cities that dominate media coverage.
PLACES = [
    # Europe and the North Atlantic
    {"name": "London", "country": "United Kingdom", "lat": 51.51, "lon": -0.13, "region": "europe"},
    {"name": "Edinburgh", "country": "United Kingdom", "lat": 55.95, "lon": -3.19, "region": "europe"},
    {"name": "Dublin", "country": "Ireland", "lat": 53.35, "lon": -6.26, "region": "europe"},
    {"name": "Oslo", "country": "Norway", "lat": 59.91, "lon": 10.75, "region": "europe"},
    {"name": "Reykjavík", "country": "Iceland", "lat": 64.15, "lon": -21.94, "region": "europe"},
    {"name": "Amsterdam", "country": "Netherlands", "lat": 52.37, "lon": 4.90, "region": "europe"},
    {"name": "Paris", "country": "France", "lat": 48.86, "lon": 2.35, "region": "europe"},
    {"name": "Madrid", "country": "Spain", "lat": 40.42, "lon": -3.70, "region": "europe"},
    {"name": "Warsaw", "country": "Poland", "lat": 52.23, "lon": 21.01, "region": "europe"},
    # North America
    {"name": "New York", "country": "United States", "lat": 40.71, "lon": -74.01, "region": "americas"},
    {"name": "Halifax", "country": "Canada", "lat": 44.65, "lon": -63.57, "region": "americas"},
    # West Africa and the Sahel
    {"name": "Dakar", "country": "Senegal", "lat": 14.72, "lon": -17.47, "region": "africa"},
    {"name": "Bamako", "country": "Mali", "lat": 12.64, "lon": -8.00, "region": "africa"},
    {"name": "Niamey", "country": "Niger", "lat": 13.51, "lon": 2.11, "region": "africa"},
    {"name": "Kano", "country": "Nigeria", "lat": 12.00, "lon": 8.52, "region": "africa"},
    {"name": "Accra", "country": "Ghana", "lat": 5.60, "lon": -0.19, "region": "africa"},
    {"name": "Addis Ababa", "country": "Ethiopia", "lat": 9.03, "lon": 38.74, "region": "africa"},
    # South Asia
    {"name": "Mumbai", "country": "India", "lat": 19.08, "lon": 72.88, "region": "asia"},
    {"name": "Delhi", "country": "India", "lat": 28.61, "lon": 77.21, "region": "asia"},
    {"name": "Dhaka", "country": "Bangladesh", "lat": 23.81, "lon": 90.41, "region": "asia"},
    {"name": "Karachi", "country": "Pakistan", "lat": 24.86, "lon": 67.01, "region": "asia"},
    # Latin America and the Caribbean
    {"name": "Mexico City", "country": "Mexico", "lat": 19.43, "lon": -99.13, "region": "americas"},
    {"name": "Guatemala City", "country": "Guatemala", "lat": 14.63, "lon": -90.51, "region": "americas"},
    {"name": "Kingston", "country": "Jamaica", "lat": 17.97, "lon": -76.79, "region": "americas"},
    {"name": "Caracas", "country": "Venezuela", "lat": 10.48, "lon": -66.90, "region": "americas"},
    {"name": "Fortaleza", "country": "Brazil", "lat": -3.73, "lon": -38.52, "region": "americas"},
    {"name": "Manaus", "country": "Brazil", "lat": -3.12, "lon": -60.02, "region": "americas"},
    {"name": "São Paulo", "country": "Brazil", "lat": -23.55, "lon": -46.63, "region": "americas"},
]
