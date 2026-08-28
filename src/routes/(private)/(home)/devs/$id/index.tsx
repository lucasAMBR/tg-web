import { useShowDevProfile } from '@/api/generated/profile/profile';
import DevProfileContent from '@/components/profile/variants/dev-profile-body';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import i18n from '@/i18n';
import { useBreadcrumbLabel } from '@/hooks/use-breadcrumbs';
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, Eye, Hourglass, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pageTitle } from "@/utils/page-title";
import { ensureAuthenticated, ensureProfileCreated } from '@/utils/route-guards';

export const Route = createFileRoute('/(private)/(home)/devs/$id/')({
  head: () => ({ meta: [{ title: pageTitle("dev_details") }] }),
  staticData: {
    breadcrumb: {
      labelKey: "page_title.dev_details",
      parents: [{ labelKey: "page_title.devs", clickable: false }],
    },
  },
  component: RouteComponent,
  beforeLoad: async () => {
    await ensureAuthenticated();
    await ensureProfileCreated();
  },
})

function RouteComponent() {
  const { id } = Route.useParams();

  const { t } = useTranslation();

  const { data: dev } = useShowDevProfile(id);

  const devData = dev?.data;

  useBreadcrumbLabel(devData?.name);

  const hasTranslation = devData?.translation_status === 'translated';
  const translationIsPending = devData?.translation_status === 'pending';
  const translationIsError = devData?.translation_status === 'error';
  const translationInProgress = devData?.translation_status === 'translating';

  const [displayOriginalBioContent, setDisplayOriginalBioContent] = useState<boolean>(hasTranslation ? false : true);

  return (
    <div className="flex-1 p-8 flex flex-col gap-4">
    <Card className="w-full flex flex-row px-12 py-8 gap-4 items-center">
      <Avatar className="size-32">
        {devData?.profile_pic && (
          <AvatarImage
            src={devData.profile_pic}
            alt={devData.name}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-primary text-primary-foreground">
          <User className="size-22" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold font-[Anta]">
          {devData?.name ?? "—"}
        </h2>
        <div className="flex gap-2">
          <Badge variant={"default"}>{t(`role.dev`)}</Badge>
          <Badge variant={"secondary"}>{t(`enum.dev_specialty.${devData?.specialty}`)}</Badge>
          <Badge className="bg-accent text-accent-foreground">{t(`enum.seniority_level.${devData?.seniority_level}`)}</Badge>
          <Badge variant={"destructive"}>
             {"Score: " + (devData?.score ?? "—")}
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
              {displayOriginalBioContent ? (devData?.bio ?? "—") : i18n.language === "pt" 
                ? (devData?.bio_pt ?? "—") 
                : (devData?.bio_en ?? "—")
              }
            </p>
      </div>
    </Card >
    <DevProfileContent profileId={devData?.id as string}/>	
    </div>
  );
}
