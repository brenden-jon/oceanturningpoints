/**
 * Published work by the curator, shown on the About page.
 *
 * Rules (from the editorial brief): list only work that has been published
 * and publicly released; verify each entry against Crossref before adding it;
 * never list drafts, submissions or work under review, and never name the
 * journal a manuscript is intended for. Last verified 24 October 2026.
 */
export interface Publication {
  authors: string;
  year: number;
  title: string;
  venue: string;
  details?: string;
  doi: string;
  type?: "article" | "comment" | "chapter";
}

export const PUBLICATIONS: Publication[] = [
  { authors: "van Zanten, B., Brander, L., Castaneda, J.-P., et al. (incl. Jongman, B.)", year: 2025,
    title: "Integrated spatial cost-benefit analysis of large-scale mangrove conservation and restoration in Indonesia",
    venue: "Frontiers in Environmental Science", details: "13, 1459034", doi: "10.3389/fenvs.2025.1459034" },
  { authors: "Jongman, B.", year: 2021, title: "The fraction of the global population at risk of floods is growing",
    venue: "Nature", details: "596, 37–38 (News & Views)", doi: "10.1038/d41586-021-01974-0", type: "comment" },
  { authors: "Jongman, B.", year: 2018, title: "Effective adaptation to rising flood risk",
    venue: "Nature Communications", details: "9, 1986", doi: "10.1038/s41467-018-04396-1" },
  { authors: "Winsemius, H. C., Aerts, J. C. J. H., van Beek, L. P. H., et al. (incl. Jongman, B.)", year: 2016,
    title: "Global drivers of future river flood risk", venue: "Nature Climate Change", details: "6, 381–385", doi: "10.1038/nclimate2893" },
  { authors: "Jongman, B., Winsemius, H. C., Aerts, J. C. J. H., et al.", year: 2015,
    title: "Declining vulnerability to river floods and the global benefits of adaptation",
    venue: "Proceedings of the National Academy of Sciences", details: "112, E2271–E2280", doi: "10.1073/pnas.1414439112" },
  { authors: "Jongman, B., Hochrainer-Stigler, S., Feyen, L., et al.", year: 2014,
    title: "Increasing stress on disaster-risk finance due to large floods", venue: "Nature Climate Change", details: "4, 264–268", doi: "10.1038/nclimate2124" },
  { authors: "Jongman, B., Ward, P. J. & Aerts, J. C. J. H.", year: 2012,
    title: "Global exposure to river and coastal flooding: long term trends and changes", venue: "Global Environmental Change",
    details: "22, 823–835", doi: "10.1016/j.gloenvcha.2012.07.004" },
];

export const PROFILES = {
  orcid: "https://orcid.org/0000-0002-3361-2498",
  linkedin: "https://www.linkedin.com/in/brendenjongman/",
  website: null as string | null, // personal website: add once confirmed
};
