import mongoose from 'mongoose';

const taskSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    done: {
      type: Boolean,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
