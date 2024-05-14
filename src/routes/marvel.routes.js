const express = require('express');
const axios = require("axios");
const crypto = require("crypto-js");
const Personaje = require("../models/marvel.model");
const router = express.Router();
const publicKey = "2f4ed601684dd64dd68c0394a8ebb299";
const privateKey = "a63617f90ff1f121fbd4f1d5446c34eb59ced8c6";

//endpoint para obtener los datos de personajes de la API de Marvel
router.get("/", async (req, res) => {
    try {
      const ts = new Date().getTime().toString();
      const hash = crypto.MD5(ts + privateKey + publicKey).toString();  
      const response = await axios.get(
        `https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}`
      );
  
      const characters = response.data.data.results.map((character) => ({
        id: character.id,
        name: character.name,
        description: character.description,
        thumbnail: character.thumbnail.path + "." + character.thumbnail.extension,
      }));
  
      res.json(characters);
    } catch (error) {
      console.error("Error al obtener datos de Marvel:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
//endpoint para obtener una figura de marvel con un id en especifico
  router.get("/:id", async (req, res) => {
    try {
      const characterId = req.params.id;
      const ts = new Date().getTime().toString();
      const hash = crypto.MD5(ts + privateKey + publicKey).toString();
      const response = await axios.get(
        `https://gateway.marvel.com/v1/public/characters/${characterId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`
      );
  
      if (response.data.data.results.length === 0) {
        return res.status(404).json({ error: "Personaje no encontrado" });
      }  
      const character = response.data.data.results[0];
      const characterInfo = {
        id: character.id,
        name: character.name,
        description: character.description,
        thumbnail: character.thumbnail.path + "." + character.thumbnail.extension,
      };
  
      res.json(characterInfo);
    } catch (error) {
      console.error("Error al obtener datos de Marvel:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
//endpoint para agregar figuras
router.post('/', async (req, res) => {
    try {
      // Validar y procesar los datos recibidos en el cuerpo de la solicitud
      const { id, name, description, thumbnail } = req.body;
      if (!id || !name || !description || !thumbnail) {
        return res.status(400).json({ error: 'Se deben proporcionar los campos id, name, description y thumbnail' });
      }
  
      // Crear un nuevo personaje utilizando el modelo Personaje para guardarlo en la 
      // base de datos
      const newCharacter = new Personaje({
        id,
        name,
        description,
        thumbnail
      });
  
      // Guardar el nuevo personaje en la base de datos
      await newCharacter.save();
  
      res.json({ message: 'Personaje guardado correctamente', character: newCharacter });
    } catch (error) {
      console.error('Error al guardar el personaje en MongoDB:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  
  //endpoint para actualizar un personaje por su ID
  router.put('/:id', async (req, res) => {
    try {
      const characterId = req.params.id;      
      const { name, description, thumbnail } = req.body;
  
      // Buscar y actualizar el personaje en la base de datos
      const updatedCharacter = await Personaje.findOneAndUpdate(
        { id: characterId },
        { name, description, thumbnail },
        { new: true, runValidators: true }
      );
        
      if (!updatedCharacter) {
        return res.status(404).json({ error: 'Personaje no encontrado' });
      }
  
      res.json({ message: 'Personaje actualizado correctamente', character: updatedCharacter });
    } catch (error) {
      console.error('Error al actualizar el personaje en MongoDB:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });


//endpoint para borrar un personaje de la base de datos

router.delete('/:id', async (req, res) => {
    try {
      const characterId = req.params.id;
  
      // Buscar y eliminar el personaje en la base de datos
      const deletedCharacter = await Personaje.findOneAndDelete({ id: characterId });
  
      if (!deletedCharacter) {
        return res.status(404).json({ error: 'Personaje no encontrado' });
      }
  
      res.json({ message: 'Personaje eliminado correctamente', character: deletedCharacter });
    } catch (error) {
      console.error('Error al eliminar el personaje en MongoDB:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

module.exports = router