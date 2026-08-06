import { useShowProficiencyTest, useVisualizeTest } from '@/api/generated/proficiency-test/proficiency-test';
import { LanguagePicker } from '@/components/global/language-change-button';
import { Logo } from '@/components/global/Logo';
import ThemeToggle from '@/components/global/theme-toggle-button';
import TestPage from '@/components/proficiency-test/test-page';
import { getStoredToken } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth-store';
import { env } from '@/utils/env';
import { ensureAuthenticated, ensureRoutePermissions } from '@/utils/route-guards';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react';

const staticData = {
    requiredPermissions: ["proficiency_test.submit"]
}

export const Route = createFileRoute('/(private)/proficiency-test/$id/test')({
    component: RouteComponent,
    beforeLoad: async () => {
      await ensureAuthenticated();
      ensureRoutePermissions(staticData);
    },
})

function RouteComponent() {

  const { id } = Route.useParams();

  const { user } = useAuthStore();

  const {
    data: test,
    isLoading: isLoadingTest,
    isError: isTestError
  } = useShowProficiencyTest(id);

  const { mutate: visualizeTest } = useVisualizeTest();

  const isOwner = !!test && test.data.dev_profile_id === user?.dev_profile?.id;
  const canVisualize = isOwner && test?.data.status === "generated";

  const hasRegisteredEntry = useRef(false);
  const hasRegisteredExit = useRef(false);

  useEffect(() => {
    if (!canVisualize || hasRegisteredEntry.current) return;

    hasRegisteredEntry.current = true;
    visualizeTest({ id, data: { type: "entry" } });
  }, [canVisualize, id, visualizeTest]);

  useEffect(() => {
    if (!canVisualize) return;

    const confirmExit = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    // Só dispara quando a saída de fato acontece (o usuário confirmou o diálogo).
    // Usa fetch com keepalive porque o axios é cancelado junto com a página.
    const registerExit = () => {
      if (hasRegisteredExit.current) return;
      hasRegisteredExit.current = true;

      const token = getStoredToken();

      fetch(`${env.API_BASE_URL}/proficiency-test/${id}/visualizations`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: "exit" }),
      }).catch(() => {});
    };

    window.addEventListener("beforeunload", confirmExit);
    window.addEventListener("pagehide", registerExit);

    return () => {
      window.removeEventListener("beforeunload", confirmExit);
      window.removeEventListener("pagehide", registerExit);
    };
  }, [canVisualize, id]);

  if (isLoadingTest) {
    return <div>Loading...</div>;
  }

  if (isTestError || !test) {
    return <div>Error</div>;
  }

  if (!isOwner) {
    return <div>Not your test</div>;
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="flex-1 bg-[url('/images/create_dev_profile_banner.jpg')] bg-cover bg-center brightness-50">
        <div className="w-full h-full"></div>
      </div>
      <div className="flex-1 relative m-4 flex flex-col items-center overflow-y-auto py-8">
        <div className="flex flex-col justify-center items-center mb-6">
          <Logo className="w-12 fill-primary" />
          <p className="font-[Agbalumo] text-primary text-5xl">
            {env.APP_NAME}
          </p>
        </div>
        <LanguagePicker />
        <div className="w-full max-w-[700px]">
          <TestPage testId={id} />
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
