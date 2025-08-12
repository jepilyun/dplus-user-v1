"use client";

import { reqGetEventDetail } from "@/actions/action";
import BtnSecondary from "@/components/button/btn-secondary";
import GoogleMap from "@/components/google-map/google-map";
import { ImageViewerCard } from "@/components/image/card-slider";
import { HeroImageSlider } from "@/components/image/hero-image-slider";
import { LinkForDetail } from "@/components/link-for-detail";
import { IconCalendar } from "@/icons/icon-calendar";
import { IconEmail } from "@/icons/icon-email";
import { IconHomepage } from "@/icons/icon-homepage";
import { IconInstagram } from "@/icons/icon-instagram";
import { IconMapPin } from "@/icons/icon-map-pin";
import { IconPhone } from "@/icons/icon-phone";
import { IconSave } from "@/icons/icon-save";
import { IconShare } from "@/icons/icon-share";
import { IconWebsite } from "@/icons/icon-website";
import { IconYoutube } from "@/icons/icon-youtube";
import { calculateDaysFromToday } from "@/utils/calc-two-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { generateDdayDatetime } from "@/utils/generate-dday-datetime";
import { Button } from "@mui/material";
import { ResponseEventDetailForUserFront } from "dplus_common_v1";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EventPage({ params }: { params: { eventId: string, langCode: string } }) {
  const { eventId, langCode } = params;
  const [eventDetail, setEventDetail] = useState<ResponseEventDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  console.log(eventId, langCode);

  const fetchEventDetail = async () => { 
    const res = await reqGetEventDetail(eventId);
    console.log(res);
    setEventDetail(res.dbResponse ?? null);

    const heroImages = [];
    if (res.dbResponse?.content.hero_image_01) {
      heroImages.push(res.dbResponse?.content.hero_image_01);
    }
    if (res.dbResponse?.content.hero_image_02) {
      heroImages.push(res.dbResponse?.content.hero_image_02);
    }
    if (res.dbResponse?.content.hero_image_03) {
      heroImages.push(res.dbResponse?.content.hero_image_03);
    }
    if (res.dbResponse?.content.hero_image_04) {
      heroImages.push(res.dbResponse?.content.hero_image_04);
    }
    if (res.dbResponse?.content.hero_image_05) {
      heroImages.push(res.dbResponse?.content.hero_image_05);
    }
    setImageUrls(heroImages);
  };

  const handleMapClick = () => {
    // if (eventDetail?.content.google_place_url) {
    //   window.open(eventDetail?.content.google_place_url, '_blank');
    // }
  };

  const handleMarkerClick = () => {
    // if (eventDetail?.content.google_place_url) {
    //   window.open(eventDetail?.content.google_place_url, '_blank');
    // }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center font-jost font-extrabold text-8xl">
        {eventDetail?.content.date ? getDdayLabel(calculateDaysFromToday(eventDetail?.content.date)) : ''}
      </div>
      <div className="text-center font-jost font-extrabold text-3xl">
        {eventDetail?.content.date ? 
        generateDdayDatetime(eventDetail?.content.date, eventDetail?.content.tz, eventDetail?.content.utc_minutes, eventDetail?.content.time) : ''}
      </div>
      {/* <div className="text-center font-jost font-extrabold text-4xl">{eventDetail?.content.date?.toLocaleString()}</div>
      <div>Time:{eventDetail?.content.time}</div>
      <div>TZ: {eventDetail?.content.tz}</div>
      <div>UTC Minutes: {eventDetail?.content.utc_minutes}</div>
      <div>Duration:{eventDetail?.content.duration}</div> */}
      <div id="event-title" className="text-center font-extrabold text-3xl"
        data-event-id={eventDetail?.content.event_id} 
        data-event-code={eventDetail?.content.event_code}
      >
        {eventDetail?.content.title}
      </div>
      <div className="flex gap-4 justify-center">
        <BtnSecondary title="Google Calendar" icon={<IconSave />} />
        <BtnSecondary title="Apple Calendar" icon={<IconSave />} />
        <BtnSecondary title="Share" icon={<IconShare />} />
      </div>
      
      <HeroImageSlider
        imageUrls={imageUrls}
        className="m-auto w-full flex max-h-96 max-w-[1280px]"
      />

      {eventDetail?.content.description && (
        <div>{eventDetail?.content.description}</div>
      )}
      <div className="m-auto flex gap-4">
        {eventDetail?.content.address_native && (
          <>
            <IconMapPin />
            <div>{eventDetail?.content.address_native}</div>
          </>
        )}
        {eventDetail?.content.phone && (
          <>
            <IconPhone />
            <div>{eventDetail?.content.phone}</div>
          </>
        )}
        {eventDetail?.content.homepage && (
          <>
            <IconHomepage />
            <div>{eventDetail?.content.homepage}</div>
          </>
        )}
        {eventDetail?.content.email && (
          <>
            <IconEmail />
            <div>{eventDetail?.content.email}</div>
          </>
        )}
        {eventDetail?.content.youtube_ch_id && (
          <>
            <IconYoutube />
            <div>{eventDetail?.content.youtube_ch_id}</div>
          </>
        )}
        {eventDetail?.content.instagram_id && (
          <>
            <IconInstagram />
            <div>{eventDetail?.content.instagram_id}</div>
          </>
        )}
        <LinkForDetail
          title="URL"
          href={eventDetail?.content.url ?? ''}
          icon={<IconWebsite />}
        />
      </div>
{/* <div>Phone:{eventDetail?.content.phone}</div>
<div>Phone Country Code:{eventDetail?.content.phone_country_code}</div>
      <div>Email:{eventDetail?.content.email}</div>
      <div>Homepage:{eventDetail?.content.homepage}</div>
      <div>Url: {eventDetail?.content.url}</div>
      <div>Url Label: {eventDetail?.content.url_label}</div> */}
      <div className="m-auto w-full max-w-[1280px] h-96 bg-red-500 rounded-lg overflow-hidden">
        <GoogleMap 
          latitude={eventDetail?.content.latitude || 0}
          longitude={eventDetail?.content.longitude || 0}
          title={eventDetail?.content.title}
          zoom={15}
          className="w-full h-full"
          style={{ minHeight: '384px' }}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          showClickHint={true}
          clickHintText={eventDetail?.content.address_native ?? ''}
        />
      </div>

      <div>Created At (toString):{eventDetail?.content.created_at?.toString()}</div>
      <div>Created At (toLocaleString):{eventDetail?.content.created_at?.toLocaleString()}</div>
      <div>Created By:{eventDetail?.content.created_by}</div>

      <div>Is Active:{eventDetail?.content.is_active.toString()}</div>
      <div>Is Display:{eventDetail?.content.is_display.toString()}</div>

      <div>Is Repeat Annually:{eventDetail?.content.is_repeat_annually.toString()}</div>
      
      {/* <div>Profile Image:{eventDetail?.content.profile}</div> */}
      
      <div>Saved Count:{eventDetail?.content.saved_count}</div>
      <div>Shared Count:{eventDetail?.content.shared_count}</div>
      <div>Tags:{eventDetail?.content.tags}</div>
      <div>Target City Code:{eventDetail?.content.target_city_code}</div>
      <div>Target Country Code:{eventDetail?.content.target_country_code}</div>
      <div>Target Sex:{eventDetail?.content.target_sex}</div>
            
      <div>Updated At (toString):{eventDetail?.content.updated_at?.toString()}</div>

      <div>Utc Minute: {eventDetail?.content.utc_minutes}</div>
      <div>View Count: {eventDetail?.content.view_count}</div>

      <div>Categories</div>
      <div>Stags</div>
      <div>Tags</div>
    </div>
  );
}