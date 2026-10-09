export type ListingCategory = 'app' | 'game' | 'product';

export const LISTING_CATEGORIES: ListingCategory[] = ['game', 'app', 'product'];

export const CATEGORY_CONFIG: Record<ListingCategory, { label: string; nameLabel: string; urlLabel: string; mediaLabel: string; mediaKey: 'logo' | 'flyer'; price: number; priceLabel: string }> = {
  game: { label: 'Game', nameLabel: 'Game name', urlLabel: 'Game URL', mediaLabel: 'Upload logo', mediaKey: 'logo', price: 0, priceLabel: '7 days free' },
  app: { label: 'Web app', nameLabel: 'App name', urlLabel: 'App URL', mediaLabel: 'Upload logo', mediaKey: 'logo', price: 10000, priceLabel: '₦10,000 / 7 days' },
  product: { label: 'Product', nameLabel: 'Product name', urlLabel: 'Product URL', mediaLabel: 'Upload flyer', mediaKey: 'flyer', price: 5000, priceLabel: '₦5,000 / 7 days' }
};

export function isListingCategory(value: string): value is ListingCategory {
  return LISTING_CATEGORIES.includes(value as ListingCategory);
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function categoryNameField(category: ListingCategory) {
  return category === 'app' ? 'app_name' : category === 'game' ? 'game_name' : 'product_name';
}

export function categoryUrlField(category: ListingCategory) {
  return category === 'app' ? 'app_url' : category === 'game' ? 'game_url' : 'product_url';
}
