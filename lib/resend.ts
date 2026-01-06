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
          
          <a href="https://danirusev.com" style="display: inline-block; background-color: #bef264; color: #020617; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 900; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">
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
  voucherConfirmed: (params: {
    to: string,
    experienceName: string,
    recipientName: string,
    experienceDate: string,
    expiryDate: string,
    voucherUrl: string
  }) => ({
    from: `${STORE_NAME} <${STORE_EMAIL}>`,
    to: params.to,
    subject: `Вашият ваучер за ${params.experienceName} е готов!`,
    html: `
      <div style="background-color: #020617; color: #f8fafc; font-family: sans-serif; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border-top: 4px solid #bef264; border-radius: 12px; padding: 40px; border-left: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; text-align: center;">
          <h1 style="color: #bef264; font-size: 28px; font-weight: 800; margin-bottom: 8px; text-transform: uppercase;">${STORE_NAME}</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 2px;">Вашият ваучер е потвърден</p>
          
          <div style="background: rgba(190, 242, 100, 0.05); border: 1px dashed rgba(190, 242, 100, 0.2); border-radius: 16px; padding: 32px; margin-bottom: 32px; text-align: left;">
            <h2 style="font-size: 20px; margin-top: 0; margin-bottom: 24px; color: #ffffff; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">Детайли на ваучера</h2>
            
            <div style="margin-bottom: 16px;">
              <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Преживяване</span>
              <span style="color: #f8fafc; font-size: 18px; font-weight: 900; text-transform: uppercase;">${params.experienceName}</span>
            </div>
            
            <div style="margin-bottom: 16px;">
              <span style="color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Получател</span>
              <span style="color: #f8fafc; font-size: 16px; font-weight: 700;">${params.recipientName}</span>
            </div>
            
            <div style="display: table; width: 100%; margin-top: 24px;">
              <div style="display: table-cell; width: 50%;">
                <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Дата на преживяване</span>
                <span style="color: #ffffff; font-size: 14px; font-weight: 700;">${params.experienceDate}</span>
              </div>
              <div style="display: table-cell; width: 50%;">
                <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 800; display: block; margin-bottom: 4px;">Валиден до</span>
                <span style="color: #ef4444; font-size: 14px; font-weight: 700;">${params.expiryDate}</span>
              </div>
            </div>
          </div>
          
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: center;">
            Вашият дигитален ваучер е готов. Можете да го разгледате, свалите в PDF формат или принтирате директно от вашия профил.
          </p>
          
          <a href="${params.voucherUrl}" style="display: inline-block; background-color: #bef264; color: #020617; padding: 18px 36px; text-decoration: none; border-radius: 12px; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 20px rgba(190, 242, 100, 0.3);">
            Виж моя ваучер
          </a>
          
          <div style="margin-top: 48px; border-top: 1px solid #1e293b; padding-top: 24px;">
            <p style="color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
              &copy; ${new Date().getFullYear()} ${STORE_NAME}. ПОДГОТВИ СЕ ЗА АДРЕНАЛИН.
            </p>
          </div>
        </div>
      </div>
    `,
  }),
};