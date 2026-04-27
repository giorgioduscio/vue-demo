import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import * as v from 'valibot';
import { UserSchema } from '../interfaces/interfaces';

/** @typedef {import('../interfaces/interfaces').User} User */

export const useUsersStore = defineStore('users', () => {
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  
  if (!apiUrl) {
    console.error('ERRORE: VITE_APP_API_URL non definita nel file .env!');
  }

  const url = `${apiUrl}/users`;
  /** @type {import('vue').Ref<User[]>} */
  const users = ref([]);
  
  console.log(`Mode: ${import.meta.env.MODE}`);
  
  // Funzione per mappare e VALIDARE i dati da Firebase
  function firebaseMapper(data) {
    if (!data) return [];
    return Object.keys(data).map((key) => {
      const user = data[key];
      if(user) user.key = key;
      
      // VALIDAZIONE RUNTIME
      try {
        return v.parse(UserSchema, user);
      } catch (e) {
        console.error(`Dati utente corrotti rilevati per la chiave ${key}:`, e.issues);
        return null; 
      }
    })
    .filter((user) => user !== null);
  }

  return {
    users,
    
    async getUsers() {
      try {
        const response = await axios.get(`${url}.json`);
        const mappedUsers = firebaseMapper(response.data);
        users.value = mappedUsers;
      } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
      }
    },

    async getUserById(key){
      try{
        const response = await axios.get(`${url}/${key}.json`);
        let userData = response.data;
        if(userData) userData['key'] = key;
        
        // VALIDAZIONE RUNTIME
        const validatedUser = v.parse(UserSchema, userData);
        console.log('Utente validato:', validatedUser);
        return validatedUser;
        
      }catch(error){
        console.error('Errore nel recupero o validazione dell utente:', error);
      }
    },

    /** @param {User} user */
    async addUser(user) {
      try {
        // VALIDAZIONE PRIMA DI INVIARE
        const validatedUser = v.parse(UserSchema, user);
        await axios.post(`${url}.json`, validatedUser);
        await this.getUsers(); 
        console.log('Utente aggiunto e validato');
      } catch (error) {
        console.error('Errore nell\'aggiunta (fallimento validazione):', error);
      }
    },

    /** @param {number} userId */
    async deleteUser (userId) {
      try {
        const userToDelete = users.value.find((u) => u.id === userId);
        if (!userToDelete || !userToDelete.key) {
          console.error('Utente non trovato o chiave mancante per id:', userId);
          return;
        }
        const key = userToDelete.key;
        await axios.delete(`${url}/${key}.json`);
        await this.getUsers(); 
        console.log('Utente eliminato, id:', userId);
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
      }
    },

    /** @param {User} updatedUser */
    async updateUser (updatedUser) {
      try {
        // VALIDAZIONE RUNTIME
        const validatedUser = v.parse(UserSchema, updatedUser);
        const userToUpdate = users.value.find((u) => u.id === validatedUser.id);
        if (!userToUpdate || !userToUpdate.key) {
          console.error('Utente non trovato o chiave mancante per id:', validatedUser.id);
          return;
        }
        const key = userToUpdate.key;
        await axios.patch(`${url}/${key}.json`, validatedUser);
        await this.getUsers(); 
        console.log('Utente aggiornato con PATCH (validato):', validatedUser);
      } catch (error) {
        console.error('Errore nell\'aggiornamento (fallimento validazione):', error);
      }
    },
  };
});
