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

app.use(express.json())
app.use(cors())

app.get('/videos', async (req, res) => {
  try {
    res.status(200).json(videos)
  } catch (error) {
    res.status(500).json({error: 'Error inesperado'})
  }
})

app.get('/videos/:id', async (req, res) => {
  console.log('/Videos/id');
  try {
    const {id} = req.params

    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'Invalid video id' })
    }

    const video = videos.find(video => video.id === Number(id))

    if (!video) {
      return res.status(404).json({ message: 'Video not found' })
    }

    res.status(200).json(video)
  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

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
    videos.push(newVideo)

    res.status(200).json(newVideo)

  } catch (error) {
    res.status(500).send({error: error.message})
  }
})

app.patch('/videos/:id', async (req, res) => {
  try {
    const result = await validatePartialVideo(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const {id} = req.params

    const index = videos.findIndex(video => video.id === Number(id))

    if (index === -1) return res.status(404).json({ message: 'Video not found' }),

    videos[index] = {
      ...videos[index],
      ...req.body
    }

    res.status(201).json(videos[index])
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