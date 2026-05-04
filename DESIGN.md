# Todos, Entornos Seguros
## Sistema de Gestión de Eventos de Seguridad

---

## Manual de Marca

### Paleta de Colores

#### Colores Principales
- **Azul Primario**: `#2563eb`
  - Variable CSS: `--primary`
  - Uso: Botones principales, encabezados, navegación activa
  
- **Azul Secundario**: `#60a5fa`
  - Variable CSS: `--secondary`
  - Uso: Botones secundarios, elementos de acento

- **Azul Acento**: `#3b82f6`
  - Variable CSS: `--accent`
  - Uso: Elementos destacados, enlaces

#### Colores de Fondo
- **Fondo Principal**: `#ffffff` (blanco)
  - Variable CSS: `--background`
  
- **Fondo Atenuado**: `#e0f2fe` (azul muy claro)
  - Variable CSS: `--muted`
  
- **Fondo de Inputs**: `#f0f9ff` (azul casi blanco)
  - Variable CSS: `--input-background`

#### Colores de Borde
- **Borde Principal**: `#bfdbfe` (azul claro)
  - Variable CSS: `--border`

#### Colores de Texto
- **Texto Principal**: `#1e3a5f` (azul oscuro)
  - Variable CSS: `--foreground`
  
- **Texto Atenuado**: `#475569` (gris azulado)
  - Variable CSS: `--muted-foreground`

#### Colores de Sistema
- **Destructivo/Alertas**: `#ef4444` (rojo)
  - Variable CSS: `--destructive`
  
- **Éxito**: `#10b981` (verde)
  
- **Advertencia**: `#f59e0b` (naranja)

---

### Tipografía

#### Fuente Principal
**Calibri** con fallbacks:
- Carlito
- Segoe UI
- Helvetica Neue
- Arial
- sans-serif

#### Tamaños de Texto
- **Títulos (H1, H2)**: 24px
  - Font-weight: 500 (Medium)
  - Variable CSS: `--text-title`
  
- **Menús y Subtítulos (H3, H4)**: 16px
  - Font-weight: 500 (Medium)
  - Variable CSS: `--text-menu`
  
- **Texto de Cuerpo**: 16px
  - Font-weight: 400 (Normal)
  - Variable CSS: `--text-body`
  
- **Texto Pequeño**: 14px
  - Font-weight: 400 (Normal)

#### Pesos de Fuente
- **Medium**: 500 (para títulos, labels, botones)
- **Normal**: 400 (para textos de cuerpo, inputs)

---

### Espaciados

#### Sistema de Espaciado
- **Pequeño**: 8px
  - Variable CSS: `--spacing-sm`
  - Uso: Márgenes internos reducidos, gaps pequeños
  
- **Mediano**: 16px
  - Variable CSS: `--spacing-md`
  - Uso: Márgenes estándar entre elementos, padding de tarjetas

#### Aplicaciones Comunes
- Padding de tarjetas: 16px
- Gap entre elementos en grids: 16px
- Gap entre elementos en listas: 8px
- Padding de botones: 8px horizontal, variable vertical
- Márgenes entre secciones: 16px o 24px

---

### Componentes

#### Botones
- **Border-radius**: 8px (0.5rem)
- **Font-size**: 16px
- **Padding**: 8px horizontal, 8px vertical
- **Tipos**:
  - Primario: `bg-primary` / `text-primary-foreground`
  - Secundario: `bg-secondary` / `text-secondary-foreground`
  - Neutral: `bg-muted` / `text-foreground`
  - Destructivo: `bg-destructive` / `text-destructive-foreground`

#### Campos de Entrada (Inputs)
- **Background**: `#f0f9ff`
- **Border**: `#bfdbfe`
- **Border-radius**: 8px
- **Padding**: 8px
- **Font-size**: 16px

#### Tarjetas (Cards)
- **Background**: `#ffffff`
- **Border**: `#bfdbfe`
- **Border-radius**: 8px
- **Padding**: 16px
- **Sombra**: Sutil (opcional)

#### Estados Interactivos
- **Hover en botones**: Opacidad 90% o cambio de fondo
- **Transiciones**: Suaves (transition-colors, transition-all)
- **Bordes redondeados estándar**: 8px

---

## Arquitectura de Pantallas

### Pantalla 1: Login
**Propósito**: Autenticación de usuarios

**Elementos**:
- Título: "Todos, entornos seguros" (24px)
- Subtítulo: "Sistema de Gestión de Eventos de Seguridad" (16px, texto atenuado)
- Botón "Continuar con Google" (con logo de Google)
- Botón "Continuar con Microsoft" (con logo de Microsoft)
- Enlace: "¿Olvidaste tu usuario y contraseña?"
- Texto legal: Términos de servicio y política de privacidad

