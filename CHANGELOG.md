
# Historial de Cambios (Bitácora de desarrollo)

En este archivo registro los avances y ajustes que he ido haciendo en la Food Box Smart.

### [1.2.0] - Conexión con el hardware
- **Sistema de retiro**: Ya funciona la integración con el teclado físico. Ahora el buffer de teclas verifica si el código coincide con un pedido listo para abrir la caja.
- **Confirmación manual**: Añadí un botón de "Abrir puerta" en la app para mayor robustez por si falla el teclado físico.
- **Ajustes visuales**: El componente de `Badge` ahora es más flexible y permite meterle cualquier texto o icono.

### [1.1.0] - Panel de Administración y Control
- **Inventario**: Creé la pestaña de gestión de stock. Ahora el admin puede marcar productos como "Agotados" y se refleja al instante en el menú de los clientes.
- **Simulador**: Metí un modo de simulación para poder probar los sensores de temperatura y el teclado desde el navegador sin necesidad de tener el ESP32 conectado.

### [1.0.0] - Lanzamiento Base
- **Estructura inicial**: Configuración completa del proyecto, rutas y diseño base.
- **Autenticación**: Limpieza de la lógica de login y manejo de constantes globales.
- **Estética**: Actualización de dependencias y añadido de animaciones de carga para que la app se sienta más "viva".
- **Correcciones**: Arreglé las rutas de las imágenes en el login que daban problemas al cargar.

---
*Notas: Todos los cambios de la base de datos se sincronizan mediante snapshots de Firestore para asegurar la respuesta inmediata.*
