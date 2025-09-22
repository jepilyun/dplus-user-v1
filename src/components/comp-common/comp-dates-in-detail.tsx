export const CompDatesInDetail = ({ createdAt, updatedAt, fullLocale }: { createdAt: Date | undefined, updatedAt: Date | undefined, fullLocale: string }) => {
  return (
    <div className="flex justify-center gap-4 text-gray-500">
      <div>
        Created {createdAt 
          ? new Date(createdAt).toLocaleString(fullLocale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"}
      </div>
      <div>
        Updated {updatedAt 
          ? new Date(updatedAt).toLocaleString(fullLocale, {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"}
      </div>
    </div>
  );
};