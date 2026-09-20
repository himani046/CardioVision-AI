import cv2
import numpy as np

def read_grayscale(image_bytes: bytes) -> np.ndarray:
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_GRAYSCALE)
    if image is None:
        raise ValueError("Invalid or unreadable image.")
    return image

def enhance_angiogram(image: np.ndarray) -> np.ndarray:
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(image)
    return cv2.GaussianBlur(enhanced, (3, 3), 0)

def encode_png(image: np.ndarray) -> bytes:
    ok, encoded = cv2.imencode(".png", image)
    if not ok:
        raise ValueError("Failed to encode image.")
    return encoded.tobytes()