**Layout**:
- Centrado vertical y horizontal
- Fondo degradado azul claro
- Tarjeta blanca con padding de 32px
- Espaciado de 16px entre elementos

---

### Pantalla 2: Bienvenida (Inicio)
**Propósito**: Dashboard principal y navegación

**Elementos del Header**:
- Saludo: "Bienvenido, [Nombre del Usuario]"
- Subtítulo: "Sistema de Gestión de Eventos de Seguridad"

**Secciones de Menú**:

1. **Eventos de seguridad**
   - Registrar evento
   - Buscar evento
   - Clasificar evento

2. **Análisis de causa raíz**
   - Realizar análisis de causa raíz
   - Seleccionar eventos para análisis múltiples
   - Consultar análisis

3. **Planes de acción**
   - Registrar planes de acción
   - Actualizar estado de planes de acción

4. **Configuración**
   - Configuración

**Estadísticas**:
- Eventos Recientes: 12
- Análisis Pendientes: 5
- Planes Activos: 8

**Layout**:
- Grid de 4 columnas (en desktop)
- Cada sección es una tarjeta con:
  - Título de sección (16px, color primario)
  - Lista de botones/opciones (fondo gris claro, hover azul)
- Tarjetas de estadísticas en la parte inferior (grid de 3 columnas)

---

### Pantalla 3: Registrar Evento
**Propósito**: Formulario para registro de eventos de seguridad

**Secciones del Formulario**:

1. **Información del paciente**
   - Nombres (input texto)
   - Apellidos (input texto)
   - Número de historia clínica (input texto)
   - Número de documento (input texto)
   - Tipo de documento (select)
     - Opciones: Cédula de ciudadanía, Tarjeta de identidad, Registro civil, Cédula de extranjería, Pasaporte
   - Fecha de nacimiento (input date)

2. **Información básica**
   - Día (input date)
   - Hora (input time)
   - Lugar de ocurrencia (input texto)

3. **Descripción**
   - Campo de texto largo (textarea)
   - Límite: 15,000 caracteres
   - Contador de caracteres visible

4. **Consecuencias** (selección múltiple con checkboxes)
   - Muerte
   - Administración de medicamentos
   - Atención quirúrgica
   - Prolongación de estancia
   - Demora diagnóstica
   - Diagnóstico errado
   - Sin afectación

5. **Archivos adjuntos**
   - Botón "Adjuntar archivos"

**Botones de Acción** (centrados en la parte inferior):
- Cancelar (botón neutral)
- Registrar (botón primario)

**Modal de Confirmación**:
- Ícono de éxito (✓)
- Título: "Registro exitoso"
- Mensaje: "Hemos registrado satisfactoriamente el evento de seguridad, el cual será redireccionado de forma automática."
- Redirección automática después de 3 segundos

**Layout**:
- Formulario de dos columnas en desktop
- Cada sección en su propia tarjeta
- Espaciado de 16px entre tarjetas

---

## Navegación

### Menú Lateral (Desktop)
**Elementos**:
- Logo/Título: "Todos, Entornos Seguros"
- Menú hamburguesa (móvil)

**Opciones de Menú**:
1. Inicio
2. Mis eventos de seguridad
3. Mis análisis de causa raíz
4. Mis planes de acción
5. Wireframe Móvil
6. Configuración

**Footer del Menú**:
- Avatar del usuario
- Nombre: Dr. Admin
- Rol: Administrador

**Estados**:
- Activo: Fondo azul primario, texto blanco
- Inactivo: Texto gris, hover fondo azul claro

### Header Superior
**Elementos**:
- Botón "Cerrar sesión" (esquina superior derecha)
  - Color: Gris atenuado
  - Icono: Logout
  - Hover: Gris más oscuro

---

## Diseño Responsive

### Desktop (>768px)
- Menú lateral visible (256px de ancho)
- Grid de 4 columnas para tarjetas
- Formularios de 2 columnas

### Tablet (768px - 1024px)
- Menú lateral colapsable
- Grid de 2 columnas para tarjetas
- Formularios de 2 columnas

### Móvil (<768px)
- Menú lateral oculto (hamburger)
- Grid de 1 columna para tarjetas
- Formularios de 1 columna
- Navegación inferior (tab bar)
- Botones de ancho completo

---

## Wireframe Móvil

### Especificaciones
- **Ancho**: 375px (referencia iPhone estándar)
- **Alto**: 667px (pantalla visible)
- **Orientación**: Vertical

### Adaptaciones Móviles
- Navegación inferior en pantalla principal
- Formularios de una columna
- Botones de ancho completo
- Espaciado reducido (8px predominante)
- Campos de formulario más compactos
- Header con botón de retroceso en formularios

### Pantalla 1 Móvil: Login
- Layout idéntico al desktop
- Optimizado para toque
- Botones más grandes (mínimo 44px de alto)

