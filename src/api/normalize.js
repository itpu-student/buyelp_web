import { slugForCategoryId } from "../store/categories.js"
import { staticUrl } from "./client.js"

function hoursToDisplay(slots) {
  if (!Array.isArray(slots) || slots.length === 0) return null
  return slots.map((s) => `${s.open} – ${s.close}`).join(", ")
}

function normalizeWeeklyHours(wh) {
  const out = {}
  const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  for (const k of keys) out[k] = hoursToDisplay(wh?.[k])
  return out
}

function bilingual(value) {
  if (value && typeof value === "object" && ("en" in value || "uz" in value)) {
    return { en: value.en || value.uz || "", uz: value.uz || value.en || "" }
  }
  const s = typeof value === "string" ? value : ""
  return { en: s, uz: s }
}

function normalizeUserMini(u) {
  if (!u) return null
  return {
    id: u.id,
    name: u.name || "",
    username: u.username || "",
    avatarUrl: staticUrl(u.avatar_key),
  }
}

export function normalizePlace(api) {
  if (!api) return null
  return {
    id: api.slug || api.id,
    _uuid: api.id,
    slug: api.slug,
    name: bilingual(api.name),
    category: slugForCategoryId(api.category_id),
    _categoryId: api.category_id,
    address: bilingual(api.address),
    phone: api.phone || "",
    description: bilingual(api.description),
    rating: Number(api.avg_rating) || 0,
    reviewCount: api.review_count || 0,
    lat: api.lat,
    lon: api.lon,
    images: Array.isArray(api.images) ? api.images.filter(Boolean).map(staticUrl) : [],
    logo: staticUrl(api.logo_key),
    _logoKey: api.logo_key || "",
    _imageKeys: Array.isArray(api.images) ? api.images.filter(Boolean) : [],
    weeklyHours: normalizeWeeklyHours(api.weekly_hours),
    _weeklyHoursRaw: api.weekly_hours || {},
    isOpen: api.is_open == null ? null : !!api.is_open,
    status: api.status ?? "",
    isClaimed: !!api.is_claimed,
    claimedBy: api.claimed_by || null,
    claimedByUser: normalizeUserMini(api.claimed_by_user),
    createdBy: api.created_by || null,
    createdByUser: normalizeUserMini(api.created_by_user),
    featured: false,
    _raw: api,
  }
}

export function normalizeReview(api) {
  if (!api) return null
  return {
    id: api.id,
    _placeId: api.place_id,
    _userId: api.user_id,
    author: api.user?.name || api._authorName || "User",
    authorUsername: api.user?.username || "",
    authorAvatar: api.user?.avatar_key ? staticUrl(api.user.avatar_key) : null,
    rating: api.star_rating || 0,
    priceRating: api.price_rating || 0,
    qualityRating: api.quality_rating || 0,
    text: api.text || "",
    images: Array.isArray(api.images) ? api.images.filter(Boolean).map(staticUrl) : [],
    _imageKeys: Array.isArray(api.images) ? api.images.filter(Boolean) : [],
    date: api.created_at,
    latest: api.latest !== false,
    prevCount: api.prev_count || 0,
    place: api.place ? {
      id: api.place.slug || api.place.id,
      name: bilingual(api.place.name),
      slug: api.place.slug,
      avgRating: Number(api.place.avg_rating) || 0,
      reviewCount: api.place.review_count || 0,
      logo: staticUrl(api.place.logo_key),
      _categoryId: api.place.category_id,
    } : null,
    _raw: api,
  }
}
