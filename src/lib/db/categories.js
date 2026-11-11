"use client";

// Note categories, against the database (migration 0014). One thin wrapper per Supabase call.
// No user_id in reads: RLS puts auth.uid() = user_id on every row.

import { createClient } from "@/lib/supabase/client";
import { createRowQueue } from "./row-queue";

const COLUMNS = "id, parent_id, name, icon, favorite, position, created_at, updated_at";
// newer columns, newest first: covers with 0021, the dragged order of its notes and tasks with 0022.
// Until one is applied, categories load (and save) without it and anything newer
const TRIES = [`${COLUMNS}, cover, cover_y, item_order`, `${COLUMNS}, cover, cover_y`, COLUMNS];
// whether the database has covers yet (0021) and orders (0022), learned by the last listCategories()
let covers = false;
let orders = false;
export const categoryCovers = () => covers;
// asks again before saying no, as checkCovers does
export async function checkOrders() {
  if (orders) return true;
  const { error } = await createClient().from("categories").select("item_order").limit(1);
  orders = !error;
  return orders;
}
// asks the database again (0021 may have been run since the page loaded); saves include the cover from then on
export async function checkCovers() {
  if (covers) return true;
  const { error } = await createClient().from("categories").select("cover, cover_y").limit(1);
  covers = !error;
  return covers;
}

const fromRow = (r) => ({
  id: r.id,
  // set for a subcategory: the category it sits in
  parentId: r.parent_id ?? null,
  name: r.name,
  icon: r.icon ?? null,
  // its page's banner picture; undefined before 0021
  cover: "cover" in r ? (r.cover ?? null) : undefined,
  // where the picture sits in the band, 0 (its top) to 100 (its bottom)
  coverY: r.cover_y ?? 50,
  // the order its notes and tasks were dragged into: { notes: [ids], tasks: [ids] }
  itemOrder: r.item_order ?? {},
  favorite: r.favorite,
  position: r.position,
  createdAt: Date.parse(r.created_at),
  editedAt: Date.parse(r.updated_at),
});

// every category and subcategory, in the order you put them
export async function listCategories() {
  const read = (columns) =>
    createClient().from("categories").select(columns).order("position", { ascending: true }).order("created_at", { ascending: true });
  let data, error;
  // 42703: no such column — that migration isn't applied yet, so read them without it
  for (const columns of TRIES) {
    ({ data, error } = await read(columns));
    if (error?.code !== "42703") {
      covers = columns.includes("cover");
      orders = columns.includes("item_order");
      break;
    }
  }
  if (error) throw error;
  return data.map(fromRow);
}

// create and every edit are the same upsert of the whole category
function saveCategory(userId, c) {
  return createClient().from("categories").upsert({
    id: c.id,
    user_id: userId,
    parent_id: c.parentId ?? null,
    name: c.name ?? "",
    icon: c.icon ?? null,
    favorite: c.favorite ?? false,
    position: c.position ?? 0,
    ...(covers && { cover: c.cover ?? null, cover_y: Math.round(c.coverY ?? 50) }),
    ...(orders && { item_order: c.itemOrder ?? {} }),
  });
}

// deleting a category takes its subcategories with it; their notes stay, uncategorised
function deleteCategory(id) {
  return createClient().from("categories").delete().eq("id", id);
}

export const categoryQueue = createRowQueue("category", saveCategory, deleteCategory);
