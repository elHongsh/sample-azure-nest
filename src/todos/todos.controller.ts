import { Controller, Get } from '@nestjs/common';

@Controller('todos')
export class TodosController {
  @Get()
  getTodos(): any {
    return {
      result: [
        {
          title: 'Go to bed',
          priority: 'HIGH',
        },
        {
          title: 'Do code',
          priority: 'TOP',
        },
        {
          title: 'do exercise',
          priority: 'HIGH',
        },
      ],
    };
  }
}
