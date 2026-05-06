export type SeedActivity = {
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  activityUrl?: string;
  includedInStay?: boolean;
};

export const seedActivities: SeedActivity[] = [
  {
    title: "Aqua Mundo",
    category: "Aqua Mundo",
    includedInStay: true,
    description:
      "Large tropical water paradise with rapids, Duo Racer, wave pools, snorkeling areas and family attractions.",
    imageUrl: "/activity-images/aqua-mundo.jpg",
    activityUrl:
      "https://www.centerparcs.nl/nl-nl/nederland/fp_HB_vakantiepark-het-heijderbos/aqua-mundo",
  },
  {
    title: "Wild Water Rapids",
    category: "Aqua Mundo",
    includedInStay: true,
    description: "High-speed rapids ride considered the fastest wild water ride at Center Parcs.",
    imageUrl: "/activity-images/wild-water-rapids.png",
    activityUrl:
      "https://www.centerparcs.nl/nl-nl/nederland/fp_HB_vakantiepark-het-heijderbos/aqua-mundo",
  },
  {
    title: "Duo Racer Slide",
    category: "Aqua Mundo",
    includedInStay: true,
    description: "Dual racing waterslide where two riders compete side-by-side.",
    imageUrl: "/activity-images/duo-racer-slide.jpg",
    activityUrl:
      "https://www.centerparcs.nl/nl-nl/nederland/fp_HB_vakantiepark-het-heijderbos/aqua-mundo",
  },
  {
    title: "Snorkeling Pool",
    category: "Aqua Mundo",
    includedInStay: true,
    description:
      "Snorkeling experience through a themed underwater environment with tropical fish and sunken city scenery.",
    imageUrl: "/activity-images/snorkeling-pool.jpg",
    activityUrl:
      "https://www.centerparcs.nl/nl-nl/nederland/fp_HB_vakantiepark-het-heijderbos/aqua-mundo",
  },
  {
    title: "Kids Diving Introduction",
    category: "Aqua Mundo",
    includedInStay: false,
    description: "Introductory diving experience for children including underwater scooter rides.",
    imageUrl: "/activity-images/kids-diving-introduction.jpg",
    activityUrl:
      "https://www.centerparcs.nl/nl-nl/nederland/fp_HB_vakantiepark-het-heijderbos/aqua-mundo",
  },
  {
    title: "Jungle Dome",
    category: "Kids activities",
    includedInStay: true,
    description:
      "Massive indoor tropical jungle with rope bridges, climbing areas, hanging vines, slides and exotic animals.",
    imageUrl: "/activity-images/jungle-dome.png",
    activityUrl: "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos",
  },
  {
    title: "Action Factory",
    category: "Entertainment",
    includedInStay: true,
    description:
      "Large indoor entertainment complex with games, climbing and interactive attractions.",
    imageUrl: "/activity-images/action-factory.jpg",
    activityUrl: "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos",
  },
  {
    title: "High Adventure Experience",
    category: "Sport & Fun",
    includedInStay: false,
    description: "Outdoor ropes and climbing adventure course high in the trees.",
    imageUrl: "/activity-images/high-adventure-experience.jpg",
    activityUrl:
      "https://www.centerparcs.de/de-de/niederlande/fp_HB_ferienpark-het-heijderbos/tageskarten",
  },
  {
    title: "Zip Wire",
    category: "Sport & Fun",
    includedInStay: false,
    description: "Outdoor zipline attraction through the forested park area.",
    imageUrl: "/activity-images/zip-wire.jpg",
    activityUrl:
      "https://www.centerparcs.de/de-de/niederlande/fp_HB_ferienpark-het-heijderbos/tageskarten",
  },
  {
    title: "Climbing Tower",
    category: "Sport & Fun",
    includedInStay: false,
    description: "Outdoor climbing structure suitable for multiple skill levels.",
    imageUrl: "/activity-images/climbing-tower.jpg",
    activityUrl:
      "https://www.centerparcs.de/de-de/niederlande/fp_HB_ferienpark-het-heijderbos/tageskarten",
  },
  {
    title: "Archery",
    category: "Sport & Fun",
    includedInStay: false,
    description: "Guided archery sessions with targets and beginner instruction.",
    imageUrl: "/activity-images/archery.jpg",
    activityUrl:
      "https://www.centerparcs.de/de-de/niederlande/fp_HB_ferienpark-het-heijderbos/tageskarten",
  },
  {
    title: "Bowling",
    category: "Entertainment",
    includedInStay: false,
    description: "Indoor bowling lanes suitable for groups, families and evening entertainment.",
    imageUrl: "/activity-images/bowling.jpg",
    activityUrl: "https://www.centerparcs.de/de-de/da_sport-fun/action-factory",
  },
  {
    title: "Escape Room",
    category: "Entertainment",
    includedInStay: false,
    description: "Puzzle-solving themed escape room experience.",
    imageUrl: "/activity-images/escape-room.jpg",
    activityUrl:
      "https://www.centerparcs.de/de-de/niederlande/fp_HB_ferienpark-het-heijderbos/tageskarten",
  },
  {
    title: "Laser Battle",
    category: "Entertainment",
    includedInStay: false,
    description: "Indoor laser tag arena with team-based gameplay.",
    imageUrl: "/activity-images/laser-battle.jpg",
    activityUrl: "https://www.centerparcs.de/de-de/da_sport-fun/action-factory",
  },
  {
    title: "Adventure Golf",
    category: "Sport & Fun",
    includedInStay: false,
    description: "Mini golf course with themed obstacles and family-friendly gameplay.",
    imageUrl: "/activity-images/adventure-golf.jpg",
    activityUrl:
      "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos/all-activities",
  },
  {
    title: "Cycle Center",
    category: "Cycle Center",
    includedInStay: false,
    description:
      "Bike rental center offering standard bikes, e-bikes, kids bikes, family bikes and trailers.",
    imageUrl: "/activity-images/cycle-center.jpg",
    activityUrl:
      "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos/all-activities",
  },
  {
    title: "Nature Walks",
    category: "Sport & Fun",
    includedInStay: true,
    description: "Walking trails through forests and nature areas surrounding the park.",
    imageUrl: "/activity-images/nature-walks.jpg",
    activityUrl: "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos",
  },
  {
    title: "Spa & Wellness",
    category: "Spa & Wellness",
    includedInStay: false,
    description: "Wellness facilities including sauna and spa treatments.",
    imageUrl: "/activity-images/spa-wellness.jpg",
    activityUrl:
      "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos/all-activities",
  },
  {
    title: "Live Entertainment",
    category: "Entertainment",
    includedInStay: true,
    description: "Evening shows, music, kids performances and seasonal events.",
    imageUrl: "/activity-images/live-entertainment.jpg",
    activityUrl:
      "https://www.centerparcs.de/de-de/niederlande/fp_HB_ferienpark-het-heijderbos/anreise",
  },
  {
    title: "Workshops",
    category: "Workshops",
    includedInStay: false,
    description: "Creative and seasonal workshops for children and families.",
    imageUrl: "/activity-images/workshops.jpg",
    activityUrl:
      "https://www.centerparcs.eu/in-en/netherlands/fp_HB_holiday-park-het-heijderbos/all-activities",
  },
];
