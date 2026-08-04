import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "KPS Tracking API",
      version: "1.0.0",
      description: "Personal Finance Management REST API",
      contact: {
        name: "Reysa Eka Saputra",
      },
    },

    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production"
            : "Development",
      },
    ],

    security: [
      {
        bearerAuth: [],
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    tags: [
      { name: "Authentication" },
      { name: "Category" },
      { name: "Transaction" },
      { name: "Report" },
    ],
  },

  apis: [
    "./src/docs/*.yaml",
    "./src/docs/*.yml",
    "./src/routes/*.js",
    "./src/controllers/*.js",
  ],
};

export default swaggerJsdoc(options);