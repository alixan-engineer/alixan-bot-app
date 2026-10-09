import { siteConfig } from '~/config/site/site';

interface PageMetaOptions {
	title?: string;
	description?: string;
	img?: string;
}

const resolveMetaText = (keyOrText: string, t: (key: string) => string) => {
	const translated = t(keyOrText);
	return translated === keyOrText ? keyOrText : translated;
};

export const usePageMeta = (payload?: PageMetaOptions) => {
	const { locale, locales, t } = useI18n();
	const route = useRoute();
	const switchLocalePath = useSwitchLocalePath();

	const metaTitle = computed(() =>
		resolveMetaText(payload?.title || siteConfig.title, t),
	);
	const metaDescription = computed(() =>
		resolveMetaText(payload?.description || siteConfig.description, t),
	);
	const canonicalUrl = computed(() => new URL(route.path, siteConfig.url).href);
	const metaImage = computed(
		() => new URL(payload?.img || siteConfig.ogImage, siteConfig.url).href,
	);
	const ogLocale = computed(
		() =>
			siteConfig.locales[locale.value as keyof typeof siteConfig.locales] ||
			siteConfig.locales[siteConfig.defaultLocale],
	);
	const alternateLocales = computed(() =>
		locales.value.filter(({ code }) => code !== locale.value),
	);

	useHead(() => ({
		title: metaTitle.value,
		titleTemplate: title =>
			title && title !== siteConfig.name
				? `${title} | ${siteConfig.name}`
				: siteConfig.name,
		link: [
			{ rel: 'canonical', href: canonicalUrl.value },
			...locales.value.map(({ code }) => ({
				rel: 'alternate',
				hreflang: code,
				href: new URL(switchLocalePath(code), siteConfig.url).href,
			})),
			{
				rel: 'alternate',
				hreflang: 'x-default',
				href: new URL(
					switchLocalePath(siteConfig.defaultLocale),
					siteConfig.url,
				).href,
			},
		],
	}));

	useSeoMeta({
		description: () => metaDescription.value,
		robots: 'noindex, nofollow',
		ogType: 'website',
		ogSiteName: siteConfig.name,
		ogTitle: () => metaTitle.value,
		ogDescription: () => metaDescription.value,
		ogUrl: () => canonicalUrl.value,
		ogLocale: () => ogLocale.value,
		ogLocaleAlternate: () =>
			alternateLocales.value.map(
				({ code }) =>
					siteConfig.locales[code as keyof typeof siteConfig.locales],
			),
		ogImage: () => metaImage.value,
		ogImageAlt: () => t('seo.ogImageAlt'),
		ogImageWidth: 1200,
		ogImageHeight: 630,
		ogImageType: 'image/png',
		twitterCard: 'summary_large_image',
		twitterTitle: () => metaTitle.value,
		twitterDescription: () => metaDescription.value,
		twitterImage: () => metaImage.value,
		twitterImageAlt: () => t('seo.ogImageAlt'),
	});
};
