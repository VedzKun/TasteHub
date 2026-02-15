#!/usr/bin/env python3
"""TasteHub model inference entrypoint.

Reads a single JSON object from stdin and returns a JSON prediction payload.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


MODEL_FILE = "tastehub_engagement_rate_model.pkl"
FEATURE_FILE = "tastehub_features.json"

NUMERIC_FEATURES = {
    "hashtags_count",
    "post_hour",
    "caption_length",
    "creative_score",
    "posts_last_7_days",
    "follower_count",
}


def read_stdin_json() -> dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        raise ValueError("Empty stdin payload.")

    parsed = json.loads(raw)
    if not isinstance(parsed, dict):
        raise ValueError("Payload must be a JSON object.")
    return parsed


def normalize_input(payload: dict[str, Any], feature_order: list[str]) -> dict[str, Any]:
    missing = [key for key in feature_order if key not in payload]
    if missing:
        raise ValueError(f"Missing required features: {', '.join(missing)}")

    normalized: dict[str, Any] = {}
    for feature in feature_order:
        value = payload.get(feature)
        if feature in NUMERIC_FEATURES:
            if value is None or value == "":
                raise ValueError(f"Feature '{feature}' must be numeric.")
            normalized[feature] = float(value)
        else:
            if value is None:
                raise ValueError(f"Feature '{feature}' must be a string.")
            normalized[feature] = str(value)

    # Keep hour in a valid range.
    normalized["post_hour"] = max(0, min(23, int(round(normalized["post_hour"]))))
    normalized["hashtags_count"] = max(0, int(round(normalized["hashtags_count"])))
    normalized["caption_length"] = max(0, int(round(normalized["caption_length"])))
    normalized["posts_last_7_days"] = max(0, int(round(normalized["posts_last_7_days"])))
    normalized["follower_count"] = max(0, int(round(normalized["follower_count"])))
    normalized["creative_score"] = max(0.0, min(10.0, float(normalized["creative_score"])))
    return normalized


def main() -> int:
    try:
        base_dir = Path(__file__).resolve().parent
        model_path = base_dir / MODEL_FILE
        features_path = base_dir / FEATURE_FILE

        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        if not features_path.exists():
            raise FileNotFoundError(f"Feature file not found: {features_path}")

        required_features = json.loads(features_path.read_text(encoding="utf-8"))
        if not isinstance(required_features, list):
            raise ValueError(f"Invalid feature file: {features_path}")

        payload = read_stdin_json()
        normalized = normalize_input(payload, required_features)

        model = joblib.load(model_path)
        frame = pd.DataFrame([normalized], columns=required_features)
        prediction = float(model.predict(frame)[0])

        result = {
            "prediction": prediction,
            "input": normalized,
            "model": MODEL_FILE,
        }
        print(json.dumps(result))
        return 0
    except Exception as exc:  # noqa: BLE001 - return machine-readable error
        error_payload = {"error": str(exc)}
        print(json.dumps(error_payload), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
