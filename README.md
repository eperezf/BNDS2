# BNDS

![](public/images/logo.png)

## Descripción

BNDS es una plataforma de verificación de compatibilidad de smartphones y operadoras.

## Instalación

### Requerimientos
- NodeJS
- MySQL

### Instalación

Como BNDS es un **desarrollo privado para Pisapapeles Networks**, la plataforma **no está pensada para ser ejecutada por terceros.** Esta se aloja en un servidor dispuesto por Pisapapeles Networks. El proceso de instalación es **netamenta demostrativo** y para realizar pruebas locales. La base de datos y su estructura no ha sido compartida en el repo por solicitud de Pisapapeles Networks.

**Pasos a seguir:**

- Clonar el repo
- Editar .env.example y cambiar el nombre a .env
- Instalar dependencias con `npm install`
- Iniciar el servidor con `npm start`
- El servidor debería estar disponible en [localhost en el puerto 3000](http://localhost:3000)

Imagenes de los pasos:

![](https://static.pisapapeles.net/uploads/2020/12/df2a1143-c3fd-48b8-8a27-6f3ec98aa6b1.jpeg)

![](https://static.pisapapeles.net/uploads/2020/12/8c8cda09-d2a1-43fe-837d-31ada8dedf2d.jpeg)

## Archivos

- `package.json`: Lista de dependencias de Node y datos del proyecto
- `package-lock.json`: Lista de dependencias y sub-dependencias
- `app.js`: Inicialización de Express y dependencias, declaración de rutas.
- `.gitignore`: Archivos y extensiones ignorados por git
- `.env.example`: Ejemplo de .env

- `views/error.pug`: Vista de error
- `views/index.pug`: Vista de inicio
- `views/result.pug`: Vista de los resultados de busqueda
- `views/acerca-de.pug`: Vista del acerca de la pagina
- 
- `views/includes/layout.pug`: Layout de todas las páginas
- `views/includes/head.pug`: Elementos en `<head>` de cada página
- `views/includes/head.pug`: Elementos en `<head>` de cada página
- `views/includes/footer.pug`: Elementos en `<footer>` de cada página

- `sequelize/index.js`: Declaración de modelos e inicialización de ORM
- `sequelize/extra-setup.js`: Declaración de relaciones
- `sequelize/models`: Carpeta con definiciones de modelos

- `routes/index.js`: Definición de rutas y lógica

- `public`: Esta carpeta contiene todas las imágenes y JS de frontend
- `public/stylesheet`: Contiene el css para mejoras visuales de frontend


- `bin/www`: Declaración de dependencias iniciales y inicialización de servidor
