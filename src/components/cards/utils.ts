// Small shared helpers for the design-system card components.

/** Build a short monogram from a team name when no flag emoji is supplied. */
export function teamMonogram(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return words
      .slice(0, 3)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("");
  }

  return name.trim().slice(0, 3).toUpperCase();
}

/** Medium date, rendered in UTC to match the rest of the app's schedule views. */
export function formatMatchDay(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Kickoff time of day (UTC), used in the fixture's center divider. */
export function formatMatchTime(iso: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Podium accent class (gold / silver / bronze) for the top three ranks. */
export function podiumClass(rank: number) {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "";
}
