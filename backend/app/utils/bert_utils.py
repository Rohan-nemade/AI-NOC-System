from transformers import AutoTokenizer, AutoModel
import torch
import torch.nn.functional as F

# Use a lightweight model for sentence embeddings
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

def embed_text(text: str) -> torch.Tensor:
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    outputs = model(**inputs)
    # Mean Pooling
    embeddings = outputs.last_hidden_state.mean(dim=1)
    # Normalize
    return F.normalize(embeddings, p=2, dim=1)

def cosine_similarity(vec1: torch.Tensor, vec2: torch.Tensor) -> float:
    return F.cosine_similarity(vec1, vec2).item()

def compute_bert_similarity(text1: str, text2: str) -> float:
    emb1 = embed_text(text1)
    emb2 = embed_text(text2)
    return cosine_similarity(emb1, emb2)
