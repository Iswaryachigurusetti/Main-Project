import os
import re
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier, PassiveAggressiveClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def clean_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    cleaned = text.lower()
    cleaned = re.sub(r'https?://\S+|www\.\S+', '', cleaned)
    cleaned = re.sub(r'<.*?>', '', cleaned)
    cleaned = re.sub(r'[^\w\s\$\₹\%\d\.\-]', ' ', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

def load_datasets(data_dir: str):
    files = {
        'politifact_fake.csv': 0,
        'politifact_real.csv': 1,
        'gossipcop_fake.csv': 0,
        'gossipcop_real.csv': 1
    }
    dfs = []
    for filename, label in files.items():
        filepath = os.path.join(data_dir, filename)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Missing required dataset: {filepath}")
        sub_df = pd.read_csv(filepath)
        sub_df['label'] = label
        sub_df['source_dataset'] = filename
        dfs.append(sub_df)

    df = pd.concat(dfs, ignore_index=True)
    df = df.dropna(subset=['title'])
    df['title'] = df['title'].astype(str).str.strip()
    df = df[df['title'] != '']
    return df

def train_and_evaluate():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, '..', 'data')
    models_dir = os.path.join(current_dir, '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    print("Loading datasets from:", data_dir)
    df = load_datasets(data_dir)
    print(f"Total clean samples: {len(df)}")
    print(f"Class distribution: Fake (0) = {sum(df['label'] == 0)}, Real (1) = {sum(df['label'] == 1)}")

    df['clean_title'] = df['title'].apply(clean_text)

    X_train, X_test, y_train, y_test = train_test_split(
        df['clean_title'], df['label'], test_size=0.2, random_state=42, stratify=df['label']
    )

    print("\nExtracting TF-IDF Features...")
    vectorizer = TfidfVectorizer(max_features=10000, ngram_range=(1, 2), stop_words='english', sublinear_tf=True)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("\n--- Training Candidate 1: SGDClassifier (loss='log_loss') ---")
    sgd = SGDClassifier(loss='log_loss', max_iter=1000, random_state=42, class_weight='balanced')
    sgd.fit(X_train_vec, y_train)
    y_pred_sgd = sgd.predict(X_test_vec)

    print(f"Accuracy : {accuracy_score(y_test, y_pred_sgd):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred_sgd, average='macro'):.4f}")
    print(f"Recall   : {recall_score(y_test, y_pred_sgd, average='macro'):.4f}")
    print(f"F1-Score : {f1_score(y_test, y_pred_sgd, average='macro'):.4f}")

    print("\n--- Training Candidate 2: Passive-Aggressive Classifier ---")
    pac = PassiveAggressiveClassifier(max_iter=1000, random_state=42, class_weight='balanced')
    pac.fit(X_train_vec, y_train)
    y_pred_pac = pac.predict(X_test_vec)

    print(f"Accuracy : {accuracy_score(y_test, y_pred_pac):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred_pac, average='macro'):.4f}")
    print(f"Recall   : {recall_score(y_test, y_pred_pac, average='macro'):.4f}")
    print(f"F1-Score : {f1_score(y_test, y_pred_pac, average='macro'):.4f}")

    print("\nSaving trained artifacts...")
    model_path = os.path.join(models_dir, 'classifier.pkl')
    vec_path = os.path.join(models_dir, 'vectorizer.pkl')

    joblib.dump(sgd, model_path)
    joblib.dump(vectorizer, vec_path)
    print(f"Artifacts successfully saved to:\n- {model_path}\n- {vec_path}")

if __name__ == '__main__':
    train_and_evaluate()
