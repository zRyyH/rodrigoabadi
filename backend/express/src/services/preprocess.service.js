import { PocketBaseRepository } from "../repositories/pocketbase.repository.js"
import { sales_map, nfes_map, sales_normalizer, nfes_normalizer } from "../constants/map.js"
import { extractFilesFromZip } from "../funcs/extractFiles.js"
import { normalizer } from "../funcs/normalizerData.js"
import { parseXlsx } from "../funcs/parseXlsx.js"
import { mapData } from "../funcs/mapData.js"

export async function processFiles({ sales, nfes, pdfs, xmls }) {
    const salesParsed = parseXlsx(sales.buffer)["Vendas BR"]
    const nfesParsed = parseXlsx(nfes.buffer)["Invoices"]

    const mappedSales = mapData(salesParsed, sales_map).slice(5)
    const mappedNfes = mapData(nfesParsed, nfes_map)

    const normalizedSales = normalizer(mappedSales, sales_normalizer)
    const normalizedNfes = normalizer(mappedNfes, nfes_normalizer)


    const pdfFiles = extractFilesFromZip(pdfs.buffer, "Emitidas_Mercado_Livre/NF-e de venda/PDF/Autorizadas")
    const xmlFiles = extractFilesFromZip(xmls.buffer, "Emitidas_Mercado_Livre/NF-e de venda/XML/Autorizadas")


    console.log(pdfFiles.slice(0, 2))
    console.log(xmlFiles.slice(0, 2))
    console.log(normalizedNfes.slice(0, 2))


    const salesFetch = await PocketBaseRepository.createBatch('sales', normalizedSales);
    const nfesFetch = await PocketBaseRepository.createBatch('nfes', normalizedNfes);
    return { STATUS: "OK" };
}