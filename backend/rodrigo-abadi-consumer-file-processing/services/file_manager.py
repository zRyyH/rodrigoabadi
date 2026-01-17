from logging_config import logger, log_step, log_result
from services.file_service import FileService


class FileManager:
    """Responsible for processing and uploading files."""

    def __init__(self, data, buffers, api):
        self.buffers = buffers
        self.data = data
        self.api = api

    def process_and_upload(self):
        """Process local files and upload only non-duplicated ones."""

        log_step(1, 3, "Processando arquivos locais")
        local_files = self._process_local_files()
        log_result("Arquivos processados", len(local_files))

        log_step(2, 3, "Verificando duplicatas")
        selected_files = self._filter_duplicates(local_files)
        log_result("Arquivos únicos", len(selected_files))

        log_step(3, 3, "Upload para Directus")
        result = self._upload_files(selected_files)

        return result

    def _process_local_files(self):
        """Process and rename local files."""
        file_service = FileService(self.data, self.buffers)
        local_files = file_service.process()
        return local_files

    def _filter_duplicates(self, local_files):
        """Remove files that already exist in Directus."""
        directus_files = self.api.fetch_files()
        existing_names = {file["filename_download"] for file in directus_files}

        selected_files = [
            file for file in local_files if file["nome"] not in existing_names
        ]

        duplicates_count = len(local_files) - len(selected_files)
        if duplicates_count > 0:
            log_result("Duplicatas removidas", duplicates_count)

        return selected_files

    def _upload_files(self, selected_files):
        """Upload selected files to Directus."""
        if selected_files:
            result = self.api.upload_files(selected_files)
            log_result("Arquivos enviados", len(selected_files))
            return result
        else:
            logger.info("  → Nenhum arquivo novo para enviar")
            return None
