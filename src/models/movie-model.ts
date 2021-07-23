import mongoose from 'mongoose'
export const MovieSchema = new mongoose.Schema<MovieDocument>(
    {
        url: String,
        name: String,
        type: String,
        language: String,
        genres: Array,
        status: String,
        runtime: String,
        averageRuntime: String,
        premiered: Date,
        image: Object,
        summary: String,
    },
    {
        toJSON: { virtuals: true },
        timestamps: true
    }
);
interface MovieDocument extends Document {
    url: string,
    name: string,
    type: string,
    language: string,
    genres: string,
    status: string,
    runtime: string,
    averageRuntime: string,
    premiered: Date,
    image: Object,
    summary: string
}
const MovieModel = mongoose.model("Movie", MovieSchema);
export default MovieModel