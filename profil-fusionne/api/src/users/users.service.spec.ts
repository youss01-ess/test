import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

const mockUser: User = {
  id: 'user-1',
  email: 'test@mail.com',
  passwordHash: '$argon2id$...',
  firstName: 'Jean',
  lastName: 'Dupont',
  age: 30,
  birthDate: null,
  sex: null,
  latitude: null,
  longitude: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('retourne l’utilisateur trouvé par son email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@mail.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@mail.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('retourne null si l’utilisateur n’existe pas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('inconnu@mail.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('retourne l’utilisateur trouvé par son id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('retourne null si l’id n’existe pas', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('inconnu');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('crée et retourne un nouvel utilisateur', async () => {
      prisma.user.create.mockResolvedValue(mockUser);

      const input = {
        email: 'test@mail.com',
        passwordHash: '$argon2id$...',
        firstName: 'Jean',
        lastName: 'Dupont',
        age: 30,
      };

      const result = await service.create(input);

      expect(prisma.user.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('met à jour et retourne l’utilisateur', async () => {
      const updated = { ...mockUser, firstName: 'Léa' };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.update('user-1', { firstName: 'Léa' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { firstName: 'Léa' },
      });
      expect(result).toEqual(updated);
    });
  });
});
