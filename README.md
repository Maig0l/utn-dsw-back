# WellPlayed: Backend

> Backend API para la aplicación WellPlayed
>
> [Repositorio índice del proyecto](https://github.com/Maig0l/proyecto-dsw)

## Entregas

### 28/07/24

- [x] CRUD simple

  - [x] Platform
  - [x] Shop
  - [x] Studio
  - [x] Tag
  - [x] User

- [ ] Persistencia

  - [x] **Platform** (WIP) - indep
  - [x] Shop - indep
  - [x] **Studio** (WIP) - indep
  - [ ] Tag - indep
  - [x] **User** (WIP) - indep
  - [x] Game - indep
  - [ ] Review - req: user, game
  - [ ] Playlist - req: user
  - [ ] Franchise - req: game

## Casos de uso

### Prioritarios

- Crear usuario
- Inicio de sesión
- ADMIN: Listado y Carga de datos (CRUD platform, game, tag, shop, franchise)
- Escribir una review de un juego
- Búsqueda de juegos

### Secundarios

- Cambiar datos de usuario (ej. contraseña)
- Crear una playlist
- Sugerir una tag como usuario
- Votación de reviews para añadido de tags

## Branch To-Dos

- Crear un juego
- Validar mejor el registro de usuario
- Hacer que un usuario de Like a un juego
- Sería útil que la tabla game_shop tenga un atributo URL para tener un link directo de la página del juego en la app a la página de compra en la tienda
- Una funcion fuera de alcance sería una relacion platform_shop PC->{Steam,GOG,Epic}, [PS3,PS4,PS5]->{PSN Store}, [XBox,PC]->{Xbox/gamepass}
