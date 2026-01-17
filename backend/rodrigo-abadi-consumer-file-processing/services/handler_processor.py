from logging_config import logger, log_start, log_end
from services.file_manager import FileManager
from services.api_service import ApiService


class MessageProcessor:
    """
    Main orchestrator for the data processing pipeline.
    Coordinates different stages without implementing business logic.
    """

    def __init__(self, data):
        self.data = data
        self.api = ApiService()
        self.buffers = {}
        self.file_manager = FileManager(self.data, self.buffers, self.api)

    def process_data(self):
        """Main data processing pipeline."""
        log_start("PIPELINE DE PROCESSAMENTO")

        try:
            result = self.file_manager.process_and_upload()
            log_end("PIPELINE DE PROCESSAMENTO", success=True)
            return result

        except Exception as e:
            logger.error(f"❌ Pipeline falhou: {str(e)}", exc_info=True)
            log_end("PIPELINE DE PROCESSAMENTO", success=False)
            raise
