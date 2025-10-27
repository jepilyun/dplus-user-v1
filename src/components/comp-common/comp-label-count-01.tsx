export default function CompLabelCount01({
  title,
  count,
  base = "w-24",   // 6rem
  sm = "sm:w-28",  // 7rem
  md = "md:w-32",  // 8rem
  lg = "lg:w-40",  // 10rem
}: {
  title: string;
  count: number;
  base?: string;
  sm?: string | null;
  md?: string | null;
  lg?: string | null;
}) {
  return (
    <div
      className={[
        "bg-gray-100 rounded-full flex items-center justify-center",
        "aspect-square",      // 높이는 자동으로 폭과 동일
        base,
        sm ?? "",
        md ?? "",
        lg ?? "",
      ].join(" ")}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-xs text-gray-500 font-poppins uppercase">{title}</div>
      </div>
    </div>
  );
}
