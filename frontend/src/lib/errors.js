const MESSAGES = {
  INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
  EMAIL_TAKEN: 'Este e-mail já está cadastrado.',
  MISSING_FIELDS: 'Preencha todos os campos obrigatórios.',
  UNAUTHENTICATED: 'Sua sessão expirou. Entre novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
};

export function friendlyError(err) {
  if (!err) return 'Ocorreu um erro inesperado.';
  if (err.code && MESSAGES[err.code]) return MESSAGES[err.code];
  return err.message || 'Ocorreu um erro inesperado.';
}
