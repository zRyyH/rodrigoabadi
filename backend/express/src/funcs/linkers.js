import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 15);

export function linkFilesToNfes(pdfs, xmls, nfes) {
    return nfes.map(nfe => ({
        id: nanoid(),
        ...nfe,
        pdf: pdfs.find(pdf => pdf.name.includes(nfe.nfe_key)) || null,
        xml: xmls.find(xml => xml.name.includes(nfe.nfe_key)) || null
    }));
}

export function linkNfesToSales(nfes, sales) {
    const nfeMap = new Map(nfes.map(nfe => [nfe.sale_or_dispatch, nfe.id]));

    for (const sale of sales) {
        const nfeId = nfeMap.get(sale.sale_id);
        if (nfeId) {
            sale.nfe = nfeId;
        }
    }

    return sales;
}