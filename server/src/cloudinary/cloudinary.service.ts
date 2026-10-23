import sharp from 'sharp';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(
    buffer: Buffer,
    folder: string,
  ): Promise<UploadApiResponse> {
    let processedImage: Buffer;

    try {
      processedImage = await sharp(buffer, {
        failOn: 'warning',
        limitInputPixels: 40_000_000,
        pages: 1,
      })
        .rotate()
        .resize(512, 512, {
          fit: 'cover',
          position: 'attention',
        })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        'Файл повреждён или не является корректным изображением',
      );
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error('Cloudinary не вернул результат загрузки'));
            return;
          }

          resolve(result);
        },
      );

      stream.end(processedImage);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(
        `Не удалось удалить изображение из Cloudinary: ${result.result}`,
      );
    }
  }
}
