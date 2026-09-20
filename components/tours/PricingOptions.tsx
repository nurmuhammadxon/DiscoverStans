"use client";

import { Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { localizedText } from "@/lib/utils";
import { formatSom } from "@/lib/currency";
import type { TourPricingOption } from "@/types";

interface PricingOptionsProps {
    options: TourPricingOption[];
    selectedId: string | null;
    onSelect: (option: TourPricingOption) => void;
    lng: string;
    usdRate: number;
    labels: {
        title: string;
        from: string;
        min_people: string;
        max_people: string;
        som_currency: string;
    };
}

export function PricingOptions({ options, selectedId, onSelect, lng, usdRate, labels }: PricingOptionsProps) {
    if (!options || options.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">{labels.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((option) => {
                    const isSelected = option.id === selectedId;
                    const label = localizedText(option.label, lng);

                    return (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onSelect(option)}
                            className={cn(
                                "relative block h-auto w-full text-left rounded-xl border-2 p-4 whitespace-normal transition-colors cursor-pointer",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40"
                            )}
                        >
                            {isSelected && (
                                <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center">
                                    <Check className="h-3 w-3" />
                                </span>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase font-semibold mb-2">
                                <Users className="h-3.5 w-3.5" />
                                {option.type}
                            </div>
                            <p className="font-bold text-foreground text-sm mb-1">{label}</p>
                            <p className="text-lg font-bold text-primary">
                                {labels.from} ${option.price}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                ≈ {formatSom(Number(option.price), usdRate)} {labels.som_currency}
                            </p>
                            {(option.min_people || option.max_people) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {option.min_people && `${labels.min_people}: ${option.min_people}`}
                                    {option.min_people && option.max_people && " · "}
                                    {option.max_people && `${labels.max_people}: ${option.max_people}`}
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}