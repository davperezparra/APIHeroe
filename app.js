const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');



const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'bdd.json');


// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// O, para una configuración más específica:
// const corsOptions = {
//   origin: 'http://localhost:4200', // Permite solo peticiones desde esta origen
//   optionsSuccessStatus: 200 // algunos navegadores 204
// }
// app.use(cors(corsOptions));


// Función para leer datos del archivo JSON
async function readData() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  }

  
// Función para escribir datos en el archivo JSON
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}



// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
      const data = await readData();
      console.log(data);
      res.json(data.users);
    } catch (error) {
      res.status(500).json({ error: 'Error al leer los datos' });
    }
  });

  // Obtener un usuario con la id
  app.get('/api/usuarios/:id', async (req, res) => {
    try {
      const data = await readData();
      const usuario = data.users.find(u =>  u.id === parseInt(req.params.id));
      if(!usuario){
        return res.status(404).json({error:'Usuario no encontrado'});
      }
      // console.log(data);
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al leer los datos' });
    }
  });


  // Obtener todos los Heroes

  app.get('/api/heroes', async(req,res) => {
    try{
      const data = await readData();
      res.json(data.heroes);

    }catch(error){
      res.status(500).json({ error: 'error al leer los Heroes' });

    }
  })
 
  
  // Obtener Heroe por id

  app.get('/api/heroes/:id', async(req,res) => {
    try{
      const data = await readData();
      const heroe = data.heroes.find(u =>  u.id === req.params.id);
      if(!heroe){
        return res.status(404).json({error:'Heroe no encontrado'});
      }
      res.json(heroe);


    }catch(error){
      res.status(500).json({ error: 'error al leer los Heroes' });

    }
  })

  //   addHeroe Para agregar un heroe

  app.post('/api/heroes', async (req, res)=> {
    try {
      // leer informacion de archivo bdd.json
      const data = await readData();
      const id = uuidv4();


      /// console.log(req.body);
      const nuevoHeroe = {
        "id": id,
        "superhero": req.body.superhero,
        "publisher": req.body.publisher,
        "alter_ego": req.body.alter_ego,
        "first_appearance": req.body.first_appearance,
        "characters": req.body.characters
      };

      // console.log(nuevoHeroe);
      data.heroes.push(nuevoHeroe);

      console.log(data.heroes);
      await writeData(data);
      res.status(201).json(nuevoHeroe);
    }
    catch (error){
      res.status(500).json({ error: 'Error al escribir los datos ---' });

    }
  }) 



  

  // UpdateHeroe Para Editar Heroe

  app.patch('/api/heroes/:id', async (req, res)=> {
    try {
      const data = await readData();
      const index = data.heroes.findIndex(u => u.id === req.params.id);
      if(index === -1)
      {
        return res.status(404).json({error: 'Usuario no encontrado'});
      }

      data.heroes[index] = {...data.heroes[index], ...req.body};

      console.log(data);
      await writeData(data);

      res.json(data.heroes[index]);

    }
    catch(error){
      return res.status(500).json({error:'Error al actualizar los heroes'});
    }
  })
  // Realizar DeleteHeroe Para eliminar Heroe

  app.delete('/api/heroes/:id', async (req, res)=> {

    const data = await readData();
    const index = data.heroes.findIndex(u => u.id === req.params.id);
    if(index === -1)
    {
      return res.status(404).json({error: 'Usuario no encontrado'});
    }
    data.heroes.splice(index,1);
    await writeData(data);

    console.log(data);
    res.json({message:'Usuario eliminado con exito'});


    try {
      
    } catch (error) {
      
      res.status(500).json({error: 'Error al eliminar el heroe'})
    }
  })

  //!- TODO: Realizar SugestionHeroe, para buscar un Heroe

  app.get('/api/heroes/:letra/:limite', async (req, res) => {
     try {
        const letra = req.params.letra.toLowerCase();
        const limite = req.params.limite ? parseInt(req.params.limite) : 6;

        const data = await readData();

        const nombresFiltrados = data.heroes.filter(item => item.superhero.toLowerCase().startsWith(letra))
        .slice(0,limite);

        console.log(nombresFiltrados);

        res.json(nombresFiltrados);


     } catch (error) {

      res.status(500).json({error:'Error al encontrar usuario'});
      
     }
  })


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
