-- Milo — fix: "infinite recursion detected in policy for relation categories"
--
-- Run in the Supabase SQL editor after 0017 (or right away, on its own — it
-- only needs 0014). The editor will warn about "drop policy": that is this
-- rule being replaced. No data is touched.
--
-- 0014's policy checked a subcategory's parent by reading categories from
-- inside categories' own policy. Postgres expands that read through the same
-- policy again, sees the loop, and refuses every save. So the policy goes back
-- to the plain rule every table has — it's yours — and the parent check moves
-- into the two-levels trigger, which reads categories as an ordinary query
-- under that plain rule: no loop, and the same guarantee.

drop policy "own categories" on public.categories;

create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.categories_two_levels()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is not null then
    if new.parent_id = new.id then
      raise exception 'a category cannot sit inside itself';
    end if;
    -- the parent has to be one of your own categories (this was the policy's job in 0014)
    if not exists (select 1 from public.categories p where p.id = new.parent_id and p.user_id = new.user_id) then
      raise exception 'a subcategory must sit inside one of your own categories';
    end if;
    if exists (select 1 from public.categories p where p.id = new.parent_id and p.parent_id is not null) then
      raise exception 'subcategories cannot have subcategories';
    end if;
    if exists (select 1 from public.categories c where c.parent_id = new.id) then
      raise exception 'a category with subcategories cannot become a subcategory';
    end if;
  end if;
  return new;
end;
$$;
