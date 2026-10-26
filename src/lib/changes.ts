/** The big changes, in the order the site presents them. One list for the homepage, Big changes and Decisions. */
export interface Change {
  slug: string; title: string; story: string; storyLabel: string; science?: boolean; status: string; question: string;
  image: string; what: string; likely: string; means: string; done: string;
}

export const CHANGES: Change[] = [
  {
    slug: "amoc", title: "Atlantic circulation", story: "/changes/atlantic-circulation/", storyLabel: "Explore the scenarios",
    status: "Weakening very likely; collapse possible", question: "What would happen if the Atlantic circulation collapsed?",
    image: "The Atlantic overturning circulation: warm water flows north near the surface (red), sinks in the far north and returns south at depth (blue).",
    what: "A system of currents that carries warm water north through the Atlantic and cold water back south at depth. It keeps northwest Europe mild and holds the tropical rain belts in place.",
    likely: "Weakening this century is very likely. A collapse is a low-likelihood, high-impact risk: the IPCC has medium confidence it will not happen before 2100, and newer studies disagree.",
    means: "Much colder winters in northwest Europe, weaker monsoons in West Africa and South Asia, and faster sea-level rise on North Atlantic coasts, lasting centuries.",
    done: "Limit both the amount and the speed of warming; stress-test long-lived investments against a collapse and favour measures that help either way.",
  },
  {
    slug: "coral-reefs", title: "Coral reefs", story: "/changes/coral-reefs/", storyLabel: "See heat stress at every reef region",
    status: "Tipping point being crossed now", question: "Are coral reefs passing a tipping point?",
    image: "Peak heat stress at reef regions of the Indian Ocean and Pacific in 2023–2025; darker red means coral deaths were likely.",
    what: "When the sea stays too hot for weeks, corals bleach and many die. Reefs now bleach more often than they can recover.",
    likely: "Happening now. Reefs are assessed as crossing their thermal tipping point, about 1.2°C of warming (range 1.0–1.5°C), and IUCN lists 96% of reef ecosystems as Critically Endangered.",
    means: "About a billion people live within 100 km of a reef. Losing reefs weakens natural flood defences and cuts fish and tourism income.",
    done: "Bring warming back towards 1.2°C and below; protect the reefs most likely to survive and reduce local pressures; plan for weaker natural defences.",
  },
  {
    slug: "ice-sheets", title: "Ice sheets", story: "/changes/ice-sheets/", storyLabel: "Thresholds, commitment and the coast",
    status: "At risk since about 1°C of warming", question: "What if the ice sheets pass their tipping points?",
    image: "The Greenland and Antarctic ice sheets, which together hold enough ice to raise the sea by about 65 metres.",
    what: "Greenland and Antarctica are losing ice four times faster than in the 1990s. Past a threshold, feedbacks keep an ice sheet shrinking even if warming stops.",
    likely: "High confidence that both have tipping points, at risk since about 1°C of warming. Whether parts of West Antarctica have already passed one is disputed.",
    means: "Metres of sea-level rise, locked in over centuries to millennia. How fast it comes is the main uncertainty for coasts, deltas and islands.",
    done: "Keep peak warming low and bring it back towards 1°C; test ports, defences and new districts against a high-end rise.",
  },
  {
    slug: "el-nino", title: "El Niño and the tropical Pacific", story: "/changes/el-nino/", storyLabel: "How El Niño is changing",
    status: "Strong El Niño now; extremes growing", question: "Is warming locking the Pacific into El Niño?",
    image: "Sea temperature compared with normal across the Pacific in October 2026: the red tongue along the equator is El Niño.",
    what: "A natural warming of the eastern tropical Pacific every few years that shifts rain and drought around the world. A strong El Niño is under way in 2026.",
    likely: "El Niño will keep coming. Stronger extremes under warming are expected (medium confidence); a lasting El Niño-like Pacific is plausible but contested. It is not assessed as a tipping system.",
    means: "Droughts and floods across the tropics, food shortages, disease outbreaks and sharp falls in fish catches, with economic losses that last for years.",
    done: "Act on seasonal forecasts with agreed triggers and pre-arranged finance; size reserves and insurance for stronger events. Earlier net zero limits the long-term shift.",
  },
  {
    slug: "fish-on-the-move", title: "Fish on the move", story: "/changes/fish-on-the-move/", storyLabel: "Projections for every coastal country", science: false,
    status: "Under way; less fish with every degree", question: "Where will the fish go?",
    image: "Projected change in the fish each country’s waters can hold by the 2090s under very high emissions: darker red means larger losses.",
    what: "Warming shrinks the amount of fish the ocean can support and moves stocks towards the poles and across borders. Marine heatwaves can wipe out whole stocks within a year or two.",
    likely: "Already under way: warming cut sustainable yields by 4% over 1930–2010. Models project about 5% less fish per degree of warming (medium confidence); cod fisheries and kelp forests can tip locally.",
    means: "Less food and income for coastal communities, lost licence revenue for small island states, and disputes over stocks that cross borders.",
    done: "Limit warming, end overfishing, and adapt quotas and agreements as stocks move; protected and rebuilt stocks cope better.",
  },
  {
    slug: "subpolar-gyre", title: "Subpolar North Atlantic", story: "/changes/subpolar-gyre/", storyLabel: "Could it cool abruptly?",
    status: "Possible abrupt cooling within a decade", question: "Could the North Atlantic cool abruptly?",
    image: "The subpolar gyre: an anticlockwise loop of currents south of Greenland, with the winter sinking regions in the Labrador and Irminger Seas.",
    what: "A loop of currents south of Greenland where surface water sinks every winter, one of the engines of the Atlantic circulation.",
    likely: "Possible this century: in a minority of climate models winter sinking shuts down within a decade. Threshold estimate about 1.8°C, with a wide range (1.1–3.8°C).",
    means: "Rapid regional cooling around the North Atlantic, shifts in European weather, and changes to fisheries.",
    done: "Include abrupt regional cooling in European climate risk assessments, and keep the ocean observing arrays running.",
  },
];

/** Followed on the site but not presented as one of the big changes. */
export const ALSO_FOLLOWED = [
  { slug: "southern-ocean", title: "Southern Ocean", href: "/changes/southern-ocean/",
    text: "Slow changes in heat and carbon uptake, Antarctic sea ice and the cold water that sinks around Antarctica. They matter for global warming and sea level, but the evidence for near-term decisions is thinner than for the changes above." },
];
