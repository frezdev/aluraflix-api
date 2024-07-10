import zod from 'zod'

export const videoSchema = zod.object({
  title: zod.string({
    required_error: 'El titulo es requerido',
  }),
  categoryId: zod.number(),
  image: zod.string().url({
    message: 'La url de la imagen es requerida'
  }),
  description: zod.string().min(20),
  url: zod.string().url({
    message: 'La url del video es requerida'
  }),
})

export function validateVideo (object) {
  return videoSchema.safeParseAsync(object);
}

export function validatePartialVideo (object) {
  return videoSchema.partial().safeParseAsync(object);
}