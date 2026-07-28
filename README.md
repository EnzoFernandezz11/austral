# Austral

PWA local-first para registrar ingresos, gastos y presupuestos personales sin entregar los datos financieros a un servidor.

[Abrir Austral](https://austral-six.vercel.app) · [Anotar un gasto](https://austral-six.vercel.app/nuevo)

Austral está pensada para iPhone y funciona también en cualquier navegador moderno. No requiere cuenta, backend, cookies de tracking ni conexión permanente: los movimientos se guardan exclusivamente en IndexedDB dentro del dispositivo.

## Características

- Dashboard mensual con ingresos, gastos, saldo y presupuesto disponible.
- Navegación entre meses y estado vacío para períodos sin movimientos.
- Registro rápido de gastos desde `/nuevo`.
- Historial cronológico con filtros, edición, eliminación y acciones por swipe.
- Distribución de gastos, tendencias y comparación con el mes anterior.
- Categorías iniciales para ingresos y egresos.
- Exportación de backups JSON versionados.
- Importación validada con opciones para reemplazar o combinar sin duplicados.
- PWA instalable con funcionamiento offline.
- Segundo acceso instalable llamado **Anotar gasto**.
- Interfaz mobile-first de 390 px, centrada y plana en desktop.

## Privacidad y almacenamiento

Austral no incluye backend, autenticación, analítica, publicidad ni servicios externos.

```text
Interfaz
   ↓
Estado de aplicación
   ↓
Repositorios
   ↓
Dexie
   ↓
IndexedDB del navegador
```

Los importes se almacenan como enteros en centavos. Los movimientos no se guardan en `localStorage`, logs, archivos del repositorio ni bases de datos remotas.

> [!IMPORTANT]
> Borrar los datos de Safari, limpiar el almacenamiento del sitio o cambiar de dispositivo elimina el acceso a la información local. Exportá backups periódicos y guardalos fuera del navegador.

## Stack

- [Next.js](https://nextjs.org/) con App Router
- TypeScript estricto
- Tailwind CSS
- Dexie.js e IndexedDB
- Zod
- Lucide React
- Recharts
- Vitest
- ESLint y Prettier

## Inicio rápido

Requisitos:

- Node.js 20.9 o superior
- npm

```bash
git clone https://github.com/EnzoFernandezz11/austral.git
cd austral
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

Austral no necesita variables de entorno. `.env.example` queda como referencia segura para futuras variables públicas.

## Scripts

| Comando                | Uso                                    |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Servidor local con hot reload          |
| `npm run build`        | Build optimizado de producción         |
| `npm run start`        | Ejecutar el build de producción        |
| `npm run typecheck`    | Validar TypeScript sin emitir archivos |
| `npm run lint`         | Ejecutar ESLint                        |
| `npm run format`       | Aplicar Prettier                       |
| `npm run format:check` | Verificar formato                      |
| `npm test`             | Ejecutar pruebas unitarias             |
| `npm run test:watch`   | Ejecutar Vitest en modo watch          |

## Datos de desarrollo

En desarrollo, si IndexedDB está vacía, se cargan movimientos ficticios para mostrar el dashboard y los gráficos. La compilación de producción nunca agrega datos mock.

Para reiniciar los datos de desarrollo:

1. Abrí las herramientas del navegador.
2. Entrá en **Application → IndexedDB**.
3. Eliminá la base `austral-finance`.
4. Recargá la página.

## Instalación como PWA en iPhone

1. Abrí [Austral](https://austral-six.vercel.app) en Safari.
2. Tocá **Compartir**.
3. Elegí **Agregar a pantalla de inicio**.
4. Confirmá **Agregar**.
5. Abrí la aplicación una vez con conexión para completar la caché offline.

El service worker guarda la shell y los assets estáticos. Los datos financieros continúan viviendo únicamente en IndexedDB.

### Acceso rápido “Anotar gasto”

Para instalar un segundo ícono que abra directamente el formulario:

1. Abrí [austral-six.vercel.app/nuevo](https://austral-six.vercel.app/nuevo) en Safari.
2. Tocá **Compartir → Agregar a pantalla de inicio**.
3. Conservá el nombre **Anotar gasto**.

La ruta usa un manifiesto propio con `start_url: "/nuevo"`. El formulario inicia en Gasto, enfoca el monto, usa la fecha local actual y vuelve a Inicio después de guardar.

## Backups

El backup JSON incluye:

- versión del formato;
- fecha de exportación;
- movimientos;
- categorías;
- ajustes de la aplicación.

Antes de importar, Zod valida completamente el archivo. Austral muestra un resumen y exige elegir entre:

- **Combinar sin duplicados:** conserva los datos actuales y agrega IDs nuevos.
- **Reemplazar todos los datos:** borra el contenido local y restaura el backup.

Los archivos exportados usan el formato `austral-backup-AAAA-MM-DD.json`.

## Arquitectura

```text
src/
  app/                  # rutas, metadata y layouts de App Router
  components/           # navegación y componentes visuales compartidos
  features/
    transactions/       # alta rápida, edición e historial
    dashboard/          # resumen mensual
    analytics/          # distribución, tendencias y comparación
    backup/             # dominio y servicios de respaldo
    settings/           # estado de aplicación y ajustes
  lib/
    db/                 # Dexie, migraciones, repositorios y seeds
    finance/            # cálculos puros con enteros
    validation/         # schemas Zod
    formatters/         # moneda ARS y fechas en español
  types/                # contratos del dominio
public/
  icons/                # íconos PWA y acceso rápido
  manifest.webmanifest
  manifest-nuevo.webmanifest
  sw.js
```

La UI no accede directamente a IndexedDB. Las pantallas consumen el proveedor de aplicación, que coordina repositorios y refresca el estado después de cada escritura.

## Modelo financiero

```ts
type Transaction = {
  id: string;
  type: "expense" | "income";
  amountCents: number;
  currency: "ARS";
  categoryId: string;
  note?: string;
  occurredOn: string;
  createdAt: string;
  updatedAt: string;
};
```

`amountCents` siempre es un entero. Los cálculos de totales, saldo y presupuesto no usan `float`.

## Calidad

La suite cubre:

- suma de ingresos y gastos;
- saldo neto;
- filtro por mes;
- presupuesto restante;
- conversión segura de importes;
- creación y validación de backups;
- rechazo de montos no enteros;
- deduplicación al combinar respaldos.

Antes de enviar cambios:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

## Deploy en Vercel

El proyecto usa la configuración estándar de Next.js y no requiere secretos:

1. Importá el repositorio en Vercel.
2. Conservá el preset **Next.js**.
3. Desplegá sin configurar variables de entorno.

También podés usar la CLI:

```bash
npx vercel
npx vercel --prod
```

`.vercel`, `.env*`, builds y dependencias están excluidos de Git. Solamente `.env.example` puede versionarse.

## Limitaciones actuales

- Solo admite ARS.
- Los datos no se sincronizan entre dispositivos.
- No existe recuperación automática sin un backup.
- El tema disponible es claro.
- Los respaldos son manuales.

## Licencia

[MIT](LICENSE)
