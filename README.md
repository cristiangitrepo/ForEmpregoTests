# TestPlatform

[ForEmprego Test Platform/](https://cristiangitrepo.github.io/ForEmpregoTests/)

## Catálogo de exámenes

El selector y el administrador leen los tests de `data` y muestran el campo `titulo` de cada JSON.

Tras añadir, renombrar o eliminar archivos, regenera el catálogo desde la raíz:

Para probar en local, sirve la carpeta mediante HTTP. Abrir el HTML con `file://` no permite cargar los JSON mediante `fetch`.

## Administrador

El administrador carga el catálogo publicado y conserva los cambios como borradores en `localStorage`. Guardar o eliminar no modifica el repositorio. Los errores de almacenamiento se notifican sin descartar el contenido del formulario.

Para publicar un test, expórtalo, coloca su JSON en `data`, añádelo a 'catalog.json' y sube los cambios. Para actualizar uno existente, sustituye su archivo original. El siguiente despliegue descubrirá los archivos y mostrará sus títulos; en local, regenera el catálogo cuando cambien los nombres de archivo.

Los tests necesitan título, al menos una pregunta, dos opciones o más por pregunta, IDs únicos por pregunta y exactamente una opción correcta. La descripción y las traducciones son opcionales.
