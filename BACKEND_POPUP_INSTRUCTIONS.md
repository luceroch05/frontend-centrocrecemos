# Instrucciones para Backend - Sistema de Popup Promocional

## 1. Crear tabla en la base de datos

Ejecuta este SQL en tu base de datos MySQL:

```sql
CREATE TABLE IF NOT EXISTS popup_configuracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activo BOOLEAN DEFAULT FALSE,
  imagen_url VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar registro inicial
INSERT INTO popup_configuracion (activo, imagen_url) VALUES (FALSE, NULL);
```

## 2. Crear controlador de popup

Crea el archivo `controllers/popupController.js`:

```javascript
const pool = require('../config/database'); // Tu configuración de base de datos
const path = require('path');
const fs = require('fs');

/**
 * Obtener la configuración actual del popup
 */
const obtenerConfiguracion = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT activo, imagen_url as imagenUrl FROM popup_configuracion LIMIT 1'
    );

    if (rows.length === 0) {
      // Si no existe, crear registro inicial
      await pool.query(
        'INSERT INTO popup_configuracion (activo, imagen_url) VALUES (?, ?)',
        [false, null]
      );
      return res.json({ activo: false, imagenUrl: '' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener configuración del popup:', error);
    res.status(500).json({ error: 'Error al obtener configuración del popup' });
  }
};

/**
 * Actualizar configuración del popup (activar/desactivar)
 */
const actualizarConfiguracion = async (req, res) => {
  try {
    const { activo } = req.body;

    await pool.query(
      'UPDATE popup_configuracion SET activo = ? WHERE id = 1',
      [activo]
    );

    res.json({ message: 'Configuración actualizada correctamente', activo });
  } catch (error) {
    console.error('Error al actualizar configuración del popup:', error);
    res.status(500).json({ error: 'Error al actualizar configuración del popup' });
  }
};

/**
 * Subir imagen del popup
 */
const subirImagen = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    // Obtener la URL de la imagen (ajusta según tu configuración)
    const imagenUrl = `/uploads/popup/${req.file.filename}`;

    // Eliminar imagen anterior si existe
    const [config] = await pool.query(
      'SELECT imagen_url FROM popup_configuracion WHERE id = 1'
    );

    if (config.length > 0 && config[0].imagen_url) {
      const oldImagePath = path.join(__dirname, '..', 'public', config[0].imagen_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Actualizar base de datos
    await pool.query(
      'UPDATE popup_configuracion SET imagen_url = ? WHERE id = 1',
      [imagenUrl]
    );

    res.json({
      message: 'Imagen subida correctamente',
      imagenUrl
    });
  } catch (error) {
    console.error('Error al subir imagen del popup:', error);
    res.status(500).json({ error: 'Error al subir imagen del popup' });
  }
};

/**
 * Eliminar imagen del popup
 */
const eliminarImagen = async (req, res) => {
  try {
    // Obtener imagen actual
    const [config] = await pool.query(
      'SELECT imagen_url FROM popup_configuracion WHERE id = 1'
    );

    if (config.length > 0 && config[0].imagen_url) {
      const imagePath = path.join(__dirname, '..', 'public', config[0].imagen_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Actualizar base de datos
    await pool.query(
      'UPDATE popup_configuracion SET imagen_url = NULL, activo = FALSE WHERE id = 1'
    );

    res.json({ message: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar imagen del popup:', error);
    res.status(500).json({ error: 'Error al eliminar imagen del popup' });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
  subirImagen,
  eliminarImagen
};
```

## 3. Configurar multer para subir archivos

Crea el archivo `middleware/uploadPopup.js`:

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio si no existe
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'popup');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'popup-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

## 4. Crear rutas

Crea el archivo `routes/popupRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const popupController = require('../controllers/popupController');
const upload = require('../middleware/uploadPopup');
const { verificarToken, verificarAdmin } = require('../middleware/auth'); // Tus middlewares de autenticación

// Ruta pública para obtener configuración (sin autenticación)
router.get('/configuracion', popupController.obtenerConfiguracion);

// Rutas protegidas (solo admin)
router.put('/configuracion', verificarToken, verificarAdmin, popupController.actualizarConfiguracion);
router.post('/imagen', verificarToken, verificarAdmin, upload.single('imagen'), popupController.subirImagen);
router.delete('/imagen', verificarToken, verificarAdmin, popupController.eliminarImagen);

module.exports = router;
```

## 5. Registrar rutas en tu app principal

En tu archivo `app.js` o `server.js`, agrega:

```javascript
const popupRoutes = require('./routes/popupRoutes');

// ... otras configuraciones

app.use('/backend_api/popup', popupRoutes);
```

## 6. Instalar dependencias (si no las tienes)

```bash
npm install multer
```

## Notas importantes:

1. **Ajusta las rutas** según la estructura de tu backend
2. **Ajusta los middlewares de autenticación** (`verificarToken`, `verificarAdmin`) según tu implementación
3. **Asegúrate de servir archivos estáticos** desde la carpeta `public`:
   ```javascript
   app.use(express.static('public'));
   ```
4. La ruta `/configuracion` es **pública** para que cualquier usuario pueda ver el popup
5. Las rutas de modificación están **protegidas** y requieren autenticación de administrador

## Estructura de directorios del backend:

```
backend/
├── config/
│   └── database.js
├── controllers/
│   └── popupController.js
├── middleware/
│   ├── auth.js
│   └── uploadPopup.js
├── routes/
│   └── popupRoutes.js
├── public/
│   └── uploads/
│       └── popup/
│           └── (aquí se guardan las imágenes)
└── app.js
```
