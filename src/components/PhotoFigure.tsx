import { PHOTOS, type PhotoKey } from "@/lib/photos";
import { asset } from "@/lib/site";
import styles from "./PhotoFigure.module.css";

/** One or two photographs with a caption and the credit their licence requires. */
export default function PhotoFigure({ photos, caption, wide = false, narrow = false }: { photos: PhotoKey[]; caption: string; wide?: boolean; narrow?: boolean }) {
  const ps = photos.map((k) => PHOTOS[k]);
  return (
    <figure className={`${styles.fig} ${ps.length > 1 ? styles.pair : ""} ${wide ? styles.wide : ""} ${narrow ? styles.narrow : ""}`}>
      <div className={styles.imgs}>
        {ps.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.file} src={asset(`/img/photos/${p.file}`)} alt={p.alt} width={p.w} height={p.h} loading="lazy" />
        ))}
      </div>
      <figcaption>
        <span>{caption}</span>{" "}
        <span className={styles.credit}>
          {ps.map((p, i) => (
            <span key={p.file}>
              {i > 0 && " · "}
              Photo{ps.length > 1 ? (i === 0 ? " (left)" : " (right)") : ""}: <a href={p.source}>{p.credit}</a>,{" "}
              {p.licence.startsWith("Public domain") ? "public domain" : <a href={p.licenceUrl}>{p.licence}</a>}
            </span>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
