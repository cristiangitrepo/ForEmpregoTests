# TestPlatform

https://cristiangitrepo.github.io/TestPlatform/

## Catálogo de exámenes

El selector y el administrador leen los tests de `data` y muestran el campo `titulo` de cada JSON. `data/test.json` es un índice antiguo que ya no se utiliza.

Los servidores estáticos no permiten enumerar carpetas desde JavaScript. `scripts/build-catalog.ps1` descubre los JSON de `data` y genera `data/catalog.json` con sus nombres, excluyendo el propio catálogo y `test.json`.

Tras añadir, renombrar o eliminar archivos, regenera el catálogo desde la raíz:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-catalog.ps1
```

El workflow `.github/workflows/pages.yml` lo genera automáticamente al publicar cambios de `main`. Configura GitHub Pages con origen **GitHub Actions** para utilizarlo. Este cambio no se ha desplegado desde esta sesión.

Para probar en local, sirve la carpeta mediante HTTP. Abrir el HTML con `file://` no permite cargar los JSON mediante `fetch`.

## Administrador

El administrador carga el catálogo publicado y conserva los cambios como borradores en `localStorage`. Guardar o eliminar no modifica el repositorio. Los errores de almacenamiento se notifican sin descartar el contenido del formulario.

Para publicar un test, expórtalo, coloca su JSON en `data` y sube los cambios. Para actualizar uno existente, sustituye su archivo original. El siguiente despliegue descubrirá los archivos y mostrará sus títulos; en local, regenera el catálogo cuando cambien los nombres de archivo.

Los tests necesitan título, al menos una pregunta, dos opciones o más por pregunta, IDs únicos por pregunta y exactamente una opción correcta. La descripción y las traducciones son opcionales.
