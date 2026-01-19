import AdmZip from 'adm-zip';

export function extractFilesFromZip(buffer, targetFolder) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    const files = [];
    const normalizedTarget = targetFolder.replace(/\\/g, '/').replace(/\/$/, '');

    for (const entry of entries) {
        if (entry.isDirectory) continue;

        const entryPath = entry.entryName.replace(/\\/g, '/');
        const entryDir = entryPath.substring(0, entryPath.lastIndexOf('/'));

        if (entryDir.endsWith(normalizedTarget)) {
            files.push({
                name: entry.name,
                data: entry.getData()
            });
        }
    }

    return files;
}