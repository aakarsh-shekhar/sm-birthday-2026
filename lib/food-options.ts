/**
 * Meal options from Center Parcs “FOOD PREFERENCES” spreadsheet (same data as
 * `../CenterParcs FOOD PREFERENCES/FOOD PREFERENCES.xlsx` next to this repo).
 * Second “Combi Table Cooking (2 Days)” row is given a distinct title for the UI.
 */
export type SeedFoodOption = {
  title: string;
  description?: string;
  infoUrl?: string;
};

export const seedFoodOptions: SeedFoodOption[] = [
  {
    title: "À La Carte Arrangement (3 Days)",
    description:
      "One evening of unlimited enjoyment at buffet restaurant Evergreenz and two evenings of a three-course dinner in our family restaurants Fuego Adventure Grill and Nonna's.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/ALA",
  },
  {
    title: "Grill Package (2 Days)",
    description:
      "For all children and their parents, unlimited enjoyment of the dinner buffet at Evergreenz and a delicious three-course dinner at Fuego.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/GRA",
  },
  {
    title: "Pizza É Pasta (2 Days)",
    description:
      "Unlimited enjoyment of the dinner buffet and Italian enjoyment of a 3-course dinner at Nonna's.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/PIP",
  },
  {
    title: "Combi Table Cooking (2 Days)",
    description:
      "For all kids and their parents, enjoy the Table Cooking Package to dine in your cottage + a night out at the buffet restaurant!",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/TCA",
  },
  {
    title: "Complete Cottage Breakfast Delivery",
    description: "Nice and easy and cozy a complete breakfast delivered to your cottage.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/OAC",
  },
  {
    title: "Cottage Luxury Breakfast Package (Adult)",
    description: "An extensive luxury breakfast delivered to your cottage, easy and cozy.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/OA2",
  },
  {
    title: "Table Cooking",
    description:
      "Table Cooking is really eating out at home. Whether you want to gourmet or barbecue: we bring all the ingredients to your cottage, including the equipment.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/DFS",
  },
  {
    title: "Dinner Buffet",
    description:
      "Enjoy a delicious extensive dinner buffet with soups, salads, meat, fish and vegetarian dishes. Tasty desserts, soft drinks and alcoholic drinks are also included.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/E1D",
  },
  {
    title: "Dinner Buffet (Multi-Day)",
    description:
      "Enjoy a delicious extensive dinner buffet with soups, salads, meat, fish and vegetarian dishes. Tasty desserts, soft drinks and alcoholic drinks are also included.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/DIN",
  },
  {
    title: "Half Board",
    description:
      "Join the delicious extensive buffet in the morning and evening. Try all the hot, cold, sweet and savory dishes. Also the drinks are included. Try everything!",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/HBO",
  },
  {
    title: "Breakfast Buffet",
    description:
      "Start your day right with a delicious extensive buffet. Enjoy a complete breakfast with a wide choice of savory, sweet, cold and hot dishes; including juices and hot drinks.",
    infoUrl: "https://www.centerparcs.nl/my/nl-nl/booking/8021596/service/ar/BFS",
  },
];
