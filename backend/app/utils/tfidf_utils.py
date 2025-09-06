from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json

def compute_tfidf_vectors(documents: list[str]) -> np.ndarray:
    """Compute TF-IDF vectors for all input documents."""
    v = TfidfVectorizer()
    return v.fit_transform(documents), v

def compute_single_tfidf_vector(document: str) -> np.ndarray:
    """Compute TF-IDF vector for a single document using its own fitted vectorizer."""
    v = TfidfVectorizer()
    return v.fit_transform([document]), v

def vector_to_json(vector) -> str:
    """Convert sparse TF-IDF vector to JSON serializable list."""
    return json.dumps(vector.toarray().tolist())

def json_to_vector(json_str: str) -> np.ndarray:
    """Convert JSON string back to numpy array."""
    return np.array(json.loads(json_str))

def compare_vectors(vec1, vec2) -> float:
    """Compute cosine similarity between two sparse vectors."""
    sim = cosine_similarity(vec1, vec2)
    return sim[0][0]  # for single vectors
