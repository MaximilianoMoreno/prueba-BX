
## Para correr el sistema

Abrir una terminal en la carpeta raiz del proyecto y ejecutar 

`node server.js`

en otra terminal correr en simultaneo 

`npm start`

## Para iniciar sesion en el sistema
* user: `test@test.com` 
* password: `123456` 

## Para crear usuarios
No se implemento la funcion de register usuario pero se puede hacer un POST a 
*  `http://localhost:8080/api/v1/admin/register` 
* con datos de la siguiente manera  
`{
   "email": "nombre@tmail.com",
   "nombre": "tester nro 1",
   "password": "pass1234"
 }` 
 
 
 Nota: 
 ante el cambio en la API propuesta (como restriccion a los usuario gratuitos no se puede cambiar la currency de base), me vi obligado a invertir el orden del enunciado. La aplicacion realiza conversiones de Euros a Dolares. 
  
