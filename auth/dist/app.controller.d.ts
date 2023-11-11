import { AppService } from './app.service';
import { getUserRequestDto } from './get-user.request.dto';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getUser(data: getUserRequestDto): {
        userId: string;
        name: string;
        age: number;
    };
}
