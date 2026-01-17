from logging_config import logger, log_result
from integration.directus import Directus


class ApiService:
    def __init__(self):
        self.directus = Directus()

    def fetch_files(self):
        """Fetch all files from Directus."""
        try:
            result = self.directus.get(
                collection="files",
                params={"limit": -1, "fields": ["filename_download", "id"]},
            )

            files_count = len(result["data"])
            log_result("Arquivos no Directus", files_count)

            return result["data"]

        except Exception as e:
            logger.error(f"  ❌ Erro ao buscar arquivos: {str(e)}")
            raise

    def upload_files(self, files):
        """Upload files to Directus."""
        if not files:
            raise ValueError("Nenhum arquivo foi fornecido para upload.")

        try:
            file_ids = self.directus.uploadFiles(files)
            return file_ids

        except Exception as e:
            logger.error(f"  ❌ Falha no upload: {str(e)}")
            raise
