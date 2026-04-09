# Diagnóstico Completo: Base de Datos y Login
## Sistema de Mediciones TermProtect - Abril 2026

---

## 1. PROBLEMA IDENTIFICADO

El código de la app solo utiliza **2 tablas** (`profiles` y `routes`), pero en Supabase se crearon las tablas del esquema relacional completo del documento de arquitectura (jornadas, clientes, mediciones, ventanas, etc.). Estas tablas adicionales **no se usan en el código actual**.

---

## 2. TABLAS QUE EL CÓDIGO NECESITA

### 2.1 Tabla `profiles`

El código la consulta en `AuthContext.jsx` línea 45-49:

```sql
-- Crear la tabla profiles (si no existe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'logistica', 'medidor')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Tabla `routes`

El código la consulta en `utils.js` líneas 41-72:

```sql
-- Crear la tabla routes (si no existe)
CREATE TABLE IF NOT EXISTS public.routes (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  city TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT DEFAULT 'borrador',
  created_by TEXT,
  clients JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 3. SCRIPTS DE DIAGNÓSTICO (ejecutar en SQL Editor de Supabase)

### 3.1 Ver todas las tablas existentes

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 3.2 Ver usuarios registrados en Auth

```sql
SELECT id, email, created_at, last_sign_in_at,
       raw_user_meta_data->>'username' as meta_username,
       raw_user_meta_data->>'role' as meta_role,
       raw_user_meta_data->>'name' as meta_name
FROM auth.users
ORDER BY created_at;
```

### 3.3 Ver si la tabla profiles existe y su contenido

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Si existe, ver su contenido:
SELECT * FROM public.profiles;
```

### 3.4 Ver si la tabla routes existe y su estructura

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'routes' AND table_schema = 'public';
```

### 3.5 Verificar estado de RLS en todas las tablas

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### 3.6 Ver políticas RLS existentes

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 4. SCRIPTS DE CORRECCIÓN

### 4.1 Crear tabla profiles (si no existe)

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'director', 'logistica', 'medidor')),
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: cada usuario puede leer su propio perfil
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Política: admins y directors pueden leer todos los perfiles
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'director')
    )
  );
```

### 4.2 Crear tabla routes (si no existe)

```sql
CREATE TABLE IF NOT EXISTS public.routes (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL,
  city TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT DEFAULT 'borrador',
  created_by TEXT,
  clients JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Política: todos los autenticados pueden leer rutas
CREATE POLICY "Authenticated users can read routes" ON public.routes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política: todos los autenticados pueden insertar rutas
CREATE POLICY "Authenticated users can insert routes" ON public.routes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política: todos los autenticados pueden actualizar rutas
CREATE POLICY "Authenticated users can update routes" ON public.routes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política: todos los autenticados pueden eliminar rutas
CREATE POLICY "Authenticated users can delete routes" ON public.routes
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 4.3 Insertar registros en profiles para cada usuario de Auth

**IMPORTANTE:** Reemplaza los UUIDs con los reales de tus usuarios en Authentication > Users.

```sql
-- Primero verifica los UUIDs de tus usuarios:
SELECT id, email FROM auth.users ORDER BY email;

-- Luego inserta los perfiles (reemplaza los UUIDs):
INSERT INTO public.profiles (id, username, name, role, city) VALUES
  ('UUID_DE_ADMIN', 'admin', 'Wiston Bastidas', 'admin', NULL),
  ('UUID_DE_NEIDER', 'neider', 'Neider', 'director', NULL),
  ('UUID_DE_MADRID', 'madrid', 'Moisés', 'logistica', 'madrid'),
  ('UUID_DE_VALENCIA', 'valencia', 'Juan Pablo', 'logistica', 'valencia'),
  ('UUID_DE_BARCELONA', 'barcelona', 'Lucho', 'logistica', 'barcelona'),
  ('UUID_DE_MALAGA', 'malaga', 'Málaga', 'logistica', 'malaga'),
  ('UUID_DE_JESUS', 'jesus', 'Jesús', 'medidor', 'madrid'),
  ('UUID_DE_SERIOJA', 'serioja', 'Serioja', 'medidor', 'all'),
  ('UUID_DE_LUCIANO', 'luciano', 'Luciano', 'medidor', 'valencia'),
  ('UUID_DE_MIGUEL', 'miguel', 'Miguel', 'medidor', 'barcelona')
ON CONFLICT (id) DO NOTHING;
```

### 4.4 Trigger automático para crear perfil al registrar usuario

```sql
-- Función que crea perfil automáticamente al crear usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, name, role, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'medidor'),
    NEW.raw_user_meta_data->>'city'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que ejecuta la función al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 5. MAPEO DE USUARIOS: Código vs Supabase

El código en `constants.js` tiene estos usuarios hardcodeados que se usan para mapear IDs:

| ID Legacy | Username | Email que debe existir en Auth | Rol | Ciudad |
|-----------|----------|-------------------------------|-----|--------|
| admin1 | admin | admin@termprotect.es | admin | — |
| dir1 | neider | neider@termprotect.es | director | — |
| log_mad | madrid | madrid@termprotect.es | logistica | madrid |
| log_val | valencia | valencia@termprotect.es | logistica | valencia |
| log_bcn | barcelona | barcelona@termprotect.es | logistica | barcelona |
| log_mlg | malaga | malaga@termprotect.es | logistica | malaga |
| med_jesus | jesus | jesus@termprotect.es | medidor | madrid |
| med_serioja | serioja | serioja@termprotect.es | medidor | all |
| med_luciano | luciano | luciano@termprotect.es | medidor | valencia |
| med_miguel | miguel | miguel@termprotect.es | medidor | barcelona |

---

## 6. CHECKLIST DE VERIFICACIÓN

- [ ] Los 10 usuarios existen en Authentication > Users con emails @termprotect.es
- [ ] Los usuarios tienen "Email confirmed" activado
- [ ] La tabla `profiles` existe con las columnas correctas (id, username, name, role, city)
- [ ] Cada usuario de Auth tiene un registro correspondiente en `profiles`
- [ ] La tabla `routes` existe con las columnas correctas
- [ ] RLS tiene políticas configuradas en ambas tablas
- [ ] Las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están configuradas en Vercel
