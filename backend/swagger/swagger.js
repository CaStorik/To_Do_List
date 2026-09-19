const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo List API',
      version: '1.0.0',
      description: 'API для управления задачами туду-листа',
      contact: {
        name: '',
        email: ''
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'dev'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['title'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор задачи'
            },
            title: {
              type: 'string',
              description: 'Заголовок задачи',
              example: 'Сделать домашнее задание'
            },
            description: {
              type: 'string',
              description: 'Описание задачи',
              example: 'Выполнить упражнения по математике'
            },
            completed: {
              type: 'boolean',
              description: 'Статус выполнения задачи',
              example: false
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Приоритет задачи',
              example: 'medium'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Срок выполнения задачи',
              example: '2024-01-15T23:59:59.999Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата создания'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Дата последнего обновления'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке'
            }
          }
        }
      },
      parameters: {
        taskId: {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID задачи'
        },
        completedFilter: {
          in: 'query',
          name: 'completed',
          required: false,
          schema: {
            type: 'boolean'
          },
          description: 'Фильтр по статусу выполнения'
        },
        priorityFilter: {
          in: 'query',
          name: 'priority',
          required: false,
          schema: {
            type: 'string',
            enum: ['low', 'medium', 'high']
          },
          description: 'Фильтр по приоритету'
        },
        searchQuery: {
          in: 'query',
          name: 'search',
          required: false,
          schema: {
            type: 'string'
          },
          description: 'Поиск по заголовку и описанию'
        },
        pageQuery: {
          in: 'query',
          name: 'page',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Номер страницы'
        },
        limitQuery: {
          in: 'query',
          name: 'limit',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          },
          description: 'Количество элементов на странице'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'], 
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Todo API документация'
  }));
};