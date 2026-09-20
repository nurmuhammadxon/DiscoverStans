import { notFound } from "next/navigation";
import { getT } from "next-i18next/server";
import { MapPin, Clock, ShieldCheck, UserRound, Activity, Check } from "lucide-react";
import { getTourBySlug, getTours } from "@/lib/api";
import { localizedText, localizedList } from "@/lib/utils";
import type { Metadata } from "next";
import { getMediaUrl } from "@/lib/media";
import { getUsdRate } from "@/lib/currency";
import type { Tour } from "@/types";
import { TourGallery } from "@/components/tours/TourGallery";
import { ReviewsSection } from "@/components/tours/ReviewsSection";
import { TourBookingPanel } from "@/components/tours/TourBookingPanel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { TourCard } from "@/components/tours/TourCard";
import { RouteTimeline } from "@/components/tours/RouteTimeline";
import { TourItinerary } from "@/components/tours/TourItinerary";
import { TourIncludedExcluded } from "@/components/tours/TourIncludedExcluded";

interface Props {
    params: Promise<{ lng: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lng, slug } = await params;

    let tour;
    try {
        tour = await getTourBySlug(slug, lng);
    } catch {
        return {};
    }
    if (!tour) return {};

    const title = localizedText(tour.title, lng);
    const description =
        localizedText(tour.short_description ?? tour.description, lng) ?? title;
    const image = getMediaUrl(tour.cover_image) ?? "/images/tours_image.png";
    const countryName = tour.countries?.[0] ? localizedText(tour.countries[0].name, lng) : "";

