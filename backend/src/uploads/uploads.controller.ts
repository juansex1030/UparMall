import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from '../supabase/supabase.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { memoryStorage } from 'multer';

@Controller('uploads')
export class UploadsController {
  constructor(private supabaseService: SupabaseService) {}

  @UseGuards(SupabaseAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for better security
    fileFilter: (req, file, cb) => {
      // 1. Check extension
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        return cb(new BadRequestException('Solo se permiten extensiones de imagen (jpg, jpeg, png, gif, svg, webp)'), false);
      }
      // 2. Check actual MIME type to prevent spoofing
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new BadRequestException('El contenido del archivo no es una imagen válida'), false);
      }
      cb(null, true);
    },
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Archivo no encontrado');
    }
    
    try {
      // Sanitize filename: remove special characters and spaces
      const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${Date.now()}-${sanitizedOriginalName}`;
      const bucket = 'pos-images';

      const { data, error } = await this.supabaseService.adminClient.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: publicData } = this.supabaseService.adminClient.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: publicData.publicUrl };
    } catch (error) {
      console.error('Error subiendo a Supabase:', error);
      throw new BadRequestException('Error al subir la imagen a la nube. Asegúrate de que el bucket "pos-images" sea público.');
    }
  }
}
