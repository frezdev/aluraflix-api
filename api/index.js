import express from 'express'
import {env} from 'process'
import cors from 'cors'
import { validateVideo, validatePartialVideo } from './validations/validationVideos.js'
import {videos} from './videos.js'
import {categories} from './categories.js'

import dotenv from 'dotenv'
dotenv.config()

const app = express()

const PORT = env.PORT ?? 3002

// CORS CONFIG
const whiteList = ['https://aluraflix-frezdev.vercel.app', 'http://localhost:5173'];
const options = {
  origin: (origin, callback) => {
    (whiteList.includes(origin) || !origin)
      ? callback(null, true)
      : callback(new Error('Acceso no permitido'));
  }
};
app.use(cors(options));

app.use(express.json())

// GET ALL VIDEOS
app.get('/videos', async (req, res) => {
  try {
    res.status(200).json(Array.from(videos.values()))
  } catch (error) {
    res.status(500).json({error: 'Error inesperado'})
  }
})

// GET ONE VIDEO BY ID
app.get('/videos/:id', async (req, res) => {
  try {
    const {id} = req.params

    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid video id' })
    }

    const video = videos.get(Number(id))

    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    res.status(200).json(video)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

// CREATE NEW VIDEO
app.post('/videos', async (req, res) => {
  try {
    const {body} = req
    const result = await validateVideo(body)

    if (result.error) {
      return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const newVideo = {
      id: videos.length + 1,
      ...body
    }
    videos.set(newVideo.id, newVideo)

    res.status(200).json({...newVideo})

  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

// UPDATE ONE VIDEO
app.patch('/videos/:id', async (req, res) => {
  try {
    const result = await validatePartialVideo(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const {id} = req.params

    const video = videos.get(Number(id))

    if (!video) return res.status(404).json({ message: 'Video not found' }),

    videos.set(video.id, {...video, ...req.body})

    res.status(201).json({...videos.get(video.id)})
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

// DELETE ONE VIDEO
app.delete('/videos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid video id' })
    }

    const deleted = videos.delete(id)

    if (deleted) {
      return res.status(204).end()
    }
    res.status(404).json({message: 'Not found'})
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

app.get('/categories', async (req, res) => {
  try {
    res.status(200).json(categories)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})
app.get('/categories/:id', async (req, res) => {
  try {
    const {id} = req.params

    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid category id' })
    }

    const category = categories.find(category => category.id === Number(id))

    if (!category) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.status(200).json(category)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})