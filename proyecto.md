# Guardianes del Movimiento
## Software Architecture Document (SAD)

Versión: 1.0

---

# Objetivo

Guardianes del Movimiento es una plataforma educativa gamificada que utiliza Visión por Computadora para incentivar la actividad física en niños mediante retos de poses.

El sistema debe estar diseñado para permitir el desarrollo paralelo por múltiples desarrolladores sin generar conflictos entre módulos.

Para lograrlo se utilizará:

- Clean Architecture
- Feature First
- Domain Driven Design (ligero)
- Specification Pattern
- SOLID
- Dependency Injection
- Repository Pattern

---

# Filosofía del proyecto

Ningún módulo debe conocer la implementación interna de otro módulo.

Cada módulo únicamente conoce:

- Interfaces
- Eventos
- Contratos
- Specifications

Nunca conoce implementaciones.

---

# Arquitectura General

```
                     React

                       │

             Presentation Layer

                       │

               Application Layer

                       │

                  Domain Layer

                       │

          Specifications + Entities

                       │

            Infrastructure Layer

                       │

          MediaPipe - Django - DB
```

---

# Organización

```
src/

app/

core/

domain/

features/

infrastructure/

components/

assets/

styles/
```

---

# app

Contiene únicamente el arranque del sistema.

Responsabilidades

- Router
- Providers
- Configuración global
- Theme

Nunca contiene lógica de negocio.

---

# core

Contiene código reutilizable.

```
core/

constants/

hooks/

types/

utils/

errors/

config/
```

No conoce el dominio.

---

# domain

Es el corazón del sistema.

Aquí viven las reglas.

```
domain/

entities/

services/

repositories/

specifications/
```

El dominio jamás importa React.

Jamás importa MediaPipe.

Jamás importa Django.

---

# infrastructure

Implementaciones.

Aquí viven

MediaPipe

REST API

WebSockets

LocalStorage

PostgreSQL

QR

Si un día cambia MediaPipe por OpenPose, únicamente cambia Infrastructure.

---

# features

Cada pantalla es completamente independiente.

```
features/

menu/

avatar/

tutorial/

gameplay/

reward/

settings/

qr/
```

Cada feature contiene

```
components/

hooks/

pages/

services/

types/
```

Nunca importa componentes de otra feature.

---

# Principio Principal

Cada desarrollador trabaja únicamente en una feature.

Nunca modifica otra.

Ejemplo

Developer A

↓

Gameplay

Developer B

↓

Avatar

Developer C

↓

Menu

Developer D

↓

Reward

Todos trabajan simultáneamente.

---

# Domain

## Entidades

Player

Avatar

Pose

Challenge

Reward

QRCode

GameSession

Teacher

---

# Services

Los Services representan procesos del dominio.

Ejemplo

ChallengeService

RewardService

QRCodeService

PoseEvaluationService

GameSessionService

---

# Specifications

Las Specifications contienen reglas.

Nunca contienen UI.

Nunca contienen React.

Nunca contienen llamadas HTTP.

Solo reglas.

---

# Ejemplo

```
PoseDetectedSpecification
```

Responsabilidad

Determinar si la pose existe.

Entrada

```
PoseData
```

Salida

```
boolean
```

No hace otra cosa.

---

## PoseStableSpecification

Responsabilidad

Verificar que la pose se mantuvo durante el tiempo requerido.

Entrada

```
PoseData
Tiempo
```

Salida

```
boolean
```

---

## PoseConfidenceSpecification

Responsabilidad

Validar precisión mínima.

Entrada

```
Confidence
```

Salida

```
boolean
```

---

## AvatarSelectedSpecification

Responsabilidad

Verificar que el usuario seleccionó un personaje.

Entrada

Avatar

Salida

boolean

---

## ChallengeCompletedSpecification

Responsabilidad

Verificar que las cinco poses fueron completadas.

---

## RewardAvailableSpecification

Responsabilidad

Verificar si existe recompensa.

---

## QRAvailableSpecification

Responsabilidad

