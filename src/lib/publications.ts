/**
 * Published work by the curator, shown on the About page.
 *
 * Rules (from the editorial brief): list only work that has been published
 * and publicly released; verify each entry against Crossref before adding it;
 * never list drafts, submissions or work under review, and never name the
 * journal a manuscript is intended for. FORTHCOMING holds accepted work the curator has
 * explicitly approved for listing, without a journal name. Last verified 25 October 2026.
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
  { authors: "Coughlan de Perez, E., van den Hurk, B., van Aalst, M. K., Jongman, B., Klose, T. & Suarez, P.", year: 2015,
    title: "Forecast-based financing: an approach for catalyzing humanitarian action based on extreme weather and climate forecasts",
    venue: "Natural Hazards and Earth System Sciences", details: "15, 895–904", doi: "10.5194/nhess-15-895-2015" },
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

export const FORTHCOMING = [
  { authors: "Jongman, B. & Hall, J. W.", title: "Adapting to the risk of Atlantic circulation change" },
];

/** Work in progress the curator has asked to list: topic and one sentence, no findings, journals or institutions. */
export const IN_PROGRESS = [
  { title: "Ocean observation for climate and development decisions",
    text: "Which decisions depend on which ocean observations, and why unbroken in situ records matter most for decisions that last decades." },
  { title: "Decision-making for a changing ocean",
    text: "How to tell which decisions should change now, which need assessment first, and where current plans are robust to the big ocean changes." },
  { title: "Financing marine protection",
    text: "How the protection and long-term management of marine areas can be paid for." },
];

export const PROFILES = {
  website: "https://brendenjongman.com/",
  scholar: "https://scholar.google.com/citations?user=ww2AjtrbmvQC&hl=en",
  linkedin: "https://www.linkedin.com/in/brendenjongman/",
  substack: null as string | null, // add once the curator confirms the address
};
