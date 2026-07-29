import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition:
  {
    openapi: "3.0.0",

    info: {
      title: "KPS Tracking API",
      version: "1.0.0",
      description: "Personal Finance Management REST API",
    },

  servers: [
    {
      url: process.env.API_URL,
      description: "API Server",
    },
  ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Masukkan JWT token tanpa kata 'Bearer'.",
        },
      },
    },
  },

  apis: [
    "./src/docs/*.yaml",
    "./src/docs/*.yml",
    "./src/routes/*.js",
    "./src/controllers/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;