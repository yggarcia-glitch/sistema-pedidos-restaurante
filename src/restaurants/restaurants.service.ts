import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindRestaurantsQueryDto } from './dto/find-restaurants-query.dto';
import { NearbyQueryDto } from './dto/nearby-query.dto';
import { RestaurantScheduleDto } from './dto/restaurant-schedule.dto';
import { haversineDistance } from '../common/utils/geo.util';
import { computeIsOpenNow } from '../common/utils/schedule.util';

const OWNER_SELECT = { id: true, name: true, email: true, phone: true };

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica propiedad del restaurante. ADMIN omite la verificación.
   * Reutilizable desde CategoriesService y ProductsService.
   */
  async verifyOwnership(restaurantId: string, userId: string, userRole: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    if (userRole === Role.ADMIN) return restaurant;
    if (restaurant.ownerId !== userId) {
      throw new ForbiddenException('No eres el dueño de este restaurante');
    }
    return restaurant;
  }

  async create(dto: CreateRestaurantDto, requesterId: string, requesterRole: string) {
    const { ownerId: dtoOwnerId, ...rest } = dto;

    // Un VENDEDOR solo puede crear su propio restaurante; un ADMIN puede
    // asignarlo a cualquier vendedor indicando ownerId.
    const ownerId =
      requesterRole === Role.ADMIN && dtoOwnerId ? dtoOwnerId : requesterId;

    if (requesterRole === Role.ADMIN) {
      const owner = await this.prisma.user.findUnique({
        where: { id: ownerId },
        include: { rol: true },
      });
      if (!owner || owner.rol.nombre !== Role.VENDEDOR) {
        throw new BadRequestException('El dueño debe ser un usuario con rol VENDEDOR');
      }
    }

    const existing = await this.prisma.restaurant.findUnique({
      where: { ownerId },
    });
    if (existing) {
      throw new ConflictException('Ese vendedor ya tiene un restaurante registrado');
    }
    const restaurant = await this.prisma.restaurant.create({
      data: { ...rest, ownerId },
      include: { owner: { select: OWNER_SELECT } },
    });

    // No se siembran categorías propias: todo restaurante nuevo ya dispone de
    // las categorías genéricas globales, y puede crear las suyas si lo desea.
    return this.findOne(restaurant.id);
  }

  async findAll(query: FindRestaurantsQueryDto) {
    const { city, isOpen, minRating, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (isOpen !== undefined) where.isOpen = isOpen;
    if (minRating !== undefined) where.rating = { gte: minRating };

    const [data, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where,
        skip,
        take: limit,
        include: {
          owner: { select: OWNER_SELECT },
          tags: { include: { tag: true } },
          categories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          schedules: { orderBy: { dayOfWeek: 'asc' } },
          _count: { select: { products: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.restaurant.count({ where }),
    ]);

    // isOpenNow: estado real según horario (no el flag manual, que siempre es true)
    const withStatus = data.map((r) => ({
      ...r,
      isOpenNow: computeIsOpenNow(r.isOpen, r.schedules),
    }));

    return { data: withStatus, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findNearby(query: NearbyQueryDto) {
    const { lat, lng, radiusKm = 5 } = query;

    const restaurants = await this.prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        owner: { select: OWNER_SELECT },
        tags: { include: { tag: true } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
      },
    });

    // Filtra por radio usando Haversine y ordena por distancia ascendente
    return restaurants
      .map((r) => ({
        ...r,
        isOpenNow: computeIsOpenNow(r.isOpen, r.schedules),
        distanceKm:
          Math.round(haversineDistance(lat, lng, r.latitude, r.longitude) * 100) / 100,
      }))
      .filter((r) => r.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: { select: OWNER_SELECT },
        categories: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        tags: { include: { tag: true } },
        _count: { select: { reviews: true, products: true } },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    return { ...restaurant, isOpenNow: computeIsOpenNow(restaurant.isOpen, restaurant.schedules) };
  }

  async update(id: string, dto: UpdateRestaurantDto, userId: string, userRole: string) {
    await this.verifyOwnership(id, userId, userRole);
    return this.prisma.restaurant.update({
      where: { id },
      data: dto,
      include: { owner: { select: OWNER_SELECT } },
    });
  }

  async remove(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    return this.prisma.restaurant.delete({ where: { id } });
  }

  async toggleOpen(id: string, userId: string, userRole: string) {
    const restaurant = await this.verifyOwnership(id, userId, userRole);
    return this.prisma.restaurant.update({
      where: { id },
      data: { isOpen: !restaurant.isOpen },
      select: { id: true, name: true, isOpen: true },
    });
  }

  // ─── Horarios ─────────────────────────────────────────────────────────────

  async setSchedules(
    restaurantId: string,
    dto: RestaurantScheduleDto,
    userId: string,
    userRole: string,
  ) {
    await this.verifyOwnership(restaurantId, userId, userRole);

    // Reemplaza todos los horarios en una transacción atómica
    await this.prisma.$transaction([
      this.prisma.restaurantSchedule.deleteMany({ where: { restaurantId } }),
      this.prisma.restaurantSchedule.createMany({
        data: dto.schedules.map((s) => ({
          restaurantId,
          dayOfWeek: s.dayOfWeek,
          openTime: s.openTime,
          closeTime: s.closeTime,
          isClosed: s.isClosed ?? false,
        })),
      }),
    ]);

    return this.prisma.restaurantSchedule.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async getSchedules(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');

    const schedules = await this.prisma.restaurantSchedule.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return { schedules, isOpenNow: computeIsOpenNow(restaurant.isOpen, schedules) };
  }
}