### Pantalla 2 Móvil: Bienvenida
- Header azul con información del usuario
- Tarjetas apiladas verticalmente
- Botones de navegación en cards
- Tab bar inferior con 3 opciones principales
- Estadísticas en grid de 3 columnas compacto

### Pantalla 3 Móvil: Registrar Evento
- Header con botón de retroceso
- Formulario en una columna
- Secciones colapsables opcionales
- Campos más compactos (padding 6px)
- Botones flotantes en la parte inferior
- Modal de confirmación ocupa más espacio vertical

---

## Variables CSS Personalizadas

```css
:root {
  /* Tamaños de texto */
  --text-title: 24px;
  --text-menu: 16px;
  --text-body: 16px;
  
  /* Espaciados */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  
  /* Colores principales */
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #60a5fa;
  --secondary-foreground: #ffffff;
  --accent: #3b82f6;
  --accent-foreground: #ffffff;
  
  /* Fondos */
  --background: #ffffff;
  --foreground: #1e3a5f;
  --muted: #e0f2fe;
  --muted-foreground: #475569;
  --input-background: #f0f9ff;
  
  /* Bordes y otros */
  --border: #bfdbfe;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --radius: 0.5rem;
  
  /* Pesos de fuente */
  --font-weight-medium: 500;
  --font-weight-normal: 400;
}
```

---

## Íconos

**Librería**: Lucide React

**Íconos Utilizados**:
- Home (Inicio)
- AlertTriangle (Eventos de seguridad)
- GitBranch (Análisis de causa raíz)
- ClipboardList (Planes de acción)
- Settings (Configuración)
- Smartphone (Wireframe móvil)
- LogOut (Cerrar sesión)
- Menu (Hamburger)
- X (Cerrar)
- Upload (Adjuntar archivos)
- Search (Buscar)
- Plus (Agregar)
- ChevronLeft, ChevronRight (Navegación)

**Tamaño estándar**: 20px

---

## Flujo de Usuario

### Flujo Principal
1. **Login** → Seleccionar método de autenticación
2. **Bienvenida** → Ver dashboard y estadísticas
3. **Navegación** → Seleccionar opción del menú
4. **Acción** → Completar tarea (ej: registrar evento)
5. **Confirmación** → Ver resultado y volver al inicio

### Flujo de Registro de Evento
1. Click en "Registrar evento"
2. Completar formulario (5 secciones)
3. Click en "Registrar"
4. Ver modal de confirmación
5. Redirección automática a pantalla de bienvenida

---

## Buenas Prácticas

### Accesibilidad
- Contraste mínimo de 4.5:1 para texto normal
- Contraste mínimo de 3:1 para texto grande
- Áreas de toque mínimas de 44x44px en móvil
- Labels visibles en todos los inputs
- Estados de foco claramente visibles

### Performance
- Usar variables CSS para consistencia
- Evitar inline styles cuando sea posible
- Lazy loading de componentes pesados
- Optimizar imágenes y assets

### Usabilidad
- Feedback visual en todas las interacciones
- Mensajes de error claros y accionables
- Confirmaciones para acciones destructivas
- Loading states para operaciones asíncronas
- Navegación clara y consistente

---

## Estructura de Archivos

```
src/
├── app/
│   ├── App.tsx                      # Componente principal
│   └── components/
│       ├── Login.tsx                # Pantalla 1
│       ├── Welcome.tsx              # Pantalla 2
│       ├── RegisterEvent.tsx        # Pantalla 3
│       ├── MobileWireframe.tsx      # Wireframe móvil
│       ├── Dashboard.tsx            # (Placeholder)
│       ├── Patients.tsx             # (Placeholder)
│       └── Settings.tsx             # (Placeholder)
├── styles/
│   ├── fonts.css                    # Fuentes
│   ├── theme.css                    # Variables de tema
│   ├── globals.css                  # Estilos globales
│   └── tailwind.css                 # Configuración Tailwind
```

---

## Notas de Implementación

### Stack Tecnológico
- **Framework**: React + TypeScript
- **Estilos**: Tailwind CSS v4
- **Iconos**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Consideraciones
- No usar clases de Tailwind para font-size, font-weight o line-height (usar variables CSS del tema)
- Usar inline styles solo para variables CSS dinámicas (ej: `style={{ padding: 'var(--spacing-md)' }}`)
- Los colores del tema están definidos en CSS, no en tailwind.config
- Fuente Calibri se carga localmente, no desde Google Fonts

---

## Versión del Documento
**Versión**: 12  
**Fecha**: 4 de mayo de 2026  
**Estado**: Producción

---

## Contacto y Soporte
**Proyecto**: Todos, Entornos Seguros  
**Tipo**: Sistema de Gestión de Eventos de Seguridad  
**Categoría**: Aplicación de Salud
