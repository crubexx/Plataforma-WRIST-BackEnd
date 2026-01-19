# WRIST - Backend del Sistema Web de Gestión de Experimentos Productivos

## Descripción

Backend del sistema web **WRIST**, una plataforma de visualización y gestión de experimentos productivos para el **Laboratorio de Producción de la Universidad Católica del Norte**.

Este componente es responsable de:
- La lógica de negocio del sistema
- La gestión de usuarios, roles y permisos
- La administración de experimentos, grupos y sesiones
- La integración con la base de datos IoT del laboratorio (solo lectura)
- La exposición de una API REST consumida por el frontend

El backend se desarrolla en el contexto de una **práctica profesional**, siguiendo buenas prácticas de ingeniería de software y arquitectura.

---

## Roles del Sistema

El backend implementa control de acceso basado en roles, definidos a nivel de negocio:

### Administrador (ADMIN)
- Gestión global del sistema
- Administración de usuarios y docentes
- Control de estados de cuenta
- Acceso a información histórica de experimentos

### Docente (DOCENTE)
- Creación y gestión de experimentos
- Administración de grupos de trabajo
- Asociación de sesiones IoT a grupos
- Visualización y análisis de métricas
- Generación de retroalimentación

### Usuario / Participante (USUARIO)
- Autenticación en el sistema
- Inscripción en experimentos
- Asociación a grupos
- Consulta de resultados y desempeño
- Acceso a feedback

---

## Arquitectura del Backend

El backend sigue una **Arquitectura por Capas (Layered Architecture)**, separando claramente responsabilidades para facilitar el mantenimiento, la escalabilidad y las pruebas.

### Capas del Sistema

- **Controllers:** Manejo de solicitudes HTTP y validación de entrada
- **Services:** Implementación de la lógica de negocio
- **Repositories:** Acceso a datos y consultas a MySQL
- **Models:** Representación de entidades del dominio
- **Config:** Configuración de base de datos y entorno
- **Middlewares:** Autenticación, autorización y validaciones

---

```bash
## Estructura de Carpetas
src/
├── config/ # Configuración de base de datos y entorno
│ └── database.js
│
├── controllers/ # Controladores HTTP
│ ├── auth.controller.js
│ ├── user.controller.js
│ ├── experiment.controller.js
│ └── group.controller.js
│
├── services/ # Lógica de negocio
│ ├── auth.service.js
│ ├── user.service.js
│ ├── experiment.service.js
│ └── group.service.js
│
├── repositories/ # Acceso a datos (MySQL)
│ ├── user.repository.js
│ ├── experiment.repository.js
│ └── group.repository.js
│
├── models/ # Entidades del dominio
│ ├── User.js
│ ├── Experiment.js
│ ├── Group.js
│ └── SessionMeasurement.js
│
├── routes/ # Definición de rutas de la API
│ ├── auth.routes.js
│ ├── user.routes.js
│ ├── experiment.routes.js
│ └── group.routes.js
│
├── middlewares/ # Middlewares de seguridad
│ └── auth.middleware.js
│
├── app.js # Configuración principal de Express
└── server.js # Punto de entrada del servidor

```
---

## Principios de la Arquitectura

### 1. Separación de Responsabilidades
Cada capa del sistema cumple una función específica, evitando acoplamientos innecesarios entre la lógica de negocio, el acceso a datos y la capa de presentación.

### 2. Escalabilidad
La arquitectura permite agregar nuevos módulos y funcionalidades sin afectar las existentes.

### 3. Seguridad
- Autenticación basada en JWT
- Autorización por roles
- Acceso de solo lectura a la base de datos IoT
- Uso de variables de entorno para credenciales y configuración

---

## Base de Datos

El backend interactúa con dos bases de datos:

### Base de Datos del Proyecto
- **Nombre:** DBProductAPP
- **Propósito:** Gestión de usuarios, experimentos, grupos y sesiones
- **Acceso:** Lectura y escritura

### Base de Datos IoT
- **Nombre:** iotdb
- **Propósito:** Almacenamiento de datos provenientes de dispositivos IoT
- **Acceso:** Solo lectura
- **Nota:** No se modifica la estructura ni los datos originales

---

## Tecnologías Utilizadas

- **Lenguaje:** JavaScript (Node.js)
- **Framework:** Express
- **Base de Datos:** MySQL 8
- **Autenticación:** JWT
- **Integración IoT:** Lectura directa desde MySQL
- **Control de versiones:** Git / GitHub
- **Entorno:** Docker (infraestructura del laboratorio)

---

## Instalación y Ejecución

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo producción
npm start

```

Convenciones de Código
Nomenclatura

Carpetas y clases: PascalCase

Variables y funciones: camelCase

Constantes: UPPER_SNAKE_CASE

Organización

Un controlador por recurso

Los servicios no dependen de HTTP

Los repositorios concentran las consultas SQL

Los controladores no acceden directamente a la base de datos

Roadmap de Desarrollo
Fase 1: Configuración Inicial (Completada)

Creación del repositorio

Estructura base por capas

Configuración de Express

Conexión a base de datos

Fase 2: Autenticación y Seguridad

Login con JWT

Middleware de autorización por rol

Gestión de sesiones

Fase 3: Gestión de Usuarios

CRUD de usuarios

Gestión de roles y estados

Registro de docentes

Fase 4: Gestión de Experimentos

Creación y administración de experimentos

Gestión de grupos de trabajo

Asociación de sesiones IoT a grupos

Fase 5: Integración IoT

Lectura de datos desde la base de datos IoT

Procesamiento de métricas

Soporte para visualización de múltiples grupos simultáneamente

Fase 6: Optimización y Pruebas

Manejo centralizado de errores

Optimización de consultas SQL

Pruebas básicas de integración

Contexto

Universidad: Universidad Católica del Norte
Departamento: Laboratorio de Producción (Produlab)
Sistema: WRIST
Desarrolladores: Sean Castillo Cordova, Rubén Rivera Rivera
Versión: 0.1.0
Fecha: Enero 2026

Licencia

[Especificar licencia]

Última actualización: 12 de enero de 2026
Estado del proyecto: Backend en desarrollo