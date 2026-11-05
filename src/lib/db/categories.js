"use client";

// Note categories, against the database (migration 0014). One thin wrapper per Supabase call.
// No user_id in reads: RLS puts auth.uid() = user_id on every row.

import { createClient } from "@/lib/supabase/client";
import { createRowQueue } from "./row-queue";

const COLUMNS = "id, parent_id, name, icon, favorite, position, created_at, updated_at";

const fromRow = (r) => ({
  id: r.id,
  // set for a subcategory: the category it sits in
  parentId: r.parent_id ?? null,
  name: r.name,
  icon: r.icon ?? null,
  favorite: r.favorite,
  position: r.position,
  createdAt: Date.parse(r.created_at),
  editedAt: Date.parse(r.updated_at),
});

// every category and subcategory, in the order you put them
export async function listCategories() {
  const { data, error } = await createClient()
    .from("categories")
    .select(COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
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
  });
}

// deleting a category takes its subcategories with it; their notes stay, uncategorised
function deleteCategory(id) {
  return createClient().from("categories").delete().eq("id", id);
}

export const categoryQueue = createRowQueue("category", saveCategory, deleteCategory);
