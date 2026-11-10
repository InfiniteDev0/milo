// The new-task dialog's shared pieces of style: a field's label, and the chips its choices are made of.

export const FIELD = "flex flex-col gap-2";
export const LABEL = "text-xs font-medium text-muted-foreground";
export const CHIP =
  "flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-foreground/12 px-3 text-sm transition-colors hover:bg-foreground/6";
// a chip that's picked
export const CHIP_ON = "border-transparent bg-foreground text-background hover:bg-foreground/90";