    return {
        title: `${title}${countryName ? ` — ${countryName}` : ""}`,
        description,
        alternates: { canonical: `/tours/${slug}` },
        openGraph: {
            title,
            description,
            url: `/tours/${slug}`,
            type: "website",
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}

export default async function TourDetailPage({ params }: Props) {
    const { lng, slug } = await params;
    const { t } = await getT("tours", { lng });
    const usdRate = await getUsdRate();

    let tour;
    try {
        tour = await getTourBySlug(slug, lng);
    } catch {
        notFound();
    }
    if (!tour) notFound();

    let relatedTours: Tour[] = [];
    try {
        const relatedRes = await getTours({
            lang: lng,
            category: tour.category,
            page_size: 4,
        });
        relatedTours = relatedRes.items.filter((rt) => rt.slug !== tour.slug).slice(0, 3);
    } catch {
        relatedTours = [];
    }

    const reviews = tour.reviews ?? [];
    const title = localizedText(tour.title, lng);
    const description = localizedText(tour.description, lng);
    const countryName = tour.countries?.[0] ? localizedText(tour.countries[0].name, lng) : "";

    const highlights = localizedList(tour.highlights, lng);
    const included = localizedList(tour.included, lng);
    const excluded = localizedList(tour.excluded, lng);
    const destinationChips = tour.destinations ?? [];

    const quickInfo = [
        tour.duration_days
            ? {
                icon: Clock,
                label: t("days_short"),
                value: `${tour.duration_days} ${tour.duration_nights ? `/ ${tour.duration_nights}` : ""}`,
            }
            : null,
        typeof tour.technical_level === "number"
            ? { icon: ShieldCheck, label: t("technical_level"), value: `${tour.technical_level}/5` }
            : null,
        typeof tour.min_age === "number"
            ? { icon: UserRound, label: t("min_age"), value: `${tour.min_age}+` }
            : null,
        typeof tour.fitness_level === "number"
            ? { icon: Activity, label: t("fitness_level"), value: `${tour.fitness_level}/5` }
            : null,
    ].filter((x): x is NonNullable<typeof x> => x !== null);

    return (
        <div className="min-h-screen bg-background pt-28 md:pt-32 pb-20">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {countryName && (
                        <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {countryName}
                        </span>
                    )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">{title}</h1>

                <TourGallery
                    images={
                        tour.images && tour.images.length > 0
                            ? tour.images
                            : tour.cover_image
                                ? [tour.cover_image]
                                : []
                    }
                    title={title}
                />

                {quickInfo.length > 0 && (
                    <div className="flex flex-wrap gap-6 md:gap-10 mt-8 pb-8 border-b border-border">
                        {quickInfo.map((info) => (
                            <div key={info.label} className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
                                    <info.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{info.label}</p>
                                    <p className="text-sm font-semibold text-foreground">{info.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
                    <div className="lg:col-span-2">
                        {destinationChips.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-primary mb-3">
                                    {t("destinations_title")}
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {destinationChips.map((d) => (
                                        <Badge
                                            key={d.id}
                                            variant="outline"
                                            className="gap-1.5 rounded-full px-3 py-1.5 text-sm"
                                        >
                                            <MapPin className="h-3.5 w-3.5" />
                                            {localizedText(d.name, lng)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Tabs defaultValue="overview">
                            <TabsList variant="line" className="mb-6 flex-wrap h-auto">
                                <TabsTrigger value="overview">{t("tab_overview")}</TabsTrigger>
                                {tour.itinerary && tour.itinerary.length > 0 && (
                                    <TabsTrigger value="itinerary">{t("tab_itinerary")}</TabsTrigger>
                                )}
                                {(included.length > 0 || excluded.length > 0) && (
                                    <TabsTrigger value="included">{t("tab_included")}</TabsTrigger>
                                )}
                                {tour.faqs && tour.faqs.length > 0 && (
                                    <TabsTrigger value="faqs">{t("tab_faqs")}</TabsTrigger>
                                )}
                            </TabsList>
                            <TabsContent value="overview" className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-primary mb-3">{t("about_tour")}</h2>
                                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                                        {description}
                                    </p>
                                </div>

                                {highlights.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-bold text-primary mb-3">
                                            {t("highlights_title")}
                                        </h2>
                                        <ul className="space-y-2">
                                            {highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                                    <span className="text-foreground/80">{h}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </TabsContent>

                            {tour.itinerary && tour.itinerary.length > 0 && (
                                <TabsContent value="itinerary">
                                    <TourItinerary
                                        itinerary={tour.itinerary}
                                        lng={lng}
                                        labels={{
                                            what_to_expect: t("what_to_expect"),
                                            meals_included: t("meals_included"),
                                            transportation: t("transportation"),
                                            accommodation: t("accommodation"),
                                            view_on_map: t("view_on_map"),
                                            check_in: t("check_in"),
                                        }}
                                    />
                                </TabsContent>
                            )}

                            {(included.length > 0 || excluded.length > 0) && (
                                <TabsContent value="included">
                                    <TourIncludedExcluded
                                        included={included}
                                        excluded={excluded}
                                        labels={{
                                            whats_included: t("whats_included"),
                                            whats_excluded: t("whats_excluded"),
                                        }}
                                    />
                                </TabsContent>
                            )}

                            {tour.faqs && tour.faqs.length > 0 && (
                                <TabsContent value="faqs">
                                    <Accordion defaultValue={[]}>
                                        {tour.faqs.map((faq, i) => (
                                            <AccordionItem key={i} value={`faq-${i}`}>
                                                <AccordionTrigger className="text-left font-medium">
                                                    {localizedText(faq.question, lng)}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-sm text-muted-foreground">
                                                    {localizedText(faq.answer, lng)}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </TabsContent>
                            )}
                        </Tabs>

                        {tour.route_points && tour.route_points.length > 0 && (
                            <div className="mt-10">
                                <RouteTimeline
                                    points={tour.route_points}
                                    lng={lng}
                                    title={t("route_title")}
                                    startingLocationLabel={t("starting_location")}
                                    dropoffLocationLabel={t("dropoff_location")}
                                    extraFeeLabel={t("extra_fee")}
                                    minutesLabel={t("duration_minutes")}
                                    activityLabels={{
                                        photo_stop: t("photo_stop"),
                                        guided_tour: t("guided_tour"),
                                        shopping: t("shopping"),
                                    }}
                                />
                            </div>
                        )}

                        <div className="mt-10">
                            <ReviewsSection
                                tourId={tour.id}
                                initialReviews={reviews}
                                labels={{
                                    title: t("reviews_title"),
                                    no_reviews: t("no_reviews"),
                                    write_review: t("write_review"),
                                    login_prompt: t("login_prompt"),
                                    login_link: t("login_link"),
                                    rating_label: t("rating_label"),
                                    placeholder: t("review_placeholder"),
                                    submit: t("submit_review"),
                                    submitting: t("submitting"),
                                    success: t("review_success"),
                                }}
                            />
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <TourBookingPanel
                                tour={tour}
                                lng={lng}
                                usdRate={usdRate}
                                pricingLabels={{
                                    title: t("pricing.title"),
                                    from: t("pricing.from"),
                                    min_people: t("pricing.min_people"),
                                    max_people: t("pricing.max_people"),
                                    som_currency: t("som_currency"),
                                }}
                                bookingLabels={{
                                    from: t("from"),
                                    per_person: t("per_person"),
                                    date: t("select_date"),
                                    adults: t("adults"),
                                    children: t("children"),
                                    book_now: t("book_now"),
                                    booking: t("booking_in_progress"),
                                    total: t("total"),
                                    full_name: t("full_name"),
                                    email: t("email"),
                                    phone: t("phone"),
                                    success: t("booking_success"),
                                    som_currency: t("som_currency"),
                                }}
                            />
                        </div>
                    </div>
                </div>

                {relatedTours.length > 0 && (
                    <div className="mt-20 pt-12 border-t border-border">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-primary">
                                {t("related_title")}
                            </h2>
                            <p className="text-muted-foreground mt-1">{t("related_subtitle")}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedTours.map((relatedTour) => (
                                <TourCard
                                    key={relatedTour.id}
                                    tour={relatedTour}
                                    viewLabel={t("view_tour")}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
