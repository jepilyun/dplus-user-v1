import { TStreetListForCityDetail } from "trand_common_v1";
import CardStreet from "../comp-card/card-street";
import SectionTitle from "../section-title";

export default function CityStreetList({ cityCode, langCode, streets }: { cityCode: string, langCode: string, streets: TStreetListForCityDetail[] }) {
  return (
    <div className="p-4">
      <SectionTitle title="Popular Streets" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 gap-y-4">
        {streets.map((street) => {
          return <CardStreet key={street.street_code} cityCode={cityCode} langCode={langCode} street={street} />;
        })}
      </div>
    </div>
  );
}


