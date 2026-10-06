import mongoose from 'mongoose'

export async function connectDB(url: string) {
  await mongoose.connect(url)
}
