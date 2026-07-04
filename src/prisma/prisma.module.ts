import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global hace que PrismaService esté disponible en toda la app sin importar PrismaModule en cada módulo
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
