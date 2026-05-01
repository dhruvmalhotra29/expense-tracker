import os
import requests
import json
import redis

class RedisClient:
    def __init__(self):
        self.env = os.getenv("ENV", "local")

        if self.env == "production":
            self.url = os.getenv("UPSTASH_REDIS_REST_URL")
            self.token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
            self.headers = {
                "Authorization": f"Bearer {self.token}"
            }

        else:
            self.client = redis.Redis(
                host = "localhost",
                port=6379,
                db=0,
                decode_responses=True
            )

    # ---------------- GET ----------------
    def get(self, key):
        if self.env == "production":
            res = requests.get(
                f"{self.url}/get/{key}",
                headers=self.headers
            ).json()
            return res.get("result")
    
        return self.client.get(key)

    # ---------------- SET ----------------
    def set(self, key, value, ex=None):
        if self.env == "production":
            url = f"{self.url}/set/{key}/{value}"
            if ex:
                url += f"/ex/{ex}"

            res = requests.get(url, headers=self.headers).json()
            return res.get("result")
    
        return self.client.set(key, value, ex=ex)
    
    # ---------------- SETEX ----------------
    def setex(self, key, seconds, value):
        return self.set(key, value, ex=seconds)

    # ---------------- DELETE (supports multiple keys) ----------------
    def delete(self, *keys):
        if not keys:
            return 0

        if self.env == "production":
            # Upstash expects keys as path segments (/del/key1/key2), not comma-separated
            res = requests.get(
                f"{self.url}/del/" + "/".join(keys),
                headers=self.headers
            ).json()

            return res.get("result")    
    
        return self.client.delete(*keys)
    
    # ---------------- KEYS ----------------
    def keys(self, pattern="*"):
        if self.env == "production":
            res = requests.get(
                f"{self.url}/keys/{pattern}",
                headers=self.headers
            ).json()
            return res.get("result")
        
        return self.client.keys(pattern)    


redis_client = RedisClient()