Verificar si el QR puede generarse.

---

## QRNotClaimedSpecification

Responsabilidad

Verificar que el QR no haya sido usado.

---

## SessionActiveSpecification

Responsabilidad

Verificar que la sesión continúe activa.

---

# ¿Por qué Specifications?

En lugar de

```
if(...)

if(...)

if(...)

if(...)
```

hacemos

```
PoseDetectedSpecification

AND

PoseStableSpecification

AND

PoseConfidenceSpecification
```

Las reglas son reutilizables.

---

# Independencia

Cada Specification es completamente independiente.

Puede desarrollarse por separado.

Puede probarse por separado.

Puede reemplazarse por otra.

---

# Flujo

```
MediaPipe

↓

PoseDetectedSpecification

↓

PoseStableSpecification

↓

PoseConfidenceSpecification

↓

ChallengeCompletedSpecification

↓

RewardAvailableSpecification

↓

QRCodeService

↓

Frontend
```

---

# Features

## Menu

Responsabilidad

Mostrar menú principal.

Nunca conoce MediaPipe.

Nunca conoce Base de Datos.

---

## Avatar

Responsabilidad

Seleccionar personaje.

Solo devuelve

```
Avatar
```

---

## Tutorial

Responsabilidad

Explicar reglas.

---

## Gameplay

Responsabilidad

Ejecutar el juego.

No genera premios.

No genera QR.

Solo informa resultados.

---

## Reward

Responsabilidad

Mostrar recompensas.

---

## QR

Responsabilidad

Mostrar QR.

No sabe cómo se genera.

Solo lo visualiza.

---

# Infrastructure

MediaPipe

Responsabilidad

Obtener Landmarks.

Nunca interpreta reglas.

Solo entrega datos.

---

# PoseEvaluator

Responsabilidad

Convertir

```
33 Landmarks
```

en

```
TreePose

Confidence

92%
```

---

# Backend

Responsabilidades

Guardar partidas.

Guardar jugadores.

Guardar QR.

Validar premios.

Nunca detecta poses.

---

# Base de Datos

Tablas

Player

Avatar

Reward

GameSession

QRCode

Teacher

Prize

Challenge

---

# Eventos

El proyecto funcionará mediante eventos.

Ejemplo

```
AvatarSelected

GameStarted

PoseDetected

PoseValidated

PoseCompleted

ChallengeCompleted

RewardUnlocked

QRCodeGenerated

RewardClaimed
```

Los módulos escuchan eventos.

No llaman directamente a otros módulos.

---

# Ejemplo

Gameplay

↓

emite

```
PoseCompleted
```

Reward escucha.

↓

Reward calcula premio.

↓

emite

```
RewardUnlocked
```

QR escucha.

↓

Genera QR.

Ningún módulo conoce al otro.

---

# Beneficios

- Bajo acoplamiento.
- Alta cohesión.
- Fácil mantenimiento.
- Fácil testing.
- Desarrollo paralelo.
- Escalable.
- Fácil reemplazo de tecnologías.

---

# Testing

Cada Specification tendrá

Unit Tests

Cada Service

Integration Tests

Cada Feature

Component Tests

Flujo completo

E2E Tests

---

# Convenciones

Nunca acceder directamente a Infrastructure desde Presentation.

Nunca acceder directamente a la Base de Datos desde React.

Nunca colocar reglas de negocio dentro de componentes React.

Nunca usar if complejos en los componentes.

Toda regla pertenece a una Specification.

Toda operación pertenece a un Service.

Todo acceso a datos pertenece a un Repository.

Toda integración pertenece a Infrastructure.

---

# Objetivo Final

El sistema debe permitir que varios desarrolladores trabajen simultáneamente sin interferir entre sí.

Cada Specification representa una única responsabilidad del dominio y puede evolucionar independientemente.

La incorporación de nuevas poses, personajes, recompensas o mecánicas deberá realizarse mediante nuevas Specifications, Services o Features, sin modificar el comportamiento existente y respetando el principio **Open/Closed** de SOLID.