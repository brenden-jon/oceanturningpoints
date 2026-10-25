"use client";

import Link from "next/link";
import { useState } from "react";
import EarthMap from "./EarthMap";
import styles from "./AtlasView.module.css";

type Look = "satellite" | "night";

const LAYERS: Record<Look, { label: string; title: string; text: string; caution: string; source: React.ReactNode }> = {
  satellite: {
    label: "Day",
    title: "The Earth by day",
    text: "A cloud-free composite of the land surface and the shape of the sea floor. Shallow shelves and reefs show as pale blue; the deep ocean basins as dark blue.",
    caution: "A composite of many cloud-free images collected over months. The sea-floor shading is drawn from depth measurements.",
    source: <>NASA Earth Observatory, <a href="https://earthobservatory.nasa.gov/features/BlueMarble">Blue Marble</a>, via NASA GIBS. Public domain.</>,
  },
  night: {
    label: "Night",
    title: "Lights at night, 2016",
    text: "Light seen from space at night, composited from a year of satellite observations. Coastal cities and river deltas stand out, showing how much of human settlement crowds the shore.",
    caution: "Light follows electrification and economic activity more closely than population. Many poor and rural communities are dark at night, so this map understates how many people live along much of the coast of Africa and Asia.",
    source: <>NASA Black Marble 2016 (Román et al., 2018, <a href="https://doi.org/10.1016/j.rse.2018.03.017">doi:10.1016/j.rse.2018.03.017</a>), via NASA GIBS. Public domain.</>,
  },
};

const PLACES = [
  { id: "atlantic", label: "The Atlantic", center: [-30, 25] as [number, number], zoom: 1.45 },
  { id: "bengal", label: "Bay of Bengal", center: [88, 20] as [number, number], zoom: 3.6 },
  { id: "nile", label: "Nile Delta", center: [31, 30.5] as [number, number], zoom: 5 },
  { id: "sahel", label: "West Africa and the Sahel", center: [0, 12] as [number, number], zoom: 3.3 },
  { id: "caribbean", label: "Caribbean", center: [-72, 17] as [number, number], zoom: 3.6 },
  { id: "coral", label: "Coral Triangle", center: [125, -2] as [number, number], zoom: 3.2 },
  { id: "southern", label: "Southern Ocean", center: [20, -62] as [number, number], zoom: 1.6 },
];

export default function AtlasView() {
  const [look, setLook] = useState<Look>("satellite");
  const [place, setPlace] = useState(PLACES[0]);
  const L = LAYERS[look];
  return (
    <div className={styles.atlas}>
      <div className={styles.mapBox}>
        <EarthMap key={look} look={look} projection="globe" view={{ center: place.center, zoom: place.zoom }}
          className={styles.map} ariaLabel={`${L.title}, centred on ${place.label}`} />
      </div>
      <aside className={styles.panel}>
        <fieldset className={styles.group}>
          <legend className="label">Layer</legend>
          <div className={styles.seg}>
            {(Object.keys(LAYERS) as Look[]).map((k) => (
              <button key={k} aria-pressed={look === k} onClick={() => setLook(k)}>{LAYERS[k].label}</button>
            ))}
          </div>
        </fieldset>
        <div className={styles.about}>
          <h2 className={styles.h}>{L.title}</h2>
          <p>{L.text}</p>
          <p className="aside-note">{L.caution}</p>
          <p className={styles.source}>{L.source}</p>
        </div>
        <fieldset className={styles.group}>
          <legend className="label">Go to</legend>
          <div className={styles.list}>
            {PLACES.map((p) => (
              <button key={p.id} aria-pressed={place.id === p.id} onClick={() => setPlace(p)}>{p.label}</button>
            ))}
          </div>
        </fieldset>
        <div className={styles.more}>
          <p className="label">Data layers</p>
          <p className="small">
            Temperature and rainfall after an Atlantic circulation collapse are mapped in the{" "}
            <Link href="/questions/amoc-collapse/">AMOC explorer</Link>.
          </p>
        </div>
      </aside>
    </div>
  );
}
