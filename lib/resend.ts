import { Resend } from 'resend';

// Initialize Resend with API key
export const resend = new Resend(process.env.RESEND_API_KEY);

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Dani Rusev 11';
const STORE_EMAIL = process.env.NEXT_PUBLIC_STORE_EMAIL || 'noreply@shop.danirusev.com';

// Email templates
export const emailTemplates = {
  confirmEmail: (to: string, confirmationUrl: string) => ({
    from: `${STORE_NAME} <${STORE_EMAIL}>`,
    to,
    subject: `Потвърдете вашия имейл - ${STORE_NAME}`,
    html: `
      <div style="background-color: #020617; color: #f8fafc; font-family: sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b; text-align: center;">
          <h1 style="color: #bef264; font-size: 28px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">${STORE_NAME}</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">Изживей скоростта. Почувствай адреналина.</p>
          
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #ffffff;">Добре дошли в отбора!</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Благодарим ви, че се регистрирахте. Моля, потвърдете вашия имейл адрес, за да активирате акаунта си и да започнете вашето адреналиново приключение.
          </p>
          
          <a href="${confirmationUrl}" style="display: inline-block; background-color: #bef264; color: #020617; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
            Потвърди имейл
          </a>
          
          <div style="margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 24px;">
            <p style="color: #64748b; font-size: 14px;">
              Ако не сте създали акаунт в ${STORE_NAME}, можете спокойно да игнорирате този имейл.
            </p>
            <p style="color: #475569; font-size: 12px; margin-top: 16px;">
              &copy; ${new Date().getFullYear()} ${STORE_NAME}. Всички права запазени.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  resetPassword: (to: string, resetUrl: string) => ({
    from: `${STORE_NAME} <${STORE_EMAIL}>`,
    to,
    subject: `Нулиране на парола - ${STORE_NAME}`,
    html: `
      <div style="background-color: #020617; color: #f8fafc; font-family: sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b; text-align: center;">
          <h1 style="color: #bef264; font-size: 28px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">${STORE_NAME}</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">Изживей скоростта. Почувствай адреналина.</p>
          
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #ffffff;">Забравена парола?</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Няма проблем! Кликнете върху бутона по-долу, за да зададете нова парола за вашия акаунт и да се върнете на пистата.
          </p>
          
          <a href="${resetUrl}" style="display: inline-block; background-color: #bef264; color: #020617; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
            Нулиране на парола
          </a>
          
          <div style="margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 24px;">
            <p style="color: #64748b; font-size: 14px;">
              Ако не сте поискали нулиране на паролата, можете спокойно да игнорирате този имейл.
            </p>
            <p style="color: #475569; font-size: 12px; margin-top: 16px;">
              &copy; ${new Date().getFullYear()} ${STORE_NAME}. Всички права запазени.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  welcome: (to: string, name: string) => ({
    from: `${STORE_NAME} <${STORE_EMAIL}>`,
    to,
    subject: `Добре дошли в ${STORE_NAME}!`,
    html: `
      <div style="background-color: #020617; color: #f8fafc; font-family: sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b; text-align: center;">
          <h1 style="color: #bef264; font-size: 28px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">${STORE_NAME}</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">Изживей скоростта. Почувствай адреналина.</p>
          
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #ffffff;">Добре дошли, ${name}!</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Радваме се, че се присъединихте към нас. В ${STORE_NAME} вярваме, че животът трябва да бъде изпълнен с адреналин, скорост и незабравими моменти на пистата.
          </p>
          
          <a href="https://danirusev.vercel.app" style="display: inline-block; background-color: #bef264; color: #020617; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
            Разгледай преживяванията
          </a>
          
          <div style="margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 24px;">
            <p style="color: #64748b; font-size: 14px;">
              Ако имате въпроси, не се колебайте да се свържете с нас.
            </p>
            <p style="color: #475569; font-size: 12px; margin-top: 16px;">
              &copy; ${new Date().getFullYear()} ${STORE_NAME}. Всички права запазени.
            </p>
          </div>
        </div>
      </div>
    `,
  }),

  resetInstructions: (to: string) => ({
    from: `${STORE_NAME} <${STORE_EMAIL}>`,
    to,
    subject: `Нулиране на парола - ${STORE_NAME}`,
    html: `
      <div style="background-color: #020617; color: #f8fafc; font-family: sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; padding: 40px; border: 1px solid #1e293b; text-align: center;">
          <h1 style="color: #bef264; font-size: 28px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">${STORE_NAME}</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 1px;">Изживей скоростта. Почувствай адреналина.</p>
          
          <h2 style="font-size: 24px; margin-bottom: 16px; color: #ffffff;">Нулиране на парола</h2>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
            Получихме заявка за нулиране на паролата за вашия акаунт. Ще получите втори имейл с директна връзка за промяна на паролата в рамките на няколко минути.
          </p>
          
          <div style="margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 24px;">
            <p style="color: #64748b; font-size: 14px;">
              Ако не сте поискали нулиране на паролата, можете спокойно да игнорирате този имейл.
            </p>
            <p style="color: #475569; font-size: 12px; margin-top: 16px;">
              &copy; ${new Date().getFullYear()} ${STORE_NAME}. Всички права запазени.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
}; 