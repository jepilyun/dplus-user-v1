export const getDdayLabel = (dday: number) => {
  if (dday === 0) return 'Today';
  if (dday > 0) return `D - ${dday}`;
  if (dday < 0) return `+ ${Math.abs(dday)}`;
}