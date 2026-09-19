# Инструкция по настройке backend

## Установка postgres
1. Установить PgAdmin (установится вместе с postgres) https://ftp.postgresql.org/pub/pgadmin/pgadmin4/v9.8/windows/pgadmin4-9.8-x64.exe  / Или же можно скачать только postgres
2. Пользователь potgressql должен быть: логин - postgres ; пароль - root

## Установка NodeJS
1.Установить NodeJS - https://nodejs.org/dist/v22.19.0/node-v22.19.0-x64.msi

## Запуск сервера
1. Требуется перейти в папку backend и в командной панель прописать npm i (подтянутся все зависимости)
2. Если требуется изменить пути к бд, то они находятся в папке config/config.json
3. Выполнить миграцию в командной панели: npm run db:migrate
4. Запустить сервер можно в командной панели: npm run dev
5. Документация по api находится по адресу http://localhost:3000/api-docs

