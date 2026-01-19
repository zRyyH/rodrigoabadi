import { sales_map, nfes_map, sales_normalizer, nfes_normalizer } from "../constants/map.js"
import { PocketBaseRepository } from "../repositories/pocketbase.repository.js"
import { linkFilesToNfes, linkNfesToSales } from "../funcs/linkers.js"
import { processNfes, processSales } from "../funcs/process.js"
import { extractFilesFromZip } from "../funcs/extractFiles.js"
import { mapNfesWithOldIds } from "../funcs/mapNfes.js"
import { normalizer } from "../funcs/normalizerData.js"
import { parseXlsx } from "../funcs/parseXlsx.js"
import { mapData } from "../funcs/mapData.js"

export async function processFiles({ sales, nfes, pdfs, xmls }) {
    const oldSales = await PocketBaseRepository.getAll("sales")
    const oldNfes = await PocketBaseRepository.getAll("nfes")

    const salesParsed = parseXlsx(sales.buffer)["Vendas BR"]
    const nfesParsed = parseXlsx(nfes.buffer)["Invoices"]

    const mappedSales = mapData(salesParsed, sales_map).slice(5)
    const mappedNfes = mapData(nfesParsed, nfes_map)

    const normalizedSales = normalizer(mappedSales, sales_normalizer)
    const normalizedNfes = normalizer(mappedNfes, nfes_normalizer)

    const pdfFiles = extractFilesFromZip(pdfs.buffer, "Emitidas_Mercado_Livre/NF-e de venda/PDF/Autorizadas")
    const xmlFiles = extractFilesFromZip(xmls.buffer, "Emitidas_Mercado_Livre/NF-e de venda/XML/Autorizadas")

    const linkedNfes = linkFilesToNfes(pdfFiles, xmlFiles, normalizedNfes)
    const mapedNfes = mapNfesWithOldIds(oldNfes, linkedNfes)
    const linkedSales = linkNfesToSales(mapedNfes, normalizedSales)

    const { toUpdateNfes, toCreateNfes } = processNfes(oldNfes, linkedNfes);
    const { toUpdateSales, toCreateSales } = processSales(oldSales, linkedSales);

    console.log("=====================================================")
    await PocketBaseRepository.updateBatch('nfes', toUpdateNfes)
    console.log("UPDATE NFES:", toUpdateNfes.slice(0, 2))

    await PocketBaseRepository.updateBatch('sales', toUpdateSales)
    console.log("UPDATE SALES:", toUpdateSales.slice(0, 2))

    await PocketBaseRepository.createWithFiles('nfes', toCreateNfes)
    console.log("CREATE NFES:", toCreateNfes.slice(0, 2))

    await PocketBaseRepository.createBatch('sales', toCreateSales)
    console.log("CREATE SALES:", toCreateSales.slice(0, 2))
    console.log("=====================================================")

    return { STATUS: "OK" };
}