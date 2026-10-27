import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { UserService } from './user.service.js';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
