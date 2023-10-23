import { DocumentBuilder } from '@nestjs/swagger'

export const swagger_config = new DocumentBuilder()
    .setTitle("Talabagaxabar loyihasi uchun dokumentatsiya. Agar bu yerda ishlamasa iltimos postmanda sinab ko'ring !")
    .setDescription("The api desciription")
    .setVersion("1.0.0")
    .addTag("Docs")
    .addBearerAuth()
    .build();