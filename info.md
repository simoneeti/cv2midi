virmidi
lobasound2-dev

bueno. varias partes:

#### Detección de movimiento

*  Comparar imagen con imagen anterior, con cierto treshold.
* Obtener UN punto de movimiento por cada objeto en movimiento. O sea:
- Centro de bounding box
- Algún cálculo maquiavélico para obtener el promedio entre todos los puntos que conforman un polígono
* Librerías que pueden ayudar:
- tracking.js

##### Por qué CV o cualquier modelo de vision AI es overkill:
* No necesito saber qué objeto estoy detectando
* Quiero que esto sea muy lightweight (as in, que pueda correr en la cristinet o en una raspi crota en tiempo real)
* El fondo y los participantes van a tener colores muy distintos, aparte el fondo no se va a mover y los participantes sí.
* Simplemente necesitaría un algoritmo que tome dos imágenes, saque los píxeles de diferencia, y por cada cúmulo de píxeles que cambiaron calcule un punto medio.

#### Fase lógica
* Implementar lógica de notas. Qué genera una nota? Con qué intensidad, pitch, volumen, paneo?

#### Conectar a MIDI
* Pretty self-explanatory.
* Librerías que pueden ayudar:
- virmidi (apt)
- midi (npm)


