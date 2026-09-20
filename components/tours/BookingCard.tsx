"use client";

import { useState } from "react";
import { Users, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBooking } from "@/lib/api";
import { showSuccess, showError } from "@/lib/toast";
import { formatSom } from "@/lib/currency";

interface BookingCardProps {
    tourId: string;
    price: number;
    currency: string;
    usdRate: number;
    labels: {
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
    pricingOptionId?: string;
}

export function BookingCard({ tourId, price, currency, usdRate, labels }: BookingCardProps) {
    const [date, setDate] = useState("");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const unitPrice = Number(price);
    const total = unitPrice * adults + unitPrice * 0.5 * children;

    async function handleBook(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createBooking({
                tour_id: tourId,
                full_name: fullName,
                email,
                phone,
                tour_date: date,
                num_adults: adults,
                num_children: children,
            });
            showSuccess(labels.success);
            setFullName("");
            setEmail("");
            setPhone("");
            setDate("");
        } catch (err) {
            showError(err instanceof Error ? err.message : "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="sticky top-28 rounded-2xl border border-border p-6 bg-card">
            <div className="mb-5">
                <span className="text-xs text-muted-foreground">{labels.from}</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">${unitPrice}</span>
                    <span className="text-sm text-muted-foreground">/ {labels.per_person}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                    ≈ {formatSom(unitPrice, usdRate)} {labels.som_currency}
                </p>
            </div>

            <form onSubmit={handleBook} className="space-y-3">
                <Input
                    placeholder={labels.full_name}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <Input
                    type="email"
                    placeholder={labels.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    type="tel"
                    placeholder={labels.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />

                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-9"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {labels.adults}
                        </label>
                        <Input
                            type="number"
                            min={1}
                            value={adults}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setAdults(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1.5">{labels.children}</label>
                        <Input
                            type="number"
                            min={0}
                            value={children}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => setChildren(e.target.value === "" ? 0 : Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">{labels.total}</span>
                    <div className="text-right">
                        <span className="font-bold text-primary block">
                            ${total.toFixed(0)} {currency}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            ≈ {formatSom(total, usdRate)} {labels.som_currency}
                        </span>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSubmitting ? labels.booking : labels.book_now}
                </Button>
            </form>
        </div>
    );
}