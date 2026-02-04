import { Test, TestingModule } from '@nestjs/testing';
import { CyclesService } from './cycles.service';
import { DatabaseService } from '../database/database.service';
import { createMockContext } from '../../test/prisma.mock';

describe('CyclesService', () => {
  let service: CyclesService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const mockContext = createMockContext();

    const mockDbService = {
      client: mockContext.prisma,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CyclesService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<CyclesService>(CyclesService);
    dbService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('belongsToUser', () => {
    it('should return false if userId or cycleId is missing', async () => {
      const result = await service.belongsToUser('', 'cycleId');
      expect(result).toBe(false);

      const result2 = await service.belongsToUser('userId', '');
      expect(result2).toBe(false);
    });

    it('should return cycle if it belongs to user', async () => {
      const mockCycle = { id: 'cycleId', userId: 'userId' };
      jest
        .spyOn(dbService.client.cycle, 'findFirst')
        .mockResolvedValue(mockCycle);

      const result = await service.belongsToUser('userId', 'cycleId');
      expect(result).toBe(mockCycle);
      expect(dbService.client.cycle.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'cycleId',
        },
      });
    });

    it('should return null if cycle does not belong to user', async () => {
      const mockCycle = { id: 'cycleId', userId: 'otherUserId' };
      jest
        .spyOn(dbService.client.cycle, 'findFirst')
        .mockResolvedValue(mockCycle);

      const result = await service.belongsToUser('userId', 'cycleId');
      expect(result).toBe(null);
    });

    it('should return null if cycle not found', async () => {
      jest.spyOn(dbService.client.cycle, 'findFirst').mockResolvedValue(null);

      const result = await service.belongsToUser('userId', 'cycleId');
      expect(result).toBe(null);
    });
  });

  describe('createCycle', () => {
    it('should create a cycle successfully', async () => {
      const mockCycle = {
        id: 'cycleId',
        label: 'Test Cycle',
        duration: 30,
        isActive: false,
        userId: 'userId',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(dbService.client.cycle, 'create').mockResolvedValue(mockCycle);

      const result = await service.createCycle(
        { label: 'Test Cycle', duration: 30 },
        'userId',
      );
      expect(result).toBe(mockCycle);
      expect(dbService.client.cycle.create).toHaveBeenCalledWith({
        data: {
          label: 'Test Cycle',
          duration: 30,
          isActive: false,
          userId: 'userId',
        },
      });
    });

    it('should create a cycle with isActive true when specified', async () => {
      const mockCycle = {
        id: 'cycleId',
        label: 'Test Cycle',
        duration: 30,
        isActive: true,
        userId: 'userId',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(dbService.client.cycle, 'create').mockResolvedValue(mockCycle);

      const result = await service.createCycle(
        { label: 'Test Cycle', duration: 30, isActive: true },
        'userId',
      );
      expect(result).toBe(mockCycle);
      expect(dbService.client.cycle.create).toHaveBeenCalledWith({
        data: {
          label: 'Test Cycle',
          duration: 30,
          isActive: true,
          userId: 'userId',
        },
      });
    });

    it('should throw error on creation failure', async () => {
      jest
        .spyOn(dbService.client.cycle, 'create')
        .mockRejectedValue(new Error('DB Error'));

      await expect(
        service.createCycle({ label: 'Test Cycle', duration: 30 }, 'userId'),
      ).rejects.toThrow('Cycle creation failed');
    });
  });

  describe('getCyclesByUser', () => {
    it('should return cycles for user with items included', async () => {
      const mockCycles = [
        {
          id: 'cycleId',
          userId: 'userId',
          label: 'Test Cycle',
          duration: 30,
          isActive: false,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(dbService.client.cycle, 'findMany')
        .mockResolvedValue(mockCycles);

      const result = await service.getCyclesByUser('userId');
      expect(result).toBe(mockCycles);
      expect(dbService.client.cycle.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'userId',
        },
        include: {
          items: true,
        },
      });
    });

    it('should return empty array if no cycles found', async () => {
      jest.spyOn(dbService.client.cycle, 'findMany').mockResolvedValue([]);

      const result = await service.getCyclesByUser('userId');
      expect(result).toEqual([]);
    });
  });

  describe('getCycleById', () => {
    it('should return cycle with items if authorized', async () => {
      const mockCycle = {
        id: 'cycleId',
        userId: 'userId',
        label: 'Test Cycle',
        duration: 30,
        isActive: false,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(dbService.client.cycle, 'findFirst')
        .mockResolvedValue(mockCycle);
      jest
        .spyOn(dbService.client.cycle, 'findUnique')
        .mockResolvedValue(mockCycle);

      const result = await service.getCycleById('cycleId', 'userId');
      expect(result).toBe(mockCycle);
      expect(dbService.client.cycle.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'cycleId',
        },
        include: {
          items: true,
        },
      });
    });

    it('should throw error if unauthorized', async () => {
      jest.spyOn(dbService.client.cycle, 'findFirst').mockResolvedValue(null);

      await expect(service.getCycleById('cycleId', 'userId')).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  describe('updateCycle', () => {
    it('should update cycle if authorized', async () => {
      const existingCycle = {
        id: 'cycleId',
        userId: 'userId',
        label: 'Old Label',
        duration: 30,
        isActive: false,
      };
      const updatedCycle = {
        id: 'cycleId',
        userId: 'userId',
        label: 'Updated Label',
        duration: 30,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(dbService.client.cycle, 'findFirst')
        .mockResolvedValue(existingCycle);
      jest
        .spyOn(dbService.client.cycle, 'update')
        .mockResolvedValue(updatedCycle);

      const result = await service.updateCycle('cycleId', 'userId', {
        label: 'Updated Label',
      });
      expect(result).toBe(updatedCycle);
      expect(dbService.client.cycle.update).toHaveBeenCalledWith({
        where: {
          id: 'cycleId',
        },
        data: { label: 'Updated Label' },
      });
    });

    it('should throw error if unauthorized', async () => {
      jest.spyOn(dbService.client.cycle, 'findFirst').mockResolvedValue(null);

      await expect(
        service.updateCycle('cycleId', 'userId', { label: 'Updated' }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteCycle', () => {
    it('should delete cycle if authorized', async () => {
      const mockCycle = {
        id: 'cycleId',
        userId: 'userId',
        label: 'Test Cycle',
        duration: 30,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(dbService.client.cycle, 'findFirst')
        .mockResolvedValue(mockCycle);
      jest.spyOn(dbService.client.cycle, 'delete').mockResolvedValue(mockCycle);

      const result = await service.deleteCycle('cycleId', 'userId');
      expect(result).toBe(mockCycle);
      expect(dbService.client.cycle.delete).toHaveBeenCalledWith({
        where: {
          id: 'cycleId',
        },
      });
    });

    it('should throw error if unauthorized', async () => {
      jest.spyOn(dbService.client.cycle, 'findFirst').mockResolvedValue(null);

      await expect(service.deleteCycle('cycleId', 'userId')).rejects.toThrow(
        'Unauthorized',
      );
    });
  });
});
