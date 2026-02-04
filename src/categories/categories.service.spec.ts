import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { DatabaseService } from '../database/database.service';
import { createMockContext } from '../../test/prisma.mock';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let dbService: DatabaseService;

  beforeEach(async () => {
    const mockContext = createMockContext();

    const mockDbService = {
      client: mockContext.prisma,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    dbService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
