export function processNfes(oldNfes, newNfes) {
    const toUpdateNfes = [];
    const toCreateNfes = [];

    const oldNfesMap = new Map(oldNfes.map(nfe => [nfe.nfe_key, nfe]));

    const compareFields = [
        'status', 'sale_or_dispatch', 'invoice_number', 'series',
        'customer_name', 'modality', 'operation', 'logistic_type',
        'issue_date', 'amount', 'total_amount', 'freight', 'notes'
    ];

    const normalizeValue = (value, field) => {
        if (field === 'issue_date' && value) {
            return new Date(value).getTime();
        }
        return String(value ?? '');
    };

    for (const newNfe of newNfes) {
        const oldNfe = oldNfesMap.get(newNfe.nfe_key);

        if (!oldNfe) {
            toCreateNfes.push(newNfe);
            continue;
        }

        const changes = { id: oldNfe.id };
        let hasChanges = false;

        for (const field of compareFields) {
            const newValue = normalizeValue(newNfe[field], field);
            const oldValue = normalizeValue(oldNfe[field], field);

            if (newValue !== oldValue) {
                changes[field] = newNfe[field];
                hasChanges = true;
            }
        }

        if (hasChanges) {
            toUpdateNfes.push(changes);
        }
    }

    return { toUpdateNfes, toCreateNfes };
}

export function processSales(oldSales, newSales) {
    const toUpdateSales = [];
    const toCreateSales = [];

    const oldSalesMap = new Map(oldSales.map(sale => [sale.sale_id, sale]));

    const compareFields = [
        'sale_date', 'state', 'status_description', 'multi_product_package',
        'belongs_to_kit', 'units', 'product_revenue', 'price_increase_revenue',
        'installment_fee', 'sales_fee_and_taxes', 'shipping_revenue', 'shipping_fees',
        'refunds', 'total_amount', 'billing_month', 'ads_sale', 'sku', 'listing_id',
        'sales_channel', 'listing_title', 'variation', 'unit_price', 'listing_type',
        'nfe_attached', 'personal_or_company_data', 'document_type_number', 'address',
        'taxpayer_type', 'state_registration', 'buyer_name', 'business', 'cpf',
        'buyer_address', 'city', 'buyer_state', 'postal_code', 'country',
        'delivery_method', 'delivery_shipped_date', 'delivery_delivered_date',
        'delivery_driver', 'delivery_tracking_number', 'delivery_tracking_url',
        'return_units', 'return_method', 'return_shipped_date', 'return_delivered_date',
        'return_driver', 'return_tracking_number', 'return_tracking_url',
        'reviewed_by_ml', 'review_date', 'money_released', 'result', 'destination',
        'result_reason', 'complaint_units', 'complaint_opened', 'complaint_closed', 'mediation'
    ];

    const dateFields = ['sale_date', 'delivery_shipped_date', 'delivery_delivered_date',
        'return_shipped_date', 'return_delivered_date', 'review_date'];

    const isValidISODate = (value) => {
        if (!value) return false;
        const str = String(value).trim();
        return /^\d{4}-\d{2}-\d{2}/.test(str);
    };

    const formatDateISO = (value) => {
        const str = String(value).trim().replace(' ', 'T');
        if (str.endsWith('Z')) return str;
        if (str.includes('.')) return str + 'Z';
        return str + '.000Z';
    };

    const normalizeValue = (value, field) => {
        if (value === null || value === undefined) return '';
        const str = String(value).trim();
        if (str === '') return '';
        if (dateFields.includes(field)) {
            if (!isValidISODate(str)) return '';
            return formatDateISO(str);
        }
        return str;
    };

    const isEmpty = (value) => {
        if (value === null || value === undefined) return true;
        return String(value).trim() === '';
    };

    const cleanDateFields = (obj) => {
        const cleaned = { ...obj };
        for (const field of dateFields) {
            if (cleaned[field] && !isValidISODate(cleaned[field])) {
                delete cleaned[field];
            } else if (isValidISODate(cleaned[field])) {
                cleaned[field] = formatDateISO(cleaned[field]);
            }
        }
        return cleaned;
    };

    for (const newSale of newSales) {
        const oldSale = oldSalesMap.get(newSale.sale_id);

        if (!oldSale) {
            toCreateSales.push(cleanDateFields(newSale));
            continue;
        }

        const changes = { id: oldSale.id };
        let hasChanges = false;

        for (const field of compareFields) {
            if (isEmpty(newSale[field])) continue;
            if (dateFields.includes(field) && !isValidISODate(newSale[field])) continue;

            const newValue = normalizeValue(newSale[field], field);
            const oldValue = normalizeValue(oldSale[field], field);

            if (newValue !== oldValue) {
                changes[field] = dateFields.includes(field) ? formatDateISO(newSale[field]) : newSale[field];
                hasChanges = true;
            }
        }

        if (hasChanges) {
            toUpdateSales.push(changes);
        }
    }

    return { toUpdateSales, toCreateSales };
}