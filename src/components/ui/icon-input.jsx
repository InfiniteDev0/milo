import { cn } from "@/lib/utils";

/**
 * Bordered input group with a leading icon. The border lives on the wrapper and
 * lights up via focus-within, so the icon and the field highlight together.
 */
export function IconInput({ icon, className, ...props }) {
  return (
    <div className="flex h-[40px] items-center rounded-[10px] border-[1.5px] border-black/20 pl-[10px] transition-colors duration-200 ease-in-out focus-within:border-[#5e17eb]">
      <span className="flex size-5 shrink-0 items-center justify-center text-black/35">
        {icon}
      </span>
      <input
        className={cn(
          "ml-[10px] h-full flex-1 rounded-[10px] border-none bg-transparent pr-3 text-sm text-black outline-none placeholder:text-black/35",
          className,
        )}
        {...props}
      />
    </div>
  );
}
