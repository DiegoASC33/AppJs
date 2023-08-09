const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const conexion = require("../database/db");
const promisify = require("util");
const req = require("express/lib/request");
const res = require("express/lib/response");
const { error } = require("console");
const {swal} = require('sweetalert')

exports.register = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let passHash = await bcryptjs.hash(password, 8);
    const rol = req.body.rol;
    const nombre = req.body.nombre;

    conexion.query("INSERT INTO usuario SET ?",{email: email, contraseña: passHash, rol:rol, nombre:nombre},
      (error, results) => {
        if (error) {
          console.log(error);
        }
        res.redirect("/login");
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.render('login', {
        alert: true,
        alertTitle: "Error",
        alertMessage: "Ingrese un usuario y contraseña",
        alertIcon: "info",
        showConfirmButton: true,
        timer: false,
        ruta: 'login',
      })
      
    } else {
      conexion.query('SELECT * FROM usuario WHERE email = ?',[email],async (error, results) => {
          if (results.length == 0 || !(await bcryptjs.compare(password, results[0].contraseña))) {
            res.render('login', {
              alert:true,
              alertTitle: "Error",
              alertMessage: "Usuario y/o Password incorrectas",
              alertIcon: "error",
              showConfirmButton: true,
              timer: false,
              ruta: "login"
            })
            //inicio de sesion ok
          } else {
            const id = results[0].id;
            const rol = results[0].rol;
            const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
              expiresIn: process.env.JWT_TIEMPO_EXPIRACION,
            })
            console.log("TOKEN:" + token + "para usuario:" + email);

            const cookiesOptions = {
              expires: new Date(
                Date.now() +
                  process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                  httpOnly: true,
            }
            res.cookie('jwt', token, cookiesOptions)
            res.render('login',{
              alert: true,
              alertTitle: "Conexión exitosa",
              alertMessage: "¡LOGIN CORRECTO!",
              alertIcon: "success",
              showConfirmButton: false,
              timer: 800,
              ruta:"perfil"
            })
          }
        })
    }
  } catch (error) {
    console.log(error);
  }
};

exports.isAuthenticated = async (req,res,next) =>{
  if(req.cookies.jwt){
    try{
      const decodificada = await(jwt.promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO))
      conexion.query('SELECT * FROM usuario WHERE id = ?', [decodificada.id],(error,results) =>{
        if(!results){return next()}
        req.email = results[0]
        return next()
      })
    } catch(error){
      //console.log(error)
      return next()
    }
  }else{
      res.redirect('/login')
    }
  }

exports.cerrarSesion = (req,res)=>{
  res.clearCookie('jwt')
  return res.redirect('/')
}

//Metodos para el CRUD

exports.update = (req, res)=>{
  const id = req.body.id;
  const email = req.body.email;
  const password = req.body.password;
  const rol = req.body.rol;
  const nombre = req.body.nombre;
  conexion.query('UPDATE usuario SET ? WHERE id = ?',[{email:email,contraseña:password,rol:rol,nombre:nombre}, id], (error, results)=>{
      if(error){
          console.log(error);
      }else{           
          res.redirect('/perfil');         
      } 
});
};