require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./swagger/swagger')(app);

app.use('/api/tasks', require('./routes/tasks'));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const frontendDir = path.join(__dirname, '..');
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});
app.get('/index.js', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.js'));
});
app.get('/style.css', (req, res) => {
  res.sendFile(path.join(frontendDir, 'style.css'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так' });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Соединение с бд установлено');
    
    await sequelize.sync({ alter: true });
    console.log('бд синхронизирована');
    
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`Приложение: http://localhost:${PORT}`);
      console.log(`Документация по api http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Соединение с бд не установлено по причине:', error);
    process.exit(1);
  }
}

startServer();