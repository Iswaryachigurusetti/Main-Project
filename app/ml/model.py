import os
import joblib

class MLArtifactManager:
    _instance = None

    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.load_artifacts()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_artifacts(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "classifier.pkl")
        vec_path = os.path.join(base_dir, "models", "vectorizer.pkl")

        if os.path.exists(model_path) and os.path.exists(vec_path):
            self.model = joblib.load(model_path)
            self.vectorizer = joblib.load(vec_path)
            print("Loaded classifier and vectorizer successfully.")
        else:
            print("Notice: Model artifacts not found. Run `python training/train_model.py` to train.")

artifact_manager = MLArtifactManager.get_instance()
