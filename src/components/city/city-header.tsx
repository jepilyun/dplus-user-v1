import { IconInstagram } from "@/icons/icon-instagram";
import { IconMap } from "@/icons/icon-map";
import { IconWebsite } from "@/icons/icon-website";
import { IconYoutube } from "@/icons/icon-youtube";
import { generateCityImageUrl } from "@/utils/generate-image-url";
import { TCityDetail, TRelatedI18n } from "trand_common_v1";
import { LinkForHeader } from "../links-for-header";


export default function CityHeader({ cityDetail, i18n }: { cityDetail: TCityDetail, i18n: TRelatedI18n | null }) {

  return (
    <div data-city-code={cityDetail.city_code}>
      <div className="bg-cover bg-center h-96"
        style={{ 
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.1)), url(${generateCityImageUrl(cityDetail.thumbnail_main_1)})`
        }}
      >
        <div className="relative z-10 flex flex-col gap-16 items-center justify-center h-full text-white text-center px-4">
          <div>
            <div className="text-xl">{cityDetail.native}{i18n?.name ? " " + i18n.name : ""}</div>
            <div className="text-6xl font-bold font-poppins">{cityDetail.name}</div>
          </div>
          <div className="text-xs flex flex-wrap items-center gap-4">
            {cityDetail.official_web_tour ? (
              <LinkForHeader title="Website" href={cityDetail.official_web_tour} icon={<IconWebsite />} />
            ) : cityDetail.official_web ? (
              <LinkForHeader title="Website" href={cityDetail.official_web} icon={<IconWebsite />} />
            ) : null}
            {cityDetail.google_map_url && (
              <LinkForHeader title="Map" href={cityDetail.google_map_url} icon={<IconMap />} />
            )}
            {cityDetail.instagram_tour_id ? (
              <LinkForHeader title="Instagram" href={`https://www.instagram.com/${cityDetail.instagram_tour_id}`} icon={<IconInstagram />} />
            ) : cityDetail.instagram_official_id && (
              <LinkForHeader title="Instagram" href={`https://www.instagram.com/${cityDetail.instagram_official_id}`} icon={<IconInstagram />} />
            )}
            {cityDetail.youtube_tour_id ? (
              <LinkForHeader title="YouTube" href={`https://www.youtube.com/channel/${cityDetail.youtube_tour_id}`} icon={<IconYoutube />} />
            ) : cityDetail.youtube_official_id ? (
              <LinkForHeader title="YouTube" href={`https://www.youtube.com/channel/${cityDetail.youtube_official_id}`} icon={<IconYoutube />} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}


//   "address": "175, Sejong-daero, Jongno-gu, Seoul, Republic of Korea",
//   "latitude": 37.572534,
//   "longitude": 126.976858,
//   "city_code": "seoul",
//   "description": "Seoul is the capital of South Korea and the center of its economy, culture, and politics, offering a fascinating blend of modern cityscapes and traditional elements. It is home to historic palaces like Gyeongbokgung and Changdeokgung, as well as modern landmarks such as N Seoul Tower and Lotte World Tower. Neighborhoods like Insadong, Hongdae, and Gangnam showcase the coexistence of traditional and contemporary culture, offering shopping, dining, and artistic experiences. With excellent public transportation, Seoul is easy to navigate and hosts various festivals and events throughout the year.",
//   "thumbnail_1": null,
//   "thumbnail_2": null,
//   "thumbnail_3": null,
//   "thumbnail_4": null,
//   "thumbnail_5": null,
//   "thumbnail_6": "https://graziasg.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2023/07/image-175.png",
//   "thumbnail_7": null,
//   "thumbnail_8": null,
//   "thumbnail_9": null,
//   "country_code": "KR",
//   "official_web": "https://english.seoul.go.kr/",
//   "content_count": 536,
//   "naver_map_url": "https://naver.me/FeXRHn6r",
//   "address_native": "서울특별시 종로구 세종로 1-68",
//   "description_ko": "서울은 대한민국의 수도이자, 경제, 문화, 정치의 중심지로, 현대적인 도시 풍경과 전통적인 요소가 조화를 이루는 매력적인 도시입니다. 경복궁, 창덕궁과 같은 역사적인 궁궐과 함께, N서울타워, 롯데월드타워와 같은 현대적인 건축물도 많이 있습니다. 인사동, 홍대, 강남 등 다양한 지역에서는 전통과 현대 문화가 공존하며, 쇼핑, 미식, 예술을 즐길 수 있습니다. 서울은 대중교통이 잘 발달되어 있어 쉽게 이동할 수 있으며, 사계절 내내 다양한 축제와 행사도 즐길 수 있는 도시입니다.",
//   "google_map_url": "https://maps.app.goo.gl/jvfXpadRRQYjZnV1A",
//   "instagram_tags": [
//       "seoul",
//       "서울",
//       "首爾",
//       "ソウル",
//       "โซล"
//   ],
//   "metadata_title": null,
//   "tiktok_tour_id": "visitseoul",
//   "youtube_tour_id": "UCtlz8pU3IiHf77V8s740-pQ",
//   "thumbnail_main_1": "KR/seoul/seoul_thumbnail_main_1",
//   "thumbnail_main_2": "KR/seoul/seoul_thumbnail_main_2",
//   "thumbnail_main_3": "KR/seoul/seoul_thumbnail_main_3",
//   "thumbnail_main_4": "KR/seoul/seoul_thumbnail_main_4",
//   "thumbnail_main_5": "KR/seoul/seoul_thumbnail_main_5",
//   "instagram_tour_id": "visitseoul_official",
//   "metadata_keywords": null,
//   "metadata_og_image": null,
//   "metadata_og_title": null,
//   "official_web_tour": "https://www.sto.or.kr/english/index",
//   "tiktok_official_id": null,
//   "youtube_official_id": "UCokYEohXuS2NH1Rld-Ssu4A",
//   "metadata_description": null,
//   "thumbnail_vertical_1": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTbXCvJdhEBG3Ia8CyR_a7Y8TfvJ0mFegAyg&s",
//   "thumbnail_vertical_2": "https://mytravelnote.com/wp-content/uploads/2023/01/waterfall.jpg",
//   "thumbnail_vertical_3": "https://www.ciee.org/sites/default/files/blog/2023-10/Lotte%20World%2C%20Seoul%2C%20South%20Korea%20Landscape.jpeg",
//   "thumbnail_vertical_4": null,
//   "thumbnail_vertical_5": null,
//   "instagram_official_id": "seoul_official",
//   "metadata_og_description": null
// }