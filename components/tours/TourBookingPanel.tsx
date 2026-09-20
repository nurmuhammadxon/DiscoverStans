"use client";

import { useState } from "react";
import { PricingOptions } from "./PricingOptions";
import { BookingCard } from "./BookingCard";
import type { Tour, TourPricingOption } from "@/types";

interface TourBookingPanelProps {
    tour: Tour;
    lng: string;
    usdRate: number;
    pricingLabels: {
        title: string;
        from: string;
        min_people: string;
        max_people: string;
        som_currency: string;
    };
    bookingLabels: {
        from: string;
        per_person: string;
        date: string;
        adults: string;
        children: string;
        book_now: string;
        booking: string;
        total: string;
        full_name: string;
        email: string;
        phone: string;
        success: string;
        som_currency: string;
    };
}

export function TourBookingPanel({ tour, lng, usdRate, pricingLabels, bookingLabels }: TourBookingPanelProps) {
    const hasPricingOptions = tour.pricing_options && tour.pricing_options.length > 0;

    const [selected, setSelected] = useState<TourPricingOption | null>(
        hasPricingOptions ? tour.pricing_options![0] : null
    );

    const activePrice = selected ? selected.price : Number(tour.price);
    const activeCurrency = selected ? selected.currency : tour.currency;

    return (
        <div className="space-y-5">
            {hasPricingOptions && (
                <PricingOptions
                    options={tour.pricing_options!}
                    selectedId={selected?.id ?? null}
                    onSelect={setSelected}
                    lng={lng}
                    usdRate={usdRate}
                    labels={pricingLabels}
                />
            )}
            <BookingCard
                tourId={tour.id}
                price={activePrice}
                currency={activeCurrency}
                usdRate={usdRate}
                pricingOptionId={selected?.id}
                labels={bookingLabels}
            />
        </div>
    );
}