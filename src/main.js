import { ScriptInfo } from './script-info.js';
import { Logger, withErrorBoundary } from './core/errors.js';
import { Settings } from './core/storage.js';
import { createExecutionContext } from './core/routing.js';
import { runAt } from './core/lifecycle.js';
import { ForceDetailThumbnailsModule } from './modules/force-detail-thumbnails.js';
import { CartDuplicateWarningModule } from './modules/cart-duplicate-warning.js';
import { HeadingTranslatorModule } from './modules/heading-translator.js';
import { ProductInfoLayoutModule } from './modules/product-info-layout.js';
import { SearchColumnsModule } from './modules/search-columns.js';
import { ForceListingImagesModule } from './modules/force-listing-images.js';
import { ListingHoverModule } from './modules/listing-hover.js';
import { OrdersGridInfiniteScrollModule } from './modules/orders-grid-infinite-scroll.js';
import { FavoriteCircleToggleModule } from './modules/favorite-circle-toggle.js';
import { FavoriteAuthorToggleModule } from './modules/favorite-author-toggle.js';
import { WishlistToggleModule } from './modules/wishlist-toggle.js';
import { FavoriteAuthorsInfiniteScrollModule } from './modules/favorite-authors-infinite-scroll.js';
import { WishlistInfiniteScrollModule } from './modules/wishlist-infinite-scroll.js';
import { VpnLinkHandlerModule } from './modules/vpn-link-handler.js';

// Module registry
const modules = [
  ForceDetailThumbnailsModule,
  CartDuplicateWarningModule,
  HeadingTranslatorModule,
  ProductInfoLayoutModule,
  SearchColumnsModule,
  ForceListingImagesModule,
  ListingHoverModule,
  OrdersGridInfiniteScrollModule,
  FavoriteCircleToggleModule,
  FavoriteAuthorToggleModule,
  WishlistToggleModule,
  FavoriteAuthorsInfiniteScrollModule,
  WishlistInfiniteScrollModule,
  VpnLinkHandlerModule
];

function bootstrap() {
  const context = createExecutionContext();
  const isDebug = Settings.isDebugEnabled();
  Logger.setDebug(isDebug);

  Logger.debug(`Initializing Melonbooks Enhanced v${ScriptInfo.version} on route: ${context.route}`);

  for (const mod of modules) {
    if (!Settings.isModuleEnabled(mod.id)) {
      Logger.debug(`Module ${mod.id} is disabled by settings.`);
      continue;
    }

    try {
      if (!mod.matches(context)) {
        Logger.debug(`Module ${mod.id} did not match route ${context.route}.`);
        continue;
      }

      const timing = mod.lifecycle || 'document-start';
      Logger.debug(`Scheduling module ${mod.id} at lifecycle [${timing}].`);

      runAt(timing, withErrorBoundary(mod.id, () => {
        Logger.debug(`Executing module ${mod.id}...`);
        mod.init(context);
      }));
    } catch (err) {
      Logger.moduleError(mod.id, 'Failed during module scheduling or match check:', err);
    }
  }
}

bootstrap();
