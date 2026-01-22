// comp-folder-action-buttons.tsx
import { getDplusI18n } from "@/utils/get-dplus-i18n"
import { SUPPORT_LANG_CODES } from "dplus_common_v1"
import { Share2 } from "lucide-react"
import { CompShareFolderButton } from "../button/comp-share-folder-button";

export const CompFolderActionButtons = ({
  langCode,
  handleShareClick,
}: {
  langCode: string;
  handleShareClick: () => void;
}) => {
  const i18n = getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail;

  return (
    <CompShareFolderButton
      icon={<Share2 className="w-5 h-5" />}
      label={i18n.share}
      onClick={handleShareClick}
    />
  );
};