class Error(Exception):
    """Base class for exceptions in this module."""
    pass

class ImageNotFound(Error):
    """Exception raised when a Docker image is not found.

    Attributes:
        message -- explanation of the error
    """

    def __init__(self, message):
        self.message = message
