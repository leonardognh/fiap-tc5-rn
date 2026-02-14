import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  "pt-BR": {
    translation: {
      settings: {
        title: "Configurações",
        profile: "Perfil",
        appearance: "Aparência",
        loading: "Carregando...",
        no_name: "Sem nome",
        email_unavailable: "E-mail não disponível",
        edit: "Editar",
        cancel: "Cancelar",
        save: "Salvar",
        placeholder_name: "Nome",
        placeholder_email: "E-mail",
        placeholder_avatar: "URL do avatar",
        change_password: "Alterar senha (opcional)",
        new_password: "Nova senha",
        confirm_password: "Confirmar senha",
        password_mismatch: "As senhas não coincidem.",
        theme: "Tema",
        language: "Idioma",
        themes: {
          light: "Claro",
          dark: "Escuro",
          system: "Sistema",
        },
        errors: {
          title: "Erro",
        },
      },
    },
  },
  "en-US": {
    translation: {
      settings: {
        title: "Settings",
        profile: "Profile",
        appearance: "Appearance",
        loading: "Loading...",
        no_name: "No name",
        email_unavailable: "Email unavailable",
        edit: "Edit",
        cancel: "Cancel",
        save: "Save",
        placeholder_name: "Name",
        placeholder_email: "Email",
        placeholder_avatar: "Avatar URL",
        change_password: "Change password (optional)",
        new_password: "New password",
        confirm_password: "Confirm password",
        password_mismatch: "Passwords do not match.",
        theme: "Theme",
        language: "Language",
        themes: {
          light: "Light",
          dark: "Dark",
          system: "System",
        },
        errors: {
          title: "Error",
        },
      },
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "pt-BR",
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
