# BNDS

## Descripción

BNDS es una plataforma de verificación de compatibilidad de smartphones y operadoras.

## Instalación

### Requerimientos
- NodeJS
- MySQL

### Instalación

Como BNDS es un **desarrollo privado para Pisapapeles Networks**, la plataforma **no está pensada para ser ejecutada por terceros.** Esta se aloja en un servidor dispuesto por Pisapapeles Networks. El proceso de instalación es **netamenta demostrativo** y para realizar pruebas locales. La base de datos y su estructura no ha sido compartida en el repo por solicitud de Pisapapeles Networks.

**Pasos a seguir:**

- Clonar el repo
- Editar .env.example y cambiar el nombre a .env
- Instalar dependencias con `npm install`
- Iniciar el servidor con `npm start`
- El servidor debería estar disponible en [localhost en el puerto 3000](http://localhost:3000)

## Archivos
- `package.json`: Lista de dependencias de Node y datos del proyecto
- `package-lock.json`: Lista de dependencias y sub-dependencias
- `app.js`: Inicialización de Express y dependencias, declaración de rutas.
- `.gitignore`: Archivos y extensiones ignorados por git
- `.env.example`: Ejemplo de .env
- `views/error.pug`: Vista de error
- `views/index.pug`: Vista de inicio
- `views/includes/layout.pug`: Layout de todas las páginas
- `views/includes/head.pug`: Elementos en `<head>` de cada página
- `views/includes/footer.pug`: Elementos en `<footer>` de cada página
- `routes/index.js`: Definición de rutas y lógica
- `public`: Esta carpeta contiene todas las imágenes y JS de frontend
