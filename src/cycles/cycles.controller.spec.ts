import { Test, TestingModule } from '@nestjs/testing';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';

describe('CyclesController', () => {
  let controller: CyclesController;
  let service: CyclesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CyclesController],
      providers: [
        {
          provide: CyclesService,
          useValue: {
            createCycle: jest.fn(),
            getCyclesByUser: jest.fn(),
            getCycleById: jest.fn(),
            updateCycle: jest.fn(),
            deleteCycle: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CyclesController>(CyclesController);
    service = module.get<CyclesService>(CyclesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCycle', () => {
    it('should call service.createCycle with correct parameters', async () => {
      const mockSession = { user: { id: 'userId' } };
      const mockBody = { label: 'Test Cycle', duration: 30 };
      const mockResult = { id: 'cycleId', ...mockBody, userId: 'userId' };

      const spy = jest
        .spyOn(service, 'createCycle')
        .mockResolvedValue(mockResult);

      const result = await controller.createCycle(mockBody, mockSession as any);

      expect(spy).toHaveBeenCalledWith(mockBody, 'userId');
      expect(result).toBe(mockResult);
    });
  });

  describe('getCycles', () => {
    it('should call service.getCyclesByUser with correct userId', async () => {
      const mockSession = { user: { id: 'userId' } };
      const mockCycles = [{ id: 'cycleId', userId: 'userId' }];

      const spy = jest.spyOn(service, 'getCyclesByUser');
      spy.mockResolvedValue(mockCycles);

      const result = await controller.getCycles(mockSession as any);

      expect(spy).toHaveBeenCalledWith('userId');
      expect(result).toBe(mockCycles);
    });
  });

  describe('getCycleById', () => {
    it('should call service.getCycleById with correct parameters', async () => {
      const mockSession = { user: { id: 'userId' } };
      const mockCycle = { id: 'cycleId', userId: 'userId' };

      const spy = jest.spyOn(service, 'getCycleById');
      spy.mockResolvedValue(mockCycle);

      const result = await controller.getCycleById(
        'cycleId',
        mockSession as any,
      );

      expect(spy).toHaveBeenCalledWith('cycleId', 'userId');
      expect(result).toBe(mockCycle);
    });
  });

  describe('updateCycle', () => {
    it('should call service.updateCycle with correct parameters', async () => {
      const mockSession = { user: { id: 'userId' } };
      const mockBody = { label: 'Updated Cycle' };
      const mockResult = { id: 'cycleId', ...mockBody };

      const spy = jest.spyOn(service, 'updateCycle');
      spy.mockResolvedValue(mockResult);

      const result = await controller.updateCycle(
        'cycleId',
        mockBody,
        mockSession as any,
      );

      expect(spy).toHaveBeenCalledWith('cycleId', 'userId', mockBody);
      expect(result).toBe(mockResult);
    });
  });

  describe('deleteCycle', () => {
    it('should call service.deleteCycle with correct parameters', async () => {
      const mockSession = { user: { id: 'userId' } };
      const mockResult = { id: 'cycleId', userId: 'userId' };

      const spy = jest.spyOn(service, 'deleteCycle');
      spy.mockResolvedValue(mockResult);

      const result = await controller.deleteCycle(
        'cycleId',
        mockSession as any,
      );

      expect(spy).toHaveBeenCalledWith('cycleId', 'userId');
      expect(result).toBe(mockResult);
    });
  });
});
