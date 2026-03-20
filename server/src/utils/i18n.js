// Bilingual error messages (EN/AR)
const messages = {
  // Auth errors
  'auth.invalidCredentials': {
    en: 'Invalid email or password',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  },
  'auth.accountLocked': {
    en: 'Account temporarily locked due to too many failed attempts. Please try again later.',
    ar: 'تم قفل الحساب مؤقتاً بسبب محاولات فاشلة متعددة. يرجى المحاولة لاحقاً.',
  },
  'auth.emailNotVerified': {
    en: 'Please verify your email address before continuing.',
    ar: 'يرجى التحقق من بريدك الإلكتروني قبل المتابعة.',
  },
  'auth.tokenExpired': {
    en: 'Your session has expired. Please log in again.',
    ar: 'انتهت صلاحية جلستك. يرجى تسجيل الدخول مجدداً.',
  },
  'auth.unauthorized': {
    en: 'You must be logged in to access this resource.',
    ar: 'يجب تسجيل الدخول للوصول إلى هذا المورد.',
  },
  'auth.forbidden': {
    en: 'You do not have permission to access this resource.',
    ar: 'ليس لديك صلاحية للوصول إلى هذا المورد.',
  },
  'auth.loggedOut': {
    en: 'Logged out successfully.',
    ar: 'تم تسجيل الخروج بنجاح.',
  },
  'auth.loggedOutAll': {
    en: 'Logged out of all devices successfully.',
    ar: 'تم تسجيل الخروج من جميع الأجهزة بنجاح.',
  },
  'auth.passwordChanged': {
    en: 'Password changed successfully. Please log in again.',
    ar: 'تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.',
  },
  'auth.passwordResetSent': {
    en: 'If an account with that email exists, a reset link has been sent.',
    ar: 'إذا كان هناك حساب بهذا البريد الإلكتروني، فقد تم إرسال رابط إعادة التعيين.',
  },
  'auth.passwordResetSuccess': {
    en: 'Password reset successfully. Please log in with your new password.',
    ar: 'تم إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول بكلمة المرور الجديدة.',
  },
  'auth.invalidResetToken': {
    en: 'Invalid or expired reset link. Please request a new one.',
    ar: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.',
  },

  // Registration
  'register.success': {
    en: 'Account created successfully. Please check your email to verify your account.',
    ar: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.',
  },
  'register.emailExists': {
    en: 'An account with this email already exists.',
    ar: 'يوجد حساب بهذا البريد الإلكتروني بالفعل.',
  },
  'register.contactRequired': {
    en: 'At least one contact method is required (phone, WhatsApp, or Telegram).',
    ar: 'يجب توفير طريقة تواصل واحدة على الأقل (هاتف، واتساب، أو تيليجرام).',
  },

  // Email verification
  'email.verified': {
    en: 'Email verified successfully.',
    ar: 'تم التحقق من البريد الإلكتروني بنجاح.',
  },
  'email.invalidToken': {
    en: 'Invalid or expired verification link.',
    ar: 'رابط التحقق غير صالح أو منتهي الصلاحية.',
  },
  'email.alreadyVerified': {
    en: 'Email is already verified.',
    ar: 'البريد الإلكتروني مُتحقق منه بالفعل.',
  },
  'email.verificationSent': {
    en: 'Verification email sent. Please check your inbox.',
    ar: 'تم إرسال بريد التحقق. يرجى مراجعة صندوق الوارد.',
  },
  'email.resendLimit': {
    en: 'Too many verification requests. Please try again later.',
    ar: 'طلبات تحقق كثيرة جداً. يرجى المحاولة لاحقاً.',
  },

  // Enrollment
  'enrollment.pending': {
    en: 'Your enrollment request is pending review.',
    ar: 'طلب التسجيل قيد المراجعة.',
  },
  'enrollment.approved': {
    en: 'Your enrollment has been approved! Welcome to Daris.',
    ar: 'تمت الموافقة على تسجيلك! أهلاً بك في دارس.',
  },
  'enrollment.rejected': {
    en: 'Your enrollment request was not approved.',
    ar: 'لم تتم الموافقة على طلب تسجيلك.',
  },
  'enrollment.approvedAdmin': {
    en: 'Student enrollment approved successfully.',
    ar: 'تمت الموافقة على تسجيل الطالب بنجاح.',
  },
  'enrollment.rejectedAdmin': {
    en: 'Enrollment request rejected.',
    ar: 'تم رفض طلب التسجيل.',
  },

  // Student
  'student.notFound': {
    en: 'Student not found.',
    ar: 'لم يتم العثور على الطالب.',
  },
  'student.suspended': {
    en: 'Student has been suspended.',
    ar: 'تم تعليق الطالب.',
  },
  'student.removed': {
    en: 'Student has been removed.',
    ar: 'تم إزالة الطالب.',
  },
  'student.profileUpdated': {
    en: 'Profile updated successfully.',
    ar: 'تم تحديث الملف الشخصي بنجاح.',
  },

  // Schedule
  'schedule.created': {
    en: 'Class session created successfully.',
    ar: 'تم إنشاء الحصة الدراسية بنجاح.',
  },
  'schedule.updated': {
    en: 'Class session updated successfully.',
    ar: 'تم تحديث الحصة الدراسية بنجاح.',
  },
  'schedule.deleted': {
    en: 'Class session deleted successfully.',
    ar: 'تم حذف الحصة الدراسية بنجاح.',
  },
  'schedule.cancelled': {
    en: 'Class has been cancelled. Students will be notified.',
    ar: 'تم إلغاء الحصة. سيتم إخطار الطلاب.',
  },

  // General
  'error.generic': {
    en: 'Something went wrong. Please try again later.',
    ar: 'حدث خطأ ما. يرجى المحاولة لاحقاً.',
  },
  'error.validation': {
    en: 'Please check your input and try again.',
    ar: 'يرجى مراجعة المدخلات والمحاولة مجدداً.',
  },
  'error.notFound': {
    en: 'Resource not found.',
    ar: 'لم يتم العثور على المورد.',
  },
  'error.tooManyRequests': {
    en: 'Too many requests. Please try again later.',
    ar: 'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.',
  },
};

/**
 * Get bilingual message by key
 * @param {string} key - Message key (e.g., 'auth.invalidCredentials')
 * @param {string} lang - Language code ('en' or 'ar'), defaults to both
 * @returns {{ en: string, ar: string } | string}
 */
export function t(key, lang = null) {
  const msg = messages[key];
  if (!msg) return lang ? key : { en: key, ar: key };
  if (lang) return msg[lang] || key;
  return msg;
}

/**
 * Extract preferred language from Accept-Language header or query
 */
export function getLang(req) {
  // Check query param first
  if (req.query?.lang === 'ar') return 'ar';
  if (req.query?.lang === 'en') return 'en';

  // Check Accept-Language header
  const acceptLang = req.headers['accept-language'] || '';
  if (acceptLang.startsWith('ar')) return 'ar';
  return 'en';
}
