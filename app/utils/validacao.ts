import type { TypedSchema } from 'vee-validate'
import type { z } from 'zod'

/**
 * Adapta um schema do zod 4 para o vee-validate.
 * (O @vee-validate/zod oficial só suporta zod 3.)
 */
export function schemaZod<S extends z.ZodType>(schema: S): TypedSchema<z.input<S>, z.output<S>> {
  return {
    __type: 'VVTypedSchema',
    async parse(valores) {
      const resultado = await schema.safeParseAsync(valores)
      if (resultado.success) return { value: resultado.data, errors: [] }

      const porCampo = new Map<string, string[]>()
      for (const { path, message } of resultado.error.issues) {
        const campo = path.join('.')
        porCampo.set(campo, [...(porCampo.get(campo) ?? []), message])
      }
      return { errors: [...porCampo].map(([path, errors]) => ({ path, errors })) }
    },
  }
}
