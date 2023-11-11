import { NestApplication, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestMicroservice } from '@nestjs/common';
import { sleep } from './sleep';
async function bootstrap() {
  console.log("1");
  async function connect() {
    console.log("2");
    let app: INestMicroservice;
    try {
      app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: "auth",
              brokers: ["localhost:9092"]
            },
            consumer: {
              groupId: "auth-consumer"
            }
          }
        }
      )
    } catch (error) {
      console.log("3")
      console.log(error);
      await sleep(5000);
      await connect();
      console.log("4");
    }
    app.listen();
  }
  connect();
}
bootstrap();
