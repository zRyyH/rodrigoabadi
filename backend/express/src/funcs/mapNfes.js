export function mapNfesWithOldIds(old_nfes, new_nfes) {
    const oldNfesByKey = new Map(old_nfes.map(nfe => [nfe.nfe_key, nfe.id]));

    return new_nfes.map(nfe => ({
        ...nfe,
        id: oldNfesByKey.get(nfe.nfe_key) || nfe.id
    }));
}