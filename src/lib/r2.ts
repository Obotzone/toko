export async function uploadImage(bucket: R2Bucket, filename: string, contentType: string, body: ArrayBuffer): Promise<string> {
  const key = filename;
  await bucket.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: { uploadedAt: new Date().toISOString() }
  });
  return key;
}

export async function getImage(bucket: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return bucket.get(key);
}

export async function deleteImage(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}
