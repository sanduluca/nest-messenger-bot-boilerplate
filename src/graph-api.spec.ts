import { Test, TestingModule } from '@nestjs/testing';
import { GraphApi } from './graph-api';

describe('GraphApi', () => {
  let provider: GraphApi;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GraphApi],
    }).compile();

    provider = module.get<GraphApi>(GraphApi);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
