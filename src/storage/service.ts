import config from '@/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export class StorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    if (!config.AWS_REGION || !config.AWS_BUCKET_NAME) {
      throw new Error('AWS_REGION and AWS_BUCKET_NAME must be set');
    }

    this.client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID!,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucket = config.AWS_BUCKET_NAME;
  }

  /**
   * Uploads a file to S3 and returns its public URL
   * @param key The object key (filename in the bucket)
   * @param body The file content (Buffer, Uint8Array, Blob, or stream)
   * @param contentType Optional MIME type
   */
  public async createItem(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType?: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read', // allows public access (optional, depends on your bucket policy)
    });

    await this.client.send(command);

    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}

export const storageService = new StorageService();
export type IStorageService = typeof storageService;
