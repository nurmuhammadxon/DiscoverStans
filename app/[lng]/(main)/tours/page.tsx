import { Suspense } from "react";
import { getT } from "next-i18next/server";
import { getTours } from "@/lib/api";
import { TourCard } from "@/components/tours/TourCard";
import { TourFilters } from "@/components/tours/TourFilters";
import { metaT } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
    params: Promise<{ lng: string }>;
    searchParams: Promise<{
        search?: string;
        category?: string;
        country?: string;
        destination?: string;
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lng } = await params;
    const { t } = await getT("tours", { lng });

    const title = metaT(t, "meta_title", "title");
    const description = metaT(t, "meta_description", "subtitle");

    return {
        title,
        description,
        alternates: { canonical: "/tours" },
        openGraph: {
            title,
            description,
            url: "/tours",
            images: [{ url: "/images/tours_image.png", width: 1200, height: 630, alt: title }],
        },
    };
}

export default async function ToursPage({ params, searchParams }: Props) {
    const { lng } = await params;
    const { search, category, country, destination } = await searchParams;
    const { t } = await getT("tours", { lng });

    let tours: Awaited<ReturnType<typeof getTours>>["items"] = [];
    let loadError: string | null = null;
    let total = 0;

    try {
        const response = await getTours({
            lang: lng,
            search,
            category,
            country,
            destination,
            page_size: 24,
        });
        tours = response.items;
        total = response.total;
    } catch (err) {
        loadError = err instanceof Error ? err.message : "Xatolik yuz berdi";
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden -mx-4 mb-12">
                <img
                    src="/images/tours_image.png"
                    alt={t("title")}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />

                <div className="relative z-10 w-full mx-auto max-w-3xl px-4 text-center">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05]">
                        {t("title")}
                    </h1>
                    <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
                        {t("subtitle")}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10">
                    <Suspense fallback={null}>
                        <TourFilters resultCount={total} />
                    </Suspense>
                </div>

                {loadError ? (
                    <div className="text-center py-20 text-destructive">{loadError}</div>
                ) : tours.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">{t("no_results")}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tours.map((tour) => (
                            <TourCard key={tour.id} tour={tour} viewLabel={t("view_tour")} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}