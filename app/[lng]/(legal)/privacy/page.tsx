import { getT } from "next-i18next/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { OperatorCertificate } from "@/components/legal/OperatorCertificate";
import { privacyContent } from "@/lib/legal/privacy";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ lng: string }>;
}

function resolvePrivacyLocale(lng: string): "uz" | "en" {
    return lng === "uz" ? "uz" : "en";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT("legal", { lng });

    const title = t("privacy_title");
    const description = t("privacy_meta_description");

    return {
        title,
        description,
        alternates: { canonical: "/privacy" },
        openGraph: { title, description, url: "/privacy" },
    };
}

export default async function PrivacyPage({ params }: Props) {
    const { lng } = await params;
    const { t } = await getT("legal", { lng });

    const contentLocale = resolvePrivacyLocale(lng);
    const isRuFallback = lng === "ru";

    return (
        <>
            <LegalDocument
                title={t("privacy_title")}
                content={privacyContent[contentLocale]}
                ruFallbackNotice={isRuFallback ? t("ru_fallback_notice") : undefined}
            />
            <OperatorCertificate
                title={t("certificate_title")}
                description={t("certificate_description")}
                zoomHint={t("certificate_zoom_hint")}
                closeLabel={t("certificate_close")}
            />
        </>
    );
}