const ERROR_MESSAGES: Record<string, string> = {
  AUTH_EMAIL_NOT_FOUND:          'Користувача з таким email не знайдено',
  AUTH_EMAIL_NOT_ACTIVE:         'Акаунт не активовано. Перевірте пошту',
  AUTH_EMAIL_ALREADY_ACTIVE:     'Акаунт вже активовано',
  AUTH_INCORRECT_PASSWORD:       'Невірний пароль',
  AUTH_MISSING_OLD_PASSWORD:     'Введіть поточний пароль',
  AUTH_INCORRECT_OLD_PASSWORD:   'Поточний пароль невірний',
  AUTH_EMAIL_ALREADY_EXISTS:     'Цей email вже використовується',
  AUTH_EMAIL_NOT_EXISTS:         'Email не знайдено',
  AUTH_INVALID_CONFIRM_HASH:     'Посилання недійсне або застаріле',
  AUTH_INVALID_RESET_HASH:       'Посилання для скидання пароля недійсне',
  AUTH_NEED_LOGIN_VIA_PROVIDER:  'Цей акаунт підключено через соц. мережу',
  GYM_NOT_FOUND:                 'Зал не знайдено',
  GYM_AUTO_JOIN_DISABLED:        'Цей зал не дозволяє самостійну реєстрацію',
  GYM_MEMBER_NO_MEMBERSHIP:      'Ви не є членом цього залу',
  GYM_MEMBER_INSUFFICIENT_ROLE:  'Недостатньо прав для цієї дії',
  SECTOR_NOT_FOUND:              'Сектор не знайдено',
  ROUTE_NOT_FOUND:               'Маршрут не знайдено',
  ROUTE_SECTOR_NOT_FOUND:        'Сектор не знайдено',
  ROUTE_SETTER_NOT_FOUND:        'Постановника не знайдено',
  FILE_SELECT_REQUIRED:          'Оберіть файл для завантаження',
  FILE_TYPE_NOT_ALLOWED:         'Тип файлу не підтримується',
  FILE_TOO_LARGE:                'Файл занадто великий',
  VALIDATION_ERROR:              'Перевірте правильність введених даних',
  UNAUTHORIZED:                  'Необхідна авторизація',
  FORBIDDEN:                     'Доступ заборонено',
  NOT_FOUND:                     'Не знайдено',
};

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Сталася помилка. Спробуйте ще раз';
}

export type ParsedError = {
  message: string;
  fieldErrors: Record<string, string>;
};

export function parseApiError(error: unknown): ParsedError {
  const e = error as Record<string, unknown>;

  // ApiError from apiClient interceptor: { status, message, errorCode?, errors? }
  // Raw Axios error (authAxios): { response: { data: { errorCode?, errors? } } }
  const data = (e.response as Record<string, unknown> | undefined)?.data as
    | Record<string, unknown>
    | undefined ?? e;

  const errorCode    = (data.errorCode ?? '') as string;
  const rawErrors    = (data.errors ?? {}) as Record<string, string>;
  const fallbackMsg  = (data.message ?? e.message ?? 'Сталася помилка') as string;

  const fieldErrors: Record<string, string> = {};
  for (const [field, code] of Object.entries(rawErrors)) {
    fieldErrors[field] = getErrorMessage(code);
  }

  const message = errorCode
    ? (ERROR_MESSAGES[errorCode] ?? fallbackMsg)
    : fallbackMsg;

  return { message, fieldErrors };
}
