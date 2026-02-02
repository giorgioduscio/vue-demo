import type { FormField } from "../interfaces/private";


export default function usersFormFields() :FormField[] {
  return[
      {
        type: 'text',
        key: 'username',
        label: 'Username',
        value: '',
        placeholder: 'Es: mario88',
        asterisk: true,
        validation(value: string) {
          return value.trim().length > 0;
        },
        errorMessage: 'Il campo username è obbligatorio'
      },
      {
        type: 'email',
        key: 'email',
        label: 'Email',
        value: '',
        placeholder: 'Es: mario@gmail.com',
        asterisk: true,
        validation(value: string) {
          return value.trim().includes('@') && value.trim().includes('.');
        },
        errorMessage: 'Il campo deve contenere un indirizzo email valido'
      },
      {
        type: 'password',
        key: 'password',
        label: 'Password',
        value: '',
        placeholder: 'Es: Password123!',
        asterisk: true,
        validation(value: string) {
          const password = value.trim();
          return password.length >= 8 && password.length <= 16;
        },
        errorMessage: 'La password deve contenere tra 8 e 16 caratteri'
      },
      {
        type: 'select',
        key: 'role',
        label: 'Ruolo',
        value: 2,
        asterisk: true,
        validation(value: number) {
          return value >= 0 && value <= 2;
        },
        options: [
          { label: 'Admin', value: 0 },
          { label: 'User', value: 1 },
          { label: 'Guest', value: 2 },
        ],
        errorMessage: 'Il ruolo deve essere compreso tra 0 e 2'
      },
      {
        type: 'textarea',
        key: 'suggestion',
        label: 'Suggerimento',
        value: '',
        placeholder: 'Es: Piatto preferito',
      }
    ]
}
