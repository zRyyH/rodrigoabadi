from logging_config import logger, log_result
from zipfile import ZipFile
from pathlib import Path
from io import BytesIO
import requests


class FileService:
    """Service for downloading, extracting and renaming files from zip archives."""

    FILE_SUFFIXES = {"xml": "-procNFe", "pdf": "-DANFE"}
    BASE_PATH = "Emitidas_Mercado_Livre/NF-e de venda"

    def __init__(self, data, buffers):
        self.buffers = buffers
        self.data = data
        self.files = []

    def process(self):
        """Main processing pipeline: download, extract and rename files."""

        self._download_files()
        self._extract_files()
        renamed_files = self._rename_files()

        return renamed_files

    def _download_files(self):
        """Download files from provided URLs and store in buffers."""
        file_count = len(self.data["files"])
        logger.info(f"  • Baixando {file_count} arquivo(s)...")

        for file_key, file_info in self.data["files"].items():
            try:
                response = requests.get(file_info["downloadUrl"], timeout=30)
                response.raise_for_status()
                self.buffers[file_key] = BytesIO(response.content)

            except requests.exceptions.RequestException as e:
                logger.error(f"  ❌ Erro ao baixar {file_key}: {str(e)}")
                raise

        log_result("Downloads concluídos", file_count)

    def _extract_files(self):
        """Extract PDF and XML files from zip archives."""
        logger.info(f"  • Extraindo arquivos...")

        for file_type in ["pdf", "xml"]:
            path = f"{self.BASE_PATH}/{file_type.upper()}/Autorizadas"
            zip_content = self.buffers[f"{file_type}_zip"].getvalue()

            files_before = len(self.files)
            self._extract_from_zip(zip_content, path)
            files_extracted = len(self.files) - files_before

            log_result(f"Arquivos {file_type.upper()}", files_extracted)

    def _extract_from_zip(self, zip_content, path):
        """Extract files from a zip archive that match the given path."""
        try:
            with ZipFile(BytesIO(zip_content)) as zip_file:
                normalized_path = Path(path).as_posix()

                for filename in zip_file.namelist():
                    if self._is_valid_file(filename, normalized_path):
                        self.files.append(
                            {
                                "nome": Path(filename).name,
                                "buffer": BytesIO(zip_file.read(filename)),
                            }
                        )

        except Exception as e:
            logger.error(f"  ❌ Erro ao extrair zip: {str(e)}")
            raise

    def _is_valid_file(self, filename, path):
        """Check if file is valid (starts with path and is not a directory)."""
        return filename.startswith(path) and not filename.endswith("/")

    def _rename_files(self):
        """Rename all extracted files removing prefixes and suffixes."""
        logger.info(f"  • Renomeando {len(self.files)} arquivo(s)...")

        renamed_files = [self._rename_single_file(file) for file in self.files]
        log_result("Arquivos renomeados", len(renamed_files))

        return renamed_files

    def _rename_single_file(self, file):
        """Rename a single file by removing unnecessary prefixes and suffixes."""
        original_name = file["nome"]
        name = original_name

        # Remove prefix before underscore if exists
        if "_" in name:
            name = name.split("_", 1)[1]

        # Remove file type suffix
        extension = name.split(".")[-1]
        name = name.replace(self.FILE_SUFFIXES[extension], "")

        return {"nome": name, "buffer": file["buffer"]}
