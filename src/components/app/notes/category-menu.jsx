"use client";

/* A category's ⋯ menu, as the reference has it: Add to Favorites; Add
   subcategory; Duplicate, Rename, Move to and Move to Trash; Open in new tab;
   and who edited it last, and when.

   Two levels only, so the menu never offers a third: a subcategory has no Add
   subcategory and copies on its own, and a category with subcategories can't
   be moved inside another. */

import { ArrowDown, ArrowUp, ArrowUpRight, CornerUpRight, Copy, Ellipsis, FolderPlus, SquarePen, Star, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tip } from "../tasks-view/tip";
import { PickedIcon } from "../icon-picker/picked-icon";
import { Photo } from "../user-menu/photo";
import { useUser } from "../user-provider";

const ROW = "gap-2.5 px-2 py-1.5";
const WHEN = { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" };

// isSub: it's a subcategory. tops: the top-level categories, for Move to. hasSubs: it has subcategories
// onShift(-1 | 1): one place up or down among its siblings; first/last: which way it can't go
export function CategoryMenu({ category, isSub, tops, hasSubs, onFavorite, onAddSub, onDuplicate, onRename, onMove, onTrash, onShift, first, last }) {
  const user = useUser();
  const name = category.name || "Untitled";
  // anywhere it could go: inside another category, or (for a subcategory) out on its own
  const homes = hasSubs ? [] : tops.filter((t) => t.id !== category.id && t.id !== category.parentId);

  return (
    <DropdownMenu>
      <Tip label="Delete, duplicate, and more…" side="bottom">
        <DropdownMenuTrigger
          aria-label={`${name} options`}
          className="flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground data-popup-open:bg-foreground/10 data-popup-open:text-foreground"
        >
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
      </Tip>
      <DropdownMenuContent align="start" side="right" sideOffset={8} className="w-64 rounded-sm p-1.5">
        {/* a label has to sit in a group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 pb-1.5">{isSub ? "Subcategory" : "Category"}</DropdownMenuLabel>
          <DropdownMenuItem className={ROW} onClick={onFavorite}>
            <Star className={category.favorite ? "fill-[#f5c542] text-[#f5c542]" : undefined} />
            {category.favorite ? "Remove from Favorites" : "Add to Favorites"}
          </DropdownMenuItem>
          {!isSub && (
            <DropdownMenuItem className={ROW} onClick={onAddSub}>
              <FolderPlus />
              Add subcategory
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        {isSub || !hasSubs ? (
          <DropdownMenuItem className={ROW} onClick={() => onDuplicate(false)}>
            <Copy />
            Duplicate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={ROW}>
              <Copy />
              Duplicate
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-52 rounded-sm p-1.5">
              <DropdownMenuItem className={ROW} onClick={() => onDuplicate(true)}>
                With subcategories
              </DropdownMenuItem>
              <DropdownMenuItem className={ROW} onClick={() => onDuplicate(false)}>
                Without subcategories
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuItem className={ROW} onClick={onRename}>
          <SquarePen />
          Rename
        </DropdownMenuItem>
        {(isSub || homes.length > 0) && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className={ROW}>
              <CornerUpRight />
              Move to
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-72 w-56 rounded-sm p-1.5">
              {isSub && (
                <>
                  <DropdownMenuItem className={ROW} onClick={() => onMove(null)}>
                    Its own category
                  </DropdownMenuItem>
                  {homes.length > 0 && <DropdownMenuSeparator />}
                </>
              )}
              {homes.map((t) => (
                <DropdownMenuItem key={t.id} className={ROW} onClick={() => onMove(t.id)}>
                  <PickedIcon icon={t.icon} size={14} />
                  <span className="truncate">{t.name || "Untitled"}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {onShift && !first && (
          <DropdownMenuItem className={ROW} onClick={() => onShift(-1)}>
            <ArrowUp />
            Move up
          </DropdownMenuItem>
        )}
        {onShift && !last && (
          <DropdownMenuItem className={ROW} onClick={() => onShift(1)}>
            <ArrowDown />
            Move down
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className={ROW} onClick={onTrash}>
          <Trash2 />
          Move to Trash
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem className={ROW} onClick={() => window.open(`/notes?category=${category.id}`, "_blank", "noopener")}>
          <ArrowUpRight />
          Open in new tab
        </DropdownMenuItem>

        {/* who touched it last, and when */}
        <DropdownMenuSeparator />
        <div className="flex flex-col gap-1 px-2 py-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Last edited</span>
          {user && (
            <span className="flex items-center gap-1.5">
              <Photo user={user} className="size-4" />
              <span className="truncate">{user.name}</span>
            </span>
          )}
          <span>{new Date(category.editedAt).toLocaleString(undefined, WHEN)}</span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
