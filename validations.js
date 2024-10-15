import { body } from "express-validator";

export const loginValidation = [
    body("email","Невернывй формат почты").isEmail(),
    body( "password","Проль минимум 6 символов" ).isLength({ min: 6 }),
];

export const registerValidation = [
    body("email","Невернывй формат почты").isEmail(),
    body( "password","Проль минимум 6 символов" ).isLength({ min: 6 }),
    body( "fullName", "Укажите имя" ).isLength({ min: 3 }),
    body ( "avatarUrl","Неверная ссылка на автарку" ).optional().isURL(),
];

export const postCreateValidation = [
    body("title","Введите заголовок статьи").isLength({ min: 3 }),
    body( "text","Введите текст статьи" ).isLength({ min: 6 }).isString(),
    body( "tags", "Не верный формат тэегов" ).optional().isArray(),
    body ( "imageUrl","Неверная ссылка на bpj,hf;tybt" ).optional().isURL(),
]