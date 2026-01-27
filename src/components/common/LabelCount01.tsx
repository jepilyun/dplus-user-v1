export default function CompLabelCount01({
  label,
  count,
  base = "w-24",   // 6rem
  sm = "sm:w-28",  // 7rem
  md = "md:w-32",  // 8rem
  lg = "lg:w-36",  // 10rem
}: {
  label: string;
  count: number;
  base?: string;
  sm?: string | null;
  md?: string | null;
  lg?: string | null;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center aspect-square",
        base,
        sm ?? "",
        md ?? "",
        lg ?? "",
      ].join(" ")}
    >
      <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
        <div className={`text-2xl sm:text-3xl md:text-4xl font-rubik ${count > 0 ? "font-bold" : "font-light"} ${count > 0 ? "text-black" : "text-gray-400"}`}>{count}</div>
        <div className="text-xs text-gray-400 font-rubik uppercase">{label}</div>
      </div>
    </div>
  );
}
