export function createNfeFormData(nfe) {
    const formData = new FormData();

    formData.append('id', nfe.id);
    formData.append('status', nfe.status);
    formData.append('sale_or_dispatch', nfe.sale_or_dispatch);
    formData.append('invoice_number', nfe.invoice_number);
    formData.append('series', nfe.series);
    formData.append('customer_name', nfe.customer_name);
    formData.append('nfe_key', nfe.nfe_key);
    formData.append('modality', nfe.modality);
    formData.append('operation', nfe.operation);
    formData.append('logistic_type', nfe.logistic_type);
    formData.append('issue_date', nfe.issue_date);
    formData.append('amount', nfe.amount);
    formData.append('total_amount', nfe.total_amount);
    formData.append('freight', nfe.freight);
    formData.append('notes', nfe.notes);

    if (nfe.pdf?.data) {
        formData.append('pdf', new Blob([nfe.pdf.data], { type: 'application/pdf' }), nfe.pdf.name);
    }

    if (nfe.xml?.data) {
        formData.append('xml', new Blob([nfe.xml.data], { type: 'application/xml' }), nfe.xml.name);
    }

    return formData;
}

export function createNfesFormDataArray(nfes) {
    return nfes.map(nfe => createNfeFormData(nfe));
}