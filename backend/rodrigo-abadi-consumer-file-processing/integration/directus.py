from config.settings import (
    DIRECTUS_API_URL,
    DIRECTUS_STATIC_TOKEN,
    UPLOAD_FILES_BATCH_SIZE,
)
from logging_config import logger
from typing import List, Dict
import requests


class Directus:
    def __init__(self):
        self.url = DIRECTUS_API_URL
        self.headers = {"Authorization": f"Bearer {DIRECTUS_STATIC_TOKEN}"}
        self.batch_size = UPLOAD_FILES_BATCH_SIZE

    def get(self, collection: str, params: dict = None):
        """Busca por items no directus e retorna um array de items."""
        try:
            response = requests.get(
                f"{self.url}/{collection}",
                headers=self.headers,
                params=params,
                timeout=300,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"  ❌ Erro ao buscar collection '{collection}': {str(e)}")
            raise

    def _upload_batch(self, batch: List[Dict]) -> List[str]:
        """Faz upload de um lote de arquivos."""
        files = [
            ("file[]", (item["nome"], item["buffer"], "application/octet-stream"))
            for item in batch
        ]

        try:
            response = requests.post(
                f"{self.url}/files", headers=self.headers, files=files, timeout=300
            )
            response.raise_for_status()

            file_ids = [item["id"] for item in response.json()["data"]]
            logger.info(
                f"  ✅ Upload de {len(file_ids)} arquivos concluído com sucesso"
            )
            return file_ids

        except requests.exceptions.RequestException as e:
            logger.error(f"  ❌ Erro no upload do lote: {str(e)}")
            raise

    def uploadFiles(self, buffers: List[Dict]) -> List[str]:
        """
        Faz upload de múltiplos arquivos para Directus em lotes.

        Args:
            buffers: Lista de dicionários com 'nome' e 'buffer'

        Returns:
            Lista com todos os IDs dos arquivos enviados
        """
        if not buffers:
            logger.warning("  ⚠️ Nenhum arquivo para upload")
            return []

        total_files = len(buffers)
        all_file_ids = []

        logger.info(
            f"  📤 Iniciando upload de {total_files} arquivos em lotes de {self.batch_size}"
        )

        # Divide os buffers em lotes
        for i in range(0, total_files, self.batch_size):
            batch = buffers[i : i + self.batch_size]
            batch_number = (i // self.batch_size) + 1
            total_batches = (total_files + self.batch_size - 1) // self.batch_size

            logger.info(
                f"  📦 Processando lote {batch_number}/{total_batches} ({len(batch)} arquivos)"
            )

            try:
                file_ids = self._upload_batch(batch)
                all_file_ids.extend(file_ids)
            except Exception as e:
                logger.error(f"  ❌ Falha no lote {batch_number}: {str(e)}")
                # Você pode escolher se quer continuar ou interromper aqui
                raise

        logger.info(
            f"  ✅ Upload completo: {len(all_file_ids)} arquivos enviados com sucesso"
        )
        return all_file_ids