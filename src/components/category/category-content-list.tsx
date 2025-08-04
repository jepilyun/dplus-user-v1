import { TContentListForPublicFrontList, TMapTypeAndContent } from "trand_common_v1";
import CardTrandContent from "../card/card-trand-content";
import SectionTitle from "../section-title";

export default function CategoryContentList({ cityCode, langCode, mapCategoryContent, titleSize = "text-3xl" }: { cityCode: string, langCode: string, mapCategoryContent: {
  map: TMapTypeAndContent,
  content: TContentListForPublicFrontList
}[], titleSize?: string}) {
  return (
    <div className="p-4">
      <SectionTitle title="Trand Spots" titleSize={titleSize} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 gap-y-4">
        {mapCategoryContent.map((c) => {
          return <CardTrandContent key={c.map.content_code} cityCode={cityCode} langCode={langCode} content={c.content} />;
        })}
      </div>
    </div>
  );
}


