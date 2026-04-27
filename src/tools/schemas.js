import * as v from 'valibot';

// Schema per il campo Username
export const UsernameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, 'Il campo username è obbligatorio'),
  v.minLength(3, 'Lo username deve avere almeno 3 caratteri')
);

// Schema per il campo Email
export const EmailSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(1, 'Il campo email è obbligatorio'),
  v.email('Il campo deve contenere un indirizzo email valido')
);

// Schema per il campo Password
export const PasswordSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(8, 'La password deve contenere almeno 8 caratteri'),
  v.maxLength(16, 'La password non può superare i 16 caratteri')
);

// Schema per il campo Ruolo
export const RoleSchema = v.pipe(
  v.number(),
  v.minValue(0, 'Il ruolo non è valido'),
  v.maxValue(2, 'Il ruolo non è valido')
);

// Schema completo per la Registrazione
export const RegisterSchema = v.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  role: RoleSchema,
  suggestion: v.optional(v.string())
});

// Schema per il Login
export const LoginSchema = v.object({
  email: EmailSchema,
  password: v.pipe(v.string(), v.minLength(1, 'La password è obbligatoria'))
});
