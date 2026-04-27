import * as v from 'valibot';

/**
 * SCHEMA FORM FIELD
 * Valida la struttura di un campo dinamico del form
 */
export const FormFieldSchema = v.object({
  type: v.string(),
  key: v.string(),
  label: v.string(),
  value: v.union([v.string(), v.number(), v.boolean()]),
  placeholder: v.optional(v.string()),
  message: v.optional(v.string()),
  options: v.optional(
    v.array(
      v.object({
        label: v.string(),
        value: v.union([v.string(), v.number()])
      })
    )
  ),
  asterisk: v.optional(v.boolean()),
  validation: v.optional(v.function()),
  errorMessage: v.optional(v.string())
});

/**
 * SCHEMA USER
 * Valida l'oggetto Utente completo
 */
export const UserSchema = v.object({
  id: v.number(),
  email: v.pipe(v.string(), v.email()),
  username: v.pipe(v.string(), v.minLength(3)),
  password: v.pipe(v.string(), v.minLength(8)),
  imageUrl: v.string(),
  role: v.pipe(v.number(), v.minValue(0), v.maxValue(2)),
  suggestion: v.optional(v.string()),
  key: v.optional(v.string())
});

/**
 * INFERENZA DEI TIPI (per JSDoc/IDE)
 * Anche se rinunci a TS, queste definizioni permettono a VS Code 
 * di darti l'autocompletamento perfetto.
 * @typedef {v.InferOutput<typeof FormFieldSchema>} FormField
 * @typedef {v.InferOutput<typeof UserSchema>} User
 */
