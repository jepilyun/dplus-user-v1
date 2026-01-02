import supabaseClient from "@/lib/supabase-client";

// ============================================
// EVENT
// ============================================

/**
 * 이벤트 조회수 증가
 */
export async function incrementEventViewCount(
  eventCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_event_view_count_returning",
      {
        p_event_code: eventCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment event view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing event view count:", e);
    return null;
  }
}

/**
 * 이벤트 공유수 증가
 */
export async function incrementEventSharedCount(
  eventCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_event_shared_count_returning",
      {
        p_event_code: eventCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment event shared count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing event shared count:", e);
    return null;
  }
}

/**
 * 이벤트 저장수 증가
 */
export async function incrementEventSavedCount(
  eventCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_event_saved_count_returning",
      {
        p_event_code: eventCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment event saved count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing event saved count:", e);
    return null;
  }
}

// ============================================
// FOLDER
// ============================================

/**
 * 폴더 조회수 증가
 */
export async function incrementFolderViewCount(
  folderCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_folder_view_count_returning",
      {
        p_folder_code: folderCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment folder view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing folder view count:", e);
    return null;
  }
}

/**
 * 폴더 공유수 증가
 */
export async function incrementFolderSharedCount(
  folderCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_folder_shared_count_returning",
      {
        p_folder_code: folderCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment folder shared count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing folder shared count:", e);
    return null;
  }
}

// ============================================
// GROUP
// ============================================

/**
 * 그룹 조회수 증가
 */
export async function incrementGroupViewCount(
  groupCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_group_view_count_returning",
      {
        p_group_code: groupCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment group view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing group view count:", e);
    return null;
  }
}

/**
 * 그룹 공유수 증가
 */
export async function incrementGroupSharedCount(
  groupCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_group_shared_count_returning",
      {
        p_group_code: groupCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment group shared count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing group shared count:", e);
    return null;
  }
}

// ============================================
// COUNTRY
// ============================================

/**
 * 국가 조회수 증가
 */
export async function incrementCountryViewCount(
  countryCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_country_view_count_returning",
      {
        p_country_code: countryCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment country view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing country view count:", e);
    return null;
  }
}

// ============================================
// CITY
// ============================================

/**
 * 도시 조회수 증가
 */
export async function incrementCityViewCount(
  cityCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_city_view_count_returning",
      {
        p_city_code: cityCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment city view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing city view count:", e);
    return null;
  }
}

// ============================================
// CATEGORY
// ============================================

/**
 * 카테고리 조회수 증가
 */
export async function incrementCategoryViewCount(
  categoryCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_category_view_count_returning",
      {
        p_category_code: categoryCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment category view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing category view count:", e);
    return null;
  }
}

// ============================================
// STAG
// ============================================

/**
 * Stag 조회수 증가
 */
export async function incrementStagViewCount(
  stagCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_stag_view_count_returning",
      {
        p_stag_code: stagCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment stag view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing stag view count:", e);
    return null;
  }
}

// ============================================
// TAG
// ============================================

/**
 * Tag 조회수 증가
 */
export async function incrementTagViewCount(
  tagCode: string,
): Promise<number | null> {
  try {
    if (!supabaseClient) {
      console.error("Supabase client is not initialized");
      return null;
    }

    const { data, error } = await supabaseClient.rpc(
      "increment_tag_view_count_returning",
      {
        p_tag_code: tagCode,
        p_increment: 1,
      },
    );

    if (error) {
      console.error("Failed to increment tag view count:", error);
      return null;
    }

    return data as number;
  } catch (e) {
    console.error("Error incrementing tag view count:", e);
    return null;
  }
}
