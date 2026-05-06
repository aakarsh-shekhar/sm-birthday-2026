export type DashboardSwipe = {
  id: string;
  reaction: "PASS" | "LIKE" | "SUPERLIKE";
  participant: { id: string; name: string };
};

export type DashboardActivity = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  activityUrl: string | null;
  includedInStay: boolean | null;
  swipes: DashboardSwipe[];
};

export type DashboardParticipant = {
  id: string;
  name: string;
  swipes: Array<{
    id: string;
    reaction: "PASS" | "LIKE" | "SUPERLIKE";
    activity: { id: string; title: string };
  }>;
  foodSelections: Array<{
    id: string;
    foodOption: { id: string; title: string };
  }>;
  groceryNote: { id: string; note: string } | null;
  easterEggFinds: Array<{ eggKey: string }>;
};

export type DashboardFoodOption = {
  id: string;
  title: string;
  description: string | null;
  infoUrl: string | null;
  selections: Array<{
    id: string;
    participant: { id: string; name: string };
  }>;
};

export type DashboardGroceryItem = {
  id: string;
  item: string;
  participant: { id: string; name: string };
};

export type ActivityForm = {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  activityUrl: string;
  includedInStay: boolean;
};

export type FoodOptionForm = {
  title: string;
  description: string;
  infoUrl: string;
};

export const defaultActivityImage = "/activity-images/default-activity.svg";

export function activityToForm(activity: DashboardActivity): ActivityForm {
  return {
    title: activity.title,
    description: activity.description ?? "",
    category: activity.category ?? "",
    imageUrl: activity.imageUrl ?? "",
    activityUrl: activity.activityUrl ?? "",
    includedInStay: activity.includedInStay ?? false,
  };
}
