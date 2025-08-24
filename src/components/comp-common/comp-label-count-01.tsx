
export default function CompLabelCount01({
  title,
  count,
  minWidth = null,
  minHeight = null,
}: {
  title: string;
  count: number;
  minWidth?: number | null;
  minHeight?: number | null;
}) {
  return (
    <div
      className="bg-gray-100 rounded-full flex items-center justify-center"
      style={{
        minWidth: minWidth ?? undefined,
        minHeight: minHeight ?? undefined,
      }}
    >
      <div className="flex flex-col gap-2 items-center justify-center">
        <div className="text-4xl font-bold">{count}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </div>
    </div>
  );
}