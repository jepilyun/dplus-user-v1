
/**
 * 섹션 타이틀 컴포넌트
 * @param title 섹션 타이틀
 * @returns 섹션 타이틀 컴포넌트
 */
export default function SectionTitle({ title, titleSize = "text-3xl" }: { title: string, titleSize?: string }) {
  return (
    <h1 className={`text-center ${titleSize} font-bold my-8 font-poppins`}>{title}</h1>
  );
}