import { useShowCompany } from '@/api/generated/profiles-doc/profiles-doc';
import CompanyProfileBody from '@/components/profile/variants/company-profile-body';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import i18n from '@/i18n';
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Building, Eye, Hourglass } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/(private)/admin-land/company/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();

  const { t } = useTranslation();

  const { data: company } = useShowCompany(id);

  const companyData = company?.data;

  const hasTranslation = companyData?.translation_status === 'translated';
  const translationIsPending = companyData?.translation_status === 'pending';
  const translationIsError = companyData?.translation_status === 'error';
  const translationInProgress = companyData?.translation_status === 'translating';

  const [displayOriginalBioContent, setDisplayOriginalBioContent] = useState<boolean>(hasTranslation ? false : true);

  return (
    <div className="flex-1 p-8 flex flex-col gap-4">
      <Card className="w-full flex flex-row px-12 py-8 gap-4 items-center">
        <Avatar className="size-32">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Building className="size-22" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-bold font-[Anta]">
            {companyData?.name ?? "—"}
          </h2>
          <div className="flex gap-2">
            <Badge variant={"default"}>{t("role.company")}</Badge>
            <Badge variant={"secondary"}>{t(`enum.operational_segment.${companyData?.operational_segment}`)}</Badge>
            <Badge variant={"destructive"}>
              {"Score: " + (companyData?.score ?? "—")}
            </Badge>
          </div>
          {hasTranslation && (
            <p className="text-sm text-primary cursor-pointer flex items-center gap-1" onClick={() => setDisplayOriginalBioContent(!displayOriginalBioContent)}>
              <Eye className="size-3.5" />
              {displayOriginalBioContent ? t("general.display_translated_content") : t("general.display_original_content")}
            </p>
          )}
          {translationIsPending && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Hourglass className="size-3.5" />
              {t("general.translation_pending")}
            </p>
          )}
          {translationIsError && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertCircle className="size-3.5" />
              {t("general.translation_error")}
            </p>
          )}
          {translationInProgress && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Hourglass className="size-3.5" />
              {t("general.translation_in_progress")}
            </p>
          )}
          <p>
            {displayOriginalBioContent ? (companyData?.bio ?? "—") : i18n.language === "pt"
              ? (companyData?.bio_pt ?? "—")
              : (companyData?.bio_en ?? "—")
            }
          </p>
        </div>
      </Card>
      <CompanyProfileBody profileId={companyData?.id as string} />
    </div>
  );
}
