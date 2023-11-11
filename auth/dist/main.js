"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const microservices_1 = require("@nestjs/microservices");
const sleep_1 = require("./sleep");
async function bootstrap() {
    console.log("1");
    async function connect() {
        console.log("2");
        let app;
        try {
            app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
                transport: microservices_1.Transport.KAFKA,
                options: {
                    client: {
                        clientId: "auth",
                        brokers: ["localhost:9092"]
                    },
                    consumer: {
                        groupId: "auth-consumer"
                    }
                }
            });
        }
        catch (error) {
            console.log("3");
            console.log(error);
            await (0, sleep_1.sleep)(5000);
            await connect();
            console.log("4");
        }
        app.listen();
    }
    connect();
}
bootstrap();
//# sourceMappingURL=main.js.map