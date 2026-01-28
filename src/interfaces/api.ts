export interface User{
  id:number,
  email:string,
  username:string,
  password:string,
  
  imageUrl:string,
  role:number,
  suggestion?:string,
  key?:string,
}