"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

interface OperatorCertificateProps {
    title: string;
    description: string;
    zoomHint: string;
    closeLabel: string;
}

const IMAGE_SRC = "/images/legal/business-license.jpg";
const IMAGE_WIDTH = 1549;
const IMAGE_HEIGHT = 4406;

export function OperatorCertificate({
    title,
    description,
    zoomHint,
    closeLabel,
}: OperatorCertificateProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setIsOpen(false);
        }

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    return (
        <section className="mx-auto max-w-6xl px-4 pb-20">
            <div className="border-t border-border pt-10">
                <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-2xl">{description}</p>

                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="group relative block w-56 overflow-hidden rounded-xl border border-border bg-card cursor-pointer text-left"
                    aria-label={title}
                >
                    <div className="relative aspect-929/1315 w-full overflow-hidden">
                        <Image
                            src={IMAGE_SRC}
                            alt={title}
                            width={IMAGE_WIDTH}
                            height={IMAGE_HEIGHT}
                            sizes="224px"
                            className="absolute left-0 top-0 h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    </div>
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-black/55 py-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <ZoomIn className="h-3.5 w-3.5" />
                        {zoomHint}
                    </span>
                </button>
            </div>

            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={title}
                    className="fixed inset-0 z-100 overflow-y-auto bg-black/80 p-4 md:p-8"
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label={closeLabel}
                        className="fixed right-4 top-4 z-101 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg cursor-pointer hover:bg-white/90"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mx-auto max-w-3xl" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={IMAGE_SRC}
                            alt={title}
                            width={IMAGE_WIDTH}
                            height={IMAGE_HEIGHT}
                            sizes="(min-width: 768px) 768px, 100vw"
                            className="h-auto w-full rounded-lg bg-white"
                            priority
                        />
                    </div>
                </div>
            )}
        </section>
    );
}