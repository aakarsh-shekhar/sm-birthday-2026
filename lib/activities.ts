import { activityImageUrl } from "./activity-images";

export type SeedActivity = {
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  activityUrl?: string;
  includedInStay?: boolean;
};

/** Seeded from `CenterParcs ACTIVITIES/CENTER PARCS ACTIVITIES.xlsx`; images in `public/activity-images/center-parcs/`. */
export const seedActivities: SeedActivity[] = [
  {
    title: "E-bike Rental",
    imageUrl: activityImageUrl("E-bike Rental", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Rent an electric bike and explore the area. No more problem to get up the hills.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/EBK",
  },
  {
    title: "Kickbike E-Scooter Rental",
    imageUrl: activityImageUrl("Kickbike E-Scooter Rental", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Discover the park in a unique way with our kickbike E-scooter. Is it on the road or through the forest, our kickbike feels at home everywhere.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/EKICKSTEP",
  },
  {
    title: "E-car Rental (4/6 people)",
    imageUrl: activityImageUrl("E-car Rental (4/6 people)", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description: "Rent an E-car to easily move through our car-free parks.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/ECA",
  },
  {
    title: "Bicycle Rental",
    imageUrl: activityImageUrl("Bicycle Rental", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Rent a bike for a trip through the green landscapes around the holiday park.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/BKE",
  },
  {
    title: "Mountain Bike Rental",
    imageUrl: activityImageUrl("Mountain Bike Rental", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description: "Rent a mountain bike to discover the beauty of nature.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/service/ar/MTB",
  },
  {
    title: "Adventure Foot Golf",
    imageUrl: activityImageUrl("Adventure Foot Golf", "webp"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "The latest trend Adventure Foot Golf leaves nothing to be desired and offers a unique foot golf experience for young and old.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/ADVENTUREFOOTGOLFPMSNB",
  },
  {
    title: "Badminton",
    imageUrl: activityImageUrl("Badminton", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description: "Our badminton courts are suitable for beginners and advanced.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/BADMINTON",
  },
  {
    title: "Climbing Paradise",
    imageUrl: activityImageUrl("Climbing Paradise", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "An adrenaline rush at high altitude? In this indoor climbing paradise there are several climbing walls for different levels.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/CLIMBINGPARADISE",
  },
  {
    title: "Escape Room - Time Traveler",
    imageUrl: activityImageUrl("Escape Room - Time Traveler", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "A guest who is on holiday at Het Heijderbos has discovered a time machine and has started traveling through different times.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/ESCAPEROOMEQYPTE",
  },
  {
    title: "Escape Room - Great Robbery",
    imageUrl: activityImageUrl("Escape Room - Great Robbery", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description: "Live Escape Room is an exciting challenging and unpredictable game.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/ESCAPEROOMMUSEUM",
  },
  {
    title: "Family Laser Battle",
    imageUrl: activityImageUrl("Family Laser Battle", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Get ready for battle. Try to conquer the opponent's flag, but dive away in time and try not to be hit by laser beams.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/FAMILYLASERBATTLEINDOOR",
  },
  {
    title: "Squash",
    imageUrl: activityImageUrl("Squash", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "In squash everything is required of you! Take up the challenge and defeat your family and friends.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/SQUASH",
  },
  {
    title: "Jungle Dome",
    imageUrl: activityImageUrl("Jungle Dome", "webp"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Exotic birds, plants, hanging bridges... Welcome to the Jungle Dome, the Sumatran (play) jungle of 2500 m2! The indoor Jungle Dome is a unique piece of tropicals, in the middle of Limburg.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Fishing",
    imageUrl: activityImageUrl("Fishing", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Enjoy the peace and beauty of the landscape? Maybe you'll be lucky and if you wait long enough you'll catch a big carp in the lake!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Animal Care",
    imageUrl: activityImageUrl("Animal Care", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Come and see how our animal caretakers care for and feed the animals in our petting zoo. Who knows, you might even give them a hand!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Table Tennis",
    imageUrl: activityImageUrl("Table Tennis", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description: "Fancy a game of table tennis? Then there are tables waiting for you inside.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Playground",
    imageUrl: activityImageUrl("Playground", "webp"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Slides, swings, sandboxes... Your child will not be bored in the playground!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Sport Match Broadcast",
    imageUrl: activityImageUrl("Sport Match Broadcast", "webp"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Watch sports matches on a big screen with your family and cheer on your favorite team.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Digital Nature Discovery",
    imageUrl: activityImageUrl("Digital Nature Discovery", "jpg"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Discover the secrets of nature in a unique way, through Augmented Reality games! Together with your family or friends, your knowledge will be tested during the route. Try to win all the badges and become a real nature expert!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Petting Zoo",
    imageUrl: activityImageUrl("Petting Zoo", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Visit the animals of the petting zoo together. Among other things, there are rabbits, goats and other animals that like to be pampered.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Family Board Game Package",
    imageUrl: activityImageUrl("Family Board Game Package", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Win or lose, it's mainly about the game, right? Monopoly, Trivial Pursuit, Cluedo, Twister... We have the best games for the whole family.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Chill Tunes: Live",
    imageUrl: activityImageUrl("Chill Tunes: Live", "webp"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Enjoy the best Chill Tunes while enjoying a snack or drink in the heart of the Market Dome!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Family Game Battle",
    imageUrl: activityImageUrl("Family Game Battle", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description:
      "Play along in this interactive game night! With your whole table and together (but also against!) with the rest of the participants you play in the different games in Mediterranean setting.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Dive Introduction",
    imageUrl: activityImageUrl("Dive Introduction", "avif"),
    category: "Aqua Fun",
    includedInStay: false,
    description:
      "Always wanted to experience what it's like to breathe underwater? Diving is a fantastic sport! During this introductory lesson, you will first start with some theory and then you will take a dip in the Aqua Mundo, under the guidance of an instructor.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/DISCOVERSCUBA",
  },
  {
    title: "Snorkelling Pool",
    imageUrl: activityImageUrl("Snorkelling Pool", "avif"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Do you like snorkeling, or would you like to try it? In the snorkel pool, packed with tropical fish, you will dive into an exotic world that you thought existed only in distant places. Spectacular!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Duo Racer",
    imageUrl: activityImageUrl("Duo Racer", "webp"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "No one is too old for a slide race. Tension and thrill assured when you rush through the corners at high speed. Each game ends with a spectacular splash. Bet you don't stick to it for once?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Hot Tubs",
    imageUrl: activityImageUrl("Hot Tubs", "avif"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "It's vacation, time for relaxation! Step into the warm water of our whirlpools and relax among the bubbling bubbles. Are you recharged again?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Wave Pool",
    imageUrl: activityImageUrl("Wave Pool", "avif"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Brave the waves in the wave pool, it's like swimming in the sea! Fun for young and old under the watchful eye of our lifeguards.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Whitewater Course",
    imageUrl: activityImageUrl("Whitewater Course", "avif"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Get ready, because it's going wild on the fastest whitewater course of all our parks! Swirling water, fast straights, sharp bends, bumpy passages... bet you don't stick to it once?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Water Slides",
    imageUrl: activityImageUrl("Water Slides", "webp"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Roetsj of different slides in the Aqua Mundo. Are you going for a quick descent or would you rather have a slide where you slide off with the whole family?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Outdoor Heated Pool",
    imageUrl: activityImageUrl("Outdoor Heated Pool", "avif"),
    category: "Aqua Fun",
    includedInStay: true,
    description:
      "Swim in the heated water of our outdoor pool. In summer you can enjoy the sun and sunbathe on one of the sun loungers.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Crazy Bingo Game",
    imageUrl: activityImageUrl("Crazy Bingo Game", "avif"),
    category: "Entertainment",
    includedInStay: false,
    description:
      "Order your drinks and enjoy! Experience an evening full of fun & games: in various exciting, crazy and unique games.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/BINGO",
  },
  {
    title: "Live Entertainment",
    imageUrl: activityImageUrl("Live Entertainment", "avif"),
    category: "Entertainment",
    includedInStay: true,
    description: "Enjoy a live performance brought by our own entertainers.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/LIVEENTERTAINMENTNB",
  },
  {
    title: "Live Music",
    imageUrl: activityImageUrl("Live Music", "avif"),
    category: "Entertainment",
    includedInStay: true,
    description:
      "Come and have a drink with friends or family at the Market Dome and enjoy the live music... something for everyone!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Family Quiz Night",
    imageUrl: activityImageUrl("Family Quiz Night", "webp"),
    category: "Entertainment",
    includedInStay: true,
    description:
      "New questions and challenges during the fun Family Quiz Night. Have a drink, order some nibbles and then test your knowledge of Center Parcs and answer general questions. The winners go home with a nice prize.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Night Out",
    imageUrl: activityImageUrl("Night Out", "webp"),
    category: "Entertainment",
    includedInStay: true,
    description:
      "During Night Out you will be introduced to entertainment at Center Parcs: a fun evening for young and old with live music! Take a seat on the terrace under the palm trees and enjoy.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program",
  },
  {
    title: "Arovite Wellness and Beauty",
    imageUrl: activityImageUrl("Arovite Wellness and Beauty", "avif"),
    category: "Spa and Wellness",
    includedInStay: false,
    description:
      "Come and enjoy a wellness or beauty treatment at Arovite in the Market Dome. Experience one of our relaxing massages and the most pleasant treatments for your skin.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/program/activity/AROVITENB",
  },
  {
    title: "Bowling",
    imageUrl: activityImageUrl("Bowling", "webp"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Bowling only starts when the balls start to roll and offers a successful combination of sportiness and fun. Try it yourself!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/BOWLINGALLEYA",
  },
  {
    title: "Bumper Cars",
    imageUrl: activityImageUrl("Bumper Cars", "jpg"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "These are not ordinary bumper cars, but round floating bumper cars! Sit behind the wheel and try to escape from the other children. Or go hunting and push other bumper cars to the side!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/BUMPERCARSNB",
  },
  {
    title: "Darts",
    imageUrl: activityImageUrl("Darts", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description: "Throw a dart with your group. Come to Bar Bowling.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/DARTSNBPMS",
  },
  {
    title: "Family Wall Climbing",
    imageUrl: activityImageUrl("Family Wall Climbing", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "An exciting and sporty activity for young and old. Climb a wall 12 meters high: safety is guaranteed and the difficulty level can be adjusted to the participants.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/FAMILYCLIMBIN4ROUTES",
  },
  {
    title: "Family Archery",
    imageUrl: activityImageUrl("Family Archery", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "The beginning is equally difficult. But those who persever learn to hit the target with bow and arrow during the archery lesson.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/ARCHERYFAMILY",
  },
  {
    title: "High Adventure Experience",
    imageUrl: activityImageUrl("High Adventure Experience", "webp"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Sportsmen and adventurers, watch out! You experience tension at high altitudes. You walk down a large climbing course, meters above the ground, while being encouraged from below.",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/HIGHADVENTUREEXPERIENCE",
  },
  {
    title: "Canoe Trip to the Niers",
    imageUrl: activityImageUrl("Canoe Trip to the Niers", "avif"),
    category: "Aqua Fun",
    includedInStay: false,
    description:
      "Book our latest activity now and discover the most beautiful canoe trip across the Niers! Get in the canoe and enjoy a beautiful, relaxing trip over the winding Niers! Surrounded by nature, peace and space, you paddle through a unique piece of landscape in about 75 minutes",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/CANONIERS",
  },
  {
    title: "Live Music and Drinks",
    imageUrl: activityImageUrl("Live Music and Drinks", "avif"),
    category: "Entertainment",
    includedInStay: true,
    description:
      "Live music with a drink and a nice snack! And that at the stage in the Market Dome. Do you swing along?",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/ONEMANBAND",
  },
  {
    title: "Mini Cars Inside",
    imageUrl: activityImageUrl("Mini Cars Inside", "webp"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Cycling is good for the kids, but occasionally crossing a few laps on the race track is not crazy either. The electric cars are already ready. Get in and give gas!",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/MINICARSINT",
  },
  {
    title: "Minigolf",
    imageUrl: activityImageUrl("Minigolf", "webp"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "In the Action Factory in Het Heijderbos, there is a new Adventure Golf with a jungle jacket. Do you hit the ball in the giant spider web? Or in the mouth of the hippopotamus?",
    activityUrl:
      "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/MINIGOLFINTERACTIVEADULT",
  },
  {
    title: "Chess XL",
    imageUrl: activityImageUrl("Chess XL", "avif"),
    category: "Sports and Fun",
    includedInStay: true,
    description: "A game of chess with your group? Come to the Action Factory. Have fun.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/CHESSXLNBPMS",
  },
  {
    title: "Tennis",
    imageUrl: activityImageUrl("Tennis", "avif"),
    category: "Sports and Fun",
    includedInStay: false,
    description:
      "Whether you want to play alone or in doubles on the court, our tennis court offers the ideal opportunity for this. Rackets and balls are included.",
    activityUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/activity/TENNISINDOOR",
  },
];
