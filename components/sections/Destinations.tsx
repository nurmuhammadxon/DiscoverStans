"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useT } from "next-i18next/client";
import { ArrowUpRight } from "lucide-react";
import { cn, localizedText, localizedHref } from "@/lib/utils";
import { getMediaUrl } from "@/lib/media";
import { TourImagePlaceholder } from "@/components/tours/TourImagePlaceholder";
import type { Country } from "@/types";
import { Button } from "../ui/button";

const COUNTRY_IMAGES: Record<string, string> = {
    uzbekistan: "/images/dest-toshkent.jpg",
    toshkent: "/images/dest-toshkent.jpg",
    buxoro: "/images/dest-buxoro.jpg",
    samarqand: "/images/dest-samarqand.jpg",
    xiva: "/images/dest-xiva.jpg",
    fargona: "/images/dest-fargona.jpg",
};
const FALLBACK_IMAGE = "/images/dest-fallback.jpg";

function getCountryImage(slug: string) {
    return COUNTRY_IMAGES[slug] ?? FALLBACK_IMAGE;
}

const ROTATE_INTERVAL = 4000;

interface DestinationsProps {
    countries: (Country & { tourCount: number })[];
}

export function Destinations({ countries }: DestinationsProps) {
    const { t } = useT("home");
    const params = useParams<{ lng: string }>();
    const lng = params.lng ?? "en";
    const count = countries.length;
    const [active, setActive] = useState(Math.floor(count / 2));

    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragDelta = useRef(0);

    const goTo = useCallback(
        (i: number) => setActive(((i % count) + count) % count),
        [count]
    );

    useEffect(() => {
        if (count <= 1) return;
        const id = setInterval(() => setActive((prev) => (prev + 1) % count), ROTATE_INTERVAL);
        return () => clearInterval(id);
    }, [count, active]);

    if (count === 0) return null;

    function onPointerDown(e: React.PointerEvent) {
        isDragging.current = true;
        dragStartX.current = e.clientX;
        dragDelta.current = 0;
    }
    function onPointerMove(e: React.PointerEvent) {
        if (!isDragging.current) return;
        dragDelta.current = e.clientX - dragStartX.current;
    }
    function onPointerUp() {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (dragDelta.current > 40) goTo(active - 1);
        else if (dragDelta.current < -40) goTo(active + 1);
        dragDelta.current = 0;
    }

    return (
        <section className="py-15 md:py-10 bg-muted/40 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-10 max-w-xl text-center mx-auto">
                    <div className="text-accent text-sm font-semibold uppercase tracking-wide mb-2">
                        {t("destinations.eyebrow")}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">
                        {t("destinations.title")}
                    </h2>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                        {t("destinations.subtitle")}
                    </p>
                </div>
            </div>

            <div
                className="relative h-95 md:h-115 select-none cursor-grab active:cursor-grabbing touch-pan-y"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
            >
                {countries.map((dest, i) => {
                    let offset = i - active;
                    if (offset > count / 2) offset -= count;
                    if (offset < -count / 2) offset += count;

                    const abs = Math.abs(offset);
                    const isCenter = offset === 0;
                    const visible = abs <= 2;

                    const translateX = offset * 190;
                    const scale = isCenter ? 1 : abs === 1 ? 0.82 : 0.68;
                    const opacity = isCenter ? 1 : abs === 1 ? 0.6 : 0.3;
                    const blur = isCenter ? 0 : abs === 1 ? 1 : 2;
                    const zIndex = 30 - abs;

                    const destName = localizedText(dest.name, lng);
                    const imageUrl = getMediaUrl(dest.cover_image);

                    return (
                        <div
                            key={dest.slug}
                            role="button"
                            tabIndex={visible ? 0 : -1}
                            onClick={() => (isCenter ? undefined : goTo(i))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    if (!isCenter) goTo(i);
                                }
                            }}
                            aria-label={destName}
                            className={cn(
                                "absolute top-1/2 left-1/2 w-55 md:w-70 h-75 md:h-95 rounded-3xl overflow-hidden shadow-xl bg-muted transition-all duration-500 ease-out cursor-grab",
                                !visible && "opacity-0 pointer-events-none"
                            )}
                            style={{
                                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                                opacity: visible ? opacity : 0,
                                filter: `blur(${blur}px)`,
                                zIndex,
                            }}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={destName}
                                    draggable={false}
                                    className="absolute inset-0 h-full w-full object-cover bg-muted"
                                />
                            ) : (
                                <TourImagePlaceholder className="absolute inset-0 h-full w-full" />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent" />

                            <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
                                <h3 className="text-xl md:text-2xl font-bold text-white">{destName}</h3>
                                <p className="text-xs md:text-sm text-white/70 mt-1">
                                    {dest.tourCount} {t("destinations.tours_count")}
                                </p>

                                {isCenter && (
                                    <Link
                                        href={localizedHref(lng, `/tours?country=${dest.slug}`)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-white/95 text-primary text-sm font-semibold px-5 py-2.5 hover:bg-white transition-colors"
                                    >
                                        {t("destinations.explore")}
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
                {countries.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-label={`${i + 1}-yonalish`}
                        onClick={() => goTo(i)}
                        className={cn(
                            "rounded-full transition-all duration-300 cursor-pointer",
                            i === active ? "w-6 h-2 bg-accent" : "w-2 h-2 bg-primary/25 hover:bg-primary/40"
                        )}
                    />
                ))}
            </div>

            <div className="mx-auto max-w-7xl px-4 mt-8 text-center">
                <Link
                    href={localizedHref(lng, "/tours")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors"
                >
                    {t("destinations.view_all")}
                    <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>
        </section>
    );
}