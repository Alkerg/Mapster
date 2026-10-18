# Mapster

Aplicación web desarrollada con Angular para explorar mapas y consultar
ubicaciones mediante la API de Mapbox.

## Funcionalidades

- Visualización de un mapa interactivo a pantalla completa con controles de
  navegación, escala, pantalla completa y geolocalización.
- Búsqueda de puntos de interés y ubicaciones usando Mapbox Search
- Selección de un punto de origen y un punto de destino para calcular rutas
  mediante la API de Mapbox Directions.
- Visualización de la ruta en el mapa, junto con la distancia, la duración
  estimada y las instrucciones paso a paso.
- Creación, consulta y eliminación de marcadores directamente sobre el mapa.

## Requisitos

- Node.js y npm instalados.
- Una clave pública de Mapbox con acceso a los servicios utilizados por la
  aplicación.

## Configuración de variables de entorno

La aplicación necesita la variable `MAPBOX_KEY` para inicializar Mapbox.

1. Crea un archivo `.env` en la raíz del proyecto a partir de
   `.env.template`.
2. Sustituye `<MAPBOX_KEY>` por tu clave pública de Mapbox:

   ```dotenv
   MAPBOX_KEY=tu_clave_publica_de_mapbox
   ```

El script crea `src/environments/environment.ts` y
`src/environments/environment.development.ts`. Estos archivos se generan
automáticamente y no deben añadirse al control de versiones.

## Instalación y ejecución

Instala las dependencias del proyecto:

```bash
npm install
```

Inicializa las variables de entorno y arranca el servidor de desarrollo:

```bash
npm run set-envs
npm start
```

Cuando el servidor esté disponible, abre
[`http://localhost:4200/`](http://localhost:4200/) en el navegador. La
aplicación se recargará automáticamente al modificar los archivos fuente.

## Compilación

Para generar una compilación de producción:

```bash
npm run build
```

Los archivos compilados se guardan en `dist/`.

## Pruebas unitarias

Para ejecutar las pruebas unitarias con Vitest:

```bash
npm test
```

>[!NOTE]
Este proyecto utiliza **Angular CLI 22.1.6**.
