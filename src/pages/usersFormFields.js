import * as v from 'valibot';
import { UsernameSchema, EmailSchema, PasswordSchema, RoleSchema } from '../tools/schemas';

export default function usersFormFields() {
  return [
    {
      type: 'text',
      key: 'username',
      label: 'Username',
      value: '',
      placeholder: 'Es: mario88',
      asterisk: true,
      validation(value) {
        const result = v.safeParse(UsernameSchema, value);
        if (!result.success) {
          this.errorMessage = result.issues[0].message;
          return false;
        }
        return true;
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
      validation(value) {
        const result = v.safeParse(EmailSchema, value);
        if (!result.success) {
          this.errorMessage = result.issues[0].message;
          return false;
        }
        return true;
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
      validation(value) {
        const result = v.safeParse(PasswordSchema, value);
        if (!result.success) {
          this.errorMessage = result.issues[0].message;
          return false;
        }
        return true;
      },
      errorMessage: 'La password deve contenere tra 8 e 16 caratteri'
    },
    {
      type: 'select',
      key: 'role',
      label: 'Ruolo',
      value: 2,
      asterisk: true,
      validation(value) {
        const result = v.safeParse(RoleSchema, value);
        if (!result.success) {
          this.errorMessage = result.issues[0].message;
          return false;
        }
        return true;
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
