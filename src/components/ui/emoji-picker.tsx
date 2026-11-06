import { cn } from "@/lib/utils";

export function EmojiPicker({
  name,
  options,
  defaultValue,
  label,
  columns = "flex",
}: {
  name: string;
  options: readonly string[];
  defaultValue?: string;
  label: string;
  columns?: "flex" | "grid";
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-bold text-ink">{label}</legend>
      <div
        className={cn(
          "gap-1.5",
          columns === "grid" ? "grid grid-cols-6 sm:grid-cols-7" : "flex flex-wrap",
        )}
      >
        {options.map((emoji, index) => (
          <label key={`${emoji}-${index}`} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={emoji}
              defaultChecked={defaultValue ? defaultValue === emoji : index === 0}
              className="peer sr-only"
            />
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl ring-1 ring-ink/10 transition hover:bg-violet-50 peer-checked:bg-violet-100 peer-checked:ring-2 peer-checked:ring-violet-400">
              {emoji}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}