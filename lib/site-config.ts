export const siteConfig = {
    logo: {
        src: "/images/logo.png",
        alt: "DiscoverStans",
        useImage: false,
        name: "Discover",
        nameHighlight: "Stans",
        initials: "DS",
        subtitle: "Hisobingizga kiring yoki yangi hisob yarating",
    },

    description: {
        uz: "Samarqand va O'zbekiston bo'ylab unutilmas sayohatlar tashkil qilamiz - tarix, madaniyat va mehmondo'stlik bir joyda.",
        ru: "Мы организуем незабываемые путешествия по Самарканду и Узбекистану - история, культура и гостеприимство в одном месте.",
        en: "We organize unforgettable journeys across Samarkand and Uzbekistan - history, culture, and hospitality all in one place.",
    },

    companyName: {
        uz: "DiscoverStans sayohat agentligi",
        ru: "Туристическое агентство DiscoverStans",
        en: "DiscoverStans Travel Agency",
    },

    operator: {
        name: "Xayrullayev Azim",
    },

    contact: {
        email: "discoverstans.uz@gmail.com",
        phone: "+998 99 343 40 94",
        phoneSecondary: "+998 94 873 16 11",
        address: {
            uz: "Samarqand, O'zbekiston",
            ru: "Самарканд, Узбекистан",
            en: "Samarkand, Uzbekistan",
        },
    },

    social: {
        instagram: "https://instagram.com/discoverstans",
        facebook: "https://facebook.com/discoverstans",
        telegram: "https://t.me/discoverstans",
        youtube: "",
        tiktok: "",
        whatsapp: "",
    },
};

export type SiteConfig = typeof siteConfig;
export type SupportedLocale = "en" | "ru" | "uz";

export function getLocalizedSiteField(
    field: Record<SupportedLocale, string>,
    lng: string
): string {
    return field[lng as SupportedLocale] ?? field.en;
}