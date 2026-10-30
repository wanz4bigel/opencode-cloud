document.addEventListener('DOMContentLoaded', function() {
    const productCountStatEl = document.getElementById('productCountStat');
    const overviewStatusEl = document.getElementById('overviewStatus');
    const userCountStatEl = document.getElementById('userCountStat');
    const transactionCountStatEl = document.getElementById('transactionCountStat');
    const revenueStatEl = document.getElementById('revenueStat');
    const overviewPeriodLabelEl = document.getElementById('overviewPeriodLabel');
    const overviewPeriodTypeEl = document.getElementById('overviewPeriodType');
    const overviewDateInputEl = document.getElementById('overviewDateInput');
    const overviewMonthInputEl = document.getElementById('overviewMonthInput');
    const overviewYearInputEl = document.getElementById('overviewYearInput');
    const overviewDateFromInputEl = document.getElementById('overviewDateFromInput');
    const overviewDateToInputEl = document.getElementById('overviewDateToInput');
    const overviewApplyPeriodBtn = document.getElementById('overviewApplyPeriodBtn');
    const overviewRevenueTotalEl = document.getElementById('overviewRevenueTotal');
    const overviewModalTotalEl = document.getElementById('overviewModalTotal');
    const overviewGrossMarginEl = document.getElementById('overviewGrossMargin');
    const overviewQrisFeeEl = document.getElementById('overviewQrisFee');
    const overviewPricingNoteEl = document.getElementById('overviewPricingNote');
    const overviewSuccessCircleEl = document.getElementById('overviewSuccessCircle');
    const overviewSuccessRateEl = document.getElementById('overviewSuccessRate');
    const overviewSuccessTransactionsEl = document.getElementById('overviewSuccessTransactions');
    const overviewFailedTransactionsEl = document.getElementById('overviewFailedTransactions');
    const overviewProcessTransactionsEl = document.getElementById('overviewProcessTransactions');
    const overviewDisruptionCircleEl = document.getElementById('overviewDisruptionCircle');
    const overviewDisruptionRateEl = document.getElementById('overviewDisruptionRate');
    const overviewActiveProductsEl = document.getElementById('overviewActiveProducts');
    const overviewDisruptedProductsEl = document.getElementById('overviewDisruptedProducts');
    const overviewTotalProductsEl = document.getElementById('overviewTotalProducts');
    const overviewMarginCircleEl = document.getElementById('overviewMarginCircle');
    const overviewMarginRateEl = document.getElementById('overviewMarginRate');
    const overviewRuleMarginEl = document.getElementById('overviewRuleMargin');
    const overviewRoundingEl = document.getElementById('overviewRounding');
    const overviewPricedTransactionsEl = document.getElementById('overviewPricedTransactions');
    const pageTitleEl = document.getElementById('pageTitle');
    const dashboardViews = document.querySelectorAll('.dashboard-view');
    const mobileNavListEl = document.querySelector('.sidebar-nav ul');
    const mobileNavLinks = Array.from(document.querySelectorAll('.sidebar-nav [data-view-target]'));
    const monitoringStatusEl = document.getElementById('monitoringStatus');
    const refreshMonitoringBtn = document.getElementById('refreshMonitoringBtn');
    const monitorServerCardEl = document.getElementById('monitorServerCard');
    const monitorDatabaseCardEl = document.getElementById('monitorDatabaseCard');
    const monitorDigiflazzCardEl = document.getElementById('monitorDigiflazzCard');
    const monitorBackupCardEl = document.getElementById('monitorBackupCard');
    const monitorServerStatusEl = document.getElementById('monitorServerStatus');
    const monitorServerDetailEl = document.getElementById('monitorServerDetail');
    const monitorDatabaseStatusEl = document.getElementById('monitorDatabaseStatus');
    const monitorDatabaseDetailEl = document.getElementById('monitorDatabaseDetail');
    const monitorDigiflazzBalanceEl = document.getElementById('monitorDigiflazzBalance');
    const monitorDigiflazzDetailEl = document.getElementById('monitorDigiflazzDetail');
    const monitorBackupStatusEl = document.getElementById('monitorBackupStatus');
    const monitorBackupDetailEl = document.getElementById('monitorBackupDetail');
    const monitorPendingPaymentsEl = document.getElementById('monitorPendingPayments');
    const monitorStalePaymentsEl = document.getElementById('monitorStalePayments');
    const monitorFailedTransactionsEl = document.getElementById('monitorFailedTransactions');
    const monitorDisruptedProductsEl = document.getElementById('monitorDisruptedProducts');
    const monitorLastWebhookEl = document.getElementById('monitorLastWebhook');
    const monitorProductSyncEl = document.getElementById('monitorProductSync');
    const monitorAlertListEl = document.getElementById('monitorAlertList');
    const monitorEventListEl = document.getElementById('monitorEventList');
    const adminPushStatusEl = document.getElementById('adminPushStatus');
    const adminPushConfiguredEl = document.getElementById('adminPushConfigured');
    const adminPushRegisteredUsersEl = document.getElementById('adminPushRegisteredUsers');
    const adminPushUserDevicesEl = document.getElementById('adminPushUserDevices');
    const adminPushAdminDevicesEl = document.getElementById('adminPushAdminDevices');
    const refreshAdminPushBtn = document.getElementById('refreshAdminPushBtn');
    const sendAdminPushTestBtn = document.getElementById('sendAdminPushTestBtn');
    const adminPushBroadcastFormEl = document.getElementById('adminPushBroadcastForm');
    const adminPushTitleInputEl = document.getElementById('adminPushTitleInput');
    const adminPushBodyInputEl = document.getElementById('adminPushBodyInput');
    const adminPushPathInputEl = document.getElementById('adminPushPathInput');
    const sendAdminPushBroadcastBtn = document.getElementById('sendAdminPushBroadcastBtn');
    const adminPushSendInfoEl = document.getElementById('adminPushSendInfo');
    const adminPushHistoryListEl = document.getElementById('adminPushHistoryList');
    const productSyncInfoEl = document.getElementById('productSyncInfo');
    const syncProductsBtn = document.getElementById('syncProductsBtn');
    const adminProductTotalEl = document.getElementById('adminProductTotal');
    const adminProductActiveEl = document.getElementById('adminProductActive');
    const adminProductInactiveEl = document.getElementById('adminProductInactive');
    const adminProductFailedEl = document.getElementById('adminProductFailed');
    const adminProductLastSyncEl = document.getElementById('adminProductLastSync');
    const adminProductListEl = document.getElementById('admin-product-list');
    const adminProductStatusEl = document.getElementById('adminProductStatus');
    const productAutoSyncEnabledInputEl = document.getElementById('productAutoSyncEnabledInput');
    const productAutoSyncTimeInputEl = document.getElementById('productAutoSyncTimeInput');
    const productAutoSyncTimezoneInputEl = document.getElementById('productAutoSyncTimezoneInput');
    const saveProductAutoSyncBtn = document.getElementById('saveProductAutoSyncBtn');
    const productAutoSyncInfoEl = document.getElementById('productAutoSyncInfo');
    const brandLogoListEl = document.getElementById('brandLogoList');
    const brandLogoSearchEl = document.getElementById('brandLogoSearch');
    const brandLogoInfoEl = document.getElementById('brandLogoInfo');
    const refreshBrandLogosBtn = document.getElementById('refreshBrandLogosBtn');
    const migrateLogosToR2Btn = document.getElementById('migrateLogosToR2Btn');
    const logoStorageStatusEl = document.getElementById('logoStorageStatus');
    const categoryLogoListEl = document.getElementById('categoryLogoList');
    const categoryLogoSearchEl = document.getElementById('categoryLogoSearch');
    const categoryLogoInfoEl = document.getElementById('categoryLogoInfo');
    const refreshCategoryLogosBtn = document.getElementById('refreshCategoryLogosBtn');
    const announcementFormEl = document.getElementById('announcementForm');
    const announcementTitleInputEl = document.getElementById('announcementTitleInput');
    const announcementBodyInputEl = document.getElementById('announcementBodyInput');
    const announcementImageInputEl = document.getElementById('announcementImageInput');
    const announcementLinkInputEl = document.getElementById('announcementLinkInput');
    const announcementExpiryInputEl = document.getElementById('announcementExpiryInput');
    const submitAnnouncementBtn = document.getElementById('submitAnnouncementBtn');
    const announcementStatusEl = document.getElementById('announcementStatus');
    const announcementListEl = document.getElementById('announcementList');
    const refreshAnnouncementsBtn = document.getElementById('refreshAnnouncementsBtn');
    const bannerFormEl = document.getElementById('bannerForm');
    const bannerLabelInputEl = document.getElementById('bannerLabelInput');
    const bannerImageInputEl = document.getElementById('bannerImageInput');
    const bannerLinkInputEl = document.getElementById('bannerLinkInput');
    const bannerPreviewWrapEl = document.getElementById('bannerPreviewWrap');
    const bannerPreviewImageEl = document.getElementById('bannerPreviewImage');
    const bannerPreviewInfoEl = document.getElementById('bannerPreviewInfo');
    const submitBannerBtn = document.getElementById('submitBannerBtn');
    const bannerStatusEl = document.getElementById('bannerStatus');
    const bannerListEl = document.getElementById('bannerList');
    const refreshBannersBtn = document.getElementById('refreshBannersBtn');
    const BANNER_TARGET_RATIO = 3;
    const productPrevPageBtn = document.getElementById('productPrevPage');
    const productNextPageBtn = document.getElementById('productNextPage');
    const productPageInfoEl = document.getElementById('productPageInfo');
    const adminCategoryFilterEl = document.getElementById('adminCategoryFilter');
    const adminBrandFilterEl = document.getElementById('adminBrandFilter');
    const adminTypeFilterEl = document.getElementById('adminTypeFilter');
    const adminCategoryFilterCustomEl = document.getElementById('adminCategoryFilterCustom');
    const adminBrandFilterCustomEl = document.getElementById('adminBrandFilterCustom');
    const adminTypeFilterCustomEl = document.getElementById('adminTypeFilterCustom');
    const adminSkuSearchEl = document.getElementById('adminSkuSearch');
    const adminFailedProductsToggleEl = document.getElementById('adminFailedProductsToggle');
    const adminCategoryListEl = document.getElementById('adminCategoryList');
    const adminBrandListEl = document.getElementById('adminBrandList');
    const adminTypeListEl = document.getElementById('adminTypeList');
    const adminCategoryCountEl = document.getElementById('adminCategoryCount');
    const adminBrandCountEl = document.getElementById('adminBrandCount');
    const adminTypeCountEl = document.getElementById('adminTypeCount');
    const adminPromoEditorEl = document.getElementById('adminPromoEditor');
    const adminPromoProductNameEl = document.getElementById('adminPromoProductName');
    const adminPromoBasePriceTextEl = document.getElementById('adminPromoBasePriceText');
    const adminPromoDescriptionInputEl = document.getElementById('adminPromoDescriptionInput');
    const adminPromoOriginalPriceInputEl = document.getElementById('adminPromoOriginalPriceInput');
    const adminPromoFinalPriceInputEl = document.getElementById('adminPromoFinalPriceInput');
    const adminPromoDurationHoursInputEl = document.getElementById('adminPromoDurationHoursInput');
    const adminPromoExpiresAtInputEl = document.getElementById('adminPromoExpiresAtInput');
    const saveAdminPromoBtn = document.getElementById('saveAdminPromoBtn');
    const disableAdminPromoBtn = document.getElementById('disableAdminPromoBtn');
    const cancelAdminPromoBtn = document.getElementById('cancelAdminPromoBtn');
    const adminPromoInfoEl = document.getElementById('adminPromoInfo');
    const productFlatMarginInputEl = document.getElementById('productFlatMarginInput');
    const productMidMarginPercentInputEl = document.getElementById('productMidMarginPercentInput');
    const productHighMarginPercentInputEl = document.getElementById('productHighMarginPercentInput');
    const productQrisFeeEnabledInputEl = document.getElementById('productQrisFeeEnabledInput');
    const productQrisFeePercentInputEl = document.getElementById('productQrisFeePercentInput');
    const topupMinAmountInputEl = document.getElementById('topupMinAmountInput');
    const csWhatsappNumberInputEl = document.getElementById('csWhatsappNumberInput');
    const digiflazzBalanceWarningThresholdInputEl = document.getElementById('digiflazzBalanceWarningThresholdInput');
    const digiflazzProductLimitEnabledInputEl = document.getElementById('digiflazzProductLimitEnabledInput');
    const digiflazzProductLimitMarginInputEl = document.getElementById('digiflazzProductLimitMarginInput');
    const digiflazzProductLimitInfoEl = document.getElementById('digiflazzProductLimitInfo');
    const digiflazzBalanceWarningTelegramChatIdInputEl = document.getElementById('digiflazzBalanceWarningTelegramChatIdInput');
    const digiflazzCurrentBalanceTextEl = document.getElementById('digiflazzCurrentBalanceText');
    const digiflazzBalanceStatusTextEl = document.getElementById('digiflazzBalanceStatusText');
    const refreshDigiflazzBalanceBtn = document.getElementById('refreshDigiflazzBalanceBtn');
    const productPurchaseEnabledInputEl = document.getElementById('productPurchaseEnabledInput');
    const walletTopupEnabledInputEl = document.getElementById('walletTopupEnabledInput');
    const qrisPaymentEnabledInputEl = document.getElementById('qrisPaymentEnabledInput');
    const gameUsernameCheckEnabledInputEl = document.getElementById('gameUsernameCheckEnabledInput');
    const dailyCutOffEnabledInputEl = document.getElementById('dailyCutOffEnabledInput');
    const dailyCutOffStartInputEl = document.getElementById('dailyCutOffStartInput');
    const dailyCutOffEndInputEl = document.getElementById('dailyCutOffEndInput');
    const dailyCutOffTimezoneInputEl = document.getElementById('dailyCutOffTimezoneInput');
    const dailyCutOffMessageInputEl = document.getElementById('dailyCutOffMessageInput');
    const operationsMessageInputEl = document.getElementById('operationsMessageInput');
    const saveOperationsSettingsBtn = document.getElementById('saveOperationsSettingsBtn');
    const operationsSettingsInfoEl = document.getElementById('operationsSettingsInfo');
    const developmentModeEnabledInputEl = document.getElementById('developmentModeEnabledInput');
    const developmentAllowedIdentitiesInputEl = document.getElementById('developmentAllowedIdentitiesInput');
    const developmentMessageInputEl = document.getElementById('developmentMessageInput');
    const saveDevelopmentSettingsBtn = document.getElementById('saveDevelopmentSettingsBtn');
    const developmentSettingsInfoEl = document.getElementById('developmentSettingsInfo');
    const paymentGatewayProviderInputEl = document.getElementById('paymentGatewayProviderInput');
    const midtransProductionInputEl = document.getElementById('midtransProductionInput');
    const midtransClientKeyInputEl = document.getElementById('midtransClientKeyInput');
    const midtransServerKeyInputEl = document.getElementById('midtransServerKeyInput');
    const midtransEnabledPaymentsInputEl = document.getElementById('midtransEnabledPaymentsInput');
    const midtransSnapBaseUrlInputEl = document.getElementById('midtransSnapBaseUrlInput');
    const midtransApiBaseUrlInputEl = document.getElementById('midtransApiBaseUrlInput');
    const midtransSnapJsUrlInputEl = document.getElementById('midtransSnapJsUrlInput');
    const savePaymentGatewayBtn = document.getElementById('savePaymentGatewayBtn');
    const paymentGatewayInfoEl = document.getElementById('paymentGatewayInfo');
    const refreshInternalGatewayBtn = document.getElementById('refreshInternalGatewayBtn');
    const internalGatewayBaseUrlEl = document.getElementById('internalGatewayBaseUrl');
    const partnerAppNameInputEl = document.getElementById('partnerAppNameInput');
    const partnerCallbackUrlInputEl = document.getElementById('partnerCallbackUrlInput');
    const partnerReturnUrlInputEl = document.getElementById('partnerReturnUrlInput');
    const partnerAllowedOriginsInputEl = document.getElementById('partnerAllowedOriginsInput');
    const partnerAllowedIpsInputEl = document.getElementById('partnerAllowedIpsInput');
    const partnerRequestTtlInputEl = document.getElementById('partnerRequestTtlInput');
    const partnerEnabledInputEl = document.getElementById('partnerEnabledInput');
    const createPartnerAppBtn = document.getElementById('createPartnerAppBtn');
    const internalGatewayInfoEl = document.getElementById('internalGatewayInfo');
    const partnerCredentialBoxEl = document.getElementById('partnerCredentialBox');
    const partnerCredentialApiKeyEl = document.getElementById('partnerCredentialApiKey');
    const partnerCredentialSecretEl = document.getElementById('partnerCredentialSecret');
    const partnerAppsListEl = document.getElementById('partnerAppsList');
    const externalGatewayOrdersListEl = document.getElementById('externalGatewayOrdersList');
    const userPromoEnabledInputEl = document.getElementById('userPromoEnabledInput');
    const backupTelegramBotTokenInputEl = document.getElementById('backupTelegramBotTokenInput');
    const backupTelegramChatIdInputEl = document.getElementById('backupTelegramChatIdInput');
    const backupAutoEnabledInputEl = document.getElementById('backupAutoEnabledInput');
    const saveBackupSettingsBtn = document.getElementById('saveBackupSettingsBtn');
    const triggerBackupNowBtn = document.getElementById('triggerBackupNowBtn');
    const backupInfoEl = document.getElementById('backupInfo');
    const testimonialTelegramChatIdInputEl = document.getElementById('testimonialTelegramChatIdInput');
    const adminNotificationTelegramChatIdInputEl = document.getElementById('adminNotificationTelegramChatIdInput');
    const saveTestimonialSettingsBtn = document.getElementById('saveTestimonialSettingsBtn');
    const sendTestimonialTestBtn = document.getElementById('sendTestimonialTestBtn');
    const testimonialInfoEl = document.getElementById('testimonialInfo');
    const restoreDumpFileInputEl = document.getElementById('restoreDumpFileInput');
    const triggerRestoreNowBtn = document.getElementById('triggerRestoreNowBtn');
    const restoreInfoEl = document.getElementById('restoreInfo');
    const refreshBackupFilesBtn = document.getElementById('refreshBackupFilesBtn');
    const backupFileListEl = document.getElementById('backup-file-list');
    const saveProductFeeBtn = document.getElementById('saveProductFeeBtn');
    const productFeeInfoEl = document.getElementById('productFeeInfo');
    const adminTransactionListEl = document.getElementById('admin-transaction-list');
    const txDateFromEl = document.getElementById('txDateFrom');
    const txDateToEl = document.getElementById('txDateTo');
    const txStatusEl = document.getElementById('txStatus');
    const txStatusCustomEl = document.getElementById('txStatusCustom');
    const txSearchEl = document.getElementById('txSearch');
    const txFilterResetEl = document.getElementById('txFilterReset');
    const txShownCountEl = document.getElementById('txShownCount');
    const txPrevPageBtn = document.getElementById('txPrevPage');
    const txNextPageBtn = document.getElementById('txNextPage');
    const txPageInfoEl = document.getElementById('txPageInfo');
    const adminPaymentListEl = document.getElementById('admin-payment-list');
    const payTypeFilterEl = document.getElementById('payTypeFilter');
    const payStatusFilterEl = document.getElementById('payStatusFilter');
    const payTypeFilterCustomEl = document.getElementById('payTypeFilterCustom');
    const payStatusFilterCustomEl = document.getElementById('payStatusFilterCustom');
    const paySearchEl = document.getElementById('paySearch');
    const payFilterResetEl = document.getElementById('payFilterReset');
    const payShownCountEl = document.getElementById('payShownCount');
    const payPrevPageBtn = document.getElementById('payPrevPage');
    const payNextPageBtn = document.getElementById('payNextPage');
    const payPageInfoEl = document.getElementById('payPageInfo');
    const userTbody = document.getElementById('user-list');
    const userShownCountEl = document.getElementById('userShownCount');
    const userPrevPageBtn = document.getElementById('userPrevPage');
    const userNextPageBtn = document.getElementById('userNextPage');
    const userPageInfoEl = document.getElementById('userPageInfo');
    const userBalanceEmailInputEl = document.getElementById('userBalanceEmailInput');
    const userBalanceSearchBtn = document.getElementById('userBalanceSearchBtn');
    const userBalanceResultPanelEl = document.getElementById('userBalanceResultPanel');
    const userBalanceAccountTextEl = document.getElementById('userBalanceAccountText');
    const userBalanceCurrentTextEl = document.getElementById('userBalanceCurrentText');
    const userBalanceAmountInputEl = document.getElementById('userBalanceAmountInput');
    const userBalanceNoteInputEl = document.getElementById('userBalanceNoteInput');
    const userBalanceAddBtn = document.getElementById('userBalanceAddBtn');
    const userBalanceSetBtn = document.getElementById('userBalanceSetBtn');
    const userBalanceStatusEl = document.getElementById('userBalanceStatus');
    let allAdminTransactions = [];
    const adminTxPageSize = 20;
    let currentAdminTxPage = 1;
    let allAdminPayments = [];
    let allPartnerApps = [];
    let allExternalGatewayOrders = [];
    let editingPartnerAppId = '';
    const adminPaymentPageSize = 20;
    let currentAdminPaymentPage = 1;
    let allAdminProducts = [];
    let allBrandLogos = [];
    let brandLogoMaxBytes = 256 * 1024;
    let allCategoryLogos = [];
    let categoryLogoMaxBytes = 256 * 1024;
    const adminProductPageSize = 20;
    let currentAdminProductPage = 1;
    const adminUserPageSize = 20;
    let currentAdminUserPage = 1;
    let totalAdminUsers = 0;
    let selectedBalanceUser = null;
    let userSearchTimer = null;
    let adminPushSummary = null;
    let quickServiceSkus = [];
    let selectedAdminCategory = '';
    let selectedAdminBrand = '';
    let selectedAdminType = '';
    let showFailedProductsOnly = false;
    let activeUserPromoBanner = {
        enabled: false,
        title: '',
        subtitle: '',
        sku: '',
        originalPrice: null,
        finalPrice: null,
        durationHours: null,
        expiresAt: null,
        isExpired: false,
        isActive: false,
        activeCount: 0,
        items: [],
    };
    let editingPromoSku = '';
    let activeFancyFilterEl = null;
    const receiptWebsiteUrl = `${window.location.origin}/`;
    const receiptAdText = 'Dapatkan kuota hemat & cepat aktif di 1FORCR KUOTA.';

    function normalizeAdminPromoItem(item) {
        const source = item && typeof item === 'object' ? item : {};
        const originalPrice = Number(source.originalPrice || 0);
        const finalPrice = Number(source.finalPrice || 0);
        const durationHours = Number(source.durationHours || 0);
        return {
            enabled: source.enabled !== false,
            title: String(source.title || '').trim(),
            subtitle: String(source.subtitle || '').trim(),
            sku: String(source.sku || '').trim(),
            originalPrice: Number.isFinite(originalPrice) && originalPrice > 0 ? Math.trunc(originalPrice) : null,
            finalPrice: Number.isFinite(finalPrice) && finalPrice > 0 ? Math.trunc(finalPrice) : null,
            durationHours: Number.isFinite(durationHours) && durationHours > 0 ? Math.trunc(durationHours) : null,
            expiresAt: source.expiresAt ? String(source.expiresAt) : null,
            isExpired: Boolean(source.isExpired),
            isActive: Boolean(source.isActive),
        };
    }

    function normalizeAdminPromoBanner(value) {
        const source = value && typeof value === 'object' ? value : {};
        const rawItems = Array.isArray(source.items)
            ? source.items
            : (source.sku || source.title || source.subtitle ? [source] : []);
        const items = rawItems
            .map(normalizeAdminPromoItem)
            .filter(function(item) {
                return item.sku || item.title || item.subtitle || item.originalPrice || item.finalPrice;
            });
        const firstItem = items[0] || normalizeAdminPromoItem(source);
        const activeCount = items.filter(function(item) {
            return item.isActive || (source.enabled !== false && item.enabled && !item.isExpired);
        }).length;
        return {
            enabled: Boolean(source.enabled),
            title: firstItem.title,
            subtitle: firstItem.subtitle,
            sku: firstItem.sku,
            originalPrice: firstItem.originalPrice,
            finalPrice: firstItem.finalPrice,
            durationHours: firstItem.durationHours,
            expiresAt: firstItem.expiresAt,
            isExpired: Boolean(firstItem.isExpired),
            isActive: activeCount > 0,
            activeCount,
            items,
        };
    }

    function findAdminPromoItemBySku(sku) {
        const normalizedSku = String(sku || '').trim();
        if (!normalizedSku) return null;
        return (activeUserPromoBanner.items || []).find(function(item) {
            return String(item.sku || '') === normalizedSku;
        }) || null;
    }

    function isActiveAdminPromoSku(sku) {
        const item = findAdminPromoItemBySku(sku);
        return Boolean(activeUserPromoBanner.enabled && item?.enabled && !item?.isExpired);
    }

    function buildPromoBannerPayload(nextItems, enabled = true) {
        return {
            enabled,
            items: (Array.isArray(nextItems) ? nextItems : [])
                .map(normalizeAdminPromoItem)
                .filter(function(item) {
                    return item.sku || item.title || item.subtitle || item.originalPrice || item.finalPrice;
                }),
        };
    }

    function showView(viewId) {
        const targetView = document.getElementById(viewId) || document.getElementById('overviewView');
        if (!targetView) return;

        dashboardViews.forEach(function(view) {
            view.classList.toggle('active', view === targetView);
        });

        if (pageTitleEl) {
            pageTitleEl.textContent = targetView.dataset.pageTitle || 'Dashboard Admin';
        }

        document.querySelectorAll('.sidebar-nav li').forEach(function(item) {
            const link = item.querySelector('[data-view-target]');
            item.classList.toggle('active', link?.dataset.viewTarget === targetView.id);
        });
        updateMobileNavIndicator(targetView.id);
        if (targetView.id === 'monitoringView') {
            void loadMonitoringDashboard();
        }
        if (targetView.id === 'pushNotificationsView') {
            void loadAdminPushSummary();
            void loadAnnouncements();
            void loadBanners();
        }
        if (targetView.id === 'internalGatewayView') {
            void loadInternalGatewayDashboard();
        }
        if (targetView.id === 'resellerApiView') {
            void loadResellerApiDashboard();
        }
        if (targetView.id === 'vpnView') {
            void loadVpnAdminStats();
            void loadVpnServers();
            void loadVpnGatewaySettings();
            void loadVpnConfigSettings();
            void loadVpnConfigTemplates();
            void loadVpnRestoreStatus();
        }
    }

    function updateMobileNavIndicator(targetViewId) {
        if (!mobileNavListEl) return;
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const navItems = Array.from(mobileNavListEl.querySelectorAll('li'));

        if (!isMobile) {
            navItems.forEach(function(item) {
                item.classList.remove('nav-pos-center', 'nav-pos-left', 'nav-pos-right', 'nav-pos-far-left', 'nav-pos-far-right', 'nav-hidden');
                item.style.removeProperty('--nav-shift');
            });
            return;
        }

        let activeLink = null;
        if (targetViewId) {
            activeLink = mobileNavLinks.find(function(link) {
                return link.dataset.viewTarget === targetViewId;
            }) || null;
        }
        if (!activeLink) {
            activeLink = mobileNavListEl.querySelector('li.active [data-view-target]') || mobileNavLinks[0] || null;
        }
        if (!activeLink) return;
        const activeItem = activeLink.closest('li');
        if (!activeItem) return;
        const activeIndex = navItems.indexOf(activeItem);
        if (activeIndex < 0) return;

        const itemCount = navItems.length;
        const stepPx = Math.max(62, Math.min(82, Math.floor(mobileNavListEl.clientWidth / 4.2)));
        const shortDistance = function(index) {
            let distance = index - activeIndex;
            if (distance > itemCount / 2) distance -= itemCount;
            if (distance < -itemCount / 2) distance += itemCount;
            return distance;
        };

        navItems.forEach(function(item, index) {
            item.classList.remove('nav-pos-center', 'nav-pos-left', 'nav-pos-right', 'nav-pos-far-left', 'nav-pos-far-right', 'nav-hidden');
            const distance = shortDistance(index);
            item.style.setProperty('--nav-shift', `${distance * stepPx}px`);

            if (distance === 0) {
                item.classList.add('nav-pos-center');
            } else if (distance === -1) {
                item.classList.add('nav-pos-left');
            } else if (distance === 1) {
                item.classList.add('nav-pos-right');
            } else if (distance === -2) {
                item.classList.add('nav-pos-far-left');
            } else if (distance === 2) {
                item.classList.add('nav-pos-far-right');
            } else {
                item.classList.add('nav-hidden');
            }
        });
    }

    function setupMobileNavSwipe() {
        if (!mobileNavListEl) return;
        let startX = 0;
        let startY = 0;
        let tracking = false;
        const swipeThreshold = 26;

        mobileNavListEl.addEventListener('touchstart', function(e) {
            if (!window.matchMedia('(max-width: 768px)').matches) return;
            const touch = e.touches && e.touches[0];
            if (!touch) return;
            startX = touch.clientX;
            startY = touch.clientY;
            tracking = true;
        }, { passive: true });

        mobileNavListEl.addEventListener('touchend', function(e) {
            if (!tracking) return;
            tracking = false;
            if (!window.matchMedia('(max-width: 768px)').matches) return;
            const touch = e.changedTouches && e.changedTouches[0];
            if (!touch) return;

            const dx = touch.clientX - startX;
            const dy = touch.clientY - startY;
            if (Math.abs(dx) < swipeThreshold || Math.abs(dx) <= Math.abs(dy)) return;
            if (!mobileNavLinks.length) return;

            const activeLink = mobileNavLinks.find(function(link) {
                return link.closest('li')?.classList.contains('active');
            }) || mobileNavLinks[0];
            const currentIndex = Math.max(0, mobileNavLinks.indexOf(activeLink));
            const step = dx < 0 ? 1 : -1;
            const nextIndex = (currentIndex + step + mobileNavLinks.length) % mobileNavLinks.length;
            const nextLink = mobileNavLinks[nextIndex];
            if (nextLink?.dataset?.viewTarget) {
                showView(nextLink.dataset.viewTarget);
            }
        }, { passive: true });
    }

    function formatRupiah(amount) {
        if (typeof amount !== 'number') return '-';
        return `Rp ${amount.toLocaleString('id-ID')}`;
    }

    function formatDate(value) {
        if (!value) return '-';
        return new Date(value).toLocaleString('id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    }

    function toDateTimeLocalInputValue(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function formatBytes(value) {
        const bytes = Number(value || 0);
        if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex += 1;
        }
        const fixed = size >= 10 || unitIndex === 0 ? 0 : 1;
        return `${size.toFixed(fixed)} ${units[unitIndex]}`;
    }

    function formatDuration(seconds) {
        const total = Math.max(0, Math.floor(Number(seconds || 0)));
        const days = Math.floor(total / 86400);
        const hours = Math.floor((total % 86400) / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        if (days > 0) return `${days}h ${hours}j`;
        if (hours > 0) return `${hours}j ${minutes}m`;
        return `${minutes}m`;
    }

    function setMonitorCardState(card, state) {
        if (!card) return;
        card.classList.remove('is-ok', 'is-warning', 'is-critical');
        card.classList.add(`is-${state || 'ok'}`);
    }

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function formatMonitorBalance(snapshot) {
        const raw = snapshot?.balance ?? snapshot?.data?.balance ?? snapshot?.buyerLastSaldo ?? snapshot?.data?.buyer_last_saldo;
        const amount = Number(raw);
        if (Number.isFinite(amount)) return formatRupiah(Math.trunc(amount));
        return snapshot?.ok === false ? 'Gagal dicek' : '-';
    }

    function renderMonitorList(container, items, emptyText, kind) {
        if (!container) return;
        container.innerHTML = '';
        if (!Array.isArray(items) || !items.length) {
            const empty = document.createElement('div');
            empty.className = 'monitor-empty';
            empty.textContent = emptyText;
            container.appendChild(empty);
            return;
        }

        items.forEach(function(item) {
            const row = document.createElement('article');
            row.className = `monitor-list-item ${kind || ''} ${item.level || item.severity || ''}`.trim();
            const title = document.createElement('strong');
            title.textContent = item.title || item.action || '-';
            const meta = document.createElement('span');
            meta.textContent = item.message || [item.severity, item.subject, formatDate(item.createdAt)].filter(Boolean).join(' | ') || '-';
            row.appendChild(title);
            row.appendChild(meta);
            container.appendChild(row);
        });
    }

    async function loadMonitoringDashboard() {
        setStatusElement(monitoringStatusEl, 'Memuat status sistem...', 'loading', 'checkout-status');
        if (refreshMonitoringBtn) {
            if (!refreshMonitoringBtn.dataset.originalHtml) refreshMonitoringBtn.dataset.originalHtml = refreshMonitoringBtn.innerHTML;
            refreshMonitoringBtn.disabled = true;
            refreshMonitoringBtn.classList.add('is-loading');
            refreshMonitoringBtn.innerHTML = '<i class="fas fa-spinner"></i> Refresh...';
        }

        try {
            const response = await fetch('/api/admin/monitoring', { cache: 'no-store' });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat monitoring');
            const data = result?.data || {};
            const server = data.server || {};
            const database = data.database || {};
            const backup = data.backup?.last || null;
            const autoSync = data.products?.autoSync || {};

            setMonitorCardState(monitorServerCardEl, 'ok');
            setText(monitorServerStatusEl, 'Online');
            setText(monitorServerDetailEl, `Uptime ${formatDuration(server.uptimeSeconds)} | RAM ${server.memoryMb?.rss || 0} MB | ${server.nodeEnv || '-'}`);

            setMonitorCardState(monitorDatabaseCardEl, database.ok ? 'ok' : 'critical');
            setText(monitorDatabaseStatusEl, database.ok ? 'Connected' : 'Error');
            setText(monitorDatabaseDetailEl, database.ok ? `Latency ${database.latencyMs ?? 0} ms` : (database.message || 'Database error'));

            setMonitorCardState(monitorDigiflazzCardEl, data.digiflazz?.ok === false ? 'critical' : 'ok');
            setText(monitorDigiflazzBalanceEl, formatMonitorBalance(data.digiflazz));
            setText(monitorDigiflazzDetailEl, data.digiflazz?.ok === false ? (data.digiflazz.error || 'Gagal cek saldo') : 'Snapshot saldo terbaru');

            setMonitorCardState(monitorBackupCardEl, backup?.ok === false ? 'critical' : 'ok');
            setText(monitorBackupStatusEl, backup ? (backup.ok === false ? 'Gagal' : 'OK') : 'Belum ada');
            setText(monitorBackupDetailEl, backup ? `${formatDate(backup.finishedAt || backup.startedAt || backup.updatedAt)}${backup.error ? ` | ${backup.error}` : ''}` : 'Belum ada riwayat backup');

            setText(monitorPendingPaymentsEl, String(data.payments?.pending || 0));
            setText(monitorStalePaymentsEl, String(data.payments?.stale || 0));
            setText(monitorFailedTransactionsEl, String((data.transactions?.failed24h || 0) + (data.payments?.failed24h || 0)));
            setText(monitorDisruptedProductsEl, String(data.products?.disrupted || 0));
            setText(monitorLastWebhookEl, formatDate(data.webhook?.lastReceivedAt));
            const autoSyncLastAt = autoSync.lastRun?.finishedAt || autoSync.lastRun?.startedAt || autoSync.lastRun?.updatedAt || null;
            setText(monitorProductSyncEl, autoSyncLastAt ? formatDate(autoSyncLastAt) : formatDate(data.products?.lastSyncedAt));

            renderMonitorList(monitorAlertListEl, data.alerts || [], 'Tidak ada alert penting.', 'alert');
            renderMonitorList(monitorEventListEl, data.events || [], 'Belum ada aktivitas audit.', 'event');
            setStatusElement(monitoringStatusEl, `Terakhir dicek ${formatDate(data.checkedAt)}.`, 'success', 'checkout-status');
        } catch (error) {
            setStatusElement(monitoringStatusEl, error.message || 'Gagal memuat monitoring.', 'failed', 'checkout-status');
            renderMonitorList(monitorAlertListEl, [{ level: 'critical', title: 'Monitoring gagal', message: error.message || 'Tidak bisa memuat data.' }], 'Monitoring gagal.', 'alert');
        } finally {
            if (refreshMonitoringBtn) {
                refreshMonitoringBtn.disabled = false;
                refreshMonitoringBtn.classList.remove('is-loading');
                if (refreshMonitoringBtn.dataset.originalHtml) {
                    refreshMonitoringBtn.innerHTML = refreshMonitoringBtn.dataset.originalHtml;
                    delete refreshMonitoringBtn.dataset.originalHtml;
                }
            }
        }
    }

    function setAdminPushButtonBusy(button, busy, busyLabel) {
        if (!button) return;
        if (busy) {
            if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
            button.disabled = true;
            button.classList.add('is-loading');
            button.innerHTML = `<i class="fas fa-spinner"></i> ${busyLabel}`;
            return;
        }
        button.disabled = false;
        button.classList.remove('is-loading');
        if (button.dataset.originalHtml) {
            button.innerHTML = button.dataset.originalHtml;
            delete button.dataset.originalHtml;
        }
    }

    function renderAdminPushHistory(items) {
        if (!adminPushHistoryListEl) return;
        adminPushHistoryListEl.innerHTML = '';
        if (!Array.isArray(items) || !items.length) {
            const empty = document.createElement('div');
            empty.className = 'monitor-empty';
            empty.textContent = 'Belum ada broadcast yang dikirim.';
            adminPushHistoryListEl.appendChild(empty);
            return;
        }

        items.forEach(function(item) {
            const row = document.createElement('article');
            row.className = 'admin-push-history-item';
            const content = document.createElement('div');
            const title = document.createElement('strong');
            title.textContent = item.title || 'Broadcast';
            const body = document.createElement('p');
            body.textContent = item.body || '-';
            content.appendChild(title);
            content.appendChild(body);

            const meta = document.createElement('div');
            meta.className = 'admin-push-history-meta';
            const delivery = document.createElement('span');
            delivery.textContent = `${Number(item.sent || 0)} terkirim${Number(item.failed || 0) ? `, ${Number(item.failed)} gagal` : ''}`;
            const time = document.createElement('time');
            time.dateTime = item.createdAt || '';
            time.textContent = formatDate(item.createdAt);
            meta.appendChild(delivery);
            meta.appendChild(time);

            row.appendChild(content);
            row.appendChild(meta);
            adminPushHistoryListEl.appendChild(row);
        });
    }

    async function loadAdminPushSummary() {
        setStatusElement(adminPushStatusEl, 'Memuat status Firebase...', 'loading', 'checkout-status');
        setAdminPushButtonBusy(refreshAdminPushBtn, true, 'Refresh...');
        try {
            const response = await fetch('/api/admin/push/summary', { cache: 'no-store' });
            const result = await response.json().catch(function() { return {}; });
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat status notifikasi');
            const data = result?.data || {};
            adminPushSummary = data;
            setText(adminPushConfiguredEl, data.configured ? 'Terhubung' : 'Belum aktif');
            setText(adminPushRegisteredUsersEl, `${Number(data.registeredUsers || 0)} / ${Number(data.totalUsers || 0)}`);
            setText(adminPushUserDevicesEl, String(Number(data.userDevices || 0)));
            setText(adminPushAdminDevicesEl, String(Number(data.adminDevices || 0)));
            renderAdminPushHistory(data.recentBroadcasts || []);
            const statusText = data.configured
                ? `FCM aktif. ${Number(data.userDevices || 0)} perangkat user siap menerima broadcast.`
                : (data.error || 'Firebase Cloud Messaging belum aktif.');
            setStatusElement(adminPushStatusEl, statusText, data.configured ? 'success' : 'failed', 'checkout-status');
            if (sendAdminPushTestBtn) sendAdminPushTestBtn.disabled = !data.configured || Number(data.currentAdminDevices || 0) < 1;
            if (sendAdminPushBroadcastBtn) sendAdminPushBroadcastBtn.disabled = !data.configured || Number(data.userDevices || 0) < 1;
        } catch (error) {
            adminPushSummary = null;
            setText(adminPushConfiguredEl, 'Gagal dicek');
            setStatusElement(adminPushStatusEl, error.message || 'Gagal memuat status notifikasi.', 'failed', 'checkout-status');
            renderAdminPushHistory([]);
        } finally {
            setAdminPushButtonBusy(refreshAdminPushBtn, false);
        }
    }

    async function sendAdminPushTest() {
        setAdminPushButtonBusy(sendAdminPushTestBtn, true, 'Mengirim...');
        setStatusElement(adminPushSendInfoEl, 'Mengirim notifikasi tes ke perangkat admin...', 'loading', 'checkout-status');
        try {
            const response = await fetch('/api/admin/push/test', { method: 'POST' });
            const result = await response.json().catch(function() { return {}; });
            if (!response.ok) throw new Error(result?.error || 'Notifikasi tes gagal dikirim');
            setStatusElement(adminPushSendInfoEl, `Tes berhasil dikirim ke ${Number(result?.data?.sent || 0)} perangkat admin.`, 'success', 'checkout-status');
        } catch (error) {
            setStatusElement(adminPushSendInfoEl, error.message || 'Notifikasi tes gagal dikirim.', 'failed', 'checkout-status');
        } finally {
            setAdminPushButtonBusy(sendAdminPushTestBtn, false);
        }
    }

    async function sendAdminPushBroadcast() {
        const title = String(adminPushTitleInputEl?.value || '').trim();
        const body = String(adminPushBodyInputEl?.value || '').trim();
        const path = String(adminPushPathInputEl?.value || 'user.html').trim();
        if (!title || !body) {
            setStatusElement(adminPushSendInfoEl, 'Judul dan pesan broadcast wajib diisi.', 'failed', 'checkout-status');
            return;
        }

        const targetDevices = Number(adminPushSummary?.userDevices || 0);
        const confirmed = await showConfirmDialog({
            title: 'Kirim Broadcast',
            message: `Kirim "${title}" ke ${targetDevices} perangkat user aktif?`,
            confirmText: 'Kirim Sekarang',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        setAdminPushButtonBusy(sendAdminPushBroadcastBtn, true, 'Mengirim...');
        setStatusElement(adminPushSendInfoEl, 'Mengirim broadcast ke semua perangkat user...', 'loading', 'checkout-status');
        try {
            const response = await fetch('/api/admin/push/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, path }),
            });
            const result = await response.json().catch(function() { return {}; });
            if (!response.ok) throw new Error(result?.error || 'Broadcast gagal dikirim');
            const data = result?.data || {};
            setStatusElement(
                adminPushSendInfoEl,
                `Broadcast selesai: ${Number(data.sent || 0)} terkirim, ${Number(data.failed || 0)} gagal.`,
                Number(data.failed || 0) ? 'failed' : 'success',
                'checkout-status',
            );
            adminPushBroadcastFormEl?.reset();
            await loadAdminPushSummary();
        } catch (error) {
            setStatusElement(adminPushSendInfoEl, error.message || 'Broadcast gagal dikirim.', 'failed', 'checkout-status');
        } finally {
            setAdminPushButtonBusy(sendAdminPushBroadcastBtn, false);
        }
    }

    function renderTestimonialSettings(config, adminNotification) {
        const chatId = String(config?.telegramChatId || '');
        const adminChatId = String(adminNotification?.telegramChatId || '');
        if (testimonialTelegramChatIdInputEl) testimonialTelegramChatIdInputEl.value = chatId;
        if (adminNotificationTelegramChatIdInputEl) {
            adminNotificationTelegramChatIdInputEl.value = adminChatId;
            // Saat kosong, notifikasi admin masih ikut ke grup backup. Placeholder
            // menunjukkannya supaya admin tahu ke mana notifikasinya pergi.
            adminNotificationTelegramChatIdInputEl.placeholder = !adminChatId && adminNotification?.effectiveTelegramChatId
                ? `Kosong: ikut grup backup (${adminNotification.effectiveTelegramChatId})`
                : 'Contoh: -1001234567890';
        }
        if (!testimonialInfoEl) return;
        const adminText = adminChatId
            ? `Notifikasi admin ke grup ${adminChatId}.`
            : 'Notifikasi admin masih ikut grup backup database.';
        if (!chatId) {
            setStatusElement(testimonialInfoEl, `${adminText} Grup testimoni belum diisi.`, '', 'checkout-status');
        } else if (!config?.hasBotToken) {
            setStatusElement(testimonialInfoEl, 'Chat ID tersimpan, tapi bot token Telegram di atas belum diisi.', 'failed', 'checkout-status');
        } else {
            setStatusElement(testimonialInfoEl, `${adminText} Testimoni aktif ke grup ${chatId}.`, 'success', 'checkout-status');
        }
    }

    async function saveTestimonialSettings() {
        const chatId = String(testimonialTelegramChatIdInputEl?.value || '').trim();
        const adminChatId = String(adminNotificationTelegramChatIdInputEl?.value || '').trim();
        setAdminPushButtonBusy(saveTestimonialSettingsBtn, true, 'Menyimpan...');
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adminNotificationTelegramChatId: adminChatId,
                    testimonialTelegramChatId: chatId,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menyimpan grup notifikasi');
            renderTestimonialSettings(result?.data?.testimonial || {}, result?.data?.adminNotification || {});
        } catch (error) {
            setStatusElement(testimonialInfoEl, error.message || 'Gagal menyimpan grup notifikasi.', 'failed', 'checkout-status');
        } finally {
            setAdminPushButtonBusy(saveTestimonialSettingsBtn, false);
        }
    }

    async function sendTestimonialTest() {
        setAdminPushButtonBusy(sendTestimonialTestBtn, true, 'Mengirim...');
        try {
            const response = await fetch('/api/admin/testimonial/test', { method: 'POST' });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal mengirim pesan contoh');
            setStatusElement(testimonialInfoEl, result.message || 'Pesan contoh terkirim.', 'success', 'checkout-status');
        } catch (error) {
            setStatusElement(testimonialInfoEl, error.message || 'Gagal mengirim pesan contoh.', 'failed', 'checkout-status');
        } finally {
            setAdminPushButtonBusy(sendTestimonialTestBtn, false);
        }
    }

    function renderBackupInfo(backup) {
        if (!backupInfoEl) return;
        const isRunning = Boolean(backup?.isRunning);
        const autoEnabled = backup?.autoEnabled !== false;
        const intervalHours = Number(backup?.intervalHours || 3);
        const lastRun = backup?.lastRun || null;

        let statusText = `Auto backup: ${autoEnabled ? 'Aktif' : 'Nonaktif'} (interval ${intervalHours} jam).`;
        if (isRunning) {
            statusText += ' Saat ini backup sedang berjalan.';
        }

        if (lastRun?.updatedAt || lastRun?.finishedAt) {
            const lastAt = formatDate(lastRun.finishedAt || lastRun.updatedAt);
            if (lastRun.ok) {
                statusText += ` Backup terakhir berhasil pada ${lastAt}.`;
            } else {
                statusText += ` Backup terakhir gagal pada ${lastAt}: ${lastRun.error || '-'}.`;
            }
        }
        backupInfoEl.textContent = statusText;
    }

    // Admin perlu melihat batas yang sedang berlaku, bukan hanya angka jarak
    // amannya, supaya langsung paham kenapa produk mahal tidak muncul di user.
    function renderDigiflazzProductLimitInfo(config = {}) {
        if (digiflazzProductLimitEnabledInputEl) {
            digiflazzProductLimitEnabledInputEl.checked = config?.enabled !== false;
        }
        if (digiflazzProductLimitMarginInputEl) {
            digiflazzProductLimitMarginInputEl.value = String(Math.max(0, Number(config?.safetyMargin || 0)));
        }
        if (!digiflazzProductLimitInfoEl) return;

        if (config?.enabled === false) {
            digiflazzProductLimitInfoEl.textContent = 'Penyaringan mati, semua produk tampil di halaman user apa pun saldonya.';
            return;
        }
        if (config?.maxProductCost === null || config?.maxProductCost === undefined) {
            digiflazzProductLimitInfoEl.textContent = 'Saldo Digiflazz belum bisa dibaca, jadi untuk sementara semua produk tetap tampil.';
            return;
        }
        digiflazzProductLimitInfoEl.textContent = `Saldo ${config.balanceFormatted || '-'} dikurangi jarak aman ${config.safetyMarginFormatted || '-'}, jadi produk dengan modal di atas ${config.maxProductCostFormatted || '-'} disembunyikan dari halaman user.`;
    }

    function renderDigiflazzBalanceWarningInfo(config = {}) {
        const threshold = Number(config?.threshold || 0);
        const lastInfo = config?.lastInfo || null;
        if (digiflazzBalanceWarningThresholdInputEl) {
            digiflazzBalanceWarningThresholdInputEl.value = String(Math.max(0, threshold));
        }
        if (digiflazzBalanceWarningTelegramChatIdInputEl) {
            digiflazzBalanceWarningTelegramChatIdInputEl.value = String(config?.telegramChatId || '');
            digiflazzBalanceWarningTelegramChatIdInputEl.placeholder = config?.usesFallbackChatId && config?.effectiveTelegramChatId
                ? `Fallback grup utama: ${config.effectiveTelegramChatId}`
                : 'Contoh: -1001234567890';
        }
        if (!digiflazzBalanceStatusTextEl || lastInfo?.balance === undefined || lastInfo?.balance === null) return;

        const checkedAt = lastInfo.checkedAt ? formatDate(lastInfo.checkedAt) : '-';
        const stateText = lastInfo.state === 'LOW'
            ? `Terakhir rendah: ${formatRupiah(Number(lastInfo.balance || 0))} pada ${checkedAt}.`
            : `Terakhir aman: ${formatRupiah(Number(lastInfo.balance || 0))} pada ${checkedAt}.`;
        digiflazzBalanceStatusTextEl.textContent = stateText;
    }

    function renderDigiflazzBalanceSnapshot(snapshot = {}) {
        const balance = Number(snapshot?.balance);
        const snapshotThreshold = Number(snapshot?.threshold);
        const inputThreshold = Number(digiflazzBalanceWarningThresholdInputEl?.value || 0);
        const threshold = Number.isFinite(snapshotThreshold) ? snapshotThreshold : inputThreshold;
        const hasBalance = Number.isFinite(balance);
        if (digiflazzCurrentBalanceTextEl) {
            digiflazzCurrentBalanceTextEl.textContent = hasBalance ? formatRupiah(balance) : '-';
        }
        if (!digiflazzBalanceStatusTextEl) return;

        const checkedAt = snapshot?.checkedAt ? formatDate(snapshot.checkedAt) : '-';
        if (!hasBalance) {
            digiflazzBalanceStatusTextEl.textContent = 'Saldo belum bisa dibaca dari Digiflazz.';
            return;
        }
        if (threshold <= 0) {
            digiflazzBalanceStatusTextEl.textContent = `Saldo terbaca ${formatRupiah(balance)}. Peringatan saldo rendah nonaktif. Cek: ${checkedAt}.`;
            return;
        }
        if (threshold > 0 && balance < threshold) {
            const warning = snapshot?.warning || {};
            const warningText = warning.sent
                ? 'Peringatan Telegram sudah dikirim.'
                : (warning.reason === 'cooldown'
                    ? 'Peringatan tidak dikirim ulang karena masih dalam cooldown.'
                    : 'Saldo di bawah batas.');
            digiflazzBalanceStatusTextEl.textContent = `Saldo rendah. Batas ${formatRupiah(threshold)}. ${warningText} Cek: ${checkedAt}.`;
            return;
        }
        digiflazzBalanceStatusTextEl.textContent = `Saldo aman. Batas ${formatRupiah(threshold)}. Cek: ${checkedAt}.`;
    }

    function normalizeAdminProductPricing(config = {}) {
        const flat = Number(config.flatMarginUnder30000 ?? config.productMarkupFee ?? 1000);
        const midBps = Number(config.midMarginBps ?? 200);
        const highBps = Number(config.highMarginBps ?? 150);
        const qrisBps = Number(config.qrisFeeBps ?? 70);
        return {
            flatMarginUnder30000: Number.isFinite(flat) && flat >= 0 ? Math.trunc(flat) : 1000,
            midMarginPercent: String(config.midMarginPercent ?? (Number.isFinite(midBps) ? midBps / 100 : 2)),
            highMarginPercent: String(config.highMarginPercent ?? (Number.isFinite(highBps) ? highBps / 100 : 1.5)),
            qrisFeeEnabled: config.qrisFeeEnabled !== false,
            qrisFeePercent: String(config.qrisFeePercent ?? (Number.isFinite(qrisBps) ? qrisBps / 100 : 0.7)),
        };
    }

    function applyProductPricingFields(config = {}) {
        const pricing = normalizeAdminProductPricing(config);
        if (productFlatMarginInputEl) productFlatMarginInputEl.value = String(pricing.flatMarginUnder30000);
        if (productMidMarginPercentInputEl) productMidMarginPercentInputEl.value = String(pricing.midMarginPercent);
        if (productHighMarginPercentInputEl) productHighMarginPercentInputEl.value = String(pricing.highMarginPercent);
        if (productQrisFeeEnabledInputEl) productQrisFeeEnabledInputEl.checked = Boolean(pricing.qrisFeeEnabled);
        if (productQrisFeePercentInputEl) productQrisFeePercentInputEl.value = String(pricing.qrisFeePercent);
        return pricing;
    }

    function getProductPricingSummary(config = {}) {
        const pricing = normalizeAdminProductPricing(config);
        const qrisText = pricing.qrisFeeEnabled ? `QRIS ${pricing.qrisFeePercent}%` : 'QRIS nonaktif';
        return `Margin: <30rb ${formatRupiah(pricing.flatMarginUnder30000)}, 30-100rb ${pricing.midMarginPercent}%, >100rb ${pricing.highMarginPercent}%, ${qrisText}`;
    }

    function normalizeProductAutoSync(config = {}) {
        return {
            enabled: config.enabled !== false,
            time: /^\d{2}:\d{2}$/.test(String(config.time || '')) ? String(config.time) : '00:00',
            timeZone: String(config.timeZone || 'Asia/Jakarta').trim() || 'Asia/Jakarta',
            lastRun: config.lastRun || null,
            hasRunToday: Boolean(config.hasRunToday),
        };
    }

    function applyProductAutoSyncFields(config = {}) {
        const safeConfig = normalizeProductAutoSync(config);
        if (productAutoSyncEnabledInputEl) productAutoSyncEnabledInputEl.checked = safeConfig.enabled;
        if (productAutoSyncTimeInputEl) productAutoSyncTimeInputEl.value = safeConfig.time;
        if (productAutoSyncTimezoneInputEl) productAutoSyncTimezoneInputEl.value = safeConfig.timeZone;
        renderProductAutoSyncInfo(safeConfig);
        return safeConfig;
    }

    function renderProductAutoSyncInfo(config = {}) {
        if (!productAutoSyncInfoEl) return;
        const safeConfig = normalizeProductAutoSync(config);
        const lastRun = safeConfig.lastRun || null;
        const statusText = safeConfig.enabled
            ? `Aktif setiap ${safeConfig.time} (${safeConfig.timeZone}).`
            : 'Autosync produk nonaktif.';
        if (!lastRun) {
            productAutoSyncInfoEl.textContent = `${statusText} Belum ada riwayat autosync.`;
            return;
        }
        const runAt = formatDate(lastRun.finishedAt || lastRun.startedAt);
        if (lastRun.ok) {
            productAutoSyncInfoEl.textContent = `${statusText} Terakhir sukses ${runAt}: ${lastRun.total || 0} produk, ${lastRun.active || 0} aktif.`;
            return;
        }
        productAutoSyncInfoEl.textContent = `${statusText} Terakhir gagal ${runAt}: ${lastRun.error || '-'}.`;
    }

    function normalizeAdminCutOff(cutOff = {}) {
        return {
            enabled: cutOff.enabled !== false,
            startTime: /^\d{2}:\d{2}$/.test(String(cutOff.startTime || '')) ? String(cutOff.startTime) : '23:30',
            endTime: /^\d{2}:\d{2}$/.test(String(cutOff.endTime || '')) ? String(cutOff.endTime) : '00:30',
            timeZone: String(cutOff.timeZone || 'Asia/Jakarta').trim() || 'Asia/Jakarta',
            message: String(cutOff.message || '').trim(),
            isActive: Boolean(cutOff.isActive),
        };
    }

    function applyAdminCutOffFields(cutOff = {}) {
        const safeCutOff = normalizeAdminCutOff(cutOff);
        if (dailyCutOffEnabledInputEl) dailyCutOffEnabledInputEl.checked = safeCutOff.enabled;
        if (dailyCutOffStartInputEl) dailyCutOffStartInputEl.value = safeCutOff.startTime;
        if (dailyCutOffEndInputEl) dailyCutOffEndInputEl.value = safeCutOff.endTime;
        if (dailyCutOffTimezoneInputEl) dailyCutOffTimezoneInputEl.value = safeCutOff.timeZone;
        if (dailyCutOffMessageInputEl) dailyCutOffMessageInputEl.value = safeCutOff.message;
        return safeCutOff;
    }

    function getAdminCutOffSummary(cutOff = {}) {
        const safeCutOff = normalizeAdminCutOff(cutOff);
        if (!safeCutOff.enabled) return 'Cut off: Nonaktif';
        return `Cut off: ${safeCutOff.startTime}-${safeCutOff.endTime} (${safeCutOff.isActive ? 'Aktif sekarang' : 'Standby'})`;
    }

    async function loadDigiflazzBalanceSnapshot() {
        if (!digiflazzCurrentBalanceTextEl && !digiflazzBalanceStatusTextEl) return;
        if (refreshDigiflazzBalanceBtn) refreshDigiflazzBalanceBtn.disabled = true;
        if (digiflazzCurrentBalanceTextEl) digiflazzCurrentBalanceTextEl.textContent = 'Memuat...';
        if (digiflazzBalanceStatusTextEl) digiflazzBalanceStatusTextEl.textContent = 'Mengambil saldo Digiflazz...';

        try {
            const response = await fetch('/api/admin/digiflazz/balance?notify=true');
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal mengambil saldo Digiflazz');
            }
            renderDigiflazzBalanceSnapshot(result?.data || {});
        } catch (error) {
            if (digiflazzCurrentBalanceTextEl) digiflazzCurrentBalanceTextEl.textContent = '-';
            if (digiflazzBalanceStatusTextEl) {
                digiflazzBalanceStatusTextEl.textContent = error.message || 'Gagal mengambil saldo Digiflazz.';
            }
        } finally {
            if (refreshDigiflazzBalanceBtn) refreshDigiflazzBalanceBtn.disabled = false;
        }
    }

    function getDevelopmentAllowedText(development = {}) {
        const identities = Array.isArray(development.allowedIdentities)
            ? development.allowedIdentities
            : String(development.allowedIdentities || '').split(/[\n,;]/);
        return identities.map(function(item) {
            return String(item || '').trim();
        }).filter(Boolean).join('\n');
    }

    function renderDevelopmentInfo(development = {}) {
        if (!developmentSettingsInfoEl) return;
        const enabled = Boolean(development.enabled);
        const count = getDevelopmentAllowedText(development).split('\n').filter(Boolean).length;
        developmentSettingsInfoEl.textContent = enabled
            ? `Aktif. ${count} email/username diizinkan. Admin tetap bisa login.`
            : 'Mode development nonaktif.';
    }

    function renderRestoreInfo(restore) {
        if (!restoreInfoEl) return;
        const isRunning = Boolean(restore?.isRunning);
        const maxUploadMb = Number(restore?.maxUploadMb || 300);
        const lastRun = restore?.lastRun || null;
        let statusText = `Upload file .dump maksimal ${maxUploadMb} MB.`;
        if (isRunning) {
            statusText += ' Restore sedang berjalan.';
        }
        if (lastRun?.updatedAt || lastRun?.finishedAt) {
            const atText = formatDate(lastRun.finishedAt || lastRun.updatedAt);
            if (lastRun.ok) {
                statusText += ` Restore terakhir berhasil pada ${atText}.`;
            } else {
                statusText += ` Restore terakhir gagal pada ${atText}: ${lastRun.error || '-'}.`;
            }
        }
        restoreInfoEl.textContent = statusText;
    }

    function renderBackupFiles(files) {
        if (!backupFileListEl) return;
        backupFileListEl.innerHTML = '';

        if (!Array.isArray(files) || !files.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada file backup.');
            cell.colSpan = 4;
            row.appendChild(cell);
            backupFileListEl.appendChild(row);
            return;
        }

        files.forEach(function(file) {
            const row = document.createElement('tr');
            const nameCell = createCell(file.fileName || '-');
            nameCell.dataset.label = 'Nama File';
            row.appendChild(nameCell);

            const sizeCell = createCell(formatBytes(file.sizeBytes));
            sizeCell.dataset.label = 'Ukuran';
            row.appendChild(sizeCell);

            const modifiedCell = createCell(formatDate(file.modifiedAt));
            modifiedCell.dataset.label = 'Terakhir Diubah';
            row.appendChild(modifiedCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'btn-secondary';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
            downloadBtn.dataset.backupRelativePath = file.relativePath || '';
            actionCell.appendChild(downloadBtn);
            row.appendChild(actionCell);

            backupFileListEl.appendChild(row);
        });
    }

    async function loadBackupFiles() {
        if (!backupFileListEl) return;
        backupFileListEl.innerHTML = '';
        const loadingRow = document.createElement('tr');
        const loadingCell = createCell('Memuat daftar backup...');
        loadingCell.colSpan = 4;
        loadingRow.appendChild(loadingCell);
        backupFileListEl.appendChild(loadingRow);

        try {
            const response = await fetch('/api/admin/backup/files');
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal memuat file backup');
            }
            renderBackupFiles(Array.isArray(result?.data) ? result.data : []);
        } catch (error) {
            backupFileListEl.innerHTML = '';
            const row = document.createElement('tr');
            const cell = createCell(error.message || 'Gagal memuat file backup');
            cell.colSpan = 4;
            row.appendChild(cell);
            backupFileListEl.appendChild(row);
        }
    }

    function createCell(text) {
        const cell = document.createElement('td');
        cell.textContent = text;
        return cell;
    }

    function showAdminDetailDialog(titleText, rows, actionBuilder) {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay transaction-detail-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog transaction-detail-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-label', titleText || 'Detail');

        const head = document.createElement('div');
        head.className = 'transaction-detail-head';
        const title = document.createElement('h3');
        title.textContent = titleText || 'Detail';
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'app-toast-close';
        closeBtn.setAttribute('aria-label', 'Tutup detail');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        head.appendChild(title);
        head.appendChild(closeBtn);
        dialog.appendChild(head);

        const grid = document.createElement('div');
        grid.className = 'transaction-detail-grid';
        rows.forEach(function(row) {
            const label = document.createElement('span');
            label.textContent = row[0] || '-';
            const value = document.createElement('strong');
            value.textContent = row[1] || '-';
            grid.appendChild(label);
            grid.appendChild(value);
        });
        dialog.appendChild(grid);

        const actions = document.createElement('div');
        actions.className = 'confirm-actions';
        const doneBtn = document.createElement('button');
        doneBtn.type = 'button';
        doneBtn.className = 'btn-secondary';
        doneBtn.textContent = 'Tutup';
        actions.appendChild(doneBtn);
        if (typeof actionBuilder === 'function') {
            const extra = actionBuilder();
            if (extra) actions.appendChild(extra);
        }
        dialog.appendChild(actions);

        const cleanup = function() {
            document.removeEventListener('keydown', onEsc);
            overlay.remove();
        };
        const onEsc = function(e) {
            if (e.key === 'Escape') cleanup();
        };

        closeBtn.addEventListener('click', cleanup);
        doneBtn.addEventListener('click', cleanup);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) cleanup();
        });
        document.addEventListener('keydown', onEsc);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        doneBtn.focus();
    }

    function normalizeFilterValue(value, fallbackLabel) {
        return String(value || '').trim() || fallbackLabel;
    }

    function createFilterChip(type, value, label, count, isActive) {
        const button = document.createElement('button');
        button.className = isActive ? 'filter-chip active' : 'filter-chip';
        button.type = 'button';
        button.dataset.filterType = type;
        button.dataset.filterValue = value;
        button.textContent = `${label} (${count})`;
        return button;
    }

    function closeFancyFilterSelect(exceptHost) {
        document.querySelectorAll('.fancy-filter-select.open').forEach(function(host) {
            if (exceptHost && host === exceptHost) return;
            host.classList.remove('open');
            const trigger = host.querySelector('.fancy-filter-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
        if (!exceptHost || !exceptHost.classList.contains('open')) {
            activeFancyFilterEl = null;
        }
    }

    function renderFancyFilterSelect(nativeSelectEl, hostEl, fallbackLabel) {
        if (!nativeSelectEl || !hostEl) return;
        hostEl.innerHTML = '';
        hostEl.classList.remove('open');

        const selectedOption = nativeSelectEl.options[nativeSelectEl.selectedIndex] || null;
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'fancy-filter-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const triggerText = document.createElement('span');
        triggerText.className = 'fancy-filter-trigger-text';
        triggerText.textContent = selectedOption?.textContent || fallbackLabel || 'Pilih';
        trigger.appendChild(triggerText);

        const triggerIcon = document.createElement('i');
        triggerIcon.className = 'fas fa-chevron-down';
        trigger.appendChild(triggerIcon);

        const menu = document.createElement('div');
        menu.className = 'fancy-filter-menu';
        menu.setAttribute('role', 'listbox');
        menu.setAttribute('tabindex', '-1');

        Array.from(nativeSelectEl.options).forEach(function(option) {
            const optionBtn = document.createElement('button');
            optionBtn.type = 'button';
            optionBtn.className = option.selected ? 'fancy-filter-option active' : 'fancy-filter-option';
            optionBtn.setAttribute('role', 'option');
            optionBtn.setAttribute('aria-selected', option.selected ? 'true' : 'false');
            optionBtn.textContent = option.textContent;
            optionBtn.addEventListener('click', function() {
                nativeSelectEl.value = option.value;
                nativeSelectEl.dispatchEvent(new Event('change', { bubbles: true }));
                closeFancyFilterSelect();
            });
            menu.appendChild(optionBtn);
        });

        trigger.addEventListener('click', function() {
            const willOpen = !hostEl.classList.contains('open');
            closeFancyFilterSelect(hostEl);
            hostEl.classList.toggle('open', willOpen);
            trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
            activeFancyFilterEl = willOpen ? hostEl : null;
            if (willOpen) {
                const activeOption = menu.querySelector('.fancy-filter-option.active');
                if (activeOption) activeOption.scrollIntoView({ block: 'nearest' });
            }
        });

        hostEl.appendChild(trigger);
        hostEl.appendChild(menu);
    }

    function renderAdminStaticFancyFilters() {
        renderFancyFilterSelect(txStatusEl, txStatusCustomEl, 'Semua status');
        renderFancyFilterSelect(payTypeFilterEl, payTypeFilterCustomEl, 'Semua jenis');
        renderFancyFilterSelect(payStatusFilterEl, payStatusFilterCustomEl, 'Semua status');
    }

    function countByValue(items, getter) {
        return items.reduce(function(map, item) {
            const key = getter(item);
            map[key] = (map[key] || 0) + 1;
            return map;
        }, {});
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function showConfirmDialog(options) {
        return new Promise(function(resolve) {
            const title = String(options?.title || 'Konfirmasi');
            const message = String(options?.message || 'Lanjutkan?');
            const confirmText = String(options?.confirmText || 'Iya');
            const cancelText = String(options?.cancelText || 'Batal');
            const passwordInput = Boolean(options?.passwordInput);
            const passwordLabel = String(options?.passwordLabel || 'Password admin');

            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';

            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
            dialog.setAttribute('role', 'dialog');
            dialog.setAttribute('aria-modal', 'true');
            dialog.setAttribute('aria-label', title);

            const heading = document.createElement('h3');
            heading.textContent = title;
            dialog.appendChild(heading);

            const text = document.createElement('p');
            text.textContent = message;
            dialog.appendChild(text);

            let passwordField = null;
            if (passwordInput) {
                const fieldWrap = document.createElement('label');
                fieldWrap.className = 'confirm-field';
                const labelText = document.createElement('span');
                labelText.textContent = passwordLabel;
                passwordField = document.createElement('input');
                passwordField.type = 'password';
                passwordField.autocomplete = 'current-password';
                passwordField.placeholder = 'Masukkan password admin';
                fieldWrap.appendChild(labelText);
                fieldWrap.appendChild(passwordField);
                dialog.appendChild(fieldWrap);
            }

            const actions = document.createElement('div');
            actions.className = 'confirm-actions';

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn-secondary';
            cancelBtn.textContent = cancelText;

            const confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            confirmBtn.className = 'btn-primary';
            confirmBtn.textContent = confirmText;

            actions.appendChild(cancelBtn);
            actions.appendChild(confirmBtn);
            dialog.appendChild(actions);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            const onEsc = function(e) {
                if (e.key === 'Escape') {
                    cleanup(false);
                }
            };
            const cleanup = function(result) {
                document.removeEventListener('keydown', onEsc);
                overlay.remove();
                resolve(result);
            };

            cancelBtn.addEventListener('click', function() {
                cleanup(passwordInput ? { confirmed: false, password: '' } : false);
            });
            confirmBtn.addEventListener('click', function() {
                if (passwordInput) {
                    const password = String(passwordField?.value || '');
                    if (!password) {
                        passwordField?.focus();
                        return;
                    }
                    cleanup({ confirmed: true, password });
                    return;
                }
                cleanup(true);
            });
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) cleanup(passwordInput ? { confirmed: false, password: '' } : false);
            });
            document.addEventListener('keydown', onEsc);
            if (passwordInput) {
                setTimeout(function() { passwordField?.focus(); }, 50);
            } else {
                cancelBtn.focus();
            }
        });
    }

    function getJsPdfCtor() {
        return window.jspdf?.jsPDF || null;
    }

    function downloadReceiptAsPdf(options) {
        const JsPDF = getJsPdfCtor();
        if (!JsPDF) return false;

        const title = String(options?.title || 'Nota');
        const subtitle = String(options?.subtitle || '1FORCR KUOTA');
        const statusLabel = String(options?.status || 'Proses');
        const rows = Array.isArray(options?.rows) ? options.rows : [];
        const filename = String(options?.filename || 'nota.pdf');
        const footerLines = Array.isArray(options?.footerLines) ? options.footerLines : [];

        const doc = new JsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 40;
        const contentWidth = pageWidth - (marginX * 2);
        const labelWidth = 150;
        const valueWidth = contentWidth - labelWidth - 14;
        let y = 36;

        const ensureSpace = function(spaceNeeded) {
            if (y + spaceNeeded <= pageHeight - 40) return;
            doc.addPage();
            y = 40;
        };

        doc.setFillColor(44, 62, 80);
        doc.rect(marginX, y, contentWidth, 58, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(title, marginX + 14, y + 24);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(subtitle, marginX + 14, y + 42);
        y += 76;

        doc.setTextColor(35, 47, 62);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(`Status: ${statusLabel}`, marginX, y);
        y += 16;

        doc.setDrawColor(225, 232, 240);
        doc.line(marginX, y, marginX + contentWidth, y);
        y += 14;

        rows.forEach(function(row) {
            const label = String(row?.[0] || '-');
            const value = String(row?.[1] || '-');
            const wrappedValue = doc.splitTextToSize(value, valueWidth);
            const rowHeight = Math.max(16, wrappedValue.length * 13) + 4;
            ensureSpace(rowHeight + 10);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.text(label, marginX, y);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            doc.text(wrappedValue, marginX + labelWidth, y);

            y += rowHeight;
            doc.setDrawColor(241, 245, 249);
            doc.line(marginX, y - 6, marginX + contentWidth, y - 6);
        });

        if (footerLines.length) {
            ensureSpace((footerLines.length * 14) + 16);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            footerLines.forEach(function(line) {
                const wrapped = doc.splitTextToSize(String(line || ''), contentWidth);
                doc.text(wrapped, marginX, y);
                y += Math.max(14, wrapped.length * 13);
            });
        }

        doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
        return true;
    }

    function getDateKey(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function mapTransactionStatus(status) {
        const value = String(status || '').toUpperCase();
        if (value === 'SUCCESS' || value === 'SUKSES') return { label: 'Sukses', className: 'success' };
        if (value === 'FAILED' || value === 'GAGAL') return { label: 'Gagal', className: 'failed' };
        return { label: 'Proses', className: 'pending' };
    }

    function mapPaymentStatus(status) {
        const value = String(status || '').toUpperCase();
        if (value === 'SUCCESS') return { group: 'SUCCESS', label: 'Sukses', className: 'success', detail: 'Berhasil' };
        if (['WAITING_PAYMENT', 'PAID', 'PROCESSING'].includes(value)) {
            const detailMap = {
                WAITING_PAYMENT: 'Menunggu bayar',
                PAID: 'Pembayaran diterima',
                PROCESSING: 'Diproses',
            };
            return { group: 'PROCESS', label: 'Proses', className: 'pending', detail: detailMap[value] || 'Proses' };
        }
        if (['FAILED', 'EXPIRED', 'CANCELED', 'REFUNDED'].includes(value)) {
            const detailMap = {
                FAILED: 'Gagal',
                EXPIRED: 'Kedaluwarsa',
                CANCELED: 'Dibatalkan',
                REFUNDED: 'Refund ke saldo',
            };
            return { group: 'FAILED', label: 'Gagal', className: 'failed', detail: detailMap[value] || 'Gagal' };
        }
        return { group: 'PROCESS', label: 'Proses', className: 'pending', detail: value || 'Proses' };
    }

    function getPaymentTypeLabel(type) {
        if (type === 'WALLET_TOPUP') return 'Topup Saldo';
        return 'Pembelian Produk';
    }

    function getPaymentMethodLabel(method) {
        if (method === 'WALLET_BALANCE') return 'Saldo';
        return 'QRIS';
    }

    function buildPaymentReceiptHtml(payment) {
        const dateTime = formatDate(payment.createdAt);
        const statusInfo = mapPaymentStatus(payment.status);
        const typeLabel = getPaymentTypeLabel(payment.type);
        const methodLabel = getPaymentMethodLabel(payment.method);
        const isTopup = String(payment.type || '') === 'WALLET_TOPUP';
        const transactionInfo = isTopup
            ? 'Topup Saldo 1FORCR KUOTA'
            : 'Pembelian Produk 1FORCR KUOTA';
        const userName = payment?.user?.username || payment?.user?.email || '-';
        const userEmail = payment?.user?.email || '-';
        const code = [payment.orderCode, payment.refId].filter(Boolean).join(' / ') || '-';
        const amount = formatRupiah(Number(payment.amount || 0));
        const productName = payment.productName || '-';
        const buyerSkuCode = payment.buyerSkuCode || '-';
        const customerNo = payment.customerNo || '-';
        const detail = payment.message || statusInfo.detail || '-';
        const settledAt = formatDate(payment.paymentSettledAt);
        const processedAt = formatDate(payment.digiflazzExecutedAt);
        const refundedAt = formatDate(payment.refundedAt);
        const qrisTrxId = payment.qrisTransactionId || '-';
        const qrisOrderId = payment.qrisOrderId || '-';
        const digiflazzRc = payment.digiflazzRc || '-';
        const statusColor = statusInfo.className === 'success'
            ? '#0f766e'
            : statusInfo.className === 'failed'
                ? '#b91c1c'
                : '#92400e';
        const statusBg = statusInfo.className === 'success'
            ? '#ccfbf1'
            : statusInfo.className === 'failed'
                ? '#fee2e2'
                : '#fef3c7';

        return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nota ${escapeHtml(payment.orderCode || payment.refId || '-')}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; background:#f8fafc; }
    .receipt { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background:#fff; }
    .head { padding: 20px; border-bottom: 1px solid #e5e7eb; }
    h1 { margin: 0 0 4px; font-size: 24px; }
    .sub { margin: 0; color: #64748b; font-size: 13px; }
    .body { padding: 20px; }
    .status { display:inline-block; padding: 6px 10px; border-radius: 999px; font-weight: 700; color: ${statusColor}; background: ${statusBg}; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td { padding: 9px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    td:first-child { width: 38%; color: #6b7280; }
    .foot { padding: 14px 20px 18px; border-top: 1px solid #e5e7eb; background: #f8fafc; }
    .foot p { margin: 0 0 6px; color: #475569; font-size: 13px; }
    .foot a { color: #1d4ed8; text-decoration: none; }
    @media print { body { padding: 0; background:#fff; } .receipt { border: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="head">
      <h1>Nota Pembayaran</h1>
      <p class="sub">1FORCR KUOTA</p>
    </div>
    <div class="body">
      <span class="status">${escapeHtml(statusInfo.label)}</span>
      <table>
        <tr><td>Informasi</td><td>${escapeHtml(transactionInfo)}</td></tr>
        <tr><td>Tanggal & Jam</td><td>${escapeHtml(dateTime)}</td></tr>
        <tr><td>Jenis</td><td>${escapeHtml(typeLabel)}</td></tr>
        <tr><td>Metode</td><td>${escapeHtml(methodLabel)}</td></tr>
        <tr><td>User</td><td>${escapeHtml(userName)}</td></tr>
        <tr><td>Email</td><td>${escapeHtml(userEmail)}</td></tr>
        <tr><td>Kode</td><td>${escapeHtml(code)}</td></tr>
        <tr><td>Nominal</td><td>${escapeHtml(amount)}</td></tr>
        <tr><td>Produk</td><td>${escapeHtml(productName)}</td></tr>
        <tr><td>SKU</td><td>${escapeHtml(buyerSkuCode)}</td></tr>
        <tr><td>Tujuan</td><td>${escapeHtml(customerNo)}</td></tr>
        <tr><td>Status</td><td>${escapeHtml(statusInfo.label)}</td></tr>
        <tr><td>Kode Response Digiflazz</td><td>${escapeHtml(digiflazzRc)}</td></tr>
        <tr><td>Detail</td><td>${escapeHtml(detail)}</td></tr>
        <tr><td>Waktu Pembayaran</td><td>${escapeHtml(settledAt)}</td></tr>
        <tr><td>Waktu Proses Produk</td><td>${escapeHtml(processedAt)}</td></tr>
        <tr><td>Waktu Refund</td><td>${escapeHtml(refundedAt)}</td></tr>
        <tr><td>QRIS Transaction ID</td><td>${escapeHtml(qrisTrxId)}</td></tr>
        <tr><td>QRIS Order ID</td><td>${escapeHtml(qrisOrderId)}</td></tr>
      </table>
    </div>
    <div class="foot">
      <p><strong>Website:</strong> <a href="${escapeHtml(receiptWebsiteUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(receiptWebsiteUrl)}</a></p>
      <p>${escapeHtml(receiptAdText)}</p>
    </div>
  </div>
</body>
</html>`;
    }

    function downloadPaymentReceipt(payment) {
        const statusInfo = mapPaymentStatus(payment.status);
        const rows = [
            ['Informasi', String(payment.type || '') === 'WALLET_TOPUP' ? 'Topup Saldo 1FORCR KUOTA' : 'Pembelian Produk 1FORCR KUOTA'],
            ['Tanggal & Jam', formatDate(payment.createdAt)],
            ['Jenis', getPaymentTypeLabel(payment.type)],
            ['Metode', getPaymentMethodLabel(payment.method)],
            ['User', payment?.user?.username || payment?.user?.email || '-'],
            ['Email', payment?.user?.email || '-'],
            ['Kode', [payment.orderCode, payment.refId].filter(Boolean).join(' / ') || '-'],
            ['Nominal', formatRupiah(Number(payment.amount || 0))],
            ['Produk', payment.productName || '-'],
            ['SKU', payment.buyerSkuCode || '-'],
            ['Tujuan', payment.customerNo || '-'],
            ['Kode Response Digiflazz', payment.digiflazzRc || '-'],
            ['Detail', payment.message || statusInfo.detail || '-'],
            ['Waktu Pembayaran', formatDate(payment.paymentSettledAt)],
            ['Waktu Proses Produk', formatDate(payment.digiflazzExecutedAt)],
            ['Waktu Refund', formatDate(payment.refundedAt)],
            ['QRIS Transaction ID', payment.qrisTransactionId || '-'],
            ['QRIS Order ID', payment.qrisOrderId || '-'],
        ];
        const downloaded = downloadReceiptAsPdf({
            title: 'Nota Pembayaran',
            subtitle: '1FORCR KUOTA',
            status: statusInfo.label,
            rows,
            filename: `nota-${payment.orderCode || payment.refId || 'pembayaran'}.pdf`,
            footerLines: [
                `Website: ${receiptWebsiteUrl}`,
                receiptAdText,
            ],
        });
        if (downloaded) return;

        const content = buildPaymentReceiptHtml(payment);
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nota-${payment.orderCode || payment.refId || 'pembayaran'}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function normalizeTransactionStatus(status) {
        const value = String(status || '').toUpperCase();
        if (value === 'SUCCESS' || value === 'SUKSES') return 'SUCCESS';
        if (value === 'FAILED' || value === 'GAGAL') return 'FAILED';
        return 'PROCESS';
    }

    function buildReceiptHtml(transaction) {
        const dateTime = formatDate(transaction.createdAt);
        const statusInfo = mapTransactionStatus(transaction.status);
        const userName = transaction?.user?.username || transaction?.user?.email || '-';
        const userEmail = transaction?.user?.email || '-';
        const productName = transaction.productName || transaction.buyerSkuCode || '-';
        const customerNo = transaction.customerNo || '-';
        const price = formatRupiah(typeof transaction.price === 'number' ? transaction.price : Number(transaction.price));
        const serialNumber = transaction.serialNumber || '-';
        const message = transaction.message || '-';
        const rc = transaction.rc || '-';
        const statusColor = statusInfo.className === 'success'
            ? '#0f766e'
            : statusInfo.className === 'failed'
                ? '#b91c1c'
                : '#92400e';
        const statusBg = statusInfo.className === 'success'
            ? '#ccfbf1'
            : statusInfo.className === 'failed'
                ? '#fee2e2'
                : '#fef3c7';

        return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Struk ${escapeHtml(transaction.refId || '-')}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; background:#f8fafc; }
    .receipt { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background:#fff; }
    .head { padding: 20px; border-bottom: 1px solid #e5e7eb; }
    h1 { margin: 0 0 4px; font-size: 24px; }
    .sub { margin: 0; color: #64748b; font-size: 13px; }
    .body { padding: 20px; }
    .status { display:inline-block; padding: 6px 10px; border-radius: 999px; font-weight: 700; color: ${statusColor}; background: ${statusBg}; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td { padding: 9px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    td:first-child { width: 38%; color: #6b7280; }
    .foot { padding: 14px 20px 18px; border-top: 1px solid #e5e7eb; background: #f8fafc; }
    .foot p { margin: 0 0 6px; color: #475569; font-size: 13px; }
    .foot a { color: #1d4ed8; text-decoration: none; }
    @media print { body { padding: 0; background:#fff; } .receipt { border: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="head">
      <h1>Nota Pembelian User</h1>
      <p class="sub">1FORCR KUOTA</p>
    </div>
    <div class="body">
      <span class="status">${escapeHtml(statusInfo.label)}</span>
      <table>
        <tr><td>Tanggal & Jam</td><td>${escapeHtml(dateTime)}</td></tr>
        <tr><td>Ref ID</td><td>${escapeHtml(transaction.refId || '-')}</td></tr>
        <tr><td>User</td><td>${escapeHtml(userName)}</td></tr>
        <tr><td>Email</td><td>${escapeHtml(userEmail)}</td></tr>
        <tr><td>Produk</td><td>${escapeHtml(productName)}</td></tr>
        <tr><td>SKU</td><td>${escapeHtml(transaction.buyerSkuCode || '-')}</td></tr>
        <tr><td>Tujuan</td><td>${escapeHtml(customerNo)}</td></tr>
        <tr><td>Jumlah</td><td>${escapeHtml(price)}</td></tr>
        <tr><td>SN/Token</td><td>${escapeHtml(serialNumber)}</td></tr>
        <tr><td>Kode Response</td><td>${escapeHtml(rc)}</td></tr>
        <tr><td>Pesan</td><td>${escapeHtml(message)}</td></tr>
      </table>
    </div>
    <div class="foot">
      <p><strong>Website:</strong> <a href="${escapeHtml(receiptWebsiteUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(receiptWebsiteUrl)}</a></p>
      <p>${escapeHtml(receiptAdText)}</p>
    </div>
  </div>
</body>
</html>`;
    }

    function downloadReceipt(transaction) {
        const statusInfo = mapTransactionStatus(transaction.status);
        const productName = transaction.productName || transaction.buyerSkuCode || '-';
        const price = formatRupiah(typeof transaction.price === 'number' ? transaction.price : Number(transaction.price));
        const rows = [
            ['Tanggal & Jam', formatDate(transaction.createdAt)],
            ['Ref ID', transaction.refId || '-'],
            ['User', transaction?.user?.username || transaction?.user?.email || '-'],
            ['Email', transaction?.user?.email || '-'],
            ['Produk', productName],
            ['SKU', transaction.buyerSkuCode || '-'],
            ['Tujuan', transaction.customerNo || '-'],
            ['Jumlah', price],
            ['SN/Token', transaction.serialNumber || '-'],
            ['Kode Response', transaction.rc || '-'],
            ['Pesan', transaction.message || '-'],
        ];
        const downloaded = downloadReceiptAsPdf({
            title: 'Nota Pembelian User',
            subtitle: '1FORCR KUOTA',
            status: statusInfo.label,
            rows,
            filename: `struk-${transaction.refId || 'transaksi'}.pdf`,
            footerLines: [
                `Website: ${receiptWebsiteUrl}`,
                receiptAdText,
            ],
        });
        if (downloaded) return;

        const content = buildReceiptHtml(transaction);
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `struk-${transaction.refId || 'transaksi'}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function filterTransactions(transactions) {
        const dateFrom = txDateFromEl ? txDateFromEl.value : '';
        const dateTo = txDateToEl ? txDateToEl.value : '';
        const statusFilter = txStatusEl ? txStatusEl.value : '';
        const searchValue = txSearchEl ? txSearchEl.value.trim().toLowerCase() : '';

        return transactions.filter(function(transaction) {
            const transactionDate = getDateKey(transaction.createdAt);
            if (dateFrom && transactionDate && transactionDate < dateFrom) return false;
            if (dateTo && transactionDate && transactionDate > dateTo) return false;

            const normalizedStatus = normalizeTransactionStatus(transaction.status);
            if (statusFilter && normalizedStatus !== statusFilter) return false;

            if (!searchValue) return true;

            const haystack = [
                transaction?.user?.username,
                transaction?.user?.email,
                transaction.productName,
                transaction.buyerSkuCode,
                transaction.customerNo,
                transaction.refId,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(searchValue);
        });
    }

    function applyTransactionFilters() {
        const filtered = filterTransactions(allAdminTransactions);
        const totalPages = Math.max(1, Math.ceil(filtered.length / adminTxPageSize));
        if (currentAdminTxPage > totalPages) {
            currentAdminTxPage = totalPages;
        }
        if (currentAdminTxPage < 1) {
            currentAdminTxPage = 1;
        }

        const startIndex = (currentAdminTxPage - 1) * adminTxPageSize;
        const paged = filtered.slice(startIndex, startIndex + adminTxPageSize);

        if (txShownCountEl) txShownCountEl.textContent = String(filtered.length);
        if (txPageInfoEl) txPageInfoEl.textContent = `Halaman ${currentAdminTxPage} / ${totalPages}`;
        if (txPrevPageBtn) txPrevPageBtn.disabled = currentAdminTxPage <= 1;
        if (txNextPageBtn) txNextPageBtn.disabled = currentAdminTxPage >= totalPages;
        renderAdminTransactions(paged);
    }

    function changeTransactionPage(delta) {
        currentAdminTxPage += delta;
        applyTransactionFilters();
    }

    function filterAdminPayments(payments) {
        const typeFilter = payTypeFilterEl ? payTypeFilterEl.value : '';
        const statusFilter = payStatusFilterEl ? payStatusFilterEl.value : '';
        const searchValue = paySearchEl ? paySearchEl.value.trim().toLowerCase() : '';

        return payments.filter(function(payment) {
            const statusInfo = mapPaymentStatus(payment.status);
            if (typeFilter && String(payment.type || '') !== typeFilter) return false;
            if (statusFilter && statusInfo.group !== statusFilter) return false;

            if (!searchValue) return true;
            const haystack = [
                payment?.user?.username,
                payment?.user?.email,
                payment.orderCode,
                payment.refId,
                payment.buyerSkuCode,
                payment.productName,
            ].filter(Boolean).join(' ').toLowerCase();

            return haystack.includes(searchValue);
        });
    }

    function showAdminPaymentDetail(payment) {
        const statusInfo = mapPaymentStatus(payment.status);
        const code = [payment.orderCode, payment.refId].filter(Boolean).join(' / ') || '-';
        const rows = [
            ['Tanggal & Jam', formatDate(payment.createdAt)],
            ['User', payment?.user?.username || payment?.user?.email || '-'],
            ['Email', payment?.user?.email || '-'],
            ['Jenis', getPaymentTypeLabel(payment.type)],
            ['Metode', getPaymentMethodLabel(payment.method)],
            ['Status', statusInfo.label],
            ['Kode', code],
            ['SKU', payment.buyerSkuCode || '-'],
            ['Produk', payment.productName || '-'],
            ['Tujuan', payment.customerNo || '-'],
            ['Nominal', formatRupiah(Number(payment.amount || 0))],
            ['QRIS ID', payment.qrisTransactionId || '-'],
            ['Dibayar', payment.paymentSettledAt ? formatDate(payment.paymentSettledAt) : '-'],
            ['Diproses', payment.digiflazzExecutedAt ? formatDate(payment.digiflazzExecutedAt) : '-'],
            ['Refund', payment.refundedAt ? formatDate(payment.refundedAt) : '-'],
            ['Keterangan', payment.message || '-'],
        ];
        // Pesanan produk yang gagal: salah input pembeli, gangguan supplier,
        // atau masalah akun Digiflazz, beserta kode rc-nya.
        if (payment.failureLabel) rows.push(['Penyebab Gagal', payment.failureLabel]);
        // Produk yang punya SKU cadangan: siapa yang dipilih user, supplier mana
        // yang akhirnya memproses, dan urutan percobaannya.
        if (payment.fallback) {
            const fallback = payment.fallback;
            rows.splice(8, 0,
                ['SKU dipilih user', fallback.requestedSkuCode || '-'],
                ['Supplier dipakai', `#${fallback.executedRank || '-'} dari ${fallback.groupSize} (${fallback.executedSkuCode || '-'})`],
                ['Urutan percobaan', fallback.trail || '-']
            );
        }
        showAdminDetailDialog('Detail Histori Pembayaran', rows, function() {
            if (statusInfo.group !== 'SUCCESS') return null;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-primary';
            btn.innerHTML = '<i class="fas fa-file-download"></i> Download Nota';
            btn.addEventListener('click', function() {
                downloadPaymentReceipt(payment);
            });
            return btn;
        });
    }

    function showAdminTransactionDetail(transaction) {
        const statusInfo = mapTransactionStatus(transaction.status);
        const rows = [
            ['Tanggal & Jam', formatDate(transaction.createdAt)],
            ['User', transaction?.user?.username || transaction?.user?.email || '-'],
            ['Email', transaction?.user?.email || '-'],
            ['Status', statusInfo.label],
            ['Ref ID', transaction.refId || '-'],
            ['Produk', transaction.productName || transaction.buyerSkuCode || '-'],
            ['SKU', transaction.buyerSkuCode || '-'],
            ['Tujuan', transaction.customerNo || '-'],
            ['Jumlah', formatRupiah(typeof transaction.price === 'number' ? transaction.price : Number(transaction.price))],
            ['SN/Token', transaction.serialNumber || '-'],
            ['Kode Response', transaction.rc || '-'],
            ['Pesan', transaction.message || '-'],
        ];
        if (transaction.failureLabel) rows.push(['Penyebab Gagal', transaction.failureLabel]);
        showAdminDetailDialog('Detail Pembelian User', rows, function() {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-primary';
            btn.innerHTML = '<i class="fas fa-file-download"></i> Download Struk';
            btn.addEventListener('click', function() {
                downloadReceipt(transaction);
            });
            return btn;
        });
    }

    function renderAdminPayments(payments) {
        if (!adminPaymentListEl) return;
        adminPaymentListEl.innerHTML = '';

        if (!payments.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada histori pembayaran.');
            cell.colSpan = 9;
            row.appendChild(cell);
            adminPaymentListEl.appendChild(row);
            return;
        }

        payments.forEach(function(payment) {
            const row = document.createElement('tr');
            const statusInfo = mapPaymentStatus(payment.status);
            const userName = payment?.user?.username || payment?.user?.email || '-';
            const code = [payment.orderCode, payment.refId].filter(Boolean).join(' / ') || '-';
            const detail = payment.message || statusInfo.detail;

            const dateCell = createCell(formatDate(payment.createdAt));
            dateCell.dataset.label = 'Tanggal & Jam';
            row.appendChild(dateCell);

            const userCell = createCell(userName);
            userCell.dataset.label = 'User';
            row.appendChild(userCell);

            const typeCell = createCell(getPaymentTypeLabel(payment.type));
            typeCell.dataset.label = 'Jenis';
            row.appendChild(typeCell);

            const methodCell = createCell(getPaymentMethodLabel(payment.method));
            methodCell.dataset.label = 'Metode';
            row.appendChild(methodCell);

            const codeCell = createCell(code);
            codeCell.dataset.label = 'Order / Ref';
            row.appendChild(codeCell);

            const amountCell = createCell(formatRupiah(Number(payment.amount || 0)));
            amountCell.dataset.label = 'Jumlah';
            row.appendChild(amountCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const status = document.createElement('span');
            status.className = `status ${statusInfo.className}`;
            status.textContent = statusInfo.label;
            statusCell.appendChild(status);
            // Ditandai kalau pesanan tidak diproses oleh SKU pilihan user,
            // baik karena cadangan maupun karena SKU yang dipakai duluan.
            const fallback = payment.fallback;
            if (fallback && (fallback.attemptCount > 1 || fallback.executedSkuCode !== fallback.requestedSkuCode)) {
                const fallbackNote = document.createElement('span');
                fallbackNote.className = 'status pending admin-product-flag';
                fallbackNote.textContent = `Supplier #${fallback.executedRank || '-'} dari ${fallback.groupSize}`;
                fallbackNote.title = fallback.trail || '';
                statusCell.appendChild(fallbackNote);
            }
            row.appendChild(statusCell);

            const detailCell = createCell(detail);
            detailCell.dataset.label = 'Detail';
            row.appendChild(detailCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            const detailBtn = document.createElement('button');
            detailBtn.type = 'button';
            detailBtn.className = 'receipt-btn';
            detailBtn.innerHTML = '<i class="fas fa-circle-info"></i> Detail';
            detailBtn.addEventListener('click', function() {
                showAdminPaymentDetail(payment);
            });
            actionCell.appendChild(detailBtn);
            if (statusInfo.group === 'SUCCESS') {
                const downloadBtn = document.createElement('button');
                downloadBtn.type = 'button';
                downloadBtn.className = 'receipt-btn';
                downloadBtn.innerHTML = '<i class="fas fa-file-download"></i> Download Nota';
                downloadBtn.addEventListener('click', function() {
                    downloadPaymentReceipt(payment);
                });
                actionCell.appendChild(downloadBtn);
            }
            row.appendChild(actionCell);

            adminPaymentListEl.appendChild(row);
        });
    }

    function applyPaymentFilters() {
        const filtered = filterAdminPayments(allAdminPayments);
        const totalPages = Math.max(1, Math.ceil(filtered.length / adminPaymentPageSize));
        if (currentAdminPaymentPage > totalPages) currentAdminPaymentPage = totalPages;
        if (currentAdminPaymentPage < 1) currentAdminPaymentPage = 1;

        const startIndex = (currentAdminPaymentPage - 1) * adminPaymentPageSize;
        const paged = filtered.slice(startIndex, startIndex + adminPaymentPageSize);

        if (payShownCountEl) payShownCountEl.textContent = String(filtered.length);
        if (payPageInfoEl) payPageInfoEl.textContent = `Halaman ${currentAdminPaymentPage} / ${totalPages}`;
        if (payPrevPageBtn) payPrevPageBtn.disabled = currentAdminPaymentPage <= 1;
        if (payNextPageBtn) payNextPageBtn.disabled = currentAdminPaymentPage >= totalPages;
        renderAdminPayments(paged);
    }

    function changePaymentPage(delta) {
        currentAdminPaymentPage += delta;
        applyPaymentFilters();
    }

    function setInternalGatewayInfo(message, type) {
        if (!internalGatewayInfoEl) return;
        internalGatewayInfoEl.textContent = message || '';
        internalGatewayInfoEl.classList.remove('success', 'failed');
        if (type) internalGatewayInfoEl.classList.add(type);
    }

    function getGatewayStatusLabel(status) {
        const value = String(status || '').toUpperCase();
        if (value === 'SUCCESS') return { label: 'Sukses', className: 'success' };
        if (value === 'WAITING_PAYMENT') return { label: 'Menunggu', className: 'pending' };
        if (value === 'PAID' || value === 'PROCESSING') return { label: 'Proses', className: 'process' };
        if (value === 'EXPIRED') return { label: 'Expired', className: 'failed' };
        if (value === 'CANCELED') return { label: 'Dibatalkan', className: 'failed' };
        if (value === 'FAILED') return { label: 'Gagal', className: 'failed' };
        return { label: value || '-', className: 'pending' };
    }

    function getTextareaLines(element) {
        return String(element?.value || '')
            .split(/\n|,/)
            .map(function(item) { return item.trim(); })
            .filter(Boolean);
    }

    function resetPartnerCredentialBox() {
        if (partnerCredentialBoxEl) partnerCredentialBoxEl.hidden = true;
        if (partnerCredentialApiKeyEl) partnerCredentialApiKeyEl.textContent = '-';
        if (partnerCredentialSecretEl) partnerCredentialSecretEl.textContent = '-';
    }

    function renderPartnerCredential(credentials) {
        if (!credentials || !partnerCredentialBoxEl) return;
        partnerCredentialBoxEl.hidden = false;
        if (partnerCredentialApiKeyEl) partnerCredentialApiKeyEl.textContent = credentials.apiKey || '(tidak berubah)';
        if (partnerCredentialSecretEl) partnerCredentialSecretEl.textContent = credentials.secret || '-';
    }

    function resetPartnerForm() {
        editingPartnerAppId = '';
        if (partnerAppNameInputEl) partnerAppNameInputEl.value = '';
        if (partnerCallbackUrlInputEl) partnerCallbackUrlInputEl.value = '';
        if (partnerReturnUrlInputEl) partnerReturnUrlInputEl.value = '';
        if (partnerAllowedOriginsInputEl) partnerAllowedOriginsInputEl.value = '';
        if (partnerAllowedIpsInputEl) partnerAllowedIpsInputEl.value = '';
        if (partnerRequestTtlInputEl) partnerRequestTtlInputEl.value = '300';
        if (partnerEnabledInputEl) partnerEnabledInputEl.checked = true;
        if (createPartnerAppBtn) createPartnerAppBtn.innerHTML = '<i class="fas fa-plus"></i> Buat Partner & Token';
    }

    function fillPartnerForm(app) {
        editingPartnerAppId = app.id || '';
        if (partnerAppNameInputEl) partnerAppNameInputEl.value = app.name || '';
        if (partnerCallbackUrlInputEl) partnerCallbackUrlInputEl.value = app.callbackUrl || '';
        if (partnerReturnUrlInputEl) partnerReturnUrlInputEl.value = app.returnUrl || '';
        if (partnerAllowedOriginsInputEl) partnerAllowedOriginsInputEl.value = (app.allowedOrigins || []).join('\n');
        if (partnerAllowedIpsInputEl) partnerAllowedIpsInputEl.value = (app.allowedIpAddresses || []).join('\n');
        if (partnerRequestTtlInputEl) partnerRequestTtlInputEl.value = String(app.requestTtlSeconds || 300);
        if (partnerEnabledInputEl) partnerEnabledInputEl.checked = app.enabled !== false;
        if (createPartnerAppBtn) createPartnerAppBtn.innerHTML = '<i class="fas fa-save"></i> Update Partner';
        resetPartnerCredentialBox();
        setInternalGatewayInfo(`Mode edit: ${app.name}. Secret tidak berubah kecuali rotate.`, 'success');
    }

    function getPartnerFormPayload() {
        return {
            name: String(partnerAppNameInputEl?.value || '').trim(),
            callbackUrl: String(partnerCallbackUrlInputEl?.value || '').trim(),
            returnUrl: String(partnerReturnUrlInputEl?.value || '').trim(),
            allowedOrigins: getTextareaLines(partnerAllowedOriginsInputEl),
            allowedIpAddresses: getTextareaLines(partnerAllowedIpsInputEl),
            requestTtlSeconds: Number(partnerRequestTtlInputEl?.value || 300),
            enabled: partnerEnabledInputEl ? Boolean(partnerEnabledInputEl.checked) : true,
        };
    }

    function renderPartnerApps(apps) {
        if (!partnerAppsListEl) return;
        partnerAppsListEl.innerHTML = '';
        if (!apps.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada partner gateway internal.');
            cell.colSpan = 7;
            row.appendChild(cell);
            partnerAppsListEl.appendChild(row);
            return;
        }

        apps.forEach(function(app) {
            const row = document.createElement('tr');

            const nameCell = createCell(app.name || '-');
            nameCell.dataset.label = 'Partner';
            row.appendChild(nameCell);

            const keyCell = createCell(app.apiKeyMasked || app.apiKeyPrefix || '-');
            keyCell.dataset.label = 'API Key';
            keyCell.className = 'gateway-copy';
            row.appendChild(keyCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const status = document.createElement('span');
            status.className = `status ${app.enabled ? 'success' : 'failed'}`;
            status.textContent = app.enabled ? 'Aktif' : 'Nonaktif';
            statusCell.appendChild(status);
            row.appendChild(statusCell);

            const callbackCell = createCell(app.callbackUrl || '-');
            callbackCell.dataset.label = 'Callback';
            callbackCell.className = 'gateway-copy';
            row.appendChild(callbackCell);

            const securityCell = document.createElement('td');
            securityCell.dataset.label = 'Keamanan';
            securityCell.innerHTML = `
                <div class="gateway-security-list">
                    <span>TTL ${Number(app.requestTtlSeconds || 300)} detik</span>
                    <span>${(app.allowedOrigins || []).length || 0} origin</span>
                    <span>${(app.allowedIpAddresses || []).length || 0} IP whitelist</span>
                </div>
            `;
            row.appendChild(securityCell);

            const orderCell = createCell(`${Number(app.totalPayments || 0)} order`);
            orderCell.dataset.label = 'Order';
            row.appendChild(orderCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            actionCell.className = 'internal-gateway-actions';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'receipt-btn';
            editBtn.innerHTML = '<i class="fas fa-pen"></i> Edit';
            editBtn.addEventListener('click', function() {
                fillPartnerForm(app);
            });
            actionCell.appendChild(editBtn);

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'receipt-btn';
            toggleBtn.innerHTML = app.enabled ? '<i class="fas fa-ban"></i> Nonaktif' : '<i class="fas fa-check"></i> Aktifkan';
            toggleBtn.addEventListener('click', function() {
                updatePartnerApp(app.id, { enabled: !app.enabled });
            });
            actionCell.appendChild(toggleBtn);

            const rotateBtn = document.createElement('button');
            rotateBtn.type = 'button';
            rotateBtn.className = 'receipt-btn';
            rotateBtn.innerHTML = '<i class="fas fa-key"></i> Rotate';
            rotateBtn.addEventListener('click', function() {
                rotatePartnerSecret(app);
            });
            actionCell.appendChild(rotateBtn);

            row.appendChild(actionCell);
            partnerAppsListEl.appendChild(row);
        });
    }

    function renderExternalGatewayOrders(orders) {
        if (!externalGatewayOrdersListEl) return;
        externalGatewayOrdersListEl.innerHTML = '';
        if (!orders.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada order gateway eksternal.');
            cell.colSpan = 7;
            row.appendChild(cell);
            externalGatewayOrdersListEl.appendChild(row);
            return;
        }

        orders.forEach(function(order) {
            const row = document.createElement('tr');
            const statusInfo = getGatewayStatusLabel(order.status);
            const callback = order.callback || {};
            const callbackText = callback.deliveredAt
                ? `Terkirim ${formatDate(callback.deliveredAt)}`
                : `${Number(callback.attempts || 0)}x${callback.lastError ? ` - ${callback.lastError}` : ''}`;

            const dateCell = createCell(formatDate(order.createdAt));
            dateCell.dataset.label = 'Tanggal';
            row.appendChild(dateCell);

            const partnerCell = createCell(order.partner?.name || '-');
            partnerCell.dataset.label = 'Partner';
            row.appendChild(partnerCell);

            const orderCell = createCell(`${order.paymentId || '-'} / ${order.partnerOrderId || '-'}`);
            orderCell.dataset.label = 'Order';
            orderCell.className = 'gateway-copy';
            row.appendChild(orderCell);

            const amountCell = createCell(formatRupiah(Number(order.amount || 0)));
            amountCell.dataset.label = 'Jumlah';
            row.appendChild(amountCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const status = document.createElement('span');
            status.className = `status ${statusInfo.className}`;
            status.textContent = statusInfo.label;
            statusCell.appendChild(status);
            row.appendChild(statusCell);

            const callbackCell = createCell(callbackText);
            callbackCell.dataset.label = 'Callback';
            callbackCell.className = 'gateway-copy';
            row.appendChild(callbackCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            actionCell.className = 'internal-gateway-actions';
            const detailBtn = document.createElement('button');
            detailBtn.type = 'button';
            detailBtn.className = 'receipt-btn';
            detailBtn.innerHTML = '<i class="fas fa-circle-info"></i> Detail';
            detailBtn.addEventListener('click', function() {
                const rows = [
                    ['Partner', order.partner?.name || '-'],
                    ['Payment ID', order.paymentId || '-'],
                    ['Partner Order ID', order.partnerOrderId || '-'],
                    ['Status', statusInfo.label],
                    ['Jumlah', formatRupiah(Number(order.amount || 0))],
                    ['Deskripsi', order.description || '-'],
                    ['Customer', [order.customerName, order.customerEmail].filter(Boolean).join(' / ') || '-'],
                    ['Callback', order.callbackUrl || '-'],
                    ['Callback attempts', String(callback.attempts || 0)],
                    ['Callback terakhir', callback.lastAt ? formatDate(callback.lastAt) : '-'],
                    ['Callback error', callback.lastError || '-'],
                    ['Dibayar', order.paymentSettledAt ? formatDate(order.paymentSettledAt) : '-'],
                ];
                showAdminDetailDialog('Detail Order Gateway', rows);
            });
            actionCell.appendChild(detailBtn);

            if (['SUCCESS', 'FAILED', 'EXPIRED', 'CANCELED'].includes(String(order.status || '').toUpperCase()) && !callback.deliveredAt) {
                const retryBtn = document.createElement('button');
                retryBtn.type = 'button';
                retryBtn.className = 'receipt-btn';
                retryBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Retry';
                retryBtn.addEventListener('click', function() {
                    retryExternalGatewayCallback(order.id);
                });
                actionCell.appendChild(retryBtn);
            }

            row.appendChild(actionCell);
            externalGatewayOrdersListEl.appendChild(row);
        });
    }

    async function loadInternalGatewayDashboard() {
        if (internalGatewayBaseUrlEl) {
            internalGatewayBaseUrlEl.textContent = `${window.location.origin}/api/partner`;
        }
        try {
            const [appsResponse, ordersResponse] = await Promise.all([
                fetch('/api/admin/internal-gateway/apps'),
                fetch('/api/admin/internal-gateway/orders?take=300'),
            ]);
            const appsResult = await appsResponse.json();
            const ordersResult = await ordersResponse.json();
            if (!appsResponse.ok) throw new Error(appsResult?.error || 'Gagal mengambil partner gateway');
            if (!ordersResponse.ok) throw new Error(ordersResult?.error || 'Gagal mengambil order gateway');
            allPartnerApps = Array.isArray(appsResult?.data) ? appsResult.data : [];
            allExternalGatewayOrders = Array.isArray(ordersResult?.data) ? ordersResult.data : [];
            renderPartnerApps(allPartnerApps);
            renderExternalGatewayOrders(allExternalGatewayOrders);
            setInternalGatewayInfo('Gateway internal siap. Secret hanya tampil saat create/rotate.', 'success');
        } catch (error) {
            allPartnerApps = [];
            allExternalGatewayOrders = [];
            renderPartnerApps(allPartnerApps);
            renderExternalGatewayOrders(allExternalGatewayOrders);
            setInternalGatewayInfo(error.message || 'Gagal memuat gateway internal.', 'failed');
        }
    }

    async function savePartnerApp() {
        const payload = getPartnerFormPayload();
        if (!payload.name || !payload.callbackUrl) {
            setInternalGatewayInfo('Nama partner dan callback URL wajib diisi.', 'failed');
            return;
        }
        if (createPartnerAppBtn) createPartnerAppBtn.disabled = true;
        setInternalGatewayInfo(editingPartnerAppId ? 'Mengupdate partner...' : 'Membuat partner dan token...', '');
        try {
            const response = await fetch(editingPartnerAppId
                ? `/api/admin/internal-gateway/apps/${encodeURIComponent(editingPartnerAppId)}`
                : '/api/admin/internal-gateway/apps', {
                method: editingPartnerAppId ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menyimpan partner');
            if (result?.data?.credentials) {
                renderPartnerCredential(result.data.credentials);
            } else {
                resetPartnerCredentialBox();
            }
            setInternalGatewayInfo(result?.data?.credentials?.message || 'Partner berhasil disimpan.', 'success');
            resetPartnerForm();
            await loadInternalGatewayDashboard();
        } catch (error) {
            setInternalGatewayInfo(error.message || 'Gagal menyimpan partner.', 'failed');
        } finally {
            if (createPartnerAppBtn) createPartnerAppBtn.disabled = false;
        }
    }

    async function updatePartnerApp(id, payload) {
        try {
            const response = await fetch(`/api/admin/internal-gateway/apps/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal update partner');
            setInternalGatewayInfo('Partner berhasil diupdate.', 'success');
            await loadInternalGatewayDashboard();
        } catch (error) {
            setInternalGatewayInfo(error.message || 'Gagal update partner.', 'failed');
        }
    }

    async function rotatePartnerSecret(app) {
        const confirmed = await showConfirmDialog({
            title: 'Rotate Secret Partner',
            message: `Secret lama untuk ${app.name} langsung tidak berlaku. Lanjutkan?`,
            confirmText: 'Rotate Secret',
            cancelText: 'Batal',
        });
        if (!confirmed) return;
        try {
            const response = await fetch(`/api/admin/internal-gateway/apps/${encodeURIComponent(app.id)}/rotate-secret`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal rotate secret');
            renderPartnerCredential(result?.data?.credentials || {});
            setInternalGatewayInfo(result?.data?.credentials?.message || 'Secret berhasil dirotate.', 'success');
            await loadInternalGatewayDashboard();
        } catch (error) {
            setInternalGatewayInfo(error.message || 'Gagal rotate secret.', 'failed');
        }
    }

    async function retryExternalGatewayCallback(orderId) {
        try {
            const response = await fetch(`/api/admin/internal-gateway/orders/${encodeURIComponent(orderId)}/retry-callback`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal retry callback');
            setInternalGatewayInfo(result?.data?.delivered ? 'Callback berhasil dikirim.' : (result?.data?.error || 'Callback belum berhasil.'), result?.data?.delivered ? 'success' : 'failed');
            await loadInternalGatewayDashboard();
        } catch (error) {
            setInternalGatewayInfo(error.message || 'Gagal retry callback.', 'failed');
        }
    }

    // ===== API reseller =====
    //
    // Kunci API untuk website reseller. Semua aturannya dipegang server; halaman
    // ini hanya formulir dan tabel. Panduan untuk reseller: docs/RESELLER_API.md.
    const resellerApiBaseUrlEl = document.getElementById('resellerApiBaseUrl');
    const resellerApiEnabledInputEl = document.getElementById('resellerApiEnabledInput');
    const resellerApiAccountInputEl = document.getElementById('resellerApiAccountInput');
    const resellerApiNameInputEl = document.getElementById('resellerApiNameInput');
    const resellerApiIpsInputEl = document.getElementById('resellerApiIpsInput');
    const resellerApiCallbackInputEl = document.getElementById('resellerApiCallbackInput');
    const resellerApiAllowPpobInputEl = document.getElementById('resellerApiAllowPpobInput');
    const resellerApiAllowVpnInputEl = document.getElementById('resellerApiAllowVpnInput');
    const resellerApiExpiresInputEl = document.getElementById('resellerApiExpiresInput');
    const resellerApiDailyPpobInputEl = document.getElementById('resellerApiDailyPpobInput');
    const resellerApiDailyVpnInputEl = document.getElementById('resellerApiDailyVpnInput');
    const resellerApiRateInputEl = document.getElementById('resellerApiRateInput');
    const resellerApiTtlInputEl = document.getElementById('resellerApiTtlInput');
    const resellerApiClientEnabledInputEl = document.getElementById('resellerApiClientEnabledInput');
    const saveResellerApiClientBtn = document.getElementById('saveResellerApiClientBtn');
    const cancelResellerApiEditBtn = document.getElementById('cancelResellerApiEditBtn');
    const resellerApiInfoEl = document.getElementById('resellerApiInfo');
    const resellerApiCredentialBoxEl = document.getElementById('resellerApiCredentialBox');
    const resellerApiCredentialKeyEl = document.getElementById('resellerApiCredentialKey');
    const resellerApiCredentialSecretEl = document.getElementById('resellerApiCredentialSecret');
    const resellerApiClientsListEl = document.getElementById('resellerApiClientsList');
    const resellerApiOrdersListEl = document.getElementById('resellerApiOrdersList');
    const resellerApiOrdersFilterEl = document.getElementById('resellerApiOrdersFilter');
    const refreshResellerApiBtn = document.getElementById('refreshResellerApiBtn');
    let resellerApiClients = [];
    let editingResellerApiClientId = '';

    const RESELLER_API_KIND_LABELS = {
        PPOB_PURCHASE: 'Beli PPOB',
        VPN_CREATE: 'Buat akun VPN',
        VPN_RENEW: 'Perpanjang VPN',
        VPN_MOVE: 'Pindah server VPN',
        VPN_DELETE: 'Hapus akun VPN',
        VPN_TRIAL: 'Trial VPN',
    };

    function setResellerApiInfo(message, type) {
        if (!resellerApiInfoEl) return;
        resellerApiInfoEl.textContent = message || '';
        resellerApiInfoEl.classList.remove('success', 'failed');
        if (type) resellerApiInfoEl.classList.add(type);
    }

    async function resellerApiRequest(url, options) {
        const settings = options || {};
        const response = await fetch(url, {
            method: settings.method || 'GET',
            headers: settings.body ? { 'Content-Type': 'application/json' } : undefined,
            body: settings.body ? JSON.stringify(settings.body) : undefined,
        });
        const result = await response.json().catch(function() { return {}; });
        if (!response.ok) throw new Error(result?.error || 'Permintaan gagal');
        return result;
    }

    function getResellerApiClientStatus(client) {
        if (!client.enabled) return { label: 'Nonaktif', className: 'failed' };
        if (client.expired) return { label: 'Kedaluwarsa', className: 'failed' };
        return { label: 'Aktif', className: 'success' };
    }

    function getResellerApiOrderStatus(status) {
        if (status === 'SUCCESS') return { label: 'Sukses', className: 'success' };
        if (status === 'FAILED') return { label: 'Gagal', className: 'failed' };
        return { label: 'Proses', className: 'process' };
    }

    function formatResellerApiUsage(used, limit) {
        const usedText = formatRupiah(Number(used || 0));
        return Number(limit) > 0 ? `${usedText} / ${formatRupiah(Number(limit))}` : `${usedText} (tanpa batas)`;
    }

    function resetResellerApiCredentialBox() {
        if (resellerApiCredentialBoxEl) resellerApiCredentialBoxEl.hidden = true;
        if (resellerApiCredentialKeyEl) resellerApiCredentialKeyEl.textContent = '-';
        if (resellerApiCredentialSecretEl) resellerApiCredentialSecretEl.textContent = '-';
    }

    function renderResellerApiCredential(credentials) {
        if (!credentials || !resellerApiCredentialBoxEl) return;
        resellerApiCredentialBoxEl.hidden = false;
        if (resellerApiCredentialKeyEl) resellerApiCredentialKeyEl.textContent = credentials.apiKey || '-';
        if (resellerApiCredentialSecretEl) resellerApiCredentialSecretEl.textContent = credentials.secret || '-';
        resellerApiCredentialBoxEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function resetResellerApiForm() {
        editingResellerApiClientId = '';
        if (resellerApiAccountInputEl) {
            resellerApiAccountInputEl.value = '';
            resellerApiAccountInputEl.disabled = false;
        }
        if (resellerApiNameInputEl) resellerApiNameInputEl.value = '';
        if (resellerApiIpsInputEl) resellerApiIpsInputEl.value = '';
        if (resellerApiCallbackInputEl) resellerApiCallbackInputEl.value = '';
        if (resellerApiAllowPpobInputEl) resellerApiAllowPpobInputEl.checked = true;
        if (resellerApiAllowVpnInputEl) resellerApiAllowVpnInputEl.checked = true;
        if (resellerApiExpiresInputEl) resellerApiExpiresInputEl.value = '';
        if (resellerApiDailyPpobInputEl) resellerApiDailyPpobInputEl.value = '0';
        if (resellerApiDailyVpnInputEl) resellerApiDailyVpnInputEl.value = '0';
        if (resellerApiRateInputEl) resellerApiRateInputEl.value = '60';
        if (resellerApiTtlInputEl) resellerApiTtlInputEl.value = '300';
        if (resellerApiClientEnabledInputEl) resellerApiClientEnabledInputEl.checked = true;
        if (saveResellerApiClientBtn) saveResellerApiClientBtn.innerHTML = '<i class="fas fa-plus"></i> Buat API Key';
        if (cancelResellerApiEditBtn) cancelResellerApiEditBtn.hidden = true;
    }

    function fillResellerApiForm(client) {
        editingResellerApiClientId = client.id || '';
        // Akun pemilik kunci tidak bisa diganti. Untuk akun lain, buat kunci baru.
        if (resellerApiAccountInputEl) {
            resellerApiAccountInputEl.value = client.user?.email || '';
            resellerApiAccountInputEl.disabled = true;
        }
        if (resellerApiNameInputEl) resellerApiNameInputEl.value = client.name || '';
        if (resellerApiIpsInputEl) resellerApiIpsInputEl.value = (client.allowedIpAddresses || []).join('\n');
        if (resellerApiCallbackInputEl) resellerApiCallbackInputEl.value = client.callbackUrl || '';
        if (resellerApiAllowPpobInputEl) resellerApiAllowPpobInputEl.checked = client.allowPpob !== false;
        if (resellerApiAllowVpnInputEl) resellerApiAllowVpnInputEl.checked = client.allowVpn !== false;
        if (resellerApiExpiresInputEl) resellerApiExpiresInputEl.value = toDateTimeLocalInputValue(client.expiresAt);
        if (resellerApiDailyPpobInputEl) resellerApiDailyPpobInputEl.value = String(client.dailyLimitPpob || 0);
        if (resellerApiDailyVpnInputEl) resellerApiDailyVpnInputEl.value = String(client.dailyLimitVpn || 0);
        if (resellerApiRateInputEl) resellerApiRateInputEl.value = String(client.rateLimitPerMinute || 60);
        if (resellerApiTtlInputEl) resellerApiTtlInputEl.value = String(client.requestTtlSeconds || 300);
        if (resellerApiClientEnabledInputEl) resellerApiClientEnabledInputEl.checked = client.enabled !== false;
        if (saveResellerApiClientBtn) saveResellerApiClientBtn.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
        if (cancelResellerApiEditBtn) cancelResellerApiEditBtn.hidden = false;
        resetResellerApiCredentialBox();
        setResellerApiInfo(`Mode edit: ${client.name}. API key tidak berubah kecuali di-rotate.`, 'success');
        resellerApiNameInputEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function getResellerApiFormPayload() {
        const expiresRaw = String(resellerApiExpiresInputEl?.value || '').trim();
        const expiresDate = expiresRaw ? new Date(expiresRaw) : null;
        return {
            account: String(resellerApiAccountInputEl?.value || '').trim(),
            name: String(resellerApiNameInputEl?.value || '').trim(),
            allowedIpAddresses: getTextareaLines(resellerApiIpsInputEl),
            callbackUrl: String(resellerApiCallbackInputEl?.value || '').trim(),
            allowPpob: Boolean(resellerApiAllowPpobInputEl?.checked),
            allowVpn: Boolean(resellerApiAllowVpnInputEl?.checked),
            expiresAt: expiresDate && !Number.isNaN(expiresDate.getTime()) ? expiresDate.toISOString() : null,
            dailyLimitPpob: Number(resellerApiDailyPpobInputEl?.value || 0) || 0,
            dailyLimitVpn: Number(resellerApiDailyVpnInputEl?.value || 0) || 0,
            rateLimitPerMinute: Number(resellerApiRateInputEl?.value || 60) || 60,
            requestTtlSeconds: Number(resellerApiTtlInputEl?.value || 300) || 300,
            enabled: Boolean(resellerApiClientEnabledInputEl?.checked),
        };
    }

    function createResellerApiActionButton(iconClass, label, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'receipt-btn';
        button.innerHTML = `<i class="${iconClass}"></i> ${escapeHtml(label)}`;
        button.addEventListener('click', onClick);
        return button;
    }

    function renderResellerApiClients(clients) {
        if (!resellerApiClientsListEl) return;
        resellerApiClientsListEl.innerHTML = '';
        if (!clients.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada reseller. Buat API key lewat formulir di atas.');
            cell.colSpan = 6;
            row.appendChild(cell);
            resellerApiClientsListEl.appendChild(row);
            return;
        }

        clients.forEach(function(client) {
            const row = document.createElement('tr');
            const status = getResellerApiClientStatus(client);
            const ips = client.allowedIpAddresses || [];
            const scopes = [client.allowPpob ? 'PPOB' : '', client.allowVpn ? 'VPN' : ''].filter(Boolean).join(', ') || '-';

            const nameCell = document.createElement('td');
            nameCell.dataset.label = 'Reseller';
            nameCell.className = 'gateway-copy';
            nameCell.innerHTML = `
                <strong>${escapeHtml(client.name || '-')}</strong><br>
                <small>${escapeHtml(client.user?.email || '-')}</small><br>
                <small>${escapeHtml(client.apiKeyMasked || '-')}</small>
            `;
            row.appendChild(nameCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const statusBadge = document.createElement('span');
            statusBadge.className = `status ${status.className}`;
            statusBadge.textContent = status.label;
            statusCell.appendChild(statusBadge);
            const scopeText = document.createElement('small');
            scopeText.className = 'reseller-api-scope-text';
            scopeText.textContent = `Akses ${scopes}`;
            statusCell.appendChild(scopeText);
            row.appendChild(statusCell);

            const securityCell = document.createElement('td');
            securityCell.dataset.label = 'Keamanan';
            securityCell.innerHTML = `
                <div class="gateway-security-list">
                    <span>${ips.length} IP: ${escapeHtml(ips.slice(0, 2).join(', '))}${ips.length > 2 ? ', ...' : ''}</span>
                    <span>${Number(client.rateLimitPerMinute || 0)} request/menit, TTL ${Number(client.requestTtlSeconds || 0)} detik</span>
                    <span>Callback ${client.callbackUrl ? 'terpasang' : 'belum diisi'}</span>
                    ${client.expiresAt ? `<span>Berlaku sampai ${escapeHtml(formatDate(client.expiresAt))}</span>` : ''}
                </div>
            `;
            row.appendChild(securityCell);

            const balanceCell = document.createElement('td');
            balanceCell.dataset.label = 'Saldo & Pemakaian';
            balanceCell.innerHTML = `
                <div class="gateway-security-list">
                    <span>PPOB saldo ${escapeHtml(formatRupiah(Number(client.balance?.ppob || 0)))}</span>
                    <small>hari ini ${escapeHtml(formatResellerApiUsage(client.usageToday?.ppob, client.dailyLimitPpob))}</small>
                    <span>VPN saldo ${escapeHtml(formatRupiah(Number(client.balance?.vpn || 0)))}</span>
                    <small>hari ini ${escapeHtml(formatResellerApiUsage(client.usageToday?.vpn, client.dailyLimitVpn))}</small>
                </div>
            `;
            row.appendChild(balanceCell);

            const lastUsedCell = document.createElement('td');
            lastUsedCell.dataset.label = 'Terakhir Dipakai';
            lastUsedCell.innerHTML = client.lastUsedAt
                ? `${escapeHtml(formatDate(client.lastUsedAt))}<br><small>IP ${escapeHtml(client.lastUsedIp || '-')}</small>`
                : 'Belum pernah';
            row.appendChild(lastUsedCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            actionCell.className = 'internal-gateway-actions';
            actionCell.appendChild(createResellerApiActionButton('fas fa-pen', 'Edit', function() {
                fillResellerApiForm(client);
            }));
            actionCell.appendChild(createResellerApiActionButton(
                client.enabled ? 'fas fa-ban' : 'fas fa-check',
                client.enabled ? 'Nonaktif' : 'Aktifkan',
                function() { void updateResellerApiClient(client.id, { enabled: !client.enabled }); },
            ));
            actionCell.appendChild(createResellerApiActionButton('fas fa-key', 'Rotate', function() {
                void rotateResellerApiClient(client);
            }));
            if (client.callbackUrl) {
                actionCell.appendChild(createResellerApiActionButton('fas fa-paper-plane', 'Tes Callback', function() {
                    void testResellerApiCallback(client);
                }));
            }
            if (!Number(client.totalOrders || 0)) {
                actionCell.appendChild(createResellerApiActionButton('fas fa-trash', 'Hapus', function() {
                    void deleteResellerApiClient(client);
                }));
            }
            row.appendChild(actionCell);

            resellerApiClientsListEl.appendChild(row);
        });
    }

    function renderResellerApiOrdersFilter(selectedId) {
        if (!resellerApiOrdersFilterEl) return;
        resellerApiOrdersFilterEl.innerHTML = '';
        const allOption = document.createElement('option');
        allOption.value = '';
        allOption.textContent = 'Semua reseller';
        resellerApiOrdersFilterEl.appendChild(allOption);
        resellerApiClients.forEach(function(client) {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            resellerApiOrdersFilterEl.appendChild(option);
        });
        resellerApiOrdersFilterEl.value = resellerApiClients.some(function(client) { return client.id === selectedId; })
            ? selectedId
            : '';
    }

    function describeResellerApiOrder(order) {
        if (order.kind === 'PPOB_PURCHASE') {
            return [order.productName || order.sku, order.customerNo].filter(Boolean).join(' ke ');
        }
        const summary = order.summary || {};
        return [summary.username, summary.serverName].filter(Boolean).join(' di ');
    }

    function showResellerApiOrderDetail(order) {
        const status = getResellerApiOrderStatus(order.status);
        const summary = order.summary || {};
        const callback = order.callback || {};
        const rows = [
            ['Reseller', order.client?.name || '-'],
            ['refId', order.refId || '-'],
            ['Jenis', RESELLER_API_KIND_LABELS[order.kind] || order.kind],
            ['Status', status.label],
            ['Dipotong', formatRupiah(Number(order.amount || 0))],
        ];
        if (order.kind === 'PPOB_PURCHASE') {
            rows.push(
                ['Kode TRX', order.trxId || '-'],
                ['Produk', [order.productName, order.sku].filter(Boolean).join(' / ') || '-'],
                ['Tujuan', order.customerNo || '-'],
                ['SN', order.serialNumber || '-'],
                ['Dikembalikan ke saldo', order.refunded ? 'Ya' : 'Tidak'],
                ['Penyebab gagal', order.failureLabel || '-'],
                ['Pesan', order.message || '-'],
                ['Callback dikirim', String(callback.attempts || 0) + 'x'],
                ['Callback terakhir', callback.lastAt ? `${formatDate(callback.lastAt)} (${callback.lastStatus || '-'})` : '-'],
                ['Callback error', callback.lastError || '-'],
            );
        } else {
            rows.push(
                ['Akun VPN', [summary.username, summary.accountType].filter(Boolean).join(' / ') || '-'],
                ['Server', summary.serverName || '-'],
                ['Masa aktif', summary.expiredAt ? formatDate(summary.expiredAt) : '-'],
            );
            if (summary.refunded) rows.push(['Kembali ke saldo VPN', formatRupiah(Number(summary.refunded))]);
        }
        rows.push(['Dibuat', formatDate(order.createdAt)]);
        showAdminDetailDialog('Detail Transaksi API', rows);
    }

    function renderResellerApiOrders(orders) {
        if (!resellerApiOrdersListEl) return;
        resellerApiOrdersListEl.innerHTML = '';
        if (!orders.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada transaksi API.');
            cell.colSpan = 8;
            row.appendChild(cell);
            resellerApiOrdersListEl.appendChild(row);
            return;
        }

        orders.forEach(function(order) {
            const row = document.createElement('tr');
            const status = getResellerApiOrderStatus(order.status);
            const callback = order.callback || {};
            const isPpob = order.kind === 'PPOB_PURCHASE';

            const dateCell = createCell(formatDate(order.createdAt));
            dateCell.dataset.label = 'Tanggal';
            row.appendChild(dateCell);

            const clientCell = createCell(order.client?.name || '-');
            clientCell.dataset.label = 'Reseller';
            row.appendChild(clientCell);

            const refCell = createCell([order.refId, order.trxId].filter(Boolean).join(' / '));
            refCell.dataset.label = 'refId / TRX';
            refCell.className = 'gateway-copy';
            row.appendChild(refCell);

            const kindCell = document.createElement('td');
            kindCell.dataset.label = 'Jenis';
            kindCell.innerHTML = `<strong>${escapeHtml(RESELLER_API_KIND_LABELS[order.kind] || order.kind)}</strong><br><small>${escapeHtml(describeResellerApiOrder(order) || '-')}</small>`;
            row.appendChild(kindCell);

            const amountCell = createCell(Number(order.amount || 0) > 0 ? formatRupiah(Number(order.amount)) : '-');
            amountCell.dataset.label = 'Jumlah';
            row.appendChild(amountCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const statusBadge = document.createElement('span');
            statusBadge.className = `status ${status.className}`;
            statusBadge.textContent = order.refunded ? `${status.label}, saldo kembali` : status.label;
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);

            let callbackText = '-';
            if (isPpob) {
                callbackText = callback.deliveredAt
                    ? `Terkirim ${formatDate(callback.deliveredAt)}`
                    : `${Number(callback.attempts || 0)}x${callback.lastError ? ` - ${callback.lastError}` : ''}`;
            }
            const callbackCell = createCell(callbackText);
            callbackCell.dataset.label = 'Callback';
            callbackCell.className = 'gateway-copy';
            row.appendChild(callbackCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            actionCell.className = 'internal-gateway-actions';
            actionCell.appendChild(createResellerApiActionButton('fas fa-circle-info', 'Detail', function() {
                showResellerApiOrderDetail(order);
            }));
            if (isPpob && ['SUCCESS', 'FAILED'].includes(order.status)) {
                actionCell.appendChild(createResellerApiActionButton('fas fa-paper-plane', 'Kirim Ulang', function() {
                    void retryResellerApiCallback(order.id);
                }));
            }
            row.appendChild(actionCell);

            resellerApiOrdersListEl.appendChild(row);
        });
    }

    async function loadResellerApiDashboard() {
        const selectedClientId = resellerApiOrdersFilterEl?.value || '';
        try {
            const query = selectedClientId ? `&clientId=${encodeURIComponent(selectedClientId)}` : '';
            const [settings, clients, orders] = await Promise.all([
                resellerApiRequest('/api/admin/reseller-api/settings'),
                resellerApiRequest('/api/admin/reseller-api/clients'),
                resellerApiRequest(`/api/admin/reseller-api/orders?take=200${query}`),
            ]);
            if (resellerApiBaseUrlEl) resellerApiBaseUrlEl.textContent = settings?.data?.baseUrl || `${window.location.origin}/api/reseller/v1`;
            if (resellerApiEnabledInputEl) resellerApiEnabledInputEl.checked = settings?.data?.enabled !== false;
            resellerApiClients = Array.isArray(clients?.data) ? clients.data : [];
            renderResellerApiClients(resellerApiClients);
            renderResellerApiOrdersFilter(selectedClientId);
            renderResellerApiOrders(Array.isArray(orders?.data) ? orders.data : []);
        } catch (error) {
            resellerApiClients = [];
            renderResellerApiClients([]);
            renderResellerApiOrders([]);
            setResellerApiInfo(error.message || 'Gagal memuat API reseller.', 'failed');
        }
    }

    async function saveResellerApiClient() {
        const payload = getResellerApiFormPayload();
        if (!editingResellerApiClientId && !payload.account) {
            setResellerApiInfo('Isi email atau username akun reseller.', 'failed');
            return;
        }
        if (!payload.allowedIpAddresses.length) {
            setResellerApiInfo('Whitelist IP server reseller wajib diisi.', 'failed');
            return;
        }
        if (!payload.allowPpob && !payload.allowVpn) {
            setResellerApiInfo('Pilih minimal satu akses: PPOB atau VPN.', 'failed');
            return;
        }
        if (saveResellerApiClientBtn) saveResellerApiClientBtn.disabled = true;
        setResellerApiInfo(editingResellerApiClientId ? 'Menyimpan perubahan...' : 'Membuat API key...', '');
        try {
            const result = await resellerApiRequest(editingResellerApiClientId
                ? `/api/admin/reseller-api/clients/${encodeURIComponent(editingResellerApiClientId)}`
                : '/api/admin/reseller-api/clients', {
                method: editingResellerApiClientId ? 'PATCH' : 'POST',
                body: payload,
            });
            if (result?.data?.credentials) {
                renderResellerApiCredential(result.data.credentials);
            } else {
                resetResellerApiCredentialBox();
            }
            setResellerApiInfo(result?.data?.credentials?.message || 'Pengaturan reseller tersimpan.', 'success');
            resetResellerApiForm();
            await loadResellerApiDashboard();
        } catch (error) {
            setResellerApiInfo(error.message || 'Gagal menyimpan API key.', 'failed');
        } finally {
            if (saveResellerApiClientBtn) saveResellerApiClientBtn.disabled = false;
        }
    }

    async function updateResellerApiClient(id, payload) {
        try {
            await resellerApiRequest(`/api/admin/reseller-api/clients/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                body: payload,
            });
            setResellerApiInfo('Reseller diperbarui.', 'success');
            await loadResellerApiDashboard();
        } catch (error) {
            setResellerApiInfo(error.message || 'Gagal memperbarui reseller.', 'failed');
        }
    }

    async function rotateResellerApiClient(client) {
        const confirmed = await showConfirmDialog({
            title: 'Rotate API Key',
            message: `API key dan secret lama milik ${client.name} langsung tidak berlaku. Website reseller berhenti bisa bertransaksi sampai kunci baru dipasang. Lanjutkan?`,
            confirmText: 'Rotate',
            cancelText: 'Batal',
        });
        if (!confirmed) return;
        try {
            const result = await resellerApiRequest(`/api/admin/reseller-api/clients/${encodeURIComponent(client.id)}/rotate`, {
                method: 'POST',
            });
            renderResellerApiCredential(result?.data?.credentials || {});
            setResellerApiInfo(result?.data?.credentials?.message || 'Kunci baru dibuat.', 'success');
            await loadResellerApiDashboard();
        } catch (error) {
            setResellerApiInfo(error.message || 'Gagal rotate kunci.', 'failed');
        }
    }

    async function deleteResellerApiClient(client) {
        const confirmed = await showConfirmDialog({
            title: 'Hapus API Key',
            message: `Hapus API key ${client.name}? Kunci ini belum pernah dipakai bertransaksi.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
        });
        if (!confirmed) return;
        try {
            await resellerApiRequest(`/api/admin/reseller-api/clients/${encodeURIComponent(client.id)}`, { method: 'DELETE' });
            if (editingResellerApiClientId === client.id) resetResellerApiForm();
            setResellerApiInfo('API key dihapus.', 'success');
            await loadResellerApiDashboard();
        } catch (error) {
            setResellerApiInfo(error.message || 'Gagal menghapus API key.', 'failed');
        }
    }

    async function testResellerApiCallback(client) {
        setResellerApiInfo(`Mengirim tes callback ke ${client.callbackUrl}...`, '');
        try {
            const result = await resellerApiRequest(`/api/admin/reseller-api/clients/${encodeURIComponent(client.id)}/test-callback`, {
                method: 'POST',
            });
            const data = result?.data || {};
            setResellerApiInfo(
                data.delivered
                    ? `Tes callback diterima website reseller (HTTP ${data.status}).`
                    : `Tes callback gagal: ${data.error || data.status || 'tanpa keterangan'}`,
                data.delivered ? 'success' : 'failed',
            );
        } catch (error) {
            setResellerApiInfo(error.message || 'Gagal mengirim tes callback.', 'failed');
        }
    }

    async function retryResellerApiCallback(orderId) {
        try {
            const result = await resellerApiRequest(`/api/admin/reseller-api/orders/${encodeURIComponent(orderId)}/retry-callback`, {
                method: 'POST',
            });
            setResellerApiInfo(
                result?.data?.delivered ? 'Callback berhasil dikirim.' : `Callback belum berhasil: ${result?.data?.error || '-'}`,
                result?.data?.delivered ? 'success' : 'failed',
            );
            await loadResellerApiDashboard();
        } catch (error) {
            setResellerApiInfo(error.message || 'Gagal mengirim ulang callback.', 'failed');
        }
    }

    async function saveResellerApiGlobalToggle() {
        if (!resellerApiEnabledInputEl) return;
        const enabled = resellerApiEnabledInputEl.checked;
        if (!enabled) {
            const confirmed = await showConfirmDialog({
                title: 'Matikan API Reseller',
                message: 'Semua website reseller langsung tidak bisa bertransaksi sampai API dinyalakan lagi. Lanjutkan?',
                confirmText: 'Matikan',
                cancelText: 'Batal',
            });
            if (!confirmed) {
                resellerApiEnabledInputEl.checked = true;
                return;
            }
        }
        try {
            await resellerApiRequest('/api/admin/reseller-api/settings', { method: 'POST', body: { enabled } });
            setResellerApiInfo(enabled ? 'API reseller aktif.' : 'API reseller dimatikan untuk semua reseller.', enabled ? 'success' : 'failed');
        } catch (error) {
            resellerApiEnabledInputEl.checked = !enabled;
            setResellerApiInfo(error.message || 'Gagal menyimpan saklar API reseller.', 'failed');
        }
    }

    async function copyResellerApiCredential(sourceId, button) {
        const text = document.getElementById(sourceId)?.textContent || '';
        if (!text || text === '-') return;
        try {
            await navigator.clipboard.writeText(text);
        } catch (_error) {
            const range = document.createRange();
            range.selectNodeContents(document.getElementById(sourceId));
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
        }
        const original = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Tersalin';
        setTimeout(function() { button.innerHTML = original; }, 1500);
    }

    if (refreshResellerApiBtn) refreshResellerApiBtn.addEventListener('click', function() { void loadResellerApiDashboard(); });
    if (saveResellerApiClientBtn) saveResellerApiClientBtn.addEventListener('click', function() { void saveResellerApiClient(); });
    if (cancelResellerApiEditBtn) {
        cancelResellerApiEditBtn.addEventListener('click', function() {
            resetResellerApiForm();
            setResellerApiInfo('Edit dibatalkan.', '');
        });
    }
    if (resellerApiOrdersFilterEl) resellerApiOrdersFilterEl.addEventListener('change', function() { void loadResellerApiDashboard(); });
    if (resellerApiEnabledInputEl) resellerApiEnabledInputEl.addEventListener('change', function() { void saveResellerApiGlobalToggle(); });
    document.querySelectorAll('.reseller-api-copy').forEach(function(button) {
        button.addEventListener('click', function() {
            void copyResellerApiCredential(button.dataset.copySource, button);
        });
    });

    function renderAdminTransactions(transactions) {
        if (!adminTransactionListEl) return;
        adminTransactionListEl.innerHTML = '';

        if (!transactions.length) {
            const row = document.createElement('tr');
            const cell = createCell('Belum ada riwayat pembelian user.');
            cell.colSpan = 7;
            row.appendChild(cell);
            adminTransactionListEl.appendChild(row);
            return;
        }

        transactions.forEach(function(transaction) {
            const row = document.createElement('tr');
            const statusInfo = mapTransactionStatus(transaction.status);
            const userName = transaction?.user?.username || transaction?.user?.email || '-';
            const productName = transaction.productName || transaction.buyerSkuCode || '-';
            const priceValue = typeof transaction.price === 'number' ? transaction.price : Number(transaction.price);

            const dateCell = createCell(formatDate(transaction.createdAt));
            dateCell.dataset.label = 'Tanggal & Jam';
            row.appendChild(dateCell);

            const userCell = createCell(userName);
            userCell.dataset.label = 'User';
            row.appendChild(userCell);

            const productCell = createCell(productName);
            productCell.dataset.label = 'Produk';
            row.appendChild(productCell);

            const customerCell = createCell(transaction.customerNo || '-');
            customerCell.dataset.label = 'Tujuan';
            row.appendChild(customerCell);

            const amountCell = createCell(formatRupiah(priceValue));
            amountCell.dataset.label = 'Jumlah';
            row.appendChild(amountCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const status = document.createElement('span');
            status.className = `status ${statusInfo.className}`;
            status.textContent = statusInfo.label;
            statusCell.appendChild(status);
            row.appendChild(statusCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            const detailBtn = document.createElement('button');
            detailBtn.type = 'button';
            detailBtn.className = 'receipt-btn';
            detailBtn.innerHTML = '<i class="fas fa-circle-info"></i> Detail';
            detailBtn.addEventListener('click', function() {
                showAdminTransactionDetail(transaction);
            });
            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'receipt-btn';
            downloadBtn.innerHTML = '<i class="fas fa-file-download"></i> Download Struk';
            downloadBtn.addEventListener('click', function() {
                downloadReceipt(transaction);
            });
            actionCell.appendChild(detailBtn);
            actionCell.appendChild(downloadBtn);
            row.appendChild(actionCell);

            adminTransactionListEl.appendChild(row);
        });
    }

    function renderAdminProducts(products, emptyMessage) {
        if (!adminProductListEl) return;
        adminProductListEl.innerHTML = '';

        if (!products.length) {
            const row = document.createElement('tr');
            const cell = createCell(emptyMessage || 'Belum ada produk. Klik Sync Produk.');
            cell.colSpan = 11;
            row.appendChild(cell);
            adminProductListEl.appendChild(row);
            return;
        }

        products.forEach(function(product) {
            const row = document.createElement('tr');
            const productCell = createCell(product.product_name || product.buyer_sku_code || '-');
            productCell.dataset.label = 'Produk';
            row.appendChild(productCell);

            const categoryCell = createCell(product.category || '-');
            categoryCell.dataset.label = 'Kategori';
            row.appendChild(categoryCell);

            const brandCell = createCell(product.brand || '-');
            brandCell.dataset.label = 'Brand';
            row.appendChild(brandCell);

            const typeCell = createCell(product.type || '-');
            typeCell.dataset.label = 'Type';
            row.appendChild(typeCell);

            const basePriceCell = createCell(formatRupiah(product.base_price));
            basePriceCell.dataset.label = 'Harga Asli';
            row.appendChild(basePriceCell);

            const finalPriceCell = createCell(formatRupiah(product.price));
            finalPriceCell.dataset.label = 'Harga Final';
            row.appendChild(finalPriceCell);

            const statusCell = document.createElement('td');
            statusCell.dataset.label = 'Status';
            const status = document.createElement('span');
            status.className = product.buyer_product_status ? 'status success' : 'status failed';
            status.textContent = product.auto_disabled_at
                ? 'Auto Nonaktif'
                : (product.buyer_product_status ? 'Aktif' : 'Nonaktif');
            statusCell.appendChild(status);
            // Dua keadaan ini membuat produk tidak terlihat oleh user, apa pun
            // status aktif/gangguannya.
            if (product.provider_active === false) {
                const providerNote = document.createElement('span');
                providerNote.className = 'status failed admin-product-flag';
                providerNote.textContent = 'Tidak ada di Digiflazz';
                statusCell.appendChild(providerNote);
            }
            if (product.hidden_at) {
                const hiddenNote = document.createElement('span');
                hiddenNote.className = 'status pending admin-product-flag';
                hiddenNote.textContent = 'Disembunyikan';
                statusCell.appendChild(hiddenNote);
            }
            // Beberapa SKU dengan nama sama digabung jadi satu kartu di sisi
            // user. Yang modalnya tertinggi tampil, sisanya jadi cadangan saat
            // SKU itu gagal. SKU yang terakhir berhasil dibeli dicoba duluan.
            // Lihat server/product-fallback.js.
            if (Number(product.fallback_group_size) > 1) {
                const supplierText = `supplier #${product.fallback_rank || '-'} dari ${product.fallback_group_size}`;
                const groupNote = document.createElement('span');
                groupNote.className = product.fallback_primary
                    ? 'status success admin-product-flag'
                    : 'status pending admin-product-flag';
                groupNote.textContent = product.fallback_primary
                    ? `Tampil ke user · ${supplierText}`
                    : `Cadangan · ${supplierText}`;
                statusCell.appendChild(groupNote);
                if (product.fallback_preferred) {
                    const preferredNote = document.createElement('span');
                    preferredNote.className = 'status success admin-product-flag';
                    preferredNote.textContent = 'Dipakai duluan';
                    preferredNote.title = product.last_purchase_success_at
                        ? `Terakhir berhasil dibeli ${formatDate(product.last_purchase_success_at)}`
                        : '';
                    statusCell.appendChild(preferredNote);
                }
            }
            if (product.auto_disabled_reason) {
                const reason = document.createElement('small');
                reason.className = 'admin-product-note';
                reason.textContent = product.auto_disabled_reason;
                statusCell.appendChild(reason);
            }
            row.appendChild(statusCell);

            const failedCell = createCell(product.failure_count ? `${product.failure_count}x` : '-');
            failedCell.dataset.label = 'Gagal';
            if (product.last_failure_message) {
                const message = document.createElement('small');
                message.className = 'admin-product-note';
                message.textContent = product.last_failure_message;
                failedCell.appendChild(message);
            }
            row.appendChild(failedCell);

            const quickActionCell = document.createElement('td');
            quickActionCell.dataset.label = 'Layanan Cepat';
            const isQuickService = quickServiceSkus.includes(String(product.buyer_sku_code || ''));
            const quickBtn = document.createElement('button');
            quickBtn.type = 'button';
            quickBtn.className = 'receipt-btn';
            quickBtn.dataset.quickServiceSku = String(product.buyer_sku_code || '');
            quickBtn.dataset.quickServiceEnabled = isQuickService ? '1' : '0';
            quickBtn.disabled = !product.buyer_product_status;
            quickBtn.innerHTML = isQuickService
                ? '<i class="fas fa-star"></i> Tampil'
                : '<i class="far fa-star"></i> Tampilkan';
            quickActionCell.appendChild(quickBtn);
            row.appendChild(quickActionCell);

            const promoActionCell = document.createElement('td');
            promoActionCell.dataset.label = 'Promo';
            const isPromoProduct = isActiveAdminPromoSku(product.buyer_sku_code);
            const promoBtn = document.createElement('button');
            promoBtn.type = 'button';
            promoBtn.className = 'receipt-btn';
            promoBtn.dataset.promoSku = String(product.buyer_sku_code || '');
            promoBtn.innerHTML = isPromoProduct
                ? '<i class="fas fa-bullhorn"></i> Promo Aktif'
                : '<i class="fas fa-bullhorn"></i> Promo';
            promoActionCell.appendChild(promoBtn);
            row.appendChild(promoActionCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            const statusBtn = document.createElement('button');
            const shouldActivate = !product.buyer_product_status || Boolean(product.auto_disabled_at);
            statusBtn.type = 'button';
            statusBtn.className = 'receipt-btn';
            statusBtn.dataset.productStatusSku = String(product.buyer_sku_code || '');
            statusBtn.dataset.productStatusActive = shouldActivate ? '1' : '0';
            statusBtn.innerHTML = shouldActivate
                ? '<i class="fas fa-power-off"></i> Aktifkan'
                : '<i class="fas fa-ban"></i> Nonaktifkan';
            // Produk yang sudah hilang dari Digiflazz tidak bisa diaktifkan
            // dari sini; server juga menolaknya.
            statusBtn.disabled = shouldActivate && product.provider_active === false;
            actionCell.appendChild(statusBtn);

            const isHidden = Boolean(product.hidden_at);
            const visibilityBtn = document.createElement('button');
            visibilityBtn.type = 'button';
            visibilityBtn.className = 'receipt-btn';
            visibilityBtn.dataset.productVisibilitySku = String(product.buyer_sku_code || '');
            visibilityBtn.dataset.productVisibilityHide = isHidden ? '0' : '1';
            visibilityBtn.innerHTML = isHidden
                ? '<i class="fas fa-eye"></i> Tampilkan ke User'
                : '<i class="fas fa-eye-slash"></i> Sembunyikan';
            actionCell.appendChild(visibilityBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'receipt-btn admin-product-delete-btn';
            deleteBtn.dataset.productDeleteSku = String(product.buyer_sku_code || '');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus';
            actionCell.appendChild(deleteBtn);
            row.appendChild(actionCell);

            adminProductListEl.appendChild(row);
        });
    }

    function getFilteredAdminProductsByCategory(category) {
        if (!category) return allAdminProducts;
        return allAdminProducts.filter(function(product) {
            return normalizeFilterValue(product.category, 'Lainnya') === category;
        });
    }

    function getFilteredAdminProductsByCategoryBrand(category, brand) {
        return getFilteredAdminProductsByCategory(category).filter(function(product) {
            return !brand || normalizeFilterValue(product.brand, 'Tanpa Brand') === brand;
        });
    }

    function getAdminCategories() {
        return Array.from(new Set(allAdminProducts.map(function(product) {
            return normalizeFilterValue(product.category, 'Lainnya');
        }))).sort();
    }

    function getAdminBrands(category) {
        return Array.from(new Set(getFilteredAdminProductsByCategory(category).map(function(product) {
            return normalizeFilterValue(product.brand, 'Tanpa Brand');
        }))).sort();
    }

    function getAdminTypes(category, brand) {
        return Array.from(new Set(getFilteredAdminProductsByCategoryBrand(category, brand).map(function(product) {
            return normalizeFilterValue(product.type, 'Tanpa Type');
        }))).sort();
    }

    function renderAdminCategoryMenu(categories) {
        if (!adminCategoryListEl || !adminCategoryCountEl) return;
        const counts = countByValue(allAdminProducts, function(product) {
            return normalizeFilterValue(product.category, 'Lainnya');
        });
        adminCategoryListEl.innerHTML = '';
        adminCategoryListEl.appendChild(createFilterChip(
            'category',
            '',
            'Semua',
            allAdminProducts.length,
            selectedAdminCategory === ''
        ));
        categories.forEach(function(category) {
            adminCategoryListEl.appendChild(createFilterChip(
                'category',
                category,
                category,
                counts[category] || 0,
                selectedAdminCategory === category
            ));
        });
        adminCategoryCountEl.textContent = String(categories.length);
    }

    function renderAdminBrandMenu(brands) {
        if (!adminBrandListEl || !adminBrandCountEl) return;
        const baseItems = getFilteredAdminProductsByCategory(selectedAdminCategory);
        const counts = countByValue(baseItems, function(product) {
            return normalizeFilterValue(product.brand, 'Tanpa Brand');
        });
        adminBrandListEl.innerHTML = '';
        adminBrandListEl.appendChild(createFilterChip(
            'brand',
            '',
            'Semua',
            baseItems.length,
            selectedAdminBrand === ''
        ));
        brands.forEach(function(brand) {
            adminBrandListEl.appendChild(createFilterChip(
                'brand',
                brand,
                brand,
                counts[brand] || 0,
                selectedAdminBrand === brand
            ));
        });
        adminBrandCountEl.textContent = String(brands.length);
    }

    function renderAdminTypeMenu(types) {
        if (!adminTypeListEl || !adminTypeCountEl) return;
        const baseItems = getFilteredAdminProductsByCategoryBrand(selectedAdminCategory, selectedAdminBrand);
        const counts = countByValue(baseItems, function(product) {
            return normalizeFilterValue(product.type, 'Tanpa Type');
        });
        adminTypeListEl.innerHTML = '';
        adminTypeListEl.appendChild(createFilterChip(
            'type',
            '',
            'Semua',
            baseItems.length,
            selectedAdminType === ''
        ));
        types.forEach(function(type) {
            adminTypeListEl.appendChild(createFilterChip(
                'type',
                type,
                type,
                counts[type] || 0,
                selectedAdminType === type
            ));
        });
        adminTypeCountEl.textContent = String(types.length);
    }

    function renderAdminCategoryFilter(categories) {
        if (!adminCategoryFilterEl) return;
        adminCategoryFilterEl.innerHTML = '';
        adminCategoryFilterEl.appendChild(new Option('Semua kategori', ''));
        categories.forEach(function(category) {
            adminCategoryFilterEl.appendChild(new Option(category, category));
        });
        adminCategoryFilterEl.value = selectedAdminCategory;
        renderFancyFilterSelect(adminCategoryFilterEl, adminCategoryFilterCustomEl, 'Semua kategori');
    }

    function renderAdminBrandFilter(brands) {
        if (!adminBrandFilterEl) return;
        adminBrandFilterEl.innerHTML = '';
        adminBrandFilterEl.appendChild(new Option('Semua brand', ''));
        brands.forEach(function(brand) {
            adminBrandFilterEl.appendChild(new Option(brand, brand));
        });
        adminBrandFilterEl.value = selectedAdminBrand;
        renderFancyFilterSelect(adminBrandFilterEl, adminBrandFilterCustomEl, 'Semua brand');
    }

    function renderAdminTypeFilter(types) {
        if (!adminTypeFilterEl) return;
        adminTypeFilterEl.innerHTML = '';
        adminTypeFilterEl.appendChild(new Option('Semua type', ''));
        types.forEach(function(type) {
            adminTypeFilterEl.appendChild(new Option(type, type));
        });
        adminTypeFilterEl.value = selectedAdminType;
        renderFancyFilterSelect(adminTypeFilterEl, adminTypeFilterCustomEl, 'Semua type');
    }

    function renderAdminProductFilters() {
        const categories = getAdminCategories();
        if (selectedAdminCategory && !categories.includes(selectedAdminCategory)) {
            selectedAdminCategory = '';
        }
        const brands = getAdminBrands(selectedAdminCategory);
        if (selectedAdminBrand && !brands.includes(selectedAdminBrand)) {
            selectedAdminBrand = '';
        }
        const types = getAdminTypes(selectedAdminCategory, selectedAdminBrand);
        if (selectedAdminType && !types.includes(selectedAdminType)) {
            selectedAdminType = '';
        }

        renderAdminCategoryMenu(categories);
        renderAdminBrandMenu(brands);
        renderAdminTypeMenu(types);
        renderAdminCategoryFilter(categories);
        renderAdminBrandFilter(brands);
        renderAdminTypeFilter(types);
    }

    function filterAdminProducts() {
        const skuKeyword = (adminSkuSearchEl?.value || '').trim().toLowerCase();
        return allAdminProducts.filter(function(product) {
            const category = normalizeFilterValue(product.category, 'Lainnya');
            const brand = normalizeFilterValue(product.brand, 'Tanpa Brand');
            const type = normalizeFilterValue(product.type, 'Tanpa Type');
            const sku = String(product.buyer_sku_code || '').toLowerCase();
            const byCategory = !selectedAdminCategory || selectedAdminCategory === category;
            const byBrand = !selectedAdminBrand || selectedAdminBrand === brand;
            const byType = !selectedAdminType || selectedAdminType === type;
            const bySku = !skuKeyword || sku.includes(skuKeyword);
            const byFailed = !showFailedProductsOnly || Boolean(product.auto_disabled_at);
            return byCategory && byBrand && byType && bySku && byFailed;
        });
    }

    function applyAdminProductFilters() {
        const filtered = filterAdminProducts();
        const totalPages = Math.max(1, Math.ceil(filtered.length / adminProductPageSize));
        if (currentAdminProductPage > totalPages) currentAdminProductPage = totalPages;
        if (currentAdminProductPage < 1) currentAdminProductPage = 1;

        const startIndex = (currentAdminProductPage - 1) * adminProductPageSize;
        const paged = filtered.slice(startIndex, startIndex + adminProductPageSize);
        renderAdminProducts(paged, 'Produk tidak ditemukan dengan filter saat ini.');

        if (productPageInfoEl) {
            productPageInfoEl.textContent = `Halaman ${currentAdminProductPage} / ${totalPages}`;
        }
        if (productPrevPageBtn) productPrevPageBtn.disabled = currentAdminProductPage <= 1;
        if (productNextPageBtn) productNextPageBtn.disabled = currentAdminProductPage >= totalPages;
        if (adminProductStatusEl) {
            adminProductStatusEl.textContent = `Menampilkan ${paged.length} dari ${filtered.length} produk (total ${allAdminProducts.length})`;
        }
        if (adminFailedProductsToggleEl) {
            adminFailedProductsToggleEl.classList.toggle('active', showFailedProductsOnly);
            adminFailedProductsToggleEl.innerHTML = showFailedProductsOnly
                ? '<i class="fas fa-list"></i> Semua Produk'
                : '<i class="fas fa-triangle-exclamation"></i> Produk Gangguan';
        }
    }

    function changeProductPage(delta) {
        currentAdminProductPage += delta;
        applyAdminProductFilters();
    }

    function setAdminCategory(value) {
        currentAdminProductPage = 1;
        selectedAdminCategory = value;
        selectedAdminBrand = '';
        selectedAdminType = '';
        renderAdminProductFilters();
        applyAdminProductFilters();
    }

    function setAdminBrand(value) {
        currentAdminProductPage = 1;
        selectedAdminBrand = value;
        selectedAdminType = '';
        renderAdminProductFilters();
        applyAdminProductFilters();
    }

    function setAdminType(value) {
        currentAdminProductPage = 1;
        selectedAdminType = value;
        renderAdminProductFilters();
        applyAdminProductFilters();
    }

    async function loadProductSummary() {
        try {
            const response = await fetch('/api/products/summary');
            if (!response.ok) throw new Error('Gagal mengambil summary produk');
            const result = await response.json();
            const data = result?.data || {};

            if (productCountStatEl) productCountStatEl.textContent = data.active || 0;
            if (adminProductTotalEl) adminProductTotalEl.textContent = data.total || 0;
            if (adminProductActiveEl) adminProductActiveEl.textContent = data.active || 0;
            if (adminProductInactiveEl) adminProductInactiveEl.textContent = data.inactive || 0;
            if (adminProductFailedEl) adminProductFailedEl.textContent = data.autoDisabled || 0;
            if (adminProductLastSyncEl) adminProductLastSyncEl.textContent = formatDate(data.lastSyncedAt);
        } catch (_err) {
            if (productSyncInfoEl) productSyncInfoEl.textContent = 'Summary produk belum bisa dimuat.';
        }
    }

    function getTodayDateKey() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getCurrentMonthKey() {
        return getTodayDateKey().slice(0, 7);
    }

    function ensureOverviewPeriodDefaults() {
        const today = getTodayDateKey();
        if (overviewDateInputEl && !overviewDateInputEl.value) overviewDateInputEl.value = today;
        if (overviewMonthInputEl && !overviewMonthInputEl.value) overviewMonthInputEl.value = getCurrentMonthKey();
        if (overviewYearInputEl && !overviewYearInputEl.value) overviewYearInputEl.value = today.slice(0, 4);
        if (overviewDateFromInputEl && !overviewDateFromInputEl.value) overviewDateFromInputEl.value = today;
        if (overviewDateToInputEl && !overviewDateToInputEl.value) overviewDateToInputEl.value = today;
    }

    function updateOverviewPeriodInputs() {
        ensureOverviewPeriodDefaults();
        const type = String(overviewPeriodTypeEl?.value || 'all');
        const fields = [
            overviewDateInputEl,
            overviewMonthInputEl,
            overviewYearInputEl,
            overviewDateFromInputEl,
            overviewDateToInputEl,
        ];
        fields.forEach(function(field) {
            if (field) field.hidden = true;
        });
        if (type === 'day' && overviewDateInputEl) overviewDateInputEl.hidden = false;
        if (type === 'month' && overviewMonthInputEl) overviewMonthInputEl.hidden = false;
        if (type === 'year' && overviewYearInputEl) overviewYearInputEl.hidden = false;
        if (type === 'range') {
            if (overviewDateFromInputEl) overviewDateFromInputEl.hidden = false;
            if (overviewDateToInputEl) overviewDateToInputEl.hidden = false;
        }
    }

    function getOverviewPeriodQuery() {
        ensureOverviewPeriodDefaults();
        const type = String(overviewPeriodTypeEl?.value || 'all');
        const params = new URLSearchParams();
        params.set('period', type);
        if (type === 'day') params.set('date', overviewDateInputEl?.value || getTodayDateKey());
        if (type === 'month') params.set('month', overviewMonthInputEl?.value || getCurrentMonthKey());
        if (type === 'year') params.set('year', overviewYearInputEl?.value || getTodayDateKey().slice(0, 4));
        if (type === 'range') {
            params.set('dateFrom', overviewDateFromInputEl?.value || getTodayDateKey());
            params.set('dateTo', overviewDateToInputEl?.value || getTodayDateKey());
        }
        return params.toString();
    }

    function setCirclePercent(element, percent) {
        if (!element) return;
        const safePercent = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
        element.style.setProperty('--value', String(safePercent));
    }

    function updateAdminOverviewDetails(data = {}) {
        const totalRevenue = Number(data.totalRevenue || 0);
        const estimatedModal = Number(data.estimatedModal || 0);
        const estimatedGrossMargin = Number(data.estimatedGrossMargin || 0);
        const estimatedQrisFee = Number(data.estimatedQrisFee || 0);
        const estimatedRuleMargin = Number(data.estimatedRuleMargin || 0);
        const estimatedRounding = Number(data.estimatedRounding || 0);
        const successRate = Number(data.successRate || 0);
        const failedRate = Number(data.failedRate || 0);
        const disruptionRate = Number(data.productDisruptionRate || 0);
        const marginRate = Number(data.marginRate || 0);

        if (overviewRevenueTotalEl) overviewRevenueTotalEl.textContent = formatRupiah(totalRevenue);
        if (overviewModalTotalEl) overviewModalTotalEl.textContent = formatRupiah(estimatedModal);
        if (overviewGrossMarginEl) overviewGrossMarginEl.textContent = formatRupiah(estimatedGrossMargin);
        if (overviewQrisFeeEl) overviewQrisFeeEl.textContent = formatRupiah(estimatedQrisFee);
        if (overviewPricingNoteEl) {
            const periodLabel = data?.period?.label || 'Semua waktu';
            overviewPricingNoteEl.textContent = `Periode: ${periodLabel}. Estimasi berdasarkan ${Number(data.pricedSuccessTransactions || 0)} transaksi sukses yang SKU-nya masih ada di cache produk.`;
        }
        if (overviewPeriodLabelEl) overviewPeriodLabelEl.textContent = data?.period?.label || 'Semua waktu';

        setCirclePercent(overviewSuccessCircleEl, successRate);
        if (overviewSuccessRateEl) overviewSuccessRateEl.textContent = `${successRate}%`;
        if (overviewSuccessTransactionsEl) overviewSuccessTransactionsEl.textContent = String(Number(data.successTransactions || 0));
        if (overviewFailedTransactionsEl) overviewFailedTransactionsEl.textContent = `${Number(data.failedTransactions || 0)} (${failedRate}%)`;
        if (overviewProcessTransactionsEl) overviewProcessTransactionsEl.textContent = String(Number(data.processTransactions || 0));

        setCirclePercent(overviewDisruptionCircleEl, disruptionRate);
        if (overviewDisruptionRateEl) overviewDisruptionRateEl.textContent = `${disruptionRate}%`;
        if (overviewActiveProductsEl) overviewActiveProductsEl.textContent = String(Number(data.activeProducts || 0));
        if (overviewDisruptedProductsEl) overviewDisruptedProductsEl.textContent = String(Number(data.disruptedProducts || 0));
        if (overviewTotalProductsEl) overviewTotalProductsEl.textContent = String(Number(data.totalProducts || 0));

        setCirclePercent(overviewMarginCircleEl, marginRate);
        if (overviewMarginRateEl) overviewMarginRateEl.textContent = `${marginRate}%`;
        if (overviewRuleMarginEl) overviewRuleMarginEl.textContent = formatRupiah(estimatedRuleMargin);
        if (overviewRoundingEl) overviewRoundingEl.textContent = formatRupiah(estimatedRounding);
        if (overviewPricedTransactionsEl) overviewPricedTransactionsEl.textContent = `${Number(data.pricedSuccessTransactions || 0)} trx`;
    }

    async function loadAdminOverview() {
        try {
            const query = getOverviewPeriodQuery();
            const response = await fetch(`/api/admin/overview?${query}`);
            if (!response.ok) throw new Error('Gagal mengambil ringkasan dashboard');
            const result = await response.json();
            const data = result?.data || {};
            setStatusElement(overviewStatusEl, '', '', 'checkout-status');
            if (userCountStatEl) userCountStatEl.textContent = String(data.totalUsers || 0);
            if (transactionCountStatEl) transactionCountStatEl.textContent = String(data.totalTransactions || 0);
            if (revenueStatEl) revenueStatEl.textContent = formatRupiah(Number(data.totalRevenue || 0));
            if (productCountStatEl) productCountStatEl.textContent = String(data.activeProducts || data.totalProducts || 0);
            updateAdminOverviewDetails(data);
        } catch (_error) {
            if (userCountStatEl) userCountStatEl.textContent = '-';
            if (transactionCountStatEl) transactionCountStatEl.textContent = '-';
            if (revenueStatEl) revenueStatEl.textContent = '-';
            if (productCountStatEl) productCountStatEl.textContent = '-';
            updateAdminOverviewDetails({});
            setStatusElement(
                overviewStatusEl,
                'Ringkasan gagal dimuat, jadi angkanya belum tentu nol. Cek log server lalu muat ulang halaman.',
                'failed',
                'checkout-status'
            );
        }
    }

    async function loadAdminProducts() {
        setStatusElement(adminProductStatusEl, 'Memuat produk...', 'loading', 'product-status');
        try {
            const response = await fetch('/api/products?active=all&take=2000');
            if (!response.ok) throw new Error('Gagal mengambil produk');
            const result = await response.json();
            allAdminProducts = Array.isArray(result?.data) ? result.data : [];
            quickServiceSkus = Array.isArray(result?.meta?.quickServiceSkus) ? result.meta.quickServiceSkus : [];
            currentAdminProductPage = 1;
            renderAdminProductFilters();
            applyAdminProductFilters();
        } catch (_err) {
            allAdminProducts = [];
            quickServiceSkus = [];
            currentAdminProductPage = 1;
            renderAdminProductFilters();
            renderAdminProducts([], 'Belum ada produk. Klik Sync Produk.');
            setStatusElement(adminProductStatusEl, 'Produk belum bisa dimuat.', 'failed', 'product-status');
        }
    }

    // ===== Perbandingan harga seller =====
    //
    // Produk yang dijual beberapa seller Digiflazz. Harga ke user mengikuti
    // seller aktif termahal, jadi seller yang jauh lebih mahal ikut menaikkan
    // harga. Perhitungannya di server/product-seller-gaps.js, dari seluruh
    // katalog; halaman ini hanya menampilkan dan menjalankan tombolnya.
    const sellerGapMinSellersEl = document.getElementById('sellerGapMinSellers');
    const sellerGapDiffInputEl = document.getElementById('sellerGapDiffInput');
    const sellerGapDiffModeEl = document.getElementById('sellerGapDiffMode');
    const sellerGapSearchEl = document.getElementById('sellerGapSearch');
    const sellerGapOnlyFlaggedEl = document.getElementById('sellerGapOnlyFlagged');
    const sellerGapLoadBtn = document.getElementById('sellerGapLoadBtn');
    const sellerGapBulkDisableBtn = document.getElementById('sellerGapBulkDisableBtn');
    const sellerGapStatusEl = document.getElementById('sellerGapStatus');
    const sellerGapListEl = document.getElementById('sellerGapList');
    const sellerGapPaginationEl = document.getElementById('sellerGapPagination');
    const sellerGapPrevPageBtn = document.getElementById('sellerGapPrevPage');
    const sellerGapNextPageBtn = document.getElementById('sellerGapNextPage');
    const sellerGapPageInfoEl = document.getElementById('sellerGapPageInfo');
    const sellerGapPageSize = 15;
    let sellerGapGroups = [];
    let sellerGapPage = 1;
    let sellerGapLoaded = false;

    function setSellerGapStatus(message, type) {
        setStatusElement(sellerGapStatusEl, message, type, 'product-status');
    }

    function getSellerGapQuery() {
        const params = new URLSearchParams();
        params.set('minSellers', String(sellerGapMinSellersEl?.value || '2'));
        const diff = Number(sellerGapDiffInputEl?.value || 0);
        if (diff > 0) {
            params.set('diff', String(diff));
            params.set('mode', String(sellerGapDiffModeEl?.value || 'amount'));
        }
        if (sellerGapOnlyFlaggedEl?.checked) params.set('onlyFlagged', 'true');
        const search = String(sellerGapSearchEl?.value || '').trim();
        if (search) params.set('q', search);
        return params.toString();
    }

    function getSellerGapFlaggedSkus() {
        return sellerGapGroups.flatMap(function(group) {
            return (group.sellers || []).filter(function(seller) { return seller.flagged; }).map(function(seller) { return seller.sku; });
        });
    }

    function formatSellerGapDiff(seller) {
        if (seller.diffAmount === null || seller.diffAmount === undefined) return '-';
        if (seller.diffAmount === 0) return 'Rp 0';
        return `+${formatRupiah(Number(seller.diffAmount))} (${seller.diffPercent}%)`;
    }

    function createSellerGapTag(text, className) {
        const tag = document.createElement('span');
        tag.className = `status ${className} admin-product-flag`;
        tag.textContent = text;
        return tag;
    }

    function renderSellerGapGroup(group) {
        const card = document.createElement('article');
        card.className = `seller-gap-group${group.flaggedCount ? ' has-flag' : ''}`;

        const head = document.createElement('div');
        head.className = 'seller-gap-head';
        const spreadText = group.cheapestPrice
            ? `Modal ${formatRupiah(Number(group.cheapestPrice))} sampai ${formatRupiah(Number(group.highestPrice))}`
                + (group.spreadAmount ? `, selisih ${formatRupiah(Number(group.spreadAmount))} (${group.spreadPercent}%)` : '')
            : 'Belum ada seller aktif';
        const priceChanges = group.userPriceAfter !== null && group.userPriceAfter !== undefined
            && group.userPriceAfter !== group.currentUserPrice;
        const priceText = typeof group.currentUserPrice === 'number'
            ? `Harga user ${formatRupiah(group.currentUserPrice)}`
                + (priceChanges ? ` → ${formatRupiah(group.userPriceAfter)} kalau seller yang ditandai dinonaktifkan` : '')
            : '';
        head.innerHTML = `
            <div class="seller-gap-title">
                <strong>${escapeHtml(group.productName || '-')}</strong>
                <small>${escapeHtml([group.brand, group.category, group.type].filter(Boolean).join(' · '))}</small>
            </div>
            <div class="seller-gap-meta">
                <span class="status pending">${Number(group.sellerCount || 0)} seller · ${Number(group.activeCount || 0)} aktif</span>
                ${group.flaggedCount ? `<span class="status failed">${Number(group.flaggedCount)} melewati batas</span>` : ''}
                <span>${escapeHtml(spreadText)}</span>
                ${priceText ? `<span class="seller-gap-price">${escapeHtml(priceText)}</span>` : ''}
            </div>
        `;
        card.appendChild(head);

        const scroll = document.createElement('div');
        scroll.className = 'admin-table-scroll';
        const table = document.createElement('table');
        table.className = 'transactions-table seller-gap-table';
        table.innerHTML = '<thead><tr><th>Seller</th><th>Modal</th><th>Selisih dari termurah</th><th>Keterangan</th><th>Aksi</th></tr></thead>';
        const body = document.createElement('tbody');

        (group.sellers || []).forEach(function(seller) {
            const row = document.createElement('tr');
            if (seller.flagged) row.className = 'is-flagged';

            const skuCell = document.createElement('td');
            skuCell.dataset.label = 'Seller';
            skuCell.className = 'gateway-copy';
            skuCell.innerHTML = `<strong>#${escapeHtml(String(seller.rank || '-'))}</strong> ${escapeHtml(seller.sku || '-')}`;
            row.appendChild(skuCell);

            const priceCell = createCell(seller.price ? formatRupiah(Number(seller.price)) : '-');
            priceCell.dataset.label = 'Modal';
            row.appendChild(priceCell);

            const diffCell = createCell(formatSellerGapDiff(seller));
            diffCell.dataset.label = 'Selisih';
            row.appendChild(diffCell);

            const noteCell = document.createElement('td');
            noteCell.dataset.label = 'Keterangan';
            if (seller.flagged) noteCell.appendChild(createSellerGapTag('Melewati batas', 'failed'));
            if (seller.displayed) noteCell.appendChild(createSellerGapTag('Tampil ke user', 'success'));
            if (seller.preferred) noteCell.appendChild(createSellerGapTag('Dipakai duluan', 'success'));
            if (seller.cheapest) noteCell.appendChild(createSellerGapTag('Termurah', 'seller-gap-cheapest'));
            if (seller.state === 'DISABLED') noteCell.appendChild(createSellerGapTag('Nonaktif', 'failed'));
            if (seller.state === 'HIDDEN') noteCell.appendChild(createSellerGapTag('Disembunyikan', 'pending'));
            if (!noteCell.childNodes.length) noteCell.textContent = '-';
            row.appendChild(noteCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            if (seller.state === 'ACTIVE' || seller.state === 'DISABLED') {
                const activate = seller.state === 'DISABLED';
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'receipt-btn';
                button.dataset.sellerGapSku = seller.sku;
                button.dataset.sellerGapActive = activate ? '1' : '0';
                button.dataset.sellerGapDisplayed = seller.displayed ? '1' : '0';
                button.innerHTML = activate
                    ? '<i class="fas fa-power-off"></i> Aktifkan'
                    : '<i class="fas fa-ban"></i> Nonaktifkan';
                actionCell.appendChild(button);
            } else {
                actionCell.textContent = 'Atur di daftar produk';
            }
            row.appendChild(actionCell);

            body.appendChild(row);
        });

        table.appendChild(body);
        scroll.appendChild(table);
        card.appendChild(scroll);
        return card;
    }

    function renderSellerGapPage() {
        if (!sellerGapListEl) return;
        sellerGapListEl.innerHTML = '';
        const totalPages = Math.max(1, Math.ceil(sellerGapGroups.length / sellerGapPageSize));
        if (sellerGapPage > totalPages) sellerGapPage = totalPages;
        if (sellerGapPage < 1) sellerGapPage = 1;
        const start = (sellerGapPage - 1) * sellerGapPageSize;
        sellerGapGroups.slice(start, start + sellerGapPageSize).forEach(function(group) {
            sellerGapListEl.appendChild(renderSellerGapGroup(group));
        });
        if (sellerGapPaginationEl) sellerGapPaginationEl.hidden = sellerGapGroups.length <= sellerGapPageSize;
        if (sellerGapPageInfoEl) sellerGapPageInfoEl.textContent = `Halaman ${sellerGapPage} / ${totalPages}`;
        if (sellerGapPrevPageBtn) sellerGapPrevPageBtn.disabled = sellerGapPage <= 1;
        if (sellerGapNextPageBtn) sellerGapNextPageBtn.disabled = sellerGapPage >= totalPages;

        const flaggedCount = getSellerGapFlaggedSkus().length;
        if (sellerGapBulkDisableBtn) {
            sellerGapBulkDisableBtn.hidden = flaggedCount === 0;
            sellerGapBulkDisableBtn.innerHTML = `<i class="fas fa-ban"></i> Nonaktifkan ${flaggedCount} seller yang ditandai`;
        }
    }

    async function loadSellerGaps(options) {
        const keepPage = Boolean(options?.keepPage);
        setSellerGapStatus('Membandingkan harga seller...', 'loading');
        if (sellerGapLoadBtn) sellerGapLoadBtn.disabled = true;
        try {
            const response = await fetch(`/api/admin/products/seller-gaps?${getSellerGapQuery()}`);
            const result = await response.json().catch(function() { return {}; });
            if (!response.ok) throw new Error(result?.error || 'Gagal membandingkan harga seller');
            const data = result?.data || {};
            const summary = data.summary || {};
            const settings = data.options || {};
            sellerGapGroups = Array.isArray(data.groups) ? data.groups : [];
            sellerGapLoaded = true;
            if (!keepPage) sellerGapPage = 1;
            renderSellerGapPage();

            const parts = [`${Number(summary.groupCount || 0)} produk dijual ${Number(settings.minSellers || 2)} seller atau lebih.`];
            if (Number(settings.threshold) > 0) {
                const thresholdText = settings.mode === 'percent'
                    ? `${settings.threshold}%`
                    : formatRupiah(Number(settings.threshold));
                parts.push(`${Number(summary.flaggedGroupCount || 0)} produk punya seller yang lebih mahal ${thresholdText} atau lebih dari seller termurah (${Number(summary.flaggedSellerCount || 0)} seller ditandai).`);
            }
            if (sellerGapGroups.length !== Number(summary.groupCount || 0)) {
                parts.push(`Ditampilkan ${sellerGapGroups.length} produk sesuai filter.`);
            }
            if (!sellerGapGroups.length) parts.push('Tidak ada produk yang cocok.');
            setSellerGapStatus(parts.join(' '), 'success');
        } catch (error) {
            sellerGapGroups = [];
            renderSellerGapPage();
            setSellerGapStatus(error.message || 'Gagal membandingkan harga seller.', 'failed');
        } finally {
            if (sellerGapLoadBtn) sellerGapLoadBtn.disabled = false;
        }
    }

    async function toggleSellerGapStatus(sku, active, displayed) {
        const confirmed = await showConfirmDialog({
            title: active ? 'Aktifkan seller ini?' : 'Nonaktifkan seller ini?',
            message: active
                ? `SKU ${sku} aktif lagi dan ikut dipakai sebagai seller.`
                : `SKU ${sku} tidak dipakai lagi sampai diaktifkan admin, termasuk setelah sync produk.${displayed ? ' SKU ini yang sekarang tampil ke user, jadi harga user akan mengikuti seller aktif termahal berikutnya.' : ''}`,
            confirmText: active ? 'Aktifkan' : 'Nonaktifkan',
            cancelText: 'Batal',
        });
        if (!confirmed) return;
        setSellerGapStatus(`${active ? 'Mengaktifkan' : 'Menonaktifkan'} ${sku}...`, 'loading');
        try {
            const response = await fetch(`/api/admin/products/${encodeURIComponent(sku)}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active }),
            });
            const result = await response.json().catch(function() { return {}; });
            if (!response.ok) throw new Error(result?.error || 'Gagal mengubah status seller');
            await loadSellerGaps({ keepPage: true });
            setSellerGapStatus(`${sku} berhasil ${active ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
            void loadProductSummary();
            void loadAdminProducts();
        } catch (error) {
            setSellerGapStatus(error.message || 'Gagal mengubah status seller.', 'failed');
        }
    }

    async function disableFlaggedSellers() {
        const skus = getSellerGapFlaggedSkus();
        if (!skus.length) return;
        const groupCount = sellerGapGroups.filter(function(group) { return group.flaggedCount > 0; }).length;
        const confirmed = await showConfirmDialog({
            title: 'Nonaktifkan seller yang ditandai?',
            message: `${skus.length} seller di ${groupCount} produk akan dinonaktifkan, termasuk yang ada di halaman lain. Seller termurah di setiap produk tetap aktif, dan harga user akan mengikuti seller aktif termahal yang tersisa.`,
            confirmText: 'Nonaktifkan',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        if (sellerGapBulkDisableBtn) sellerGapBulkDisableBtn.disabled = true;
        setSellerGapStatus(`Menonaktifkan ${skus.length} seller...`, 'loading');
        let updated = 0;
        let skipped = 0;
        try {
            for (let index = 0; index < skus.length; index += 200) {
                const response = await fetch('/api/admin/products/bulk-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ skus: skus.slice(index, index + 200), active: false, reason: 'seller-price-gap' }),
                });
                const result = await response.json().catch(function() { return {}; });
                if (!response.ok) throw new Error(result?.error || 'Gagal menonaktifkan seller');
                updated += (result?.data?.updated || []).length;
                skipped += (result?.data?.skipped || []).length;
            }
            await loadSellerGaps({ keepPage: true });
            setSellerGapStatus(`${updated} seller dinonaktifkan${skipped ? `, ${skipped} dilewati` : ''}.`, 'success');
            void loadProductSummary();
            void loadAdminProducts();
        } catch (error) {
            setSellerGapStatus(`${error.message || 'Gagal menonaktifkan seller.'}${updated ? ` ${updated} seller sudah dinonaktifkan.` : ''}`, 'failed');
        } finally {
            if (sellerGapBulkDisableBtn) sellerGapBulkDisableBtn.disabled = false;
        }
    }

    if (sellerGapLoadBtn) sellerGapLoadBtn.addEventListener('click', function() { void loadSellerGaps(); });
    if (sellerGapBulkDisableBtn) sellerGapBulkDisableBtn.addEventListener('click', function() { void disableFlaggedSellers(); });
    [sellerGapDiffInputEl, sellerGapSearchEl].forEach(function(input) {
        if (!input) return;
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                void loadSellerGaps();
            }
        });
    });
    // Setelah sekali ditampilkan, mengganti pilihan langsung memuat ulang hasilnya.
    [sellerGapMinSellersEl, sellerGapDiffModeEl, sellerGapOnlyFlaggedEl].forEach(function(input) {
        if (!input) return;
        input.addEventListener('change', function() {
            if (sellerGapLoaded) void loadSellerGaps();
        });
    });
    if (sellerGapPrevPageBtn) sellerGapPrevPageBtn.addEventListener('click', function() { sellerGapPage -= 1; renderSellerGapPage(); });
    if (sellerGapNextPageBtn) sellerGapNextPageBtn.addEventListener('click', function() { sellerGapPage += 1; renderSellerGapPage(); });
    if (sellerGapListEl) {
        sellerGapListEl.addEventListener('click', function(e) {
            const button = e.target.closest('[data-seller-gap-sku]');
            if (!button) return;
            void toggleSellerGapStatus(
                button.dataset.sellerGapSku || '',
                button.dataset.sellerGapActive === '1',
                button.dataset.sellerGapDisplayed === '1'
            );
        });
    }

    function isLoadingStatusMessage(message, type) {
        if (type === 'loading') return true;
        if (type === 'success' || type === 'failed') return false;
        return /memuat|membuat|menunggu|menyiapkan|mengecek|memvalidasi|memverifikasi|mengirim|menyimpan|mengupload|menghapus|menonaktifkan|diproses|sedang/i.test(String(message || ''));
    }

    function setStatusElement(element, message, type, baseClass) {
        if (!element) return;
        element.textContent = message || '';
        const classes = [baseClass || 'checkout-status'];
        if (type && type !== 'loading') classes.push(type);
        if (message && isLoadingStatusMessage(message, type)) classes.push('loading');
        element.className = classes.join(' ');
    }

    function setBrandLogoInfo(message, type) {
        setStatusElement(brandLogoInfoEl, message, type, 'checkout-status');
    }

    function resolveAdminAssetUrl(value) {
        const rawUrl = String(value || '').trim();
        return typeof window.PPOB_RESOLVE_PUBLIC_ASSET_URL === 'function'
            ? window.PPOB_RESOLVE_PUBLIC_ASSET_URL(rawUrl)
            : rawUrl;
    }

    function getFilteredBrandLogos() {
        const keyword = String(brandLogoSearchEl?.value || '').trim().toLowerCase();
        if (!keyword) return allBrandLogos;
        return allBrandLogos.filter(function(item) {
            return String(item.brand || '').toLowerCase().includes(keyword);
        });
    }

    function isUnsafeSvgText(svgText) {
        return /<!doctype/i.test(svgText)
            || /<!entity/i.test(svgText)
            || /<script[\s>]/i.test(svgText)
            || /<foreignobject[\s>]/i.test(svgText)
            || /<iframe[\s>]/i.test(svgText)
            || /<object[\s>]/i.test(svgText)
            || /<embed[\s>]/i.test(svgText)
            || /\son[a-z]+\s*=/i.test(svgText)
            || /javascript\s*:/i.test(svgText)
            || /\b(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|\/\/)/i.test(svgText)
            || /url\(\s*["']?\s*(?:https?:|\/\/)/i.test(svgText);
    }

    async function readSafeSvgFile(file) {
        if (!file) throw new Error('Pilih file SVG terlebih dahulu.');
        const name = String(file.name || '').toLowerCase();
        if (!name.endsWith('.svg') && file.type !== 'image/svg+xml') {
            throw new Error('File harus berformat .svg');
        }
        if (file.size > brandLogoMaxBytes) {
            throw new Error(`Ukuran SVG maksimal ${Math.round(brandLogoMaxBytes / 1024)} KB`);
        }
        const svgText = await file.text();
        if (!/<svg[\s>]/i.test(svgText) || /^<!doctype\s+html/i.test(svgText.trimStart()) || /^<html[\s>]/i.test(svgText.trimStart())) {
            throw new Error('Isi file bukan SVG valid.');
        }
        if (isUnsafeSvgText(svgText)) {
            throw new Error('SVG mengandung script/atribut yang tidak aman.');
        }
        return svgText;
    }

    function renderBrandLogoCards() {
        if (!brandLogoListEl) return;
        const items = getFilteredBrandLogos();
        brandLogoListEl.innerHTML = '';

        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'brand-logo-empty';
            empty.textContent = allBrandLogos.length ? 'Brand tidak ditemukan.' : 'Belum ada brand produk. Sync produk dulu.';
            brandLogoListEl.appendChild(empty);
            return;
        }

        items.forEach(function(item) {
            const card = document.createElement('article');
            card.className = 'brand-logo-card';

            const preview = document.createElement('div');
            preview.className = 'brand-logo-preview';
            if (item.logoUrl) {
                const img = document.createElement('img');
                img.src = resolveAdminAssetUrl(item.logoUrl);
                img.alt = `Logo ${item.brand}`;
                img.loading = 'lazy';
                preview.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-image';
                preview.appendChild(icon);
            }

            const body = document.createElement('div');
            body.className = 'brand-logo-body';

            const title = document.createElement('h3');
            title.textContent = item.brand || '-';
            const meta = document.createElement('p');
            meta.textContent = `${Number(item.productCount || 0)} produk${item.file ? ` | ${item.file}` : ' | belum ada logo'}`;
            body.appendChild(title);
            body.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'brand-logo-actions';

            const inputId = `brandLogoFile-${String(item.brand || '').replace(/[^a-z0-9]/gi, '-')}`;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.svg,image/svg+xml';
            input.id = inputId;
            input.hidden = true;
            input.addEventListener('change', function() {
                const file = input.files && input.files[0];
                if (!file) return;
                void uploadBrandLogo(item.brand, file).finally(function() {
                    input.value = '';
                });
            });

            const uploadBtn = document.createElement('button');
            uploadBtn.type = 'button';
            uploadBtn.className = 'btn-primary';
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload SVG';
            uploadBtn.addEventListener('click', function() {
                input.click();
            });
            actions.appendChild(input);
            actions.appendChild(uploadBtn);

            if (item.hasLogo) {
                const resetBtn = document.createElement('button');
                resetBtn.type = 'button';
                resetBtn.className = 'btn-secondary';
                resetBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Reset';
                resetBtn.addEventListener('click', function() {
                    void resetBrandLogo(item.brand);
                });
                actions.appendChild(resetBtn);
            }

            card.appendChild(preview);
            card.appendChild(body);
            card.appendChild(actions);
            brandLogoListEl.appendChild(card);
        });
    }

    function setLogoStorageStatus(message, type) {
        setStatusElement(logoStorageStatusEl, message, type, 'checkout-status');
    }

    // Logo lama tersimpan di disk server. Tombol ini memindahkannya ke Cloudflare
    // R2 sekali jalan, dan aman diulang karena logo yang sudah di R2 dilewati.
    async function refreshLogoStorageStatus() {
        if (!logoStorageStatusEl && !migrateLogosToR2Btn) return null;

        const status = await fetchMediaUploadStatus();
        if (!status) {
            setLogoStorageStatus('Gagal memeriksa koneksi Cloudflare R2.', 'failed');
            if (migrateLogosToR2Btn) migrateLogosToR2Btn.disabled = true;
            return null;
        }

        if (!status.configured) {
            const missing = Array.isArray(status.missing) ? status.missing.join(', ') : '';
            setLogoStorageStatus(`Cloudflare R2 belum aktif, logo masih disimpan di server ini. Lengkapi dulu ${missing || 'setelan R2'} di file .env server.`, 'failed');
            if (migrateLogosToR2Btn) migrateLogosToR2Btn.disabled = true;
            return status;
        }

        if (migrateLogosToR2Btn) migrateLogosToR2Btn.disabled = false;
        setLogoStorageStatus(`Cloudflare R2 aktif di bucket ${status.bucket || '-'}. Logo baru otomatis tersimpan di sana.`, 'success');
        return status;
    }

    async function migrateLogosToR2() {
        const confirmed = await showConfirmDialog({
            title: 'Pindahkan logo lama ke R2?',
            message: 'Semua logo brand dan menu yang masih tersimpan di server akan diupload ke Cloudflare R2. File aslinya tetap disimpan di server sebagai cadangan, dan proses ini aman diulang kalau ada yang gagal.',
            confirmText: 'Pindahkan',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        setAdminPushButtonBusy(migrateLogosToR2Btn, true, 'Memindahkan...');
        setLogoStorageStatus('Memindahkan logo ke Cloudflare R2...');
        try {
            const response = await fetch('/api/admin/logos/migrate-r2', { method: 'POST' });
            const result = await readMediaJsonResponse(response);
            if (!response.ok) throw new Error(result?.error || 'Gagal memindahkan logo');

            const failed = []
                .concat(result?.data?.brands?.failed || [])
                .concat(result?.data?.categories?.failed || []);
            const type = failed.length ? 'failed' : 'success';
            const detail = failed.length
                ? ` Yang gagal: ${failed.map(function(item) { return `${item.name} (${item.message})`; }).join('; ')}`
                : '';
            setLogoStorageStatus(`${result?.message || 'Logo dipindahkan.'}${detail}`, type);

            await loadBrandLogos();
            await loadCategoryLogos();
        } catch (error) {
            setLogoStorageStatus(error.message || 'Gagal memindahkan logo.', 'failed');
        } finally {
            setAdminPushButtonBusy(migrateLogosToR2Btn, false);
        }
    }

    async function loadBrandLogos() {
        if (!brandLogoListEl) return;
        setBrandLogoInfo('Memuat logo brand...');
        try {
            const response = await fetch('/api/admin/brand-logos');
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat logo brand');
            allBrandLogos = Array.isArray(result?.data?.brands) ? result.data.brands : [];
            brandLogoMaxBytes = Number(result?.data?.maxSvgBytes || brandLogoMaxBytes);
            renderBrandLogoCards();
            setBrandLogoInfo(`Menampilkan ${allBrandLogos.length} brand. Upload hanya menerima SVG aman maksimal ${Math.round(brandLogoMaxBytes / 1024)} KB.`, 'success');
        } catch (error) {
            allBrandLogos = [];
            renderBrandLogoCards();
            setBrandLogoInfo(error.message || 'Gagal memuat logo brand.', 'failed');
        }
    }

    async function uploadBrandLogo(brand, file) {
        const safeBrand = String(brand || '').trim();
        if (!safeBrand) return;
        setBrandLogoInfo(`Memvalidasi SVG untuk ${safeBrand}...`);
        try {
            const svgText = await readSafeSvgFile(file);
            setBrandLogoInfo(`Mengupload logo ${safeBrand}...`);
            const response = await fetch(`/api/admin/brand-logos/${encodeURIComponent(safeBrand)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'image/svg+xml' },
                body: svgText,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal upload logo brand');
            await loadBrandLogos();
            await loadAdminProducts();
            setBrandLogoInfo(`Logo ${safeBrand} berhasil disimpan dan akan tampil di produk.`, 'success');
        } catch (error) {
            setBrandLogoInfo(error.message || 'Gagal upload logo brand.', 'failed');
        }
    }

    async function resetBrandLogo(brand) {
        const safeBrand = String(brand || '').trim();
        if (!safeBrand) return;
        const confirmed = await showConfirmDialog({
            title: 'Reset Logo Brand',
            message: `Reset logo untuk brand ${safeBrand}? Logo tidak akan tampil sampai kamu upload lagi.`,
            confirmText: 'Reset Logo',
            cancelText: 'Batal',
        });
        if (!confirmed) return;
        setBrandLogoInfo(`Menghapus logo ${safeBrand}...`);
        try {
            const response = await fetch(`/api/admin/brand-logos/${encodeURIComponent(safeBrand)}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal reset logo brand');
            await loadBrandLogos();
            await loadAdminProducts();
            setBrandLogoInfo(`Logo ${safeBrand} berhasil direset.`, 'success');
        } catch (error) {
            setBrandLogoInfo(error.message || 'Gagal reset logo brand.', 'failed');
        }
    }

    // Upload gambar banner dan pengumuman langsung ke Cloudflare R2, jadi admin
    // tidak perlu membuka dashboard Cloudflare hanya untuk menempelkan URL-nya
    // ke form ini.
    let mediaUploadStatusPromise = null;

    function fetchMediaUploadStatus() {
        if (!mediaUploadStatusPromise) {
            mediaUploadStatusPromise = fetch('/api/admin/media/status')
                .then(function(response) { return response.json(); })
                .then(function(result) { return result && result.data ? result.data : null; })
                .catch(function() {
                    mediaUploadStatusPromise = null;
                    return null;
                });
        }
        return mediaUploadStatusPromise;
    }

    // nginx, Cloudflare, atau proxy lain membalas halaman HTML saat menolak
    // permintaan sebelum sampai ke aplikasi. Tanpa penanganan ini yang muncul
    // di layar cuma error parsing JSON yang tidak menjelaskan apa-apa.
    async function readMediaJsonResponse(response, subject = 'Gambar') {
        const raw = await response.text();
        try {
            return JSON.parse(raw);
        } catch (_error) {
            if (response.status === 413) {
                throw new Error(`${subject} ditolak proxy server karena dianggap terlalu besar. Naikkan client_max_body_size di nginx, lalu coba lagi.`);
            }
            if (response.status === 502 || response.status === 503 || response.status === 504) {
                throw new Error(`Aplikasi tidak merespons (HTTP ${response.status}). Cek apakah service Node di server sedang jalan.`);
            }
            throw new Error(`Server membalas HTTP ${response.status} berupa halaman web, bukan data. Permintaan kemungkinan dihentikan nginx atau Cloudflare sebelum sampai ke aplikasi.`);
        }
    }

    // Nama file ikut dikirim sebagai header, jadi karakter di luar ASCII dibuang
    // dulu supaya header-nya tetap valid.
    function sanitizeMediaFileName(value) {
        return String(value || 'gambar')
            .replace(/[^\w.\- ]+/g, '')
            .trim()
            .slice(0, 80) || 'gambar';
    }

    function setupMediaUpload(block) {
        const folder = block.getAttribute('data-media-folder') || 'lainnya';
        const targetInput = document.getElementById(block.getAttribute('data-media-target') || '');
        const fileInput = block.querySelector('.media-upload-file');
        const uploadBtn = block.querySelector('.media-upload-btn');
        const galleryBtn = block.querySelector('.media-gallery-btn');
        const statusEl = block.querySelector('.media-upload-status');
        const galleryEl = block.querySelector('.media-gallery');
        if (!targetInput || !fileInput || !uploadBtn) return;

        let maxUploadBytes = 3 * 1024 * 1024;

        function setStatus(message, type) {
            setStatusElement(statusEl, message, type, 'checkout-status media-upload-status');
        }

        async function ensureMediaReady() {
            const status = await fetchMediaUploadStatus();
            if (!status) {
                setStatus('Gagal memeriksa koneksi Cloudflare R2.', 'failed');
                return null;
            }
            if (!status.configured) {
                const missing = Array.isArray(status.missing) ? status.missing.join(', ') : '';
                setStatus(`Upload otomatis belum aktif. Lengkapi dulu ${missing || 'setelan R2'} di file .env server.`, 'failed');
                return null;
            }
            maxUploadBytes = Number(status.maxUploadBytes) || maxUploadBytes;
            return status;
        }

        function applyImageUrl(url) {
            if (!url) return;
            targetInput.value = url;
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        async function uploadMediaFile(file) {
            if (!file) return;
            if (!(await ensureMediaReady())) return;
            if (file.size > maxUploadBytes) {
                setStatus(`Ukuran gambar maksimal ${formatBytes(maxUploadBytes)}.`, 'failed');
                return;
            }

            setAdminPushButtonBusy(uploadBtn, true, 'Mengupload...');
            setStatus('Mengupload gambar ke Cloudflare R2...');
            try {
                const response = await fetch(`/api/admin/media?folder=${encodeURIComponent(folder)}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': file.type || 'image/jpeg',
                        'X-File-Name': sanitizeMediaFileName(file.name),
                    },
                    body: await file.arrayBuffer(),
                });
                const result = await readMediaJsonResponse(response);
                if (!response.ok) throw new Error(result?.error || 'Gagal upload gambar');
                applyImageUrl(result?.data?.url || '');
                setStatus('Gambar berhasil diupload, URL sudah terisi otomatis.', 'success');
                if (galleryEl && !galleryEl.hidden) await loadMediaGallery();
            } catch (error) {
                setStatus(error.message || 'Gagal upload gambar.', 'failed');
            } finally {
                setAdminPushButtonBusy(uploadBtn, false);
                fileInput.value = '';
            }
        }

        function renderMediaGallery(items) {
            if (!galleryEl) return;
            if (!items.length) {
                galleryEl.innerHTML = '<p class="media-gallery-empty">Belum ada gambar yang diupload untuk bagian ini.</p>';
                return;
            }

            galleryEl.innerHTML = items.map(function(item) {
                const url = escapeHtml(item.url || '');
                return `<div class="media-gallery-item">
                    <button type="button" class="media-gallery-pick" data-url="${url}" title="Pakai gambar ini">
                        <img src="${url}" alt="" loading="lazy">
                    </button>
                    <div class="media-gallery-meta">
                        <span>${escapeHtml(formatBytes(item.size || 0))}</span>
                        <button type="button" class="media-gallery-delete" data-key="${escapeHtml(item.key || '')}" title="Hapus gambar dari R2">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        async function loadMediaGallery() {
            if (!galleryEl) return;
            if (!(await ensureMediaReady())) return;

            galleryEl.innerHTML = '<p class="media-gallery-empty">Memuat gambar...</p>';
            try {
                const response = await fetch(`/api/admin/media?folder=${encodeURIComponent(folder)}`);
                const result = await readMediaJsonResponse(response);
                if (!response.ok) throw new Error(result?.error || 'Gagal memuat galeri gambar');
                renderMediaGallery(Array.isArray(result?.data) ? result.data : []);
            } catch (error) {
                galleryEl.innerHTML = `<p class="media-gallery-empty">${escapeHtml(error.message || 'Gagal memuat galeri gambar.')}</p>`;
            }
        }

        async function deleteMediaImage(key) {
            const confirmed = await showConfirmDialog({
                title: 'Hapus gambar ini?',
                message: 'Gambar dihapus permanen dari Cloudflare R2. Banner atau pengumuman yang masih memakai gambar ini akan tampil kosong.',
                confirmText: 'Hapus',
                cancelText: 'Batal',
            });
            if (!confirmed) return;

            setStatus('Menghapus gambar dari Cloudflare R2...');
            try {
                const response = await fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
                const result = await readMediaJsonResponse(response);
                if (!response.ok) throw new Error(result?.error || 'Gagal menghapus gambar');
                setStatus(result?.message || 'Gambar dihapus.', 'success');
                await loadMediaGallery();
            } catch (error) {
                setStatus(error.message || 'Gagal menghapus gambar.', 'failed');
            }
        }

        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        fileInput.addEventListener('change', function() {
            void uploadMediaFile(fileInput.files && fileInput.files[0]);
        });
        if (galleryBtn && galleryEl) {
            galleryBtn.addEventListener('click', function() {
                galleryEl.hidden = !galleryEl.hidden;
                if (!galleryEl.hidden) void loadMediaGallery();
            });
            galleryEl.addEventListener('click', function(event) {
                const pickBtn = event.target.closest('.media-gallery-pick');
                if (pickBtn) {
                    applyImageUrl(pickBtn.getAttribute('data-url') || '');
                    setStatus('Gambar dari galeri dipakai, URL sudah terisi.', 'success');
                    return;
                }
                const deleteBtn = event.target.closest('.media-gallery-delete');
                if (deleteBtn) {
                    void deleteMediaImage(deleteBtn.getAttribute('data-key') || '');
                }
            });
        }
    }

    function setupMediaUploads() {
        document.querySelectorAll('.media-upload').forEach(setupMediaUpload);
    }

    function setBannerStatus(message, type) {
        setStatusElement(bannerStatusEl, message, type, 'checkout-status');
    }

    // Pratinjau memuat gambarnya langsung dari URL yang diketik, lalu melaporkan
    // ukuran aslinya. Admin jadi tahu sebelum menyimpan apakah rasionya sudah pas.
    function previewBannerImage() {
        const url = String(bannerImageInputEl?.value || '').trim();
        if (!bannerPreviewWrapEl || !bannerPreviewImageEl) return;
        if (!url) {
            bannerPreviewWrapEl.hidden = true;
            bannerPreviewImageEl.removeAttribute('src');
            setStatusElement(bannerPreviewInfoEl, '', '', 'checkout-status');
            return;
        }

        bannerPreviewWrapEl.hidden = false;
        setStatusElement(bannerPreviewInfoEl, 'Memuat pratinjau gambar...', 'loading', 'checkout-status');
        bannerPreviewImageEl.onload = function() {
            const width = bannerPreviewImageEl.naturalWidth;
            const height = bannerPreviewImageEl.naturalHeight;
            if (!width || !height) return;
            const ratio = width / height;
            const selisih = Math.abs(ratio - BANNER_TARGET_RATIO) / BANNER_TARGET_RATIO;
            const ukuran = `Ukuran gambar ${width} x ${height} piksel (rasio ${ratio.toFixed(2)}:1).`;
            if (selisih <= 0.08) {
                setStatusElement(bannerPreviewInfoEl, `${ukuran} Sudah pas.`, 'success', 'checkout-status');
            } else {
                setStatusElement(
                    bannerPreviewInfoEl,
                    `${ukuran} Rasio yang pas 3:1, misalnya 1200 x 400. Gambar ini akan terpotong di sisi atas bawah.`,
                    'failed',
                    'checkout-status'
                );
            }
        };
        bannerPreviewImageEl.onerror = function() {
            setStatusElement(bannerPreviewInfoEl, 'Gambar tidak bisa dimuat. Pastikan tautannya benar dan bisa diakses publik.', 'failed', 'checkout-status');
        };
        bannerPreviewImageEl.src = url;
    }

    function renderBannerList(items) {
        if (!bannerListEl) return;
        bannerListEl.innerHTML = '';
        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'monitor-empty';
            empty.textContent = 'Belum ada banner. Tambahkan lewat form di atas.';
            bannerListEl.appendChild(empty);
            return;
        }

        items.forEach(function(item, index) {
            const card = document.createElement('article');
            card.className = 'banner-admin-item';

            const thumb = document.createElement('img');
            thumb.className = 'banner-admin-thumb';
            thumb.src = item.imageUrl;
            thumb.alt = item.label || 'Banner';
            thumb.loading = 'lazy';
            thumb.referrerPolicy = 'no-referrer';
            card.appendChild(thumb);

            const info = document.createElement('div');
            info.className = 'banner-admin-info';

            const head = document.createElement('div');
            head.className = 'admin-push-history-head';
            const title = document.createElement('strong');
            title.textContent = `${index + 1}. ${item.label || 'Banner'}`;
            const state = document.createElement('span');
            state.className = item.isActive ? 'status success' : 'status pending';
            state.textContent = item.isActive ? 'Tayang' : 'Nonaktif';
            head.appendChild(title);
            head.appendChild(state);
            info.appendChild(head);

            if (item.linkUrl) {
                const link = document.createElement('small');
                link.textContent = item.linkUrl;
                info.appendChild(link);
            }

            const actions = document.createElement('div');
            actions.className = 'brand-logo-actions';

            const upBtn = document.createElement('button');
            upBtn.type = 'button';
            upBtn.className = 'btn-secondary';
            upBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            upBtn.title = 'Geser ke atas';
            upBtn.disabled = index === 0;
            upBtn.addEventListener('click', function() {
                void moveBanner(item.id, 'up');
            });

            const downBtn = document.createElement('button');
            downBtn.type = 'button';
            downBtn.className = 'btn-secondary';
            downBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
            downBtn.title = 'Geser ke bawah';
            downBtn.disabled = index === items.length - 1;
            downBtn.addEventListener('click', function() {
                void moveBanner(item.id, 'down');
            });

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = item.isActive ? 'btn-secondary' : 'btn-primary';
            toggleBtn.textContent = item.isActive ? 'Nonaktifkan' : 'Aktifkan';
            toggleBtn.addEventListener('click', function() {
                void toggleBanner(item.id, !item.isActive);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-secondary';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Hapus';
            deleteBtn.addEventListener('click', function() {
                void deleteBanner(item.id, item.label);
            });

            [upBtn, downBtn, toggleBtn, deleteBtn].forEach(function(button) {
                actions.appendChild(button);
            });
            info.appendChild(actions);
            card.appendChild(info);
            bannerListEl.appendChild(card);
        });
    }

    async function loadBanners() {
        if (!bannerListEl) return;
        try {
            const response = await fetch('/api/admin/banners', { cache: 'no-store' });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat banner');
            renderBannerList(Array.isArray(result?.data) ? result.data : []);
        } catch (error) {
            renderBannerList([]);
            setBannerStatus(error.message || 'Gagal memuat banner.', 'failed');
        }
    }

    async function submitBanner() {
        const label = String(bannerLabelInputEl?.value || '').trim();
        const imageUrl = String(bannerImageInputEl?.value || '').trim();
        if (!label || !imageUrl) {
            setBannerStatus('Nama banner dan URL gambar wajib diisi.', 'failed');
            return;
        }

        setAdminPushButtonBusy(submitBannerBtn, true, 'Menambahkan...');
        setBannerStatus('Menambahkan banner...');
        try {
            const response = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label,
                    imageUrl,
                    linkUrl: String(bannerLinkInputEl?.value || '').trim(),
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menambahkan banner');
            bannerFormEl?.reset();
            previewBannerImage();
            await loadBanners();
            setBannerStatus(result?.message || 'Banner ditambahkan.', 'success');
        } catch (error) {
            setBannerStatus(error.message || 'Gagal menambahkan banner.', 'failed');
        } finally {
            setAdminPushButtonBusy(submitBannerBtn, false);
        }
    }

    async function toggleBanner(id, active) {
        try {
            const response = await fetch(`/api/admin/banners/${encodeURIComponent(id)}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal mengubah status banner');
            await loadBanners();
            setBannerStatus(result?.message || 'Status banner diperbarui.', 'success');
        } catch (error) {
            setBannerStatus(error.message || 'Gagal mengubah status banner.', 'failed');
        }
    }

    async function moveBanner(id, direction) {
        try {
            const response = await fetch(`/api/admin/banners/${encodeURIComponent(id)}/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal mengubah urutan banner');
            renderBannerList(Array.isArray(result?.data) ? result.data : []);
            setBannerStatus(result?.message || 'Urutan banner diperbarui.', 'success');
        } catch (error) {
            setBannerStatus(error.message || 'Gagal mengubah urutan banner.', 'failed');
        }
    }

    async function deleteBanner(id, label) {
        const confirmed = await showConfirmDialog({
            title: 'Hapus banner?',
            message: `Banner "${label || 'ini'}" akan hilang dari dashboard user dan tidak bisa dikembalikan.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/banners/${encodeURIComponent(id)}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menghapus banner');
            await loadBanners();
            setBannerStatus(result?.message || 'Banner dihapus.', 'success');
        } catch (error) {
            setBannerStatus(error.message || 'Gagal menghapus banner.', 'failed');
        }
    }

    function setAnnouncementStatus(message, type) {
        setStatusElement(announcementStatusEl, message, type, 'checkout-status');
    }

    function renderAnnouncementList(items) {
        if (!announcementListEl) return;
        announcementListEl.innerHTML = '';
        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'monitor-empty';
            empty.textContent = 'Belum ada pengumuman. Tayangkan satu lewat form di atas.';
            announcementListEl.appendChild(empty);
            return;
        }

        items.forEach(function(item) {
            const card = document.createElement('article');
            card.className = 'monitor-list-item';

            const head = document.createElement('div');
            head.className = 'admin-push-history-head';
            const titleEl = document.createElement('strong');
            titleEl.textContent = item.title || 'Pengumuman';
            head.appendChild(titleEl);

            const state = document.createElement('span');
            const expired = Boolean(item.isExpired);
            const live = item.isActive !== false && !expired;
            state.className = live ? 'status success' : 'status pending';
            state.textContent = live ? 'Tayang' : (expired ? 'Kedaluwarsa' : 'Nonaktif');
            head.appendChild(state);
            card.appendChild(head);

            const bodyEl = document.createElement('p');
            bodyEl.textContent = item.body || '';
            card.appendChild(bodyEl);

            const metaParts = [formatDate(item.createdAt)];
            if (item.expiresAt) metaParts.push(`Berakhir ${formatDate(item.expiresAt)}`);
            if (item.imageUrl) metaParts.push('Dengan gambar');
            if (item.linkUrl) metaParts.push('Dengan tautan');
            const metaEl = document.createElement('small');
            metaEl.textContent = metaParts.join(' | ');
            card.appendChild(metaEl);

            if (item.imageUrl) {
                const preview = document.createElement('img');
                preview.className = 'announcement-admin-thumb';
                preview.src = item.imageUrl;
                preview.alt = `Gambar ${item.title || 'pengumuman'}`;
                preview.loading = 'lazy';
                preview.referrerPolicy = 'no-referrer';
                card.appendChild(preview);
            }

            const actions = document.createElement('div');
            actions.className = 'brand-logo-actions';

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = item.isActive === false ? 'btn-primary' : 'btn-secondary';
            toggleBtn.textContent = item.isActive === false ? 'Aktifkan' : 'Nonaktifkan';
            toggleBtn.addEventListener('click', function() {
                void toggleAnnouncement(item.id, item.isActive === false);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-secondary';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Hapus';
            deleteBtn.addEventListener('click', function() {
                void deleteAnnouncement(item.id, item.title);
            });

            actions.appendChild(toggleBtn);
            actions.appendChild(deleteBtn);
            card.appendChild(actions);
            announcementListEl.appendChild(card);
        });
    }

    async function loadAnnouncements() {
        if (!announcementListEl) return;
        try {
            const response = await fetch('/api/admin/announcements', { cache: 'no-store' });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat pengumuman');
            renderAnnouncementList(Array.isArray(result?.data) ? result.data : []);
        } catch (error) {
            renderAnnouncementList([]);
            setAnnouncementStatus(error.message || 'Gagal memuat pengumuman.', 'failed');
        }
    }

    async function submitAnnouncement() {
        const title = String(announcementTitleInputEl?.value || '').trim();
        const body = String(announcementBodyInputEl?.value || '').trim();
        if (!title || !body) {
            setAnnouncementStatus('Judul dan isi wajib diisi.', 'failed');
            return;
        }

        setAdminPushButtonBusy(submitAnnouncementBtn, true, 'Menayangkan...');
        setAnnouncementStatus('Menayangkan pengumuman...');
        try {
            const response = await fetch('/api/admin/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    body,
                    imageUrl: String(announcementImageInputEl?.value || '').trim(),
                    linkUrl: String(announcementLinkInputEl?.value || '').trim(),
                    expiresAt: String(announcementExpiryInputEl?.value || '').trim(),
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menayangkan pengumuman');
            announcementFormEl?.reset();
            await loadAnnouncements();
            setAnnouncementStatus(result?.message || 'Pengumuman ditayangkan.', 'success');
        } catch (error) {
            setAnnouncementStatus(error.message || 'Gagal menayangkan pengumuman.', 'failed');
        } finally {
            setAdminPushButtonBusy(submitAnnouncementBtn, false);
        }
    }

    async function toggleAnnouncement(id, active) {
        try {
            const response = await fetch(`/api/admin/announcements/${encodeURIComponent(id)}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal mengubah status pengumuman');
            await loadAnnouncements();
            setAnnouncementStatus(result?.message || 'Status pengumuman diperbarui.', 'success');
        } catch (error) {
            setAnnouncementStatus(error.message || 'Gagal mengubah status pengumuman.', 'failed');
        }
    }

    async function deleteAnnouncement(id, title) {
        const confirmed = await showConfirmDialog({
            title: 'Hapus pengumuman?',
            message: `Pengumuman "${title || 'ini'}" akan hilang dari dashboard semua user dan tidak bisa dikembalikan.`,
            confirmText: 'Hapus',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/admin/announcements/${encodeURIComponent(id)}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menghapus pengumuman');
            await loadAnnouncements();
            setAnnouncementStatus(result?.message || 'Pengumuman dihapus.', 'success');
        } catch (error) {
            setAnnouncementStatus(error.message || 'Gagal menghapus pengumuman.', 'failed');
        }
    }

    function setCategoryLogoInfo(message, type) {
        setStatusElement(categoryLogoInfoEl, message, type, 'checkout-status');
    }

    function getFilteredCategoryLogos() {
        const keyword = String(categoryLogoSearchEl?.value || '').trim().toLowerCase();
        if (!keyword) return allCategoryLogos;
        return allCategoryLogos.filter(function(item) {
            return String(item.category || '').toLowerCase().includes(keyword);
        });
    }

    function getCategoryLogoContentType(file) {
        const type = String(file?.type || '').trim().toLowerCase();
        const name = String(file?.name || '').trim().toLowerCase();
        if (type === 'image/svg+xml' || name.endsWith('.svg')) return 'image/svg+xml';
        if (type === 'image/png' || name.endsWith('.png')) return 'image/png';
        if (type === 'image/jpeg' || name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
        if (type === 'image/webp' || name.endsWith('.webp')) return 'image/webp';
        return '';
    }

    async function readCategoryLogoUpload(file) {
        if (!file) throw new Error('Pilih file logo terlebih dahulu.');
        if (file.size > categoryLogoMaxBytes) {
            throw new Error(`Ukuran gambar maksimal ${Math.round(categoryLogoMaxBytes / 1024)} KB`);
        }
        const contentType = getCategoryLogoContentType(file);
        if (!contentType) {
            throw new Error('File harus berformat SVG, PNG, JPG, atau WebP.');
        }
        if (contentType === 'image/svg+xml') {
            const svgText = await file.text();
            if (!/<svg[\s>]/i.test(svgText) || /^<!doctype\s+html/i.test(svgText.trimStart()) || /^<html[\s>]/i.test(svgText.trimStart())) {
                throw new Error('Isi file bukan SVG valid.');
            }
            if (isUnsafeSvgText(svgText)) {
                throw new Error('SVG mengandung script/atribut yang tidak aman.');
            }
            return { body: svgText, contentType };
        }
        return { body: file, contentType };
    }

    function renderCategoryLogoCards() {
        if (!categoryLogoListEl) return;
        const items = getFilteredCategoryLogos();
        categoryLogoListEl.innerHTML = '';

        if (!items.length) {
            const empty = document.createElement('div');
            empty.className = 'brand-logo-empty';
            empty.textContent = allCategoryLogos.length ? 'Kategori tidak ditemukan.' : 'Belum ada kategori produk. Sync produk dulu.';
            categoryLogoListEl.appendChild(empty);
            return;
        }

        items.forEach(function(item) {
            const card = document.createElement('article');
            card.className = 'brand-logo-card';

            const preview = document.createElement('div');
            preview.className = 'brand-logo-preview';
            if (item.logoUrl) {
                const img = document.createElement('img');
                img.src = resolveAdminAssetUrl(item.logoUrl);
                img.alt = `Logo ${item.category}`;
                img.loading = 'lazy';
                preview.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = 'fas fa-th-large';
                preview.appendChild(icon);
            }

            const body = document.createElement('div');
            body.className = 'brand-logo-body';

            const title = document.createElement('h3');
            title.textContent = item.category || '-';
            const isCategoryActive = item.isActive !== false;
            if (!isCategoryActive) {
                card.classList.add('brand-logo-card-disabled');
                const pill = document.createElement('span');
                pill.className = 'brand-logo-pill';
                pill.textContent = 'Nonaktif';
                title.appendChild(pill);
            }
            const meta = document.createElement('p');
            meta.textContent = `${Number(item.productCount || 0)} produk${item.file ? ` | ${item.file}` : ' | belum ada logo'}`;
            body.appendChild(title);
            body.appendChild(meta);

            if (!isCategoryActive) {
                const reason = document.createElement('p');
                reason.className = 'brand-logo-reason';
                reason.textContent = item.disabledReason || 'Disembunyikan dari halaman user.';
                body.appendChild(reason);
            }

            const actions = document.createElement('div');
            actions.className = 'brand-logo-actions';

            const inputId = `categoryLogoFile-${String(item.category || '').replace(/[^a-z0-9]/gi, '-')}`;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp';
            input.id = inputId;
            input.hidden = true;
            input.addEventListener('change', function() {
                const file = input.files && input.files[0];
                if (!file) return;
                void uploadCategoryLogo(item.category, file).finally(function() {
                    input.value = '';
                });
            });

            const uploadBtn = document.createElement('button');
            uploadBtn.type = 'button';
            uploadBtn.className = 'btn-primary';
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Gambar';
            uploadBtn.addEventListener('click', function() {
                input.click();
            });
            actions.appendChild(input);
            actions.appendChild(uploadBtn);

            if (item.hasLogo) {
                const resetBtn = document.createElement('button');
                resetBtn.type = 'button';
                resetBtn.className = 'btn-secondary';
                resetBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Reset';
                resetBtn.addEventListener('click', function() {
                    void resetCategoryLogo(item.category);
                });
                actions.appendChild(resetBtn);
            }

            const statusBtn = document.createElement('button');
            statusBtn.type = 'button';
            statusBtn.className = isCategoryActive ? 'btn-secondary' : 'btn-primary';
            statusBtn.innerHTML = isCategoryActive
                ? '<i class="fas fa-eye-slash"></i> Nonaktifkan'
                : '<i class="fas fa-eye"></i> Aktifkan';
            statusBtn.addEventListener('click', function() {
                void toggleCategoryStatus(item.category, !isCategoryActive);
            });
            actions.appendChild(statusBtn);

            card.appendChild(preview);
            card.appendChild(body);
            card.appendChild(actions);
            categoryLogoListEl.appendChild(card);
        });
    }

    async function loadCategoryLogos() {
        if (!categoryLogoListEl) return;
        setCategoryLogoInfo('Memuat logo menu...');
        try {
            const response = await fetch('/api/admin/category-logos');
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat logo menu');
            allCategoryLogos = Array.isArray(result?.data?.categories) ? result.data.categories : [];
            categoryLogoMaxBytes = Number(result?.data?.maxImageBytes || categoryLogoMaxBytes);
            renderCategoryLogoCards();
            const disabledCategoryCount = allCategoryLogos.filter(function(item) {
                return item.isActive === false;
            }).length;
            setCategoryLogoInfo(`Menampilkan ${allCategoryLogos.length} kategori${disabledCategoryCount ? ` (${disabledCategoryCount} nonaktif)` : ''}. Upload menerima SVG, PNG, JPG, atau WebP maksimal ${Math.round(categoryLogoMaxBytes / 1024)} KB.`, 'success');
        } catch (error) {
            allCategoryLogos = [];
            renderCategoryLogoCards();
            setCategoryLogoInfo(error.message || 'Gagal memuat logo menu.', 'failed');
        }
    }

    async function uploadCategoryLogo(category, file) {
        const safeCategory = String(category || '').trim();
        if (!safeCategory) return;
        setCategoryLogoInfo(`Memvalidasi logo untuk ${safeCategory}...`);
        try {
            const upload = await readCategoryLogoUpload(file);
            setCategoryLogoInfo(`Mengupload logo ${safeCategory}...`);
            const response = await fetch(`/api/admin/category-logos/${encodeURIComponent(safeCategory)}`, {
                method: 'PUT',
                headers: { 'Content-Type': upload.contentType },
                body: upload.body,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal upload logo menu');
            await loadCategoryLogos();
            await loadAdminProducts();
            setCategoryLogoInfo(`Logo menu ${safeCategory} berhasil disimpan.`, 'success');
        } catch (error) {
            setCategoryLogoInfo(error.message || 'Gagal upload logo menu.', 'failed');
        }
    }

    async function toggleCategoryStatus(category, active) {
        const safeCategory = String(category || '').trim();
        if (!safeCategory) return;
        const nextActive = Boolean(active);

        let reason = '';
        if (!nextActive) {
            const confirmed = await showConfirmDialog({
                title: 'Nonaktifkan kategori?',
                message: `Semua produk di kategori ${safeCategory} akan hilang total dari halaman user dan tidak bisa dibeli. Status aktif/nonaktif tiap produk tidak berubah, jadi saat kategori diaktifkan lagi semuanya kembali seperti semula.`,
                confirmText: 'Nonaktifkan',
                cancelText: 'Batal',
            });
            if (!confirmed) return;
            reason = String(window.prompt(`Alasan menonaktifkan kategori ${safeCategory} (opsional):`, '') || '').trim();
        } else {
            const confirmed = await showConfirmDialog({
                title: 'Aktifkan kategori?',
                message: `Kategori ${safeCategory} akan muncul lagi di halaman user. Produk yang kamu nonaktifkan manual tetap nonaktif.`,
                confirmText: 'Aktifkan',
                cancelText: 'Batal',
            });
            if (!confirmed) return;
        }

        setCategoryLogoInfo(`${nextActive ? 'Mengaktifkan' : 'Menonaktifkan'} kategori ${safeCategory}...`);
        try {
            const response = await fetch(`/api/admin/product-categories/${encodeURIComponent(safeCategory)}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: nextActive, reason }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal mengubah status kategori');
            await loadCategoryLogos();
            setCategoryLogoInfo(result?.message || `Status kategori ${safeCategory} diperbarui.`, 'success');
        } catch (error) {
            setCategoryLogoInfo(error.message || 'Gagal mengubah status kategori.', 'failed');
        }
    }

    async function resetCategoryLogo(category) {
        const safeCategory = String(category || '').trim();
        if (!safeCategory) return;
        const confirmed = await showConfirmDialog({
            title: 'Reset Logo Menu',
            message: `Reset logo menu untuk kategori ${safeCategory}? Menu user akan kembali memakai icon bawaan.`,
            confirmText: 'Reset Logo',
            cancelText: 'Batal',
        });
        if (!confirmed) return;
        setCategoryLogoInfo(`Menghapus logo ${safeCategory}...`);
        try {
            const response = await fetch(`/api/admin/category-logos/${encodeURIComponent(safeCategory)}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal reset logo menu');
            await loadCategoryLogos();
            await loadAdminProducts();
            setCategoryLogoInfo(`Logo menu ${safeCategory} berhasil direset.`, 'success');
        } catch (error) {
            setCategoryLogoInfo(error.message || 'Gagal reset logo menu.', 'failed');
        }
    }

    async function toggleQuickServiceProduct(sku, enabled) {
        if (!sku) return;

        try {
            const response = await fetch('/api/admin/products/quick-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buyerSkuCode: sku,
                    enabled,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal update layanan cepat');
            }
            quickServiceSkus = Array.isArray(result?.data?.skus) ? result.data.skus : [];
            applyAdminProductFilters();
            if (adminProductStatusEl) {
                adminProductStatusEl.textContent = `Layanan cepat aktif: ${quickServiceSkus.length}/${result?.data?.maxItems || 4}. Menampilkan ${filterAdminProducts().length} dari ${allAdminProducts.length} produk`;
            }
        } catch (error) {
            if (adminProductStatusEl) adminProductStatusEl.textContent = error.message;
        }
    }

    async function reactivateFailedProduct(sku) {
        const safeSku = String(sku || '').trim();
        if (!safeSku) return;

        const confirmed = await showConfirmDialog({
            title: 'Aktifkan produk?',
            message: `Produk ${safeSku} akan aktif kembali dan counter gagal direset ke 0.`,
            confirmText: 'Aktifkan',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        try {
            if (adminProductStatusEl) adminProductStatusEl.textContent = `Mengaktifkan produk ${safeSku}...`;
            const response = await fetch(`/api/admin/products/${encodeURIComponent(safeSku)}/reactivate`, {
                method: 'POST',
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal mengaktifkan produk');
            }
            await Promise.all([loadProductSummary(), loadAdminProducts()]);
            if (adminProductStatusEl) {
                adminProductStatusEl.textContent = `Produk ${safeSku} berhasil diaktifkan kembali.`;
            }
        } catch (error) {
            if (adminProductStatusEl) adminProductStatusEl.textContent = error.message || 'Gagal mengaktifkan produk.';
        }
    }

    async function toggleAdminProductStatus(sku, active) {
        const safeSku = String(sku || '').trim();
        if (!safeSku) return;
        const nextActive = Boolean(active);

        const confirmed = await showConfirmDialog({
            title: nextActive ? 'Aktifkan produk?' : 'Nonaktifkan produk?',
            message: nextActive
                ? `Produk ${safeSku} akan aktif kembali dan counter gangguan direset.`
                : `Produk ${safeSku} akan ditandai sedang gangguan dan tidak bisa dibeli user.`,
            confirmText: nextActive ? 'Aktifkan' : 'Nonaktifkan',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        try {
            if (adminProductStatusEl) {
                adminProductStatusEl.textContent = `${nextActive ? 'Mengaktifkan' : 'Menonaktifkan'} produk ${safeSku}...`;
            }
            const response = await fetch(`/api/admin/products/${encodeURIComponent(safeSku)}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: nextActive }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal mengubah status produk');
            }
            await Promise.all([loadProductSummary(), loadAdminProducts()]);
            if (adminProductStatusEl) {
                adminProductStatusEl.textContent = `Produk ${safeSku} berhasil ${nextActive ? 'diaktifkan' : 'dinonaktifkan'}.`;
            }
        } catch (error) {
            if (adminProductStatusEl) adminProductStatusEl.textContent = error.message || 'Gagal mengubah status produk.';
        }
    }

    async function setAdminProductHidden(sku, hidden) {
        const safeSku = String(sku || '').trim();
        if (!safeSku) return;

        const confirmed = await showConfirmDialog({
            title: hidden ? 'Sembunyikan produk?' : 'Tampilkan produk ke user?',
            message: hidden
                ? `Produk ${safeSku} tidak akan terlihat dan tidak bisa dibeli user, termasuk setelah sync produk berikutnya. Bisa ditampilkan lagi kapan saja.`
                : `Produk ${safeSku} akan terlihat lagi oleh user dengan status sebelumnya (aktif atau masih gangguan).`,
            confirmText: hidden ? 'Sembunyikan' : 'Tampilkan',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        try {
            if (adminProductStatusEl) {
                adminProductStatusEl.textContent = `${hidden ? 'Menyembunyikan' : 'Menampilkan'} produk ${safeSku}...`;
            }
            const response = await fetch(`/api/admin/products/${encodeURIComponent(safeSku)}/visibility`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hidden: Boolean(hidden) }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal mengubah tampilan produk');
            }
            await Promise.all([loadProductSummary(), loadAdminProducts()]);
            if (adminProductStatusEl) {
                adminProductStatusEl.textContent = `Produk ${safeSku} ${hidden ? 'disembunyikan dari user' : 'ditampilkan lagi ke user'}.`;
            }
        } catch (error) {
            if (adminProductStatusEl) adminProductStatusEl.textContent = error.message || 'Gagal mengubah tampilan produk.';
        }
    }

    async function deleteAdminProduct(sku) {
        const safeSku = String(sku || '').trim();
        if (!safeSku) return;

        const product = allAdminProducts.find(function(item) {
            return String(item?.buyer_sku_code || '') === safeSku;
        });
        // Menghapus produk yang masih ada di Digiflazz hanya sementara: sync
        // berikutnya membuatnya lagi, dan tanda gangguannya ikut hilang.
        const stillAtProvider = product?.provider_active !== false;
        const confirmed = await showConfirmDialog({
            title: 'Hapus produk?',
            message: stillAtProvider
                ? `Produk ${safeSku} masih ada di Digiflazz, jadi sync berikutnya akan memunculkannya lagi sebagai produk aktif. Kalau ingin menyembunyikannya terus, pakai Sembunyikan. Tetap hapus?`
                : `Produk ${safeSku} akan dihapus dari daftar produk. Riwayat transaksi tidak ikut terhapus.`,
            confirmText: 'Iya, Hapus',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        try {
            if (adminProductStatusEl) adminProductStatusEl.textContent = `Menghapus produk ${safeSku}...`;
            const response = await fetch(`/api/admin/products/${encodeURIComponent(safeSku)}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal menghapus produk');
            }
            await Promise.all([loadProductSummary(), loadAdminProducts()]);
            if (adminProductStatusEl) adminProductStatusEl.textContent = `Produk ${safeSku} dihapus.`;
        } catch (error) {
            if (adminProductStatusEl) adminProductStatusEl.textContent = error.message || 'Gagal menghapus produk.';
        }
    }

    function setAdminPromoInfo(message, type) {
        setStatusElement(adminPromoInfoEl, message, type, 'checkout-status');
    }

    function closePromoEditor() {
        editingPromoSku = '';
        if (adminPromoEditorEl) adminPromoEditorEl.hidden = true;
    }

    function openPromoEditorForProduct(product) {
        if (!product || !adminPromoEditorEl) return;
        const sku = String(product.buyer_sku_code || '').trim();
        if (!sku) return;
        editingPromoSku = sku;

        const promoItem = findAdminPromoItemBySku(sku);
        const isCurrentPromo = Boolean(promoItem);
        const baseProductPrice = Number(product.base_price || 0);
        const websitePrice = Number(product.price || baseProductPrice || 0);
        const defaultOriginal = Number(websitePrice || baseProductPrice || 0);
        const safeOriginal = isCurrentPromo
            ? Number(promoItem.originalPrice || defaultOriginal || 0)
            : Number(defaultOriginal || 0);
        const safeFinal = isCurrentPromo
            ? Number(promoItem.finalPrice || defaultOriginal || 0)
            : Number(defaultOriginal || 0);
        const defaultTitle = `Promo cepat: ${product.product_name || sku}`;

        if (adminPromoProductNameEl) {
            adminPromoProductNameEl.textContent = `${product.product_name || sku} (${sku})`;
        }
        if (adminPromoBasePriceTextEl) {
            adminPromoBasePriceTextEl.textContent = formatRupiah(baseProductPrice || websitePrice || 0);
        }
        if (adminPromoDescriptionInputEl) {
            adminPromoDescriptionInputEl.value = isCurrentPromo
                ? String(promoItem.subtitle || '')
                : '';
        }
        if (adminPromoOriginalPriceInputEl) {
            adminPromoOriginalPriceInputEl.value = safeOriginal > 0 ? String(Math.trunc(safeOriginal)) : '';
        }
        if (adminPromoFinalPriceInputEl) {
            adminPromoFinalPriceInputEl.value = safeFinal > 0 ? String(Math.trunc(safeFinal)) : '';
        }
        if (adminPromoDurationHoursInputEl) {
            adminPromoDurationHoursInputEl.value = isCurrentPromo && Number(promoItem.durationHours || 0) > 0
                ? String(Math.trunc(Number(promoItem.durationHours)))
                : '';
        }
        if (adminPromoExpiresAtInputEl) {
            adminPromoExpiresAtInputEl.value = isCurrentPromo
                ? toDateTimeLocalInputValue(promoItem.expiresAt)
                : '';
        }

        if (saveAdminPromoBtn) {
            saveAdminPromoBtn.dataset.promoSku = sku;
            saveAdminPromoBtn.dataset.promoTitle = isCurrentPromo
                ? String(promoItem.title || defaultTitle)
                : defaultTitle;
        }

        adminPromoEditorEl.hidden = false;
        const expiryText = isCurrentPromo && promoItem.expiresAt
            ? `Aktif sampai ${formatDate(promoItem.expiresAt)}.`
            : '';
        setAdminPromoInfo(
            isCurrentPromo
                ? `Produk ini sudah ada di daftar promo. ${expiryText} Ubah deskripsi/harga lalu simpan, atau nonaktifkan promo produk ini.`
                : 'Atur deskripsi promo, harga awal, dan harga promo untuk produk ini.',
        );
        adminPromoEditorEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function savePromoForSelectedProduct() {
        const sku = String(saveAdminPromoBtn?.dataset?.promoSku || editingPromoSku || '').trim();
        if (!sku) {
            setAdminPromoInfo('Produk promo belum dipilih.', 'failed');
            return;
        }
        const originalPrice = Number(adminPromoOriginalPriceInputEl?.value || 0);
        const finalPrice = Number(adminPromoFinalPriceInputEl?.value || 0);
        const description = String(adminPromoDescriptionInputEl?.value || '').trim();
        const durationHours = Number(adminPromoDurationHoursInputEl?.value || 0);
        const expiresAtRaw = String(adminPromoExpiresAtInputEl?.value || '').trim();
        const expiresAtDate = expiresAtRaw ? new Date(expiresAtRaw) : null;
        const hasExpiresAtInput = Boolean(expiresAtRaw);
        const hasDurationInput = Number.isFinite(durationHours) && durationHours > 0;
        const title = String(saveAdminPromoBtn?.dataset?.promoTitle || '').trim() || `Promo cepat: ${sku}`;

        if (!Number.isFinite(originalPrice) || originalPrice < 1) {
            setAdminPromoInfo('Harga awal promo wajib diisi (>= 1).', 'failed');
            return;
        }
        if (!Number.isFinite(finalPrice) || finalPrice < 1) {
            setAdminPromoInfo('Harga promo wajib diisi (>= 1).', 'failed');
            return;
        }

        if (finalPrice >= originalPrice) {
            setAdminPromoInfo('Harga promo harus lebih kecil dari harga awal.', 'failed');
            return;
        }
        if (!hasDurationInput && !hasExpiresAtInput) {
            setAdminPromoInfo('Isi masa aktif promo: jam atau tanggal selesai.', 'failed');
            return;
        }
        if (hasDurationInput && (!Number.isFinite(durationHours) || durationHours < 1)) {
            setAdminPromoInfo('Masa aktif jam minimal 1.', 'failed');
            return;
        }
        if (hasExpiresAtInput && (!expiresAtDate || Number.isNaN(expiresAtDate.getTime()))) {
            setAdminPromoInfo('Format tanggal selesai promo tidak valid.', 'failed');
            return;
        }
        if (hasExpiresAtInput && expiresAtDate.getTime() <= Date.now()) {
            setAdminPromoInfo('Tanggal selesai promo harus lebih dari waktu saat ini.', 'failed');
            return;
        }

        if (saveAdminPromoBtn) saveAdminPromoBtn.disabled = true;
        if (disableAdminPromoBtn) disableAdminPromoBtn.disabled = true;
        setAdminPromoInfo('Menyimpan promo produk...');

        try {
            const existingItems = Array.isArray(activeUserPromoBanner.items)
                ? activeUserPromoBanner.items
                : [];
            const nextItem = {
                enabled: true,
                title,
                subtitle: description,
                sku,
                originalPrice: Math.trunc(originalPrice),
                finalPrice: Math.trunc(finalPrice),
                durationHours: hasDurationInput ? Math.trunc(durationHours) : null,
                expiresAt: hasExpiresAtInput ? expiresAtDate.toISOString() : null,
            };
            const nextItems = existingItems
                .filter(function(item) {
                    return String(item.sku || '') !== sku;
                })
                .concat(nextItem);
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPromoBanner: buildPromoBannerPayload(nextItems, true),
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal menyimpan promo');
            }

            activeUserPromoBanner = normalizeAdminPromoBanner(result?.data?.userPromoBanner || {});
            if (userPromoEnabledInputEl) userPromoEnabledInputEl.checked = activeUserPromoBanner.enabled;
            applyAdminProductFilters();
            setAdminPromoInfo('Promo produk berhasil disimpan.', 'success');
        } catch (error) {
            setAdminPromoInfo(error.message || 'Gagal menyimpan promo.', 'failed');
        } finally {
            if (saveAdminPromoBtn) saveAdminPromoBtn.disabled = false;
            if (disableAdminPromoBtn) disableAdminPromoBtn.disabled = false;
        }
    }

    async function disableActivePromo() {
        const sku = String(saveAdminPromoBtn?.dataset?.promoSku || editingPromoSku || '').trim();
        if (!sku) {
            setAdminPromoInfo('Produk promo belum dipilih.', 'failed');
            return;
        }
        if (saveAdminPromoBtn) saveAdminPromoBtn.disabled = true;
        if (disableAdminPromoBtn) disableAdminPromoBtn.disabled = true;
        setAdminPromoInfo('Menonaktifkan promo...');

        try {
            const nextItems = (activeUserPromoBanner.items || []).map(function(item) {
                if (String(item.sku || '') !== sku) return item;
                return {
                    ...item,
                    enabled: false,
                };
            });
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPromoBanner: buildPromoBannerPayload(nextItems, activeUserPromoBanner.enabled),
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal menonaktifkan promo');
            }
            activeUserPromoBanner = normalizeAdminPromoBanner(result?.data?.userPromoBanner || {});
            if (userPromoEnabledInputEl) userPromoEnabledInputEl.checked = activeUserPromoBanner.enabled;
            applyAdminProductFilters();
            setAdminPromoInfo('Promo produk berhasil dinonaktifkan.', 'success');
        } catch (error) {
            setAdminPromoInfo(error.message || 'Gagal menonaktifkan promo.', 'failed');
        } finally {
            if (saveAdminPromoBtn) saveAdminPromoBtn.disabled = false;
            if (disableAdminPromoBtn) disableAdminPromoBtn.disabled = false;
        }
    }

    async function loadPricingConfig() {
        try {
            const response = await fetch('/api/admin/settings');
            if (!response.ok) throw new Error('Gagal mengambil konfigurasi setting');
            const result = await response.json();
            const productPricing = result?.data?.productPricing || {
                flatMarginUnder30000: Number(result?.data?.productMarkupFee || 1000),
            };
            const topupMin = Number(result?.data?.topupMinAmount || 10000);
            const csWhatsappNumber = String(result?.data?.csWhatsappNumber || '');
            const operations = result?.data?.operations || {};
            const userPromo = result?.data?.userPromoBanner || {};
            activeUserPromoBanner = normalizeAdminPromoBanner(userPromo);
            const backup = result?.data?.backup || {};
            const paymentGateway = result?.data?.paymentGateway || {};
            const midtrans = paymentGateway.midtrans || {};
            const development = result?.data?.developmentMode || {};
            const productAutoSync = result?.data?.productAutoSync || {};
            const digiflazzBalanceWarning = result?.data?.digiflazzBalanceWarning || {};
            const appliedPricing = applyProductPricingFields(productPricing);
            if (topupMinAmountInputEl) topupMinAmountInputEl.value = String(topupMin);
            if (csWhatsappNumberInputEl) csWhatsappNumberInputEl.value = csWhatsappNumber;
            renderDigiflazzBalanceWarningInfo(digiflazzBalanceWarning);
            renderDigiflazzProductLimitInfo(result?.data?.digiflazzProductLimit || {});
            applyProductAutoSyncFields(productAutoSync);
            if (productPurchaseEnabledInputEl) productPurchaseEnabledInputEl.checked = operations.productPurchaseEnabled !== false;
            if (walletTopupEnabledInputEl) walletTopupEnabledInputEl.checked = operations.topupEnabled !== false;
            if (qrisPaymentEnabledInputEl) qrisPaymentEnabledInputEl.checked = operations.qrisEnabled !== false;
            if (gameUsernameCheckEnabledInputEl) gameUsernameCheckEnabledInputEl.checked = operations.gameUsernameCheckEnabled !== false;
            const cutOff = applyAdminCutOffFields(operations.cutOff || {});
            if (operationsMessageInputEl) operationsMessageInputEl.value = String(operations.message || '');
            if (developmentModeEnabledInputEl) developmentModeEnabledInputEl.checked = Boolean(development.enabled);
            if (developmentAllowedIdentitiesInputEl) developmentAllowedIdentitiesInputEl.value = getDevelopmentAllowedText(development);
            if (developmentMessageInputEl) developmentMessageInputEl.value = String(development.message || '');
            if (userPromoEnabledInputEl) userPromoEnabledInputEl.checked = Boolean(userPromo?.enabled);
            if (paymentGatewayProviderInputEl) paymentGatewayProviderInputEl.value = String(paymentGateway.provider || 'midtrans');
            if (midtransProductionInputEl) midtransProductionInputEl.checked = Boolean(midtrans.isProduction);
            if (midtransClientKeyInputEl) midtransClientKeyInputEl.value = String(midtrans.clientKey || '');
            if (midtransEnabledPaymentsInputEl) midtransEnabledPaymentsInputEl.value = String(midtrans.enabledPayments || 'qris,gopay,shopeepay,bank_transfer');
            if (midtransSnapBaseUrlInputEl) midtransSnapBaseUrlInputEl.value = String(midtrans.snapBaseUrl || '');
            if (midtransApiBaseUrlInputEl) midtransApiBaseUrlInputEl.value = String(midtrans.apiBaseUrl || '');
            if (midtransSnapJsUrlInputEl) midtransSnapJsUrlInputEl.value = String(midtrans.snapJsUrl || '');
            if (midtransServerKeyInputEl) {
                midtransServerKeyInputEl.value = '';
                const maskedServerKey = String(midtrans.serverKeyMasked || '');
                midtransServerKeyInputEl.placeholder = maskedServerKey
                    ? `Key tersimpan: ${maskedServerKey} (kosongkan jika tidak diubah)`
                    : 'SB-Mid-server-...';
            }
            if (backupTelegramChatIdInputEl) backupTelegramChatIdInputEl.value = String(backup.telegramChatId || '');
            if (backupAutoEnabledInputEl) backupAutoEnabledInputEl.checked = backup.autoEnabled !== false;
            if (backupTelegramBotTokenInputEl) {
                backupTelegramBotTokenInputEl.value = '';
                const masked = String(backup.telegramBotTokenMasked || '');
                backupTelegramBotTokenInputEl.placeholder = masked
                    ? `Token tersimpan: ${masked} (kosongkan jika tidak diubah)`
                    : 'Contoh: 123456:ABCDEF...';
            }
            if (productFeeInfoEl) {
                const promoStatus = activeUserPromoBanner.enabled
                    ? `${activeUserPromoBanner.activeCount || 0} promo aktif dari ${activeUserPromoBanner.items.length} promo`
                    : 'Nonaktif';
                const opsStatus = `Pembelian ${operations.productPurchaseEnabled === false ? 'OFF' : 'ON'} / Topup ${operations.topupEnabled === false ? 'OFF' : 'ON'} / QRIS ${operations.qrisEnabled === false ? 'OFF' : 'ON'} / Cek username ${operations.gameUsernameCheckEnabled === false ? 'OFF' : 'ON'} / ${getAdminCutOffSummary(cutOff)}`;
                const digiThreshold = Number(digiflazzBalanceWarning.threshold || 0);
                const digiWarningStatus = digiThreshold > 0
                    ? `Peringatan saldo Digiflazz: ${formatRupiah(digiThreshold)}`
                    : 'Peringatan saldo Digiflazz: Nonaktif';
                const digiWarningChatStatus = digiflazzBalanceWarning.telegramChatId
                    ? 'Grup saldo: khusus'
                    : 'Grup saldo: fallback utama';
                productFeeInfoEl.textContent = `${getProductPricingSummary(appliedPricing)} | Minimal topup: Rp ${topupMin.toLocaleString('id-ID')} | ${digiWarningStatus} | ${digiWarningChatStatus} | ${opsStatus} | CS WA: ${csWhatsappNumber || '-'} | Promo user: ${promoStatus}`;
            }
            if (operationsSettingsInfoEl) {
                operationsSettingsInfoEl.textContent = `Operasional: pembelian ${operations.productPurchaseEnabled === false ? 'OFF' : 'ON'}, topup ${operations.topupEnabled === false ? 'OFF' : 'ON'}, payment ${operations.qrisEnabled === false ? 'OFF' : 'ON'}, cek username ${operations.gameUsernameCheckEnabled === false ? 'OFF' : 'ON'}, ${getAdminCutOffSummary(cutOff)}.`;
            }
            if (paymentGatewayInfoEl) {
                const providerName = String(paymentGateway.provider || 'midtrans').toUpperCase();
                const mode = midtrans.isProduction ? 'production' : 'sandbox';
                paymentGatewayInfoEl.textContent = `Provider aktif: ${providerName}${paymentGateway.provider === 'midtrans' ? ` (${mode}, SNAP)` : ''}. Webhook Midtrans: ${window.location.origin}/api/midtrans/webhook`;
            }
            renderDevelopmentInfo(development);
            applyAdminProductFilters();
            renderBackupInfo(backup);
            renderTestimonialSettings(result?.data?.testimonial || {}, result?.data?.adminNotification || {});
            renderRestoreInfo(result?.data?.restore || {});
            void loadDigiflazzBalanceSnapshot();
            void loadBackupFiles();
        } catch (_error) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Pengaturan pricing belum bisa dimuat.';
            if (backupInfoEl) backupInfoEl.textContent = 'Status backup belum bisa dimuat.';
            if (restoreInfoEl) restoreInfoEl.textContent = 'Status restore belum bisa dimuat.';
        }
    }

    async function savePricingConfig(event) {
        const saveButtons = [saveProductFeeBtn, saveProductAutoSyncBtn, saveOperationsSettingsBtn, saveDevelopmentSettingsBtn, savePaymentGatewayBtn, saveBackupSettingsBtn].filter(Boolean);
        if (!saveButtons.length) return;
        const sourceButtonId = String(event?.currentTarget?.id || '').trim();
        const shouldSaveWebsite = !sourceButtonId || sourceButtonId === 'saveProductFeeBtn';
        const shouldSaveProductAutoSync = !sourceButtonId || sourceButtonId === 'saveProductAutoSyncBtn';
        const shouldSaveOperations = !sourceButtonId || sourceButtonId === 'saveOperationsSettingsBtn';
        const shouldSaveDevelopment = !sourceButtonId || sourceButtonId === 'saveDevelopmentSettingsBtn';
        const shouldSavePaymentGateway = !sourceButtonId || sourceButtonId === 'savePaymentGatewayBtn';
        const shouldSaveBackup = !sourceButtonId || sourceButtonId === 'saveBackupSettingsBtn';
        const flatMargin = Number(productFlatMarginInputEl?.value || 0);
        const midMarginPercent = Number(productMidMarginPercentInputEl?.value || 0);
        const highMarginPercent = Number(productHighMarginPercentInputEl?.value || 0);
        const qrisFeeEnabled = productQrisFeeEnabledInputEl ? Boolean(productQrisFeeEnabledInputEl.checked) : true;
        const qrisFeePercent = Number(productQrisFeePercentInputEl?.value || 0);
        const topupMin = Number(topupMinAmountInputEl?.value || 0);
        const digiflazzBalanceWarningThreshold = Number(digiflazzBalanceWarningThresholdInputEl?.value || 0);
        const digiflazzBalanceWarningTelegramChatId = String(digiflazzBalanceWarningTelegramChatIdInputEl?.value || '').trim();
        const digiflazzProductLimitEnabled = digiflazzProductLimitEnabledInputEl
            ? Boolean(digiflazzProductLimitEnabledInputEl.checked)
            : true;
        const digiflazzProductLimitMargin = Number(digiflazzProductLimitMarginInputEl?.value || 0);
        const csWhatsappNumber = String(csWhatsappNumberInputEl?.value || '').trim();
        const productAutoSyncEnabled = productAutoSyncEnabledInputEl ? Boolean(productAutoSyncEnabledInputEl.checked) : true;
        const productAutoSyncTime = String(productAutoSyncTimeInputEl?.value || '00:00').trim();
        const productAutoSyncTimezone = String(productAutoSyncTimezoneInputEl?.value || 'Asia/Jakarta').trim() || 'Asia/Jakarta';
        const productPurchaseEnabled = productPurchaseEnabledInputEl ? Boolean(productPurchaseEnabledInputEl.checked) : true;
        const walletTopupEnabled = walletTopupEnabledInputEl ? Boolean(walletTopupEnabledInputEl.checked) : true;
        const qrisPaymentEnabled = qrisPaymentEnabledInputEl ? Boolean(qrisPaymentEnabledInputEl.checked) : true;
        const gameUsernameCheckEnabled = gameUsernameCheckEnabledInputEl ? Boolean(gameUsernameCheckEnabledInputEl.checked) : true;
        const dailyCutOffEnabled = dailyCutOffEnabledInputEl ? Boolean(dailyCutOffEnabledInputEl.checked) : true;
        const dailyCutOffStart = String(dailyCutOffStartInputEl?.value || '23:30').trim();
        const dailyCutOffEnd = String(dailyCutOffEndInputEl?.value || '00:30').trim();
        const dailyCutOffTimezone = String(dailyCutOffTimezoneInputEl?.value || 'Asia/Jakarta').trim() || 'Asia/Jakarta';
        const dailyCutOffMessage = String(dailyCutOffMessageInputEl?.value || '').trim();
        const operationsMessage = String(operationsMessageInputEl?.value || '').trim();
        const developmentModeEnabled = Boolean(developmentModeEnabledInputEl?.checked);
        const developmentAllowedIdentities = String(developmentAllowedIdentitiesInputEl?.value || '').trim();
        const developmentMessage = String(developmentMessageInputEl?.value || '').trim();
        const userPromoEnabled = Boolean(userPromoEnabledInputEl?.checked);
        const backupTelegramBotToken = String(backupTelegramBotTokenInputEl?.value || '').trim();
        const backupTelegramChatId = String(backupTelegramChatIdInputEl?.value || '').trim();
        const backupAutoEnabled = Boolean(backupAutoEnabledInputEl?.checked);
        const paymentGatewayProvider = String(paymentGatewayProviderInputEl?.value || 'midtrans').trim();
        const midtransServerKey = String(midtransServerKeyInputEl?.value || '').trim();
        const midtransClientKey = String(midtransClientKeyInputEl?.value || '').trim();
        const midtransEnabledPayments = String(midtransEnabledPaymentsInputEl?.value || 'qris,gopay,shopeepay,bank_transfer').trim();
        const midtransSnapBaseUrl = String(midtransSnapBaseUrlInputEl?.value || '').trim();
        const midtransApiBaseUrl = String(midtransApiBaseUrlInputEl?.value || '').trim();
        const midtransSnapJsUrl = String(midtransSnapJsUrlInputEl?.value || '').trim();
        if (shouldSaveWebsite && (!Number.isFinite(flatMargin) || flatMargin < 0)) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Margin flat harus angka >= 0';
            return;
        }
        if (shouldSaveWebsite && (!Number.isFinite(midMarginPercent) || midMarginPercent < 0)) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Margin 30-100rb harus angka persen >= 0';
            return;
        }
        if (shouldSaveWebsite && (!Number.isFinite(highMarginPercent) || highMarginPercent < 0)) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Margin >100rb harus angka persen >= 0';
            return;
        }
        if (shouldSaveWebsite && (!Number.isFinite(qrisFeePercent) || qrisFeePercent < 0)) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Fee QRIS harus angka persen >= 0';
            return;
        }
        if (shouldSaveWebsite && (!Number.isFinite(topupMin) || topupMin < 1)) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Minimal topup harus angka >= 1';
            return;
        }
        if (shouldSaveWebsite && (!Number.isFinite(digiflazzBalanceWarningThreshold) || digiflazzBalanceWarningThreshold < 0)) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Batas peringatan saldo Digiflazz harus angka >= 0';
            return;
        }
        if (shouldSaveWebsite && !csWhatsappNumber) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Nomor WhatsApp CS wajib diisi';
            return;
        }
        if (shouldSaveBackup && backupTelegramBotToken && !backupTelegramChatId) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = 'Jika isi token Telegram, chat ID backup juga wajib diisi';
            if (backupInfoEl) backupInfoEl.textContent = 'Jika isi token Telegram, chat ID backup juga wajib diisi';
            return;
        }
        if (shouldSavePaymentGateway && paymentGatewayProvider === 'midtrans' && !midtransClientKey) {
            if (paymentGatewayInfoEl) paymentGatewayInfoEl.textContent = 'Client Key Midtrans wajib diisi.';
            return;
        }
        if (shouldSaveDevelopment && developmentModeEnabled && !developmentAllowedIdentities) {
            if (developmentSettingsInfoEl) developmentSettingsInfoEl.textContent = 'Isi minimal satu email atau username yang boleh akses.';
            return;
        }
        if (shouldSaveProductAutoSync && !/^\d{2}:\d{2}$/.test(productAutoSyncTime)) {
            if (productAutoSyncInfoEl) productAutoSyncInfoEl.textContent = 'Jam autosync harus format HH:mm.';
            return;
        }
        if (shouldSaveOperations && (!/^\d{2}:\d{2}$/.test(dailyCutOffStart) || !/^\d{2}:\d{2}$/.test(dailyCutOffEnd))) {
            if (operationsSettingsInfoEl) operationsSettingsInfoEl.textContent = 'Jam cut off harus format HH:mm.';
            return;
        }
        if (shouldSaveOperations && dailyCutOffStart === dailyCutOffEnd) {
            if (operationsSettingsInfoEl) operationsSettingsInfoEl.textContent = 'Jam mulai cut off dan jam normal kembali tidak boleh sama.';
            return;
        }
        saveButtons.forEach(function(button) {
            button.disabled = true;
        });
        if (shouldSaveWebsite && productFeeInfoEl) productFeeInfoEl.textContent = 'Menyimpan pengaturan website...';
        if (shouldSaveProductAutoSync && productAutoSyncInfoEl) productAutoSyncInfoEl.textContent = 'Menyimpan autosync produk...';
        if (shouldSaveOperations && operationsSettingsInfoEl) operationsSettingsInfoEl.textContent = 'Menyimpan setting operasional...';
        if (shouldSaveDevelopment && developmentSettingsInfoEl) developmentSettingsInfoEl.textContent = 'Menyimpan mode development...';
        if (shouldSavePaymentGateway && paymentGatewayInfoEl) paymentGatewayInfoEl.textContent = 'Menyimpan payment gateway...';
        if (shouldSaveBackup && backupInfoEl) backupInfoEl.textContent = 'Menyimpan setting backup...';
        try {
            const payload = {};
            if (shouldSaveWebsite) {
                payload.productPricing = {
                    flatMarginUnder30000: Math.trunc(flatMargin),
                    midMarginPercent: String(midMarginPercent),
                    highMarginPercent: String(highMarginPercent),
                    qrisFeeEnabled,
                    qrisFeePercent: String(qrisFeePercent),
                };
                payload.topupMinAmount = Math.trunc(topupMin);
                payload.digiflazzBalanceWarningThreshold = Math.trunc(digiflazzBalanceWarningThreshold);
                payload.digiflazzBalanceWarningTelegramChatId = digiflazzBalanceWarningTelegramChatId;
                payload.digiflazzProductLimit = {
                    enabled: digiflazzProductLimitEnabled,
                    safetyMargin: Math.trunc(digiflazzProductLimitMargin),
                };
                payload.csWhatsappNumber = csWhatsappNumber;
                payload.userPromoBanner = buildPromoBannerPayload(activeUserPromoBanner.items, userPromoEnabled);
            }
            if (shouldSaveProductAutoSync) {
                payload.productAutoSync = {
                    enabled: productAutoSyncEnabled,
                    time: productAutoSyncTime,
                    timeZone: productAutoSyncTimezone,
                };
            }
            if (shouldSaveOperations) {
                payload.operations = {
                    productPurchaseEnabled,
                    topupEnabled: walletTopupEnabled,
                    qrisEnabled: qrisPaymentEnabled,
                    gameUsernameCheckEnabled,
                    message: operationsMessage,
                    cutOff: {
                        enabled: dailyCutOffEnabled,
                        startTime: dailyCutOffStart,
                        endTime: dailyCutOffEnd,
                        timeZone: dailyCutOffTimezone,
                        message: dailyCutOffMessage,
                    },
                };
            }
            if (shouldSaveDevelopment) {
                payload.developmentMode = {
                    enabled: developmentModeEnabled,
                    allowedIdentities: developmentAllowedIdentities,
                    message: developmentMessage,
                };
            }
            if (shouldSaveBackup) {
                payload.backupAutoEnabled = backupAutoEnabled;
                if (backupTelegramChatId) {
                    payload.backupTelegramChatId = backupTelegramChatId;
                }
                if (backupTelegramBotToken) {
                    payload.backupTelegramBotToken = backupTelegramBotToken;
                }
            }
            if (shouldSavePaymentGateway) {
                const paymentGatewayPayload = {
                    provider: paymentGatewayProvider,
                    midtrans: {
                        isProduction: Boolean(midtransProductionInputEl?.checked),
                        clientKey: midtransClientKey,
                        enabledPayments: midtransEnabledPayments,
                        snapBaseUrl: midtransSnapBaseUrl,
                        apiBaseUrl: midtransApiBaseUrl,
                        snapJsUrl: midtransSnapJsUrl,
                    },
                };
                if (midtransServerKey) {
                    paymentGatewayPayload.midtrans.serverKey = midtransServerKey;
                }
                payload.paymentGateway = paymentGatewayPayload;
            }
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal simpan fee');
            }
            const savedPricing = normalizeAdminProductPricing(result?.data?.productPricing || {
                flatMarginUnder30000: Number(result?.data?.productMarkupFee || 1000),
            });
            const savedTopupMin = Number(result?.data?.topupMinAmount || 10000);
            const savedDigiflazzBalanceWarning = result?.data?.digiflazzBalanceWarning || {};
            const savedDigiflazzBalanceThreshold = Number(savedDigiflazzBalanceWarning.threshold || 0);
            const savedCsWhatsapp = String(result?.data?.csWhatsappNumber || '');
            const savedOperations = result?.data?.operations || {};
            const savedPromo = result?.data?.userPromoBanner || {};
            activeUserPromoBanner = normalizeAdminPromoBanner(savedPromo);
            const backup = result?.data?.backup || {};
            const savedGateway = result?.data?.paymentGateway || {};
            const savedMidtrans = savedGateway.midtrans || {};
            const savedDevelopment = result?.data?.developmentMode || {};
            const savedProductAutoSync = result?.data?.productAutoSync || {};
            applyProductPricingFields(savedPricing);
            if (topupMinAmountInputEl) topupMinAmountInputEl.value = String(savedTopupMin);
            if (digiflazzBalanceWarningThresholdInputEl) digiflazzBalanceWarningThresholdInputEl.value = String(savedDigiflazzBalanceThreshold);
            if (digiflazzBalanceWarningTelegramChatIdInputEl) {
                digiflazzBalanceWarningTelegramChatIdInputEl.value = String(savedDigiflazzBalanceWarning.telegramChatId || '');
                digiflazzBalanceWarningTelegramChatIdInputEl.placeholder = savedDigiflazzBalanceWarning.usesFallbackChatId && savedDigiflazzBalanceWarning.effectiveTelegramChatId
                    ? `Fallback grup utama: ${savedDigiflazzBalanceWarning.effectiveTelegramChatId}`
                    : 'Contoh: -1001234567890';
            }
            if (csWhatsappNumberInputEl) csWhatsappNumberInputEl.value = savedCsWhatsapp;
            renderDigiflazzBalanceWarningInfo(savedDigiflazzBalanceWarning);
            renderDigiflazzProductLimitInfo(result?.data?.digiflazzProductLimit || {});
            applyProductAutoSyncFields(savedProductAutoSync);
            if (productPurchaseEnabledInputEl) productPurchaseEnabledInputEl.checked = savedOperations.productPurchaseEnabled !== false;
            if (walletTopupEnabledInputEl) walletTopupEnabledInputEl.checked = savedOperations.topupEnabled !== false;
            if (qrisPaymentEnabledInputEl) qrisPaymentEnabledInputEl.checked = savedOperations.qrisEnabled !== false;
            if (gameUsernameCheckEnabledInputEl) gameUsernameCheckEnabledInputEl.checked = savedOperations.gameUsernameCheckEnabled !== false;
            const savedCutOff = applyAdminCutOffFields(savedOperations.cutOff || {});
            if (operationsMessageInputEl) operationsMessageInputEl.value = String(savedOperations.message || '');
            if (developmentModeEnabledInputEl) developmentModeEnabledInputEl.checked = Boolean(savedDevelopment.enabled);
            if (developmentAllowedIdentitiesInputEl) developmentAllowedIdentitiesInputEl.value = getDevelopmentAllowedText(savedDevelopment);
            if (developmentMessageInputEl) developmentMessageInputEl.value = String(savedDevelopment.message || '');
            if (userPromoEnabledInputEl) userPromoEnabledInputEl.checked = Boolean(savedPromo?.enabled);
            if (paymentGatewayProviderInputEl) paymentGatewayProviderInputEl.value = String(savedGateway.provider || 'midtrans');
            if (midtransProductionInputEl) midtransProductionInputEl.checked = Boolean(savedMidtrans.isProduction);
            if (midtransClientKeyInputEl) midtransClientKeyInputEl.value = String(savedMidtrans.clientKey || '');
            if (midtransEnabledPaymentsInputEl) midtransEnabledPaymentsInputEl.value = String(savedMidtrans.enabledPayments || 'qris,gopay,shopeepay,bank_transfer');
            if (midtransSnapBaseUrlInputEl) midtransSnapBaseUrlInputEl.value = String(savedMidtrans.snapBaseUrl || '');
            if (midtransApiBaseUrlInputEl) midtransApiBaseUrlInputEl.value = String(savedMidtrans.apiBaseUrl || '');
            if (midtransSnapJsUrlInputEl) midtransSnapJsUrlInputEl.value = String(savedMidtrans.snapJsUrl || '');
            if (midtransServerKeyInputEl) {
                midtransServerKeyInputEl.value = '';
                const maskedServerKey = String(savedMidtrans.serverKeyMasked || '');
                midtransServerKeyInputEl.placeholder = maskedServerKey
                    ? `Key tersimpan: ${maskedServerKey} (kosongkan jika tidak diubah)`
                    : 'SB-Mid-server-...';
            }
            if (backupTelegramChatIdInputEl) backupTelegramChatIdInputEl.value = String(backup.telegramChatId || '');
            if (backupAutoEnabledInputEl) backupAutoEnabledInputEl.checked = backup.autoEnabled !== false;
            if (backupTelegramBotTokenInputEl) {
                backupTelegramBotTokenInputEl.value = '';
                const masked = String(backup.telegramBotTokenMasked || '');
                backupTelegramBotTokenInputEl.placeholder = masked
                    ? `Token tersimpan: ${masked} (kosongkan jika tidak diubah)`
                    : 'Contoh: 123456:ABCDEF...';
            }
            const opsStatus = `Pembelian ${savedOperations.productPurchaseEnabled === false ? 'OFF' : 'ON'} / Topup ${savedOperations.topupEnabled === false ? 'OFF' : 'ON'} / QRIS ${savedOperations.qrisEnabled === false ? 'OFF' : 'ON'} / Cek username ${savedOperations.gameUsernameCheckEnabled === false ? 'OFF' : 'ON'} / ${getAdminCutOffSummary(savedCutOff)}`;
            if (productFeeInfoEl) {
                const promoStatus = activeUserPromoBanner.enabled
                    ? `${activeUserPromoBanner.activeCount || 0} promo aktif dari ${activeUserPromoBanner.items.length} promo`
                    : 'Nonaktif';
                const digiWarningStatus = savedDigiflazzBalanceThreshold > 0
                    ? `Peringatan saldo Digiflazz: ${formatRupiah(savedDigiflazzBalanceThreshold)}`
                    : 'Peringatan saldo Digiflazz: Nonaktif';
                const digiWarningChatStatus = savedDigiflazzBalanceWarning.telegramChatId
                    ? 'Grup saldo: khusus'
                    : 'Grup saldo: fallback utama';
                productFeeInfoEl.textContent = `Tersimpan. ${getProductPricingSummary(savedPricing)} | Minimal topup: Rp ${savedTopupMin.toLocaleString('id-ID')} | ${digiWarningStatus} | ${digiWarningChatStatus} | ${opsStatus} | CS WA: ${savedCsWhatsapp || '-'} | Promo user: ${promoStatus}`;
            }
            if (shouldSaveProductAutoSync && productAutoSyncInfoEl) {
                productAutoSyncInfoEl.textContent = `Tersimpan. ${productAutoSyncEnabled ? `Autosync aktif setiap ${productAutoSyncTime} (${productAutoSyncTimezone}).` : 'Autosync produk nonaktif.'}`;
            }
            if (operationsSettingsInfoEl) {
                operationsSettingsInfoEl.textContent = `Tersimpan. ${opsStatus}.`;
            }
            renderDevelopmentInfo(savedDevelopment);
            if (paymentGatewayInfoEl) {
                const providerName = String(savedGateway.provider || 'midtrans').toUpperCase();
                const mode = savedMidtrans.isProduction ? 'production' : 'sandbox';
                paymentGatewayInfoEl.textContent = `Tersimpan. Provider aktif: ${providerName}${savedGateway.provider === 'midtrans' ? ` (${mode}, SNAP)` : ''}. Webhook Midtrans: ${window.location.origin}/api/midtrans/webhook`;
            }
            renderBackupInfo(backup);
            if (shouldSaveWebsite) {
                void loadDigiflazzBalanceSnapshot();
            }
            applyAdminProductFilters();
            await loadAdminProducts();
        } catch (error) {
            if (productFeeInfoEl) productFeeInfoEl.textContent = error.message;
            if (productAutoSyncInfoEl) productAutoSyncInfoEl.textContent = error.message;
            if (operationsSettingsInfoEl) operationsSettingsInfoEl.textContent = error.message;
            if (shouldSaveDevelopment) {
                await loadPricingConfig();
            }
            if (developmentSettingsInfoEl) {
                developmentSettingsInfoEl.textContent = shouldSaveDevelopment
                    ? `Gagal menyimpan: ${error.message}. Status dikembalikan sesuai server.`
                    : error.message;
            }
            if (paymentGatewayInfoEl) paymentGatewayInfoEl.textContent = error.message;
        } finally {
            saveButtons.forEach(function(button) {
                button.disabled = false;
            });
        }
    }

    async function syncProducts() {
        if (!syncProductsBtn) return;

        if (!syncProductsBtn.dataset.originalHtml) syncProductsBtn.dataset.originalHtml = syncProductsBtn.innerHTML;
        syncProductsBtn.disabled = true;
        syncProductsBtn.classList.add('is-loading');
        syncProductsBtn.innerHTML = '<i class="fas fa-spinner"></i> Sync...';
        setStatusElement(productSyncInfoEl, 'Mengambil produk dari Digiflazz dan menyimpan ke database...', 'loading', 'checkout-status');

        try {
            const response = await fetch('/api/admin/products/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cmd: 'prepaid' }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.details?.data?.message || result?.error || 'Sync produk gagal');
            }

            const data = result?.data || {};
            setStatusElement(productSyncInfoEl, `Sync selesai: ${data.active || 0} aktif dari ${data.total || 0} produk.`, 'success', 'checkout-status');
            await loadAdminOverview();
            await loadProductSummary();
            await loadAdminProducts();
        } catch (error) {
            setStatusElement(productSyncInfoEl, error.message, 'failed', 'checkout-status');
        } finally {
            syncProductsBtn.disabled = false;
            syncProductsBtn.classList.remove('is-loading');
            if (syncProductsBtn.dataset.originalHtml) {
                syncProductsBtn.innerHTML = syncProductsBtn.dataset.originalHtml;
                delete syncProductsBtn.dataset.originalHtml;
            }
        }
    }

    async function triggerBackupNow() {
        if (!triggerBackupNowBtn) return;
        triggerBackupNowBtn.disabled = true;
        if (backupInfoEl) backupInfoEl.textContent = 'Menjalankan backup database...';
        try {
            const response = await fetch('/api/admin/backup/now', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestedBy: 'admin-dashboard' }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Backup gagal dijalankan');
            }
            const data = result?.data || {};
            const sizeText = Number(data.sizeBytes || 0).toLocaleString('id-ID');
            if (backupInfoEl) {
                backupInfoEl.textContent = `Backup berhasil. File: ${data.fileName || '-'} (${sizeText} bytes), dikirim ke Telegram.`;
            }
            await loadPricingConfig();
            await loadBackupFiles();
        } catch (error) {
            if (backupInfoEl) backupInfoEl.textContent = error.message;
        } finally {
            triggerBackupNowBtn.disabled = false;
        }
    }

    async function triggerRestoreNow() {
        if (!triggerRestoreNowBtn || !restoreDumpFileInputEl) return;
        const file = restoreDumpFileInputEl.files && restoreDumpFileInputEl.files[0];
        if (!file) {
            if (restoreInfoEl) restoreInfoEl.textContent = 'Pilih file backup .dump dulu.';
            return;
        }
        if (!String(file.name || '').toLowerCase().endsWith('.dump')) {
            if (restoreInfoEl) restoreInfoEl.textContent = 'Format file harus .dump';
            return;
        }

        const confirmed = await showConfirmDialog({
            title: 'Konfirmasi Restore',
            message: 'Yakin restore database sekarang? Data saat ini akan ditimpa. Masukkan password admin untuk melanjutkan.',
            confirmText: 'Iya, Restore',
            cancelText: 'Batal',
            passwordInput: true,
            passwordLabel: 'Password admin',
        });
        if (!confirmed?.confirmed || !confirmed.password) return;

        triggerRestoreNowBtn.disabled = true;
        if (restoreInfoEl) restoreInfoEl.textContent = 'Upload file dan menjalankan restore database...';
        try {
            const response = await fetch('/api/admin/backup/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'x-file-name': file.name,
                    'x-requested-by': 'admin-dashboard',
                    'x-restore-clean': 'true',
                    'x-admin-password': confirmed.password,
                },
                body: file,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Restore gagal');
            }
            const data = result?.data || {};
            if (restoreInfoEl) {
                restoreInfoEl.textContent = `Restore berhasil dari file ${data.fileName || file.name}. Waktu proses: ${Math.max(0, Number(data.durationMs || 0))} ms.`;
            }
            restoreDumpFileInputEl.value = '';
            await loadPricingConfig();
            await loadBackupFiles();
            await loadAdminOverview();
            await loadProductSummary();
            await loadAdminProducts();
            await loadAdminTransactions();
            await loadAdminPaymentOrders();
            currentAdminUserPage = 1;
            await loadAdminUsers(1);
        } catch (error) {
            if (restoreInfoEl) restoreInfoEl.textContent = error.message;
        } finally {
            triggerRestoreNowBtn.disabled = false;
        }
    }

    async function loadAdminTransactions() {
        try {
            const response = await fetch('/api/transactions?take=200');
            if (!response.ok) throw new Error('Gagal mengambil riwayat pembelian');
            const result = await response.json();
            allAdminTransactions = Array.isArray(result?.data) ? result.data : [];
            currentAdminTxPage = 1;
            applyTransactionFilters();
        } catch (_error) {
            allAdminTransactions = [];
            currentAdminTxPage = 1;
            applyTransactionFilters();
        }
    }

    function renderAdminUsers(users, options = {}) {
        if (!userTbody) return;
        userTbody.innerHTML = '';

        if (!users.length) {
            const row = document.createElement('tr');
            const cell = createCell(options.failed
                ? 'Daftar pengguna gagal dimuat, bukan berarti kosong. Cek log server lalu muat ulang.'
                : 'Belum ada pengguna terdaftar.');
            cell.colSpan = 4;
            row.appendChild(cell);
            userTbody.appendChild(row);
            return;
        }

        users.forEach(function(user) {
            const name = user.username || user.email || '-';
            const balanceValue = Number(user.balance || 0);
            const row = document.createElement('tr');
            const nameCell = createCell(name);
            nameCell.dataset.label = 'Nama';
            row.appendChild(nameCell);

            const emailCell = createCell(user.email || '-');
            emailCell.dataset.label = 'Email';
            row.appendChild(emailCell);

            const balanceCell = createCell(formatRupiah(balanceValue));
            balanceCell.dataset.label = 'Saldo';
            row.appendChild(balanceCell);

            const actionCell = document.createElement('td');
            actionCell.dataset.label = 'Aksi';
            const actionWrap = document.createElement('div');
            actionWrap.className = 'user-action-buttons';
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'receipt-btn';
            editBtn.dataset.userBalanceEdit = user.id || '';
            editBtn.dataset.userLookup = user.username || user.email || '';
            editBtn.innerHTML = '<i class="fas fa-wallet"></i> Saldo';
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'receipt-btn danger-action';
            deleteBtn.dataset.userDelete = user.id || '';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus';
            actionWrap.appendChild(editBtn);
            actionWrap.appendChild(deleteBtn);
            actionCell.appendChild(actionWrap);
            row.appendChild(actionCell);

            userTbody.appendChild(row);
        });
    }

    function setUserBalanceStatus(message, type) {
        if (!userBalanceStatusEl) return;
        userBalanceStatusEl.textContent = message || '';
        userBalanceStatusEl.className = type ? `checkout-status ${type}` : 'checkout-status';
    }

    function renderSelectedBalanceUser(user) {
        selectedBalanceUser = user || null;
        if (userBalanceResultPanelEl) userBalanceResultPanelEl.hidden = !selectedBalanceUser;
        if (!selectedBalanceUser) {
            if (userBalanceAccountTextEl) userBalanceAccountTextEl.textContent = '-';
            if (userBalanceCurrentTextEl) userBalanceCurrentTextEl.textContent = 'Saldo saat ini: Rp 0';
            return;
        }
        const name = selectedBalanceUser.username || selectedBalanceUser.email || '-';
        const balanceValue = Number(selectedBalanceUser.balance || 0);
        if (userBalanceAccountTextEl) userBalanceAccountTextEl.textContent = `${name} (${selectedBalanceUser.email || '-'})`;
        if (userBalanceCurrentTextEl) userBalanceCurrentTextEl.textContent = `Saldo saat ini: ${formatRupiah(balanceValue)}`;
        if (userBalanceAmountInputEl) userBalanceAmountInputEl.value = '';
        if (userBalanceNoteInputEl) userBalanceNoteInputEl.value = '';
    }

    async function lookupUserBalanceByEmail() {
        const query = String(userBalanceEmailInputEl?.value || '').trim();
        renderSelectedBalanceUser(null);
        if (!query) {
            setUserBalanceStatus('Masukkan email atau username user.', 'failed');
            userBalanceEmailInputEl?.focus();
            return;
        }

        if (userBalanceSearchBtn) userBalanceSearchBtn.disabled = true;
        setUserBalanceStatus('Mencari akun user...');
        try {
            const response = await fetch(`/api/admin/users/lookup?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Akun user tidak ditemukan');
            }
            renderSelectedBalanceUser(result?.data || null);
            setUserBalanceStatus('Akun ditemukan. Masukkan nominal untuk tambah saldo atau set saldo.', 'success');
            userBalanceAmountInputEl?.focus();
        } catch (error) {
            setUserBalanceStatus(error.message || 'Akun user tidak ditemukan.', 'failed');
        } finally {
            if (userBalanceSearchBtn) userBalanceSearchBtn.disabled = false;
        }
    }

    async function submitUserBalanceCredit() {
        if (!selectedBalanceUser?.id) {
            setUserBalanceStatus('Cari email atau username akun terlebih dahulu.', 'failed');
            userBalanceEmailInputEl?.focus();
            return;
        }
        const amount = Number(userBalanceAmountInputEl?.value || 0);
        const note = String(userBalanceNoteInputEl?.value || '').trim() || 'Penambahan saldo oleh admin';
        if (!Number.isFinite(amount) || amount < 1) {
            setUserBalanceStatus('Nominal saldo wajib lebih dari 0.', 'failed');
            userBalanceAmountInputEl?.focus();
            return;
        }

        if (userBalanceAddBtn) userBalanceAddBtn.disabled = true;
        setUserBalanceStatus('Menambahkan saldo...');
        try {
            const response = await fetch(`/api/admin/users/${encodeURIComponent(selectedBalanceUser.id)}/wallet/credit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.trunc(amount),
                    note,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal menambah saldo');
            }
            selectedBalanceUser = {
                ...selectedBalanceUser,
                balance: Number(result?.data?.wallet?.balance || 0),
            };
            renderSelectedBalanceUser(selectedBalanceUser);
            setUserBalanceStatus(`Saldo berhasil ditambahkan. Saldo baru: ${formatRupiah(selectedBalanceUser.balance)}`, 'success');
            await loadAdminOverview();
            await loadAdminUsers(currentAdminUserPage);
        } catch (error) {
            setUserBalanceStatus(error.message || 'Gagal menambah saldo.', 'failed');
        } finally {
            if (userBalanceAddBtn) userBalanceAddBtn.disabled = false;
        }
    }

    async function submitUserBalanceSet() {
        if (!selectedBalanceUser?.id) {
            setUserBalanceStatus('Cari email atau username akun terlebih dahulu.', 'failed');
            userBalanceEmailInputEl?.focus();
            return;
        }
        const amount = Number(userBalanceAmountInputEl?.value || 0);
        const note = String(userBalanceNoteInputEl?.value || '').trim() || 'Edit saldo oleh admin';
        if (!Number.isFinite(amount) || amount < 0) {
            setUserBalanceStatus('Saldo baru wajib 0 atau lebih.', 'failed');
            userBalanceAmountInputEl?.focus();
            return;
        }

        if (userBalanceSetBtn) userBalanceSetBtn.disabled = true;
        setUserBalanceStatus('Mengubah saldo user...');
        try {
            const response = await fetch(`/api/admin/users/${encodeURIComponent(selectedBalanceUser.id)}/wallet/balance`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    balance: Math.trunc(amount),
                    note,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal mengubah saldo');
            }
            selectedBalanceUser = {
                ...selectedBalanceUser,
                balance: Number(result?.data?.wallet?.balance || 0),
            };
            renderSelectedBalanceUser(selectedBalanceUser);
            setUserBalanceStatus(`Saldo berhasil diubah. Saldo baru: ${formatRupiah(selectedBalanceUser.balance)}`, 'success');
            await loadAdminOverview();
            await loadAdminUsers(currentAdminUserPage);
        } catch (error) {
            setUserBalanceStatus(error.message || 'Gagal mengubah saldo.', 'failed');
        } finally {
            if (userBalanceSetBtn) userBalanceSetBtn.disabled = false;
        }
    }

    function updateAdminUserPagination(shownCount) {
        const totalPages = Math.max(1, Math.ceil(totalAdminUsers / adminUserPageSize));
        if (userShownCountEl) {
            userShownCountEl.textContent = `Menampilkan ${shownCount} dari ${totalAdminUsers} pengguna`;
        }
        if (userPageInfoEl) {
            userPageInfoEl.textContent = `Halaman ${currentAdminUserPage} / ${totalPages}`;
        }
        if (userPrevPageBtn) {
            userPrevPageBtn.disabled = currentAdminUserPage <= 1 || totalAdminUsers <= 0;
        }
        if (userNextPageBtn) {
            userNextPageBtn.disabled = currentAdminUserPage >= totalPages || totalAdminUsers <= 0;
        }
    }

    async function loadAdminUsers(page = currentAdminUserPage) {
        try {
            const safePage = Math.max(1, Number(page) || 1);
            const query = String(userBalanceEmailInputEl?.value || '').trim();
            const queryParam = query ? `&q=${encodeURIComponent(query)}` : '';
            const response = await fetch(`/api/admin/users?page=${safePage}&take=${adminUserPageSize}${queryParam}`);
            if (!response.ok) throw new Error('Gagal mengambil data pengguna');
            const result = await response.json();
            const users = Array.isArray(result?.data) ? result.data : [];
            const meta = result?.meta || {};
            totalAdminUsers = Number(meta.total || users.length || 0);
            currentAdminUserPage = Math.max(1, Number(meta.page || safePage) || 1);
            renderAdminUsers(users);
            updateAdminUserPagination(users.length);
        } catch (_error) {
            totalAdminUsers = 0;
            currentAdminUserPage = 1;
            renderAdminUsers([], { failed: true });
            updateAdminUserPagination(0);
            setUserBalanceStatus('Daftar pengguna gagal dimuat. Cek log server, lalu muat ulang halaman.', 'failed');
        }
    }

    function changeAdminUserPage(delta) {
        const totalPages = Math.max(1, Math.ceil(totalAdminUsers / adminUserPageSize));
        const nextPage = Math.min(Math.max(currentAdminUserPage + delta, 1), totalPages);
        if (nextPage === currentAdminUserPage) return;
        currentAdminUserPage = nextPage;
        void loadAdminUsers(nextPage);
    }

    async function deleteAdminUser(userId) {
        const safeUserId = String(userId || '').trim();
        if (!safeUserId) return;
        const confirmed = await showConfirmDialog({
            title: 'Hapus akun user?',
            message: 'Akun user akan dihapus permanen. Riwayat transaksi pembelian tetap tersimpan tanpa akun user.',
            confirmText: 'Hapus Akun',
            cancelText: 'Batal',
        });
        if (!confirmed) return;

        setUserBalanceStatus('Menghapus akun user...');
        try {
            const response = await fetch(`/api/admin/users/${encodeURIComponent(safeUserId)}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result?.error || 'Gagal menghapus akun');
            }
            if (selectedBalanceUser?.id === safeUserId) {
                renderSelectedBalanceUser(null);
            }
            setUserBalanceStatus(`Akun ${result?.data?.username || result?.data?.email || 'user'} berhasil dihapus.`, 'success');
            await loadAdminOverview();
            await loadAdminUsers(currentAdminUserPage);
        } catch (error) {
            setUserBalanceStatus(error.message || 'Gagal menghapus akun.', 'failed');
        }
    }

    function scheduleAdminUserSearch() {
        if (userSearchTimer) {
            window.clearTimeout(userSearchTimer);
        }
        userSearchTimer = window.setTimeout(function() {
            currentAdminUserPage = 1;
            void loadAdminUsers(1);
        }, 300);
    }

    async function loadAdminPaymentOrders() {
        try {
            const response = await fetch('/api/admin/payment-orders?take=500');
            if (!response.ok) throw new Error('Gagal mengambil histori pembayaran');
            const result = await response.json();
            allAdminPayments = Array.isArray(result?.data) ? result.data : [];
            currentAdminPaymentPage = 1;
            applyPaymentFilters();
        } catch (_error) {
            allAdminPayments = [];
            currentAdminPaymentPage = 1;
            applyPaymentFilters();
        }
    }

    if (syncProductsBtn) {
        syncProductsBtn.addEventListener('click', syncProducts);
    }
    if (saveProductFeeBtn) {
        saveProductFeeBtn.addEventListener('click', savePricingConfig);
    }
    if (saveProductAutoSyncBtn) {
        saveProductAutoSyncBtn.addEventListener('click', savePricingConfig);
    }
    if (refreshDigiflazzBalanceBtn) {
        refreshDigiflazzBalanceBtn.addEventListener('click', loadDigiflazzBalanceSnapshot);
    }
    if (saveOperationsSettingsBtn) {
        saveOperationsSettingsBtn.addEventListener('click', savePricingConfig);
    }
    if (saveDevelopmentSettingsBtn) {
        saveDevelopmentSettingsBtn.addEventListener('click', savePricingConfig);
    }
    if (developmentModeEnabledInputEl) {
        developmentModeEnabledInputEl.addEventListener('change', function() {
            if (developmentSettingsInfoEl) {
                developmentSettingsInfoEl.textContent = developmentModeEnabledInputEl.checked
                    ? 'Mengaktifkan mode development...'
                    : 'Menonaktifkan mode development...';
            }
            void savePricingConfig({ currentTarget: saveDevelopmentSettingsBtn });
        });
    }
    if (savePaymentGatewayBtn) {
        savePaymentGatewayBtn.addEventListener('click', savePricingConfig);
    }
    if (refreshInternalGatewayBtn) {
        refreshInternalGatewayBtn.addEventListener('click', function() {
            void loadInternalGatewayDashboard();
        });
    }
    if (createPartnerAppBtn) {
        createPartnerAppBtn.addEventListener('click', function() {
            void savePartnerApp();
        });
    }
    if (saveBackupSettingsBtn) {
        saveBackupSettingsBtn.addEventListener('click', savePricingConfig);
    }
    if (triggerBackupNowBtn) {
        triggerBackupNowBtn.addEventListener('click', triggerBackupNow);
    }
    if (saveTestimonialSettingsBtn) {
        saveTestimonialSettingsBtn.addEventListener('click', function() { void saveTestimonialSettings(); });
    }
    if (sendTestimonialTestBtn) {
        sendTestimonialTestBtn.addEventListener('click', function() { void sendTestimonialTest(); });
    }
    if (triggerRestoreNowBtn) {
        triggerRestoreNowBtn.addEventListener('click', triggerRestoreNow);
    }
    if (refreshBackupFilesBtn) {
        refreshBackupFilesBtn.addEventListener('click', loadBackupFiles);
    }
    if (refreshBrandLogosBtn) {
        refreshBrandLogosBtn.addEventListener('click', function() {
            void loadBrandLogos();
        });
    }
    if (migrateLogosToR2Btn) {
        migrateLogosToR2Btn.addEventListener('click', function() {
            void migrateLogosToR2();
        });
    }
    if (refreshMonitoringBtn) {
        refreshMonitoringBtn.addEventListener('click', function() {
            void loadMonitoringDashboard();
        });
    }
    if (refreshAdminPushBtn) {
        refreshAdminPushBtn.addEventListener('click', function() {
            void loadAdminPushSummary();
        });
    }
    if (announcementFormEl) {
        announcementFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            void submitAnnouncement();
        });
    }
    if (refreshAnnouncementsBtn) {
        refreshAnnouncementsBtn.addEventListener('click', function() {
            void loadAnnouncements();
        });
    }
    if (bannerFormEl) {
        bannerFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            void submitBanner();
        });
    }
    if (bannerImageInputEl) {
        bannerImageInputEl.addEventListener('change', previewBannerImage);
        bannerImageInputEl.addEventListener('blur', previewBannerImage);
    }
    setupMediaUploads();
    if (refreshBannersBtn) {
        refreshBannersBtn.addEventListener('click', function() {
            void loadBanners();
        });
    }
    if (sendAdminPushTestBtn) {
        sendAdminPushTestBtn.addEventListener('click', function() {
            void sendAdminPushTest();
        });
    }
    if (adminPushBroadcastFormEl) {
        adminPushBroadcastFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            void sendAdminPushBroadcast();
        });
    }
    window.addEventListener('ppob:push-status', function(e) {
        if (e.detail?.registered) void loadAdminPushSummary();
    });
    if (brandLogoSearchEl) {
        brandLogoSearchEl.addEventListener('input', renderBrandLogoCards);
    }
    if (refreshCategoryLogosBtn) {
        refreshCategoryLogosBtn.addEventListener('click', function() {
            void loadCategoryLogos();
        });
    }
    if (categoryLogoSearchEl) {
        categoryLogoSearchEl.addEventListener('input', renderCategoryLogoCards);
    }
    if (backupFileListEl) {
        backupFileListEl.addEventListener('click', function(e) {
            const button = e.target.closest('[data-backup-relative-path]');
            if (!button) return;
            const relativePath = String(button.dataset.backupRelativePath || '').trim();
            if (!relativePath) return;
            const url = `/api/admin/backup/download?file=${encodeURIComponent(relativePath)}`;
            window.open(url, '_blank', 'noopener');
        });
    }
    if (adminCategoryFilterEl) {
        adminCategoryFilterEl.addEventListener('change', function() {
            setAdminCategory(adminCategoryFilterEl.value);
            renderFancyFilterSelect(adminCategoryFilterEl, adminCategoryFilterCustomEl, 'Semua kategori');
        });
    }
    if (adminBrandFilterEl) {
        adminBrandFilterEl.addEventListener('change', function() {
            setAdminBrand(adminBrandFilterEl.value);
            renderFancyFilterSelect(adminBrandFilterEl, adminBrandFilterCustomEl, 'Semua brand');
        });
    }
    if (adminTypeFilterEl) {
        adminTypeFilterEl.addEventListener('change', function() {
            setAdminType(adminTypeFilterEl.value);
            renderFancyFilterSelect(adminTypeFilterEl, adminTypeFilterCustomEl, 'Semua type');
        });
    }
    if (adminSkuSearchEl) {
        adminSkuSearchEl.addEventListener('input', function() {
            currentAdminProductPage = 1;
            applyAdminProductFilters();
        });
    }
    if (adminFailedProductsToggleEl) {
        adminFailedProductsToggleEl.addEventListener('click', function() {
            showFailedProductsOnly = !showFailedProductsOnly;
            currentAdminProductPage = 1;
            applyAdminProductFilters();
        });
    }
    if (productPrevPageBtn) {
        productPrevPageBtn.addEventListener('click', function() {
            changeProductPage(-1);
        });
    }
    if (productNextPageBtn) {
        productNextPageBtn.addEventListener('click', function() {
            changeProductPage(1);
        });
    }
    if (adminCategoryListEl) {
        adminCategoryListEl.addEventListener('click', function(e) {
            const button = e.target.closest('[data-filter-type="category"]');
            if (!button) return;
            setAdminCategory(button.dataset.filterValue || '');
        });
    }
    if (adminBrandListEl) {
        adminBrandListEl.addEventListener('click', function(e) {
            const button = e.target.closest('[data-filter-type="brand"]');
            if (!button) return;
            setAdminBrand(button.dataset.filterValue || '');
        });
    }
    if (adminTypeListEl) {
        adminTypeListEl.addEventListener('click', function(e) {
            const button = e.target.closest('[data-filter-type="type"]');
            if (!button) return;
            setAdminType(button.dataset.filterValue || '');
        });
    }
    if (adminProductListEl) {
        adminProductListEl.addEventListener('click', function(e) {
            const statusButton = e.target.closest('[data-product-status-sku]');
            if (statusButton) {
                void toggleAdminProductStatus(
                    statusButton.dataset.productStatusSku || '',
                    statusButton.dataset.productStatusActive === '1'
                );
                return;
            }
            const visibilityButton = e.target.closest('[data-product-visibility-sku]');
            if (visibilityButton) {
                void setAdminProductHidden(
                    visibilityButton.dataset.productVisibilitySku || '',
                    visibilityButton.dataset.productVisibilityHide === '1'
                );
                return;
            }
            const deleteButton = e.target.closest('[data-product-delete-sku]');
            if (deleteButton) {
                void deleteAdminProduct(deleteButton.dataset.productDeleteSku || '');
                return;
            }
            const reactivateButton = e.target.closest('[data-reactivate-product-sku]');
            if (reactivateButton) {
                void reactivateFailedProduct(reactivateButton.dataset.reactivateProductSku || '');
                return;
            }
            const promoButton = e.target.closest('[data-promo-sku]');
            if (promoButton) {
                const promoSku = String(promoButton.dataset.promoSku || '').trim();
                if (!promoSku) return;
                const product = allAdminProducts.find(function(item) {
                    return String(item?.buyer_sku_code || '') === promoSku;
                });
                if (!product) {
                    if (adminPromoInfoEl) {
                        setAdminPromoInfo('Produk promo tidak ditemukan.', 'failed');
                    }
                    return;
                }
                openPromoEditorForProduct(product);
                return;
            }
            const button = e.target.closest('[data-quick-service-sku]');
            if (!button) return;
            const sku = button.dataset.quickServiceSku || '';
            const currentlyEnabled = button.dataset.quickServiceEnabled === '1';
            toggleQuickServiceProduct(sku, !currentlyEnabled);
        });
    }
    if (saveAdminPromoBtn) {
        saveAdminPromoBtn.addEventListener('click', function() {
            void savePromoForSelectedProduct();
        });
    }
    if (disableAdminPromoBtn) {
        disableAdminPromoBtn.addEventListener('click', function() {
            void disableActivePromo();
        });
    }
    if (cancelAdminPromoBtn) {
        cancelAdminPromoBtn.addEventListener('click', function() {
            closePromoEditor();
        });
    }
    if (txDateFromEl) {
        txDateFromEl.addEventListener('change', function() {
            currentAdminTxPage = 1;
            applyTransactionFilters();
        });
    }
    if (txDateToEl) {
        txDateToEl.addEventListener('change', function() {
            currentAdminTxPage = 1;
            applyTransactionFilters();
        });
    }
    if (txStatusEl) {
        txStatusEl.addEventListener('change', function() {
            currentAdminTxPage = 1;
            applyTransactionFilters();
            renderFancyFilterSelect(txStatusEl, txStatusCustomEl, 'Semua status');
        });
    }
    if (txSearchEl) {
        txSearchEl.addEventListener('input', function() {
            currentAdminTxPage = 1;
            applyTransactionFilters();
        });
    }
    if (txFilterResetEl) {
        txFilterResetEl.addEventListener('click', function() {
            if (txDateFromEl) txDateFromEl.value = '';
            if (txDateToEl) txDateToEl.value = '';
            if (txStatusEl) txStatusEl.value = '';
            if (txSearchEl) txSearchEl.value = '';
            currentAdminTxPage = 1;
            applyTransactionFilters();
            renderFancyFilterSelect(txStatusEl, txStatusCustomEl, 'Semua status');
        });
    }
    if (txPrevPageBtn) {
        txPrevPageBtn.addEventListener('click', function() {
            changeTransactionPage(-1);
        });
    }
    if (txNextPageBtn) {
        txNextPageBtn.addEventListener('click', function() {
            changeTransactionPage(1);
        });
    }
    if (payTypeFilterEl) {
        payTypeFilterEl.addEventListener('change', function() {
            currentAdminPaymentPage = 1;
            applyPaymentFilters();
            renderFancyFilterSelect(payTypeFilterEl, payTypeFilterCustomEl, 'Semua jenis');
        });
    }
    if (payStatusFilterEl) {
        payStatusFilterEl.addEventListener('change', function() {
            currentAdminPaymentPage = 1;
            applyPaymentFilters();
            renderFancyFilterSelect(payStatusFilterEl, payStatusFilterCustomEl, 'Semua status');
        });
    }
    if (paySearchEl) {
        paySearchEl.addEventListener('input', function() {
            currentAdminPaymentPage = 1;
            applyPaymentFilters();
        });
    }
    if (payFilterResetEl) {
        payFilterResetEl.addEventListener('click', function() {
            if (payTypeFilterEl) payTypeFilterEl.value = '';
            if (payStatusFilterEl) payStatusFilterEl.value = '';
            if (paySearchEl) paySearchEl.value = '';
            currentAdminPaymentPage = 1;
            applyPaymentFilters();
            renderAdminStaticFancyFilters();
        });
    }
    if (payPrevPageBtn) {
        payPrevPageBtn.addEventListener('click', function() {
            changePaymentPage(-1);
        });
    }
    if (payNextPageBtn) {
        payNextPageBtn.addEventListener('click', function() {
            changePaymentPage(1);
        });
    }
    if (overviewPeriodTypeEl) {
        overviewPeriodTypeEl.addEventListener('change', function() {
            updateOverviewPeriodInputs();
        });
        updateOverviewPeriodInputs();
    }
    if (overviewApplyPeriodBtn) {
        overviewApplyPeriodBtn.addEventListener('click', function() {
            void loadAdminOverview();
        });
    }
    [
        overviewDateInputEl,
        overviewMonthInputEl,
        overviewYearInputEl,
        overviewDateFromInputEl,
        overviewDateToInputEl,
    ].forEach(function(field) {
        if (!field) return;
        field.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            void loadAdminOverview();
        });
    });
    if (userPrevPageBtn) {
        userPrevPageBtn.addEventListener('click', function() {
            changeAdminUserPage(-1);
        });
    }
    if (userNextPageBtn) {
        userNextPageBtn.addEventListener('click', function() {
            changeAdminUserPage(1);
        });
    }
    if (userBalanceSearchBtn) {
        userBalanceSearchBtn.addEventListener('click', function() {
            void lookupUserBalanceByEmail();
        });
    }
    if (userTbody) {
        userTbody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('[data-user-balance-edit]');
            if (editBtn) {
                const lookup = String(editBtn.dataset.userLookup || editBtn.dataset.userBalanceEdit || '');
                void fetch(`/api/admin/users/lookup?q=${encodeURIComponent(lookup)}`)
                    .then(function(response) {
                        return response.json().then(function(result) {
                            if (!response.ok) throw new Error(result?.error || 'Akun user tidak ditemukan');
                            return result;
                        });
                    })
                    .then(function(result) {
                        renderSelectedBalanceUser(result?.data || null);
                        setUserBalanceStatus('Akun dipilih. Masukkan nominal untuk tambah saldo atau set saldo.', 'success');
                        userBalanceAmountInputEl?.focus();
                    })
                    .catch(function(error) {
                        setUserBalanceStatus(error.message || 'Akun user tidak ditemukan.', 'failed');
                    });
                return;
            }
            const deleteBtn = e.target.closest('[data-user-delete]');
            if (deleteBtn) {
                void deleteAdminUser(deleteBtn.dataset.userDelete);
            }
        });
    }
    if (userBalanceEmailInputEl) {
        userBalanceEmailInputEl.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            void lookupUserBalanceByEmail();
        });
        userBalanceEmailInputEl.addEventListener('input', function() {
            renderSelectedBalanceUser(null);
            setUserBalanceStatus('Cari email atau username user terlebih dahulu sebelum mengubah saldo.');
            scheduleAdminUserSearch();
        });
    }
    if (userBalanceAddBtn) {
        userBalanceAddBtn.addEventListener('click', function() {
            void submitUserBalanceCredit();
        });
    }
    if (userBalanceSetBtn) {
        userBalanceSetBtn.addEventListener('click', function() {
            void submitUserBalanceSet();
        });
    }
    if (userBalanceAmountInputEl) {
        userBalanceAmountInputEl.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            void submitUserBalanceCredit();
        });
    }
    document.addEventListener('click', function(e) {
        if (activeFancyFilterEl && !activeFancyFilterEl.contains(e.target)) {
            closeFancyFilterSelect();
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFancyFilterSelect();
        }
    });
    // ===== Pengelolaan VPN di dashboard admin =====
    const vpnStatsRefreshBtn = document.getElementById('vpnStatsRefreshBtn');
    const vpnStatEls = {
        servers: document.getElementById('vpnStatServers'),
        accounts: document.getElementById('vpnStatAccounts'),
        profiles: document.getElementById('vpnStatProfiles'),
        resellers: document.getElementById('vpnStatResellers'),
        balance: document.getElementById('vpnStatBalance'),
        income: document.getElementById('vpnStatIncome'),
        orders: document.getElementById('vpnStatOrders'),
    };
    const vpnServerListEl = document.getElementById('vpnServerList');
    const vpnServerNewBtn = document.getElementById('vpnServerNewBtn');
    const vpnServerSyncBtn = document.getElementById('vpnServerSyncBtn');
    const vpnServerSyncInfoEl = document.getElementById('vpnServerSyncInfo');
    const vpnServerFormEl = document.getElementById('vpnServerForm');
    const vpnServerFormTitleEl = document.getElementById('vpnServerFormTitle');
    const vpnServerFormStatusEl = document.getElementById('vpnServerFormStatus');
    const vpnServerSaveBtn = document.getElementById('vpnServerSaveBtn');
    const vpnServerCancelBtn = document.getElementById('vpnServerCancelBtn');
    const vpnProfileListEl = document.getElementById('vpnProfileList');
    const vpnProfileSearchInputEl = document.getElementById('vpnProfileSearchInput');
    const vpnProfileRoleFilterEl = document.getElementById('vpnProfileRoleFilter');
    const vpnProfileSearchBtn = document.getElementById('vpnProfileSearchBtn');

    const VPN_SERVER_FIELDS = {
        name: 'vpnServerNameInput',
        domain: 'vpnServerDomainInput',
        auth: 'vpnServerAuthInput',
        quota: 'vpnServerQuotaInput',
        priceUser1Ip: 'vpnServerPriceUser1Input',
        priceUser2Ip: 'vpnServerPriceUser2Input',
        priceReseller1Ip: 'vpnServerPriceReseller1Input',
        priceReseller2Ip: 'vpnServerPriceReseller2Input',
        price: 'vpnServerPriceInput',
        createLimit: 'vpnServerLimitInput',
        createTotal: 'vpnServerTotalInput',
    };
    const VPN_SERVER_TOGGLES = {
        isUdpZivpnOnly: 'vpnServerUdpInput',
        isResellerOnly: 'vpnServerResellerInput',
        isActive: 'vpnServerActiveInput',
    };

    let vpnServers = [];
    let vpnProtocols = [];
    let vpnSyncInfo = null;
    let vpnServerAutoRefreshHandle = null;
    // Kosong berarti sedang menambah server baru, terisi berarti sedang
    // mengubah server itu.
    let vpnEditingServerId = null;

    // Halaman admin tidak punya toast, jadi hasil tindakan pada daftar server
    // ditulis di satu baris keterangan di bawah judulnya.
    function setVpnServerStatus(message, tone = '') {
        const el = document.getElementById('vpnServerListStatus');
        if (!el) return;
        el.textContent = message || '';
        el.dataset.tone = tone;
    }

    function setVpnServerFormStatus(message, tone = '') {
        if (!vpnServerFormStatusEl) return;
        vpnServerFormStatusEl.textContent = message || '';
        vpnServerFormStatusEl.dataset.tone = tone;
    }

    function formatRupiahAdmin(value) {
        return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    }

    async function loadVpnAdminStats() {
        try {
            const response = await fetch('/api/admin/vpn/stats');
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat ringkasan');
            const data = result.data;

            if (vpnStatEls.servers) vpnStatEls.servers.textContent = `${data.servers.active} / ${data.servers.total}`;
            if (vpnStatEls.accounts) vpnStatEls.accounts.textContent = `${data.accounts.active} / ${data.accounts.total}`;
            if (vpnStatEls.profiles) vpnStatEls.profiles.textContent = Number(data.profiles.total).toLocaleString('id-ID');
            if (vpnStatEls.resellers) vpnStatEls.resellers.textContent = Number(data.profiles.reseller).toLocaleString('id-ID');
            if (vpnStatEls.balance) vpnStatEls.balance.textContent = formatRupiahAdmin(data.balance.total);
            if (vpnStatEls.income) vpnStatEls.income.textContent = formatRupiahAdmin(data.orders.paidThisMonth);
            if (vpnStatEls.orders) {
                vpnStatEls.orders.textContent = `${data.orders.countThisMonth} pesanan selesai · ${data.orders.waiting} menunggu · ${data.orders.failed} gagal`;
            }
        } catch (_error) {
            Object.values(vpnStatEls).forEach(function(el) { if (el) el.textContent = '-'; });
        }
    }

    function openVpnServerForm(server) {
        if (!vpnServerFormEl) return;
        vpnEditingServerId = server?.id || null;
        if (vpnServerFormTitleEl) {
            vpnServerFormTitleEl.textContent = server ? `Ubah ${server.name}` : 'Tambah Server';
        }

        Object.entries(VPN_SERVER_FIELDS).forEach(function([key, id]) {
            const el = document.getElementById(id);
            if (!el) return;
            // Token tidak pernah dikirim balik oleh server, jadi kotaknya selalu
            // dikosongkan dan artinya "biarkan yang lama".
            if (key === 'auth') {
                el.value = '';
                el.placeholder = server
                    ? (server.hasAuth ? 'Terisi. Kosongkan kalau tidak diubah.' : 'Belum diisi')
                    : 'Token dari panel VPS';
                return;
            }
            el.value = server ? String(server[key] ?? 0) : (key === 'name' || key === 'domain' ? '' : '0');
        });

        Object.entries(VPN_SERVER_TOGGLES).forEach(function([key, id]) {
            const el = document.getElementById(id);
            if (el) el.checked = server ? Boolean(server[key]) : key === 'isActive';
        });

        setVpnServerFormStatus('');
        vpnServerFormEl.hidden = false;
        vpnServerFormEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function closeVpnServerForm() {
        vpnEditingServerId = null;
        if (vpnServerFormEl) vpnServerFormEl.hidden = true;
        setVpnServerFormStatus('');
    }

    function readVpnServerForm() {
        const payload = {};
        Object.entries(VPN_SERVER_FIELDS).forEach(function([key, id]) {
            const el = document.getElementById(id);
            if (!el) return;
            const value = String(el.value || '').trim();
            // Token yang dikosongkan tidak ikut dikirim, supaya yang tersimpan
            // di server tidak tertimpa nilai kosong.
            if (key === 'auth' && !value) return;
            payload[key] = key === 'name' || key === 'domain' || key === 'auth' ? value : (value || '0');
        });
        Object.entries(VPN_SERVER_TOGGLES).forEach(function([key, id]) {
            const el = document.getElementById(id);
            payload[key] = Boolean(el?.checked);
        });
        return payload;
    }

    async function saveVpnServer() {
        setAdminPushButtonBusy(vpnServerSaveBtn, true, 'Menyimpan...');
        setVpnServerFormStatus('Menyimpan server...');
        try {
            const payload = readVpnServerForm();
            const response = await fetch(
                vpnEditingServerId ? `/api/admin/vpn/servers/${encodeURIComponent(vpnEditingServerId)}` : '/api/admin/vpn/servers',
                {
                    method: vpnEditingServerId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                },
            );
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal menyimpan server');

            closeVpnServerForm();
            await loadVpnServers();
            await loadVpnAdminStats();
        } catch (error) {
            setVpnServerFormStatus(error.message || 'Gagal menyimpan server.', 'failed');
        } finally {
            setAdminPushButtonBusy(vpnServerSaveBtn, false);
        }
    }

    function renderVpnIpLimitRules(server) {
        const bawaan = vpnProtocols.map(function(protocol) {
            const satu = server.ipLimitRules.find(function(r) { return r.protocol === protocol.key && r.ipPackage === 1; });
            const dua = server.ipLimitRules.find(function(r) { return r.protocol === protocol.key && r.ipPackage === 2; });
            const sel = function(rule, pkg, bawaanNilai) {
                const nilai = rule ? rule.ipLimit : bawaanNilai;
                const dariAturan = Boolean(rule);
                return `<td>
                    <input type="number" min="1" max="100" step="1" value="${nilai}"
                        data-vpn-iplimit-server="${escapeHtml(server.id)}"
                        data-vpn-iplimit-protocol="${escapeHtml(protocol.key)}"
                        data-vpn-iplimit-package="${pkg}"
                        class="vpn-iplimit-input${dariAturan ? ' vpn-iplimit-custom' : ''}"
                        title="${dariAturan ? 'Diatur khusus untuk server ini' : 'Nilai bawaan'}">
                    ${dariAturan ? `<button type="button" class="vpn-iplimit-reset" data-vpn-iplimit-delete="${escapeHtml(rule.id)}" title="Kembalikan ke bawaan"><i class="fas fa-rotate-left"></i></button>` : ''}
                </td>`;
            };
            return `<tr>
                <td>${escapeHtml(protocol.label)}</td>
                ${sel(satu, 1, protocol.defaultOneIp)}
                ${sel(dua, 2, protocol.defaultTwoIp)}
            </tr>`;
        }).join('');

        return `<details class="vpn-iplimit-panel">
            <summary>Limit IP per protokol</summary>
            <p class="vpn-admin-hint">Angka yang bertanda biru diatur khusus untuk server ini. Sisanya memakai nilai bawaan.</p>
            <table class="vpn-iplimit-table">
                <thead><tr><th>Protokol</th><th>Paket 1 IP</th><th>Paket 2 IP</th></tr></thead>
                <tbody>${bawaan}</tbody>
            </table>
        </details>`;
    }

    function formatVpnSyncTime(iso) {
        if (!iso) return '';
        const waktu = new Date(iso);
        if (Number.isNaN(waktu.getTime())) return '';
        return waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Keterangan hasil sync terakhir dengan VPS. Kalau balasan VPS tidak
    // dikenali, potongannya ikut ditampilkan supaya bisa dilihat field mana
    // yang seharusnya dibaca (lihat VPN_SERVER_SYNC_COUNT_PATH).
    function renderVpnServerSyncNote(sync) {
        if (!sync) return '';
        if (sync.skipped) {
            return `<p class="vpn-admin-sync-note">Tidak disinkronkan: ${escapeHtml(sync.message || '')}</p>`;
        }
        const jam = formatVpnSyncTime(sync.syncedAt);
        if (sync.ok) {
            const berubah = sync.changed ? ` (sebelumnya ${sync.previous})` : '';
            return `<p class="vpn-admin-sync-note">VPS melaporkan <strong>${sync.count} akun</strong>${escapeHtml(berubah)} · ${escapeHtml(jam)} · field ${escapeHtml(sync.source || '-')}</p>`;
        }
        const terakhirOk = sync.lastOkAt ? ` Terakhir berhasil ${formatVpnSyncTime(sync.lastOkAt)}.` : '';
        const contoh = sync.sample ? `<code>${escapeHtml(sync.sample)}</code>` : '';
        return `<p class="vpn-admin-sync-note" data-tone="failed">Sync ${escapeHtml(jam)} gagal: ${escapeHtml(sync.message || '')}${escapeHtml(terakhirOk)}${contoh}</p>`;
    }

    function renderVpnSyncInfo() {
        if (!vpnServerSyncInfoEl) return;
        if (!vpnSyncInfo) {
            vpnServerSyncInfoEl.textContent = '';
            return;
        }
        const interval = Number(vpnSyncInfo.intervalMs) || 0;
        const otomatis = interval
            ? `Akun terpakai disamakan dengan VPS otomatis setiap ${Math.round(interval / 1000)} detik.`
            : 'Auto-sync dengan VPS dimatikan, pakai tombol Sync Sekarang.';
        const terakhir = vpnSyncInfo.lastRun
            ? ` Terakhir ${formatVpnSyncTime(vpnSyncInfo.lastRun.finishedAt)}: ${vpnSyncInfo.lastRun.ok} dari ${vpnSyncInfo.lastRun.total} server terbaca.`
            : '';
        vpnServerSyncInfoEl.textContent = otomatis + terakhir;
    }

    function renderVpnServers() {
        if (!vpnServerListEl) return;
        if (!vpnServers.length) {
            vpnServerListEl.innerHTML = '<p class="vpn-admin-empty">Belum ada server. Tambahkan satu, atau pindahkan dari database webpanel lama lewat panel restore di bawah.</p>';
            return;
        }

        vpnServerListEl.innerHTML = vpnServers.map(function(server) {
            const tanda = [];
            if (!server.isActive) tanda.push('<span class="vpn-admin-tag vpn-admin-tag-off">Nonaktif</span>');
            if (server.isFull) tanda.push('<span class="vpn-admin-tag vpn-admin-tag-warn">Penuh</span>');
            if (server.isUdpZivpnOnly) tanda.push('<span class="vpn-admin-tag">UDP ZiVPN</span>');
            if (server.isResellerOnly) tanda.push('<span class="vpn-admin-tag">Reseller</span>');
            if (!server.hasAuth) tanda.push('<span class="vpn-admin-tag vpn-admin-tag-warn">Token kosong</span>');
            if (server.sync && !server.sync.skipped) {
                tanda.push(server.sync.ok
                    ? '<span class="vpn-admin-tag vpn-admin-tag-ok">Sync VPS</span>'
                    : '<span class="vpn-admin-tag vpn-admin-tag-warn">Sync gagal</span>');
            }

            const kapasitas = server.createLimit > 0
                ? `${server.createTotal} / ${server.createLimit} akun`
                : `${server.createTotal} akun (tanpa batas)`;

            return `<article class="vpn-admin-card" data-vpn-server="${escapeHtml(server.id)}">
                <div class="vpn-admin-card-head">
                    <div>
                        <strong>${escapeHtml(server.name)}</strong>
                        <span class="vpn-admin-sub">${escapeHtml(server.domain)}</span>
                    </div>
                    <div class="vpn-admin-tags">${tanda.join('')}</div>
                </div>
                <div class="vpn-admin-facts">
                    <span>User 1 IP <strong>${escapeHtml(formatRupiahAdmin(server.priceUser1Ip))}</strong>/hari</span>
                    <span>User 2 IP <strong>${escapeHtml(formatRupiahAdmin(server.priceUser2Ip))}</strong>/hari</span>
                    <span>Reseller 1 IP <strong>${escapeHtml(formatRupiahAdmin(server.priceReseller1Ip))}</strong>/hari</span>
                    <span>Reseller 2 IP <strong>${escapeHtml(formatRupiahAdmin(server.priceReseller2Ip))}</strong>/hari</span>
                    <span>Kapasitas <strong>${escapeHtml(kapasitas)}</strong></span>
                    <span>Akun tercatat <strong>${server.activeAccountCount} aktif</strong> dari ${server.accountCount}</span>
                </div>
                ${renderVpnServerSyncNote(server.sync)}
                ${renderVpnIpLimitRules(server)}
                <div class="vpn-admin-actions">
                    <button class="btn-secondary" type="button" data-vpn-server-edit="${escapeHtml(server.id)}">
                        <i class="fas fa-pen"></i> Ubah
                    </button>
                    <button class="btn-secondary" type="button" data-vpn-server-active="${escapeHtml(server.id)}" data-active="${server.isActive ? '1' : '0'}">
                        <i class="fas fa-power-off"></i> ${server.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button class="btn-secondary" type="button" data-vpn-server-full="${escapeHtml(server.id)}">
                        <i class="fas fa-box-archive"></i> Tandai Penuh
                    </button>
                    <button class="btn-secondary vpn-admin-danger" type="button" data-vpn-server-delete="${escapeHtml(server.id)}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </article>`;
        }).join('');
    }

    async function loadVpnServers() {
        if (!vpnServerListEl) return;
        try {
            const response = await fetch('/api/admin/vpn/servers');
            const result = await response.json();
            if (!response.ok) throw new Error(result?.error || 'Gagal memuat server');
            vpnServers = Array.isArray(result.data?.servers) ? result.data.servers : [];
            vpnProtocols = Array.isArray(result.data?.protocols) ? result.data.protocols : [];
            vpnSyncInfo = result.data?.sync || null;
            renderVpnServers();
            renderVpnSyncInfo();
            scheduleVpnServerAutoRefresh();
        } catch (error) {
            vpnServerListEl.innerHTML = `<p class="vpn-admin-empty">${escapeHtml(error.message || 'Gagal memuat server.')}</p>`;
        }
    }

    // Daftar server dimuat ulang mengikuti jadwal auto-sync, supaya angka di
    // halaman admin ikut berubah tanpa ditekan refresh. Dilewati kalau tab
    // tidak terlihat, form server sedang terbuka, atau bagian VPN tidak tampil.
    function scheduleVpnServerAutoRefresh() {
        if (vpnServerAutoRefreshHandle) clearTimeout(vpnServerAutoRefreshHandle);
        const interval = Number(vpnSyncInfo?.intervalMs) || 0;
        if (!interval) return;
        vpnServerAutoRefreshHandle = setTimeout(function() {
            vpnServerAutoRefreshHandle = null;
            const terlihat = document.visibilityState !== 'hidden'
                && vpnServerListEl
                && vpnServerListEl.offsetParent !== null
                && (!vpnServerFormEl || vpnServerFormEl.hidden);
            if (terlihat) {
                void loadVpnServers();
            } else {
                scheduleVpnServerAutoRefresh();
            }
        }, interval + 2000);
    }

    async function syncVpnServersNow() {
        if (!vpnServerSyncBtn) return;
        vpnServerSyncBtn.disabled = true;
        setVpnServerStatus('Menanyakan jumlah akun ke setiap VPS...');
        try {
            const result = await callVpnAdmin('/api/admin/vpn/servers/sync');
            setVpnServerStatus(result.message || 'Sync selesai.', result.data?.failed ? 'failed' : 'success');
            await loadVpnServers();
            await loadVpnAdminStats();
        } catch (error) {
            setVpnServerStatus(error.message || 'Sync gagal.', 'failed');
        } finally {
            vpnServerSyncBtn.disabled = false;
        }
    }

    async function callVpnAdmin(pathName, { method = 'POST', body } = {}) {
        const response = await fetch(pathName, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || 'Permintaan gagal');
        return result;
    }

    function renderVpnProfiles(profiles) {
        if (!vpnProfileListEl) return;
        if (!profiles.length) {
            vpnProfileListEl.innerHTML = '<p class="vpn-admin-empty">Tidak ada pengguna yang cocok.</p>';
            return;
        }

        vpnProfileListEl.innerHTML = profiles.map(function(profile) {
            const tanda = [`<span class="vpn-admin-tag">${escapeHtml(profile.role)}</span>`];
            if (!profile.isActive) tanda.push('<span class="vpn-admin-tag vpn-admin-tag-off">Ditutup</span>');

            return `<article class="vpn-admin-card" data-vpn-profile="${escapeHtml(profile.id)}">
                <div class="vpn-admin-card-head">
                    <div>
                        <strong>${escapeHtml(profile.email || profile.vpnUsername)}</strong>
                        <span class="vpn-admin-sub">VPN: ${escapeHtml(profile.vpnUsername)} · PPOB: ${escapeHtml(profile.ppobUsername || '-')}</span>
                    </div>
                    <div class="vpn-admin-tags">${tanda.join('')}</div>
                </div>
                <div class="vpn-admin-facts">
                    <span>Saldo VPN <strong>${escapeHtml(formatRupiahAdmin(profile.balance))}</strong></span>
                    <span>Akun VPN <strong>${profile.accountCount}</strong></span>
                </div>
                <div class="vpn-admin-balance-row">
                    <input type="number" step="1000" placeholder="Nominal, minus untuk mengurangi" data-vpn-balance-amount>
                    <input type="text" placeholder="Catatan (opsional)" data-vpn-balance-note>
                    <button class="btn-primary" type="button" data-vpn-balance-apply="${escapeHtml(profile.id)}">
                        <i class="fas fa-coins"></i> Ubah Saldo
                    </button>
                </div>
                <div class="vpn-admin-actions">
                    <select data-vpn-role-select="${escapeHtml(profile.id)}">
                        <option value="USER"${profile.role === 'USER' ? ' selected' : ''}>User</option>
                        <option value="RESELLER"${profile.role === 'RESELLER' ? ' selected' : ''}>Reseller</option>
                        <option value="ADMIN"${profile.role === 'ADMIN' ? ' selected' : ''}>Admin</option>
                    </select>
                    <button class="btn-secondary" type="button" data-vpn-profile-active="${escapeHtml(profile.id)}" data-active="${profile.isActive ? '1' : '0'}">
                        <i class="fas fa-user-lock"></i> ${profile.isActive ? 'Tutup Menu VPN' : 'Buka Menu VPN'}
                    </button>
                    <button class="btn-secondary" type="button" data-vpn-ledger="${escapeHtml(profile.id)}">
                        <i class="fas fa-receipt"></i> Riwayat Saldo
                    </button>
                </div>
                <div class="vpn-admin-ledger" data-vpn-ledger-body hidden></div>
                <p class="vpn-admin-status" data-vpn-profile-status></p>
            </article>`;
        }).join('');
    }

    async function loadVpnProfiles() {
        if (!vpnProfileListEl) return;
        vpnProfileListEl.innerHTML = '<p class="vpn-admin-empty">Mencari...</p>';
        try {
            const params = new URLSearchParams();
            const q = String(vpnProfileSearchInputEl?.value || '').trim();
            if (q) params.set('q', q);
            if (vpnProfileRoleFilterEl?.value) params.set('role', vpnProfileRoleFilterEl.value);
            const result = await callVpnAdmin(`/api/admin/vpn/profiles?${params.toString()}`, { method: 'GET' });
            renderVpnProfiles(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            vpnProfileListEl.innerHTML = `<p class="vpn-admin-empty">${escapeHtml(error.message || 'Gagal mencari pengguna.')}</p>`;
        }
    }

    function setVpnProfileStatus(kartu, message, tone = '') {
        const el = kartu?.querySelector('[data-vpn-profile-status]');
        if (!el) return;
        el.textContent = message || '';
        el.dataset.tone = tone;
    }

    if (vpnStatsRefreshBtn) {
        vpnStatsRefreshBtn.addEventListener('click', function() {
            void loadVpnAdminStats();
            void loadVpnServers();
        });
    }
    if (vpnServerNewBtn) vpnServerNewBtn.addEventListener('click', function() { openVpnServerForm(null); });
    if (vpnServerSyncBtn) vpnServerSyncBtn.addEventListener('click', function() { void syncVpnServersNow(); });
    if (vpnServerCancelBtn) vpnServerCancelBtn.addEventListener('click', closeVpnServerForm);
    if (vpnServerSaveBtn) vpnServerSaveBtn.addEventListener('click', function() { void saveVpnServer(); });
    if (vpnProfileSearchBtn) vpnProfileSearchBtn.addEventListener('click', function() { void loadVpnProfiles(); });
    if (vpnProfileSearchInputEl) {
        vpnProfileSearchInputEl.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') void loadVpnProfiles();
        });
    }

    if (vpnServerListEl) {
        vpnServerListEl.addEventListener('click', async function(event) {
            const edit = event.target.closest('[data-vpn-server-edit]');
            if (edit) {
                const server = vpnServers.find(function(s) { return s.id === edit.dataset.vpnServerEdit; });
                if (server) openVpnServerForm(server);
                return;
            }

            const aktif = event.target.closest('[data-vpn-server-active]');
            if (aktif) {
                try {
                    await callVpnAdmin(`/api/admin/vpn/servers/${encodeURIComponent(aktif.dataset.vpnServerActive)}/active`, {
                        body: { isActive: aktif.dataset.active !== '1' },
                    });
                    await loadVpnServers();
                    await loadVpnAdminStats();
                } catch (error) {
                    setVpnServerStatus(error.message, 'failed');
                }
                return;
            }

            const penuh = event.target.closest('[data-vpn-server-full]');
            if (penuh) {
                try {
                    await callVpnAdmin(`/api/admin/vpn/servers/${encodeURIComponent(penuh.dataset.vpnServerFull)}/capacity`, {
                        body: { full: true },
                    });
                    setVpnServerStatus('Batas jumlah akun diturunkan ke jumlah terpakai sekarang. Slot terbuka lagi kalau ada akun di VPS yang habis. Untuk menutup total, nonaktifkan servernya.', 'success');
                    await loadVpnServers();
                } catch (error) {
                    setVpnServerStatus(error.message, 'failed');
                }
                return;
            }

            const hapus = event.target.closest('[data-vpn-server-delete]');
            if (hapus) {
                const server = vpnServers.find(function(s) { return s.id === hapus.dataset.vpnServerDelete; });
                const confirmed = await showConfirmDialog({
                    title: 'Hapus Server',
                    message: `Hapus ${server?.name || 'server ini'}? ${server?.accountCount || 0} akun yang pernah dibuat di sana tetap tersimpan, tapi tidak bisa diperpanjang lagi.`,
                    confirmText: 'Iya, Hapus',
                    cancelText: 'Batal',
                });
                // Tanpa kotak password, showConfirmDialog menjawab dengan true
                // atau false. Dengan kotak password, jawabannya berupa objek.
                // Keduanya diterima supaya tombolnya tidak diam-diam tidak
                // melakukan apa-apa.
                if (confirmed !== true && confirmed?.confirmed !== true) return;
                try {
                    const result = await callVpnAdmin(`/api/admin/vpn/servers/${encodeURIComponent(hapus.dataset.vpnServerDelete)}`, {
                        method: 'DELETE',
                    });
                    setVpnServerStatus(result.message, 'success');
                    await loadVpnServers();
                    await loadVpnAdminStats();
                } catch (error) {
                    setVpnServerStatus(error.message, 'failed');
                }
                return;
            }

            const reset = event.target.closest('[data-vpn-iplimit-delete]');
            if (reset) {
                try {
                    await callVpnAdmin(`/api/admin/vpn/iplimit/${encodeURIComponent(reset.dataset.vpnIplimitDelete)}`, {
                        method: 'DELETE',
                    });
                    await loadVpnServers();
                } catch (error) {
                    setVpnServerStatus(error.message, 'failed');
                }
            }
        });

        // Limit IP disimpan saat kotaknya ditinggalkan, supaya tidak perlu
        // tombol simpan untuk tiap baris.
        vpnServerListEl.addEventListener('change', async function(event) {
            const input = event.target.closest('[data-vpn-iplimit-server]');
            if (!input) return;
            try {
                await callVpnAdmin(`/api/admin/vpn/servers/${encodeURIComponent(input.dataset.vpnIplimitServer)}/iplimit`, {
                    body: {
                        protocol: input.dataset.vpnIplimitProtocol,
                        ipPackage: input.dataset.vpnIplimitPackage,
                        ipLimit: input.value,
                    },
                });
                await loadVpnServers();
            } catch (error) {
                setVpnServerStatus(error.message, 'failed');
                await loadVpnServers();
            }
        });
    }

    if (vpnProfileListEl) {
        vpnProfileListEl.addEventListener('click', async function(event) {
            const kartu = event.target.closest('[data-vpn-profile]');

            const saldo = event.target.closest('[data-vpn-balance-apply]');
            if (saldo) {
                const nominal = kartu?.querySelector('[data-vpn-balance-amount]')?.value;
                const catatan = kartu?.querySelector('[data-vpn-balance-note]')?.value;
                setVpnProfileStatus(kartu, 'Menyimpan perubahan saldo...');
                try {
                    const result = await callVpnAdmin(`/api/admin/vpn/profiles/${encodeURIComponent(saldo.dataset.vpnBalanceApply)}/balance`, {
                        body: { amount: nominal, note: catatan },
                    });
                    setVpnProfileStatus(kartu, `Saldo sekarang ${formatRupiahAdmin(result.data.balance)}.`, 'success');
                    await loadVpnAdminStats();
                } catch (error) {
                    setVpnProfileStatus(kartu, error.message || 'Gagal mengubah saldo.', 'failed');
                }
                return;
            }

            const tutup = event.target.closest('[data-vpn-profile-active]');
            if (tutup) {
                try {
                    const result = await callVpnAdmin(`/api/admin/vpn/profiles/${encodeURIComponent(tutup.dataset.vpnProfileActive)}/active`, {
                        body: { isActive: tutup.dataset.active !== '1' },
                    });
                    setVpnProfileStatus(kartu, result.message, 'success');
                    await loadVpnProfiles();
                } catch (error) {
                    setVpnProfileStatus(kartu, error.message || 'Gagal mengubah status.', 'failed');
                }
                return;
            }

            const ledger = event.target.closest('[data-vpn-ledger]');
            if (ledger) {
                const body = kartu?.querySelector('[data-vpn-ledger-body]');
                if (!body) return;
                if (!body.hidden) {
                    body.hidden = true;
                    return;
                }
                body.hidden = false;
                body.innerHTML = '<p class="vpn-admin-empty">Memuat...</p>';
                try {
                    const result = await callVpnAdmin(`/api/admin/vpn/profiles/${encodeURIComponent(ledger.dataset.vpnLedger)}/ledger`, {
                        method: 'GET',
                    });
                    const rows = Array.isArray(result.data) ? result.data : [];
                    body.innerHTML = rows.length
                        ? rows.map(function(row) {
                            const tanda = row.amount >= 0 ? '+' : '−';
                            return `<div class="vpn-admin-ledger-row">
                                <span>${escapeHtml(formatDate(row.createdAt))}</span>
                                <span class="vpn-admin-ledger-type">${escapeHtml(row.type)}</span>
                                <span class="vpn-admin-ledger-amount${row.amount >= 0 ? '' : ' vpn-admin-ledger-minus'}">${tanda} ${escapeHtml(formatRupiahAdmin(Math.abs(row.amount)))}</span>
                                <span class="vpn-admin-ledger-note">${escapeHtml(row.note || '')}</span>
                            </div>`;
                        }).join('')
                        : '<p class="vpn-admin-empty">Belum ada catatan saldo.</p>';
                } catch (error) {
                    body.innerHTML = `<p class="vpn-admin-empty">${escapeHtml(error.message || 'Gagal memuat riwayat.')}</p>`;
                }
            }
        });

        vpnProfileListEl.addEventListener('change', async function(event) {
            const pilih = event.target.closest('[data-vpn-role-select]');
            if (!pilih) return;
            const kartu = pilih.closest('[data-vpn-profile]');
            try {
                const result = await callVpnAdmin(`/api/admin/vpn/profiles/${encodeURIComponent(pilih.dataset.vpnRoleSelect)}/role`, {
                    body: { role: pilih.value },
                });
                setVpnProfileStatus(kartu, result.message, 'success');
                await loadVpnAdminStats();
            } catch (error) {
                setVpnProfileStatus(kartu, error.message || 'Gagal mengubah peran.', 'failed');
                await loadVpnProfiles();
            }
        });
    }

    // ===== Gateway pembayaran VPN: GoPay dan ShopeePay =====
    //
    // Keduanya diatur sendiri-sendiri. Yang dipilih sebagai "dipakai lebih
    // dulu" dicoba pertama, sisanya jadi cadangan kalau yang utama gagal.
    const vpnGatewayPrimarySelectEl = document.getElementById('vpnGatewayPrimarySelect');
    const vpnGatewayChannelListEl = document.getElementById('vpnGatewayChannelList');
    const vpnGatewaySaveBtn = document.getElementById('vpnGatewaySaveBtn');
    const vpnGatewayStatusEl = document.getElementById('vpnGatewayStatus');

    const VPN_SOURCE_LABELS = {
        dashboard: 'diatur di sini',
        env: 'dari file .env',
        bawaan: 'alamat bawaan AutoGoPay',
        kosong: 'belum ada',
    };

    function setVpnGatewayStatus(message, tone = '') {
        if (!vpnGatewayStatusEl) return;
        vpnGatewayStatusEl.textContent = message || '';
        vpnGatewayStatusEl.dataset.tone = tone;
    }

    function renderVpnGatewayChannels(data) {
        if (!vpnGatewayChannelListEl) return;
        const channels = Array.isArray(data.channels) ? data.channels : [];

        vpnGatewayChannelListEl.innerHTML = channels.map(function(channel) {
            const tanda = channel.ready
                ? '<span class="vpn-admin-tag">Siap</span>'
                : (channel.enabled
                    ? '<span class="vpn-admin-tag vpn-admin-tag-warn">Nyala, API key kosong</span>'
                    : '<span class="vpn-admin-tag vpn-admin-tag-off">Mati</span>');
            const utama = channel.key === data.primary
                ? '<span class="vpn-admin-tag">Dipakai duluan</span>'
                : '';

            return `<article class="vpn-admin-card" data-vpn-channel="${escapeHtml(channel.key)}">
                <div class="vpn-admin-card-head">
                    <div>
                        <strong>${escapeHtml(channel.label)}</strong>
                        <span class="vpn-admin-sub">API key: ${escapeHtml(channel.hasApiKey ? `${channel.apiKeyMasked} (${VPN_SOURCE_LABELS[channel.keySource] || channel.keySource})` : 'belum diisi')}</span>
                    </div>
                    <div class="vpn-admin-tags">${utama}${tanda}</div>
                </div>
                <div class="vpn-admin-grid">
                    <div class="form-group">
                        <label>Alamat gateway</label>
                        <input type="text" data-vpn-channel-url placeholder="https://v1-gateway.autogopay.site" value="${escapeHtml(channel.baseUrl || '')}">
                        <small class="vpn-admin-hint">Sumber: ${escapeHtml(VPN_SOURCE_LABELS[channel.urlSource] || channel.urlSource)}.</small>
                    </div>
                    <div class="form-group">
                        <label>API key</label>
                        <input type="text" data-vpn-channel-key placeholder="Kosongkan kalau tidak diubah" autocomplete="off">
                        <small class="vpn-admin-hint">Isi tanda hubung (-) untuk mengosongkan.</small>
                    </div>
                </div>
                <div class="vpn-admin-toggles">
                    <label class="setting-toggle-label">
                        <input type="checkbox" data-vpn-channel-enabled${channel.enabled ? ' checked' : ''}>
                        <span>Nyalakan ${escapeHtml(channel.label)}</span>
                    </label>
                </div>
            </article>`;
        }).join('');

        if (vpnGatewayPrimarySelectEl) vpnGatewayPrimarySelectEl.value = data.primary || 'gopay';

        const siap = channels.filter(function(c) { return c.ready; });
        if (!siap.length) {
            setVpnGatewayStatus('Belum ada saluran yang siap. Nyalakan salah satu dan isi API key-nya.', 'failed');
        } else if (siap.length === 1) {
            setVpnGatewayStatus(`Hanya ${siap[0].label} yang siap. Tanpa saluran kedua, tidak ada cadangan kalau gateway sedang bermasalah.`, '');
        } else {
            setVpnGatewayStatus(`${siap.length} saluran siap. ${data.primary === 'gopay' ? 'GoPay' : 'ShopeePay'} dipakai duluan, sisanya jadi cadangan.`, 'success');
        }
    }

    async function loadVpnGatewaySettings() {
        try {
            const result = await callVpnAdmin('/api/admin/vpn/payment/settings', { method: 'GET' });
            renderVpnGatewayChannels(result.data || {});
        } catch (error) {
            setVpnGatewayStatus(error.message || 'Gagal memuat pengaturan gateway.', 'failed');
        }
    }

    function readVpnGatewayForm() {
        const kartu = Array.from(vpnGatewayChannelListEl?.querySelectorAll('[data-vpn-channel]') || []);
        return {
            primary: vpnGatewayPrimarySelectEl?.value || 'gopay',
            channels: kartu.map(function(el) {
                return {
                    key: el.dataset.vpnChannel,
                    baseUrl: el.querySelector('[data-vpn-channel-url]')?.value || '',
                    // Kosong berarti biarkan yang lama; nilainya tidak pernah
                    // dikirim balik oleh server jadi kotaknya selalu kosong.
                    apiKey: el.querySelector('[data-vpn-channel-key]')?.value || '',
                    enabled: Boolean(el.querySelector('[data-vpn-channel-enabled]')?.checked),
                };
            }),
        };
    }

    async function saveVpnGatewaySettings() {
        setAdminPushButtonBusy(vpnGatewaySaveBtn, true, 'Menyimpan...');
        setVpnGatewayStatus('Menyimpan pengaturan gateway...');
        try {
            const result = await callVpnAdmin('/api/admin/vpn/payment/settings', { body: readVpnGatewayForm() });
            renderVpnGatewayChannels(result.data || {});
            if (result.data?.warning) setVpnGatewayStatus(result.data.warning, 'failed');
        } catch (error) {
            setVpnGatewayStatus(error.message || 'Gagal menyimpan pengaturan gateway.', 'failed');
        } finally {
            setAdminPushButtonBusy(vpnGatewaySaveBtn, false);
        }
    }

    if (vpnGatewaySaveBtn) vpnGatewaySaveBtn.addEventListener('click', function() { void saveVpnGatewaySettings(); });

    // ===== Pembuat file config: pengaturan dan template =====
    const vpnConfigBaseUrlInputEl = document.getElementById('vpnConfigBaseUrlInput');
    const vpnConfigApiKeyInputEl = document.getElementById('vpnConfigApiKeyInput');
    const vpnConfigApiKeyMaskedEl = document.getElementById('vpnConfigApiKeyMasked');
    const vpnConfigEnabledInputEl = document.getElementById('vpnConfigEnabledInput');
    const vpnConfigOneFtunnelInputEl = document.getElementById('vpnConfigOneFtunnelInput');
    const vpnConfigSaveBtn = document.getElementById('vpnConfigSaveBtn');
    const vpnConfigTestBtn = document.getElementById('vpnConfigTestBtn');
    const vpnConfigSettingsStatusEl = document.getElementById('vpnConfigSettingsStatus');
    const vpnConfigTemplateInputEl = document.getElementById('vpnConfigTemplateInput');
    const vpnConfigTemplateSelectedTextEl = document.getElementById('vpnConfigTemplateSelectedText');
    const vpnConfigUploadBtn = document.getElementById('vpnConfigUploadBtn');
    const vpnConfigUploadStatusEl = document.getElementById('vpnConfigUploadStatus');
    const vpnConfigTemplateListEl = document.getElementById('vpnConfigTemplateList');
    const vpnConfigBulkBarEl = document.getElementById('vpnConfigBulkBar');
    const vpnConfigSelectAllEl = document.getElementById('vpnConfigSelectAll');
    const vpnConfigSelectedCountEl = document.getElementById('vpnConfigSelectedCount');
    const vpnConfigDeleteSelectedBtn = document.getElementById('vpnConfigDeleteSelectedBtn');
    const vpnConfigDeleteAllBtn = document.getElementById('vpnConfigDeleteAllBtn');

    function setVpnConfigSettingsStatus(message, tone = '') {
        if (!vpnConfigSettingsStatusEl) return;
        vpnConfigSettingsStatusEl.textContent = message || '';
        vpnConfigSettingsStatusEl.dataset.tone = tone;
    }

    function setVpnConfigUploadStatus(message, tone = '') {
        if (!vpnConfigUploadStatusEl) return;
        vpnConfigUploadStatusEl.textContent = message || '';
        vpnConfigUploadStatusEl.dataset.tone = tone;
    }

    function formatVpnTemplateSize(bytes) {
        const angka = Number(bytes) || 0;
        if (angka < 1024) return `${angka} B`;
        if (angka < 1024 * 1024) return `${(angka / 1024).toFixed(1)} KB`;
        return `${(angka / (1024 * 1024)).toFixed(2)} MB`;
    }

    async function loadVpnConfigSettings() {
        try {
            const result = await callVpnAdmin('/api/admin/vpn/config/settings', { method: 'GET' });
            const data = result.data || {};
            if (vpnConfigBaseUrlInputEl) vpnConfigBaseUrlInputEl.value = data.baseUrl || '';
            if (vpnConfigEnabledInputEl) vpnConfigEnabledInputEl.checked = Boolean(data.enabled);
            if (vpnConfigOneFtunnelInputEl) vpnConfigOneFtunnelInputEl.checked = Boolean(data.oneFtunnelEnabled);
            // Kotak API key selalu kosong: nilainya tidak pernah dikirim balik,
            // dan kosong berarti "biarkan yang lama".
            if (vpnConfigApiKeyInputEl) vpnConfigApiKeyInputEl.value = '';
            if (vpnConfigApiKeyMaskedEl) {
                vpnConfigApiKeyMaskedEl.textContent = data.hasApiKey ? data.apiKeyMasked : 'belum diisi';
            }
            setVpnConfigSettingsStatus(
                data.ready ? 'Pembuat config siap dipakai user.' : 'Belum siap. Isi alamat dan API key, lalu nyalakan.',
                data.ready ? 'success' : '',
            );
        } catch (error) {
            setVpnConfigSettingsStatus(error.message || 'Gagal memuat pengaturan.', 'failed');
        }
    }

    async function saveVpnConfigSettings() {
        setAdminPushButtonBusy(vpnConfigSaveBtn, true, 'Menyimpan...');
        setVpnConfigSettingsStatus('Menyimpan pengaturan...');
        try {
            const result = await callVpnAdmin('/api/admin/vpn/config/settings', {
                body: {
                    enabled: Boolean(vpnConfigEnabledInputEl?.checked),
                    oneFtunnelEnabled: Boolean(vpnConfigOneFtunnelInputEl?.checked),
                    baseUrl: vpnConfigBaseUrlInputEl?.value || '',
                    apiKey: vpnConfigApiKeyInputEl?.value || '',
                },
            });
            await loadVpnConfigSettings();
            if (result.data?.warning) setVpnConfigSettingsStatus(result.data.warning, 'failed');
        } catch (error) {
            setVpnConfigSettingsStatus(error.message || 'Gagal menyimpan pengaturan.', 'failed');
        } finally {
            setAdminPushButtonBusy(vpnConfigSaveBtn, false);
        }
    }

    async function testVpnConfigConnection() {
        setAdminPushButtonBusy(vpnConfigTestBtn, true, 'Menguji...');
        setVpnConfigSettingsStatus('Menghubungi Generator API...');
        try {
            const result = await callVpnAdmin('/api/admin/vpn/config/test', { body: {} });
            setVpnConfigSettingsStatus(result.message, result.data?.ok ? 'success' : 'failed');
        } catch (error) {
            setVpnConfigSettingsStatus(error.message || 'Uji koneksi gagal.', 'failed');
        } finally {
            setAdminPushButtonBusy(vpnConfigTestBtn, false);
        }
    }

    // Format tetap dikelompokkan dengan urutan ini (bukan abjad), supaya HTTP
    // Custom dan HTTP Injector yang paling sering dipakai muncul lebih dulu.
    const VPN_CONFIG_FORMAT_ORDER = ['hc', 'hi', 'dark'];
    const VPN_CONFIG_TEMPLATE_PAGE_SIZE = 6;

    // Daftar lengkap dari server, disimpan supaya pindah halaman tidak perlu
    // meminta ulang. Halaman yang sedang dibuka disimpan per format, supaya
    // pindah halaman di satu kelompok tidak mereset kelompok lainnya.
    let vpnConfigTemplatesAll = [];
    const vpnConfigTemplatePages = {};
    // Id template yang dicentang untuk dihapus massal. Disimpan terpisah dari
    // kartu supaya pilihan tetap ada saat pindah halaman.
    const vpnConfigSelectedIds = new Set();

    function updateVpnConfigBulkBar() {
        if (!vpnConfigBulkBarEl) return;
        // Id yang sudah tidak ada di daftar (dihapus dari tab lain) dibuang,
        // supaya hitungan dan permintaan hapus tidak memuat id yang basi.
        const idTersedia = new Set(vpnConfigTemplatesAll.map(function(template) { return template.id; }));
        Array.from(vpnConfigSelectedIds).forEach(function(id) {
            if (!idTersedia.has(id)) vpnConfigSelectedIds.delete(id);
        });

        const total = vpnConfigTemplatesAll.length;
        const dipilih = vpnConfigSelectedIds.size;
        vpnConfigBulkBarEl.hidden = total === 0;
        if (vpnConfigSelectedCountEl) vpnConfigSelectedCountEl.textContent = `${dipilih} dari ${total} dipilih`;
        if (vpnConfigDeleteSelectedBtn) vpnConfigDeleteSelectedBtn.disabled = dipilih === 0;
        if (vpnConfigSelectAllEl) {
            vpnConfigSelectAllEl.checked = total > 0 && dipilih === total;
            vpnConfigSelectAllEl.indeterminate = dipilih > 0 && dipilih < total;
        }

        if (!vpnConfigTemplateListEl) return;
        vpnConfigTemplateListEl.querySelectorAll('[data-vpn-template-group-select]').forEach(function(input) {
            const format = input.dataset.vpnTemplateGroupSelect;
            const idKelompok = vpnConfigTemplatesAll
                .filter(function(template) { return (template.format || 'lainnya') === format; })
                .map(function(template) { return template.id; });
            const dipilihKelompok = idKelompok.filter(function(id) { return vpnConfigSelectedIds.has(id); }).length;
            input.checked = idKelompok.length > 0 && dipilihKelompok === idKelompok.length;
            input.indeterminate = dipilihKelompok > 0 && dipilihKelompok < idKelompok.length;
        });
    }

    function renderVpnConfigTemplateCard(template) {
        const tanda = template.isActive
            ? '<span class="vpn-admin-tag">Aktif</span>'
            : '<span class="vpn-admin-tag vpn-admin-tag-off">Dimatikan</span>';
        return `<article class="vpn-admin-card" data-vpn-template="${escapeHtml(template.id)}">
            <div class="vpn-admin-card-head">
                <label class="vpn-admin-card-title">
                    <input type="checkbox" data-vpn-template-select="${escapeHtml(template.id)}"${vpnConfigSelectedIds.has(template.id) ? ' checked' : ''} aria-label="Pilih ${escapeHtml(template.name)}">
                    <span>
                        <strong>${escapeHtml(template.name)}</strong>
                        <span class="vpn-admin-sub">${escapeHtml(template.filename)} · ${escapeHtml(template.formatLabel)}</span>
                    </span>
                </label>
                <div class="vpn-admin-tags">${tanda}</div>
            </div>
            <div class="vpn-admin-facts">
                <span>Ukuran <strong>${escapeHtml(formatVpnTemplateSize(template.byteSize))}</strong></span>
                <span>Diunggah <strong>${escapeHtml(formatDate(template.createdAt))}</strong></span>
            </div>
            <div class="vpn-admin-actions">
                <button class="btn-secondary" type="button" data-vpn-template-active="${escapeHtml(template.id)}" data-active="${template.isActive ? '1' : '0'}">
                    <i class="fas fa-power-off"></i> ${template.isActive ? 'Matikan' : 'Aktifkan'}
                </button>
                <button class="btn-secondary vpn-admin-danger" type="button" data-vpn-template-delete="${escapeHtml(template.id)}">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </article>`;
    }

    // Satu kelompok (mis. semua .hc) dengan kartu halaman ini saja dan navigasi
    // halamannya sendiri. Kelompok lain tidak ikut mereset saat satu kelompok
    // pindah halaman, karena masing-masing menyimpan nomor halamannya sendiri.
    function renderVpnConfigTemplateGroup(format, daftar) {
        const label = daftar[0]?.formatLabel || format;
        const totalHalaman = Math.max(1, Math.ceil(daftar.length / VPN_CONFIG_TEMPLATE_PAGE_SIZE));
        const halaman = Math.min(Math.max(vpnConfigTemplatePages[format] || 1, 1), totalHalaman);
        vpnConfigTemplatePages[format] = halaman;

        const mulai = (halaman - 1) * VPN_CONFIG_TEMPLATE_PAGE_SIZE;
        const dipotong = daftar.slice(mulai, mulai + VPN_CONFIG_TEMPLATE_PAGE_SIZE);

        return `<div class="vpn-admin-template-group" data-vpn-template-format="${escapeHtml(format)}">
            <h4 class="vpn-admin-group-title">
                <label class="vpn-admin-check">
                    <input type="checkbox" data-vpn-template-group-select="${escapeHtml(format)}" aria-label="Pilih semua ${escapeHtml(label)}">
                    <span>${escapeHtml(label)}</span>
                </label>
                <span class="vpn-admin-group-count">${daftar.length}</span>
            </h4>
            <div class="vpn-admin-list">
                ${dipotong.map(renderVpnConfigTemplateCard).join('')}
            </div>
            <div class="admin-pagination">
                <button class="btn-secondary" type="button" data-vpn-template-prev="${escapeHtml(format)}"${halaman <= 1 ? ' disabled' : ''}>Sebelumnya</button>
                <span>Halaman ${halaman} / ${totalHalaman}</span>
                <button class="btn-secondary" type="button" data-vpn-template-next="${escapeHtml(format)}"${halaman >= totalHalaman ? ' disabled' : ''}>Berikutnya</button>
            </div>
        </div>`;
    }

    function renderVpnConfigTemplates(templates) {
        if (!vpnConfigTemplateListEl) return;
        vpnConfigTemplatesAll = templates;
        if (!templates.length) {
            vpnConfigTemplateListEl.innerHTML = '<p class="vpn-admin-empty">Belum ada template. Unggah file .hc, .ehi, atau .dark di atas.</p>';
            updateVpnConfigBulkBar();
            return;
        }

        const kelompok = {};
        templates.forEach(function(template) {
            const format = template.format || 'lainnya';
            if (!kelompok[format]) kelompok[format] = [];
            kelompok[format].push(template);
        });

        // Format yang sudah dikenal dulu sesuai urutan tetap, lalu format lain
        // yang tidak terduga tetap ikut ditampilkan, bukan hilang diam-diam.
        const urutanFormat = VPN_CONFIG_FORMAT_ORDER
            .filter(function(format) { return kelompok[format]; })
            .concat(Object.keys(kelompok).filter(function(format) { return !VPN_CONFIG_FORMAT_ORDER.includes(format); }));

        vpnConfigTemplateListEl.innerHTML = urutanFormat
            .map(function(format) { return renderVpnConfigTemplateGroup(format, kelompok[format]); })
            .join('');
        updateVpnConfigBulkBar();
    }

    async function loadVpnConfigTemplates() {
        if (!vpnConfigTemplateListEl) return;
        try {
            const result = await callVpnAdmin('/api/admin/vpn/config/templates', { method: 'GET' });
            renderVpnConfigTemplates(Array.isArray(result.data) ? result.data : []);
        } catch (error) {
            vpnConfigTemplateListEl.innerHTML = `<p class="vpn-admin-empty">${escapeHtml(error.message || 'Gagal memuat template.')}</p>`;
        }
    }

    function bacaBerkasSebagaiBase64(file) {
        return new Promise(function(resolve, reject) {
            const reader = new FileReader();
            reader.onload = function() {
                // Hasil readAsDataURL berbentuk "data:...;base64,xxx".
                const hasil = String(reader.result || '');
                const pisah = hasil.indexOf(',');
                resolve(pisah >= 0 ? hasil.slice(pisah + 1) : '');
            };
            reader.onerror = function() { reject(new Error(`Gagal membaca ${file.name}`)); };
            reader.readAsDataURL(file);
        });
    }

    // Dikirim satu berkas per permintaan, bukan sekaligus, supaya body-nya tetap
    // kecil dan satu berkas yang bermasalah tidak menggagalkan yang lain.
    // Umpan balik langsung begitu file dipilih, sebelum tombol Unggah ditekan.
    // Tanpa ini, memilih banyak file sekaligus (Ctrl+klik / Shift+klik) tidak
    // ada tanda apa pun kalau pilihannya benar-benar kena, dan mudah dikira
    // fiturnya tidak ada.
    function renderVpnConfigTemplateSelection() {
        if (!vpnConfigTemplateSelectedTextEl) return;
        const files = Array.from(vpnConfigTemplateInputEl?.files || []);
        if (!files.length) {
            vpnConfigTemplateSelectedTextEl.textContent = '';
            return;
        }
        const nama = files.map(function(file) { return file.name; }).join(', ');
        vpnConfigTemplateSelectedTextEl.textContent = `${files.length} file dipilih: ${nama}`;
    }

    if (vpnConfigTemplateInputEl) {
        vpnConfigTemplateInputEl.addEventListener('change', renderVpnConfigTemplateSelection);
    }

    async function uploadVpnConfigTemplates() {
        const files = Array.from(vpnConfigTemplateInputEl?.files || []);
        if (!files.length) {
            setVpnConfigUploadStatus('Pilih file template dulu.', 'failed');
            return;
        }

        setAdminPushButtonBusy(vpnConfigUploadBtn, true, 'Mengunggah...');
        let berhasil = 0;
        const gagal = [];

        for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            setVpnConfigUploadStatus(`Mengunggah ${i + 1} dari ${files.length}: ${file.name}`);
            try {
                // eslint-disable-next-line no-await-in-loop
                const contentBase64 = await bacaBerkasSebagaiBase64(file);
                // eslint-disable-next-line no-await-in-loop
                await callVpnAdmin('/api/admin/vpn/config/templates', {
                    body: { files: [{ filename: file.name, contentBase64 }] },
                });
                berhasil += 1;
            } catch (error) {
                gagal.push(`${file.name}: ${error.message}`);
            }
        }

        setAdminPushButtonBusy(vpnConfigUploadBtn, false);
        if (vpnConfigTemplateInputEl) vpnConfigTemplateInputEl.value = '';
        renderVpnConfigTemplateSelection();
        await loadVpnConfigTemplates();

        if (gagal.length) {
            setVpnConfigUploadStatus(`${berhasil} berhasil, ${gagal.length} gagal. ${gagal[0]}`, 'failed');
        } else {
            setVpnConfigUploadStatus(`${berhasil} template tersimpan.`, 'success');
        }
    }

    if (vpnConfigSaveBtn) vpnConfigSaveBtn.addEventListener('click', function() { void saveVpnConfigSettings(); });
    if (vpnConfigTestBtn) vpnConfigTestBtn.addEventListener('click', function() { void testVpnConfigConnection(); });
    if (vpnConfigUploadBtn) vpnConfigUploadBtn.addEventListener('click', function() { void uploadVpnConfigTemplates(); });

    if (vpnConfigTemplateListEl) {
        vpnConfigTemplateListEl.addEventListener('click', async function(event) {
            const sebelumnya = event.target.closest('[data-vpn-template-prev]');
            if (sebelumnya) {
                const format = sebelumnya.dataset.vpnTemplatePrev;
                vpnConfigTemplatePages[format] = Math.max(1, (vpnConfigTemplatePages[format] || 1) - 1);
                renderVpnConfigTemplates(vpnConfigTemplatesAll);
                return;
            }

            const berikutnya = event.target.closest('[data-vpn-template-next]');
            if (berikutnya) {
                const format = berikutnya.dataset.vpnTemplateNext;
                vpnConfigTemplatePages[format] = (vpnConfigTemplatePages[format] || 1) + 1;
                renderVpnConfigTemplates(vpnConfigTemplatesAll);
                return;
            }

            const aktif = event.target.closest('[data-vpn-template-active]');
            if (aktif) {
                try {
                    await callVpnAdmin(`/api/admin/vpn/config/templates/${encodeURIComponent(aktif.dataset.vpnTemplateActive)}/active`, {
                        body: { isActive: aktif.dataset.active !== '1' },
                    });
                    await loadVpnConfigTemplates();
                } catch (error) {
                    setVpnConfigUploadStatus(error.message, 'failed');
                }
                return;
            }

            const hapus = event.target.closest('[data-vpn-template-delete]');
            if (hapus) {
                const confirmed = await showConfirmDialog({
                    title: 'Hapus Template',
                    message: 'Hapus template ini? User tidak bisa lagi membuat config dari template tersebut.',
                    confirmText: 'Iya, Hapus',
                    cancelText: 'Batal',
                });
                if (confirmed !== true && confirmed?.confirmed !== true) return;
                try {
                    const result = await callVpnAdmin(`/api/admin/vpn/config/templates/${encodeURIComponent(hapus.dataset.vpnTemplateDelete)}`, {
                        method: 'DELETE',
                    });
                    setVpnConfigUploadStatus(result.message, 'success');
                    await loadVpnConfigTemplates();
                } catch (error) {
                    setVpnConfigUploadStatus(error.message, 'failed');
                }
            }
        });

        vpnConfigTemplateListEl.addEventListener('change', function(event) {
            const satu = event.target.closest('[data-vpn-template-select]');
            if (satu) {
                if (satu.checked) vpnConfigSelectedIds.add(satu.dataset.vpnTemplateSelect);
                else vpnConfigSelectedIds.delete(satu.dataset.vpnTemplateSelect);
                updateVpnConfigBulkBar();
                return;
            }

            // Centang kelompok memilih semua template format itu, termasuk yang
            // ada di halaman lain, bukan hanya yang sedang terlihat.
            const kelompok = event.target.closest('[data-vpn-template-group-select]');
            if (kelompok) {
                const format = kelompok.dataset.vpnTemplateGroupSelect;
                vpnConfigTemplatesAll
                    .filter(function(template) { return (template.format || 'lainnya') === format; })
                    .forEach(function(template) {
                        if (kelompok.checked) vpnConfigSelectedIds.add(template.id);
                        else vpnConfigSelectedIds.delete(template.id);
                    });
                renderVpnConfigTemplates(vpnConfigTemplatesAll);
            }
        });
    }

    if (vpnConfigSelectAllEl) {
        vpnConfigSelectAllEl.addEventListener('change', function() {
            if (vpnConfigSelectAllEl.checked) {
                vpnConfigTemplatesAll.forEach(function(template) { vpnConfigSelectedIds.add(template.id); });
            } else {
                vpnConfigSelectedIds.clear();
            }
            renderVpnConfigTemplates(vpnConfigTemplatesAll);
        });
    }

    async function deleteVpnConfigTemplatesBulk({ all }) {
        const ids = Array.from(vpnConfigSelectedIds);
        const jumlah = all ? vpnConfigTemplatesAll.length : ids.length;
        if (!jumlah) return;

        const confirmed = await showConfirmDialog({
            title: all ? 'Hapus Semua Template' : 'Hapus Template Terpilih',
            message: all
                ? `Hapus SEMUA ${jumlah} template config? User tidak bisa membuat config sampai template baru diunggah.`
                : `Hapus ${jumlah} template terpilih? User tidak bisa lagi membuat config dari template tersebut.`,
            confirmText: 'Iya, Hapus',
            cancelText: 'Batal',
        });
        if (confirmed !== true && confirmed?.confirmed !== true) return;

        const tombol = all ? vpnConfigDeleteAllBtn : vpnConfigDeleteSelectedBtn;
        setAdminPushButtonBusy(tombol, true, 'Menghapus...');
        try {
            const result = await callVpnAdmin('/api/admin/vpn/config/templates/delete', {
                body: all ? { all: true } : { ids },
            });
            vpnConfigSelectedIds.clear();
            setVpnConfigUploadStatus(result.message, 'success');
        } catch (error) {
            setVpnConfigUploadStatus(error.message, 'failed');
        } finally {
            setAdminPushButtonBusy(tombol, false);
            await loadVpnConfigTemplates();
        }
    }

    if (vpnConfigDeleteSelectedBtn) {
        vpnConfigDeleteSelectedBtn.addEventListener('click', function() { void deleteVpnConfigTemplatesBulk({ all: false }); });
    }
    if (vpnConfigDeleteAllBtn) {
        vpnConfigDeleteAllBtn.addEventListener('click', function() { void deleteVpnConfigTemplatesBulk({ all: true }); });
    }

    // ===== Restore database webpanel VPN =====
    //
    // Alurnya dua langkah: "Cek Dulu" mengirim file ke server dengan mode coba
    // dan hanya menampilkan laporan, lalu "Jalankan Restore" mengirim file yang
    // sama dengan mode apply. Tombol kedua baru terbuka setelah pemeriksaan
    // selesai, supaya admin selalu melihat dampaknya lebih dulu.
    const vpnRestoreFileInputEl = document.getElementById('vpnRestoreFileInput');
    const vpnRestorePreviewBtn = document.getElementById('vpnRestorePreviewBtn');
    const vpnRestoreApplyBtn = document.getElementById('vpnRestoreApplyBtn');
    const vpnRestoreInfoEl = document.getElementById('vpnRestoreInfo');
    const vpnRestoreRefreshBtn = document.getElementById('vpnRestoreRefreshBtn');
    const vpnRestoreResultEl = document.getElementById('vpnRestoreResult');
    const vpnRestoreResultTitleEl = document.getElementById('vpnRestoreResultTitle');
    const vpnRestoreSummaryEl = document.getElementById('vpnRestoreSummary');
    const vpnRestoreLogEl = document.getElementById('vpnRestoreLog');
    const vpnRestoreSyncBalanceInputEl = document.getElementById('vpnRestoreSyncBalanceInput');
    const vpnRestoreSyncEl = document.getElementById('vpnRestoreSync');
    const vpnRestoreStatEls = {
        profiles: document.getElementById('vpnRestoreStatProfiles'),
        servers: document.getElementById('vpnRestoreStatServers'),
        accounts: document.getElementById('vpnRestoreStatAccounts'),
        rules: document.getElementById('vpnRestoreStatRules'),
    };

    let vpnRestoreMaxBytes = 128 * 1024 * 1024;
    // File yang sudah lolos pemeriksaan. Disimpan supaya tombol restore memakai
    // berkas yang sama persis dengan yang tadi diperiksa, bukan file lain yang
    // sempat dipilih ulang di kotak unggah.
    let vpnRestoreCheckedFile = null;
    // Pilihan sinkron saldo saat pemeriksaan. Restore sungguhan memakai
    // pilihan yang sama, supaya yang dijalankan persis yang tadi dilihat.
    let vpnRestoreCheckedSync = false;

    function setVpnRestoreInfo(message) {
        if (vpnRestoreInfoEl) vpnRestoreInfoEl.textContent = message;
    }

    function renderVpnRestoreCounts(counts) {
        Object.keys(vpnRestoreStatEls).forEach(function(key) {
            const el = vpnRestoreStatEls[key];
            if (el) el.textContent = Number(counts?.[key] || 0).toLocaleString('id-ID');
        });
    }

    async function loadVpnRestoreStatus() {
        try {
            const response = await fetch('/api/admin/vpn/restore');
            if (!response.ok) throw new Error('Gagal membaca status VPN');
            const result = await response.json();
            const data = result?.data || {};
            if (Number(data.maxUploadBytes) > 0) vpnRestoreMaxBytes = Number(data.maxUploadBytes);
            renderVpnRestoreCounts(data.current);
        } catch (_error) {
            renderVpnRestoreCounts(null);
        }
    }

    function renderVpnRestoreReport(payload, dryRun) {
        if (!vpnRestoreResultEl) return;
        const report = payload?.report || {};
        const baris = [
            ['Isi file: user', report.source?.users],
            ['Isi file: server', report.source?.servers],
            ['Isi file: akun VPN', report.source?.accounts],
            [dryRun ? 'Akun PPOB akan dibuat' : 'Akun PPOB baru dibuat', report.users?.created],
            ['Digabung ke akun PPOB yang sudah ada', report.users?.merged],
            ['User sudah pernah diimpor', report.users?.alreadyImported],
            ['Username diubah karena bentrok', report.users?.renamed],
            [dryRun ? 'Server akan dibuat' : 'Server baru dibuat', report.servers?.created],
            ['Server sudah ada (tidak ditimpa)', report.servers?.existing],
            [dryRun ? 'Akun VPN akan dibuat' : 'Akun VPN baru dibuat', report.accounts?.created],
            ['Akun VPN sudah pernah diimpor', report.accounts?.existing],
            ['Akun dilewati', report.accounts?.skipped],
        ];

        if (vpnRestoreResultTitleEl) {
            vpnRestoreResultTitleEl.textContent = dryRun ? 'Hasil pemeriksaan' : 'Hasil restore';
        }
        if (vpnRestoreSummaryEl) {
            vpnRestoreSummaryEl.innerHTML = baris.map(function(item) {
                return `<div class="vpn-restore-summary-row">
                    <span>${escapeHtml(item[0])}</span>
                    <strong>${Number(item[1] || 0).toLocaleString('id-ID')}</strong>
                </div>`;
            }).join('');
        }
        if (vpnRestoreLogEl) {
            vpnRestoreLogEl.textContent = (payload?.lines || []).join('\n');
        }
        renderVpnRestoreSync(report, dryRun);
        vpnRestoreResultEl.hidden = false;
    }

    // Tabel perubahan saldo ditampilkan terbuka, bukan disembunyikan di laporan
    // lengkap, karena ini bagian yang mengubah uang orang dan harus diperiksa
    // satu per satu sebelum dijalankan.
    function renderVpnRestoreSync(report, dryRun) {
        if (!vpnRestoreSyncEl) return;
        const sync = report?.balanceSync;
        if (!sync?.requested) {
            vpnRestoreSyncEl.hidden = true;
            vpnRestoreSyncEl.innerHTML = '';
            return;
        }

        const rupiah = function(value) {
            return 'Rp ' + Math.abs(Number(value || 0)).toLocaleString('id-ID');
        };
        const statusLabel = {
            credit: dryRun ? 'Akan ditambah' : 'Ditambah',
            debit: dryRun ? 'Akan dikurangi' : 'Dikurangi',
            insufficient: 'Saldo tidak cukup, dilewati',
        };
        const items = Array.isArray(sync.items) ? sync.items : [];
        const rows = items.map(function(item) {
            const tanda = Number(item.delta) > 0 ? '+' : '-';
            let kelas = Number(item.delta) > 0 ? 'vpn-restore-sync-plus' : 'vpn-restore-sync-minus';
            if (item.status === 'insufficient') kelas = 'vpn-restore-sync-warn';
            const catatan = item.neverMoved
                ? '<small class="vpn-restore-sync-note">Saldo panel lamanya belum pernah dipindahkan. Pastikan belum ditambah manual.</small>'
                : '';
            const sesudah = item.balanceAfter === null || item.balanceAfter === undefined
                ? ''
                : ' &rarr; ' + rupiah(item.balanceAfter);
            return '<tr>'
                + '<td data-label="User"><strong>' + escapeHtml(item.vpnUsername) + '</strong>'
                + '<small>' + escapeHtml(item.email) + '</small>' + catatan + '</td>'
                + '<td data-label="Saldo di backup">' + rupiah(item.backupSaldo) + '</td>'
                + '<td data-label="Sudah dipindahkan">' + rupiah(item.alreadyMoved) + '</td>'
                + '<td data-label="Selisih" class="' + kelas + '">' + tanda + rupiah(item.delta) + '</td>'
                + '<td data-label="Saldo sekarang">' + rupiah(item.balanceBefore) + sesudah + '</td>'
                + '<td data-label="Status">' + escapeHtml(statusLabel[item.status] || item.status) + '</td>'
                + '</tr>';
        }).join('');

        const akan = dryRun ? 'akan ' : '';
        const ringkas = [
            sync.increased + ' user ' + akan + 'ditambah ' + rupiah(sync.increaseTotal),
            sync.decreased + ' user ' + akan + 'dikurangi ' + rupiah(sync.decreaseTotal),
            sync.unchanged + ' user sudah sama',
        ];
        if (sync.insufficient) ringkas.push(sync.insufficient + ' user saldonya tidak cukup untuk dikurangi');

        const tabel = items.length
            ? '<div class="vpn-restore-sync-scroll"><table class="vpn-restore-sync-table">'
                + '<thead><tr><th>User</th><th>Saldo di backup</th><th>Sudah dipindahkan</th><th>Selisih</th><th>Saldo sekarang</th><th>Status</th></tr></thead>'
                + '<tbody>' + rows + '</tbody></table></div>'
            : '<p>Tidak ada saldo yang perlu disinkronkan.</p>';
        const potong = sync.itemsTruncated
            ? '<p>Daftar dipotong, hanya ' + items.length + ' pertama yang ditampilkan.</p>'
            : '';

        vpnRestoreSyncEl.innerHTML = '<h4>Sinkron saldo</h4>'
            + '<p id="vpnRestoreSyncSummary">' + escapeHtml(ringkas.join(' · ')) + '</p>'
            + tabel + potong;
        vpnRestoreSyncEl.hidden = false;
    }

    function pickVpnRestoreFile() {
        const file = vpnRestoreFileInputEl?.files && vpnRestoreFileInputEl.files[0];
        if (!file) {
            setVpnRestoreInfo('Pilih file database VPN dulu.');
            return null;
        }
        if (file.size > vpnRestoreMaxBytes) {
            setVpnRestoreInfo(`Ukuran file maksimal ${formatBytes(vpnRestoreMaxBytes)}.`);
            return null;
        }
        return file;
    }

    async function sendVpnRestore(file, { dryRun, adminPassword, syncBalances }) {
        const headers = {
            'Content-Type': 'application/octet-stream',
            'x-file-name': sanitizeMediaFileName(file.name),
        };
        if (!dryRun && adminPassword) headers['x-admin-password'] = adminPassword;

        const syncQuery = syncBalances ? '&syncBalances=1' : '';
        const response = await fetch(`/api/admin/vpn/restore?mode=${dryRun ? 'check' : 'apply'}${syncQuery}`, {
            method: 'POST',
            headers,
            body: file,
        });
        const result = await readMediaJsonResponse(response, 'File database VPN');
        if (!response.ok) throw new Error(result?.error || 'Restore VPN gagal');
        return result?.data || {};
    }

    async function previewVpnRestore() {
        const file = pickVpnRestoreFile();
        if (!file) return;

        vpnRestoreCheckedFile = null;
        if (vpnRestoreApplyBtn) vpnRestoreApplyBtn.disabled = true;
        const syncBalances = Boolean(vpnRestoreSyncBalanceInputEl?.checked);
        setAdminPushButtonBusy(vpnRestorePreviewBtn, true, 'Memeriksa...');
        setVpnRestoreInfo('Memeriksa isi file tanpa mengubah database...');
        try {
            const data = await sendVpnRestore(file, { dryRun: true, syncBalances });
            renderVpnRestoreReport(data, true);
            vpnRestoreCheckedFile = file;
            vpnRestoreCheckedSync = syncBalances;
            if (vpnRestoreApplyBtn) vpnRestoreApplyBtn.disabled = false;
            setVpnRestoreInfo('Pemeriksaan selesai, belum ada yang diubah. Kalau angkanya sudah sesuai, tekan "Jalankan Restore".');
        } catch (error) {
            setVpnRestoreInfo(error.message || 'Gagal memeriksa file.');
        } finally {
            setAdminPushButtonBusy(vpnRestorePreviewBtn, false);
        }
    }

    async function applyVpnRestore() {
        const file = vpnRestoreCheckedFile || pickVpnRestoreFile();
        if (!file) return;
        if (!vpnRestoreCheckedFile) {
            setVpnRestoreInfo('Tekan "Cek Dulu" sekali sebelum menjalankan restore.');
            return;
        }

        const confirmed = await showConfirmDialog({
            title: 'Konfirmasi Restore VPN',
            message: vpnRestoreCheckedSync
                ? 'Jalankan restore sekarang? User, server, dan akun VPN dari file ini akan ditambahkan, dan saldo user yang sudah pindah akan disamakan sesuai tabel sinkron saldo. Masukkan password admin untuk melanjutkan.'
                : 'Jalankan restore sekarang? User, server, dan akun VPN dari file ini akan ditambahkan ke database PPOB. Masukkan password admin untuk melanjutkan.',
            confirmText: 'Iya, Jalankan',
            cancelText: 'Batal',
            passwordInput: true,
            passwordLabel: 'Password admin',
        });
        if (!confirmed?.confirmed || !confirmed.password) return;

        setAdminPushButtonBusy(vpnRestoreApplyBtn, true, 'Menjalankan...');
        setVpnRestoreInfo('Memindahkan data VPN ke database PPOB...');
        try {
            const data = await sendVpnRestore(file, {
                dryRun: false,
                adminPassword: confirmed.password,
                syncBalances: vpnRestoreCheckedSync,
            });
            renderVpnRestoreReport(data, false);
            renderVpnRestoreCounts(data?.after);
            vpnRestoreCheckedFile = null;
            if (vpnRestoreFileInputEl) vpnRestoreFileInputEl.value = '';
            if (vpnRestoreApplyBtn) vpnRestoreApplyBtn.disabled = true;
            setVpnRestoreInfo('Restore selesai. Aman dijalankan ulang dengan file yang lebih baru kapan pun.');
        } catch (error) {
            setVpnRestoreInfo(error.message || 'Restore VPN gagal.');
        } finally {
            setAdminPushButtonBusy(vpnRestoreApplyBtn, false);
        }
    }

    if (vpnRestorePreviewBtn) vpnRestorePreviewBtn.addEventListener('click', function() { void previewVpnRestore(); });
    if (vpnRestoreApplyBtn) vpnRestoreApplyBtn.addEventListener('click', function() { void applyVpnRestore(); });
    if (vpnRestoreRefreshBtn) vpnRestoreRefreshBtn.addEventListener('click', function() { void loadVpnRestoreStatus(); });
    if (vpnRestoreSyncBalanceInputEl) {
        // Mengganti pilihan sinkron membuat hasil pemeriksaan tadi tidak
        // berlaku, jadi restore dikunci lagi sampai diperiksa ulang.
        vpnRestoreSyncBalanceInputEl.addEventListener('change', function() {
            if (!vpnRestoreCheckedFile) return;
            vpnRestoreCheckedFile = null;
            if (vpnRestoreApplyBtn) vpnRestoreApplyBtn.disabled = true;
            if (vpnRestoreResultEl) vpnRestoreResultEl.hidden = true;
            setVpnRestoreInfo('Pilihan sinkron saldo berubah. Tekan "Cek Dulu" lagi sebelum menjalankan restore.');
        });
    }
    if (vpnRestoreFileInputEl) {
        vpnRestoreFileInputEl.addEventListener('change', function() {
            // File berganti berarti laporan lama tidak berlaku lagi.
            vpnRestoreCheckedFile = null;
            if (vpnRestoreApplyBtn) vpnRestoreApplyBtn.disabled = true;
            if (vpnRestoreResultEl) vpnRestoreResultEl.hidden = true;
            setVpnRestoreInfo('Tekan "Cek Dulu" untuk melihat apa yang akan terjadi tanpa mengubah database.');
        });
    }

    document.querySelectorAll('[data-view-target]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showView(link.dataset.viewTarget);
        });
    });

    async function ensureAdminSession() {
        try {
            const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
            const result = await response.json().catch(function() { return {}; });
            const role = String(result?.user?.role || '').toUpperCase();
            if (!response.ok || role !== 'ADMIN') {
                window.location.href = 'login.html';
                return false;
            }
            return true;
        } catch (_error) {
            window.location.href = 'login.html';
            return false;
        }
    }

    // Logout
    document.querySelectorAll('[data-logout-btn], #logoutBtn').forEach(function(logoutEl) {
        logoutEl.addEventListener('click', async function(e) {
            e.preventDefault();
            const confirmed = await showConfirmDialog({
                title: 'Konfirmasi Logout',
                message: 'Yakin Mau Logout Nih kak?',
                confirmText: 'Iya',
                cancelText: 'Gajadi',
            });
            if (!confirmed) return;
            if (typeof window.PPOB_UNREGISTER_PUSH_DEVICE === 'function') {
                await window.PPOB_UNREGISTER_PUSH_DEVICE().catch(function() {});
            }
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin',
            }).catch(function() {});
            // Menahan login otomatis Telegram setelah logout, sama seperti halaman user.
            try { sessionStorage.setItem('ppob_telegram_auto_login_off', '1'); } catch (_error) { /* diblokir */ }
            if (typeof window.PPOB_NATIVE_GOOGLE_SIGN_OUT === 'function') {
                await window.PPOB_NATIVE_GOOGLE_SIGN_OUT().catch(function() {});
            }
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('role');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('username');
            window.location.href = window.PPOB_IS_NATIVE ? 'login.html' : 'index.html';
        });
    });

    async function initAdminDashboard() {
        const authenticated = await ensureAdminSession();
        if (!authenticated) return;

        loadAdminOverview();
        loadMonitoringDashboard();
        loadAdminPushSummary();
        loadProductSummary();
        loadAdminProducts();
        loadBrandLogos();
        loadCategoryLogos();
        void refreshLogoStorageStatus();
        loadPricingConfig();
        loadAdminTransactions();
        loadAdminPaymentOrders();
        loadInternalGatewayDashboard();
        loadAdminUsers(1);
        const initialHash = String(window.location.hash || '').toLowerCase();
        const initialLink = mobileNavLinks.find(function(link) {
            return String(link.getAttribute('href') || '').toLowerCase() === initialHash;
        });
        const initialViewId = initialLink?.dataset?.viewTarget || 'overviewView';
        showView(initialViewId);
        updateMobileNavIndicator(initialViewId);
        renderAdminStaticFancyFilters();
        setupMobileNavSwipe();
        window.addEventListener('resize', function() {
            updateMobileNavIndicator();
        });
    }

    initAdminDashboard();
});
