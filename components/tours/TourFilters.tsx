"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useT } from "next-i18next/client";
import { SlidersHorizontal, Search, Loader2 } from "lucide-react";
import { localizedText } from "@/lib/utils";

import { getCountries, getDestinations } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Country, Destination } from "@/types";

const CATEGORIES = [
    { value: "day_trip", label: "Day trip" },
    { value: "multi_day", label: "Multi-day" },
];

interface TourFiltersProps {
    resultCount: number;
}

export function TourFilters({ resultCount }: TourFiltersProps) {
    const { t } = useT("tours");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams<{ lng: string }>();
    const lng = params.lng ?? "en";
    const [isPending, startTransition] = useTransition();

    const currentSearch = searchParams.get("search") ?? "";
    const currentCategory = searchParams.get("category") ?? "";
    const currentCountries = (searchParams.get("country") ?? "").split(",").filter(Boolean);
    const currentDestination = searchParams.get("destination") ?? "";

    const [searchValue, setSearchValue] = useState(currentSearch);
    const [modalOpen, setModalOpen] = useState(false);
    const [draftCountries, setDraftCountries] = useState<string[]>(currentCountries);
    const [draftDestination, setDraftDestination] = useState<string | null>(null);

    const [countries, setCountries] = useState<Country[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoadingLists, setIsLoadingLists] = useState(true);

    const activeFilterCount =
        (currentCountries.length > 0 ? 1 : 0) +
        (currentCategory ? 1 : 0) +
        (currentDestination ? 1 : 0);

    const selectedCountryIds = countries
        .filter((c) => draftCountries.includes(c.slug))
        .map((c) => c.id);
    const visibleDestinations =
        draftCountries.length > 0
            ? destinations.filter((d) => selectedCountryIds.includes(d.country_id))
            : destinations;

    useEffect(() => {
        let cancelled = false;
        setIsLoadingLists(true);

        Promise.all([getCountries(), getDestinations()])
            .then(([countriesRes, destinationsRes]) => {
                if (cancelled) return;
                setCountries(countriesRes);
                setDestinations(destinationsRes);
            })
            .catch(() => {
                if (!cancelled) {
                    setCountries([]);
                    setDestinations([]);
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingLists(false);
            });

        return () => {
            cancelled = true;
        };
    }, [lng]);

    useEffect(() => {
        if (!modalOpen) return;
        setDraftCountries(currentCountries);
        setDraftDestination(currentDestination || null);
    }, [modalOpen]);

    useEffect(() => {
        setSearchValue(currentSearch);
    }, [currentSearch]);

    function updateParams(next: Record<string, string | null>) {
        const nextParams = new URLSearchParams(searchParams.toString());
        Object.entries(next).forEach(([key, value]) => {
            if (value) {
                nextParams.set(key, value);
            } else {
                nextParams.delete(key);
            }
        });
        const query = nextParams.toString();
        startTransition(() => {
            router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        updateParams({ search: searchValue.trim() || null });
    }

    function toggleCategory(value: string) {
        updateParams({ category: currentCategory === value ? null : value });
    }

    function toggleDraftCountry(slug: string) {
        setDraftCountries((prev) =>
            prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
        );
    }

    function toggleDraftDestination(slug: string) {
        setDraftDestination((prev) => (prev === slug ? null : slug));
    }

    function applyFilters() {
        const destinationStillValid =
            draftDestination !== null &&
            visibleDestinations.some((d) => d.slug === draftDestination);

        updateParams({
            country: draftCountries.length > 0 ? draftCountries.join(",") : null,
            destination: destinationStillValid ? draftDestination : null,
        });
        setModalOpen(false);
    }

    function handleClear() {
        setDraftCountries([]);
        setDraftDestination(null);
        updateParams({ country: null, destination: null });
        setModalOpen(false);
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={t("search_placeholder")}
                    className="pl-9"
                />
            </form>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0 rounded-full"
                    onClick={() => setModalOpen(true)}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {t("filter_button")}
                    {activeFilterCount > 0 && (
                        <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                <Button
                    type="button"
                    onClick={() => updateParams({ category: null })}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors bg-white ${!currentCategory
                        ? "text-primary border-primary hover:text-white"
                        : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                >
                    {t("all_categories")}
                </Button>

                {CATEGORIES.map((c) => (
                    <Button
                        key={c.value}
                        type="button"
                        onClick={() => toggleCategory(c.value)}
                        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition-colors bg-white  ${currentCategory === c.value
                            ? "text-primary border-primary hover:text-white"
                            : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                    >
                        {c.label}
                    </Button>
                ))}

                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap pl-2">
                    {isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {resultCount} {t("tours_word")}
                </span>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t("filter_button")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold mb-1">{t("country_label")}</p>
                            {isLoadingLists ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 w-full" />
                                ))
                            ) : (
                                countries.map((c) => {
                                    const checked = draftCountries.includes(c.slug);
                                    return (
                                        <button
                                            key={c.slug}
                                            type="button"
                                            aria-pressed={checked}
                                            onClick={() => toggleDraftCountry(c.slug)}
                                            className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md py-1.5 text-left hover:bg-muted/50"
                                        >
                                            <span className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    checked={checked}
                                                    tabIndex={-1}
                                                    className="pointer-events-none"
                                                />
                                                {localizedText(c.name, lng)}
                                            </span>
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 text-[11px] text-muted-foreground">
                                                {c.tour_count ?? "—"}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        <div className="space-y-1 border-t pt-4">
                            <p className="text-sm font-semibold mb-1">{t("destination_label")}</p>
                            {isLoadingLists ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-7 w-full" />
                                ))
                            ) : (
                                visibleDestinations.map((d) => {
                                    const checked = draftDestination === d.slug;
                                    return (
                                        <button
                                            key={d.id}
                                            type="button"
                                            aria-pressed={checked}
                                            onClick={() => toggleDraftDestination(d.slug)}
                                            className="flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 text-left hover:bg-muted/50"
                                        >
                                            <Checkbox
                                                checked={checked}
                                                tabIndex={-1}
                                                className="pointer-events-none"
                                            />
                                            <span className="text-sm">{localizedText(d.name, lng)}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={handleClear}>
                            {t("clear_filters")}
                        </Button>
                        <Button className="flex-1" onClick={applyFilters}>
                            {t("show")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}