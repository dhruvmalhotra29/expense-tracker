import os
import requests
import json

class RedisClient:
    def __init__(self):
        self.url = os.getenv("UPSTASH_REDIS_REST_URL")
        self.token = os.getenv("UPSTASH_REDIS_REST_TOKEN")

        self.headers = {
            "Authorization": f"Bearer {self.token}"
        }

    # ---------------- GET ----------------
    def get(self, key):
        res = requests.get(
            f"{self.url}/get/{key}",
            headers=self.headers
        ).json()
        return res.get("result")

    # ---------------- SET ----------------
    def set(self, key, value, ex=None):
        url = f"{self.url}/set/{key}/{value}"

        if ex:
            url += f"/ex/{ex}"

        res = requests.get(url, headers=self.headers).json()
        return res.get("result")

    # ---------------- SETEX ----------------
    def setex(self, key, seconds, value):
        return self.set(key, value, ex=seconds)

    # ---------------- DELETE (supports multiple keys) ----------------
    def delete(self, *keys):
        if not keys:
            return 0

        # Upstash expects comma-separated or multiple calls
        res = requests.get(
            f"{self.url}/del/{','.join(keys)}",
            headers=self.headers
        ).json()

        return res.get("result")

    # ---------------- KEYS ----------------
    def keys(self, pattern="*"):
        res = requests.get(
            f"{self.url}/keys/{pattern}",
            headers=self.headers
        ).json()

        return res.get("result")


redis_client = RedisClient()