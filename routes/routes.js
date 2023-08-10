const express = require("express");
const router = express.Router();
const crudController = express('../controllers/crudController')
const authController = require("../controllers/authController");
const { get } = require("express/lib/response");
const conexion = require("../database/db");
const req = require("express/lib/request");


//Pagina inicial
router.get("/", (req, res) => {
  res.render("index");
});

//Ruta para el Login
router.get("/login", (req, res) => {
  res.render("login",{alert:false});
});

//Ruta para obtener el formulario de registro
router.get("/registro", (req, res) => {
  res.render("registro");
});


//Ruta para mostrar toda la información de los usuarios (usuario administrador)
router.get("/perfil", authController.isAuthenticated,(req, res) => {
  conexion.query('SELECT * FROM usuario',(error,results)=>{
    if(error){
      throw error;
    }else{
      res.render("perfil",{results:results});
    }
    })
  });

//ruta para mostrar la información del usuario estandar
router.get("/perfilEstandar",authController.isAuthenticated,(req,res)=>{
  res.render("perfilEstandar", {usuario: req.usuario})
} );

//Ruta de edicion de usuario seleccionado
router.get('/editInfoAdmin/:id', authController.isAuthenticated,(req,res)=>{
  const id = req.params.id;
  conexion.query('SELECT * FROM usuario WHERE id=?',[id],(error,results)=>{
    if(error){
      throw error;
    }else{
      res.render('editInfoAdmin',{usuario:results[0]})
    }
  })
});

//ruta para eliminar usuario seleccionado 
router.get('/delete/:id', authController.isAuthenticated,(req,res)=>{
  const id = req.params.id;
  conexion.query('DELETE FROM usuario WHERE id =?',[id],(error,results)=>{
    if(error){
      throw error;
    }else{
      res.redirect('/perfil')
    }
  })
});

router.post('/registro',authController.register)
router.post('/login',authController.login)
router.post('/update', authController.update)
router.get('/cerrarSesion',authController.cerrarSesion)
router.get('/logout', authController.cerrarSesion)
module.exports = router;
