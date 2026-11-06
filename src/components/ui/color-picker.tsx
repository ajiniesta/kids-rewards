import { CHILD_COLORS, type ChildColor } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ColorPicker({
  name,
  defaultValue = "sky",
  label = "Color del tablón",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-bold text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CHILD_COLORS) as ChildColor[]).map((key) => (
          <label key={key} className="cursor-pointer" title={CHILD_COLORS[key].label}>
            <input
              type="radio"
              name={name}
              value={key}
              defaultChecked={defaultValue === key}
              className="peer sr-only"
            />
            <span
              className={cn(
                "block h-9 w-9 rounded-full bg-gradient-to-br ring-2 ring-transparent ring-offset-2 transition peer-checked:ring-ink/60",
                CHILD_COLORS[key].hero,
              )}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}