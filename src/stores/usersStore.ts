import { defineStore } from 'pinia';
import axios from 'axios';
import { ref } from 'vue';
import type { User } from '../interfaces/api';


export const useUsersStore = defineStore('users', () => {
  const url = import.meta.env.VITE_APP_API_URL+"/users";
  const users = ref<User[]>([]);
  // Funzione per mappare i dati da Firebase
  function firebaseMapper(data: { [key: string]: User }): User[] {
    return Object.keys(data).map((key) => {
      const user = data[key];
      if(user) user.key = key;
      return user;
    })
    .filter((user) => user !== undefined);
  }

  return {
    users,
    
    // Funzione per ottenere gli utenti
    async getUsers() {
      try {
        const response = await axios.get<{ [key: string]: User }>(`${url}.json`);
        const mappedUsers = firebaseMapper(response.data);
        users.value = mappedUsers;
        // console.log('Utenti ottenuti:', users.value);
      } catch (error) {
        console.error('Errore nel recupero degli utenti:', error);
      }
    },

    async getUserById(key:string){
      try{
        const response = await axios.get<{ [key: string]: User }>(`${url}/${key}.json`);
        let mappedUsers = response.data;
        if(mappedUsers) (mappedUsers as any)['key'] = key;
        console.log('mappedUsers', mappedUsers);
        return mappedUsers;
        
      }catch(error){
        console.error('Errore nel recupero dell utente:', error);
      }
    },

    // Funzione per aggiungere un utente
    async addUser(user: User) {
      try {
        await axios.post(`${url}.json`, user);
        await this.getUsers(); // Aggiorna la lista degli utenti
        console.log('Utente aggiunto:', users.value[users.value.length - 1]);
      } catch (error) {
        console.error('Errore nell\'aggiunta dell\'utente:', error);
      }
    },

    // Funzione per eliminare un utente
    async deleteUser (userId: number) {
      try {
        const userToDelete = users.value.find((u) => u.id === userId);
        if (!userToDelete || !userToDelete.key) {
          console.error('Utente non trovato o chiave mancante per id:', userId);
          return;
        }
        const key = userToDelete.key;
        await axios.delete(`${url}/${key}.json`);
        await this.getUsers(); // Aggiorna la lista degli utenti
        console.log('Utente eliminato, id:', userId);
      } catch (error) {
        console.error('Errore nell\'eliminazione dell\'utente:', error);
      }
    },

    // Funzione per aggiornare un utente
    async patchUser (userId: number, user: User) {
      try {
        const userToUpdate = users.value.find((u) => u.id === userId);
        if (!userToUpdate || !userToUpdate.key) {
          console.error('Utente non trovato o chiave mancante per id:', userId);
          return;
        }
        const key = userToUpdate.key;
        await axios.put(`${url}/${key}.json`, user);
        await this.getUsers(); // Aggiorna la lista degli utenti
        console.log('Utente aggiornato:', user);
      } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente:', error);
      }
    },

    // Funzione per aggiornare un utente con PATCH
    async updateUser (updatedUser: User) {
      try {
        const userToUpdate = users.value.find((u) => u.id === updatedUser.id);
        if (!userToUpdate || !userToUpdate.key) {
          console.error('Utente non trovato o chiave mancante per id:', updatedUser.id);
          return;
        }
        const key = userToUpdate.key;
        await axios.patch(`${url}/${key}.json`, updatedUser);
        await this.getUsers(); // Aggiorna la lista degli utenti
        console.log('Utente aggiornato con PATCH:', updatedUser);
      } catch (error) {
        console.error('Errore nell\'aggiornamento dell\'utente con PATCH:', error);
      }
    },
  };
});
