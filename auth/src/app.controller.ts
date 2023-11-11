import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {getUserRequestDto} from './get-user.request.dto'
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) { }
  @MessagePattern("get_user")
  getUser(@Payload() data: getUserRequestDto) {
    return this.appService.getUser(data);
  }
}
