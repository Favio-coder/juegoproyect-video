export type RewardAvatar = "pingo" | "rocko";

export function buildRewardUrl(params: {
  name: string;
  points: number;
  avatar?: RewardAvatar | null;
}): string {
  const { name, points, avatar } = params;
  const search = new URLSearchParams();
  search.set("nombre", name);
  search.set("puntos", String(points));
  if (avatar) search.set("avatar", avatar);
  return `${window.location.origin}/recompensa?${search.toString()}`;
}
