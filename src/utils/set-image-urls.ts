import { TCategoryDetail, TCityDetail, TEventDetail, TFolderDetail, TPeventDetail, TStagDetail } from "dplus_common_v1";


export const getEventImageUrls = (c: TEventDetail) => {
  const imageUrls: string[] = [];

  if (c.hero_image_01) {
    imageUrls.push(c.hero_image_01);
  }
  if (c.hero_image_02) {
    imageUrls.push(c.hero_image_02);
  }
  if (c.hero_image_03) {
    imageUrls.push(c.hero_image_03);
  }
  if (c.hero_image_04) {
    imageUrls.push(c.hero_image_04);
  }
  if (c.hero_image_05) {
    imageUrls.push(c.hero_image_05);
  }

  return imageUrls;
}

export const getPeventImageUrls = (c: TPeventDetail) => {
  const imageUrls: string[] = [];
  if (c.hero_image_01) {
    imageUrls.push(c.hero_image_01);
  }
  if (c.hero_image_02) {
    imageUrls.push(c.hero_image_02);
  }
  if (c.hero_image_03) {
    imageUrls.push(c.hero_image_03);
  }
  if (c.hero_image_04) {
    imageUrls.push(c.hero_image_04);
  }
  if (c.hero_image_05) {
    imageUrls.push(c.hero_image_05);
  }
  return imageUrls;
}

export const getFolderImageUrls = (c: TFolderDetail) => {
  const imageUrls: string[] = [];
  if (c.hero_image_01) {
    imageUrls.push(c.hero_image_01);
  }
  if (c.hero_image_02) {
    imageUrls.push(c.hero_image_02);
  }
  if (c.hero_image_03) {
    imageUrls.push(c.hero_image_03);
  }
  if (c.hero_image_04) {
    imageUrls.push(c.hero_image_04);
  }
  if (c.hero_image_05) {
    imageUrls.push(c.hero_image_05);
  }
  return imageUrls;
}

export const getCityImageUrls = (c: TCityDetail) => {
  const imageUrls: string[] = [];
  if (c.hero_image_01) {
    imageUrls.push(c.hero_image_01);
  }
  if (c.hero_image_02) {
    imageUrls.push(c.hero_image_02);
  }
  if (c.hero_image_03) {
    imageUrls.push(c.hero_image_03);
  }
  if (c.hero_image_04) {
    imageUrls.push(c.hero_image_04);
  }
  if (c.hero_image_05) {
    imageUrls.push(c.hero_image_05);
  }
  return imageUrls;
}

export const getCategoryImageUrls = (c: TCategoryDetail) => {
  const imageUrls: string[] = [];
  if (c.hero_image_01) {
    imageUrls.push(c.hero_image_01);
  }
  if (c.hero_image_02) {
    imageUrls.push(c.hero_image_02);
  }
  if (c.hero_image_03) {
    imageUrls.push(c.hero_image_03);
  }
  if (c.hero_image_04) {
    imageUrls.push(c.hero_image_04);
  }
  if (c.hero_image_05) {
    imageUrls.push(c.hero_image_05);
  }
  return imageUrls;
}

export const getStagImageUrls = (c: TStagDetail) => {
  const imageUrls: string[] = [];
  if (c.hero_image_01) {
    imageUrls.push(c.hero_image_01);
  }
  if (c.hero_image_02) {
    imageUrls.push(c.hero_image_02);
  }
  if (c.hero_image_03) {
    imageUrls.push(c.hero_image_03);
  }
  if (c.hero_image_04) {
    imageUrls.push(c.hero_image_04);
  }
  if (c.hero_image_05) {
    imageUrls.push(c.hero_image_05);
  }
  return imageUrls;
}
