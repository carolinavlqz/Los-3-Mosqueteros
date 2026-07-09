// Solo letras (con acentos/ñ) y espacios — sin números ni caracteres especiales.
const NAME_CHARS_REGEX = /[^a-zA-ZÀ-ÿ\s]/g;

export const sanitizeName = (text) => text.replace(NAME_CHARS_REGEX, '');
