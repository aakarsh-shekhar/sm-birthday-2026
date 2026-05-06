export type SeedActivity = {
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  activityUrl?: string;
  includedInStay?: boolean;
};

/** Seeded from `CenterParcs ACTIVITIES/CENTER PARCS ACTIVITIES.xlsx` */
export const seedActivities: SeedActivity[] = [
  {
    title: "E-bike Rental",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Rent an electric bike and explore the area. No more problem to get up the hills.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/EBK",
  },
  {
    title: "Kickbike E-Scooter Rental",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Discover the park in a unique way with our kickbike E-scooter. Is it on the road or through the forest, our kickbike feels at home everywhere.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/EKICKSTEP",
  },
  {
    title: "E-car Rental (4/6 people)",
    category: "Sports and Fun",
    includedInStay: false,
    description: "Rent an E-car to easily move through our car-free parks.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/ECA",
  },
  {
    title: "Bicycle Rental",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Rent a bike for a trip through the green landscapes around the holiday park.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/BKE",
  },
  {
    title: "Mountain Bike Rental",
    category: "Sports and Fun",
    includedInStay: false,
    description: "Rent a mountain bike to discover the beauty of nature.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/MTB",
  },
  {
    title: "Adventure Foot Golf",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "The latest trend Adventure Foot Golf leaves nothing to be desired and offers a unique foot golf experience for young and old.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/ADVENTUREFOOTGOLFPMSNB",
  },
  {
    title: "Badminton",
    category: "Sports and Fun",
    includedInStay: false,
    description: "Our badminton courts are suitable for beginners and advanced.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/BADMINTON",
  },
  {
    title: "Climbing Paradise",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "An adrenaline rush at high altitude? In this indoor climbing paradise there are several climbing walls for different levels.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/CLIMBINGPARADISE",
  },
  {
    title: "Escape Room - Time Traveler",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "A guest who is on holiday at Het Heijderbos has discovered a time machine and has started traveling through different times.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/ESCAPEROOMEQYPTE",
  },
  {
    title: "Escape Room - Great Robbery",
    category: "Sports and Fun",
    includedInStay: false,
    description: "Live Escape Room is an exciting challenging and unpredictable game.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/ESCAPEROOMMUSEUM",
  },
  {
    title: "Family Laser Battle",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Get ready for battle. Try to conquer the opponent's flag, but dive away in time and try not to be hit by laser beams.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/FAMILYLASERBATTLEINDOOR",
  },
  {
    title: "Squash",
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "In squash everything is required of you! Take up the challenge and defeat your family and friends.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/SQUASH",
  },
  {
    title: "Jungle Dome",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Exotic birds, plants, hanging bridges... Welcome to the Jungle Dome, the Sumatran (play) jungle of 2500 m2! The indoor Jungle Dome is a unique piece of tropicals, in the middle of Limburg.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Fishing",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Enjoy the peace and beauty of the landscape? Maybe you'll be lucky and if you wait long enough you'll catch a big carp in the lake!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Animal Care",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Come and see how our animal caretakers care for and feed the animals in our petting zoo. Who knows, you might even give them a hand!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Table Tennis",
    category: "Sports and Fun",
    includedInStay: true,
    description: "Fancy a game of table tennis? Then there are tables waiting for you inside.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Playground",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Slides, swings, sandboxes... Your child will not be bored in the playground!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Sport Match Broadcast",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Watch sports matches on a big screen with your family and cheer on your favorite team.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Digital Nature Discovery",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Discover the secrets of nature in a unique way, through Augmented Reality games! Together with your family or friends, your knowledge will be tested during the route. Try to win all the badges and become a real nature expert!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Petting Zoo",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Visit the animals of the petting zoo together. Among other things, there are rabbits, goats and other animals that like to be pampered.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Family Board Game Package",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Win or lose, it's mainly about the game, right? Monopoly, Trivial Pursuit, Cluedo, Twister... We have the best games for the whole family.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Chill Tunes: Live",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Enjoy the best Chill Tunes while enjoying a snack or drink in the heart of the Market Dome!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Family Game Battle",
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Play along in this interactive game night! With your whole table and together (but also against!) with the rest of the participants you play in the different games in Mediterranean setting.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Dive Introduction",
    category: "Aqua Fun",
    includedInStay: false,
    description:
      "Always wanted to experience what it's like to breathe underwater? Diving is a fantastic sport! During this introductory lesson, you will first start with some theory and then you will take a dip in the Aqua Mundo, under the guidance of an instructor.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/DISCOVERSCUBA",
  },
  {
    title: "Snorkelling Pool",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Do you like snorkeling, or would you like to try it? In the snorkel pool, packed with tropical fish, you will dive into an exotic world that you thought existed only in distant places. Spectacular!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Duo Racer",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "No one is too old for a slide race. Tension and thrill assured when you rush through the corners at high speed. Each game ends with a spectacular splash. Bet you don't stick to it for once?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Hot Tubs",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "It's vacation, time for relaxation! Step into the warm water of our whirlpools and relax among the bubbling bubbles. Are you recharged again?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Wave Pool",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Brave the waves in the wave pool, it's like swimming in the sea! Fun for young and old under the watchful eye of our lifeguards.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Whitewater Course",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Get ready, because it's going wild on the fastest whitewater course of all our parks! Swirling water, fast straights, sharp bends, bumpy passages... bet you don't stick to it once?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Water Slides",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Roetsj of different slides in the Aqua Mundo. Are you going for a quick descent or would you rather have a slide where you slide off with the whole family?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Outdoor Heated Pool",
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Swim in the heated water of our outdoor pool. In summer you can enjoy the sun and sunbathe on one of the sun loungers.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Crazy Bingo Game",
    category: "Entertainment",
    includedInStay: false,
    description:
      "Order your drinks and enjoy! Experience an evening full of fun & games: in various exciting, crazy and unique games.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/BINGO",
  },
  {
    title: "Live Entertainment",
    category: "Entertainment",
    includedInStay: true,
    description: "Enjoy a live performance brought by our own entertainers.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/LIVEENTERTAINMENTNB",
  },
  {
    title: "Live Music",
    category: "Entertainment",
    includedInStay: true,
    description:
      "Come and have a drink with friends or family at the Market Dome and enjoy the live music... something for everyone!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Family Quiz Night",
    category: "Entertainment",
    includedInStay: true,
    description:
      "New questions and challenges during the fun Family Quiz Night. Have a drink, order some nibbles and then test your knowledge of Center Parcs and answer general questions. The winners go home with a nice prize.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Night Out",
    category: "Entertainment",
    includedInStay: true,
    description:
      "During Night Out you will be introduced to entertainment at Center Parcs: a fun evening for young and old with live music! Take a seat on the terrace under the palm trees and enjoy.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Arovite Wellness and Beauty",
    category: "Spa and Wellness",
    includedInStay: false,
    description:
      "Come and enjoy a wellness or beauty treatment at Arovite in the Market Dome. Experience one of our relaxing massages and the most pleasant treatments for your skin.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/AROVITENB",
  },
];
