import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  timeout: 10000,
})

export default client
