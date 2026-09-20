export const FALLBACK_USD_RATE = 12_000;

const CBU_USD_URL = "https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/";

export async function getUsdRate(): Promise<number> {
    try {
        const res = await fetch(CBU_USD_URL, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error(`CBU status ${res.status}`);

        const data = await res.json();
        const rate = parseFloat(data?.[0]?.Rate);

        if (!Number.isFinite(rate) || rate <= 0) throw new Error("CBU rate invalid");
        return rate;
    } catch (err) {
        console.error("CBU kursini olib bo'lmadi, zaxira kurs ishlatildi:", err);
        return FALLBACK_USD_RATE;
    }
}

/** (usd, kurs) -> "360 000" */
export function formatSom(usd: number, rate: number): string {
    return Math.round(usd * rate)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}